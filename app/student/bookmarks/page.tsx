import { getCachedUserProfile } from "@/utils/supabase/cached-auth";
import { cookies } from "next/headers";
import BookmarksClient from "./bookmarks-client";
import { getStudentBookmarks } from "@/utils/bookmarks";

export default async function BookmarksPage() {
  const cookieStore = await cookies();
  const { user, supabase } = await getCachedUserProfile();
  if (!user) return null;

  // Use unified single-source bookmark resolver
  const { bookmarks } = await getStudentBookmarks(supabase, user.id, cookieStore);

  return <BookmarksClient initialBookmarks={bookmarks} />;
}
