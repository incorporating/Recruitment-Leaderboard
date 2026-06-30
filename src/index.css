// Shared application types

export type Role = 'consultant' | 'admin';
export type ActivityType = 'sendout' | 'client_meeting' | 'candidate_call';
export type ActivitySource = 'manual' | 'bullhorn';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: Role;
  is_active: boolean;
  avatar_url: string | null;
  created_at: string;
}

export interface Activity {
  id: string;
  user_id: string;
  type: ActivityType;
  activity_date: string; // ISO date
  source: ActivitySource;
  bullhorn_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface RevenueEntry {
  id: string;
  user_id: string;
  amount: number;
  invoice_date: string; // ISO date
  description: string | null;
  created_at: string;
  updated_at: string;
}

// Leaderboard view row shapes
export interface KpiLeaderboardRow {
  id: string;
  full_name: string;
  sendouts: number;
  client_meetings: number;
  candidate_calls: number;
  total_points: number;
}

export interface RevenueLeaderboardRow {
  id: string;
  full_name: string;
  total_revenue: number;
}
