import type { Metadata } from "next";
import { NO_INDEX_METADATA } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Live Arena Session",
  ...NO_INDEX_METADATA,
};

export default function LiveLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
