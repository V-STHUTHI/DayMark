import React, { useState } from 'react';
import { User, Users, Plus, Target, Palette, CheckCircle, ShieldCheck } from 'lucide-react';
import { Team, TeamMember } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose?: () => void;
  canDismiss?: boolean;
  teams: Team[];
  members: TeamMember[];
  currentUser: TeamMember | null;
  onLogin: (member: TeamMember) => void;
  onCreateProfileAndTeam: (
    name: string,
    role: string,
    teamName: string,
    goalHours: number,
    color: string,
    mode: 'solo' | 'team',
    initialTeammates: string[]
  ) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  canDismiss = false,
  teams,
  members,
  currentUser,
  onLogin,
  onCreateProfileAndTeam
}) => {
  const [tab, setTab] = useState<'create' | 'select'>(
    members.length > 0 && !currentUser ? 'select' : 'create'
  );

  // Setup mode: 'solo' (Single Member) or 'team' (Team Study Group)
  const [studyMode, setStudyMode] = useState<'solo' | 'team'>('solo');

  // Form fields
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('Student');
  const [teamName, setTeamName] = useState('');
  const [dailyGoal, setDailyGoal] = useState(4);
  const [userColor, setUserColor] = useState('#238636');

  // Initial teammates to add during team creation
  const [teammateInput, setTeammateInput] = useState('');
  const [initialTeammates, setInitialTeammates] = useState<string[]>([]);

  if (!isOpen) return null;

  const colorPalette = ['#238636', '#2f81f7', '#d29922', '#a371f7', '#f85149', '#39d353'];

  const handleAddTeammate = () => {
    const trimmed = teammateInput.trim();
    if (trimmed && !initialTeammates.includes(trimmed)) {
      setInitialTeammates([...initialTeammates, trimmed]);
      setTeammateInput('');
    }
  };

  const handleKeyDownTeammate = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTeammate();
    }
  };

  const handleRemoveTeammate = (idx: number) => {
    setInitialTeammates(initialTeammates.filter((_, i) => i !== idx));
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) return;

    let finalTeammates = [...initialTeammates];
    if (teammateInput.trim() && !finalTeammates.includes(teammateInput.trim())) {
      finalTeammates.push(teammateInput.trim());
    }

    const calculatedTeamName = studyMode === 'solo'
      ? `${userName.trim()}'s Study Hub`
      : teamName.trim() || `${userName.trim()}'s Study Group`;

    onCreateProfileAndTeam(
      userName.trim(),
      userRole.trim() || (studyMode === 'solo' ? 'Independent Student' : 'Group Member'),
      calculatedTeamName,
      dailyGoal,
      userColor,
      studyMode,
      finalTeammates
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div 
        className="w-full max-w-md gh-card bg-gh-canvas-subtle overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* GitHub Dialog Header */}
        <div className="p-4 border-b border-gh-border-default bg-gh-canvas-subtle text-center relative">
          {canDismiss && onClose && (
            <button
              onClick={onClose}
              className="absolute right-3 top-3 text-gh-fg-muted hover:text-gh-fg-default text-sm font-bold p-1"
            >
              ✕
            </button>
          )}

          <svg 
            height="32" 
            aria-hidden="true" 
            viewBox="0 0 16 16" 
            version="1.1" 
            width="32" 
            className="fill-current text-gh-fg-default mx-auto mb-1.5"
          >
            <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
          </svg>

          <h2 className="text-sm font-bold text-gh-fg-default">
            StudySync Account & Setup
          </h2>
          <div className="flex items-center justify-center gap-1 text-[11px] text-gh-success-fg mt-0.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Persistent session: You will remain signed in permanently</span>
          </div>
        </div>

        {/* Tab Toggle if existing members exist */}
        {members.length > 0 && (
          <div className="flex border-b border-gh-border-default text-xs font-semibold">
            <button
              onClick={() => setTab('create')}
              className={`flex-1 py-2 text-center transition border-b-2 ${
                tab === 'create'
                  ? 'border-gh-border-active text-gh-fg-default bg-gh-canvas-default font-bold'
                  : 'border-transparent text-gh-fg-muted hover:text-gh-fg-default'
              }`}
            >
              Setup New Profile / Team
            </button>
            <button
              onClick={() => setTab('select')}
              className={`flex-1 py-2 text-center transition border-b-2 ${
                tab === 'select'
                  ? 'border-gh-border-active text-gh-fg-default bg-gh-canvas-default font-bold'
                  : 'border-transparent text-gh-fg-muted hover:text-gh-fg-default'
              }`}
            >
              Sign In to Existing ({members.length})
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="p-4 text-xs">
          {tab === 'select' && members.length > 0 ? (
            <div className="space-y-2.5">
              <span className="block font-semibold text-gh-fg-muted text-[11px]">
                Choose your profile to stay signed in:
              </span>

              <div className="space-y-1.5 max-h-64 overflow-y-auto">
                {members.map(member => {
                  const isCurrent = currentUser?.id === member.id;
                  return (
                    <button
                      key={member.id}
                      onClick={() => onLogin(member)}
                      className={`w-full p-2.5 rounded-md border text-left transition flex items-center justify-between ${
                        isCurrent
                          ? 'border-gh-accent-fg bg-gh-accent-subtle/40'
                          : 'border-gh-border-default bg-gh-canvas-default hover:border-gh-fg-muted'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-7 h-7 rounded-full object-cover border border-gh-border-default"
                        />
                        <div>
                          <div className="font-semibold text-gh-fg-default text-xs flex items-center gap-1.5">
                            <span>{member.name}</span>
                            {isCurrent && (
                              <span className="text-[10px] px-1 py-0.2 rounded bg-gh-accent-emphasis text-white font-mono">
                                Active
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-gh-fg-muted block">
                            {member.role} • {member.dailyGoalHours}h target
                          </span>
                        </div>
                      </div>

                      <span className="text-xs text-gh-accent-fg font-semibold">
                        {isCurrent ? 'Signed In' : 'Sign In →'}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 text-center border-t border-gh-border-muted mt-2">
                <button
                  type="button"
                  onClick={() => setTab('create')}
                  className="text-xs text-gh-accent-fg hover:underline font-semibold"
                >
                  + Setup a new single or team profile
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleCreateSubmit} className="space-y-3.5">
              
              {/* Question: Single Member vs Team */}
              <div>
                <label className="block font-bold text-gh-fg-default mb-1.5">
                  Are you studying as a Team or a Single Member?
                </label>
                
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setStudyMode('solo')}
                    className={`p-2.5 rounded-md border text-left transition flex flex-col gap-1 ${
                      studyMode === 'solo'
                        ? 'border-gh-accent-emphasis bg-gh-accent-subtle text-gh-fg-default ring-1 ring-gh-accent-emphasis'
                        : 'border-gh-border-default bg-gh-canvas-default text-gh-fg-muted hover:border-gh-fg-muted'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs flex items-center gap-1 text-gh-fg-default">
                        <User className="w-3.5 h-3.5" />
                        Single Member
                      </span>
                      {studyMode === 'solo' && <CheckCircle className="w-3.5 h-3.5 text-gh-accent-fg" />}
                    </div>
                    <span className="text-[10px] opacity-80 leading-tight">
                      Solo study tracking for hours, 3h deep blocks & streaks.
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStudyMode('team')}
                    className={`p-2.5 rounded-md border text-left transition flex flex-col gap-1 ${
                      studyMode === 'team'
                        ? 'border-gh-accent-emphasis bg-gh-accent-subtle text-gh-fg-default ring-1 ring-gh-accent-emphasis'
                        : 'border-gh-border-default bg-gh-canvas-default text-gh-fg-muted hover:border-gh-fg-muted'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs flex items-center gap-1 text-gh-fg-default">
                        <Users className="w-3.5 h-3.5" />
                        Team / Group
                      </span>
                      {studyMode === 'team' && <CheckCircle className="w-3.5 h-3.5 text-gh-accent-fg" />}
                    </div>
                    <span className="text-[10px] opacity-80 leading-tight">
                      Collaborative team study with peer accountability & shared goals.
                    </span>
                  </button>
                </div>
              </div>

              {/* If Team: Team Name Input */}
              {studyMode === 'team' && (
                <div>
                  <label className="block font-semibold text-gh-fg-default mb-1">
                    Team / Study Group Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Finals Study Circle, Lab Group..."
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    required
                    className="w-full px-2.5 py-1.5 text-xs rounded-md border border-gh-border-default bg-gh-canvas-default text-gh-fg-default focus:border-gh-accent-emphasis focus:outline-none"
                  />
                </div>
              )}

              {/* Your Personal Info */}
              <div>
                <label className="block font-semibold text-gh-fg-default mb-1">
                  Your Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Jordan Miller"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  required
                  className="w-full px-2.5 py-1.5 text-xs rounded-md border border-gh-border-default bg-gh-canvas-default text-gh-fg-default focus:border-gh-accent-emphasis focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-gh-fg-default mb-1">
                    Study Focus / Role
                  </label>
                  <input
                    type="text"
                    placeholder={studyMode === 'solo' ? 'Independent Student' : 'Team Lead / Partner'}
                    value={userRole}
                    onChange={(e) => setUserRole(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-md border border-gh-border-default bg-gh-canvas-default text-gh-fg-default focus:border-gh-accent-emphasis focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gh-fg-default mb-1 flex items-center gap-1">
                    <Target className="w-3 h-3 text-gh-fg-muted" />
                    Daily Target (Hours)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="18"
                    value={dailyGoal}
                    onChange={(e) => setDailyGoal(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-xs rounded-md border border-gh-border-default bg-gh-canvas-default text-gh-fg-default focus:border-gh-accent-emphasis focus:outline-none"
                  />
                </div>
              </div>

              {/* If Team: Add Teammates Option */}
              {studyMode === 'team' && (
                <div className="p-3 rounded-md border border-gh-border-default bg-gh-canvas-default space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-gh-fg-default text-[11px] flex items-center gap-1">
                      <Users className="w-3 h-3 text-gh-fg-muted" />
                      Add Team Members (Optional)
                    </label>
                    <span className="text-[10px] text-gh-fg-muted">
                      {initialTeammates.length} added
                    </span>
                  </div>

                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      placeholder="Type teammate name & press Enter..."
                      value={teammateInput}
                      onChange={(e) => setTeammateInput(e.target.value)}
                      onKeyDown={handleKeyDownTeammate}
                      className="flex-1 px-2 py-1 text-xs rounded border border-gh-border-default bg-gh-canvas-subtle text-gh-fg-default focus:border-gh-accent-emphasis focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddTeammate}
                      className="gh-btn-default px-2.5 py-1 rounded text-xs font-semibold"
                    >
                      + Add
                    </button>
                  </div>

                  {/* Teammates Chips */}
                  {initialTeammates.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {initialTeammates.map((mate, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border border-gh-border-default bg-gh-canvas-subtle text-gh-fg-default"
                        >
                          👤 {mate}
                          <button
                            type="button"
                            onClick={() => handleRemoveTeammate(idx)}
                            className="hover:text-gh-danger-fg ml-1 text-xs font-bold"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Accent Color */}
              <div>
                <label className="block font-semibold text-gh-fg-default mb-1 flex items-center gap-1">
                  <Palette className="w-3 h-3 text-gh-fg-muted" />
                  Profile Accent Color
                </label>
                <div className="flex gap-2 pt-0.5">
                  {colorPalette.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setUserColor(color)}
                      className={`w-6 h-6 rounded-full border transition ${
                        userColor === color ? 'border-gh-fg-default scale-110 shadow-sm' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="gh-btn-primary w-full py-2 rounded-md font-semibold text-xs shadow-sm mt-2 flex items-center justify-center gap-1.5"
              >
                <span>Complete Setup & Sign In Permanently</span>
              </button>

            </form>
          )}
        </div>

      </div>
    </div>
  );
};
