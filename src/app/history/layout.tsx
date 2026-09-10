import type { Metadata } from "next";
import { NO_INDEX_METADATA } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Examination History",
  ...NO_INDEX_METADATA,
};

export default function HistoryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
