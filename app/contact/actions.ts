"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export interface ContactSubmissionPayload {
  name: string;
  email: string;
  role: string;
  subject?: string;
  message: string;
}

export async function submitContactInquiry(payload: ContactSubmissionPayload) {
  try {
    const name = payload.name?.trim();
    const email = payload.email?.trim()?.toLowerCase();
    const role = payload.role || "Student";
    const subject = payload.subject?.trim() || "General Academic Inquiry";
    const message = payload.message?.trim();

    if (!name || name.length < 2) {
      return { error: "Please provide your valid full name." };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return { error: "Please provide a valid email address." };
    }

    if (!message || message.length < 5) {
      return { error: "Please provide inquiry details (at least 5 characters)." };
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase
      .from("support_inquiries")
      .insert({
        name,
        email,
        role,
        subject,
        message,
        status: "pending",
      })
      .select("id, created_at")
      .single();

    if (error) {
      console.error("Support inquiry insertion error:", error);
      return { error: "Unable to submit your message right now. Please try again or contact via email directly." };
    }

    revalidatePath("/admin/inquiries");
    revalidatePath("/admin");

    return {
      success: true,
      id: data.id,
      ticketCode: `INQ-${data.id.slice(0, 6).toUpperCase()}`,
      message: "Your inquiry has been successfully transmitted to the department coordinators.",
    };
  } catch (err: any) {
    console.error("Unexpected error submitting contact inquiry:", err);
    return { error: "An unexpected error occurred. Please try again." };
  }
}
