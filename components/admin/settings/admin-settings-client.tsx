"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  GraduationCap, Users, BookOpen, LayoutDashboard,
  Database, Shield, Server,
} from "lucide-react"

interface Props {
  user: { firstName: string; lastName: string; email: string; role: string }
  systemInfo: { totalStudents: number; totalTeachers: number; totalClasses: number; totalCourses: number }
}

export function AdminSettingsClient({ user, systemInfo }: Props) {
  const initials = `${user.firstName[0]}${user.lastName[0]}`

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-xl font-semibold">Settings</h2>
        <p className="text-sm text-muted-foreground">Manage your account and system information</p>
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#2E8B57]" />
            Admin Profile
          </CardTitle>
          <CardDescription className="text-xs">Your account information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Avatar className="w-14 h-14">
              <AvatarFallback className="bg-[#2E8B57] text-white text-lg font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-base font-semibold">{user.firstName} {user.lastName}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <Badge className="mt-1.5 bg-[#2E8B57]/10 text-[#2E8B57] border-0 text-xs">
                {user.role}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Stats */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Database className="w-4 h-4 text-[#2E8B57]" />
            System Overview
          </CardTitle>
          <CardDescription className="text-xs">Current database statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Students", value: systemInfo.totalStudents, icon: GraduationCap, color: "text-purple-500", bg: "bg-purple-500/10" },
              { label: "Teachers", value: systemInfo.totalTeachers, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
              { label: "Classes", value: systemInfo.totalClasses, icon: BookOpen, color: "text-[#2E8B57]", bg: "bg-[#2E8B57]/10" },
              { label: "Courses", value: systemInfo.totalCourses, icon: LayoutDashboard, color: "text-amber-500", bg: "bg-amber-500/10" },
            ].map((stat) => (
              <div key={stat.label} className="p-4 rounded-lg border border-border bg-muted/30 flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center shrink-0`}>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tech Stack */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Server className="w-4 h-4 text-[#2E8B57]" />
            Tech Stack
          </CardTitle>
          <CardDescription className="text-xs">Technologies powering this application</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { label: "Framework", value: "Next.js 15 (App Router)" },
            { label: "Database", value: "PostgreSQL via Prisma ORM" },
            { label: "Authentication", value: "NextAuth.js v4 (JWT)" },
            { label: "UI Library", value: "shadcn/ui + Tailwind CSS v4" },
            { label: "Charts", value: "Recharts" },
            { label: "Deployment", value: "Vercel" },
          ].map((item, i, arr) => (
            <div key={item.label}>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{item.label}</span>
                <span className="text-sm font-medium">{item.value}</span>
              </div>
              {i < arr.length - 1 && <Separator className="mt-3" />}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
