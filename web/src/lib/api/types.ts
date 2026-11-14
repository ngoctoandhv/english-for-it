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
  created_at: string;
};

export type Meta = { page: number; per_page: number; total: number; total_pages: number };
export type Paginated<T> = { data: T[]; meta: Meta };
