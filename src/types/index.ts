export type Role = 'guide' | 'youth';
export type AttendanceStatus = 'confirmed' | 'cancelled';
export type CalendarView = 'month' | 'week' | 'day';

export interface Profile {
  id: string;
  client_id: string;
  full_name: string;
  role: Role;
  approved: boolean;
  group_id: string | null;
  created_at: string;
}

export interface Group {
  id: string;
  name: string;
  age_range: string | null;
  color: string;
  created_at: string;
}

export interface Activity {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  location: string | null;
  group_ids: string[];
  color: string;
  created_by: string;
  created_at: string;
}

export interface Attendance {
  id: string;
  profile_id: string;
  activity_id: string;
  status: AttendanceStatus;
  created_at: string;
}

export interface PublicLink {
  id: string;
  token: string;
  created_by: string;
  created_at: string;
}
