import React from 'react';
import { 
  Users, 
  Flame, 
  Layers, 
  Clock, 
  CheckCircle, 
  Calendar, 
  Plus, 
  BookOpen, 
  GitFork,
  ArrowRight,
  GitCommit,
  UserCheck
} from 'lucide-react';
import { Team, TeamMember, StudyLog } from '../types';
import { StorageService } from '../services/storageService';
import { MissedStudyAlerts } from './MissedStudyAlerts';

interface DashboardViewProps {
  team: Team;
  members: TeamMember[];
  logs: StudyLog[];
  currentUser: TeamMember | null;
  viewMode: 'my' | 'team';
  onToggleViewMode: (mode: 'my' | 'team') => void;
  onOpenLogModal: (memberId?: string) => void;
  onOpenAddMemberModal: () => void;
  onOpenTeamModal: () => void;
  onOpenCalendar: () => void;
  onOpenAnalytics: () => void;
  onSelectMember: (id: string | null) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  team,
  members,
  logs,
  currentUser,
  viewMode,
  onToggleViewMode,
  onOpenLogModal,
  onOpenAddMemberModal,
  onOpenTeamModal,
  onOpenCalendar,
  onOpenAnalytics,
  onSelectMember
}) => {
  const displayedMembers = (viewMode === 'my' && currentUser)
    ? members.filter(m => m.id === currentUser.id)
    : members;

  const displayedLogs = (viewMode === 'my' && currentUser)
    ? logs.filter(l => l.memberId === currentUser.id)
    : logs;

  const memberStatsList = displayedMembers.map(m => StorageService.calculateMemberStats(m, logs));

  const totalStudyHours = Math.round(
    displayedLogs.reduce((acc, l) => acc + l.hours, 0) * 10
  ) / 10;
  const total3HrSessions = displayedLogs.reduce((acc, l) => acc + (l.sessions3Hr || 0), 0);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayLogs = displayedLogs.filter(l => l.date === todayStr);
  const todayHours = Math.round(todayLogs.reduce((acc, l) => acc + l.hours, 0) * 10) / 10;
  const today3HrSessions = todayLogs.reduce((acc, l) => acc + (l.sessions3Hr || 0), 0);

  return (
    <div className="space-y-6">
      
      {/* GitHub Repo Header Card */}
      <div className="gh-card p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full border border-gh-border-default text-gh-fg-muted bg-gh-canvas-default">
                {team.category || 'Study Repository'}
              </span>
              <span className="text-xs text-gh-fg-muted">
                Updated today
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-gh-fg-default tracking-tight">
              {viewMode === 'my' && currentUser ? `${currentUser.name} / study-tracker` : team.name}
            </h1>
            
            <p className="text-xs sm:text-sm text-gh-fg-muted max-w-2xl">
              {team.description || 'Collaborative study logs, 3-hour deep work focus, and consistency tracking.'}
            </p>
          </div>

          {/* GitHub Actions */}
          <div className="flex items-center gap-2 self-start sm:self-center">
            <button
              onClick={() => onOpenLogModal(currentUser?.id)}
              className="gh-btn-primary px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Study</span>
            </button>
            <button
              onClick={onOpenCalendar}
              className="gh-btn-default px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5 text-gh-fg-muted" />
              <span>Calendar</span>
            </button>
          </div>
        </div>

        {/* GitHub Stats Strip */}
        <div className="pt-3 border-t border-gh-border-default grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="flex items-center gap-2 text-gh-fg-muted">
            <Clock className="w-4 h-4 text-gh-fg-muted shrink-0" />
            <div>
              <span className="font-bold text-gh-fg-default">{totalStudyHours} hrs</span>
              <span className="block text-[11px] text-gh-fg-subtle">
                {viewMode === 'my' ? 'My Logged Time' : 'Total Hours'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-gh-fg-muted">
            <Layers className="w-4 h-4 text-gh-success-fg shrink-0" />
            <div>
              <span className="font-bold text-gh-fg-default">{total3HrSessions} sessions</span>
              <span className="block text-[11px] text-gh-fg-subtle">
                ({total3HrSessions * 3}h deep work)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-gh-fg-muted">
            <GitCommit className="w-4 h-4 text-gh-accent-fg shrink-0" />
            <div>
              <span className="font-bold text-gh-fg-default">{todayHours}h today</span>
              <span className="block text-[11px] text-gh-fg-subtle">
                {today3HrSessions}x 3h blocks
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-gh-fg-muted">
            <Flame className="w-4 h-4 text-gh-attention-fg shrink-0" />
            <div>
              <span className="font-bold text-gh-fg-default">
                {memberStatsList.length > 0 ? Math.max(...memberStatsList.map(m => m.currentStreak), 0) : 0} days
              </span>
              <span className="block text-[11px] text-gh-fg-subtle">Active streak</span>
            </div>
          </div>
        </div>
      </div>

      {/* Missed Study Day Notification Banner (GitHub Alert style) */}
      <MissedStudyAlerts
        members={displayedMembers}
        logs={displayedLogs}
        onLogForMember={(memberId) => onOpenLogModal(memberId)}
      />

      {/* Pinned Members / Profiles Section (GitHub Pinned Repositories style) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-gh-fg-default">
            <span>
              {viewMode === 'my' && currentUser ? 'Active Student Profile' : 'Team Members'}
            </span>
            <span className="px-1.5 py-0.2 rounded-full text-xs font-medium bg-gh-canvas-subtle border border-gh-border-default text-gh-fg-muted">
              {displayedMembers.length}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            {currentUser && members.length > 1 && (
              <button
                onClick={() => onToggleViewMode(viewMode === 'my' ? 'team' : 'my')}
                className="text-gh-accent-fg hover:underline font-semibold"
              >
                {viewMode === 'my' ? 'View all team members' : 'View only my profile'}
              </button>
            )}

            <button
              onClick={onOpenAddMemberModal}
              className="gh-btn-primary px-2.5 py-1 rounded text-xs font-semibold shadow-sm inline-flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              <span>Add Member</span>
            </button>

            <button
              onClick={onOpenTeamModal}
              className="text-gh-accent-fg hover:underline font-semibold"
            >
              Manage members
            </button>
          </div>
        </div>

        {/* Member Cards Grid */}
        {displayedMembers.length === 0 ? (
          <div className="gh-card p-12 text-center space-y-3">
            <UserCheck className="w-8 h-8 text-gh-fg-muted mx-auto" />
            <h3 className="text-sm font-bold text-gh-fg-default">
              No Member Profiles Found
            </h3>
            <p className="text-xs text-gh-fg-muted max-w-sm mx-auto">
              Create your profile to start logging daily study hours, 3-hour deep blocks, and topic insights.
            </p>
            <button
              onClick={onOpenTeamModal}
              className="gh-btn-primary px-3 py-1.5 rounded-md text-xs font-semibold shadow-sm inline-flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Profile</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {memberStatsList.map(stats => {
              const isStudiedToday = displayedLogs.some(
                l => l.memberId === stats.memberId && l.date === todayStr && l.hours > 0
              );

              return (
                <div
                  key={stats.memberId}
                  className="gh-card p-4 flex flex-col justify-between hover:border-gh-fg-muted transition group"
                >
                  <div className="space-y-3">
                    
                    {/* Header: Name & Role */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={stats.avatar}
                          alt={stats.memberName}
                          className="w-8 h-8 rounded-full object-cover border border-gh-border-default"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-xs text-gh-accent-fg hover:underline cursor-pointer">
                              {stats.memberName}
                            </span>
                            {currentUser?.id === stats.memberId && (
                              <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded border border-gh-border-default text-gh-fg-muted">
                                You
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-gh-fg-muted block">
                            {stats.role}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-[11px] font-medium text-gh-attention-fg">
                        <Flame className="w-3.5 h-3.5" />
                        <span>{stats.currentStreak}d streak</span>
                      </div>
                    </div>

                    {/* Hours & 3-Hour Sessions */}
                    <div className="grid grid-cols-2 gap-2 p-2 rounded border border-gh-border-muted bg-gh-canvas-default text-xs">
                      <div>
                        <span className="text-[10px] text-gh-fg-subtle block">Hours Studied</span>
                        <span className="font-bold text-gh-fg-default">{stats.totalHours}h</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gh-fg-subtle block">3-Hour Sessions</span>
                        <span className="font-bold text-gh-success-fg flex items-center gap-1">
                          <Layers className="w-3 h-3" />
                          {stats.total3HrSessions}x ({stats.total3HrSessions * 3}h)
                        </span>
                      </div>
                    </div>

                    {/* Topics (GitHub label style pills) */}
                    <div>
                      <span className="text-[10px] text-gh-fg-subtle font-medium block mb-1">
                        Top Topics
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {stats.topTopics.slice(0, 3).map((t, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-full text-[10px] font-medium border border-gh-border-default bg-gh-canvas-default text-gh-fg-muted"
                          >
                            {t.topic} ({t.hours}h)
                          </span>
                        ))}
                        {stats.topTopics.length === 0 && (
                          <span className="text-[10px] text-gh-fg-subtle italic">No study logs yet</span>
                        )}
                      </div>
                    </div>

                  </div>

                  {/* Footer actions */}
                  <div className="pt-3 mt-3 border-t border-gh-border-muted flex items-center justify-between">
                    <button
                      onClick={() => onOpenLogModal(stats.memberId)}
                      className="gh-btn-default px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Log for {stats.memberName.split(' ')[0]}</span>
                    </button>

                    <button
                      onClick={() => {
                        onSelectMember(stats.memberId);
                        onOpenAnalytics();
                      }}
                      className="text-xs text-gh-accent-fg hover:underline flex items-center gap-0.5"
                    >
                      <span>Insights</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

    </div>
  );
};
