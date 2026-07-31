import { describe, expect, it } from "vitest";
import { calculateReadiness, calculateRoi } from "./calculations";

describe("calculateReadiness", () => {
  it("calculates boundaries and labels", () => {
    expect(calculateReadiness([3, 3, 3, 3, 3, 3])).toEqual({ total: 60, label: "Ready for focused pilots" });
    expect(calculateReadiness([5, 5])).toEqual({ total: 100, label: "Ready to scale" });
  });
  it("rejects invalid scores", () => expect(() => calculateReadiness([0, 4])).toThrow());
});

describe("calculateRoi", () => {
  it("calculates annual value, ROI, and payback", () => {
    expect(calculateRoi({ people: 10, weeklyHours: 5, hourlyCost: 100, automationPercent: 50, implementationCost: 50_000 })).toEqual({ annualHours: 1300, annualValue: 130000, roi: 160, payback: 50_000 / (130_000 / 12) });
  });
  it("handles a zero investment without division errors", () => expect(calculateRoi({ people: 1, weeklyHours: 1, hourlyCost: 1, automationPercent: 100, implementationCost: 0 }).roi).toBe(0));
});
