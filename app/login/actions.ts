"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies, headers } from "next/headers";
import { checkRateLimit, resetRateLimit } from "@/utils/rate-limiter";

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export async function login(formData: FormData) {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  // 1. Input sanitization & validation
  if (!EMAIL_REGEX.test(email) || email.length > 254) {
    return { error: "Please enter a valid institutional email address." };
  }

  if (password.length > 128) {
    return { error: "Invalid password format." };
  }

  // 2. Rate limiting
  const headerList = await headers();
  const rawIp = headerList.get("x-forwarded-for")?.split(",")[0]?.trim() || 
                headerList.get("x-real-ip") || 
                "local-client";
  const clientIp = rawIp.replace(/[^a-zA-Z0-9.:_-]/g, "");

  const ipCheck = checkRateLimit(`ip:${clientIp}`, { maxAttempts: 15, windowMs: 5 * 60 * 1000 });
  if (!ipCheck.allowed) {
    return {
      error: `Too many login attempts from this network. Please wait ${ipCheck.retryAfterSeconds} seconds before trying again.`,
    };
  }

  const emailCheck = checkRateLimit(`email:${email}`, { maxAttempts: 5, windowMs: 5 * 60 * 1000 });
  if (!emailCheck.allowed) {
    return {
      error: `Too many failed login attempts for this account. Please wait ${emailCheck.retryAfterSeconds} seconds before trying again.`,
    };
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // 3. Authenticate against MySQL
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data?.user) {
    return { error: error?.message || "Invalid email or password." };
  }

  // Authentication succeeded! Reset rate limits
  resetRateLimit(`email:${email}`);
  resetRateLimit(`ip:${clientIp}`);

  const user = data.user;
  const userRole = (user as any).user_metadata?.role || (user as any).role || (email.startsWith("admin") ? "admin" : email.startsWith("faculty") ? "faculty" : "student");

  return { success: true, redirectTo: `/${userRole}`, role: userRole };
}
