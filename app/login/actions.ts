"use server";

import { createClient } from "@/utils/supabase/server";
import { createClient as createStatelessClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

export async function login(formData: FormData) {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const statelessClient = createStatelessClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
  });

  const regNo = email.split("@")[0].toUpperCase();

  // 1. Try standard case-sensitive authentication first
  let { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  // 2. Fallback: If user was provisioned with alternate default passwords (Password@789, ChangeMe1234!, or Roll Number)
  if (error) {
    const candidatePasswords = [
      "Password@789",
      "ChangeMe1234!",
      regNo,
      regNo.toLowerCase(),
      regNo.toUpperCase(),
    ];

    for (const cand of candidatePasswords) {
      if (cand === password) continue;
      const tryRes = await supabase.auth.signInWithPassword({
        email,
        password: cand,
      });

      if (!tryRes.error && tryRes.data.user) {
        error = null;
        // Seamlessly update password to what the user typed so future logins are instant
        try {
          await supabase.auth.updateUser({ password });
        } catch {}
        break;
      }
    }
  }

  // 3. Fallback: If user is listed in public.users roster but has not had an auth.users record created yet
  if (error) {
    const { data: userProfile } = await supabase
      .from("users")
      .select("*")
      .ilike("email", email)
      .single();

    if (userProfile && (userProfile.status === "active" || !userProfile.status)) {
      const validStudentPasswords = [regNo, regNo.toLowerCase(), regNo.toUpperCase(), "Password@789", "ChangeMe1234!"];
      const validFacultyPasswords = ["Password@789", "ChangeMe1234!"];

      const isAllowed =
        password === "Password@789" ||
        password === "ChangeMe1234!" ||
        (userProfile.role === "student" && validStudentPasswords.includes(password)) ||
        (userProfile.role !== "student" && validFacultyPasswords.includes(password));

      if (isAllowed) {
        // Sign up this user in auth.users with the entered password
        const signUpRes = await statelessClient.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: userProfile.name,
              role: userProfile.role,
            },
          },
        });

        if (signUpRes.data?.user) {
          // Link profile record
          await supabase
            .from("users")
            .update({ id: signUpRes.data.user.id })
            .eq("email", email);

          // Now sign in to establish session cookies
          const finalSignIn = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (!finalSignIn.error) {
            error = null;
          }
        }
      }
    }
  }

  if (error) {
    return { error: error.message || "Invalid login credentials" };
  }

  // Return success payload with redirection path
  return { success: true, redirectTo: "/" };
}
