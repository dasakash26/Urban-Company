import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export type StatItem = {
  label: string
  value: string | number
}

export function StatsGrid({ stats }: { stats: StatItem[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              {stat.label}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {stat.value}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
