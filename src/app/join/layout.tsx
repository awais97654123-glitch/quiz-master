import type { Metadata } from "next";
import { NO_INDEX_METADATA } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Join Multiplayer Arena",
  ...NO_INDEX_METADATA,
};

export default function JoinLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
