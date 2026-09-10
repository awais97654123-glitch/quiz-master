import type { Metadata } from "next";
import { NO_INDEX_METADATA } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Single Player Quiz Session",
  ...NO_INDEX_METADATA,
};

export default function SingleQuizLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
