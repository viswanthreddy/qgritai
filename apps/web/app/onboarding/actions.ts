"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const organizationSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z.string().trim().min(2).max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
});

export async function createOrganization(formData: FormData) {
  const parsed = organizationSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/onboarding?error=Use%20a%20valid%20name%20and%20lowercase%20URL%20slug.");
  const supabase = await createClient();
  const { error } = await supabase.rpc("create_organization", {
    organization_name: parsed.data.name,
    organization_slug: parsed.data.slug,
  });
  if (error) redirect(`/onboarding?error=${encodeURIComponent(error.message)}`);
  redirect("/dashboard");
}

export async function joinOrganization(formData: FormData) {
  const code = z.string().trim().min(8).max(32).safeParse(formData.get("joinCode"));
  if (!code.success) redirect("/onboarding?error=Enter%20a%20valid%20organization%20code.");
  const supabase = await createClient();
  const { error } = await supabase.rpc("join_organization", { organization_join_code: code.data });
  if (error) redirect(`/onboarding?error=${encodeURIComponent(error.message)}`);
  redirect("/dashboard");
}
