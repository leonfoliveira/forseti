"use server";

import { cookies } from "next/headers";

export async function clearCookies(...cookieNames: string[]): Promise<void> {
  const cookiesFn = await cookies();

  cookieNames.forEach((cookie) => cookiesFn.delete(cookie));
}
