import React, { useState } from 'react';
import { 
  Search, 
  Trash2, 
  Edit3, 
  Layers, 
  Clock, 
  BookOpen, 
  Filter,
  GitCommit,
  Plus
} from 'lucide-react';
import { StudyLog, TeamMember } from '../types';

interface StudyLogTableProps {
  logs: StudyLog[];
  members: TeamMember[];
  activeMemberId: string | null;
  onSelectMember: (id: string | null) => void;
  onEditLog: (log: StudyLog) => void;
  onDeleteLog: (logId: string) => void;
  onOpenLogModal: () => void;
}

export const StudyLogTable: React.FC<StudyLogTableProps> = ({
  logs,
  members,
  activeMemberId,
  onSelectMember,
  onEditLog,
  onDeleteLog,
  onOpenLogModal
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTopicFilter, setSelectedTopicFilter] = useState('');

  const allTopics = Array.from(
    new Set(logs.flatMap(l => l.topics))
  ).sort();

  const filteredLogs = logs.filter(log => {
    if (activeMemberId && log.memberId !== activeMemberId) return false;
    if (selectedTopicFilter && !log.topics.includes(selectedTopicFilter)) return false;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const member = members.find(m => m.id === log.memberId);
      const matchMember = member?.name.toLowerCase().includes(term);
      const matchTopic = log.topics.some(t => t.toLowerCase().includes(term));
      const matchNotes = log.notes?.toLowerCase().includes(term);
      const matchDate = log.date.includes(term);
      if (!matchMember && !matchTopic && !matchNotes && !matchDate) return false;
    }

    return true;
  });

  return (
    <div className="gh-card overflow-hidden">
      
      {/* Controls Bar (GitHub Commit Search / Filter Bar style) */}
      <div className="p-3 border-b border-gh-border-default bg-gh-canvas-subtle space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <GitCommit className="w-4 h-4 text-gh-fg-muted" />
            <h2 className="text-sm font-bold text-gh-fg-default">
              Study Commit History
            </h2>
            <span className="px-1.5 py-0.2 rounded-full text-xs font-medium bg-gh-canvas-default border border-gh-border-default text-gh-fg-muted">
              {filteredLogs.length} logs
            </span>
          </div>

          <button
            onClick={onOpenLogModal}
            className="gh-btn-primary px-3 py-1 rounded-md text-xs font-semibold self-start sm:self-center flex items-center gap-1 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Study Log</span>
          </button>
        </div>

        {/* Filter Row */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="w-3.5 h-3.5 text-gh-fg-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by topic, member, notes or date..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1 text-xs rounded-md border border-gh-border-default bg-gh-canvas-default text-gh-fg-default placeholder-gh-fg-subtle focus:outline-none focus:ring-1 focus:ring-gh-accent-emphasis"
            />
          </div>

          {/* Member filter */}
          <div className="flex items-center gap-1 gh-btn-default px-2 py-1 rounded-md text-xs">
            <Filter className="w-3 h-3 text-gh-fg-muted" />
            <select
              aria-label="Filter logs by member"
              value={activeMemberId || ''}
              onChange={(e) => onSelectMember(e.target.value ? e.target.value : null)}
              className="bg-transparent text-gh-fg-default focus:outline-none cursor-pointer"
            >
              <option value="" className="bg-gh-canvas-subtle">All Members</option>
              {members.map(m => (
                <option key={m.id} value={m.id} className="bg-gh-canvas-subtle">{m.name}</option>
              ))}
            </select>
          </div>

          {/* Topic filter */}
          {allTopics.length > 0 && (
            <div className="flex items-center gap-1 gh-btn-default px-2 py-1 rounded-md text-xs">
              <BookOpen className="w-3 h-3 text-gh-fg-muted" />
              <select
                aria-label="Filter logs by topic"
                value={selectedTopicFilter}
                onChange={(e) => setSelectedTopicFilter(e.target.value)}
                className="bg-transparent text-gh-fg-default focus:outline-none cursor-pointer"
              >
                <option value="" className="bg-gh-canvas-subtle">All Topics ({allTopics.length})</option>
                {allTopics.map(t => (
                  <option key={t} value={t} className="bg-gh-canvas-subtle">{t}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* GitHub Commits List Style */}
      {filteredLogs.length === 0 ? (
        <div className="p-12 text-center text-xs text-gh-fg-muted bg-gh-canvas-default">
          No study commit records found matching your filters.
        </div>
      ) : (
        <div className="divide-y divide-gh-border-muted bg-gh-canvas-default">
          {filteredLogs.map(log => {
            const member = members.find(m => m.id === log.memberId);

            return (
              <div 
                key={log.id} 
                className="p-3 hover:bg-gh-canvas-subtle/60 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-start gap-3">
                  <GitCommit className="w-4 h-4 text-gh-fg-muted mt-0.5 shrink-0" />
                  
                  <div className="space-y-1">
                    {/* Commit Message / Notes */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gh-fg-default hover:text-gh-accent-fg cursor-pointer">
                        {log.notes || `Completed ${log.hours}h study session`}
                      </span>

                      {/* 3-Hour Deep Work Badge */}
                      {log.sessions3Hr > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-gh-success-subtle text-gh-success-fg border border-gh-success-muted inline-flex items-center gap-1">
                          <Layers className="w-3 h-3" />
                          {log.sessions3Hr}x 3h deep work
                        </span>
                      )}
                    </div>

                    {/* Member & Date meta */}
                    <div className="flex items-center gap-2 text-gh-fg-muted text-[11px] font-mono">
                      <span className="font-semibold text-gh-fg-default">{member?.name || 'User'}</span>
                      <span>committed on</span>
                      <span>{log.date}</span>
                      {log.focusScore && (
                        <span>• Focus: {'★'.repeat(log.focusScore)}</span>
                      )}
                    </div>

                    {/* Topics as GitHub Labels */}
                    <div className="flex flex-wrap gap-1 pt-0.5">
                      {log.topics.map((t, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-full text-[10px] font-medium border border-gh-border-default bg-gh-canvas-subtle text-gh-fg-muted"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Hours Badge & Actions */}
                <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                  <span className="font-mono font-bold text-xs text-gh-fg-default px-2 py-1 rounded border border-gh-border-muted bg-gh-canvas-subtle">
                    +{log.hours}h
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditLog(log)}
                      type="button"
                      title="Edit Log"
                      aria-label="Edit study log"
                      className="inline-flex items-center gap-1 px-2 py-1 rounded text-gh-fg-muted hover:text-gh-fg-default hover:bg-gh-canvas-default transition"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Delete this study log entry?')) {
                          onDeleteLog(log.id);
                        }
                      }}
                      title="Delete Log"
                      className="p-1 rounded text-gh-fg-muted hover:text-gh-danger-fg hover:bg-gh-danger-subtle transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
