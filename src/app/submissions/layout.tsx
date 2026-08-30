import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Codeforces submission history and verdict breakdown",
  description: "Every Codeforces submission for any handle, filtered by verdict, rating, tag and language. See your AC rate, attempts per solve, and which tags you fail most.",
  path: "/submissions",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
