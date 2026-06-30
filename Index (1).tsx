import type { ActivityType } from '../types';

// Points awarded per activity type
export const POINTS: Record<ActivityType, number> = {
  sendout: 100,
  client_meeting: 25,
  candidate_call: 10,
};

// Display metadata for each activity type
export const ACTIVITY_META: Record<
  ActivityType,
  { label: string; emoji: string; points: number }
> = {
  sendout: { label: 'Sendout', emoji: '📤', points: POINTS.sendout },
  client_meeting: { label: 'Client Meeting', emoji: '🤝', points: POINTS.client_meeting },
  candidate_call: { label: 'Candidate Call', emoji: '📞', points: POINTS.candidate_call },
};

// Milestone thresholds (placeholder — confirm with agency, see spec Q3)
export const MILESTONES = {
  sendoutsOnFire: 5,
  sendoutsBlazing: 10,
  monthlyRevenueLow: 10_000,
  monthlyRevenueHigh: 50_000,
};

// TV display rotation
export const SCREEN_DURATION_MS = 30_000;

export const GBP = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
  maximumFractionDigits: 0,
});
