import type { Metadata } from "next";
import { NO_INDEX_METADATA } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Multiplayer Arena Room",
  ...NO_INDEX_METADATA,
};

export default function RoomLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
