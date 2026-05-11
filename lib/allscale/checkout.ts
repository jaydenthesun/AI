import crypto from "node:crypto";
import { signAllscaleRequest } from "./sign";

const ALLSCALE_BASE = (process.env.ALLSCALE_API_BASE ?? "https://openapi.allscale.io").replace(/\/$/, "");

/** StableCoin enum — Appendix B */
export const StableCoin = { USDT: 1, USDC: 2 } as const;

export interface CreateCheckoutPayload {
  stable_coin: number;
  amount_cents: number;
  order_id: string;
  order_description?: string;
  redirect_url?: string;
  user_id?: string;
  user_name?: string;
  extra?: Record<string, unknown>;
  accepted_stable_coins?: number[];
}

export interface AllscaleCheckoutSuccess {
  checkout_url: string;
  allscale_checkout_intent_id?: string;
  raw: unknown;
}

/**
 * POST /v1/checkout_intents/ — creates hosted checkout URL.
 * Requires ALLSCALE_API_KEY and ALLSCALE_API_SECRET.
 */
export async function createAllscaleCheckoutIntent(
  payload: CreateCheckoutPayload,
): Promise<AllscaleCheckoutSuccess> {
  const apiKey = process.env.ALLSCALE_API_KEY;
  const apiSecret = process.env.ALLSCALE_API_SECRET;

  if (!apiKey?.trim() || !apiSecret?.trim()) {
    throw new Error("ALLSCALE_API_KEY and ALLSCALE_API_SECRET must be set");
  }

  const path = "/v1/checkout_intents/";
  const body = JSON.stringify(payload);
  const timestampSec = Math.floor(Date.now() / 1000).toString();
  const nonce = crypto.randomUUID();

  const signature = signAllscaleRequest({
    method: "POST",
    path,
    queryString: "",
    body,
    timestampSec,
    nonce,
    apiSecret,
  });

  const url = `${ALLSCALE_BASE}${path}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": apiKey.trim(),
      "X-Timestamp": timestampSec,
      "X-Nonce": nonce,
      "X-Signature": signature,
    },
    body,
  });

  const rawText = await res.text();
  let data: unknown;
  try {
    data = JSON.parse(rawText);
  } catch {
    throw new Error(`AllScale non-JSON response (${res.status}): ${rawText.slice(0, 300)}`);
  }

  const obj = data as {
    code?: number;
    payload?: {
      checkout_url?: string;
      allscale_checkout_intent_id?: string;
    };
    error?: { message?: string; details?: unknown };
    request_id?: string;
  };

  if (!res.ok || obj.code !== 0) {
    const msg = obj.error?.message ?? `HTTP ${res.status}`;
    const detail =
      obj.error?.details !== undefined ? ` ${typeof obj.error.details === "object" ? JSON.stringify(obj.error.details) : String(obj.error.details)}` : "";
    throw new Error(
      `AllScale checkout intent failed: ${msg}${detail}${obj.request_id ? ` (request_id: ${obj.request_id})` : ""}`,
    );
  }

  const checkoutUrl = obj.payload?.checkout_url;
  if (!checkoutUrl) {
    throw new Error("AllScale response missing payload.checkout_url");
  }

  return {
    checkout_url: checkoutUrl,
    allscale_checkout_intent_id: obj.payload?.allscale_checkout_intent_id,
    raw: data,
  };
}
