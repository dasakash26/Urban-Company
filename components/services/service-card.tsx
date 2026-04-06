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

type ServiceCardProps = {
  service: {
    id: string
    title: string
    description: string
    category: string
    city: string
    price: number
    durationMinutes: number
    provider?: {
      name?: string | null
    }
  }
  onBook?: (serviceId: string) => void
}

export function ServiceCard({ service, onBook }: ServiceCardProps) {
  return (
    <Card className="gap-4">
      <CardHeader className="gap-2">
        <div className="flex items-center justify-between gap-3">
          <CardTitle>{service.title}</CardTitle>
          <Badge variant="secondary">{service.category}</Badge>
        </div>
        <CardDescription>{service.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-1 text-sm text-muted-foreground">
        <p>City: {service.city}</p>
        <p>Duration: {service.durationMinutes} minutes</p>
        <p>Provider: {service.provider?.name ?? "Urban Clean Partner"}</p>
      </CardContent>
      <CardFooter className="items-center justify-between">
        <p className="font-semibold">INR {service.price.toFixed(2)}</p>
        <Button onClick={() => onBook?.(service.id)}>Book now</Button>
      </CardFooter>
    </Card>
  )
}
