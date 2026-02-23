# ERP System

## Overview
A full-stack Education Resource Planning (ERP) system for managing institutions, students, faculty, classes, attendance, and timetables.

## Tech Stack
- **Frontend**: React + Vite + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Auth**: Session-based authentication with express-session + connect-pg-simple

## Project Structure
```
client/src/
  pages/        - Login, Dashboard, Students, Faculty, Classes, Attendance, Timetable, Institutions
  components/   - AppSidebar, UI components (shadcn)
  hooks/        - use-auth, use-toast, use-mobile
  lib/          - api, queryClient, utils

server/
  index.ts      - Server entry point
  routes.ts     - All API routes + seed data
  storage.ts    - Database storage layer
  db.ts         - Database connection
  vite.ts       - Vite dev server setup

shared/
  schema.ts     - Drizzle table definitions + types
  routes.ts     - API contract with Zod schemas
```

## Key Features
- Session-based auth (login/register)
- Dashboard with stats
- CRUD for institutions, students, faculty, classes
- Attendance tracking
- Timetable management
- Sidebar navigation

## Default Login
- Username: admin
- Password: admin123

## Recent Changes
- Initial build: Feb 20, 2026
