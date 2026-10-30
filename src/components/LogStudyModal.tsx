import React, { useState } from 'react';
import { X, Clock, BookOpen, Layers, Sparkles, CheckCircle2, Calendar as CalendarIcon } from 'lucide-react';
import { TeamMember, StudyLog } from '../types';

interface LogStudyModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: string;
  members: TeamMember[];
  activeMemberId: string | null;
  onSaveLog: (log: StudyLog) => void;
  defaultDate?: string;
  editingLog?: StudyLog | null;
}

export const LogStudyModal: React.FC<LogStudyModalProps> = ({
  isOpen,
  onClose,
  teamId,
  members,
  activeMemberId,
  onSaveLog,
  defaultDate,
  editingLog
}) => {
  const today = new Date().toISOString().split('T')[0];

  const [memberId, setMemberId] = useState<string>(
    editingLog?.memberId || activeMemberId || members[0]?.id || ''
  );
  const [date, setDate] = useState<string>(editingLog?.date || defaultDate || today);
  const [hours, setHours] = useState<number>(editingLog?.hours || 3);
  const [sessions3Hr, setSessions3Hr] = useState<number>(
    editingLog?.sessions3Hr ?? Math.floor((editingLog?.hours || 3) / 3)
  );
  const [topicInput, setTopicInput] = useState<string>('');
  const [topics, setTopics] = useState<string[]>(
    editingLog?.topics || []
  );
  const [focusScore, setFocusScore] = useState<number>(editingLog?.focusScore || 5);
  const [notes, setNotes] = useState<string>(editingLog?.notes || '');
  const [showSavedFeedback, setShowSavedFeedback] = useState<boolean>(false);

  React.useEffect(() => {
    if (editingLog) {
      setMemberId(editingLog.memberId);
      setDate(editingLog.date);
      setHours(editingLog.hours);
      setSessions3Hr(editingLog.sessions3Hr);
      setTopics(editingLog.topics);
      setFocusScore(editingLog.focusScore || 5);
      setNotes(editingLog.notes || '');
    } else {
      if (activeMemberId) setMemberId(activeMemberId);
      if (defaultDate) setDate(defaultDate);
    }
  }, [editingLog, activeMemberId, defaultDate]);

  if (!isOpen) return null;

  const handleAddTopic = () => {
    const trimmed = topicInput.trim();
    if (trimmed && !topics.includes(trimmed)) {
      setTopics([...topics, trimmed]);
      setTopicInput('');
    }
  };

  const handleRemoveTopic = (indexToRemove: number) => {
    setTopics(topics.filter((_, idx) => idx !== indexToRemove));
  };

  const handleKeyDownTopic = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTopic();
    }
  };

  const handleHoursChange = (newHours: number) => {
    const clamped = Math.max(0.5, Math.min(24, Math.round(newHours * 10) / 10));
    setHours(clamped);
    const suggestedSessions = Math.floor(clamped / 3);
    setSessions3Hr(suggestedSessions);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberId) return;

    let finalTopics = [...topics];
    if (topicInput.trim() && !finalTopics.includes(topicInput.trim())) {
      finalTopics.push(topicInput.trim());
    }
    if (finalTopics.length === 0) {
      finalTopics = ['General Study'];
    }

    const logToSave: StudyLog = {
      id: editingLog ? editingLog.id : `log-${Date.now()}`,
      teamId,
      memberId,
      date,
      hours: Number(hours),
      topics: finalTopics,
      sessions3Hr: Number(sessions3Hr),
      focusScore,
      notes: notes.trim(),
      createdAt: editingLog ? editingLog.createdAt : new Date().toISOString()
    };

    onSaveLog(logToSave);
    setShowSavedFeedback(true);

    setTimeout(() => {
      setShowSavedFeedback(false);
      onClose();
    }, 600);
  };

  const suggestedTopicList = [
    'Mathematics',
    'Computer Science',
    'Physics',
    'Biology',
    'Literature',
    'Economics',
    'Language Study',
    'Research'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-100">
      <div 
        className="w-full max-w-lg gh-card bg-gh-canvas-subtle overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* GitHub Dialog Header */}
        <div className="px-4 py-3 border-b border-gh-border-default flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gh-fg-muted" />
            <h2 className="text-sm font-bold text-gh-fg-default">
              {editingLog ? 'Edit Study Session' : 'Log Study Session'}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="text-gh-fg-muted hover:text-gh-fg-default p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* GitHub Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 max-h-[80vh] overflow-y-auto text-xs">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="log-member-select" className="block font-semibold text-gh-fg-default mb-1">
                Student Profile
              </label>
              <select
                id="log-member-select"
                value={memberId}
                onChange={(e) => setMemberId(e.target.value)}
                required
                className="w-full px-2.5 py-1.5 rounded-md border border-gh-border-default bg-gh-canvas-default text-gh-fg-default focus:border-gh-accent-emphasis focus:outline-none"
              >
                {members.map(m => (
                  <option key={m.id} value={m.id} className="bg-gh-canvas-subtle">
                    {m.name} ({m.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="log-date-input" className="block font-semibold text-gh-fg-default mb-1 flex items-center gap-1">
                <CalendarIcon className="w-3 h-3 text-gh-fg-muted" />
                Date
              </label>
              <input
                id="log-date-input"
                type="date"
                value={date}
                max={today}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-2.5 py-1.5 rounded-md border border-gh-border-default bg-gh-canvas-default text-gh-fg-default focus:border-gh-accent-emphasis focus:outline-none font-mono"
              />
            </div>
          </div>

          {/* Hours Studied */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="log-hours-input" className="font-semibold text-gh-fg-default">
                Hours Studied
              </label>
              <span className="font-mono text-xs font-bold text-gh-fg-default">
                {hours} hrs
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="log-hours-input"
                type="number"
                step="0.5"
                min="0.5"
                max="24"
                value={hours}
                onChange={(e) => handleHoursChange(parseFloat(e.target.value) || 0)}
                className="w-24 px-2.5 py-1.5 font-mono font-bold rounded-md border border-gh-border-default bg-gh-canvas-default text-gh-fg-default focus:border-gh-accent-emphasis focus:outline-none"
              />
              <div className="flex flex-wrap gap-1">
                {[1.5, 3, 4.5, 6, 9].map(preset => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleHoursChange(preset)}
                    className={`px-2 py-1 rounded text-xs font-semibold border transition ${
                      hours === preset
                        ? 'bg-gh-accent-emphasis text-white border-gh-accent-emphasis'
                        : 'gh-btn-default'
                    }`}
                  >
                    {preset}h
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 3-Hour Deep Work Sessions */}
          <div className="p-3 rounded-md border border-gh-success-muted bg-gh-success-subtle text-gh-fg-default">
            <div className="flex items-center justify-between mb-1.5">
              <div>
                <label className="font-bold text-xs text-gh-success-fg flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5" />
                  3-Hour Deep Work Sessions Done
                </label>
                <span className="text-[11px] text-gh-fg-muted block">
                  Completed uninterrupted 3-hour concentration blocks
                </span>
              </div>
              <span className="font-mono font-bold text-xs text-gh-success-fg">
                {sessions3Hr}x ({(sessions3Hr * 3)} hrs)
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {[0, 1, 2, 3, 4].map(num => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setSessions3Hr(num)}
                  className={`flex-1 py-1 rounded text-xs font-bold transition border ${
                    sessions3Hr === num
                      ? 'bg-gh-success-emphasis text-white border-gh-success-emphasis shadow-sm'
                      : 'border-gh-border-default bg-gh-canvas-default text-gh-fg-default hover:bg-gh-canvas-subtle'
                  }`}
                >
                  {num === 0 ? '0' : `${num}x 3h`}
                </button>
              ))}
            </div>
          </div>

          {/* Topics Covered */}
          <div>
            <label className="block font-semibold text-gh-fg-default mb-1 flex items-center gap-1">
              <BookOpen className="w-3 h-3 text-gh-fg-muted" />
              Topics Covered
            </label>
            
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Topic name (e.g. Calculus, Anatomy) & press Enter..."
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                onKeyDown={handleKeyDownTopic}
                className="flex-1 px-2.5 py-1.5 rounded-md border border-gh-border-default bg-gh-canvas-default text-gh-fg-default focus:border-gh-accent-emphasis focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddTopic}
                className="gh-btn-default px-3 py-1.5 rounded-md font-semibold"
              >
                Add
              </button>
            </div>

            {/* Selected Topic Pills */}
            <div className="flex flex-wrap gap-1 mb-1.5">
              {topics.map((t, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border border-gh-border-default bg-gh-canvas-default text-gh-fg-default"
                >
                  {t}
                  <button
                    type="button"
                    onClick={() => handleRemoveTopic(idx)}
                    className="hover:text-gh-danger-fg ml-1"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            {/* Suggestions */}
            <div className="flex flex-wrap gap-1">
              <span className="text-[10px] text-gh-fg-subtle self-center mr-1">Suggestions:</span>
              {suggestedTopicList.map((sug, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    if (!topics.includes(sug)) setTopics([...topics, sug]);
                  }}
                  className="text-[10px] px-1.5 py-0.2 rounded border border-gh-border-muted bg-gh-canvas-default text-gh-fg-muted hover:border-gh-border-default"
                >
                  + {sug}
                </button>
              ))}
            </div>
          </div>

          {/* Focus Rating */}
          <div>
            <label className="block font-semibold text-gh-fg-default mb-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-gh-attention-fg" />
              Focus & Productivity Rating
            </label>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFocusScore(star)}
                  className={`flex-1 py-1 rounded text-xs font-semibold border transition ${
                    focusScore === star
                      ? 'bg-gh-attention-subtle text-gh-attention-fg border-gh-attention-muted font-bold'
                      : 'border-gh-border-default bg-gh-canvas-default text-gh-fg-muted'
                  }`}
                >
                  {'★'.repeat(star)} ({star}/5)
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="log-notes-input" className="block font-semibold text-gh-fg-default mb-1">
              Study Notes / Commit Message
            </label>
            <textarea
              id="log-notes-input"
              rows={2}
              placeholder="What questions did you solve, chapters reviewed, or milestones achieved..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-md border border-gh-border-default bg-gh-canvas-default text-gh-fg-default focus:border-gh-accent-emphasis focus:outline-none font-mono text-xs"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-2 border-t border-gh-border-default flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="gh-btn-default px-3 py-1.5 rounded-md text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={showSavedFeedback}
              className="gh-btn-primary px-4 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 shadow-sm"
            >
              {showSavedFeedback ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-white animate-bounce" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>{editingLog ? 'Save Changes' : 'Save Study Session'}</span>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
