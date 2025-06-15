import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

interface TrainingForm {
  coach: string;
  type: string;
  duration: number;
  date: string;
  notes: string;
}

export default function Training() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [form, setForm] = useState<TrainingForm>({
    coach: "",
    type: "",
    duration: 60,
    date: new Date().toISOString().split('T')[0],
    notes: ""
  });

  const createTrainingMutation = useMutation({
    mutationFn: async (trainingData: any) => {
      const response = await apiRequest("POST", "/api/training", trainingData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Тренировка записана",
        description: "Ваша тренировка успешно сохранена.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/training"] });
      setLocation("/home");
    },
    onError: (error) => {
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить тренировку. Попробуйте еще раз.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.type) {
      toast({
        title: "Error",
        description: "Please select a training type.",
        variant: "destructive",
      });
      return;
    }

    const trainingData = {
      userId: 1, // Current user
      coach: form.coach || undefined,
      type: form.type,
      duration: form.duration,
      date: new Date(form.date),
      notes: form.notes || undefined,
    };

    createTrainingMutation.mutate(trainingData);
  };

  const trainingTypes = [
    { value: "serve", label: "Подача" },
    { value: "backhand", label: "Бэкхенд" },
    { value: "physical", label: "Физическая подготовка" },
    { value: "match", label: "Игровая практика" },
  ];

  return (
    <div className="p-6 pt-12">
      <h1 className="text-2xl mb-8">Запись тренировки</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Coach */}
        <div>
          <Label className="block text-sm mb-2">Тренер</Label>
          <Input
            type="text"
            placeholder="Имя тренера (не обязательно)"
            value={form.coach}
            onChange={(e) => setForm(prev => ({ ...prev, coach: e.target.value }))}
            className="w-full bg-app-secondary text-app-text border-none"
          />
        </div>

        {/* Training Type */}
        <div>
          <Label className="block text-sm mb-2">Тип</Label>
          <Select value={form.type} onValueChange={(value) => setForm(prev => ({ ...prev, type: value }))}>
            <SelectTrigger className="w-full bg-app-secondary text-app-text border-none">
              <SelectValue placeholder="Выберите тип тренировки" />
            </SelectTrigger>
            <SelectContent>
              {trainingTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Duration */}
        <div>
          <Label className="block text-sm mb-2">Duration</Label>
          <div className="px-3">
            <Slider
              value={[form.duration]}
              onValueChange={(value) => setForm(prev => ({ ...prev, duration: value[0] }))}
              max={120}
              min={30}
              step={15}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-2">
              <span>30min</span>
              <span className="font-medium text-app-text">{form.duration}min</span>
              <span>120min</span>
            </div>
          </div>
        </div>

        {/* Date */}
        <div>
          <Label className="block text-sm mb-2">Date</Label>
          <Input
            type="date"
            value={form.date}
            onChange={(e) => setForm(prev => ({ ...prev, date: e.target.value }))}
            className="w-full bg-app-secondary text-app-text border-none"
          />
        </div>

        {/* Notes */}
        <div>
          <Label className="block text-sm mb-2">Notes</Label>
          <Textarea
            value={form.notes}
            onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Training notes..."
            rows={3}
            className="w-full bg-app-secondary text-app-text border-none resize-none"
          />
        </div>

        <Button
          type="submit"
          disabled={createTrainingMutation.isPending}
          className="btn-text text-app-success bg-transparent border-none p-0 h-auto hover:bg-transparent"
        >
          {createTrainingMutation.isPending ? "Saving..." : "Save Training"}
        </Button>
      </form>
    </div>
  );
}
