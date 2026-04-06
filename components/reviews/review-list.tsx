import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type ReviewItem = {
  id: string
  rating: number
  comment?: string | null
  createdAt: string
  customer?: {
    name?: string | null
  }
}

export function ReviewList({ reviews }: { reviews: ReviewItem[] }) {
  return (
    <div className="grid gap-4">
      {reviews.map((review) => (
        <Card key={review.id}>
          <CardHeader>
            <CardTitle className="text-base">
              {"*".repeat(review.rating)} ({review.rating}/5)
            </CardTitle>
            <CardDescription>
              {review.customer?.name ?? "Customer"} -{" "}
              {new Date(review.createdAt).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent>{review.comment ?? "No written review."}</CardContent>
        </Card>
      ))}
      {reviews.length === 0 && (
        <Card>
          <CardContent className="text-muted-foreground">
            No reviews yet.
          </CardContent>
        </Card>
      )}
    </div>
  )
}
