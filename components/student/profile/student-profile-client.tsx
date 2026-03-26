"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { format } from "date-fns"
import {
  GraduationCap,
  Mail,
  Phone,
  MapPin,
  Users,
  Calendar,
  BookOpen,
  UserCheck,
} from "lucide-react"

interface Profile {
  firstName: string
  lastName: string
  email: string
  rollNumber: string
  phone: string | null
  address: string | null
  parentName: string | null
  parentPhone: string | null
  dateOfBirth: string | null
  admissionYear: number
  classLabel: string
  courseName: string | null
  classTeacher: string | null
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | null | undefined }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-muted-foreground" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value ?? "Not provided"}</p>
      </div>
    </div>
  )
}

export function StudentProfileClient({ profile }: { profile: Profile }) {
  const initials = `${profile.firstName[0]}${profile.lastName[0]}`

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl font-bold">My Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">Your personal and academic information</p>
      </div>

      {/* Header card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-5">
            <Avatar className="w-16 h-16">
              <AvatarFallback className="bg-[#2E8B57] text-white text-xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold">{profile.firstName} {profile.lastName}</h2>
              <p className="text-sm text-muted-foreground">{profile.email}</p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <Badge className="bg-[#2E8B57]/10 text-[#2E8B57] border-0 text-xs">
                  Roll: {profile.rollNumber}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  Admitted {profile.admissionYear}
                </Badge>
                <Badge className="bg-purple-100 text-purple-600 border-0 text-xs">
                  STUDENT
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Academic Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-[#2E8B57]" /> Academic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <InfoRow icon={BookOpen} label="Class / Program" value={profile.classLabel} />
            <Separator />
            <InfoRow icon={GraduationCap} label="Course" value={profile.courseName} />
            <Separator />
            <InfoRow icon={UserCheck} label="Class Teacher" value={profile.classTeacher} />
            <Separator />
            <InfoRow icon={Calendar} label="Admission Year" value={String(profile.admissionYear)} />
          </CardContent>
        </Card>

        {/* Personal Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Users className="w-4 h-4 text-[#2E8B57]" /> Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <InfoRow icon={Mail} label="Email Address" value={profile.email} />
            <Separator />
            <InfoRow icon={Phone} label="Phone Number" value={profile.phone} />
            <Separator />
            <InfoRow icon={Calendar} label="Date of Birth" value={profile.dateOfBirth ? format(new Date(profile.dateOfBirth), "dd MMMM yyyy") : null} />
            <Separator />
            <InfoRow icon={MapPin} label="Address" value={profile.address} />
          </CardContent>
        </Card>

        {/* Parent / Guardian */}
        <Card className="sm:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Users className="w-4 h-4 text-[#2E8B57]" /> Parent / Guardian Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoRow icon={Users} label="Parent / Guardian Name" value={profile.parentName} />
              <InfoRow icon={Phone} label="Parent Phone" value={profile.parentPhone} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
