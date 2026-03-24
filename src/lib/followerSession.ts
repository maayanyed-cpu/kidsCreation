import { cookies } from "next/headers";

const COOKIE_NAME = "follower_id";
const MAX_AGE = 365 * 24 * 60 * 60; // 1 year

export async function getFollowerId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value ?? null;
}

export async function setFollowerCookie(followerId: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, followerId, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: MAX_AGE,
    path: "/",
  });
}
