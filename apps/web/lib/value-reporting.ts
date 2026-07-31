export function calculateTargetProgress(baseline: number, current: number, target: number) {
  if (![baseline, current, target].every(Number.isFinite)) throw new Error("Metric values must be finite.");
  if (target === baseline) return current === target ? 100 : 0;
  return Math.round(((current - baseline) / (target - baseline)) * 1000) / 10;
}

export function calculateAdoptionRate(activeUsers: number, eligibleUsers: number) {
  if (!Number.isInteger(activeUsers) || !Number.isInteger(eligibleUsers) || eligibleUsers <= 0 || activeUsers < 0 || activeUsers > eligibleUsers) throw new Error("Invalid adoption counts.");
  return Math.round((activeUsers / eligibleUsers) * 1000) / 10;
}
