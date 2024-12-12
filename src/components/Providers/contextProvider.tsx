"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";

export const useUsernameStore = create(
  devtools((set) => ({
    username: "",
    setUsername: (username: string) => set({ username }),
    Attempted: [],
    setAttempted: (Attempted: string[]) => set({ Attempted }),
    UsernamePopupisopen: true,
    setUsernamePopupisopen: (isOpen: boolean) => set({ UsernamePopupisopen: isOpen }),
  }))
);
