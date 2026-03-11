import type { RiskScoreIndicatorProps } from '../types';

function getRiskColor(score: number): string {
  if (score <= 30) return 'green';
  if (score <= 60) return 'yellow';
  if (score <= 80) return 'orange';
  return 'red';
}

export function RiskScoreIndicator({ score }: RiskScoreIndicatorProps) {
  const color = getRiskColor(score);
  return (
    <span className={`risk-indicator risk-indicator--${color}`} title={`Risk: ${score}/100`}>
      {score}
    </span>
  );
}
