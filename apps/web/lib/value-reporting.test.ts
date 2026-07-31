import { describe, expect, it } from "vitest";
import { calculateAdoptionRate, calculateTargetProgress } from "./value-reporting";

describe("value reporting", () => {
  it("calculates progress for an increasing metric", () => expect(calculateTargetProgress(100, 130, 160)).toBe(50));
  it("calculates progress for a decreasing metric", () => expect(calculateTargetProgress(10, 7, 4)).toBe(50));
  it("handles a target equal to baseline", () => expect(calculateTargetProgress(5, 5, 5)).toBe(100));
  it("calculates adoption rate", () => expect(calculateAdoptionRate(43, 50)).toBe(86));
  it("rejects impossible adoption counts", () => expect(() => calculateAdoptionRate(51, 50)).toThrow());
});
