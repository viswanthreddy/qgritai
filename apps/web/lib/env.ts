import { z } from "zod";

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
});

export function getSupabaseEnv() {
  return publicEnvSchema.parse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });
}

export function isSupabaseConfigured() {
  return publicEnvSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  }).success;
}

const notificationEnvSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  RESEND_API_KEY: z.string().min(1),
  EMAIL_FROM: z.string().min(3),
  CONTACT_NOTIFICATION_TO: z.string().email(),
  CRON_SECRET: z.string().min(16),
});

const documentScannerEnvSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  CRON_SECRET: z.string().min(16),
  DOCUMENT_SCANNER_URL: z.string().url(),
  DOCUMENT_SCANNER_SECRET: z.string().min(16),
});

export function getNotificationEnv() {
  return notificationEnvSchema.parse({
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    EMAIL_FROM: process.env.EMAIL_FROM,
    CONTACT_NOTIFICATION_TO: process.env.CONTACT_NOTIFICATION_TO,
    CRON_SECRET: process.env.CRON_SECRET,
  });
}

export function getDocumentScannerEnv() {
  return documentScannerEnvSchema.parse({
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    CRON_SECRET: process.env.CRON_SECRET,
    DOCUMENT_SCANNER_URL: process.env.DOCUMENT_SCANNER_URL,
    DOCUMENT_SCANNER_SECRET: process.env.DOCUMENT_SCANNER_SECRET,
  });
}
