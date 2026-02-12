export function toSafeRedirectPath(raw: string | undefined) {
  if (!raw) return "/dashboard";

  const normalized = raw.trim();

  if (!normalized) return "/dashboard";
  if (!normalized.startsWith("/")) return "/dashboard";
  if (normalized.startsWith("//")) return "/dashboard";
  if (normalized.includes("\\")) return "/dashboard";
  if (/[\u0000-\u001F\u007F]/.test(normalized)) return "/dashboard";

  return normalized;
}
