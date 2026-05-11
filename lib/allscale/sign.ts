import crypto from "node:crypto";

/** SHA256 hex of UTF-8 body per AllScale canonical signing. */
export function sha256Hex(body: string): string {
  return crypto.createHash("sha256").update(body, "utf8").digest("hex");
}

/**
 * AllScale request signing — canonical string:
 * METHOD\nPATH\nQUERY_STRING\nTIMESTAMP\nNONCE\nBODY_SHA256
 * Signature: Base64(HMAC-SHA256(secret, canonical)), header X-Signature: v1=<sig>
 */
export function signAllscaleRequest(opts: {
  method: string;
  path: string;
  queryString: string;
  body: string;
  timestampSec: string;
  nonce: string;
  apiSecret: string;
}): string {
  const bodyHash = sha256Hex(opts.body);
  const canonical = [
    opts.method.toUpperCase(),
    opts.path,
    opts.queryString,
    opts.timestampSec,
    opts.nonce,
    bodyHash,
  ].join("\n");

  const sig = crypto.createHmac("sha256", opts.apiSecret.trim()).update(canonical).digest("base64");
  return `v1=${sig}`;
}
