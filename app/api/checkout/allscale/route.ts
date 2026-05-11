import { NextResponse } from "next/server";
import { createAllscaleCheckoutIntent, StableCoin } from "@/lib/allscale/checkout";
import { getSpecializedCourseById } from "@/data/specializedCourses";

/**
 * Body: { courseId: string }
 * Creates AllScale checkout intent priced in USDC; returns hosted checkout_url or demo fallback.
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { courseId?: string };

  const courseId = typeof body.courseId === "string" ? body.courseId.trim() : "";
  if (!courseId) {
    return NextResponse.json({ error: "courseId is required" }, { status: 400 });
  }

  const course = getSpecializedCourseById(courseId);
  if (!course) {
    return NextResponse.json({ error: "Unknown course" }, { status: 404 });
  }

  const origin =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    (typeof request.headers.get === "function"
      ? new URL(request.url).origin.replace(/\/$/, "")
      : "");

  const redirectUrl =
    origin.length > 0 ? `${origin}/checkout/success?course=${encodeURIComponent(course.id)}` : undefined;

  const orderId = `cp_${course.slug}_${Date.now()}`.slice(0, 120);

  const hasKeys = !!(process.env.ALLSCALE_API_KEY?.trim() && process.env.ALLSCALE_API_SECRET?.trim());

  if (!hasKeys) {
    return NextResponse.json({
      mode: "demo" as const,
      checkoutUrl: null as string | null,
      courseId: course.id,
      message:
        "AllScale keys not configured. Use “Unlock demo” on the store page to simulate access locally, or add ALLSCALE_API_KEY and ALLSCALE_API_SECRET.",
    });
  }

  try {
    const floorCents = 11;
    const amount = Math.max(course.amountCentsUsdc, floorCents);

    const result = await createAllscaleCheckoutIntent({
      stable_coin: StableCoin.USDC,
      amount_cents: amount,
      order_id: orderId,
  const orderId = `cp_${course.slug}_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`.slice(0, 120);
      redirect_url: redirectUrl,
      extra: {
        product: "codepath_specialized_course",
        course_id: course.id,
        slug: course.slug,
      },
    });

    return NextResponse.json({
      mode: "live" as const,
      checkoutUrl: result.checkout_url,
      intentId: result.allscale_checkout_intent_id ?? null,
      courseId: course.id,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Checkout failed";
    console.error("[checkout/allscale]", message);
    return NextResponse.json({ error: message, courseId: course.id }, { status: 502 });
  }
}
