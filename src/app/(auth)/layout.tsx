import type { Metadata } from "next";
import { NO_INDEX_METADATA } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Candidate Authentication",
  ...NO_INDEX_METADATA,
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
