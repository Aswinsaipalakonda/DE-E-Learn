"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

// Helper to ensure user profile exists in public.users to satisfy foreign key constraints
async function ensureUserProfile(supabase: any, user: any) {
  if (!user) return null;
  const email = user.email || "";
  const roll = email.includes("@") ? email.split("@")[0].toUpperCase() : "23331A4701";
  const name = user.user_metadata?.name || `Student ${roll}`;
  
  try {
    await supabase
      .from("users")
      .upsert(
        {
          id: user.id,
          email: email,
          name: name,
          role: "student",
          branch: "CIC",
          current_semester: 3,
          section: "A",
          roll_number: roll,
        },
        { onConflict: "id" }
      );
  } catch (e) {
    console.warn("User profile upsert notice:", e);
  }
}

// Cookie-based fallback event storage to ensure 100% resilient tracking
function appendActivityCookie(cookieStore: any, event: any) {
  try {
    const raw = cookieStore.get("de_live_activity_events")?.value;
    let events = [];
    if (raw) {
      events = JSON.parse(raw);
    }
    events.unshift(event);
    if (events.length > 500) events = events.slice(0, 500);
    cookieStore.set("de_live_activity_events", JSON.stringify(events), {
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
  } catch (err) {
    console.warn("Activity cookie append notice:", err);
  }
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

  await ensureUserProfile(supabase, user);
  const email = user.email || "";
  const roll = email.includes("@") ? email.split("@")[0].toUpperCase() : "23331A4701";

  const eventPayload = {
    id: `ev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    type: "view",
    actor_id: user.id,
    target_id: materialId,
    actor_email: email,
    actor_roll: roll,
    metadata: {
      action: "material_page_view",
      material_title: materialTitle || "Course Study Material",
      roll_number: roll,
      email: email,
    },
    created_at: new Date().toISOString(),
  };

  appendActivityCookie(cookieStore, eventPayload);

  try {
    await supabase
      .from("activity_events")
      .insert({
        type: "view",
        actor_id: user.id,
        target_id: materialId,
        metadata: eventPayload.metadata,
      });
  } catch (err) {
    console.warn("Failed to insert page view event:", err);
  }

  return { success: true };
}

// Log Download Activity and Get Storage Link
export async function trackDownloadAndGetUrl(fileId: string, materialId: string, storageRef: string, fileName?: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  await ensureUserProfile(supabase, user);
  const email = user.email || "";
  const roll = email.includes("@") ? email.split("@")[0].toUpperCase() : "23331A4701";

  const eventPayload = {
    id: `ev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    type: "download",
    actor_id: user.id,
    target_id: materialId,
    actor_email: email,
    actor_roll: roll,
    metadata: { 
      file_id: fileId,
      file_name: fileName || "Study Document",
      action: "file_download",
      roll_number: roll,
      email: email,
    },
    created_at: new Date().toISOString(),
  };

  appendActivityCookie(cookieStore, eventPayload);

  try {
    await supabase
      .from("activity_events")
      .insert({
        type: "download",
        actor_id: user.id,
        target_id: materialId,
        metadata: eventPayload.metadata,
      });
  } catch (err) {
    console.warn("Activity download log notice:", err);
  }

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

  await ensureUserProfile(supabase, user);
  const email = user.email || "";
  const roll = email.includes("@") ? email.split("@")[0].toUpperCase() : "23331A4701";

  const eventPayload = {
    id: `ev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    type: "view",
    actor_id: user.id,
    target_id: materialId,
    actor_email: email,
    actor_roll: roll,
    metadata: { 
      file_id: fileId,
      file_name: fileName || "Study Document",
      action: "file_preview",
      mode: "preview_modal",
      roll_number: roll,
      email: email,
    },
    created_at: new Date().toISOString(),
  };

  appendActivityCookie(cookieStore, eventPayload);

  try {
    await supabase
      .from("activity_events")
      .insert({
        type: "view",
        actor_id: user.id,
        target_id: materialId,
        metadata: eventPayload.metadata,
      });
  } catch (err) {
    console.warn("Activity preview log notice:", err);
  }

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
