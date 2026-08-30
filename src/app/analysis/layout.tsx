import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Codeforces contest post-mortem",
  description: "Where a Codeforces round actually went: a timeline of every attempt, time lost to failed submissions, and the tags that cost you the most.",
  path: "/analysis",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
