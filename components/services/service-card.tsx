import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { formatCurrencyINR } from "@/lib/format"

type ServiceCardProps = {
  service: {
    id: string
    title: string
    description: string
    category: string
    city: string
    price: number | string
    durationMinutes: number
    provider?: {
      name?: string | null
    }
  }
  onBook?: (serviceId: string) => void
}

export function ServiceCard({ service, onBook }: ServiceCardProps) {
  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg border-border/60 bg-card/60 backdrop-blur-md">
      <CardHeader className="gap-2 bg-muted/5 border-b border-border/20 pb-4">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-lg font-heading tracking-tight">{service.title}</CardTitle>
          <Badge variant="secondary" className="shrink-0">{service.category}</Badge>
        </div>
        <CardDescription className="line-clamp-2">{service.description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-4 grid grid-cols-3 gap-3 text-sm">
        <div>
          <p className="text-muted-foreground text-xs mb-1">City</p>
          <p className="font-medium">{service.city}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs mb-1">Duration</p>
          <p className="font-medium">{service.durationMinutes} min</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs mb-1">Provider</p>
          <p className="font-medium truncate">{service.provider?.name ?? "Urban Clean Partner"}</p>
        </div>
      </CardContent>
      <CardFooter className="items-center justify-between border-t border-border/20 pt-4">
        <p className="text-lg font-semibold tracking-tight">INR {formatCurrencyINR(service.price)}</p>
        <Button onClick={() => onBook?.(service.id)} className="shadow-sm">Book now</Button>
      </CardFooter>
    </Card>
  )
}
