"use client"

import * as React from "react"

import { BookingForm } from "@/components/bookings/booking-form"
import { SiteShell } from "@/components/layout/site-shell"
import { ServiceForm } from "@/components/services/service-form"
import { ServiceCard } from "@/components/services/service-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type ServiceItem = {
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

const CITIES = [
  { value: "ALL", label: "All cities" },
  { value: "Delhi", label: "Delhi" },
  { value: "Mumbai", label: "Mumbai" },
  { value: "Bengaluru", label: "Bengaluru" },
  { value: "Hyderabad", label: "Hyderabad" },
  { value: "Chennai", label: "Chennai" },
  { value: "Pune", label: "Pune" },
  { value: "Kolkata", label: "Kolkata" },
]

const CATEGORIES = [
  { value: "ALL", label: "All categories" },
  { value: "Home Cleaning", label: "Home Cleaning" },
  { value: "Deep Cleaning", label: "Deep Cleaning" },
  { value: "Carpet Cleaning", label: "Carpet Cleaning" },
  { value: "Kitchen Cleaning", label: "Kitchen Cleaning" },
  { value: "Bathroom Cleaning", label: "Bathroom Cleaning" },
  { value: "Office Cleaning", label: "Office Cleaning" },
  { value: "Maintenance", label: "Maintenance" },
]

export default function ServicesPage() {
  const [services, setServices] = React.useState<ServiceItem[]>([])
  const [selectedServiceId, setSelectedServiceId] = React.useState<
    string | null
  >(null)
  const [search, setSearch] = React.useState("")
  const [city, setCity] = React.useState("ALL")
  const [category, setCategory] = React.useState("ALL")
  const [loading, setLoading] = React.useState(true)

  const selectedService = services.find(
    (service) => service.id === selectedServiceId
  )

  const query = React.useMemo(() => {
    const params = new URLSearchParams()
    if (search) params.set("search", search)
    if (city && city !== "ALL") params.set("city", city)
    if (category && category !== "ALL") params.set("category", category)
    return params.toString()
  }, [search, city, category])

  React.useEffect(() => {
    void (async () => {
      setLoading(true)
      const response = await fetch(`/api/services${query ? `?${query}` : ""}`)
      if (response.ok) {
        const payload = (await response.json()) as { data: ServiceItem[] }
        setServices(payload.data)
      }
      setLoading(false)
    })()
  }, [query])

  return (
    <SiteShell>
      <section className="space-y-6">
        <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-background to-muted/40 p-6">
          <div className="pointer-events-none absolute -top-16 -right-12 size-40 rounded-full bg-primary/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-10 -left-8 size-36 rounded-full bg-chart-2/10 blur-2xl" />
          <div className="relative space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">Service Discovery</Badge>
              <Badge variant="outline">{services.length} results</Badge>
            </div>
            <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
              Book your ideal cleaning service
            </h1>
            <p className="max-w-3xl text-sm text-muted-foreground sm:text-base">
              Filter by city, category, and keywords. Compare offerings and book
              instantly from one panel.
            </p>
          </div>
        </div>

        <Card className="border-border/60 bg-background/50 backdrop-blur-md shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Smart filters</CardTitle>
            <CardDescription>
              Refine your search quickly with live updates.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-4">
            <div className="grid gap-2 md:col-span-2">
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Deep cleaning, kitchen, sofa..."
                className="bg-background/80"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="city">City</Label>
              <Select value={city} onValueChange={setCity}>
                <SelectTrigger id="city">
                  <SelectValue placeholder="All cities" />
                </SelectTrigger>
                <SelectContent>
                  {CITIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 xl:grid-cols-3">
          <div className="grid gap-4 xl:col-span-2">
            {loading ? (
              <Card className="border-border/60">
                <CardContent className="py-8 text-center text-sm text-muted-foreground animate-pulse">
                  Loading services...
                </CardContent>
              </Card>
            ) : null}

            {services.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onBook={setSelectedServiceId}
              />
            ))}

            {!loading && services.length === 0 ? (
              <Card className="border-dashed border-2 bg-transparent shadow-none">
                <CardContent className="flex flex-col items-center justify-center gap-3 py-10 text-muted-foreground">
                  <span className="text-lg font-medium text-foreground">No services match your filters</span>
                  <span>Try different keywords or reset the filters.</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSearch("")
                      setCity("ALL")
                      setCategory("ALL")
                    }}
                  >
                    Reset filters
                  </Button>
                </CardContent>
              </Card>
            ) : null}
          </div>

          <div className="space-y-4">
            <Card className="border-border/60 bg-background/50 backdrop-blur-md shadow-sm sticky top-20">
              <CardHeader>
                <CardTitle className="text-lg">Quick booking</CardTitle>
                <CardDescription>
                  {selectedService
                    ? `Booking: ${selectedService.title}`
                    : "Select a service card to start booking."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedService ? (
                  <BookingForm
                    serviceId={selectedService.id}
                    onSuccess={() => {
                      setSelectedServiceId(null)
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center gap-2 py-6 text-center">
                    <div className="size-12 rounded-full bg-muted/50 flex items-center justify-center text-2xl">📋</div>
                    <p className="text-sm text-muted-foreground">
                      Pick any service and it will appear here.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-background/50 backdrop-blur-md shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Provider shortcut</CardTitle>
                <CardDescription>
                  Create a new service listing from this page.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ServiceForm />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </SiteShell>
  )
}
