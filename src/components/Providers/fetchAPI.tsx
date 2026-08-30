import { create } from "zustand";
import { devtools } from "zustand/middleware";
import axios from "axios";
import { TTL, cachedGet, clearApiCache, getJson } from "@/lib/api-cache";

/**
 * Bump an aggregate product counter. Fire-and-forget: analytics must never be
 * able to fail a page load, so this swallows everything.
 */
export const countMetric = (name: string) => {
  void axios.post("/api/metric", { name }).catch(() => {});
};

export const useStore = create(
  devtools((set) => ({
    userInfoData: null,
    allSubmissionsData: null,
    allRating: null,
    contestData: null,
    fetchedAt: null,
    /** True when the visible data came from cache rather than the network. */
    fromCache: false,
    isLoading: false,

    /**
     * `force` bypasses the read-through cache and refreshes every stored copy.
     * Wired to the masthead's "updated N min ago" control.
     */
    fetchData: async (username: string, force = false) => {
      set({ isLoading: true });
      try {
        if (force) await clearApiCache();

        // No clist.by call here: it was a blocking third-party request on every
        // page load feeding a component that no longer exists. Upcoming contests
        // come from the Codeforces contest list fetched on the line below.
        const [userInfo, submissions, rating, contests, recentBlogs] = await Promise.all([
          cachedGet(
            `https://codeforces.com/api/user.info?handles=${username}`,
            TTL.profile,
            force
          ),
          cachedGet(
            `https://codeforces.com/api/user.status?handle=${username}&from=1`,
            TTL.profile,
            force
          ),
          cachedGet(
            `https://codeforces.com/api/user.rating?handle=${username}`,
            TTL.profile,
            force
          ),
          cachedGet(
            "https://codeforces.com/api/contest.list?gym=false",
            TTL.contests,
            force
          ),
          getJson(
            "https://codeforces.com/api/recentActions?maxCount=100",
            TTL.feed,
            force
          ).catch(() => null),
        ]);

        // The profile calls share a TTL, so the oldest of them is the honest
        // "as of" timestamp for what is on screen.
        const stamps = [userInfo, submissions, rating]
          .map((r) => r.cachedAt)
          .filter((t): t is number => typeof t === "number");

        set({
          userInfoData: userInfo.data,
          allSubmissionsData: submissions.data,
          allRating: rating.data,
          contestData: contests.data,
          recentBlogs,
          // Drives the dossier masthead's "updated N min ago" eyebrow.
          fetchedAt: stamps.length === 3 ? Math.min(...stamps) : Date.now(),
          fromCache: stamps.length === 3,
          isLoading: false,
        });
        // The denominator for `fetch:invalid-handle` and `fetch:unreachable`.
        // Without it those two counters are a raw failure count with no scale:
        // twelve unreachables is either a bad afternoon or a total outage, and
        // there was no way to tell which.
        countMetric("overview:loaded");
      } catch (error) {
        console.error("Failed to fetch data:", error);
        // Codeforces answers a bad handle with 400 and a `comment` naming it.
        // Anything else — offline, DNS, a Codeforces outage, a 5xx — is not the
        // user's fault, and telling them their handle is wrong sends them
        // retyping a handle that was fine.
        const status = (error as any)?.status;
        const comment: string = (error as any)?.comment ?? "";
        const badHandle = status === 400 || /handle|not found/i.test(comment);
        countMetric(badHandle ? "fetch:invalid-handle" : "fetch:unreachable");
        set({
          isLoading: false,
          userInfoData: badHandle ? "Username is not Valid" : "Codeforces is unreachable",
        });
      }
    },
  }))
);
