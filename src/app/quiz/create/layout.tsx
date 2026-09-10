import type { Metadata } from "next";
import { NO_INDEX_METADATA } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Host Quiz Setup",
  ...NO_INDEX_METADATA,
};

export default function CreateQuizLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
