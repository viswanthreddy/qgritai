import { describe, expect, it } from "vitest";
import { getPlatformConfiguration } from "./env";

const validEnvironment = {
  NEXT_PUBLIC_SITE_URL: "https://qgritai.com",
  NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "public-anon-key-with-sufficient-length",
  SUPABASE_SERVICE_ROLE_KEY: "server-only-service-role-key-with-sufficient-length",
  RESEND_API_KEY: "re_valid_api_key",
  EMAIL_FROM: "QgritAI <notifications@qgritai.com>",
  CONTACT_NOTIFICATION_TO: "hello@qgritai.com",
  CRON_SECRET: "a-strong-cron-secret-value",
  DOCUMENT_SCANNER_URL: "https://scanner.internal.example/scan",
  DOCUMENT_SCANNER_SECRET: "a-strong-scanner-secret-value",
};

describe("getPlatformConfiguration", () => {
  it("reports ready only when every production integration is configured", () => {
    expect(getPlatformConfiguration(validEnvironment)).toEqual({
      ready: true,
      checks: { canonicalSiteUrl: true, supabase: true, notifications: true, documentScanner: true },
    });
  });

  it("rejects placeholder credentials", () => {
    const result = getPlatformConfiguration({
      ...validEnvironment,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "replace-with-local-anon-key",
    });
    expect(result.ready).toBe(false);
    expect(result.checks.supabase).toBe(false);
  });

  it("requires an explicit HTTPS canonical production URL", () => {
    const result = getPlatformConfiguration({ ...validEnvironment, NEXT_PUBLIC_SITE_URL: "http://localhost:3000" });
    expect(result.ready).toBe(false);
    expect(result.checks.canonicalSiteUrl).toBe(false);
  });

  it("identifies a missing scanner without exposing configuration values", () => {
    expect(getPlatformConfiguration({ ...validEnvironment, DOCUMENT_SCANNER_SECRET: undefined })).toEqual({
      ready: false,
      checks: { canonicalSiteUrl: true, supabase: true, notifications: true, documentScanner: false },
    });
  });
});
