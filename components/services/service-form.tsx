"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export function ServiceForm() {
  const [title, setTitle] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [category, setCategory] = React.useState("")
  const [price, setPrice] = React.useState(0)
  const [durationMinutes, setDurationMinutes] = React.useState(60)
  const [city, setCity] = React.useState("")
  const [submitting, setSubmitting] = React.useState(false)
  const [message, setMessage] = React.useState<string | null>(null)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setMessage(null)

    const response = await fetch("/api/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        category,
        price,
        durationMinutes,
        city,
      }),
    })

    setSubmitting(false)

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as {
        error?: string
      } | null
      setMessage(payload?.error ?? "Failed to create service")
      return
    }

    setTitle("")
    setDescription("")
    setCategory("")
    setPrice(0)
    setDurationMinutes(60)
    setCity("")
    setMessage("Service created")
  }

  return (
    <form className="grid gap-4" onSubmit={onSubmit}>
      <div className="grid gap-2">
        <Label htmlFor="service-title">Title</Label>
        <Input
          id="service-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="service-description">Description</Label>
        <Textarea
          id="service-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          required
        />
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="service-category">Category</Label>
          <Input
            id="service-category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="service-city">City</Label>
          <Input
            id="service-city"
            value={city}
            onChange={(event) => setCity(event.target.value)}
            required
          />
        </div>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="service-price">Price (INR)</Label>
          <Input
            id="service-price"
            type="number"
            min={1}
            value={price}
            onChange={(event) => setPrice(Number(event.target.value))}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="service-duration">Duration (minutes)</Label>
          <Input
            id="service-duration"
            type="number"
            min={15}
            step={15}
            value={durationMinutes}
            onChange={(event) => setDurationMinutes(Number(event.target.value))}
            required
          />
        </div>
      </div>
      {message ? (
        <p className="text-sm text-muted-foreground">{message}</p>
      ) : null}
      <Button type="submit" disabled={submitting}>
        {submitting ? "Saving..." : "Create service"}
      </Button>
    </form>
  )
}
