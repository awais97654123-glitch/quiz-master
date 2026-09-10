import { NextResponse } from "next/server";
import { testSupabaseConnection } from "@/lib/supabase";

export async function GET() {
  const result = await testSupabaseConnection();
  return NextResponse.json({
    status: result.ok ? "connected" : "error",
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || "https://heiirfzkjuwehszzgfsb.supabase.co",
    message: result.message,
    timestamp: new Date().toISOString(),
  });
}
