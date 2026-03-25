"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "E-Mail und Passwort sind erforderlich" };
  }

  try {
    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("[login] Auth error:", error.message, "| status:", error.status);
      return { error: error.message };
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[login] Unexpected error:", msg);
    return { error: `Verbindungsfehler: ${msg}` };
  }

  redirect("/dashboard");
}
