// Fresh AI calls allowed per player in any rolling 24 hours; override with AI_CALLS_PER_DAY.
const DEFAULT_CALLS_PER_DAY = 5;

export const maxCallsPerDay = (): number => {
  const n = Number.parseInt(process.env.AI_CALLS_PER_DAY ?? "", 10);
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_CALLS_PER_DAY;
};
