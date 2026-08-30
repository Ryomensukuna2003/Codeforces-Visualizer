import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Feedback",
  description: "Tell us what is wrong, slow, missing or confusing about CF Stats. Notes are anonymous.",
  path: "/feedback",
  index: false,
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
