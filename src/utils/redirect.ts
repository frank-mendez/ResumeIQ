function hasControlCharacters(value: string) {
  for (const character of value) {
    const codePoint = character.codePointAt(0);
    if (codePoint !== undefined && (codePoint <= 31 || codePoint === 127)) {
      return true;
    }
  }

  return false;
}

export function toSafeRedirectPath(raw: string | undefined) {
  if (!raw) return "/dashboard";

  const normalized = raw.trim();

  if (!normalized) return "/dashboard";
  if (!normalized.startsWith("/")) return "/dashboard";
  if (normalized.startsWith("//")) return "/dashboard";
  if (normalized.includes("\\")) return "/dashboard";
  if (hasControlCharacters(normalized)) return "/dashboard";

  return normalized;
}
