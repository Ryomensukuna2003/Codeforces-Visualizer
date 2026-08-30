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
        setUsername: (username: string) => set({ username }),
        Attempted: [],
        setAttempted: (Attempted: string[]) => set({ Attempted }),
        UsernamePopupisopen: true,
        setUsernamePopupisopen: (isOpen: boolean) => set({ UsernamePopupisopen: isOpen }),
      }),
      {
        name: "cfstats.handle",
        partialize: (state) => ({ username: state.username }),
        // A stored handle means we already know who we're looking at, so the
        // dialog should not block the page on load.
        onRehydrateStorage: () => (state) => {
          if (state?.username) state.setUsernamePopupisopen(false);
        },
      }
    )
  )
);
