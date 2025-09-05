"use server";

import { cookies } from "next/headers";

export async function signOut() {
  const cookieStore = await cookies();
  cookieStore.delete("access_token");
}
