"use client";

const sessionKey = "mesaviva:qr-session-id";

export function getQrSessionId() {
  try {
    const current = sessionStorage.getItem(sessionKey);
    if (current && /^[0-9a-f-]{36}$/i.test(current)) return current;
    const created = crypto.randomUUID();
    sessionStorage.setItem(sessionKey, created);
    return created;
  } catch {
    return null;
  }
}
