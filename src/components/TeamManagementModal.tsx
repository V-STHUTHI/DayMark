import React, { useState } from 'react';
import { X, Users, UserPlus, Plus, Trash2, Palette } from 'lucide-react';
import { Team, TeamMember } from '../types';

interface TeamManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  teams: Team[];
  activeTeam: Team | undefined;
  onSelectTeam: (teamId: string) => void;
  onAddTeam: (team: Team) => void;
  onDeleteTeam: (teamId: string) => void;
  members: TeamMember[];
  onAddMember: (member: TeamMember) => void;
  onDeleteMember: (memberId: string) => void;
}

export const TeamManagementModal: React.FC<TeamManagementModalProps> = ({
  isOpen,
  onClose,
  teams,
  activeTeam,
  onSelectTeam,
  onAddTeam,
  onDeleteTeam,
  members,
  onAddMember,
  onDeleteMember
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'members' | 'createTeam'>('members');

  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('Study Partner');
  const [newMemberGoal, setNewMemberGoal] = useState(4);
  const [newMemberColor, setNewMemberColor] = useState('#238636');

  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDesc, setNewTeamDesc] = useState('');
  const [newTeamCategory, setNewTeamCategory] = useState('Academics');
  const [newTeamTargetHours, setNewTeamTargetHours] = useState(25);

  if (!isOpen) return null;

  const handleAddMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim() || !activeTeam) return;

    const avatars = [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
    ];
    const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];

    const member: TeamMember = {
      id: `mem-${Date.now()}`,
      teamId: activeTeam.id,
      name: newMemberName.trim(),
      role: newMemberRole.trim() || 'Study Partner',
      dailyGoalHours: Number(newMemberGoal) || 4,
      color: newMemberColor,
      avatar: randomAvatar,
      joinedAt: new Date().toISOString()
    };

    onAddMember(member);
    setNewMemberName('');
    setNewMemberRole('Study Partner');
  };

  const handleCreateTeamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;

    const newTeam: Team = {
      id: `team-${Date.now()}`,
      name: newTeamName.trim(),
      description: newTeamDesc.trim() || 'Collaborative study team',
      category: newTeamCategory.trim() || 'General',
      weeklyTargetHours: Number(newTeamTargetHours) || 20,
      createdAt: new Date().toISOString().split('T')[0]
    };

    onAddTeam(newTeam);
    onSelectTeam(newTeam.id);
    setNewTeamName('');
    setNewTeamDesc('');
    setActiveSubTab('members');
  };

  const colorPalette = ['#238636', '#2f81f7', '#d29922', '#a371f7', '#f85149', '#39d353'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div 
        className="w-full max-w-xl gh-card bg-gh-canvas-subtle overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* GitHub Header */}
        <div className="px-4 py-3 border-b border-gh-border-default flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gh-fg-muted" />
            <h2 className="text-sm font-bold text-gh-fg-default">
              Collaborators & Teams
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

        {/* GitHub Sub-tabs */}
        <div className="flex border-b border-gh-border-default text-xs font-semibold px-4 pt-2">
          <button
            onClick={() => setActiveSubTab('members')}
            className={`pb-2 px-3 border-b-2 transition ${
              activeSubTab === 'members'
                ? 'border-gh-border-active text-gh-fg-default font-bold'
                : 'border-transparent text-gh-fg-muted hover:text-gh-fg-default'
            }`}
          >
            Collaborators ({members.length})
          </button>
          <button
            onClick={() => setActiveSubTab('createTeam')}
            className={`pb-2 px-3 border-b-2 transition ${
              activeSubTab === 'createTeam'
                ? 'border-gh-border-active text-gh-fg-default font-bold'
                : 'border-transparent text-gh-fg-muted hover:text-gh-fg-default'
            }`}
          >
            + Create New Team
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 max-h-[75vh] overflow-y-auto space-y-4 text-xs">
          
          {activeSubTab === 'members' ? (
            <>
              {/* Active Repository / Team Banner */}
              <div className="p-3 rounded-md border border-gh-border-default bg-gh-canvas-default flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-semibold text-gh-fg-muted uppercase block">
                    Active Study Team
                  </span>
                  <span className="font-bold text-sm text-gh-fg-default">
                    {activeTeam?.name}
                  </span>
                  <p className="text-[11px] text-gh-fg-muted mt-0.5">
                    {activeTeam?.description}
                  </p>
                </div>

                {teams.length > 1 && (
                  <button
                    onClick={() => {
                      if (activeTeam && window.confirm(`Delete team "${activeTeam.name}" and its logs?`)) {
                        onDeleteTeam(activeTeam.id);
                      }
                    }}
                    title="Delete Team"
                    className="p-1.5 text-gh-danger-fg hover:bg-gh-danger-subtle rounded transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Add Member Form */}
              <form onSubmit={handleAddMemberSubmit} className="p-3 rounded-md border border-gh-border-default bg-gh-canvas-default space-y-2.5">
                <h4 className="font-bold text-gh-fg-default text-xs flex items-center gap-1.5">
                  <UserPlus className="w-3.5 h-3.5 text-gh-fg-muted" />
                  Invite / Add Collaborator
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-gh-fg-muted mb-0.5">Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Maya Patel"
                      value={newMemberName}
                      onChange={(e) => setNewMemberName(e.target.value)}
                      required
                      className="w-full px-2.5 py-1 text-xs rounded border border-gh-border-default bg-gh-canvas-subtle text-gh-fg-default focus:border-gh-accent-emphasis focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gh-fg-muted mb-0.5">Focus / Role</label>
                    <input
                      type="text"
                      placeholder="e.g. Study Partner"
                      value={newMemberRole}
                      onChange={(e) => setNewMemberRole(e.target.value)}
                      className="w-full px-2.5 py-1 text-xs rounded border border-gh-border-default bg-gh-canvas-subtle text-gh-fg-default focus:border-gh-accent-emphasis focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 items-center">
                  <div>
                    <label className="block text-[11px] font-semibold text-gh-fg-muted mb-0.5">
                      Daily Target (Hours)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="16"
                      value={newMemberGoal}
                      onChange={(e) => setNewMemberGoal(Number(e.target.value))}
                      className="w-full px-2.5 py-1 text-xs rounded border border-gh-border-default bg-gh-canvas-subtle text-gh-fg-default focus:border-gh-accent-emphasis focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gh-fg-muted mb-0.5 flex items-center gap-1">
                      <Palette className="w-3 h-3" />
                      Accent Color
                    </label>
                    <div className="flex gap-2">
                      {colorPalette.map(color => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setNewMemberColor(color)}
                          className={`w-5 h-5 rounded-full border transition ${
                            newMemberColor === color ? 'border-gh-fg-default scale-110 shadow-sm' : 'border-transparent'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="gh-btn-primary w-full py-1 rounded text-xs font-semibold shadow-sm"
                >
                  Add Member to Team
                </button>
              </form>

              {/* Members List */}
              <div className="space-y-1.5">
                <span className="font-semibold text-gh-fg-muted text-[11px] block">
                  Team Members ({members.length})
                </span>

                {members.map(member => (
                  <div
                    key={member.id}
                    className="p-2.5 rounded-md border border-gh-border-default flex items-center justify-between bg-gh-canvas-default"
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-7 h-7 rounded-full object-cover border border-gh-border-default"
                      />
                      <div>
                        <span className="font-semibold text-gh-fg-default block">
                          {member.name}
                        </span>
                        <span className="text-[11px] text-gh-fg-muted">
                          {member.role} • Target: {member.dailyGoalHours}h/day
                        </span>
                      </div>
                    </div>

                    {members.length > 1 && (
                      <button
                        onClick={() => {
                          if (window.confirm(`Remove ${member.name}?`)) {
                            onDeleteMember(member.id);
                          }
                        }}
                        className="p-1 text-gh-fg-muted hover:text-gh-danger-fg transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </>
          ) : (
            /* Create Team Form */
            <form onSubmit={handleCreateTeamSubmit} className="space-y-3">
              <div>
                <label className="block font-semibold text-gh-fg-default mb-1">
                  Team / Repository Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. daily-study-group"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  required
                  className="w-full px-2.5 py-1.5 rounded-md border border-gh-border-default bg-gh-canvas-default text-gh-fg-default focus:border-gh-accent-emphasis focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-gh-fg-default mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Collaborative study group tracking hours and 3-hour deep sessions..."
                  value={newTeamDesc}
                  onChange={(e) => setNewTeamDesc(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-md border border-gh-border-default bg-gh-canvas-default text-gh-fg-default focus:border-gh-accent-emphasis focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-gh-fg-default mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Academics, Medicine, Dev"
                    value={newTeamCategory}
                    onChange={(e) => setNewTeamCategory(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-md border border-gh-border-default bg-gh-canvas-default text-gh-fg-default focus:border-gh-accent-emphasis focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gh-fg-default mb-1">
                    Weekly Target (Hours)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="100"
                    value={newTeamTargetHours}
                    onChange={(e) => setNewTeamTargetHours(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-md border border-gh-border-default bg-gh-canvas-default text-gh-fg-default focus:border-gh-accent-emphasis focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="gh-btn-primary w-full py-1.5 rounded-md text-xs font-semibold shadow-sm mt-2"
              >
                Create Team Repository
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
