import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Codeforces rating graph and contest history",
  description: "Your Codeforces rating plotted against the rank bands, with the change from every contest, best gain and worst drop. Filter by Div. 2, Div. 3 or Educational.",
  path: "/rating_change",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
