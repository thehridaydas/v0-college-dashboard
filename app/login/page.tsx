"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Eye, EyeOff, GraduationCap, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { loginSchema, type LoginInput } from "@/lib/validations"

const DEMO_ACCOUNTS = [
  { role: "Admin", email: "admin@college.edu", color: "bg-[#2E8B57]" },
  { role: "Principal", email: "principal@college.edu", color: "bg-amber-500" },
  { role: "Teacher", email: "teacher1@college.edu", color: "bg-blue-500" },
  { role: "Student", email: "student1@college.edu", color: "bg-purple-500" },
]

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true)
    try {
      // First do a redirect:false call to catch errors, then redirect manually
      const result = await signIn("credentials", {
        email: data.email.toLowerCase(),
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        toast.error(result.error)
        setIsLoading(false)
        return
      }

      // Auth succeeded — fetch the session to know the role, then redirect directly.
      // Use window.location.replace so the login page is fully removed from browser history,
      // preventing the back button from returning to the login screen.
      const { getSession } = await import("next-auth/react")
      const session = await getSession()
      const role = session?.user?.role?.toLowerCase() ?? "student"
      window.location.replace(`/dashboard/${role}`)
    } catch {
      toast.error("Something went wrong. Please try again.")
      setIsLoading(false)
    }
  }

  const fillDemo = (email: string) => {
    setValue("email", email)
    setValue("password", "password123")
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#141414] flex-col justify-between p-12 relative overflow-hidden">
        {/* Background grid */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "linear-gradient(#2E8B57 1px, transparent 1px), linear-gradient(90deg, #2E8B57 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        {/* Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-[#2E8B57]/10 blur-3xl" />

        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2E8B57] flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-white text-xl font-semibold tracking-tight">EduManage</span>
          </div>
        </div>

        <div className="relative space-y-6">
          <div className="space-y-3">
            <h1 className="text-4xl font-bold text-white leading-tight text-balance">
              College Management
              <br />
              <span className="text-[#2E8B57]">Made Simple</span>
            </h1>
            <p className="text-zinc-400 text-lg leading-relaxed">
              Manage students, teachers, attendance, marks, and fees — all in one powerful dashboard.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Students", value: "500+" },
              { label: "Teachers", value: "40+" },
              { label: "Courses", value: "12" },
              { label: "Departments", value: "6" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-zinc-500 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-zinc-600 text-sm">
          &copy; {new Date().getFullYear()} EduManage. All rights reserved.
        </p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-[#2E8B57] flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-foreground text-lg font-semibold">EduManage</span>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">Welcome back</h2>
            <p className="text-muted-foreground">Sign in to your account to continue</p>
          </div>

          {/* Demo accounts */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Quick Login (Demo)</p>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.role}
                  type="button"
                  onClick={() => fillDemo(acc.email)}
                  className="flex items-center gap-2 p-2.5 rounded-lg border border-border hover:border-primary/50 hover:bg-accent transition-all text-left group"
                >
                  <div className={`w-2 h-2 rounded-full ${acc.color}`} />
                  <span className="text-sm font-medium text-foreground">{acc.role}</span>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium">
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@college.edu"
                autoComplete="email"
                {...register("email")}
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  {...register("password")}
                  className={`pr-10 ${errors.password ? "border-destructive" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>

            <Button type="submit" className="w-full bg-[#2E8B57] hover:bg-[#236b44] text-white h-10" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground">
            Demo password for all accounts:{" "}
            <span className="font-mono font-semibold text-foreground">password123</span>
          </p>
        </div>
      </div>
    </div>
  )
}
