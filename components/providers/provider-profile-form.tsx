"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

type ProviderProfileFormProps = {
  initialValues?: {
    bio?: string | null
    experience?: number | null
    serviceArea?: string | null
  }
}

export function ProviderProfileForm({
  initialValues,
}: ProviderProfileFormProps) {
  const [bio, setBio] = React.useState(initialValues?.bio ?? "")
  const [experience, setExperience] = React.useState(
    initialValues?.experience ?? 0
  )
  const [serviceArea, setServiceArea] = React.useState(
    initialValues?.serviceArea ?? ""
  )
  const [submitting, setSubmitting] = React.useState(false)
  const [message, setMessage] = React.useState<string | null>(null)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setMessage(null)

    const response = await fetch("/api/providers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bio, experience, serviceArea }),
    })

    setSubmitting(false)

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as {
        error?: string
      } | null
      setMessage(payload?.error ?? "Failed to save provider profile")
      return
    }

    setMessage("Provider profile saved")
  }

  return (
    <form className="grid gap-4" onSubmit={onSubmit}>
      <div className="grid gap-2">
        <Label htmlFor="provider-bio">Bio</Label>
        <Textarea
          id="provider-bio"
          value={bio}
          onChange={(event) => setBio(event.target.value)}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="provider-experience">Experience (years)</Label>
        <Input
          id="provider-experience"
          type="number"
          min={0}
          value={experience}
          onChange={(event) => setExperience(Number(event.target.value))}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="provider-area">Service area</Label>
        <Input
          id="provider-area"
          value={serviceArea}
          onChange={(event) => setServiceArea(event.target.value)}
        />
      </div>
      {message ? (
        <p className="text-sm text-muted-foreground">{message}</p>
      ) : null}
      <Button type="submit" disabled={submitting}>
        {submitting ? "Saving..." : "Save profile"}
      </Button>
    </form>
  )
}
