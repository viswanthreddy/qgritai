import { describe, expect, it } from "vitest";
import { normalizeSiteUrl } from "./site-url";

describe("normalizeSiteUrl", () => {
  it("preserves an explicit local protocol", () => {
    expect(normalizeSiteUrl("http://localhost:3000/")).toBe("http://localhost:3000");
  });

  it("adds HTTPS to a Vercel hostname", () => {
    expect(normalizeSiteUrl("qgritai-preview.vercel.app")).toBe("https://qgritai-preview.vercel.app");
  });

  it("removes trailing slashes", () => {
    expect(normalizeSiteUrl("https://qgritai.com///")).toBe("https://qgritai.com");
  });
});
