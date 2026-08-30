import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Codeforces blogs and editorials",
  description: "The latest Codeforces blog entries and round editorials, sorted by recency or votes.",
  path: "/blogs",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
