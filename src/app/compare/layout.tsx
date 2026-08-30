import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Compare two Codeforces handles",
  description: "Head-to-head record between any two Codeforces handles: who finished ahead in every contest you both entered, how the rating gap moved, which tags they have solved and you have not, and what to practise next.",
  path: "/compare",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
