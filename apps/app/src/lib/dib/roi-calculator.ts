export interface RoiEstimate {
  costSavings: { amount: number; description: string };
  timeSavings: { hours: number; description: string };
  riskReduction: { percentage: number; description: string };
  totalImpactScore: number;
}

interface RoiParams {
  storageSizeBytes?: number;
  slowQueryHours?: number;
  timeSavingsHours?: number;
  timeSavingsDescription?: string;
  securityGaps?: number;
  costDescription?: string;
  riskDescription?: string;
}

const STORAGE_COST_PER_GB_MONTH = 0.10;
const ENGINEERING_HOURLY_RATE = 50;

function storageCostPerYear(bytes: number): number {
  const gb = bytes / 1024 ** 3;
  return Math.round(gb * STORAGE_COST_PER_GB_MONTH * 12);
}

function engineeringCost(hours: number): number {
  return Math.round(hours * ENGINEERING_HOURLY_RATE);
}

function riskReductionPct(gaps: number): number {
  return Math.min(Math.round(gaps * 15), 85);
}

export function buildRoiEstimate(params: RoiParams): RoiEstimate {
  const {
    storageSizeBytes = 0,
    slowQueryHours = 0,
    timeSavingsHours = 0,
    timeSavingsDescription,
    securityGaps = 0,
    costDescription,
    riskDescription,
  } = params;

  const storeCost = storageCostPerYear(storageSizeBytes);
  const queryCost = engineeringCost(slowQueryHours);
  const costAmount = storeCost + queryCost;
  const riskPct = riskReductionPct(securityGaps);

  // cost at $1=1pt, time at 2pt/hr, risk at 3pt/pct
  const totalImpactScore = Math.round(costAmount / 100 + timeSavingsHours * 2 + riskPct * 3);

  return {
    costSavings: {
      amount: costAmount,
      description:
        costDescription ??
        (costAmount > 0
          ? `~$${costAmount}/year in reduced compute and storage costs`
          : "Indirect cost benefit through operational efficiency"),
    },
    timeSavings: {
      hours: timeSavingsHours,
      description:
        timeSavingsDescription ??
        (timeSavingsHours > 0
          ? `~${timeSavingsHours} engineer-hours saved per quarter`
          : "Reduces future incident response time"),
    },
    riskReduction: {
      percentage: riskPct,
      description:
        riskDescription ??
        (riskPct > 0
          ? `Closes ~${riskPct}% of identified attack vectors`
          : "No direct breach-risk impact"),
    },
    totalImpactScore,
  };
}
