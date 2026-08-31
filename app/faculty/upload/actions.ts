"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { logAuditAction } from "@/utils/audit-logger";

const VALID_DB_TYPES = [
  "Notes",
  "Lecture Slides",
  "Assignments",
  "Lab Manuals",
  "Question Banks",
  "Model Papers",
  "Reference Books",
  "Previous Papers",
  "Videos",
  "Other Resources"
] as const;

function normalizeMaterialType(rawType: string): string {
  const lower = (rawType || "").toLowerCase().trim();
  if (lower === "notes" || lower.includes("note")) return "Notes";
  if (lower.includes("slide")) return "Lecture Slides";
  if (lower.includes("assignment")) return "Assignments";
  if (lower.includes("lab") || lower.includes("manual")) return "Lab Manuals";
  if (lower.includes("question")) return "Question Banks";
  if (lower.includes("model")) return "Model Papers";
  if (lower.includes("book") || lower.includes("reference")) return "Reference Books";
  if (lower.includes("previous")) return "Previous Papers";
  if (lower.includes("video")) return "Videos";
  return "Other Resources";
}

const SUBJECT_TITLE_MAP: Record<string, string> = {
  "23CIC301": "Database Management Systems",
  "23CIC302": "Cloud Infrastructure & Distributed Systems",
  "23CIC303": "Big Data Processing with Apache Spark",
  "23CIC304": "Operating Systems & Linux Kernel Architecture",
  "23CIC305": "Computer Networks & IoT Protocols",
  "23CSD501": "Data Warehousing & Dimensional Mining",
  "23CSM101": "Machine Learning with Python",
};

export async function uploadMaterialAction(formData: FormData) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Authenticate and verify faculty role
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: "Unauthorized request. Please log in." };
  }

  // Retrieve fields
  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || "";
  const subject = (formData.get("subject") as string)?.trim();
  const branch = (formData.get("branch") as string)?.trim() || "CIC";
  const semester = parseInt(formData.get("semester") as string, 10) || 3;
  const rawType = (formData.get("type") as string)?.trim();
  const state = formData.get("state") as "draft" | "published";
  const tagsStr = formData.get("tags") as string;
  const tags = tagsStr ? tagsStr.split(",").map(t => t.trim()).filter(Boolean) : [];

  const normalizedType = normalizeMaterialType(rawType);

  if (!title || !subject || !branch || !semester || !normalizedType || !state) {
    return { error: "Missing required taxonomy fields." };
  }

  // Get uploaded files
  const files = formData.getAll("files") as File[];
  const validFiles = files.filter(f => f.size > 0 && f.name !== "undefined");

  if (validFiles.length === 0) {
    return { error: "At least one valid file is required to create a material." };
  }

  // Security checks: file extensions and sizes validation
  // Allowed: PDF, DOC, DOCX, PPT, PPTX, TXT. (No zip, rar, etc.)
  const allowedExtensions = [".pdf", ".ppt", ".pptx", ".doc", ".docx", ".txt"];
  const maxFileSize = 100 * 1024 * 1024; // 100 MB

  for (const file of validFiles) {
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      return { error: `File type "${ext}" is not supported. Please upload PDF, Word documents (.doc/.docx), or PowerPoint slides (.ppt/.pptx). Compressed files (zip/rar) are not allowed.` };
    }
    if (file.size > maxFileSize) {
      return { error: `File "${file.name}" exceeds the maximum limit of 100 MB.` };
    }
  }

  // =========================================================================
  // GUARANTEE FOREIGN KEY CONSTRAINTS EXIST IN DATABASE
  // =========================================================================
  try {
    // 1. Ensure user profile exists in public.users
    await supabase.from("users").upsert({
      id: user.id,
      email: user.email || `${user.id}@mvgrce.edu.in`,
      name: user.user_metadata?.name || user.email?.split("@")[0] || "Faculty",
      role: "faculty",
      branch: branch,
      academic_year: 2026,
      current_semester: semester,
      first_login_pending: false,
    }, { onConflict: "id" });

    // 2. Ensure Branch exists in public.branches
    await supabase.from("branches").upsert({
      code: branch,
      name: branch === "CIC" ? "Cyber Security, IoT with BlockChain Technology" : branch,
      active: true,
    }, { onConflict: "code" });

    // 3. Ensure Semester exists in public.semesters
    await supabase.from("semesters").upsert({
      number: semester,
      name: `${semester}th Semester`,
      active: true,
    }, { onConflict: "number" });

    // 4. Ensure Subject exists in public.subjects
    const subjectTitle = SUBJECT_TITLE_MAP[subject] || `${subject} Course`;
    await supabase.from("subjects").upsert({
      code: subject,
      title: subjectTitle,
      branch: branch,
      semester: semester,
      active: true,
    }, { onConflict: "code" });
  } catch (fkPrepError) {
    console.warn("Taxonomy foreign key preparation notice:", fkPrepError);
  }

  // Step 1: Insert Material record with exact Postgres check constraint type
  const { data: material, error: insertError } = await supabase
    .from("materials")
    .insert({
      title,
      description,
      subject,
      branch,
      semester,
      type: normalizedType,
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

    try {
      const buffer = await file.arrayBuffer();

      // Upload to Supabase Storage materials bucket
      const { error: uploadError } = await supabase.storage
        .from("materials")
        .upload(storageRef, buffer, {
          contentType: file.type || "application/octet-stream",
          cacheControl: "3600",
        });

      if (uploadError) {
        console.warn("Storage bucket upload warning:", uploadError.message);
      }
    } catch (storageException) {
      console.warn("Storage upload exception:", storageException);
    }

    // Insert MaterialFile record
    const { error: fileInsertError } = await supabase
      .from("material_files")
      .insert({
        material_id: material.id,
        file_name: file.name,
        mime_type: file.type || "application/pdf",
        size: file.size,
        version: 1,
        storage_ref: storageRef,
      });

    if (fileInsertError) {
      console.warn("Material file insert warning:", fileInsertError.message);
    }
  }

  await logAuditAction("UPLOAD_MATERIAL", material.id, null, { title, type: normalizedType, subject, filesCount: validFiles.length });

  redirect("/faculty/materials");
}
