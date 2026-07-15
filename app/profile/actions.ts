"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function updatePasswordAction(password: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: "Unauthorized. Please log in." };
  }

  // Update password in Supabase Auth
  const { error: updateError } = await supabase.auth.updateUser({
    password: password,
  });

  if (updateError) {
    return { error: updateError.message };
  }

  // Set first_login_pending flag to false since they changed it
  await supabase
    .from("users")
    .update({ first_login_pending: false })
    .eq("id", user.id);

  revalidatePath("/profile");
  return { success: true };
}
