/**
 * Read-through cache for the Codeforces endpoints.
 *
 * Backed by the Cache API rather than localStorage: one `user.status` payload
 * is ~3 MB for an active handle, which would blow localStorage's ~5 MB budget
 * on its own. The Cache API is built for storing responses and has a quota in
 * the hundreds of MB.
 *
 * Everything degrades to a plain fetch — the API is missing in insecure
 * contexts and can throw when the browser is set to block site data.
 */

const CACHE_NAME = "cf-api-v1";
/** Written on the cached copy so we can age it out ourselves. */
const STAMP = "x-cached-at";

export const TTL = {
  /** Profile, submissions, rating history — move whenever the user practises. */
  profile: 5 * 60_000,
  /** Blog feed. */
  feed: 10 * 60_000,
  /** Contest list and the upcoming-contest feed. */
  contests: 60 * 60_000,
  /** The full problemset: ~5 MB and changes only when a round is archived. */
  problemset: 24 * 60 * 60_000,
} as const;

async function openStore(): Promise<Cache | null> {
  if (typeof caches === "undefined") return null;
  try {
    return await caches.open(CACHE_NAME);
  } catch {
    return null;
  }
}

/** Codeforces answers 200 with `{status:"FAILED"}` — never cache those. */
function isCacheable(payload: unknown): boolean {
  if (!payload || typeof payload !== "object") return false;
  const status = (payload as { status?: unknown }).status;
  return status === undefined || status === "OK";
}

export type CachedResult<T> = { data: T; cachedAt: number | null };

/**
 * GET `url`, returning a cached copy when it is younger than `ttlMs`.
 * `force` skips the read but still refreshes the stored copy.
 */
export async function cachedGet<T = any>(
  url: string,
  ttlMs: number,
  force = false
): Promise<CachedResult<T>> {
  const store = await openStore();

  if (store && !force) {
    try {
      const hit = await store.match(url);
      if (hit) {
        const cachedAt = Number(hit.headers.get(STAMP) ?? 0);
        if (cachedAt && Date.now() - cachedAt < ttlMs) {
          return { data: (await hit.json()) as T, cachedAt };
        }
      }
    } catch {
      // Unreadable cache entry — fall through and refetch.
    }
  }

  const res = await fetch(url);
  if (!res.ok) {
    // Codeforces answers a bad handle with 400 and a `comment` naming it.
    // Carry both up so callers can tell "you mistyped" from "we are down".
    let comment = "";
    try {
      comment = String(JSON.parse(await res.text())?.comment ?? "");
    } catch {
      // Non-JSON error body — the status alone will have to do.
    }
    const err = Object.assign(new Error(`${res.status} ${res.statusText} — ${url}`), {
      status: res.status,
      comment,
    });
    throw err;
  }
  const text = await res.text();
  const data = JSON.parse(text) as T;

  if (store && isCacheable(data)) {
    try {
      const headers = new Headers({
        "content-type": "application/json",
        [STAMP]: String(Date.now()),
      });
      await store.put(url, new Response(text, { status: 200, headers }));
    } catch {
      // Over quota or storage blocked — serving uncached is fine.
    }
  }

  return { data, cachedAt: null };
}

/** Convenience wrapper for callers that do not care where the data came from. */
export async function getJson<T = any>(url: string, ttlMs: number, force = false): Promise<T> {
  return (await cachedGet<T>(url, ttlMs, force)).data;
}

/** Drop every cached response — used by the manual refresh in the masthead. */
export async function clearApiCache(): Promise<void> {
  if (typeof caches === "undefined") return;
  try {
    await caches.delete(CACHE_NAME);
  } catch {
    // Nothing to do; the next fetch simply goes to the network.
  }
}
