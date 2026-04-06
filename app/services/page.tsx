"use client"

import * as React from "react"

import { SiteShell } from "@/components/layout/site-shell"
import { BookingForm } from "@/components/bookings/booking-form"
import { ServiceCard } from "@/components/services/service-card"
import { ServiceForm } from "@/components/services/service-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type ServiceItem = {
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

export default function ServicesPage() {
  const [services, setServices] = React.useState<ServiceItem[]>([])
  const [selectedServiceId, setSelectedServiceId] = React.useState<
    string | null
  >(null)
  const [search, setSearch] = React.useState("")
  const [city, setCity] = React.useState("")
  const [category, setCategory] = React.useState("")

  const selectedService = services.find(
    (service) => service.id === selectedServiceId
  )

  const query = React.useMemo(() => {
    const params = new URLSearchParams()
    if (search) params.set("search", search)
    if (city) params.set("city", city)
    if (category) params.set("category", category)
    return params.toString()
  }, [search, city, category])

  React.useEffect(() => {
    void (async () => {
      const response = await fetch(`/api/services${query ? `?${query}` : ""}`)
      if (!response.ok) return
      const payload = (await response.json()) as { data: ServiceItem[] }
      setServices(payload.data)
    })()
  }, [query])

  return (
    <SiteShell>
      <section className="space-y-6">
        <div className="space-y-2">
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            Service catalog
          </h1>
          <p className="text-muted-foreground">
            Find, compare, and book trusted home cleaning services.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={city}
                onChange={(event) => setCity(event.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="grid gap-4 lg:col-span-2">
            {services.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onBook={setSelectedServiceId}
              />
            ))}
            {services.length === 0 ? (
              <Card>
                <CardContent className="text-muted-foreground">
                  No services found.
                </CardContent>
              </Card>
            ) : null}
          </div>
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Book service</CardTitle>
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
                  <p className="text-sm text-muted-foreground">
                    Select a service to create a booking.
                  </p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Create service</CardTitle>
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
