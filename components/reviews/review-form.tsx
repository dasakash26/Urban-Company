"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type ReviewFormProps = {
  bookingId: string
  onSuccess?: () => void
}

export function ReviewForm({ bookingId, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = React.useState(5)
  const [comment, setComment] = React.useState("")
  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState(false)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    setSuccess(false)

    const response = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId, rating, comment }),
    })

    setSubmitting(false)

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as {
        error?: string
      } | null
      setError(payload?.error ?? "Failed to submit review")
      return
    }

    setSuccess(true)
    setRating(5)
    setComment("")
    onSuccess?.()
  }

  if (success) {
    return (
      <div className="flex flex-col items-center gap-2 py-4 text-center">
        <div className="size-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-lg">✓</div>
        <p className="text-sm font-medium text-foreground">Review submitted!</p>
        <p className="text-xs text-muted-foreground">Thank you for your feedback.</p>
      </div>
    )
  }

  return (
    <form className="grid gap-4" onSubmit={onSubmit}>
      <div className="grid gap-2">
        <Label>Rating</Label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className="p-0.5 transition-transform hover:scale-125 focus:outline-none"
              aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
            >
              <span className={`text-2xl ${star <= rating ? "text-amber-400" : "text-muted-foreground/30"}`}>
                ★
              </span>
            </button>
          ))}
          <span className="ml-2 text-sm text-muted-foreground">{rating}/5</span>
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor={`comment-${bookingId}`}>Comment</Label>
        <Textarea
          id={`comment-${bookingId}`}
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder="Share your experience..."
          className="bg-background/80"
        />
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" disabled={submitting} size="sm">
        {submitting ? "Submitting..." : "Submit review"}
      </Button>
    </form>
  )
}
