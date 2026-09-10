import type { Metadata } from "next";
import { NO_INDEX_METADATA } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Quiz Result & Score Report",
  ...NO_INDEX_METADATA,
};

export default function ResultLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
