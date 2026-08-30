import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Compare two Codeforces handles",
  description: "Score any two Codeforces handles head to head: rating, peak, problems solved, contests, AC rate and average problem difficulty, with both rating curves overlaid.",
  path: "/compare",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
