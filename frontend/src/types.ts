export interface Vulnerability {
  id: string;
  description: string;
  severity: string;
  riskScore: number;
  published: string;
}

export interface Stats {
  bySeverity: { severity: string; count: number }[];
  topVendors: { vendor: string; count: number }[];
}

export interface RiskScoreIndicatorProps {
  score: number;
}
