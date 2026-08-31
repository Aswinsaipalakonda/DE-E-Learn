"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { saveServerActivityEvent } from "@/utils/activity-store";

// Helper to determine student roll number
function extractRollNumber(user: any): string {
  const email = user?.email || "";
  if (user?.user_metadata?.roll_number) return user.user_metadata.roll_number.toUpperCase();
  if (email.includes("@")) {
    const prefix = email.split("@")[0].toUpperCase();
    if (/^\d{5}[A-Z0-9]{5}$/i.test(prefix) || prefix.startsWith("23")) {
      return prefix;
    }
  }
  return "23331A4701";
}

// Toggle Bookmark Status for a Material
export async function toggleBookmark(materialId: string, currentStatus: boolean) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const cookieVal = cookieStore.get("de_saved_bookmarks")?.value;
  let savedList: string[] = [];
  if (cookieVal) {
    try { savedList = JSON.parse(cookieVal); } catch {}
  } else {
    savedList = ["mock-mat-1", "mock-mat-2", "mock-mat-5"];
  }

  if (currentStatus) {
    savedList = savedList.filter((id) => id !== materialId);
    await supabase
      .from("bookmarks")
      .delete()
      .eq("user_id", user.id)
      .eq("material_id", materialId);
  } else {
    if (!savedList.includes(materialId)) {
      savedList.push(materialId);
    }
    await supabase
      .from("bookmarks")
      .insert({
        user_id: user.id,
        material_id: materialId,
      });
  }

  cookieStore.set("de_saved_bookmarks", JSON.stringify(savedList), { path: "/", maxAge: 60 * 60 * 24 * 365 });

  revalidatePath("/student");
  revalidatePath("/student/bookmarks");
  revalidatePath(`/student/materials/${materialId}`);
  return { success: true, count: savedList.length };
}

// Log Material View Event
export async function trackMaterialPageView(materialId: string, materialTitle?: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const roll = extractRollNumber(user);
  const email = user.email || `${roll.toLowerCase()}@mvgrce.edu.in`;
  const name = user.user_metadata?.name || `Student ${roll}`;

  // 1. Save directly to server persistent store
  saveServerActivityEvent({
    id: `ev-view-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    type: "view",
    actor_id: user.id,
    target_id: materialId,
    actor_roll: roll,
    actor_name: name,
    actor_email: email,
    action_detail: "Viewed Material Workspace",
    created_at: new Date().toISOString(),
  });

  // 2. Also try inserting to Supabase activity_events
  try {
    await supabase.from("activity_events").insert({
      type: "view",
      actor_id: user.id,
      target_id: materialId,
      metadata: {
        action: "material_page_view",
        material_title: materialTitle || "Course Study Material",
        roll_number: roll,
        email: email,
        student_name: name,
      },
    });
  } catch {}

  revalidatePath("/admin/analytics");
  revalidatePath("/faculty/materials");
  return { success: true };
}

// Log Download Activity and Get Storage Link
export async function trackDownloadAndGetUrl(fileId: string, materialId: string, storageRef: string, fileName?: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const roll = extractRollNumber(user);
  const email = user.email || `${roll.toLowerCase()}@mvgrce.edu.in`;
  const name = user.user_metadata?.name || `Student ${roll}`;
  const targetFileName = fileName || "Study Document";

  // 1. Save directly to server persistent store
  saveServerActivityEvent({
    id: `ev-dl-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    type: "download",
    actor_id: user.id,
    target_id: materialId,
    actor_roll: roll,
    actor_name: name,
    actor_email: email,
    file_id: fileId,
    file_name: targetFileName,
    action_detail: `Downloaded: ${targetFileName}`,
    created_at: new Date().toISOString(),
  });

  // 2. Also try inserting to Supabase activity_events
  try {
    await supabase.from("activity_events").insert({
      type: "download",
      actor_id: user.id,
      target_id: materialId,
      metadata: {
        file_id: fileId,
        file_name: targetFileName,
        action: "file_download",
        roll_number: roll,
        email: email,
        student_name: name,
      },
    });
  } catch {}

  revalidatePath("/admin/analytics");
  revalidatePath("/faculty/materials");

  // If storageRef is mock "#", provide simulated download link
  if (!storageRef || storageRef === "#") {
    return { downloadUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" };
  }

  // Get signed URL for the protected file in storage bucket
  const { data, error } = await supabase.storage
    .from("materials")
    .createSignedUrl(storageRef, 60);

  if (error || !data) {
    return { error: error?.message || "Failed to generate download URL." };
  }

  return { downloadUrl: data.signedUrl };
}

// Log Preview Activity and Get Storage Link for In-Browser Viewing
export async function trackPreviewAndGetUrl(fileId: string, materialId: string, storageRef: string, fileName?: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const roll = extractRollNumber(user);
  const email = user.email || `${roll.toLowerCase()}@mvgrce.edu.in`;
  const name = user.user_metadata?.name || `Student ${roll}`;
  const targetFileName = fileName || "Study Document";

  // 1. Save directly to server persistent store
  saveServerActivityEvent({
    id: `ev-prev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    type: "view",
    actor_id: user.id,
    target_id: materialId,
    actor_roll: roll,
    actor_name: name,
    actor_email: email,
    file_id: fileId,
    file_name: targetFileName,
    action_detail: `Previewed: ${targetFileName}`,
    created_at: new Date().toISOString(),
  });

  // 2. Also try inserting to Supabase activity_events
  try {
    await supabase.from("activity_events").insert({
      type: "view",
      actor_id: user.id,
      target_id: materialId,
      metadata: {
        file_id: fileId,
        file_name: targetFileName,
        action: "file_preview",
        mode: "preview_modal",
        roll_number: roll,
        email: email,
        student_name: name,
      },
    });
  } catch {}

  revalidatePath("/admin/analytics");
  revalidatePath("/faculty/materials");

  if (!storageRef || storageRef === "#") {
    return { previewUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" };
  }

  const { data, error } = await supabase.storage
    .from("materials")
    .createSignedUrl(storageRef, 60);

  if (error || !data) {
    return { error: error?.message || "Failed to generate preview URL." };
  }

  return { previewUrl: data.signedUrl };
}
