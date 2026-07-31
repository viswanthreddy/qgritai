"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

function errorRedirect(message: string): never {
  redirect(`/login?error=${encodeURIComponent(message)}`);
}

export async function signIn(formData: FormData) {
  const parsed = credentialsSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) errorRedirect("Enter a valid email and a password of at least 8 characters.");
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) errorRedirect(error.message);
  redirect("/dashboard");
}

export async function signUp(formData: FormData) {
  const parsed = credentialsSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) errorRedirect("Enter a valid email and a password of at least 8 characters.");
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp(parsed.data);
  if (error) errorRedirect(error.message);
  redirect("/onboarding");
}

export async function sendMagicLink(formData: FormData) {
  const email = z.string().email().safeParse(formData.get("email"));
  if (!email.success) errorRedirect("Enter a valid email address.");
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: email.data,
    options: { emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/callback` },
  });
  if (error) errorRedirect(error.message);
  redirect("/login?message=Check your email for a secure sign-in link.");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
