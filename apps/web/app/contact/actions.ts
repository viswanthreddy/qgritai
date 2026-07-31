"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const leadSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  workEmail: z.string().trim().email().max(320),
  company: z.string().trim().min(2).max(160),
  jobTitle: z.string().trim().max(160),
  message: z.string().trim().min(20).max(3000),
  website: z.string().max(0),
});

export async function submitContact(formData: FormData) {
  const parsed = leadSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/contact?error=Please%20review%20the%20required%20fields.");
  const supabase = await createClient();
  const { error } = await supabase.rpc("submit_lead", {
    full_name: parsed.data.fullName,
    work_email: parsed.data.workEmail,
    company: parsed.data.company,
    job_title: parsed.data.jobTitle,
    message: parsed.data.message,
    source: "contact",
  });
  if (error) redirect("/contact?error=We%20could%20not%20submit%20your%20request.%20Please%20try%20again.");
  redirect("/contact?submitted=true");
}
