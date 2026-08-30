"use client";

import * as React from "react";
import { useUsernameStore } from "@/components/Providers/contextProvider";
import { useStore } from "@/components/Providers/fetchAPI";
import { DossierSidebar } from "./Sidebar";

/**
 * App shell: the sidebar plus the main column, wrapped around every route.
 *
 * Below `md` the sidebar reflows to a compact bar plus a horizontally
 * scrolling nav strip. Mobile has not been designed yet, so this is a reflow of
 * the same elements, not a new layout.
 */
export function DossierShell({ children }: { children: React.ReactNode }) {
  const { username } = useUsernameStore() as unknown as { username: string };
  const { userInfoData, isLoading, fetchData } = useStore() as unknown as {
    userInfoData: any;
    isLoading: boolean;
    fetchData: (username: string) => void;
  };

  // The handle is persisted but the data is not, so a reload has a handle and
  // an empty store. Fetch once to rehydrate rather than re-blocking with the
  // username dialog.
  const rehydrated = React.useRef(false);
  React.useEffect(() => {
    if (rehydrated.current) return;
    if (username && !userInfoData && !isLoading) {
      rehydrated.current = true;
      fetchData(username);
    }
  }, [username, userInfoData, isLoading, fetchData]);

  return (
    <div className="flex min-h-screen flex-col bg-card md:flex-row">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:bg-foreground focus:px-4 focus:py-2 focus:text-meta focus:text-background"
      >
        Skip to content
      </a>
      {/* Sticky only where it is a rail. As a full-width bar below `md` it was
          pinned over the sticky table headers in the column beside it. */}
      <aside className="z-20 shrink-0 border-b border-rule bg-card md:sticky md:top-0 md:h-screen md:overflow-y-auto md:border-b-0">
        <DossierSidebar />
      </aside>
      <main id="main" tabIndex={-1} className="min-w-0 flex-1">
        {children}
      </main>
    </div>
  );
}
