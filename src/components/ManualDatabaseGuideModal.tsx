import React, { useState } from 'react';
import { X, Database, Copy, Check, Server, Cloud, ShieldCheck } from 'lucide-react';

interface ManualDatabaseGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ManualDatabaseGuideModal: React.FC<ManualDatabaseGuideModalProps> = ({
  isOpen,
  onClose
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeGuideTab, setActiveGuideTab] = useState<'supabase' | 'expressSqlite'>('supabase');

  if (!isOpen) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const sqlSchemaCode = `-- ==========================================
-- STUDY TEAM TRACKER - POSTGRESQL / SUPABASE SCHEMA
-- ==========================================

-- 1. Create Teams Table
CREATE TABLE IF NOT EXISTS teams (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'General',
  weekly_target_hours NUMERIC DEFAULT 25,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Team Members Table
CREATE TABLE IF NOT EXISTS team_members (
  id TEXT PRIMARY KEY,
  team_id TEXT REFERENCES teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'Study Partner',
  avatar TEXT,
  color TEXT DEFAULT '#238636',
  daily_goal_hours NUMERIC DEFAULT 4,
  joined_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Study Logs Table
CREATE TABLE IF NOT EXISTS study_logs (
  id TEXT PRIMARY KEY,
  team_id TEXT REFERENCES teams(id) ON DELETE CASCADE,
  member_id TEXT REFERENCES team_members(id) ON DELETE CASCADE,
  study_date DATE NOT NULL,
  hours NUMERIC NOT NULL CHECK (hours > 0),
  topics TEXT[] DEFAULT ARRAY[]::TEXT[],
  sessions_3hr INTEGER DEFAULT 0,
  focus_score INTEGER CHECK (focus_score BETWEEN 1 AND 5),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_member_study_date UNIQUE (member_id, study_date)
);

-- 4. Enable Row Level Security (Public for development)
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read Access" ON teams FOR ALL USING (true);
CREATE POLICY "Public Read Access" ON team_members FOR ALL USING (true);
CREATE POLICY "Public Read Access" ON study_logs FOR ALL USING (true);`;

  const nodeApiCode = `// ==========================================
// OPTIONAL: EXPRESS + SQLITE / REST API SERVER
// server.js
// ==========================================
import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';

const app = express();
const db = new Database('study_tracker.db');

app.use(cors());
app.use(express.json());

// Initialize SQLite Schema
db.exec(\`
  CREATE TABLE IF NOT EXISTS logs (
    id TEXT PRIMARY KEY,
    teamId TEXT,
    memberId TEXT,
    date TEXT,
    hours REAL,
    topics TEXT,
    sessions3Hr INTEGER,
    focusScore INTEGER,
    notes TEXT,
    createdAt TEXT
  );
\`);

// Upsert study log endpoint
app.post('/api/logs', (req, res) => {
  const { id, teamId, memberId, date, hours, topics, sessions3Hr, focusScore, notes } = req.body;
  const stmt = db.prepare(\`
    INSERT INTO logs (id, teamId, memberId, date, hours, topics, sessions3Hr, focusScore, notes, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(id) DO UPDATE SET
      hours = excluded.hours,
      topics = excluded.topics,
      sessions3Hr = excluded.sessions3Hr,
      focusScore = excluded.focusScore,
      notes = excluded.notes
  \`);
  stmt.run(id, teamId, memberId, date, hours, JSON.stringify(topics), sessions3Hr, focusScore, notes);
  res.json({ success: true, message: 'Saved successfully' });
});

app.get('/api/logs', (req, res) => {
  const rows = db.prepare('SELECT * FROM logs ORDER BY date DESC').all();
  res.json(rows.map(r => ({ ...r, topics: JSON.parse(r.topics || '[]') })));
});

app.listen(4000, () => console.log('API running on http://localhost:4000'));`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div 
        className="w-full max-w-2xl gh-card bg-gh-canvas-subtle overflow-hidden flex flex-col max-h-[85vh] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-gh-border-default flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-gh-fg-muted" />
            <h2 className="text-sm font-bold text-gh-fg-default">
              Database & REST API Integration Guide
            </h2>
          </div>

          <button
            onClick={onClose}
            aria-label="Close database guide dialog"
            className="text-gh-fg-muted hover:text-gh-fg-default p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Status Callout (GitHub info note style) */}
        <div className="p-3 bg-gh-canvas-default border-b border-gh-border-default flex items-start gap-2.5 text-xs">
          <ShieldCheck className="w-4 h-4 text-gh-success-fg shrink-0 mt-0.5" />
          <div className="space-y-0.5 text-gh-fg-default">
            <span className="font-bold">
              Current Mode: Active with Zero-Config Browser Persistence
            </span>
            <p className="text-gh-fg-muted text-[11px] leading-relaxed">
              Every time you log study data, it is saved instantly in your browser storage. If you want multi-device cloud syncing or sharing across team members' computers, follow the manual database steps below.
            </p>
          </div>
        </div>

        {/* Sub-tabs */}
        <div className="px-4 pt-2 flex gap-4 border-b border-gh-border-default text-xs font-semibold">
          <button
            onClick={() => setActiveGuideTab('supabase')}
            className={`pb-2 border-b-2 transition flex items-center gap-1.5 ${
              activeGuideTab === 'supabase'
                ? 'border-gh-border-active text-gh-fg-default font-bold'
                : 'border-transparent text-gh-fg-muted hover:text-gh-fg-default'
            }`}
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>Supabase / PostgreSQL</span>
          </button>

          <button
            onClick={() => setActiveGuideTab('expressSqlite')}
            className={`pb-2 border-b-2 transition flex items-center gap-1.5 ${
              activeGuideTab === 'expressSqlite'
                ? 'border-gh-border-active text-gh-fg-default font-bold'
                : 'border-transparent text-gh-fg-muted hover:text-gh-fg-default'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Node.js Express + SQLite</span>
          </button>
        </div>

        {/* Guide Content */}
        <div className="p-4 overflow-y-auto space-y-4 text-xs text-gh-fg-default">
          {activeGuideTab === 'supabase' ? (
            <div className="space-y-3">
              <div>
                <h4 className="font-bold mb-1">1. Create a Supabase Project</h4>
                <p className="text-gh-fg-muted text-[11px]">
                  Sign up for free at <span className="text-gh-accent-fg font-semibold">supabase.com</span>, create a project, and open the SQL Editor.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-bold">2. Run SQL Schema in SQL Editor</h4>
                  <button
                    onClick={() => copyToClipboard(sqlSchemaCode, 'sql')}
                    className="gh-btn-default px-2 py-0.5 rounded text-[11px] font-semibold flex items-center gap-1"
                  >
                    {copiedKey === 'sql' ? <Check className="w-3 h-3 text-gh-success-fg" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'sql' ? 'Copied!' : 'Copy SQL'}</span>
                  </button>
                </div>

                <div className="rounded-md bg-[#0d1117] p-3 border border-gh-border-default text-[#e6edf3] font-mono text-[11px] overflow-x-auto max-h-48">
                  <pre>{sqlSchemaCode}</pre>
                </div>
              </div>

              <div>
                <h4 className="font-bold mb-1">3. Set Environment Variables</h4>
                <p className="text-gh-fg-muted text-[11px] mb-1">
                  Add these to <code className="bg-gh-canvas-default px-1 py-0.5 rounded border border-gh-border-muted font-mono">.env.local</code>:
                </p>
                <div className="rounded-md bg-[#0d1117] p-2 text-[#e6edf3] font-mono text-[11px] border border-gh-border-default">
                  <code>
                    VITE_SUPABASE_URL=https://your-project.supabase.co<br />
                    VITE_SUPABASE_ANON_KEY=your-anon-public-key
                  </code>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <h4 className="font-bold mb-1">1. Install Express & SQLite</h4>
                <div className="rounded-md bg-[#0d1117] p-2 text-[#e6edf3] font-mono text-[11px] border border-gh-border-default">
                  <code>npm install express cors better-sqlite3</code>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-bold">2. Server Script (`server.js`)</h4>
                  <button
                    onClick={() => copyToClipboard(nodeApiCode, 'node')}
                    className="gh-btn-default px-2 py-0.5 rounded text-[11px] font-semibold flex items-center gap-1"
                  >
                    {copiedKey === 'node' ? <Check className="w-3 h-3 text-gh-success-fg" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'node' ? 'Copied!' : 'Copy Server Code'}</span>
                  </button>
                </div>

                <div className="rounded-md bg-[#0d1117] p-3 border border-gh-border-default text-[#e6edf3] font-mono text-[11px] overflow-x-auto max-h-48">
                  <pre>{nodeApiCode}</pre>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gh-border-default bg-gh-canvas-subtle flex items-center justify-end">
          <button
            onClick={onClose}
            className="gh-btn-default px-3 py-1.5 rounded-md text-xs font-semibold"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
