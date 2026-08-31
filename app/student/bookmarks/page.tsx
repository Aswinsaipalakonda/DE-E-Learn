import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import BookmarksClient from "./bookmarks-client";
import { getStudentBookmarks } from "@/utils/bookmarks";

export default async function BookmarksPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Use unified single-source bookmark resolver
  const { bookmarks } = await getStudentBookmarks(supabase, user.id, cookieStore);

  return <BookmarksClient initialBookmarks={bookmarks} />;
}
