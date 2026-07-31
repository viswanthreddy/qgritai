export const readinessDimensions = ["Executive sponsorship", "Workflow clarity", "Data accessibility", "Integration readiness", "Governance", "Adoption capability"] as const;

export function calculateReadiness(scores: number[]) {
  if (scores.length === 0 || scores.some(score => !Number.isFinite(score) || score < 1 || score > 5)) {
    throw new Error("Readiness scores must contain values from 1 to 5.");
  }
  const total = Math.round((scores.reduce((sum, score) => sum + score, 0) / scores.length) * 20);
  const label = total >= 80 ? "Ready to scale" : total >= 60 ? "Ready for focused pilots" : "Foundation work required";
  return { total, label };
}

export type RoiInputs = { people: number; weeklyHours: number; hourlyCost: number; automationPercent: number; implementationCost: number };

export function calculateRoi(input: RoiInputs) {
  const values = Object.values(input);
  if (values.some(value => !Number.isFinite(value) || value < 0) || input.people < 1 || input.automationPercent > 100) {
    throw new Error("ROI inputs are outside their valid ranges.");
  }
  const annualHours = input.people * input.weeklyHours * 52 * (input.automationPercent / 100);
  const annualValue = annualHours * input.hourlyCost;
  return {
    annualHours,
    annualValue,
    roi: input.implementationCost ? ((annualValue - input.implementationCost) / input.implementationCost) * 100 : 0,
    payback: annualValue ? input.implementationCost / (annualValue / 12) : 0,
  };
}
