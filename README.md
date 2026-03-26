# EduManage — College Management Dashboard

A comprehensive full-stack college management system built with Next.js 15, Prisma, NextAuth, and Tailwind CSS. Supports role-based access control for Admins, Teachers, Students, and Principals.

## Features

- **4 Role-based Dashboards**: Admin, Teacher, Student, Principal with dedicated pages
- **Admin Dashboard**: Manage students, teachers, classes, subjects, fees, notices, analytics, and system settings
- **Teacher Dashboard**: View assigned classes, take attendance, enter marks, verify fee payments, manage notices
- **Student Dashboard**: View grades, attendance records, fees, notices, and student profile information
- **Principal Dashboard**: Institution overview, comprehensive analytics, and detailed reports
- **Secure Authentication**: NextAuth v4 with JWT sessions and bcrypt password hashing
- **Real-time Data**: Responsive UI with instant updates across all modules

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS v4
- **Backend**: Next.js API routes, Prisma ORM
- **Database**: PostgreSQL (Supabase recommended)
- **Authentication**: NextAuth v4 (JWT, bcrypt, session-based)
- **UI Components**: shadcn/ui, Recharts for charts
- **Validation**: Zod + React Hook Form

## Getting Started

### Prerequisites

- Node.js v18+ (v25+ recommended)
- PostgreSQL database (use Supabase for easiest setup)
- Git + GitHub Desktop (for version control)

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/yourusername/v0-college-dashboard.git
cd v0-college-dashboard
npm install
```

### 2. Setup Supabase Database

1. Create account at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings → Database → Connection String
4. Use **Session Pooler** connection (for local IPv4 development)
5. Copy the connection URL

### 3. Configure Environment Variables

Create `.env` file (rename from `.env.example`):

```env
DATABASE_URL="postgresql://postgres:YOUR_ENCODED_PASSWORD@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres?schema=public&sslmode=require"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"
```

**Note**: URL-encode your password special characters (e.g., `#` → `%23`, `*` → `%2A`, `@` → `%40`)

### 4. Setup Database Schema

```bash
npx prisma db seed
```

This seeds the database with demo data (admin, teachers, students, courses, etc.)

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Demo Credentials

| Role      | Email                 | Password   |
|-----------|----------------------|-----------|
| Admin     | admin@college.edu    | admin123  |
| Teacher   | teacher1@college.edu | teacher123 |
| Student   | student1@college.edu | student123 |
| Principal | principal@college.edu| principal123 |

## Project Structure

```
v0-college-dashboard/
├── app/
│   ├── dashboard/
│   │   ├── admin/        # Admin: students, teachers, classes, subjects, fees, notices, analytics, settings
│   │   ├── teacher/      # Teacher: classes, attendance, marks, fees, notices, profile
│   │   ├── student/      # Student: grades, attendance, fees, notices, profile
│   │   └── principal/    # Principal: overview, analytics, reports, profile
│   ├── api/              # REST API endpoints for all modules
│   ├── login/            # NextAuth login page
│   ├── layout.tsx        # Root layout with SessionProvider
│   └── page.tsx          # Root redirect to /login
├── components/
│   ├── admin/            # Admin-specific UI components
│   ├── teacher/          # Teacher-specific UI components
│   ├── student/          # Student-specific UI components
│   ├── principal/        # Principal-specific UI components
│   ├── shared/           # Shared components (notices, etc.)
│   ├── layout/           # Sidebar, Topbar, DashboardShell
│   └── dashboard/        # Reusable dashboard components (StatsCard, etc.)
├── lib/
│   ├── auth.ts           # NextAuth configuration
│   ├── db.ts             # Prisma client
│   ├── validations.ts    # Zod schemas
│   └── db-utils.ts       # Database utility functions
├── prisma/
│   ├── schema.prisma     # Prisma database schema
│   └── seed.ts           # Demo data seeder
├── middleware.ts         # NextAuth middleware for route protection
├── tailwind.config.ts    # Tailwind configuration
├── next.config.ts        # Next.js configuration
└── package.json          # Dependencies and scripts
```

## Database Schema

The database includes the following main models:

- **User, Admin, Principal, Teacher, Student** — Authentication and role management
- **Course, Class, Subject** — Academic structure
- **Enrollment, ClassAttendance, SubjectAttendance** — Student attendance tracking
- **Mark** — Student grades and marks
- **Fee, Notice** — Financial and communication management
- **TeacherAssignment** — Class-teacher associations

## API Endpoints

All endpoints require authentication via NextAuth sessions.

### Students API
- `GET /api/students` — List all students
- `POST /api/students` — Create new student
- `GET /api/students/[id]` — Get student details
- `PATCH /api/students/[id]` — Update student
- `DELETE /api/students/[id]` — Delete student

### Teachers API
- `GET /api/teachers` — List all teachers
- `POST /api/teachers` — Create new teacher
- `PATCH /api/teachers/[id]` — Update teacher
- `DELETE /api/teachers/[id]` — Delete teacher

### Attendance, Marks, Fees, Notices
Similar REST patterns available for all modules.

## Deployment

Deploy to Vercel with one click:

1. Push code to GitHub
2. Connect to Vercel at [vercel.com](https://vercel.com)
3. Set environment variables in Vercel project settings
4. For Vercel, use **Pooler** connection string (already configured)
5. Deploy!

## Git Workflow

This project uses GitHub for version control:

```bash
git checkout main                    # Switch to main branch
git pull origin main                 # Get latest changes
git checkout -b feature/your-feature # Create new branch
git add .
git commit -m "Your changes"
git push origin feature/your-feature # Push to GitHub
```

Then create a Pull Request on GitHub for code review.

## Troubleshooting

### Database Connection Issues
- Verify Supabase is accessible from your network
- Check firewall/VPN blocking
- Use Session Pooler (not Direct) for IPv4 networks
- Verify password is correctly URL-encoded in DATABASE_URL

### Seed Command Fails
- Ensure database schema is created (`npx prisma db push`)
- Check DATABASE_URL is correct
- Verify Supabase credentials

### NextAuth Warnings
- Set NEXTAUTH_SECRET in `.env`
- Set NEXTAUTH_URL to `http://localhost:3000` (local) or your domain (production)

## Contributing

1. Create a new branch for features
2. Make changes and test locally
3. Commit with clear messages
4. Push to GitHub and create Pull Request
5. Code review before merge to main

## License

MIT License - see LICENSE file for details

## Support

For issues, create a GitHub issue or contact the development team.

---

**Last Updated**: March 2026  
**Version**: 1.0.0
