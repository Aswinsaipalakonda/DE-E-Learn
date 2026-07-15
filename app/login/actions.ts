"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Parse registration number from email (prefix before @)
  const regNo = email.split("@")[0];

  // Try standard case-sensitive authentication first
  let { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  // If the standard login fails, and the password matches the student registration number case-insensitively,
  // we attempt authentication using uppercase and lowercase password variants as fallbacks.
  if (error && password.toUpperCase() === regNo.toUpperCase()) {
    // Try uppercase variant
    let fallbackResult = await supabase.auth.signInWithPassword({
      email,
      password: regNo.toUpperCase(),
    });

    if (fallbackResult.error) {
      // Try lowercase variant
      fallbackResult = await supabase.auth.signInWithPassword({
        email,
        password: regNo.toLowerCase(),
      });
    }

    if (!fallbackResult.error) {
      data = fallbackResult.data;
      error = null;
    }
  }

  if (error) {
    return { error: error.message };
  }

  // Redirect to portal root; proxy.ts handles subsequent routing/redirection
  redirect("/");
}
