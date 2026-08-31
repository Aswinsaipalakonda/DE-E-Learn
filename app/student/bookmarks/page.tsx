import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import BookmarksClient, { BookmarkMaterialItem } from "./bookmarks-client";

const SAMPLE_MATERIALS_MAP: Record<string, BookmarkMaterialItem> = {
  "mock-mat-1": {
    id: "mock-mat-1",
    title: "Database Management Systems (DBMS) - Unit 1 Relational Models",
    type: "Lecture Notes",
    subjectTitle: "Database Management Systems",
    subjectCode: "23CIC301",
    facultyName: "Dr. P. Satyanarayana",
  },
  "mock-mat-2": {
    id: "mock-mat-2",
    title: "Cloud Infrastructure & Distributed Computing - Lab Manual",
    type: "Lab Manual",
    subjectTitle: "Cloud Computing & DevOps",
    subjectCode: "23CIC302",
    facultyName: "Dr. K. Srinivas Rao",
  },
  "mock-mat-5": {
    id: "mock-mat-5",
    title: "Big Data Processing with Apache Spark - Mid-Term Question Bank",
    type: "Question Bank",
    subjectTitle: "Big Data Analytics",
    subjectCode: "23CIC303",
    facultyName: "Prof. M. V. Ramana",
  },
};

export default async function BookmarksPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Read cookie override if user modified bookmarks
  const cookieVal = cookieStore.get("de_saved_bookmarks")?.value;
  let savedBookmarkIds: string[] | null = null;
  if (cookieVal) {
    try { savedBookmarkIds = JSON.parse(cookieVal); } catch {}
  }

  // Query bookmarks joining materials and subjects
  const { data: dbData } = await supabase
    .from("bookmarks")
    .select(`
      id,
      created_at,
      material_id,
      materials (
        id,
        title,
        type,
        subjects (title, code)
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const rawBookmarks: BookmarkMaterialItem[] = [];
  (dbData || []).forEach((b: any) => {
    if (b.materials) {
      rawBookmarks.push({
        id: b.materials.id,
        title: b.materials.title,
        type: b.materials.type,
        subjectTitle: b.materials.subjects?.title || "Department Subject",
        subjectCode: b.materials.subjects?.code || "",
        facultyName: "Faculty Member",
      });
    } else if (b.material_id && SAMPLE_MATERIALS_MAP[b.material_id]) {
      rawBookmarks.push(SAMPLE_MATERIALS_MAP[b.material_id]);
    }
  });

  let bookmarks: BookmarkMaterialItem[] = [];

  if (savedBookmarkIds !== null) {
    // If cookie is active, resolve items from database or sample map
    savedBookmarkIds.forEach((id) => {
      const existing = rawBookmarks.find((b) => b.id === id);
      if (existing) {
        bookmarks.push(existing);
      } else if (SAMPLE_MATERIALS_MAP[id]) {
        bookmarks.push(SAMPLE_MATERIALS_MAP[id]);
      }
    });
  } else {
    bookmarks = rawBookmarks;
  }

  return <BookmarksClient initialBookmarks={bookmarks} />;
}
