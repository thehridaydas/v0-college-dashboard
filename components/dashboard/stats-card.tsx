import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  trend?: { value: number; label?: string }
  icon?: React.ElementType
  iconColor?: string
  iconBg?: string
  className?: string
}

export function StatsCard({
  title,
  value,
  subtitle,
  trend,
  icon: Icon,
  iconColor = "text-[#2E8B57]",
  iconBg = "bg-[#2E8B57]/10",
  className,
}: StatsCardProps) {
  const isPositive = trend && trend.value >= 0

  return (
    <div className={cn("bg-card border border-border rounded-xl p-5 flex flex-col gap-3", className)}>
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        {Icon && (
          <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", iconBg)}>
            <Icon className={cn("w-4.5 h-4.5", iconColor)} />
          </div>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-2xl font-bold text-foreground tracking-tight">{value}</p>
        <div className="flex items-center gap-2 flex-wrap">
          {trend && (
            <span className={cn("flex items-center gap-0.5 text-xs font-medium", isPositive ? "text-[#2E8B57]" : "text-destructive")}>
              {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {Math.abs(trend.value)}%
            </span>
          )}
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
    </div>
  )
}
