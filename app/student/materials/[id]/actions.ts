"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

// Toggle Bookmark Status for a Material
export async function toggleBookmark(materialId: string, currentStatus: boolean) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  if (currentStatus) {
    // Remove bookmark
    const { error } = await supabase
      .from("bookmarks")
      .delete()
      .eq("user_id", user.id)
      .eq("material_id", materialId);

    if (error && !materialId.startsWith("mock-")) {
      return { error: error.message };
    }
  } else {
    // Add bookmark
    const { error } = await supabase
      .from("bookmarks")
      .insert({
        user_id: user.id,
        material_id: materialId,
      });

    if (error && !materialId.startsWith("mock-")) {
      return { error: error.message };
    }
  }

  revalidatePath("/student");
  revalidatePath("/student/bookmarks");
  revalidatePath(`/student/materials/${materialId}`);
  return { success: true };
}

// Log Download Activity and Get Storage Link
export async function trackDownloadAndGetUrl(fileId: string, materialId: string, storageRef: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  // Log download activity event
  await supabase
    .from("activity_events")
    .insert({
      type: "download",
      actor_id: user.id,
      target_id: materialId,
      metadata: { file_id: fileId },
    });

  // Get signed URL for the protected file in storage bucket
  const { data, error } = await supabase.storage
    .from("materials")
    .createSignedUrl(storageRef, 60); // URL valid for 60 seconds

  if (error || !data) {
    return { error: error?.message || "Failed to generate download URL." };
  }

  return { downloadUrl: data.signedUrl };
}

// Log Preview Activity and Get Storage Link for In-Browser Viewing
export async function trackPreviewAndGetUrl(fileId: string, materialId: string, storageRef: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  // Log preview activity event
  await supabase
    .from("activity_events")
    .insert({
      type: "view",
      actor_id: user.id,
      target_id: materialId,
      metadata: { file_id: fileId, mode: "preview_modal" },
    });

  // Get signed URL with 10-minute validity for reading in modal
  const { data, error } = await supabase.storage
    .from("materials")
    .createSignedUrl(storageRef, 600);

  if (error || !data) {
    return { error: error?.message || "Failed to generate preview URL." };
  }

  return { previewUrl: data.signedUrl };
}
