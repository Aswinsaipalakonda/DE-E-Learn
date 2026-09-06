import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import InquiriesClient, { InquiryItem } from "./inquiries-client";

export const metadata = {
  title: "Support Inquiries & Helpdesk | Admin Console",
  description: "View, manage, and resolve messages submitted through the public contact form.",
};

export default async function AdminInquiriesPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // Fetch all inquiries sorted by latest first
  const { data: inquiries, error } = await supabase
    .from("support_inquiries")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch support inquiries:", error);
  }

  return (
    <div className="space-y-6">
      <InquiriesClient initialInquiries={(inquiries as InquiryItem[]) || []} />
    </div>
  );
}
