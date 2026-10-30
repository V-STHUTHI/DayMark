import React from 'react';
import { X, Bell, AlertTriangle, Flame, Layers, Check } from 'lucide-react';
import { StudyNotification } from '../types';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: StudyNotification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onOpenLogModal: (memberId?: string, date?: string) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkRead,
  onMarkAllRead,
  onOpenLogModal
}) => {
  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-gh-canvas-subtle border-l border-gh-border-default shadow-2xl flex flex-col text-xs">
          
          {/* Header (GitHub Notifications style) */}
          <div className="p-3.5 border-b border-gh-border-default flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-gh-fg-muted" />
              <div>
                <h2 className="text-sm font-bold text-gh-fg-default">
                  Notifications
                </h2>
                <span className="text-[11px] text-gh-fg-muted">
                  {unreadCount} unread missed day alerts
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              aria-label="Close notifications drawer"
              className="text-gh-fg-muted hover:text-gh-fg-default p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Action bar */}
          {notifications.length > 0 && (
            <div className="px-3.5 py-2 bg-gh-canvas-default border-b border-gh-border-muted flex items-center justify-between">
              <span className="text-gh-fg-muted font-medium text-[11px]">Inbox</span>
              <button
                onClick={onMarkAllRead}
                className="text-gh-accent-fg font-semibold hover:underline flex items-center gap-1 text-[11px]"
              >
                <Check className="w-3 h-3" />
                Mark all as done
              </button>
            </div>
          )}

          {/* Notification List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gh-canvas-default">
            {notifications.length === 0 ? (
              <div className="py-16 text-center text-gh-fg-muted text-xs">
                All caught up! No notifications right now.
              </div>
            ) : (
              notifications.map(n => {
                const isMissed = n.type === 'missed_day';
                const isDeepWork = n.type === 'deep_work_champ';

                return (
                  <div
                    key={n.id}
                    className={`p-3 rounded-md border text-xs space-y-1.5 transition ${
                      !n.read
                        ? isMissed
                          ? 'border-gh-danger-muted bg-gh-danger-subtle text-gh-fg-default'
                          : 'border-gh-border-default bg-gh-canvas-subtle text-gh-fg-default'
                        : 'border-gh-border-muted bg-gh-canvas-default opacity-60 text-gh-fg-muted'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        {isMissed ? (
                          <AlertTriangle className="w-3.5 h-3.5 text-gh-danger-fg shrink-0" />
                        ) : isDeepWork ? (
                          <Layers className="w-3.5 h-3.5 text-gh-success-fg shrink-0" />
                        ) : (
                          <Flame className="w-3.5 h-3.5 text-gh-attention-fg shrink-0" />
                        )}

                        <span className="font-semibold text-gh-fg-default">
                          {n.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gh-fg-subtle font-mono">
                          {n.date}
                        </span>
                        {!n.read && (
                          <button
                            onClick={() => onMarkRead(n.id)}
                            title="Mark read"
                            className="text-gh-fg-subtle hover:text-gh-fg-default"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="text-[11px] text-gh-fg-muted leading-relaxed font-normal">
                      {n.message}
                    </p>

                    {isMissed && (
                      <button
                        onClick={() => {
                          onMarkRead(n.id);
                          onClose();
                          onOpenLogModal(n.memberId, n.date);
                        }}
                        className="gh-btn-primary w-full py-1 rounded text-xs font-semibold shadow-sm mt-1"
                      >
                        Catch Up & Log Study for {n.memberName}
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
