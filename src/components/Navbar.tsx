import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Bell, 
  Database, 
  Download, 
  Upload, 
  Trash2, 
  Moon, 
  Sun,
  Flame,
  Calendar,
  BarChart2,
  GitCommit,
  User,
  ArrowRightLeft,
  GitPullRequest,
  Check,
  ChevronDown
} from 'lucide-react';
import { Team, TeamMember, StudyNotification } from '../types';

interface NavbarProps {
  teams: Team[];
  activeTeam: Team | undefined;
  onSelectTeam: (teamId: string) => void;
  members: TeamMember[];
  currentUser: TeamMember | null;
  onOpenLoginModal: () => void;
  onOpenAddMemberModal: () => void;
  viewMode: 'my' | 'team';
  onToggleViewMode: (mode: 'my' | 'team') => void;
  onOpenLogModal: () => void;
  onOpenTeamModal: () => void;
  onOpenDbGuideModal: () => void;
  notifications: StudyNotification[];
  onOpenNotifications: () => void;
  activeTab: 'dashboard' | 'calendar' | 'analytics' | 'logs';
  setActiveTab: (tab: 'dashboard' | 'calendar' | 'analytics' | 'logs') => void;
  onExportData: () => void;
  onImportData: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearAllData: () => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  teams,
  activeTeam,
  onSelectTeam,
  members,
  currentUser,
  onOpenLoginModal,
  onOpenAddMemberModal,
  viewMode,
  onToggleViewMode,
  onOpenLogModal,
  onOpenTeamModal,
  onOpenDbGuideModal,
  notifications,
  onOpenNotifications,
  activeTab,
  setActiveTab,
  onExportData,
  onImportData,
  onClearAllData,
  darkMode,
  setDarkMode,
}) => {
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="border-b border-gh-border-default bg-gh-canvas-subtle text-gh-fg-default sticky top-0 z-40">
      
      {/* Top Global Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 gap-3">
          
          {/* GitHub Style Breadcrumb */}
          <div className="flex items-center gap-2">
            {/* GitHub Octicon mark */}
            <svg 
              height="28" 
              aria-hidden="true" 
              viewBox="0 0 16 16" 
              version="1.1" 
              width="28" 
              className="fill-current text-gh-fg-default shrink-0 hover:opacity-80 transition cursor-pointer"
              onClick={() => setActiveTab('dashboard')}
            >
              <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
            </svg>

            <div className="flex items-center gap-1.5 text-sm font-semibold text-gh-fg-default">
              <span 
                onClick={() => setActiveTab('dashboard')} 
                className="hover:underline cursor-pointer text-gh-accent-fg"
              >
                StudySync
              </span>
              <span className="text-gh-fg-muted font-normal">/</span>

              {teams.length > 0 ? (
                <div className="relative flex items-center">
                  <select
                    aria-label="Select study team repository"
                    value={activeTeam?.id || ''}
                    onChange={(e) => onSelectTeam(e.target.value)}
                    className="font-bold text-gh-accent-fg bg-transparent hover:underline focus:outline-none cursor-pointer pr-4 appearance-none"
                  >
                    {teams.map(t => (
                      <option key={t.id} value={t.id} className="bg-gh-canvas-default text-gh-fg-default">
                        {t.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3 h-3 text-gh-fg-muted -ml-3 pointer-events-none" />
                </div>
              ) : (
                <span className="font-bold text-gh-fg-default">main-study-hub</span>
              )}

              <span className="ml-1 text-[11px] font-medium px-2 py-0.5 rounded-full border border-gh-border-default text-gh-fg-muted bg-gh-canvas-default">
                Public
              </span>
            </div>
          </div>

          {/* Right Header Section */}
          <div className="flex items-center gap-2">
            
            {/* View Mode Toggle Button Group */}
            {currentUser && members.length > 1 && (
              <div className="hidden sm:inline-flex rounded-md shadow-sm border border-gh-border-default overflow-hidden text-xs font-semibold">
                <button
                  onClick={() => onToggleViewMode('my')}
                  className={`px-2.5 py-1 transition ${
                    viewMode === 'my'
                      ? 'bg-gh-accent-subtle text-gh-accent-fg font-bold'
                      : 'bg-gh-canvas-subtle text-gh-fg-muted hover:bg-gh-canvas-default'
                  }`}
                  title="Filter only your study logs"
                >
                  My Data
                </button>
                <div className="w-px bg-gh-border-default" />
                <button
                  onClick={() => onToggleViewMode('team')}
                  className={`px-2.5 py-1 transition ${
                    viewMode === 'team'
                      ? 'bg-gh-accent-subtle text-gh-accent-fg font-bold'
                      : 'bg-gh-canvas-subtle text-gh-fg-muted hover:bg-gh-canvas-default'
                  }`}
                  title="View all team members"
                >
                  All Team ({members.length})
                </button>
              </div>
            )}

            {/* Notification Bell with Badge */}
            <button
              onClick={onOpenNotifications}
              className="p-1.5 rounded-md border border-gh-border-default hover:bg-gh-canvas-default text-gh-fg-muted hover:text-gh-fg-default transition relative"
              title="Notifications & Missed Days"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-gh-accent-fg ring-2 ring-gh-canvas-subtle animate-pulse" />
              )}
            </button>

            {/* Add Member Button */}
            {activeTeam && (
              <button
                onClick={onOpenAddMemberModal}
                className="gh-btn-default hidden sm:inline-flex px-2.5 py-1.5 rounded-md text-xs font-semibold items-center gap-1 hover:border-gh-fg-muted"
                title="Add a member to this team"
              >
                <Users className="w-3.5 h-3.5 text-gh-fg-muted" />
                <span>+ Member</span>
              </button>
            )}

            {/* GitHub Style Primary Green Action Button */}
            <button
              onClick={onOpenLogModal}
              className="gh-btn-primary px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1 shadow-sm active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Study</span>
            </button>

            {/* Profile Menu & Settings */}
            <div className="relative">
              {currentUser ? (
                <button
                  onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                  className="flex items-center gap-1.5 p-1 rounded-full hover:ring-2 hover:ring-gh-border-default transition"
                >
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-6 h-6 rounded-full object-cover border border-gh-border-default"
                  />
                  <ChevronDown className="w-3 h-3 text-gh-fg-muted" />
                </button>
              ) : (
                <button
                  onClick={onOpenLoginModal}
                  className="gh-btn-default px-2.5 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
              )}

              {/* GitHub Style Dropdown Menu */}
              {showSettingsMenu && (
                <div 
                  className="absolute right-0 mt-2 w-64 rounded-md bg-gh-canvas-subtle border border-gh-border-default shadow-xl py-1 z-50 text-xs font-medium animate-in fade-in zoom-in-95 duration-100"
                  onClick={() => setShowSettingsMenu(false)}
                >
                  {currentUser && (
                    <div className="px-3 py-2 border-b border-gh-border-default">
                      <div className="text-[11px] text-gh-fg-muted">Signed in as</div>
                      <div className="font-bold text-gh-fg-default truncate">{currentUser.name}</div>
                      <div className="text-[11px] text-gh-fg-muted">{currentUser.role}</div>
                    </div>
                  )}

                  <button
                    onClick={onOpenLoginModal}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gh-accent-subtle hover:text-gh-accent-fg text-gh-fg-default"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                    <span>Switch Profile / Sign In</span>
                  </button>

                  <button
                    onClick={onOpenAddMemberModal}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gh-accent-subtle hover:text-gh-accent-fg text-gh-fg-default"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>+ Add New Member to Team</span>
                  </button>

                  <button
                    onClick={onOpenTeamModal}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gh-accent-subtle hover:text-gh-accent-fg text-gh-fg-default"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Manage Teams & Collaborators</span>
                  </button>

                  <button
                    onClick={onOpenDbGuideModal}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gh-accent-subtle hover:text-gh-accent-fg text-gh-fg-default"
                  >
                    <Database className="w-3.5 h-3.5" />
                    <span>Database & API Docs</span>
                  </button>

                  <div className="h-px bg-gh-border-default my-1" />

                  <button
                    onClick={onExportData}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gh-canvas-default text-gh-fg-default"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export JSON Backup</span>
                  </button>

                  <label className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gh-canvas-default text-gh-fg-default cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Import JSON Data</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={onImportData}
                      className="hidden"
                    />
                  </label>

                  <button
                    onClick={onClearAllData}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gh-danger-subtle text-gh-danger-fg"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear All Data (Start Fresh)</span>
                  </button>

                  <div className="h-px bg-gh-border-default my-1" />

                  <button
                    onClick={() => setDarkMode(!darkMode)}
                    className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-gh-canvas-default text-gh-fg-default"
                  >
                    <span className="flex items-center gap-2">
                      {darkMode ? <Sun className="w-3.5 h-3.5 text-gh-attention-fg" /> : <Moon className="w-3.5 h-3.5" />}
                      <span>Theme: {darkMode ? 'GitHub Dark' : 'GitHub Light'}</span>
                    </span>
                    <Check className="w-3 h-3 text-gh-accent-fg" />
                  </button>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>

      {/* GitHub UnderlineNav Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-2 sm:gap-6 overflow-x-auto text-xs font-medium -mb-px">
          
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 py-3 px-1 transition border-b-2 whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'gh-tab-active'
                : 'border-transparent text-gh-fg-muted hover:text-gh-fg-default hover:border-gh-border-default'
            }`}
          >
            <Flame className="w-4 h-4 text-gh-fg-muted" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex items-center gap-2 py-3 px-1 transition border-b-2 whitespace-nowrap ${
              activeTab === 'calendar'
                ? 'gh-tab-active'
                : 'border-transparent text-gh-fg-muted hover:text-gh-fg-default hover:border-gh-border-default'
            }`}
          >
            <Calendar className="w-4 h-4 text-gh-fg-muted" />
            <span>Contributions & Calendar</span>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-gh-danger-subtle text-gh-danger-fg border border-gh-danger-muted">
                {unreadCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 py-3 px-1 transition border-b-2 whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'gh-tab-active'
                : 'border-transparent text-gh-fg-muted hover:text-gh-fg-default hover:border-gh-border-default'
            }`}
          >
            <BarChart2 className="w-4 h-4 text-gh-fg-muted" />
            <span>Insights</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`flex items-center gap-2 py-3 px-1 transition border-b-2 whitespace-nowrap ${
              activeTab === 'logs'
                ? 'gh-tab-active'
                : 'border-transparent text-gh-fg-muted hover:text-gh-fg-default hover:border-gh-border-default'
            }`}
          >
            <GitCommit className="w-4 h-4 text-gh-fg-muted" />
            <span>Study Logs</span>
          </button>

        </nav>
      </div>

    </header>
  );
};
