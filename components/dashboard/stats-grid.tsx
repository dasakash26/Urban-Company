import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export type StatItem = {
  label: string
  value: string | number
  tone?: "default" | "accent"
  hint?: string
}

export function StatsGrid({ stats }: { stats: StatItem[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <Card
          key={stat.label}
          className={cn(
            "relative overflow-hidden border-border/60 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg",
            stat.tone === "accent" && "border-primary/30 bg-primary/5"
          )}
        >
          <div className="pointer-events-none absolute -top-6 -right-6 size-20 rounded-full bg-primary/10 blur-xl" />
          <CardHeader className="pb-2">
            <CardTitle className="text-xs tracking-wide text-muted-foreground uppercase">
              {stat.label}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="text-3xl font-semibold tracking-tight">
              {stat.value}
            </p>
            {stat.hint ? (
              <p className="text-xs text-muted-foreground">{stat.hint}</p>
            ) : null}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
