import { createClient } from "@/lib/supabase/server";
import { type EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";

function safeRedirect(path: string | null) {
  if (!path || !path.startsWith("/") || path.startsWith("//") || path.includes(String.fromCharCode(92))) {
    return "/";
  }

  return path;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = safeRedirect(searchParams.get("next"));

  if (!tokenHash || !type) {
    redirect("/auth/error?error=Missing verification parameters");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    type,
    token_hash: tokenHash,
  });

  if (error) {
    redirect("/auth/error?error=Verification failed");
  }

  redirect(next);
}
