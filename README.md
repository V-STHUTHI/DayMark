# StudySync - Team Study & 3-Hour Deep Work Tracker

A modern, collaborative web application built with **React**, **TypeScript**, and **Tailwind CSS** designed for study groups, competitive programmers, GATE/exam aspirants, and project teams.

---

## 🚀 Key Features

1. **Team Formation & Member Management**
   - Create and organize teams (e.g., *CS Core Aspirants*, *System Design Group*).
   - Add/manage team members with customized roles, avatars, color accents, and daily study targets.
   - Filter any view (dashboard, calendar, charts, logs) by entire team or specific individual member.

2. **Daily Study Logging & 3-Hour Deep Work Sessions**
   - Log hours studied each day with decimal precision (e.g. 4.5 hrs) and quick preset buttons.
   - **Track 3-Hour Deep Work Blocks**: Log the number of uninterrupted 3-hour sessions completed each day (`1x 3h`, `2x 3h`, `3x 3h`).
   - Tag topics covered (e.g., *Dynamic Programming*, *Operating Systems*, *DBMS*, *Linear Algebra*).
   - Rate session focus (1–5 stars) and record key study notes / breakthroughs.

3. **Instant Auto-Save & Data Persistence**
   - Automatically saves immediately on every log creation, modification, or deletion.
   - Built-in JSON Backup export and JSON import for data preservation.
   - Zero-configuration required to run out of the box!

4. **Visual Calendar & Missed Study Day Alerts**
   - Full monthly grid showing study attendance for all members or filtered by individual.
   - **Missed Day Warning**: Past days with 0 hours logged are highlighted with bright warning badges (`⚠️ Missed Day: 0 hrs`).
   - One-click catch-up: Click on any missed day in the calendar to immediately log study hours.
   - Monthly summary showing total hours, studied days, missed days, and consistency rate (%).

5. **Statistical Insights for Better Learning**
   - **Velocity Trend**: Daily study hours bar chart with 3-hour deep work session indicators.
   - **Topic Mastery Breakdown**: Interactive proportional distribution of hours across subjects.
   - **Streak Tracking**: Current active streak and personal best streak counters.
   - **Team Leaderboard**: Peer rankings by hours, consistency %, and deep work blocks.
   - **AI-Style Learning Insights Engine**: Automated recommendations diagnosing topic balance, deep work stamina, and consistency alerts.

6. **Manual Database & API Integration Guide (Built-in Modal)**
   - Includes a dedicated interactive modal with copy-pasteable PostgreSQL / Supabase schemas and Node.js Express + SQLite REST API code if you want to connect an external cloud database.

---

## 🛠️ How to Run Locally

Inside the project directory:

```bash
# 1. Install dependencies (already installed)
npm install

# 2. Start development server
npm run dev
```

Then open your browser at `http://localhost:5173`.

---

## 🗄️ Optional: Connecting an External Cloud Database

The app works 100% out-of-the-box using browser storage with immediate auto-save.
If you want multi-device cloud synchronization:
1. Click the **Database icon** (top right) in the navigation bar.
2. Follow the step-by-step guide to run the included SQL schema in **Supabase** or deploy the **Express + SQLite server**.
