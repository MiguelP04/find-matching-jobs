const SESSION_COOKIE = "session_token";

export function getSessionCookie(): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(
    new RegExp(`(^| )${SESSION_COOKIE}=([^;]+)`),
  );
  return match ? decodeURIComponent(match[2]) : undefined;
}

export function setSessionCookie(token: string): void {
  if (typeof document === "undefined") return;
  const expires = new Date(
    Date.now() + 7 * 24 * 60 * 60 * 1000,
  ).toUTCString();
  document.cookie = `${SESSION_COOKIE}=${encodeURIComponent(token)}; path=/; expires=${expires}; SameSite=Lax`;
}

export function clearSessionCookie(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${SESSION_COOKIE}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
}
