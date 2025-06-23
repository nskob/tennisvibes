import { useQuery } from "@tanstack/react-query";
import { Star, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AvatarUpload from "./AvatarUpload";
import { formatMatchDate } from "@/lib/dateUtils";
import { Review, User } from "@shared/schema";

interface ReviewsListProps {
  userId: number;
}

interface ReviewWithReviewer extends Review {
  reviewer?: User;
}

export default function ReviewsList({ userId }: ReviewsListProps) {
  const { data: reviews, isLoading } = useQuery<ReviewWithReviewer[]>({
    queryKey: ["/api/reviews/user", userId],
    queryFn: async () => {
      const response = await fetch(`/api/reviews/user/${userId}`);
      if (!response.ok) throw new Error("Failed to fetch reviews");
      const reviewsData = await response.json();
      
      // Fetch reviewer data for non-anonymous reviews
      const enrichedReviews = await Promise.all(
        reviewsData.map(async (review: Review) => {
          if (!review.isAnonymous) {
            try {
              const reviewerResponse = await fetch(`/api/users/${review.reviewerId}`);
              if (reviewerResponse.ok) {
                const reviewer = await reviewerResponse.json();
                return { ...review, reviewer };
              }
            } catch (error) {
              console.error("Failed to fetch reviewer:", error);
            }
          }
          return review;
        })
      );
      
      return enrichedReviews;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse">
            <div className="h-24 bg-app-secondary rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center text-gray-400 py-8">
        <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <div className="font-medium mb-1">Нет отзывов</div>
        <div className="text-sm">Пока никто не оставил отзыв об этом игроке</div>
      </div>
    );
  }

  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

  return (
    <div className="space-y-4">
      {/* Rating Summary */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{averageRating.toFixed(1)}</div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= Math.round(averageRating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>
            <div className="text-sm text-gray-500">
              {reviews.length} {reviews.length === 1 ? "отзыв" : "отзывов"}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Reviews */}
      <div className="space-y-3">
        {reviews.map((review) => (
          <Card key={review.id}>
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  {review.isAnonymous ? (
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 text-sm font-medium">А</span>
                    </div>
                  ) : review.reviewer ? (
                    <AvatarUpload user={review.reviewer} size="sm" showUploadButton={false} />
                  ) : (
                    <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="font-medium text-sm">
                        {review.isAnonymous ? "Анонимно" : review.reviewer?.name || "Неизвестный пользователь"}
                      </div>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3 h-3 ${
                              star <= review.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="text-xs text-gray-400">
                      {formatMatchDate(review.createdAt || new Date())}
                    </div>
                  </div>
                  
                  {review.comment && (
                    <div className="text-sm text-gray-700 leading-relaxed">
                      {review.comment}
                    </div>
                  )}
                  
                  {(review.matchId || review.trainingId) && (
                    <div className="text-xs text-gray-400 mt-2">
                      {review.matchId ? "После матча" : "После тренировки"}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}