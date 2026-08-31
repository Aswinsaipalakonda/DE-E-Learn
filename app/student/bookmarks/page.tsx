import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import BookmarksClient, { BookmarkMaterialItem } from "./bookmarks-client";

const FALLBACK_BOOKMARKS: BookmarkMaterialItem[] = [
  {
    id: "mock-mat-1",
    title: "Database Management Systems (DBMS) - Unit 1 Relational Models",
    type: "Lecture Notes",
    subjectTitle: "Database Management Systems",
    subjectCode: "23CIC301",
    facultyName: "Dr. P. Satyanarayana",
  },
  {
    id: "mock-mat-2",
    title: "Cloud Infrastructure & Distributed Computing - Lab Manual",
    type: "Lab Manual",
    subjectTitle: "Cloud Computing & DevOps",
    subjectCode: "23CIC302",
    facultyName: "Dr. K. Srinivas Rao",
  },
  {
    id: "mock-mat-5",
    title: "Big Data Processing with Apache Spark - Mid-Term Question Bank",
    type: "Question Bank",
    subjectTitle: "Big Data Analytics",
    subjectCode: "23CIC303",
    facultyName: "Prof. M. V. Ramana",
  },
];

export default async function BookmarksPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Read cookie override if user removed items
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
      materials (
        id,
        title,
        type,
        subjects (title, code)
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const rawBookmarks: BookmarkMaterialItem[] = (dbData || [])
    .filter((b: any) => b.materials)
    .map((b: any) => ({
      id: b.materials.id,
      title: b.materials.title,
      type: b.materials.type,
      subjectTitle: b.materials.subjects?.title || "Department Subject",
      subjectCode: b.materials.subjects?.code || "",
      facultyName: "Faculty Member",
    }));

  let bookmarks: BookmarkMaterialItem[] = rawBookmarks.length > 0 ? rawBookmarks : FALLBACK_BOOKMARKS;

  if (savedBookmarkIds !== null) {
    bookmarks = bookmarks.filter((b) => savedBookmarkIds.includes(b.id));
  }

  return <BookmarksClient initialBookmarks={bookmarks} />;
}
