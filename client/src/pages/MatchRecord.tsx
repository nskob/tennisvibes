import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { ArrowLeft, Minus, Plus } from "lucide-react";
import AvatarUpload from "@/components/AvatarUpload";

interface MatchForm {
  opponentId: string;
  date: string;
  type: string;
  sets: Array<{ p1: number; p2: number }>;
  notes: string;
}

export default function MatchRecord() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [form, setForm] = useState<MatchForm>({
    opponentId: "",
    date: new Date().toISOString().split('T')[0],
    type: "casual",
    sets: [
      { p1: 0, p2: 0 },
      { p1: 0, p2: 0 },
      { p1: 0, p2: 0 }
    ],
    notes: ""
  });

  const { data: users } = useQuery({
    queryKey: ["/api/users"],
  });

  const createMatchMutation = useMutation({
    mutationFn: (matchData: any) => apiRequest({
      url: "/api/matches",
      method: "POST",
      body: matchData,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/matches"] });
      toast({
        title: "Успех",
        description: "Матч успешно записан!",
      });
      setLocation("/");
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось записать матч.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.opponentId) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, выберите соперника.",
        variant: "destructive",
      });
      return;
    }

    // Filter out empty sets
    const validSets = form.sets.filter(set => set.p1 > 0 || set.p2 > 0);
    
    if (validSets.length === 0) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, введите счет хотя бы одного сета.",
        variant: "destructive",
      });
      return;
    }

    // Determine winner based on sets won
    const player1SetsWon = validSets.filter(set => set.p1 > set.p2).length;
    const player2SetsWon = validSets.filter(set => set.p2 > set.p1).length;
    
    const winner = player1SetsWon > player2SetsWon ? 1 : parseInt(form.opponentId);

    const matchData = {
      player1Id: 1, // Current user
      player2Id: parseInt(form.opponentId),
      date: new Date(form.date),
      sets: validSets,
      winner,
      type: form.type,
      notes: form.notes || undefined,
    };

    createMatchMutation.mutate(matchData);
  };

  const updateSet = (index: number, player: 'p1' | 'p2', value: string) => {
    const numValue = parseInt(value) || 0;
    setForm(prev => ({
      ...prev,
      sets: prev.sets.map((set, i) => 
        i === index ? { ...set, [player]: numValue } : set
      )
    }));
  };

  const opponents = Array.isArray(users) ? users.filter((user: any) => user.id !== 1) : [];

  return (
    <div className="px-4 sm:px-6 pt-8 sm:pt-12 pb-24 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button 
          onClick={() => setLocation('/')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <h1 className="text-xl sm:text-2xl font-semibold">Запись матча</h1>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Opponent Selection */}
        <div>
          <label className="block text-sm text-gray-600 mb-3">Соперник</label>
          <div className="space-y-2">
            {opponents.map((opponent: any) => (
              <div 
                key={opponent.id}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  form.opponentId === opponent.id.toString() 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setForm(prev => ({ ...prev, opponentId: opponent.id.toString() }))}
              >
                <AvatarUpload user={opponent} size="sm" showUploadButton={false} />
                <span className="text-sm">{opponent.name}</span>
                <input
                  type="radio"
                  name="opponent"
                  value={opponent.id}
                  checked={form.opponentId === opponent.id.toString()}
                  onChange={() => {}}
                  className="ml-auto"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm text-gray-600 mb-2">Дата</label>
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm(prev => ({ ...prev, date: e.target.value }))}
            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Match Type */}
        <div>
          <label className="block text-sm text-gray-600 mb-3">Тип матча</label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setForm(prev => ({ ...prev, type: 'casual' }))}
              className={`flex-1 p-3 text-sm rounded-lg border transition-colors ${
                form.type === 'casual' 
                  ? 'border-blue-500 bg-blue-50 text-blue-700' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              Любительский
            </button>
            <button
              type="button"
              onClick={() => setForm(prev => ({ ...prev, type: 'tournament' }))}
              className={`flex-1 p-3 text-sm rounded-lg border transition-colors ${
                form.type === 'tournament' 
                  ? 'border-blue-500 bg-blue-50 text-blue-700' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              Турнир
            </button>
          </div>
        </div>

        {/* Sets */}
        <div>
          <label className="block text-sm text-gray-600 mb-3">Счет по сетам</label>
          <div className="space-y-3">
            {form.sets.map((set, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 w-12">Сет {index + 1}</span>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateSet(index, 'p1', Math.max(0, set.p1 - 1).toString())}
                      className="p-1 rounded-full hover:bg-gray-100"
                    >
                      <Minus size={16} />
                    </button>
                    <input
                      type="number"
                      value={set.p1 || ''}
                      onChange={(e) => updateSet(index, 'p1', e.target.value)}
                      className="w-12 p-2 text-center border border-gray-200 rounded focus:outline-none focus:border-blue-500"
                      min="0"
                    />
                    <button
                      type="button"
                      onClick={() => updateSet(index, 'p1', (set.p1 + 1).toString())}
                      className="p-1 rounded-full hover:bg-gray-100"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <span className="text-gray-400">:</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateSet(index, 'p2', Math.max(0, set.p2 - 1).toString())}
                      className="p-1 rounded-full hover:bg-gray-100"
                    >
                      <Minus size={16} />
                    </button>
                    <input
                      type="number"
                      value={set.p2 || ''}
                      onChange={(e) => updateSet(index, 'p2', e.target.value)}
                      className="w-12 p-2 text-center border border-gray-200 rounded focus:outline-none focus:border-blue-500"
                      min="0"
                    />
                    <button
                      type="button"
                      onClick={() => updateSet(index, 'p2', (set.p2 + 1).toString())}
                      className="p-1 rounded-full hover:bg-gray-100"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm text-gray-600 mb-2">Заметки (по желанию)</label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Добавьте заметки о матче..."
            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 resize-none"
            rows={3}
          />
        </div>

        {/* Submit */}
        <div className="flex gap-3 pt-4">
          <button 
            type="button" 
            onClick={() => setLocation('/')}
            className="flex-1 p-3 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Отмена
          </button>
          <button 
            type="submit" 
            disabled={createMatchMutation.isPending}
            className="flex-1 p-3 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {createMatchMutation.isPending ? 'Сохранение...' : 'Сохранить матч'}
          </button>
        </div>
      </form>
    </div>
  );
}