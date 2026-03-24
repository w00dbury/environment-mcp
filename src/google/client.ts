function appendKey(url: string, apiKey: string): string {
  const u = new URL(url);
  u.searchParams.set("key", apiKey);
  return u.toString();
}

async function readJsonResponse(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) {
    return null;
  }
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

export function formatGoogleError(status: number, body: unknown): string {
  if (body && typeof body === "object" && "error" in body) {
    return `Google API error (${status}): ${JSON.stringify(
      (body as { error: unknown }).error,
      null,
      2
    )}`;
  }
  return `Google API error (${status}): ${typeof body === "string" ? body : JSON.stringify(body)}`;
}

/** GET JSON; `apiKey` is appended as query param `key`. */
export async function googleGetJson(
  baseUrl: string,
  apiKey: string,
  query: Record<string, string | number | undefined>
): Promise<{ ok: true; data: unknown } | { ok: false; message: string }> {
  const url = new URL(appendKey(baseUrl, apiKey));
  for (const [k, v] of Object.entries(query)) {
    if (v !== undefined) {
      url.searchParams.set(k, String(v));
    }
  }
  const res = await fetch(url.toString(), {
    method: "GET",
    headers: { Accept: "application/json" },
  });
  const data = await readJsonResponse(res);
  if (!res.ok) {
    return { ok: false, message: formatGoogleError(res.status, data) };
  }
  return { ok: true, data };
}

/** POST JSON body; `apiKey` is appended as query param `key`. */
export async function googlePostJson(
  baseUrl: string,
  apiKey: string,
  body: unknown
): Promise<{ ok: true; data: unknown } | { ok: false; message: string }> {
  const url = appendKey(baseUrl, apiKey);
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const data = await readJsonResponse(res);
  if (!res.ok) {
    return { ok: false, message: formatGoogleError(res.status, data) };
  }
  return { ok: true, data };
}

export function jsonResult(data: unknown): string {
  return JSON.stringify(data, null, 2);
}
