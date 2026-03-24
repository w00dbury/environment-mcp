/** Resolve Google Maps Platform API key from the environment (never log this value). */
export function getApiKey(): string {
  const key =
    process.env.GOOGLE_MAPS_API_KEY ?? process.env.GOOGLE_ENVIRONMENT_API_KEY;
  if (!key?.trim()) {
    throw new Error(
      "Missing API key: set GOOGLE_MAPS_API_KEY or GOOGLE_ENVIRONMENT_API_KEY"
    );
  }
  return key.trim();
}

/** Same as getApiKey but safe for MCP tool handlers (no throw). */
export function resolveApiKey():
  | { ok: true; key: string }
  | { ok: false; message: string } {
  try {
    return { ok: true, key: getApiKey() };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { ok: false, message };
  }
}
