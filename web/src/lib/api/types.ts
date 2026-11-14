export type FocusRole = "developer" | "qa" | "devops" | "analyst" | "manager" | "other";
export type FocusGoal = "daily_work" | "interview" | "docs";

export type User = {
  id: number;
  email: string;
  name: string;
  role: "user" | "admin";
  level: "beginner" | "elementary" | "intermediate" | null;
  daily_goal_minutes: 5 | 10 | 15;
  time_zone: string;
  onboarded: boolean;
  email_verified: boolean;
  reminder_hour: number | null;
  new_words_per_day: number | null;
  push_devices: number;
  focus_role: FocusRole | null;
  focus_goal: FocusGoal | null;
  created_at: string;
};

export type Meta = { page: number; per_page: number; total: number; total_pages: number };
export type Paginated<T> = { data: T[]; meta: Meta };
