import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Clock, Calendar, User } from "lucide-react";
import { User as UserType } from "@shared/schema";
import AvatarUpload from "@/components/AvatarUpload";
import { formatForDateInput } from "@/lib/dateUtils";
import { useToast } from "@/hooks/use-toast";

const createTrainingSchema = z.object({
  trainerId: z.number().min(1, "Выберите тренера"),
  date: z.string().min(1, "Выберите дату"),
  duration: z.number().min(15, "Минимальная продолжительность 15 минут").max(480, "Максимальная продолжительность 8 часов"),
  notes: z.string().optional(),
});

type CreateTrainingForm = z.infer<typeof createTrainingSchema>;

export default function CreateTraining() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  const { data: users, isLoading: usersLoading } = useQuery<UserType[]>({
    queryKey: ["/api/users"],
  });

  const form = useForm<CreateTrainingForm>({
    resolver: zodResolver(createTrainingSchema),
    defaultValues: {
      date: formatForDateInput(new Date()),
      duration: 60,
      notes: "",
    },
  });

  const createTrainingMutation = useMutation({
    mutationFn: async (data: CreateTrainingForm) => {
      const response = await fetch("/api/training-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          studentId: currentUser.id,
          status: "pending"
        }),
      });
      if (!response.ok) throw new Error("Failed to create training session");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Тренировка создана",
        description: "Запрос на тренировку отправлен тренеру",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/training-sessions"] });
      setLocation("/");
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось создать тренировку",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateTrainingForm) => {
    createTrainingMutation.mutate(data);
  };

  if (usersLoading) {
    return (
      <div className="p-4 pt-12 pb-20">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-app-secondary rounded w-3/4"></div>
          <div className="h-32 bg-app-secondary rounded"></div>
        </div>
      </div>
    );
  }

  // Filter out current user to get potential trainers
  const potentialTrainers = users?.filter(user => user.id !== currentUser.id) || [];

  return (
    <div className="p-4 pt-12 pb-20">
      <div className="flex items-center gap-3 mb-6">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => setLocation("/")}
          className="h-8 w-8"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-2xl font-semibold">Новая тренировка</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Запланировать тренировку
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Trainer Selection */}
              <FormField
                control={form.control}
                name="trainerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Тренер</FormLabel>
                    <Select onValueChange={(value) => field.onChange(Number(value))}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите тренера" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {potentialTrainers.map((trainer) => (
                          <SelectItem key={trainer.id} value={trainer.id.toString()}>
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full overflow-hidden">
                                <AvatarUpload user={trainer} size="sm" showUploadButton={false} />
                              </div>
                              <span>{trainer.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Date */}
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Дата
                    </FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Duration */}
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Продолжительность (минуты)
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="15" 
                        max="480" 
                        step="15"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Notes */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Заметки (необязательно)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Добавьте заметки о тренировке..."
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full"
                disabled={createTrainingMutation.isPending}
              >
                {createTrainingMutation.isPending ? "Создание..." : "Создать тренировку"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}