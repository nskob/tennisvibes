import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AvatarUpload from "./AvatarUpload";
import { User } from "@shared/schema";

const reviewSchema = z.object({
  rating: z.number().min(1, "Поставьте оценку").max(5, "Максимальная оценка 5 звезд"),
  comment: z.string().optional(),
  isAnonymous: z.boolean().default(false),
});

type ReviewForm = z.infer<typeof reviewSchema>;

interface ReviewFormProps {
  reviewedUser: User;
  matchId?: number;
  trainingId?: number;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ReviewFormComponent({ 
  reviewedUser, 
  matchId, 
  trainingId, 
  onClose, 
  onSuccess 
}: ReviewFormProps) {
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  const form = useForm<ReviewForm>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
      comment: "",
      isAnonymous: false,
    },
  });

  const createReviewMutation = useMutation({
    mutationFn: async (data: ReviewForm) => {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          reviewerId: currentUser.id,
          reviewedId: reviewedUser.id,
          matchId,
          trainingId,
        }),
      });
      if (!response.ok) throw new Error("Failed to create review");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Отзыв отправлен",
        description: "Ваша оценка сохранена",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/reviews"] });
      onSuccess?.();
      onClose();
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось отправить отзыв",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ReviewForm) => {
    createReviewMutation.mutate(data);
  };

  const StarRating = ({ value, onChange }: { value: number; onChange: (value: number) => void }) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className="p-1 transition-colors"
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            onClick={() => onChange(star)}
          >
            <Star
              className={`w-8 h-8 transition-colors ${
                star <= (hoveredRating || value)
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Оценить игрока
          </CardTitle>
          <div className="flex items-center gap-3 pt-2">
            <AvatarUpload user={reviewedUser} size="sm" showUploadButton={false} />
            <div>
              <div className="font-medium">{reviewedUser.name}</div>
              <div className="text-sm text-gray-500">
                {matchId ? "Матч" : "Тренировка"}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Rating */}
              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Оценка</FormLabel>
                    <FormControl>
                      <div className="flex flex-col gap-2">
                        <StarRating value={field.value} onChange={field.onChange} />
                        <div className="text-sm text-gray-500">
                          {field.value > 0 && (
                            <span>
                              {field.value === 1 && "Очень плохо"}
                              {field.value === 2 && "Плохо"}
                              {field.value === 3 && "Нормально"}
                              {field.value === 4 && "Хорошо"}
                              {field.value === 5 && "Отлично"}
                            </span>
                          )}
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Comment */}
              <FormField
                control={form.control}
                name="comment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Комментарий (необязательно)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Напишите отзыв об игре..."
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Anonymous */}
              <FormField
                control={form.control}
                name="isAnonymous"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Анонимный отзыв
                      </FormLabel>
                      <div className="text-sm text-gray-500">
                        Ваше имя не будет показано в отзыве
                      </div>
                    </div>
                  </FormItem>
                )}
              />

              <div className="flex gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onClose}
                  className="flex-1"
                >
                  Отмена
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1"
                  disabled={createReviewMutation.isPending || form.watch("rating") === 0}
                >
                  {createReviewMutation.isPending ? "Отправка..." : "Отправить"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}