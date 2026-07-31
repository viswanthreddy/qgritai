import { describe, expect, it } from "vitest";
import { parseClamdScanResponse } from "./clamd.js";

describe("parseClamdScanResponse", () => {
  it("accepts a clean stream", () => expect(parseClamdScanResponse("stream: OK")).toEqual({ clean: true }));
  it("returns a bounded malware signature", () => expect(parseClamdScanResponse("stream: Eicar-Signature FOUND")).toEqual({ clean: false, signature: "Eicar-Signature" }));
  it("rejects an unknown daemon response", () => expect(() => parseClamdScanResponse("stream: ERROR")).toThrow("Unexpected ClamAV response"));
});
