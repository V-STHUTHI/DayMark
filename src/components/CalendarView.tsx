import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  AlertTriangle, 
  CheckCircle, 
  Layers, 
  Plus, 
  Clock, 
  Info,
  Filter
} from 'lucide-react';
import { StudyLog, TeamMember } from '../types';

interface CalendarViewProps {
  logs: StudyLog[];
  members: TeamMember[];
  activeMemberId: string | null;
  onSelectMember: (id: string | null) => void;
  onOpenLogModalForDate: (date: string, memberId?: string) => void;
  currentUser?: TeamMember | null;
  viewMode?: 'my' | 'team';
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  logs,
  members,
  activeMemberId,
  onSelectMember,
  onOpenLogModalForDate,
  currentUser,
  viewMode
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDayDetails, setSelectedDayDetails] = useState<{
    dateStr: string;
    dayLogs: StudyLog[];
    missedMembers: TeamMember[];
  } | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => setCurrentDate(new Date());

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayStr = new Date().toISOString().split('T')[0];

  const effectiveMemberId = activeMemberId || (viewMode === 'my' && currentUser ? currentUser.id : null);
  const visibleMembers = effectiveMemberId 
    ? members.filter(m => m.id === effectiveMemberId)
    : members;

  const monthLogs = logs.filter(l => {
    const d = new Date(l.date);
    const matchesMonth = d.getFullYear() === year && d.getMonth() === month;
    const matchesMember = effectiveMemberId ? l.memberId === effectiveMemberId : true;
    return matchesMonth && matchesMember;
  });

  let totalMonthHours = 0;
  let totalMonth3HrSessions = 0;
  const daysWithStudySet = new Set<string>();

  monthLogs.forEach(l => {
    totalMonthHours += l.hours;
    totalMonth3HrSessions += l.sessions3Hr || 0;
    if (l.hours > 0) daysWithStudySet.add(l.date);
  });

  let pastDaysInMonthCount = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(year, month, d);
    const dateStr = dateObj.toISOString().split('T')[0];
    if (dateStr <= todayStr) {
      const anyJoined = visibleMembers.some(m => {
        const j = (m.joinedAt || '').split('T')[0];
        return !j || j <= dateStr;
      });
      if (anyJoined) {
        pastDaysInMonthCount++;
      }
    }
  }

  const daysStudied = daysWithStudySet.size;
  const daysMissed = Math.max(0, pastDaysInMonthCount - daysStudied);
  const consistencyPercent = pastDaysInMonthCount > 0 
    ? Math.round((daysStudied / pastDaysInMonthCount) * 100) 
    : 100;

  return (
    <div className="space-y-4">
      
      {/* Top Header Card */}
      <div className="gh-card p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          <div className="flex items-center gap-2.5">
            <CalendarIcon className="w-5 h-5 text-gh-fg-muted" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-gh-fg-default">
                  Study Contributions & Calendar
                </h1>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full border border-gh-border-default text-gh-fg-muted bg-gh-canvas-default">
                  {monthNames[month]} {year}
                </span>
              </div>
              <p className="text-xs text-gh-fg-muted">
                Track study days, 3-hour deep work blocks, and detect missed days.
              </p>
            </div>
          </div>

          {/* Member Filter and Month Navigators */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Member selector */}
            <div className="flex items-center gap-1.5 gh-btn-default px-2.5 py-1 rounded-md text-xs">
              <Filter className="w-3.5 h-3.5 text-gh-fg-muted" />
              <select
                aria-label="Filter calendar by member"
                value={activeMemberId || ''}
                onChange={(e) => onSelectMember(e.target.value ? e.target.value : null)}
                className="bg-transparent text-gh-fg-default focus:outline-none cursor-pointer font-medium"
              >
                <option value="" className="bg-gh-canvas-subtle">All Members</option>
                {members.map(m => (
                  <option key={m.id} value={m.id} className="bg-gh-canvas-subtle">
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center gap-1 border border-gh-border-default rounded-md overflow-hidden">
              <button
                onClick={prevMonth}
                aria-label="Previous month"
                className="p-1 hover:bg-gh-canvas-default text-gh-fg-muted transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={goToToday}
                className="px-2 py-1 text-xs font-semibold text-gh-fg-default hover:bg-gh-canvas-default transition"
              >
                Today
              </button>
              <button
                onClick={nextMonth}
                aria-label="Next month"
                className="p-1 hover:bg-gh-canvas-default text-gh-fg-muted transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>

        {/* Monthly Summary Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 pt-3 border-t border-gh-border-default text-xs">
          <div className="p-2.5 rounded border border-gh-border-muted bg-gh-canvas-default">
            <span className="text-[11px] text-gh-fg-muted block">Total Hours</span>
            <span className="text-base font-bold text-gh-fg-default">
              {Math.round(totalMonthHours * 10) / 10} <span className="text-xs font-normal text-gh-fg-muted">hrs</span>
            </span>
          </div>

          <div className="p-2.5 rounded border border-gh-border-muted bg-gh-canvas-default">
            <span className="text-[11px] text-gh-fg-muted block">3-Hour Deep Blocks</span>
            <span className="text-base font-bold text-gh-success-fg">
              {totalMonth3HrSessions} <span className="text-xs font-normal text-gh-fg-muted">({totalMonth3HrSessions * 3}h)</span>
            </span>
          </div>

          <div className="p-2.5 rounded border border-gh-border-muted bg-gh-canvas-default">
            <span className="text-[11px] text-gh-fg-muted block">Studied Days</span>
            <span className="text-base font-bold text-gh-fg-default">
              {daysStudied} <span className="text-xs font-normal text-gh-fg-muted">days</span>
            </span>
          </div>

          <div className={`p-2.5 rounded border ${
            daysMissed > 0 
              ? 'border-gh-danger-muted bg-gh-danger-subtle text-gh-danger-fg' 
              : 'border-gh-border-muted bg-gh-canvas-default text-gh-fg-default'
          }`}>
            <span className="text-[11px] opacity-80 block">Missed Days Alert</span>
            <span className="text-base font-bold">
              {daysMissed} <span className="text-xs font-normal opacity-80">({consistencyPercent}%)</span>
            </span>
          </div>
        </div>

      </div>

      {/* GitHub Calendar Grid Container */}
      <div className="gh-card overflow-hidden">
        
        {/* Days of week header */}
        <div className="grid grid-cols-7 border-b border-gh-border-default bg-gh-canvas-subtle text-center py-2 text-xs font-semibold text-gh-fg-muted">
          <span>Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
        </div>

        {/* Days cells */}
        <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-gh-border-muted bg-gh-canvas-default">
          
          {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
            <div key={`empty-${idx}`} className="min-h-[105px] bg-gh-canvas-subtle/50 p-2 opacity-40" />
          ))}

          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const dayNum = idx + 1;
            const dateObj = new Date(year, month, dayNum);
            const dateStr = dateObj.toISOString().split('T')[0];
            const isToday = dateStr === todayStr;
            const isPast = dateStr < todayStr;
            const isFuture = dateStr > todayStr;

            const dayLogs = logs.filter(l => {
              const matchesDate = l.date === dateStr;
              const matchesMember = effectiveMemberId ? l.memberId === effectiveMemberId : true;
              return matchesDate && matchesMember;
            });

            const dayHours = dayLogs.reduce((sum, l) => sum + l.hours, 0);
            const day3HrSessions = dayLogs.reduce((sum, l) => sum + (l.sessions3Hr || 0), 0);
            const hasStudy = dayHours > 0;

            const missedMembers = isPast
              ? visibleMembers.filter(m => {
                  const joinDate = (m.joinedAt || '').split('T')[0];
                  const wasJoined = !joinDate || joinDate <= dateStr;
                  const hasLog = logs.some(l => l.memberId === m.id && l.date === dateStr && l.hours > 0);
                  return wasJoined && !hasLog;
                })
              : [];

            const isMissedDay = isPast && missedMembers.length > 0 && !hasStudy;

            // GitHub Contribution Cell Background
            let cellBgClass = 'bg-gh-canvas-default';
            if (hasStudy) {
              if (day3HrSessions >= 2 || dayHours >= 6) {
                cellBgClass = 'bg-gh-cell-4';
              } else if (day3HrSessions >= 1 || dayHours >= 3) {
                cellBgClass = 'bg-gh-cell-3';
              } else {
                cellBgClass = 'bg-gh-cell-2';
              }
            } else if (isMissedDay) {
              cellBgClass = 'bg-gh-danger-subtle';
            }

            return (
              <div
                key={dateStr}
                onClick={() => {
                  setSelectedDayDetails({ dateStr, dayLogs, missedMembers });
                }}
                className={`min-h-[110px] p-2 transition relative flex flex-col justify-between cursor-pointer group hover:brightness-105 ${
                  isToday 
                    ? 'ring-2 ring-gh-accent-fg ring-inset' 
                    : isMissedDay
                    ? 'bg-gh-danger-subtle/50'
                    : 'bg-gh-canvas-default'
                }`}
              >
                {/* Date header line */}
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-semibold rounded px-1.5 py-0.5 ${
                    isToday
                      ? 'bg-gh-accent-emphasis text-white font-bold'
                      : isMissedDay
                      ? 'text-gh-danger-fg font-bold'
                      : 'text-gh-fg-default'
                  }`}>
                    {dayNum}
                  </span>

                  {/* GitHub Style Contribution Box Badge */}
                  {hasStudy ? (
                    <span 
                      className={`w-3.5 h-3.5 rounded-sm border border-gh-border-default/40 ${cellBgClass}`}
                      title={`${dayHours} hrs logged (${day3HrSessions}x 3h sessions)`}
                    />
                  ) : isMissedDay ? (
                    <span 
                      title="Missed Study Day: 0 hours logged!"
                      className="text-[10px] font-bold px-1 rounded text-gh-danger-fg bg-gh-danger-subtle border border-gh-danger-muted flex items-center gap-0.5"
                    >
                      <AlertTriangle className="w-2.5 h-2.5" />
                      0h
                    </span>
                  ) : null}
                </div>

                {/* Day Content */}
                <div className="my-1 space-y-1 overflow-hidden">
                  {hasStudy ? (
                    <>
                      <div className="text-[11px] font-bold text-gh-fg-default flex items-center justify-between">
                        <span>{dayHours} hrs</span>
                        {day3HrSessions > 0 && (
                          <span className="text-[10px] font-semibold text-gh-success-fg flex items-center gap-0.5">
                            <Layers className="w-2.5 h-2.5" />
                            {day3HrSessions}x 3h
                          </span>
                        )}
                      </div>

                      <div className="space-y-0.5">
                        {dayLogs.slice(0, 2).map((l, lIdx) => (
                          <div
                            key={lIdx}
                            className="text-[10px] truncate text-gh-fg-muted font-mono"
                          >
                            • {l.topics[0] || 'Study'}
                          </div>
                        ))}
                      </div>
                    </>
                  ) : isMissedDay ? (
                    <div className="p-1 rounded text-[10px] text-gh-danger-fg font-medium">
                      ⚠️ Missed study day
                    </div>
                  ) : isToday ? (
                    <div className="text-[10px] text-gh-fg-subtle italic">
                      Today
                    </div>
                  ) : null}
                </div>

                {/* Bottom Quick Action: Log */}
                {!isFuture && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenLogModalForDate(dateStr, effectiveMemberId || undefined);
                    }}
                    title="Log study for this day"
                    className="opacity-0 group-hover:opacity-100 transition-opacity w-full text-[10px] font-semibold py-0.5 rounded gh-btn-default flex items-center justify-center gap-0.5"
                  >
                    <Plus className="w-2.5 h-2.5" />
                    <span>Log</span>
                  </button>
                )}

              </div>
            );
          })}

        </div>

      </div>

      {/* GitHub Contribution Heatmap Legend */}
      <div className="gh-card p-3 flex flex-wrap items-center justify-between gap-3 text-xs text-gh-fg-muted">
        <div className="flex items-center gap-2">
          <span>Study Activity:</span>
          <span>Less</span>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm bg-gh-cell-0 border border-gh-border-muted" title="0 hrs" />
            <span className="w-3 h-3 rounded-sm bg-gh-cell-1" title="1-2 hrs" />
            <span className="w-3 h-3 rounded-sm bg-gh-cell-2" title="3-5 hrs" />
            <span className="w-3 h-3 rounded-sm bg-gh-cell-3" title="6+ hrs (3-hr deep work blocks)" />
            <span className="w-3 h-3 rounded-sm bg-gh-cell-4" title="Max focus day" />
          </div>
          <span>More</span>
          <span className="mx-2 text-gh-border-default">|</span>
          <div className="flex items-center gap-1 text-gh-danger-fg font-medium">
            <span className="w-3 h-3 rounded-sm bg-gh-danger-subtle border border-gh-danger-muted" />
            <span>Missed Day (0 hrs)</span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-gh-fg-muted">
          <Info className="w-3.5 h-3.5" />
          <span>Click any cell to inspect breakdown or log study</span>
        </div>
      </div>

      {/* Selected Day Modal Details (GitHub Issue / Dialog style) */}
      {selectedDayDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div 
            className="w-full max-w-lg gh-card bg-gh-canvas-subtle p-5 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gh-border-default pb-3">
              <div>
                <h3 className="text-sm font-bold text-gh-fg-default flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-gh-fg-muted" />
                  Study Report for {selectedDayDetails.dateStr}
                </h3>
              </div>
              <button
                onClick={() => setSelectedDayDetails(null)}
                className="text-gh-fg-muted hover:text-gh-fg-default text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Studied Sessions on this Day */}
            <div>
              <h4 className="text-xs font-bold text-gh-fg-default uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-gh-success-fg" />
                Studied Sessions ({selectedDayDetails.dayLogs.length})
              </h4>
              {selectedDayDetails.dayLogs.length === 0 ? (
                <div className="p-4 rounded border border-gh-border-default bg-gh-canvas-default text-xs text-gh-fg-muted text-center">
                  No study sessions recorded for this date.
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedDayDetails.dayLogs.map(log => {
                    const member = members.find(m => m.id === log.memberId);
                    return (
                      <div
                        key={log.id}
                        className="p-3 rounded border border-gh-border-default bg-gh-canvas-default space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <img
                              src={member?.avatar}
                              alt={member?.name}
                              className="w-5 h-5 rounded-full object-cover"
                            />
                            <span className="font-bold text-gh-fg-default">{member?.name}</span>
                            <span className="text-gh-fg-muted">({member?.role})</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gh-fg-default">{log.hours} hrs</span>
                            {log.sessions3Hr > 0 && (
                              <span className="text-[10px] font-bold text-gh-success-fg bg-gh-success-subtle px-1.5 py-0.5 rounded border border-gh-success-muted">
                                {log.sessions3Hr}x 3h Deep
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Topics */}
                        <div className="flex flex-wrap gap-1">
                          {log.topics.map((t, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-full text-[10px] font-medium border border-gh-border-default bg-gh-canvas-subtle text-gh-fg-muted"
                            >
                              {t}
                            </span>
                          ))}
                        </div>

                        {log.notes && (
                          <p className="text-[11px] text-gh-fg-muted italic bg-gh-canvas-subtle p-2 rounded border border-gh-border-muted font-mono">
                            {log.notes}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Missed Members on this Day */}
            {selectedDayDetails.missedMembers.length > 0 && (
              <div className="pt-2">
                <h4 className="text-xs font-bold text-gh-danger-fg uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Members With Missed Study ({selectedDayDetails.missedMembers.length})
                </h4>
                <div className="space-y-1.5">
                  {selectedDayDetails.missedMembers.map(m => (
                    <div
                      key={m.id}
                      className="p-2 rounded border border-gh-danger-muted bg-gh-danger-subtle flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2 text-gh-danger-fg font-medium">
                        <span>{m.name}</span>
                        <span className="text-[11px] opacity-80">(Target: {m.dailyGoalHours}h)</span>
                      </div>
                      <button
                        onClick={() => {
                          const date = selectedDayDetails.dateStr;
                          setSelectedDayDetails(null);
                          onOpenLogModalForDate(date, m.id);
                        }}
                        className="gh-btn-primary px-2 py-0.5 rounded text-[11px] font-semibold"
                      >
                        Log Catch-Up
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-gh-border-default">
              <button
                onClick={() => {
                  const date = selectedDayDetails.dateStr;
                  setSelectedDayDetails(null);
                  onOpenLogModalForDate(date);
                }}
                className="text-xs font-semibold text-gh-accent-fg hover:underline flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                Add Study Log for this Date
              </button>
              <button
                onClick={() => setSelectedDayDetails(null)}
                className="gh-btn-default px-3 py-1.5 rounded-md text-xs font-semibold"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
