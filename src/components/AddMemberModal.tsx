import React, { useState } from 'react';
import { X, UserPlus, Palette, Target, Users } from 'lucide-react';
import { TeamMember, Team } from '../types';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTeam: Team | undefined;
  onAddMember: (member: TeamMember) => void;
}

export const AddMemberModal: React.FC<AddMemberModalProps> = ({
  isOpen,
  onClose,
  activeTeam,
  onAddMember
}) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('Study Partner');
  const [dailyGoal, setDailyGoal] = useState(4);
  const [color, setColor] = useState('#238636');

  if (!isOpen || !activeTeam) return null;

  const colorPalette = ['#238636', '#2f81f7', '#d29922', '#a371f7', '#f85149', '#39d353'];

  const avatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];

    const newMember: TeamMember = {
      id: `mem-${Date.now()}`,
      teamId: activeTeam.id,
      name: name.trim(),
      role: role.trim() || 'Study Partner',
      dailyGoalHours: Number(dailyGoal) || 4,
      color,
      avatar: randomAvatar,
      joinedAt: new Date().toISOString()
    };

    onAddMember(newMember);
    setName('');
    setRole('Study Partner');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div 
        className="w-full max-w-sm gh-card bg-gh-canvas-subtle overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* GitHub Header */}
        <div className="px-4 py-3 border-b border-gh-border-default flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-gh-fg-muted" />
            <h2 className="text-sm font-bold text-gh-fg-default">
              Add Member to {activeTeam.name}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-gh-fg-default mb-1">
              Member Full Name
            </label>
            <input
              type="text"
              placeholder="e.g. Maya, David, Sam..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
              className="w-full px-2.5 py-1.5 rounded-md border border-gh-border-default bg-gh-canvas-default text-gh-fg-default focus:border-gh-accent-emphasis focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold text-gh-fg-default mb-1">
                Role / Specialization
              </label>
              <input
                type="text"
                placeholder="e.g. Study Partner"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-md border border-gh-border-default bg-gh-canvas-default text-gh-fg-default focus:border-gh-accent-emphasis focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-gh-fg-default mb-1 flex items-center gap-1">
                <Target className="w-3 h-3 text-gh-fg-muted" />
                Target (Hours/Day)
              </label>
              <input
                type="number"
                min="1"
                max="18"
                value={dailyGoal}
                onChange={(e) => setDailyGoal(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 rounded-md border border-gh-border-default bg-gh-canvas-default text-gh-fg-default focus:border-gh-accent-emphasis focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gh-fg-default mb-1 flex items-center gap-1">
              <Palette className="w-3 h-3 text-gh-fg-muted" />
              Color Accent
            </label>
            <div className="flex gap-2 pt-0.5">
              {colorPalette.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded-full border transition ${
                    color === c ? 'border-gh-fg-default scale-110 shadow-sm' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

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
              className="gh-btn-primary px-3 py-1.5 rounded-md text-xs font-semibold shadow-sm"
            >
              Add Member
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
