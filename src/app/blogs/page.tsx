"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from "react";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { useStore } from "../../components/Providers/fetchAPI";
import NavBar_sm from "@/components/ui/NavBar-sm";
import axios from "axios";

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
    <div className="container mx-auto ">
      <NavBar_sm Title="Codeforces Blogs & Tutorials" />

      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="text-xl ">
                <TableHead className="py-4">Title</TableHead>
                <TableHead className="py-4">Author</TableHead>
                <TableHead className="py-4">Date</TableHead>
                <TableHead className="py-4">Upvotes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {blogs.map((action) => {
                const entry = action.blogEntry;
                if (!entry) return null;
                const key = `${action.timeSeconds}-${entry.id}-${action.comment?.id ?? "e"}`;
                return (
                  <TableRow key={key}>
                    <TableCell>
                      <Link
                        href={`https://codeforces.com/blog/entry/${entry.id}`}
                        className="text-primary hover:underline"
                      >
                        {stripHtml(entry.title) || `Blog #${entry.id}`}
                      </Link>
                    </TableCell>
                    <TableCell>{entry.authorHandle}</TableCell>
                    <TableCell>{formatDate(action.timeSeconds)}</TableCell>
                    <TableCell>
                      <Badge
                        className="py-1"
                        variant={entry.rating >= 0 ? "secondary" : "destructive"}
                      >
                        {entry.rating >= 0 ? "+" : ""}
                        {entry.rating}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {
            blogs.length === 0 && (
              <div className="flex flex-col items-center justify-center my-4">
                Try Entering a username or Codeforces API is down not sure.
              </div>
            )
          }
          {
            blogs.length > 0 && (
              <div className="text-center mt-4">
                Codeforces set a limit of 100 blogs, so can't do much about it.
              </div>
            )
          }
        </CardContent>
      </Card>
    </div>
  );
}
