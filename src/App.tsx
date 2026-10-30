import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { CalendarView } from './components/CalendarView';
import { StatsInsights } from './components/StatsInsights';
import { StudyLogTable } from './components/StudyLogTable';
import { LogStudyModal } from './components/LogStudyModal';
import { TeamManagementModal } from './components/TeamManagementModal';
import { ManualDatabaseGuideModal } from './components/ManualDatabaseGuideModal';
import { NotificationDrawer } from './components/NotificationDrawer';
import { LoginModal } from './components/LoginModal';
import { AddMemberModal } from './components/AddMemberModal';
import { StorageService } from './services/storageService';
import { Team, TeamMember, StudyLog, StudyNotification } from './types';
import { CheckCircle2, UserCheck, Plus } from 'lucide-react';

export const App: React.FC = () => {
  // Theme state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Data states
  const [teams, setTeams] = useState<Team[]>(() => StorageService.getTeams());
  const [activeTeamId, setActiveTeamId] = useState<string | null>(() => StorageService.getActiveTeamId());
  const [members, setMembers] = useState<TeamMember[]>(() => StorageService.getMembers(activeTeamId || undefined));
  const [currentUser, setCurrentUser] = useState<TeamMember | null>(() => StorageService.getCurrentUser());
  const [activeMemberId, setActiveMemberId] = useState<string | null>(null);
  const [logs, setLogs] = useState<StudyLog[]>(() => StorageService.getLogs(activeTeamId || undefined));
  const [notifications, setNotifications] = useState<StudyNotification[]>([]);

  // View mode: 'my' (shows only logged-in user data) or 'team' (shows all team members)
  const [viewMode, setViewMode] = useState<'my' | 'team'>('my');

  // Navigation tab state
  const [activeTab, setActiveTab] = useState<'dashboard' | 'calendar' | 'analytics' | 'logs'>('dashboard');

  // Modals state
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(() => {
    return !StorageService.getCurrentUser();
  });
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<StudyLog | null>(null);
  const [logModalDefaultDate, setLogModalDefaultDate] = useState<string | undefined>(undefined);
  const [logModalPreselectedMemberId, setLogModalPreselectedMemberId] = useState<string | null>(null);

  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isDbGuideModalOpen, setIsDbGuideModalOpen] = useState(false);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Synchronize team context
  const reloadTeamData = (teamId: string) => {
    StorageService.setActiveTeamId(teamId);
    setActiveTeamId(teamId);
    const newMembers = StorageService.getMembers(teamId);
    setMembers(newMembers);
    const newLogs = StorageService.getLogs(teamId);
    setLogs(newLogs);
    setActiveMemberId(null);
    const notifs = StorageService.checkMissedStudyAlerts(teamId, currentUser?.id);
    setNotifications(notifs);
  };

  // Re-check notifications when activeTeamId or currentUser changes
  useEffect(() => {
    if (activeTeamId) {
      const notifs = StorageService.checkMissedStudyAlerts(activeTeamId, viewMode === 'my' ? currentUser?.id : undefined);
      setNotifications(notifs);
    }
  }, [activeTeamId, currentUser, viewMode]);

  const activeTeam = teams.find(t => t.id === activeTeamId) || teams[0];

  // User Auth / Profile Handlers
  const handleLogin = (member: TeamMember) => {
    StorageService.setCurrentUser(member);
    setCurrentUser(member);
    setIsLoginModalOpen(false);
    setViewMode('my');
    if (member.teamId !== activeTeamId) {
      reloadTeamData(member.teamId);
    }
    showToast(`Welcome back, ${member.name}! Displaying your study data.`);
  };

  const handleCreateProfileAndTeam = (
    name: string,
    role: string,
    teamName: string,
    goalHours: number,
    color: string,
    mode: 'solo' | 'team' = 'solo',
    initialTeammates: string[] = []
  ) => {
    let team = activeTeam;
    if (!team || teams.length === 0) {
      team = {
        id: `team-${Date.now()}`,
        name: teamName,
        description: mode === 'solo' 
          ? 'Personal study tracking workspace.'
          : 'Collaborative team study & 3-hour deep work tracking.',
        category: 'Academics',
        weeklyTargetHours: goalHours * 5,
        mode,
        createdAt: new Date().toISOString().split('T')[0]
      };
      StorageService.addTeam(team);
      setTeams(StorageService.getTeams());
      setActiveTeamId(team.id);
      StorageService.setActiveTeamId(team.id);
    }

    const member: TeamMember = {
      id: `mem-${Date.now()}`,
      teamId: team.id,
      name,
      role: role || (mode === 'solo' ? 'Independent Student' : 'Group Member'),
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      color: color || '#238636',
      dailyGoalHours: goalHours || 4,
      joinedAt: new Date().toISOString()
    };

    StorageService.addMember(member);
    StorageService.setCurrentUser(member);
    setCurrentUser(member);

    // If initial teammates were provided in setup, add them too!
    const sampleAvatars = [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150'
    ];
    const memberColors = ['#2f81f7', '#d29922', '#a371f7', '#f85149'];

    initialTeammates.forEach((mateName, idx) => {
      const mate: TeamMember = {
        id: `mem-${Date.now()}-${idx + 1}`,
        teamId: team!.id,
        name: mateName,
        role: 'Study Partner',
        avatar: sampleAvatars[idx % sampleAvatars.length],
        color: memberColors[idx % memberColors.length],
        dailyGoalHours: goalHours || 4,
        joinedAt: new Date().toISOString()
      };
      StorageService.addMember(mate);
    });

    setMembers(StorageService.getMembers(team.id));
    setViewMode('my');
    setIsLoginModalOpen(false);
    showToast(`Signed in permanently as ${name}! Welcome to StudySync.`);
  };

  const handleSelectTeam = (teamId: string) => {
    reloadTeamData(teamId);
    showToast(`Switched to team: ${teams.find(t => t.id === teamId)?.name || 'Team'}`);
  };

  const handleOpenLogModal = (memberId?: string, date?: string) => {
    setEditingLog(null);
    setLogModalDefaultDate(date || new Date().toISOString().split('T')[0]);
    // Default to the current logged in user!
    setLogModalPreselectedMemberId(memberId || currentUser?.id || activeMemberId || members[0]?.id || null);
    setIsLogModalOpen(true);
  };

  const handleEditLog = (log: StudyLog) => {
    setEditingLog(log);
    setIsLogModalOpen(true);
  };

  const handleSaveLog = (savedLog: StudyLog) => {
    if (editingLog) {
      StorageService.updateLog(savedLog);
    } else {
      StorageService.logStudy(savedLog);
    }
    if (activeTeamId) {
      setLogs(StorageService.getLogs(activeTeamId));
      const notifs = StorageService.checkMissedStudyAlerts(activeTeamId, viewMode === 'my' ? currentUser?.id : undefined);
      setNotifications(notifs);
    }
    showToast(`Study record for ${savedLog.hours} hrs saved immediately!`);
  };

  const handleDeleteLog = (logId: string) => {
    StorageService.deleteLog(logId);
    if (activeTeamId) {
      setLogs(StorageService.getLogs(activeTeamId));
    }
    showToast('Study log removed.');
  };

  // Team management handlers
  const handleAddTeam = (newTeam: Team) => {
    StorageService.addTeam(newTeam);
    const updatedTeams = StorageService.getTeams();
    setTeams(updatedTeams);
    reloadTeamData(newTeam.id);
    showToast(`New team "${newTeam.name}" created!`);
  };

  const handleDeleteTeam = (teamId: string) => {
    StorageService.deleteTeam(teamId);
    const remainingTeams = StorageService.getTeams();
    setTeams(remainingTeams);
    if (remainingTeams.length > 0) {
      reloadTeamData(remainingTeams[0].id);
    } else {
      setActiveTeamId(null);
      setMembers([]);
      setLogs([]);
      setCurrentUser(null);
      setIsLoginModalOpen(true);
    }
    showToast('Team removed.');
  };

  const handleAddMember = (member: TeamMember) => {
    StorageService.addMember(member);
    if (activeTeamId) {
      setMembers(StorageService.getMembers(activeTeamId));
    }
    showToast(`${member.name} added to the team!`);
  };

  const handleDeleteMember = (memberId: string) => {
    StorageService.deleteMember(memberId);
    if (activeTeamId) {
      setMembers(StorageService.getMembers(activeTeamId));
      setLogs(StorageService.getLogs(activeTeamId));
    }
    if (currentUser?.id === memberId) {
      setCurrentUser(null);
      setIsLoginModalOpen(true);
    }
    showToast('Member removed from team.');
  };

  // Notifications handlers
  const handleMarkNotificationRead = (id: string) => {
    StorageService.markNotificationRead(id);
    setNotifications(StorageService.getNotifications());
  };

  const handleMarkAllNotificationsRead = () => {
    StorageService.markAllNotificationsRead();
    setNotifications(StorageService.getNotifications());
    showToast('All notifications marked as read.');
  };

  // Backup & Import
  const handleExportData = () => {
    const jsonStr = StorageService.exportData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `StudySync_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Data exported successfully!');
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = StorageService.importData(content);
      if (success) {
        setTeams(StorageService.getTeams());
        const curTeam = StorageService.getActiveTeamId() || StorageService.getTeams()[0]?.id;
        if (curTeam) reloadTeamData(curTeam);
        setCurrentUser(StorageService.getCurrentUser());
        showToast('Data imported successfully!');
      } else {
        alert('Invalid JSON backup file format.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleClearAllData = () => {
    if (window.confirm('Clear all local data and start fresh? This will remove all teams, members, and logs.')) {
      StorageService.clearAllData();
      setTeams([]);
      setActiveTeamId(null);
      setMembers([]);
      setLogs([]);
      setCurrentUser(null);
      setNotifications([]);
      setIsLoginModalOpen(true);
      showToast('All data cleared. Starting fresh!');
    }
  };

  // Logs filtered according to user preference ("data only users that log in must be displayed")
  const filteredLogs = (viewMode === 'my' && currentUser)
    ? logs.filter(l => l.memberId === currentUser.id)
    : logs;

  return (
    <div className="min-h-screen bg-gh-canvas-default text-gh-fg-default flex flex-col font-sans transition-colors">
      
      {/* Top Navigation Bar */}
      <Navbar
        teams={teams}
        activeTeam={activeTeam}
        onSelectTeam={handleSelectTeam}
        members={members}
        currentUser={currentUser}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onOpenAddMemberModal={() => setIsAddMemberModalOpen(true)}
        viewMode={viewMode}
        onToggleViewMode={setViewMode}
        onOpenLogModal={() => handleOpenLogModal()}
        onOpenTeamModal={() => setIsTeamModalOpen(true)}
        onOpenDbGuideModal={() => setIsDbGuideModalOpen(true)}
        notifications={notifications}
        onOpenNotifications={() => setIsNotificationDrawerOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onExportData={handleExportData}
        onImportData={handleImportData}
        onClearAllData={handleClearAllData}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      {/* Main Content View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* If no team or member profile exists yet */}
        {!currentUser && members.length === 0 ? (
          <div className="py-20 text-center max-w-md mx-auto space-y-3 gh-card p-8">
            <svg 
              height="40" 
              aria-hidden="true" 
              viewBox="0 0 16 16" 
              version="1.1" 
              width="40" 
              className="fill-current text-gh-fg-muted mx-auto"
            >
              <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
            </svg>
            <h2 className="text-lg font-bold text-gh-fg-default">
              Welcome to StudySync
            </h2>
            <p className="text-xs text-gh-fg-muted leading-relaxed">
              Start fresh by creating your profile. Track your study hours, 3-hour deep work blocks, and maintain your activity streak.
            </p>
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="gh-btn-primary px-4 py-1.5 rounded-md text-xs font-semibold shadow-sm inline-flex items-center gap-1.5 mx-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Profile & Sign In</span>
            </button>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && activeTeam && (
              <DashboardView
                team={activeTeam}
                members={members}
                logs={logs}
                currentUser={currentUser}
                viewMode={viewMode}
                onToggleViewMode={setViewMode}
                onOpenLogModal={handleOpenLogModal}
                onOpenAddMemberModal={() => setIsAddMemberModalOpen(true)}
                onOpenTeamModal={() => setIsTeamModalOpen(true)}
                onOpenCalendar={() => setActiveTab('calendar')}
                onOpenAnalytics={() => setActiveTab('analytics')}
                onSelectMember={setActiveMemberId}
              />
            )}

            {activeTab === 'calendar' && (
              <CalendarView
                logs={logs}
                members={members}
                activeMemberId={activeMemberId}
                onSelectMember={setActiveMemberId}
                onOpenLogModalForDate={(date, memberId) => handleOpenLogModal(memberId, date)}
                currentUser={currentUser}
                viewMode={viewMode}
              />
            )}

            {activeTab === 'analytics' && activeTeam && (
              <StatsInsights
                team={activeTeam}
                members={members}
                logs={logs}
                activeMemberId={activeMemberId}
                onSelectMember={setActiveMemberId}
                currentUser={currentUser}
                viewMode={viewMode}
              />
            )}

            {activeTab === 'logs' && (
              <StudyLogTable
                logs={filteredLogs}
                members={members}
                activeMemberId={activeMemberId}
                onSelectMember={setActiveMemberId}
                onEditLog={handleEditLog}
                onDeleteLog={handleDeleteLog}
                onOpenLogModal={() => handleOpenLogModal()}
              />
            )}
          </>
        )}

      </main>

      {/* GitHub Style Footer */}
      <footer className="border-t border-gh-border-default bg-gh-canvas-subtle py-6 text-xs text-gh-fg-muted mt-8">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <svg 
              height="20" 
              aria-hidden="true" 
              viewBox="0 0 16 16" 
              version="1.1" 
              width="20" 
              className="fill-current text-gh-fg-muted"
            >
              <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
            </svg>
            <span>&copy; StudySync Pro • 3-Hour Deep Work Sessions</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <button
              onClick={() => setIsDbGuideModalOpen(true)}
              className="text-gh-accent-fg hover:underline font-semibold"
            >
              API Docs & Schemas
            </button>
            <span>•</span>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="text-gh-fg-muted hover:text-gh-fg-default"
            >
              {darkMode ? 'Switch to Light' : 'Switch to Dark'}
            </button>
            <span>•</span>
            <span>Data persists automatically</span>
          </div>
        </div>
      </footer>

      {/* Login & Profile Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        canDismiss={!!currentUser || members.length > 0}
        teams={teams}
        members={members}
        currentUser={currentUser}
        onLogin={handleLogin}
        onCreateProfileAndTeam={handleCreateProfileAndTeam}
      />

      {/* Log Study Modal */}
      <LogStudyModal
        isOpen={isLogModalOpen}
        onClose={() => {
          setIsLogModalOpen(false);
          setEditingLog(null);
        }}
        teamId={activeTeamId || 'team-1'}
        members={members}
        activeMemberId={logModalPreselectedMemberId}
        onSaveLog={handleSaveLog}
        defaultDate={logModalDefaultDate}
        editingLog={editingLog}
      />

      {/* Add Member Modal */}
      <AddMemberModal
        isOpen={isAddMemberModalOpen}
        onClose={() => setIsAddMemberModalOpen(false)}
        activeTeam={activeTeam}
        onAddMember={handleAddMember}
      />

      {/* Team Management Modal */}
      <TeamManagementModal
        isOpen={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
        teams={teams}
        activeTeam={activeTeam}
        onSelectTeam={handleSelectTeam}
        onAddTeam={handleAddTeam}
        onDeleteTeam={handleDeleteTeam}
        members={members}
        onAddMember={handleAddMember}
        onDeleteMember={handleDeleteMember}
      />

      {/* Manual Database & API Guide Modal */}
      <ManualDatabaseGuideModal
        isOpen={isDbGuideModalOpen}
        onClose={() => setIsDbGuideModalOpen(false)}
      />

      {/* Notifications Drawer */}
      <NotificationDrawer
        isOpen={isNotificationDrawerOpen}
        onClose={() => setIsNotificationDrawerOpen(false)}
        notifications={notifications}
        onMarkRead={handleMarkNotificationRead}
        onMarkAllRead={handleMarkAllNotificationsRead}
        onOpenLogModal={handleOpenLogModal}
      />

      {/* Toast Notification (GitHub Flash Alert style) */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-gh-canvas-subtle border border-gh-border-default text-gh-fg-default px-3 py-2 rounded-md shadow-xl text-xs font-semibold animate-in slide-in-from-bottom-3 duration-150">
          <CheckCircle2 className="w-3.5 h-3.5 text-gh-success-fg" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
};

export default App;
