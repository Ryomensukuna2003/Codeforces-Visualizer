"use client";

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

type UsernameState = {
  username: string;
  setUsername: (username: string) => void;
  Attempted: string[];
  setAttempted: (Attempted: string[]) => void;
  UsernamePopupisopen: boolean;
  setUsernamePopupisopen: (isOpen: boolean) => void;
};

/** `?handle=` on first load, if there is one. */
function handleFromUrl(): string {
  if (typeof window === "undefined") return "";
  return new URLSearchParams(window.location.search).get("handle")?.trim() ?? "";
}

/**
 * Mirror the handle into `?handle=`, so the page someone is looking at has an
 * address. Nothing in this app was addressable before: the handle lived only in
 * localStorage, so a link to `/submissions` opened on whoever the recipient had
 * looked up last, and there was no way to bookmark or share a dossier at all.
 *
 * `replaceState`, not `push`: switching handles is not a navigation, and stacking
 * history entries would turn Back into an undo of the handle field.
 *
 * Deliberately `window.location` rather than `useSearchParams` — that hook forces
 * a Suspense boundary in a client page and fails the prerender at build time.
 */
function writeUrl(username: string) {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  if (username) url.searchParams.set("handle", username);
  else url.searchParams.delete("handle");
  window.history.replaceState(null, "", url);
}

/**
 * Only `username` is persisted. `Attempted` is derived from the submission
 * history on every load, and persisting `UsernamePopupisopen` would reopen the
 * dialog on every visit — so both are deliberately left out of `partialize`.
 */
export const useUsernameStore = create<UsernameState>()(
  devtools(
    persist(
      (set) => ({
        username: "",
        // The URL write lives here rather than at the call sites so the two
        // entry points — the landing form and the sidebar's switch dialog —
        // cannot drift apart on it.
        setUsername: (username: string) => {
          set({ username });
          writeUrl(username);
        },
        Attempted: [],
        setAttempted: (Attempted: string[]) => set({ Attempted }),
        // Closed by default. It used to start open, because it was the front
        // door; now `/` shows the landing page when there is no handle, and this
        // dialog only ever opens because the sidebar asked it to. Left as `true`
        // it would pop over the landing page and restore the exact wall the
        // landing page exists to remove.
        UsernamePopupisopen: false,
        setUsernamePopupisopen: (isOpen: boolean) => set({ UsernamePopupisopen: isOpen }),
      }),
      {
        name: "cfstats.handle",
        partialize: (state) => ({ username: state.username }),
        // A stored handle means we already know who we're looking at, so the
        // dialog should not block the page on load.
        //
        // `?handle=` wins over the stored one: it is the more specific request,
        // and it is what makes a shared link show the sender's dossier rather
        // than silently redirecting the recipient to their own.
        onRehydrateStorage: () => (state) => {
          if (!state) return;
          const fromUrl = handleFromUrl();
          if (fromUrl && fromUrl !== state.username) state.setUsername(fromUrl);
          if (fromUrl || state.username) state.setUsernamePopupisopen(false);
        },
      }
    )
  )
);
