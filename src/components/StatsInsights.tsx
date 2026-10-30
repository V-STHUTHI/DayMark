import React, { useState } from 'react';
import { 
  BarChart2, 
  TrendingUp, 
  Award, 
  Flame, 
  Layers, 
  BookOpen, 
  Clock, 
  Brain, 
  AlertCircle,
  Lightbulb,
  Zap,
  Filter
} from 'lucide-react';
import { StudyLog, TeamMember, Team } from '../types';
import { StorageService } from '../services/storageService';

interface StatsInsightsProps {
  team: Team;
  members: TeamMember[];
  logs: StudyLog[];
  activeMemberId: string | null;
  onSelectMember: (id: string | null) => void;
  currentUser?: TeamMember | null;
  viewMode?: 'my' | 'team';
}

export const StatsInsights: React.FC<StatsInsightsProps> = ({
  team,
  members,
  logs,
  activeMemberId,
  onSelectMember,
  currentUser,
  viewMode
}) => {
  const [timeRangeDays, setTimeRangeDays] = useState<number>(14);

  const effectiveMemberId = activeMemberId || (viewMode === 'my' && currentUser ? currentUser.id : null);
  const filteredMembers = effectiveMemberId
    ? members.filter(m => m.id === effectiveMemberId)
    : members;
  const filteredLogs = effectiveMemberId
    ? logs.filter(l => l.memberId === effectiveMemberId)
    : logs;

  const memberStatsList = filteredMembers.map(m =>
    StorageService.calculateMemberStats(m, logs, timeRangeDays)
  );

  const totalStudyHours = Math.round(
    memberStatsList.reduce((acc, m) => acc + m.totalHours, 0) * 10
  ) / 10;
  const total3HrSessions = memberStatsList.reduce((acc, m) => acc + m.total3HrSessions, 0);
  const avgConsistency = memberStatsList.length > 0
    ? Math.round(memberStatsList.reduce((acc, m) => acc + m.consistencyRate, 0) / memberStatsList.length)
    : 0;

  const activeStats = effectiveMemberId
    ? memberStatsList.find(m => m.memberId === effectiveMemberId)
    : null;

  const now = new Date();
  const dateLabels: string[] = [];
  for (let i = timeRangeDays - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    dateLabels.push(d.toISOString().split('T')[0]);
  }

  const dailyData = dateLabels.map(dateStr => {
    const matchingLogs = logs.filter(l => {
      const matchDate = l.date === dateStr;
      const matchMember = effectiveMemberId ? l.memberId === effectiveMemberId : true;
      return matchDate && matchMember;
    });

    const hours = Math.round(matchingLogs.reduce((acc, l) => acc + l.hours, 0) * 10) / 10;
    const sessions3Hr = matchingLogs.reduce((acc, l) => acc + (l.sessions3Hr || 0), 0);
    const dayName = new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });

    return {
      date: dateStr,
      dayName,
      hours,
      sessions3Hr,
      logsCount: matchingLogs.length
    };
  });

  const maxChartHours = Math.max(...dailyData.map(d => d.hours), 8);

  // Topic distribution (GitHub Languages style)
  const topicMap: Record<string, { hours: number; sessions: number }> = {};
  filteredLogs.forEach(l => {
    const hoursEach = l.topics.length > 0 ? l.hours / l.topics.length : l.hours;
    l.topics.forEach(t => {
      const clean = t.trim();
      if (!topicMap[clean]) topicMap[clean] = { hours: 0, sessions: 0 };
      topicMap[clean].hours += hoursEach;
      topicMap[clean].sessions += 1;
    });
  });

  const githubColors = ['#3572A5', '#f1e05a', '#e34c26', '#563d7c', '#2b7489', '#41b883', '#b07219'];

  const sortedTopics = Object.entries(topicMap)
    .map(([topic, val], idx) => ({
      topic,
      hours: Math.round(val.hours * 10) / 10,
      sessions: val.sessions,
      color: githubColors[idx % githubColors.length]
    }))
    .sort((a, b) => b.hours - a.hours)
    .slice(0, 8);

  const totalTopicHours = sortedTopics.reduce((acc, t) => acc + t.hours, 0) || 1;

  // Smart Learning Insights Generator
  const generateInsights = () => {
    const insights: { type: 'success' | 'warning' | 'info'; title: string; text: string; icon: any }[] = [];

    if (filteredLogs.length === 0) {
      insights.push({
        type: 'info',
        title: 'Ready for Your First Study Session',
        text: 'No study logs recorded yet. Once you log your study hours and 3-hour deep work sessions, automated GitHub-style activity metrics and cognitive insights will appear here.',
        icon: Lightbulb
      });
      return insights;
    }

    const deepWorkRatio = totalStudyHours > 0 
      ? Math.round(((total3HrSessions * 3) / totalStudyHours) * 100) 
      : 0;

    if (deepWorkRatio >= 60) {
      insights.push({
        type: 'success',
        title: 'Outstanding Deep Work Ratio',
        text: `${deepWorkRatio}% of total logged study hours took place in dedicated 3-hour deep work sessions! Sustained focus builds long-term retention.`,
        icon: Zap
      });
    } else {
      insights.push({
        type: 'info',
        title: 'Deep Work Recommendation',
        text: `Currently ${deepWorkRatio}% of study time is in 3-hour blocks. Try completing uninterrupted 3-hour deep work blocks for complex concepts.`,
        icon: Layers
      });
    }

    const membersWithStreak = memberStatsList.filter(m => m.currentStreak >= 3);
    if (membersWithStreak.length > 0) {
      insights.push({
        type: 'success',
        title: 'Consistency Streaks',
        text: `${membersWithStreak.map(m => m.memberName).join(', ')} holding 3+ consecutive active study streaks. Keep the green graph alive!`,
        icon: Flame
      });
    }

    if (sortedTopics.length > 0) {
      const topT = sortedTopics[0];
      const dominance = Math.round((topT.hours / totalTopicHours) * 100);
      if (dominance > 50) {
        insights.push({
          type: 'warning',
          title: `High Concentration on ${topT.topic}`,
          text: `"${topT.topic}" represents ${dominance}% of logged time. Consider balancing with other subjects to avoid study burnout.`,
          icon: Lightbulb
        });
      }
    }

    return insights;
  };

  const smartInsights = generateInsights();

  return (
    <div className="space-y-6">
      
      {/* GitHub Insights Header */}
      <div className="gh-card p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full border border-gh-border-default text-gh-fg-muted bg-gh-canvas-default">
                Insights & Pulse
              </span>
              <span className="text-xs text-gh-fg-muted">
                {viewMode === 'my' && currentUser ? `${currentUser.name} (Personal)` : team.name}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gh-fg-default tracking-tight">
              Study Metrics & Learning Velocity
            </h1>
            <p className="text-xs text-gh-fg-muted mt-0.5">
              Track 3-hour deep work blocks, daily activity pulse, topic distributions, and consistency.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
            <select
              aria-label="Filter member"
              value={activeMemberId || ''}
              onChange={(e) => onSelectMember(e.target.value ? e.target.value : null)}
              className="gh-btn-default px-2.5 py-1 rounded-md text-xs font-semibold focus:outline-none cursor-pointer"
            >
              <option value="">{viewMode === 'my' && currentUser ? currentUser.name : 'All Team Members'}</option>
              {members.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.role})
                </option>
              ))}
            </select>

            <div className="inline-flex rounded-md border border-gh-border-default overflow-hidden text-xs font-semibold">
              {[7, 14, 30].map(days => (
                <button
                  key={days}
                  onClick={() => setTimeRangeDays(days)}
                  className={`px-2.5 py-1 transition ${
                    timeRangeDays === days
                      ? 'bg-gh-accent-emphasis text-white font-bold'
                      : 'bg-gh-canvas-subtle text-gh-fg-muted hover:bg-gh-canvas-default'
                  }`}
                >
                  {days}d
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 pt-3 border-t border-gh-border-default text-xs">
          <div className="p-2.5 rounded border border-gh-border-muted bg-gh-canvas-default">
            <span className="text-[11px] text-gh-fg-muted block">Study Hours ({timeRangeDays}d)</span>
            <span className="text-lg font-bold text-gh-fg-default">
              {activeStats ? activeStats.totalHours : totalStudyHours} <span className="text-xs font-normal text-gh-fg-muted">hrs</span>
            </span>
          </div>

          <div className="p-2.5 rounded border border-gh-border-muted bg-gh-canvas-default">
            <span className="text-[11px] text-gh-fg-muted block">3-Hour Deep Work</span>
            <span className="text-lg font-bold text-gh-success-fg">
              {activeStats ? activeStats.total3HrSessions : total3HrSessions}
              <span className="text-xs font-normal text-gh-fg-muted"> sessions ({(activeStats ? activeStats.total3HrSessions : total3HrSessions) * 3}h)</span>
            </span>
          </div>

          <div className="p-2.5 rounded border border-gh-border-muted bg-gh-canvas-default">
            <span className="text-[11px] text-gh-fg-muted block">Current Streak</span>
            <span className="text-lg font-bold text-gh-attention-fg flex items-center gap-1">
              <Flame className="w-4 h-4" />
              <span>
                {activeStats ? activeStats.currentStreak : (memberStatsList.length > 0 ? Math.max(...memberStatsList.map(m => m.currentStreak), 0) : 0)} days
              </span>
            </span>
          </div>

          <div className="p-2.5 rounded border border-gh-border-muted bg-gh-canvas-default">
            <span className="text-[11px] text-gh-fg-muted block">Consistency Rate</span>
            <span className="text-lg font-bold text-gh-fg-default">
              {activeStats ? activeStats.consistencyRate : avgConsistency}%
            </span>
          </div>
        </div>

      </div>

      {/* Main Grid: Bar Chart & Topics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Activity Pulse Chart */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="gh-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gh-fg-default flex items-center gap-1.5">
                  <BarChart2 className="w-4 h-4 text-gh-fg-muted" />
                  Study Velocity Pulse ({timeRangeDays} Days)
                </h3>
                <p className="text-xs text-gh-fg-muted">
                  Daily hours logged with 3-hour deep work session indicators
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs text-gh-fg-muted">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-gh-success-emphasis" />
                  <span>3-Hour Blocks</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-gh-accent-emphasis" />
                  <span>Study Hours</span>
                </span>
              </div>
            </div>

            {/* Custom GitHub Punchcard / Bar Chart */}
            <div className="h-56 flex items-end gap-1.5 pt-6 pb-2 px-2 border-b border-gh-border-muted">
              {dailyData.map((d, idx) => {
                const heightPercent = maxChartHours > 0 ? (d.hours / maxChartHours) * 100 : 0;
                const isMissed = d.hours === 0;

                return (
                  <div
                    key={idx}
                    className="flex-1 flex flex-col items-center h-full justify-end group relative"
                  >
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-30 pointer-events-none">
                      <div className="bg-gh-canvas-subtle border border-gh-border-default text-gh-fg-default text-[11px] rounded p-2 shadow-xl whitespace-nowrap font-mono">
                        <div className="font-bold text-gh-fg-default">{d.date}</div>
                        <div>Hours: {d.hours} hrs</div>
                        <div>3h Sessions: {d.sessions3Hr}</div>
                        {isMissed && <div className="text-gh-danger-fg font-bold">0 hrs logged</div>}
                      </div>
                    </div>

                    {d.hours > 0 && (
                      <span className="text-[10px] text-gh-fg-muted mb-1 font-mono">
                        {d.hours}h
                      </span>
                    )}

                    <div className="w-full max-w-[28px] bg-gh-canvas-default rounded-sm overflow-hidden flex flex-col justify-end relative h-full border border-gh-border-muted">
                      {isMissed ? (
                        <div className="w-full bg-gh-danger-subtle h-2 rounded-t" />
                      ) : (
                        <div
                          className={`w-full rounded-t transition-all ${
                            d.sessions3Hr > 0 ? 'bg-gh-success-emphasis' : 'bg-gh-accent-emphasis'
                          }`}
                          style={{ height: `${Math.max(10, heightPercent)}%` }}
                        />
                      )}
                    </div>

                    <span className="text-[9px] text-gh-fg-subtle mt-1.5 truncate w-full text-center font-mono">
                      {d.dayName.split(',')[0]}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-xs text-gh-fg-muted pt-1">
              <span>{dailyData[0]?.date}</span>
              <span className="text-[11px] text-gh-success-fg font-medium">
                Green bars highlight days containing completed 3-hour deep focus blocks
              </span>
              <span>Today</span>
            </div>
          </div>

          {/* GitHub Language Bar Style: Topics Distribution */}
          <div className="gh-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gh-fg-default flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-gh-fg-muted" />
                  Topics & Subjects Breakdown
                </h3>
                <p className="text-xs text-gh-fg-muted">
                  Time allocation across topics (styled like GitHub repository languages)
                </p>
              </div>

              <span className="text-xs font-semibold px-2 py-0.5 rounded-full border border-gh-border-default bg-gh-canvas-default text-gh-fg-muted">
                {sortedTopics.length} Topics
              </span>
            </div>

            {sortedTopics.length === 0 ? (
              <div className="py-8 text-center text-xs text-gh-fg-muted">
                No topics recorded yet. Log a study session with topic tags to view the breakdown.
              </div>
            ) : (
              <div className="space-y-3">
                {/* Multi-segment Progress Bar like GitHub */}
                <div className="h-2.5 w-full rounded-full overflow-hidden flex bg-gh-canvas-default border border-gh-border-muted">
                  {sortedTopics.map((t, idx) => {
                    const percent = Math.round((t.hours / totalTopicHours) * 100);
                    if (percent <= 0) return null;
                    return (
                      <div
                        key={idx}
                        style={{ width: `${percent}%`, backgroundColor: t.color }}
                        title={`${t.topic}: ${percent}% (${t.hours} hrs)`}
                        className="h-full transition-all"
                      />
                    );
                  })}
                </div>

                {/* Legend list */}
                <div className="flex flex-wrap gap-x-4 gap-y-2 pt-1 text-xs">
                  {sortedTopics.map((t, idx) => {
                    const percent = Math.round((t.hours / totalTopicHours) * 100);
                    return (
                      <div key={idx} className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: t.color }} />
                        <span className="font-semibold text-gh-fg-default">{t.topic}</span>
                        <span className="text-gh-fg-muted font-mono">{percent}%</span>
                        <span className="text-[11px] text-gh-fg-subtle">({t.hours}h)</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Right Col: GitHub Advisories / Recommendations & Collaborators */}
        <div className="space-y-6">
          
          {/* GitHub Learning Advisories */}
          <div className="gh-card p-4 space-y-3">
            <h3 className="text-sm font-bold text-gh-fg-default flex items-center gap-1.5 pb-2 border-b border-gh-border-muted">
              <Brain className="w-4 h-4 text-gh-fg-muted" />
              <span>Learning Insights</span>
            </h3>

            <div className="space-y-2.5">
              {smartInsights.map((ins, i) => {
                const IconComponent = ins.icon;
                return (
                  <div
                    key={i}
                    className={`p-3 rounded border text-xs space-y-1 ${
                      ins.type === 'success'
                        ? 'border-gh-success-muted bg-gh-success-subtle text-gh-success-fg'
                        : ins.type === 'warning'
                        ? 'border-gh-attention-muted bg-gh-attention-subtle text-gh-attention-fg'
                        : 'border-gh-border-default bg-gh-canvas-default text-gh-fg-default'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold">
                      <IconComponent className="w-4 h-4 shrink-0" />
                      <span>{ins.title}</span>
                    </div>
                    <p className="opacity-90 font-normal leading-relaxed text-[11px]">
                      {ins.text}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Collaborator Leaderboard */}
          <div className="gh-card p-4 space-y-3">
            <h3 className="text-sm font-bold text-gh-fg-default flex items-center gap-1.5 pb-2 border-b border-gh-border-muted">
              <Award className="w-4 h-4 text-gh-attention-fg" />
              <span>Collaborators & Streaks</span>
            </h3>

            {memberStatsList.length === 0 ? (
              <div className="text-xs text-gh-fg-muted text-center py-4">
                No active members.
              </div>
            ) : (
              <div className="space-y-2">
                {[...memberStatsList]
                  .sort((a, b) => b.totalHours - a.totalHours)
                  .map((m, rank) => (
                    <div
                      key={m.memberId}
                      onClick={() => onSelectMember(m.memberId)}
                      className="p-2.5 rounded border border-gh-border-muted bg-gh-canvas-default hover:border-gh-border-default cursor-pointer transition flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-gh-fg-muted w-4">{rank + 1}.</span>
                        <img
                          src={m.avatar}
                          alt={m.memberName}
                          className="w-6 h-6 rounded-full object-cover border border-gh-border-muted"
                        />
                        <div>
                          <span className="font-semibold text-gh-fg-default hover:text-gh-accent-fg block">
                            {m.memberName}
                          </span>
                          <span className="text-[10px] text-gh-fg-muted">
                            {m.currentStreak}d streak • {m.total3HrSessions}x 3h
                          </span>
                        </div>
                      </div>

                      <div className="text-right font-mono font-bold text-gh-fg-default">
                        {m.totalHours}h
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
