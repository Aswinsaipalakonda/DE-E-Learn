"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { logAuditAction } from "@/utils/audit-logger";

export async function uploadMaterialAction(formData: FormData) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Authenticate and verify faculty role
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: "Unauthorized request. Please log in." };
  }

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || (profile.role !== "faculty" && profile.role !== "admin")) {
    return { error: "Permission denied. Only faculty can upload." };
  }

  // Retrieve fields
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const subject = formData.get("subject") as string;
  const branch = formData.get("branch") as string;
  const semester = parseInt(formData.get("semester") as string, 10);
  const type = formData.get("type") as string;
  const state = formData.get("state") as "draft" | "published";
  const tagsStr = formData.get("tags") as string;
  const tags = tagsStr ? tagsStr.split(",").map(t => t.trim()).filter(Boolean) : [];

  if (!title || !subject || !branch || !semester || !type || !state) {
    return { error: "Missing required taxonomy fields." };
  }

  // Get uploaded files
  const files = formData.getAll("files") as File[];
  const validFiles = files.filter(f => f.size > 0 && f.name !== "undefined");

  if (validFiles.length === 0) {
    return { error: "At least one valid file is required to create a material." };
  }

  // Security checks: file extensions and sizes validation
  const allowedExtensions = [".pdf", ".ppt", ".pptx", ".doc", ".docx", ".zip"];
  const maxFileSize = 100 * 1024 * 1024; // 100 MB

  for (const file of validFiles) {
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      return { error: `File type ${ext} is not allowed. Supported: PDF, PPT/X, DOC/X, ZIP.` };
    }
    if (file.size > maxFileSize) {
      return { error: `File ${file.name} exceeds the 100MB limit.` };
    }
  }

  // Step 1: Insert Material record
  const { data: material, error: insertError } = await supabase
    .from("materials")
    .insert({
      title,
      description,
      subject,
      branch,
      semester,
      type,
      state,
      owner: user.id,
      tags,
    })
    .select("id")
    .single();

  if (insertError || !material) {
    return { error: insertError?.message || "Failed to create material record." };
  }

  // Step 2: Upload files and insert MaterialFile records
  for (const file of validFiles) {
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    // Unique storage path: materials/UUID_filename
    const uniqueId = crypto.randomUUID();
    const storageRef = `${material.id}/${uniqueId}${ext}`;

    const buffer = await file.arrayBuffer();

    // Upload to Supabase Storage materials bucket
    const { error: uploadError } = await supabase.storage
      .from("materials")
      .upload(storageRef, buffer, {
        contentType: file.type,
        cacheControl: "3600",
      });

    if (uploadError) {
      // Rollback (Supabase CASCADE delete handles deleting material from DB, but let's clean up)
      await supabase.from("materials").delete().eq("id", material.id);
      return { error: `Failed to upload file ${file.name}: ${uploadError.message}` };
    }

    // Insert MaterialFile record
    const { error: fileInsertError } = await supabase
      .from("material_files")
      .insert({
        material_id: material.id,
        file_name: file.name,
        mime_type: file.type,
        size: file.size,
        version: 1,
        storage_ref: storageRef,
      });

    if (fileInsertError) {
      await supabase.from("materials").delete().eq("id", material.id);
      return { error: `Failed to register file ${file.name} metadata: ${fileInsertError.message}` };
    }
  }

  await logAuditAction("UPLOAD_MATERIAL", material.id, null, { title, type, subject, filesCount: validFiles.length });

  redirect("/faculty");
}
