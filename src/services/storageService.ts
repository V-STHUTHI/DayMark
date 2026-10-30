import { Team, TeamMember, StudyLog, StudyNotification, MemberStats } from '../types';

const STORAGE_KEYS = {
  TEAMS: 'studysync_v2_teams',
  MEMBERS: 'studysync_v2_members',
  LOGS: 'studysync_v2_logs',
  NOTIFICATIONS: 'studysync_v2_notifications',
  ACTIVE_TEAM: 'studysync_v2_active_team',
  CURRENT_USER: 'studysync_v2_current_user',
};

// Purge any legacy demo data from localStorage on first run
try {
  localStorage.removeItem('studysync_teams_v1');
  localStorage.removeItem('studysync_members_v1');
  localStorage.removeItem('studysync_logs_v1');
  localStorage.removeItem('studysync_notifications_v1');
  localStorage.removeItem('studysync_active_team_v1');
  localStorage.removeItem('studysync_active_member_v1');
} catch {
  // ignore in SSR / restricted storage
}

export class StorageService {
  // Current Logged-in User
  static getCurrentUser(): TeamMember | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  static setCurrentUser(member: TeamMember | null): void {
    if (member) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(member));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  }

  // Load teams
  static getTeams(): Team[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TEAMS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static saveTeams(teams: Team[]): void {
    localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(teams));
  }

  static addTeam(team: Team): void {
    const teams = this.getTeams();
    teams.push(team);
    this.saveTeams(teams);
  }

  static updateTeam(team: Team): void {
    const teams = this.getTeams().map(t => (t.id === team.id ? team : t));
    this.saveTeams(teams);
  }

  static deleteTeam(teamId: string): void {
    const teams = this.getTeams().filter(t => t.id !== teamId);
    this.saveTeams(teams);
    const members = this.getMembers().filter(m => m.teamId !== teamId);
    this.saveMembers(members);
    const logs = this.getLogs().filter(l => l.teamId !== teamId);
    this.saveLogs(logs);

    // If current user belonged to deleted team, log out
    const currentUser = this.getCurrentUser();
    if (currentUser && currentUser.teamId === teamId) {
      this.setCurrentUser(null);
    }
  }

  // Members
  static getMembers(teamId?: string): TeamMember[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MEMBERS);
      const members: TeamMember[] = data ? JSON.parse(data) : [];
      return teamId ? members.filter(m => m.teamId === teamId) : members;
    } catch {
      return [];
    }
  }

  static saveMembers(members: TeamMember[]): void {
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
  }

  static addMember(member: TeamMember): void {
    const members = this.getMembers();
    members.push(member);
    this.saveMembers(members);
  }

  static updateMember(member: TeamMember): void {
    const members = this.getMembers().map(m => (m.id === member.id ? member : m));
    this.saveMembers(members);
    // If updated member is current user, update session
    const cur = this.getCurrentUser();
    if (cur && cur.id === member.id) {
      this.setCurrentUser(member);
    }
  }

  static deleteMember(memberId: string): void {
    const members = this.getMembers().filter(m => m.id !== memberId);
    this.saveMembers(members);
    const logs = this.getLogs().filter(l => l.memberId !== memberId);
    this.saveLogs(logs);

    const cur = this.getCurrentUser();
    if (cur && cur.id === memberId) {
      this.setCurrentUser(null);
    }
  }

  // Logs
  static getLogs(teamId?: string, memberId?: string): StudyLog[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LOGS);
      let logs: StudyLog[] = data ? JSON.parse(data) : [];
      if (teamId) logs = logs.filter(l => l.teamId === teamId);
      if (memberId) logs = logs.filter(l => l.memberId === memberId);
      return logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch {
      return [];
    }
  }

  static saveLogs(logs: StudyLog[]): void {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
  }

  // Add or update study log
  static logStudy(log: StudyLog): void {
    const logs = this.getLogs();
    const existingIndex = logs.findIndex(
      l => l.memberId === log.memberId && l.date === log.date
    );

    if (existingIndex >= 0) {
      logs[existingIndex] = {
        ...logs[existingIndex],
        ...log,
        id: logs[existingIndex].id
      };
    } else {
      logs.unshift(log);
    }
    this.saveLogs(logs);
  }

  static updateLog(log: StudyLog): void {
    const logs = this.getLogs().map(existingLog =>
      existingLog.id === log.id ? log : existingLog
    );
    this.saveLogs(logs);
  }

  static deleteLog(logId: string): void {
    const logs = this.getLogs().filter(l => l.id !== logId);
    this.saveLogs(logs);
  }

  // Active Team ID
  static getActiveTeamId(): string | null {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_TEAM);
  }

  static setActiveTeamId(id: string): void {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_TEAM, id);
  }

  // Notifications
  static getNotifications(): StudyNotification[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static saveNotifications(notifications: StudyNotification[]): void {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }

  static markNotificationRead(id: string): void {
    const notifications = this.getNotifications().map(n =>
      n.id === id ? { ...n, read: true } : n
    );
    this.saveNotifications(notifications);
  }

  static markAllNotificationsRead(): void {
    const notifications = this.getNotifications().map(n => ({ ...n, read: true }));
    this.saveNotifications(notifications);
  }

  // Automated Missed Study Checker
  // Only flags missed study if a member exists and their join date is on or before that date!
  static checkMissedStudyAlerts(teamId: string, targetMemberId?: string): StudyNotification[] {
    const allMembers = this.getMembers(teamId);
    const members = targetMemberId ? allMembers.filter(m => m.id === targetMemberId) : allMembers;
    if (members.length === 0) return [];

    const logs = this.getLogs(teamId);
    const existingNotifications = this.getNotifications();
    const newNotifications: StudyNotification[] = [...existingNotifications];

    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    members.forEach(member => {
      const memberLogs = logs.filter(l => l.memberId === member.id);
      const studiedYesterday = memberLogs.some(l => l.date === yesterdayStr && l.hours > 0);
      const studiedToday = memberLogs.some(l => l.date === todayStr && l.hours > 0);

      const joinDateStr = (member.joinedAt || '').split('T')[0];

      // Check yesterday's miss (only if member joined on or before yesterday)
      if (joinDateStr <= yesterdayStr) {
        const notifIdYesterday = `missed_${member.id}_${yesterdayStr}`;
        if (!studiedYesterday && !newNotifications.some(n => n.id === notifIdYesterday)) {
          newNotifications.unshift({
            id: notifIdYesterday,
            memberId: member.id,
            memberName: member.name,
            date: yesterdayStr,
            type: 'missed_day',
            title: `Missed Study Day: ${member.name}`,
            message: `${member.name} did not log study hours yesterday (${yesterdayStr}).`,
            timestamp: new Date().toISOString(),
            read: false
          });
        }
      }

      // Check today status: If today has no log yet
      const notifIdToday = `today_pending_${member.id}_${todayStr}`;
      if (!studiedToday && !newNotifications.some(n => n.id === notifIdToday)) {
        newNotifications.unshift({
          id: notifIdToday,
          memberId: member.id,
          memberName: member.name,
          date: todayStr,
          type: 'streak_risk',
          title: `Study Reminder Today`,
          message: `${member.name} has not logged study sessions for today yet. Stay consistent!`,
          timestamp: new Date().toISOString(),
          read: false
        });
      }

      // 3-Hour Deep Work Milestone
      const total3HrSessions = memberLogs.reduce((acc, l) => acc + (l.sessions3Hr || 0), 0);
      if (total3HrSessions > 0 && total3HrSessions % 5 === 0) {
        const champNotifId = `deep_work_champ_${member.id}_${total3HrSessions}`;
        if (!newNotifications.some(n => n.id === champNotifId)) {
          newNotifications.unshift({
            id: champNotifId,
            memberId: member.id,
            memberName: member.name,
            date: todayStr,
            type: 'deep_work_champ',
            title: `Deep Work Milestone! 🎯`,
            message: `Congratulations to ${member.name}! Reached ${total3HrSessions} deep 3-hour study blocks!`,
            timestamp: new Date().toISOString(),
            read: false
          });
        }
      }
    });

    this.saveNotifications(newNotifications);
    return newNotifications;
  }

  // Calculate member stats safely
  static calculateMemberStats(member: TeamMember, logs: StudyLog[], daysSpan = 30): MemberStats {
    const memberLogs = logs.filter(l => l.memberId === member.id);
    const totalHours = memberLogs.reduce((acc, l) => acc + l.hours, 0);
    const total3HrSessions = memberLogs.reduce((acc, l) => acc + (l.sessions3Hr || 0), 0);

    const topicMap: Record<string, { count: number; hours: number }> = {};
    memberLogs.forEach(l => {
      const hoursPerTopic = l.topics.length > 0 ? l.hours / l.topics.length : l.hours;
      l.topics.forEach(t => {
        const key = t.trim();
        if (!topicMap[key]) topicMap[key] = { count: 0, hours: 0 };
        topicMap[key].count += 1;
        topicMap[key].hours += hoursPerTopic;
      });
    });

    const topTopics = Object.entries(topicMap)
      .map(([topic, data]) => ({
        topic,
        count: data.count,
        hours: Math.round(data.hours * 10) / 10
      }))
      .sort((a, b) => b.hours - a.hours);

    const dateHoursMap: Record<string, number> = {};
    memberLogs.forEach(l => {
      dateHoursMap[l.date] = (dateHoursMap[l.date] || 0) + l.hours;
    });

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const startDateForCurrentStreak = (dateHoursMap[todayStr] && dateHoursMap[todayStr] > 0)
      ? now
      : yesterday;

    const cursor = new Date(startDateForCurrentStreak);
    while (true) {
      const dStr = cursor.toISOString().split('T')[0];
      if (dateHoursMap[dStr] && dateHoursMap[dStr] > 0) {
        currentStreak++;
        cursor.setDate(cursor.getDate() - 1);
      } else {
        break;
      }
    }

    for (let i = daysSpan; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      if (dateHoursMap[dStr] && dateHoursMap[dStr] > 0) {
        tempStreak++;
        if (tempStreak > longestStreak) longestStreak = tempStreak;
      } else {
        tempStreak = 0;
      }
    }

    let studiedDaysCount = 0;
    let missedDaysCount = 0;
    for (let i = 1; i <= 14; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      if (dateHoursMap[dStr] && dateHoursMap[dStr] > 0) {
        studiedDaysCount++;
      } else if ((member.joinedAt || '').split('T')[0] <= dStr) {
        missedDaysCount++;
      }
    }

    const pastDaysTracked = studiedDaysCount + missedDaysCount;
    const consistencyRate = pastDaysTracked > 0 ? Math.round((studiedDaysCount / pastDaysTracked) * 100) : 100;
    const averageDailyHours = Math.round((totalHours / (studiedDaysCount || 1)) * 10) / 10;

    const sortedDates = Object.keys(dateHoursMap).sort().reverse();
    const lastStudyDate = sortedDates[0];

    return {
      memberId: member.id,
      memberName: member.name,
      avatar: member.avatar,
      color: member.color,
      role: member.role,
      totalHours: Math.round(totalHours * 10) / 10,
      totalLogs: memberLogs.length,
      total3HrSessions,
      currentStreak,
      longestStreak,
      averageDailyHours,
      consistencyRate,
      missedDaysCount,
      studiedDaysCount,
      topTopics,
      lastStudyDate
    };
  }

  // Backup & Restore
  static exportData(): string {
    const data = {
      teams: this.getTeams(),
      members: this.getMembers(),
      logs: this.getLogs(),
      notifications: this.getNotifications(),
      exportedAt: new Date().toISOString()
    };
    return JSON.stringify(data, null, 2);
  }

  static importData(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.teams) this.saveTeams(data.teams);
      if (data.members) this.saveMembers(data.members);
      if (data.logs) this.saveLogs(data.logs);
      if (data.notifications) this.saveNotifications(data.notifications);
      return true;
    } catch {
      return false;
    }
  }

  static clearAllData(): void {
    localStorage.removeItem(STORAGE_KEYS.TEAMS);
    localStorage.removeItem(STORAGE_KEYS.MEMBERS);
    localStorage.removeItem(STORAGE_KEYS.LOGS);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_TEAM);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
}
