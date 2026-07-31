import { describe, expect, it } from "vitest";
import { getCanonicalRedirectUrl } from "./canonical-host";

describe("getCanonicalRedirectUrl", () => {
  it("moves browser routes from the production alias to the canonical domain", () => {
    const redirect = getCanonicalRedirectUrl(
      new URL("https://qgritai.vercel.app/login?next=%2Fdashboard"),
      "https://qgritai.com",
    );
    expect(redirect?.toString()).toBe("https://qgritai.com/login?next=%2Fdashboard");
  });

  it("does not redirect the canonical domain or deployment previews", () => {
    expect(getCanonicalRedirectUrl(new URL("https://qgritai.com/login"), "https://qgritai.com")).toBeNull();
    expect(getCanonicalRedirectUrl(new URL("https://qgritai-git-main-qgrit-ai.vercel.app/login"), "https://qgritai.com")).toBeNull();
  });

  it("does not redirect API workers", () => {
    expect(getCanonicalRedirectUrl(new URL("https://qgritai.vercel.app/api/cron/notifications"), "https://qgritai.com")).toBeNull();
  });

  it("fails closed when the configured canonical origin is unexpected", () => {
    expect(getCanonicalRedirectUrl(new URL("https://qgritai.vercel.app/login"), "https://example.com")).toBeNull();
  });
});
