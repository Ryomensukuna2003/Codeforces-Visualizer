import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Codeforces problem ladder by rating",
  description: "Which Codeforces problems you have solved at every 100-point rating band, and which unsolved ones match your weakest tags. Find the rung you are stuck on.",
  path: "/problems",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
