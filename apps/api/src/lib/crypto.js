import crypto from "node:crypto";

export function sha256Base64(input) {
  return crypto.createHash("sha256").update(input).digest("base64");
}

