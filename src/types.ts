export interface Team {
  id: string;
  name: string;
  description: string;
  category: string;
  createdAt: string;
  weeklyTargetHours: number;
  mode?: 'solo' | 'team';
}

export interface TeamMember {
  id: string;
  teamId: string;
  name: string;
  role: string;
  avatar: string;
  color: string;
  dailyGoalHours: number;
  joinedAt: string;
}

export interface StudyLog {
  id: string;
  teamId: string;
  memberId: string;
  date: string; // YYYY-MM-DD
  hours: number; // e.g. 4.5
  topics: string[]; // ["Mathematics", "Calculus"]
  sessions3Hr: number; // Number of 3-hr deep work blocks completed
  focusScore?: number; // 1 to 5 scale
  notes?: string;
  createdAt: string;
}

export interface StudyNotification {
  id: string;
  memberId: string;
  memberName: string;
  date: string;
  type: 'missed_day' | 'streak_risk' | 'milestone' | 'deep_work_champ';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface MemberStats {
  memberId: string;
  memberName: string;
  avatar: string;
  color: string;
  role: string;
  totalHours: number;
  totalLogs: number;
  total3HrSessions: number;
  currentStreak: number;
  longestStreak: number;
  averageDailyHours: number;
  consistencyRate: number; // percentage of days with > 0 hrs
  missedDaysCount: number;
  studiedDaysCount: number;
  topTopics: { topic: string; count: number; hours: number }[];
  lastStudyDate?: string;
}
