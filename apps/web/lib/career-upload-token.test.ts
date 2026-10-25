import { describe, expect, it } from "vitest";
import { createCareerUploadToken, verifyCareerUploadToken } from "./career-upload-token";

describe("career upload token", () => {
  const secret = "a-secure-test-secret-that-is-long-enough";

  it("accepts the expected path before expiry", () => {
    const token = createCareerUploadToken("applications/resume.pdf", secret, 1_000);
    expect(verifyCareerUploadToken(token, "applications/resume.pdf", secret, 2_000)).toBe(true);
  });

  it("rejects another path, tampering, and expiry", () => {
    const token = createCareerUploadToken("applications/resume.pdf", secret, 1_000);
    expect(verifyCareerUploadToken(token, "applications/other.pdf", secret, 2_000)).toBe(false);
    expect(verifyCareerUploadToken(`${token}x`, "applications/resume.pdf", secret, 2_000)).toBe(false);
    expect(verifyCareerUploadToken(token, "applications/resume.pdf", secret, 1_000 + 16 * 60_000)).toBe(false);
  });
});
