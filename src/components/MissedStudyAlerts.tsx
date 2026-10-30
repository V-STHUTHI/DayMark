import React from 'react';
import { AlertTriangle, Clock, PlusCircle } from 'lucide-react';
import { TeamMember, StudyLog } from '../types';

interface MissedStudyAlertsProps {
  members: TeamMember[];
  logs: StudyLog[];
  onLogForMember: (memberId: string, date: string) => void;
}

export const MissedStudyAlerts: React.FC<MissedStudyAlertsProps> = ({
  members,
  logs,
  onLogForMember
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (members.length === 0) return null;

  // Find members who missed studying yesterday (only if already joined by yesterday)
  const missedYesterday = members.filter(m => {
    const joinDate = (m.joinedAt || '').split('T')[0];
    const wasJoined = !joinDate || joinDate <= yesterdayStr;
    const hasLog = logs.some(l => l.memberId === m.id && l.date === yesterdayStr && l.hours > 0);
    return wasJoined && !hasLog;
  });

  // Find members who haven't logged today
  const pendingToday = members.filter(m => {
    const hasLog = logs.some(l => l.memberId === m.id && l.date === todayStr && l.hours > 0);
    return !hasLog;
  });

  if (missedYesterday.length === 0 && pendingToday.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2.5">
      {/* Yesterday Missed Alert Banner (GitHub Danger Banner style) */}
      {missedYesterday.length > 0 && (
        <div className="rounded-md border border-gh-danger-muted bg-gh-danger-subtle p-3 text-xs text-gh-danger-fg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">
                  Missed Study Alert: {missedYesterday.length} {missedYesterday.length === 1 ? 'member' : 'members'} missed yesterday ({yesterdayStr})
                </span>
                <p className="text-[11px] opacity-90 mt-0.5">
                  No study hours logged yesterday. Catch up to keep your streak intact:
                </p>

                <div className="flex flex-wrap gap-2 mt-1.5">
                  {missedYesterday.map(m => (
                    <button
                      key={m.id}
                      onClick={() => onLogForMember(m.id, yesterdayStr)}
                      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded border border-gh-danger-muted bg-gh-canvas-default text-gh-danger-fg font-semibold hover:bg-gh-danger-subtle transition"
                    >
                      <PlusCircle className="w-3 h-3" />
                      <span>Log Catch-Up for {m.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Today Pending Study Notification (GitHub Warning Banner style) */}
      {pendingToday.length > 0 && (
        <div className="rounded-md border border-gh-attention-muted bg-gh-attention-subtle p-3 text-xs text-gh-attention-fg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-start gap-2.5">
              <Clock className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">
                  Today's Study Pending ({todayStr})
                </span>
                <span className="text-[11px] opacity-90 block mt-0.5">
                  {pendingToday.map(p => p.name.split(' ')[0]).join(', ')} haven't logged today's study sessions yet.
                </span>

                <div className="flex flex-wrap gap-2 mt-1.5">
                  {pendingToday.map(m => (
                    <button
                      key={m.id}
                      onClick={() => onLogForMember(m.id, todayStr)}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-gh-attention-muted bg-gh-canvas-default text-gh-attention-fg font-semibold hover:bg-gh-attention-subtle transition"
                    >
                      <PlusCircle className="w-3 h-3" />
                      <span>Log Today for {m.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
