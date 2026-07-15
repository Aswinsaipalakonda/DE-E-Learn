"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

// Archive or Publish a Material
export async function toggleMaterialState(id: string, newState: "draft" | "published" | "archived") {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("materials")
    .update({ state: newState })
    .eq("id", id)
    .eq("owner", user.id);

  if (error) return { error: error.message };

  revalidatePath("/faculty/materials");
  return { success: true };
}

// Soft Delete a Material
export async function deleteMaterial(id: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("materials")
    .update({ state: "deleted" })
    .eq("id", id)
    .eq("owner", user.id);

  if (error) return { error: error.message };

  revalidatePath("/faculty/materials");
  return { success: true };
}

// Replace File Version Action
export async function replaceFileVersion(formData: FormData) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const materialId = formData.get("materialId") as string;
  const fileId = formData.get("fileId") as string;
  const file = formData.get("file") as File;

  if (!materialId || !fileId || !file || file.size === 0) {
    return { error: "Required fields or file are missing." };
  }

  // Security checks: file format and size
  const allowedExtensions = [".pdf", ".ppt", ".pptx", ".doc", ".docx", ".zip"];
  const maxFileSize = 100 * 1024 * 1024; // 100MB
  const ext = "." + file.name.split(".").pop()?.toLowerCase();

  if (!allowedExtensions.includes(ext)) {
    return { error: `File type ${ext} is not allowed.` };
  }
  if (file.size > maxFileSize) {
    return { error: "File exceeds 100MB limit." };
  }

  // Fetch current version of the file
  const { data: currentFile, error: fileError } = await supabase
    .from("material_files")
    .select("version, file_name")
    .eq("id", fileId)
    .single();

  if (fileError || !currentFile) {
    return { error: "Current file metadata not found." };
  }

  const nextVersion = currentFile.version + 1;
  const uniqueId = crypto.randomUUID();
  const storageRef = `${materialId}/${uniqueId}${ext}`;

  // Upload to Supabase Storage
  const buffer = await file.arrayBuffer();
  const { error: uploadError } = await supabase.storage
    .from("materials")
    .upload(storageRef, buffer, {
      contentType: file.type,
      cacheControl: "3600",
    });

  if (uploadError) {
    return { error: `Failed to upload new version: ${uploadError.message}` };
  }

  // Insert new version record while preserving the previous metadata
  const { error: fileInsertError } = await supabase
    .from("material_files")
    .insert({
      material_id: materialId,
      file_name: file.name,
      mime_type: file.type,
      size: file.size,
      version: nextVersion,
      storage_ref: storageRef,
    });

  if (fileInsertError) {
    return { error: `Failed to register version ${nextVersion}: ${fileInsertError.message}` };
  }

  revalidatePath("/faculty/materials");
  return { success: true };
}
