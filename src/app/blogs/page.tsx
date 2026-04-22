"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useStore } from "../../components/Providers/fetchAPI";
import { NavBar } from "@/components/ui/NavBar";

type RecentAction = {
  timeSeconds: number;
  blogEntry: {
    id: number;
    title: string;
    authorHandle: string;
    rating: number;
    creationTimeSeconds?: number;
  };
  comment?: { id: number };
};

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, "").trim();
}

function formatDate(seconds: number): string {
  return new Date(seconds * 1000).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function BlogsPage() {
  const [recentBlogs, setRecentBlogs] = useState<{ result?: RecentAction[] } | RecentAction[] | null>(null);
  const { recentBlogs: recentBlogsData } = useStore() as { recentBlogs?: { result?: RecentAction[] } | RecentAction[] };

  useEffect(() => {
    setRecentBlogs(recentBlogsData ?? null);
  }, [recentBlogsData]);

  const raw = recentBlogs ?? recentBlogsData;
  const blogs: RecentAction[] = Array.isArray(raw)
    ? raw
    : Array.isArray((raw as { result?: RecentAction[] })?.result)
      ? (raw as { result: RecentAction[] }).result
      : [];

  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      {/* Header */}
      <div className="w-full border-b border-neutral-600">
        <div className="flex items-center justify-between px-6 h-14">
          <span className="font-mono text-lg text-foreground">
            Codeforces Blogs & Tutorials
          </span>
          <span className="font-mono text-sm text-muted-foreground">
            [{blogs.length}]
          </span>
        </div>
      </div>

      {/* Column labels */}
      <div className="mx-[10%] border-x border-neutral-600">
        <div className="flex items-stretch h-10 border-b border-neutral-600">
          <div className="flex-1 px-6 flex items-center font-mono text-xs text-muted-foreground">
            Title
          </div>
          <div className="shrink-0 w-40 border-l border-neutral-600 flex items-center justify-center font-mono text-xs text-muted-foreground">
            Author
          </div>
          <div className="shrink-0 w-32 border-l border-neutral-600 flex items-center justify-center font-mono text-xs text-muted-foreground">
            Date
          </div>
          <div className="shrink-0 w-20 border-l border-neutral-600 flex items-center justify-center font-mono text-xs text-muted-foreground">
            Votes
          </div>
        </div>

        {/* Rows */}
        {blogs.length > 0 ? (
          blogs.map((action) => {
            const entry = action.blogEntry;
            if (!entry) return null;
            const key = `${action.timeSeconds}-${entry.id}-${action.comment?.id ?? "e"}`;
            return (
              <Link
                key={key}
                href={`https://codeforces.com/blog/entry/${entry.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-stretch border-b border-neutral-600 hover:bg-secondary/30 transition-colors"
              >
                <div className="flex-1 px-6 py-3 font-mono text-sm text-foreground truncate group-hover:underline">
                  {stripHtml(entry.title) || `Blog #${entry.id}`}
                </div>
                <div className="shrink-0 w-40 border-l border-neutral-600 flex items-center justify-center font-mono text-xs text-muted-foreground">
                  {entry.authorHandle}
                </div>
                <div className="shrink-0 w-32 border-l border-neutral-600 flex items-center justify-center font-mono text-xs text-muted-foreground">
                  {formatDate(action.timeSeconds)}
                </div>
                <div className="shrink-0 w-20 border-l border-neutral-600 flex items-center justify-center font-mono text-xs">
                  <span className={entry.rating >= 0 ? "text-foreground" : "text-red-500"}>
                    {entry.rating >= 0 ? "+" : ""}{entry.rating}
                  </span>
                </div>
              </Link>
            );
          })
        ) : (
          <div className="flex items-center justify-center py-8 border-b border-neutral-600 text-muted-foreground font-mono text-sm">
            Try entering a username or Codeforces API is down.
          </div>
        )}

        {/* Bottom spacer */}
        <div className="flex h-[15vh]">
          <div className="flex-1"></div>
          <div className="shrink-0 w-40 border-l border-neutral-600"></div>
          <div className="shrink-0 w-32 border-l border-neutral-600"></div>
          <div className="shrink-0 w-20 border-l border-neutral-600"></div>
        </div>
      </div>
    </div>
  );
}
