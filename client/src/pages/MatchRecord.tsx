import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Plus, X } from "lucide-react";
import AvatarUpload from "@/components/AvatarUpload";

interface MatchForm {
  opponentId: string;
  date: string;
  sets: Array<{ p1: number; p2: number }>;
  notes: string;
}

export default function MatchRecord() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [form, setForm] = useState<MatchForm>({
    opponentId: "",
    date: new Date().toISOString().split('T')[0],
    sets: [{ p1: 0, p2: 0 }],
    notes: ""
  });
  
  const [opponentSearch, setOpponentSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedOpponent, setSelectedOpponent] = useState<any>(null);

  const { data: users } = useQuery({
    queryKey: ["/api/users"],
  });

  const createMatchMutation = useMutation({
    mutationFn: async (matchData: any) => {
      const response = await apiRequest("POST", "/api/matches", matchData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Матч записан",
        description: "Ваш матч успешно сохранен.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/matches"] });
      setLocation("/home");
    },
    onError: (error) => {
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить матч. Попробуйте еще раз.",
        variant: "destructive",
      });
    },
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
        description: "Пожалуйста, введите результат хотя бы одного сета.",
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
      type: "casual",
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

  const addSet = () => {
    setForm(prev => ({
      ...prev,
      sets: [...prev.sets, { p1: 0, p2: 0 }]
    }));
  };

  const removeSet = (index: number) => {
    if (form.sets.length > 1) {
      setForm(prev => ({
        ...prev,
        sets: prev.sets.filter((_, i) => i !== index)
      }));
    }
  };

  const opponents = Array.isArray(users) ? users.filter((user: any) => user.id !== 1) : [];
  
  const filteredOpponents = opponents.filter((user: any) =>
    user.name.toLowerCase().includes(opponentSearch.toLowerCase())
  );

  const selectOpponent = (opponent: any) => {
    setSelectedOpponent(opponent);
    setForm(prev => ({ ...prev, opponentId: opponent.id.toString() }));
    setOpponentSearch(opponent.name);
    setShowSuggestions(false);
  };

  const clearOpponent = () => {
    setSelectedOpponent(null);
    setForm(prev => ({ ...prev, opponentId: "" }));
    setOpponentSearch("");
  };

  return (
    <div className="px-4 sm:px-6 pt-8 sm:pt-12 pb-24 max-w-md mx-auto" style={{ backgroundColor: 'var(--app-bg)', color: 'var(--app-text)' }}>
      <h1 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8">Запись матча</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Opponent Selection */}
        <div>
          <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Соперник</h3>
          <div className="relative">
            {selectedOpponent ? (
              <div className="flex items-center justify-between py-3 px-4 rounded-lg border" style={{ borderColor: 'var(--app-border)', backgroundColor: 'var(--app-secondary)' }}>
                <div className="flex items-center gap-3">
                  <AvatarUpload user={selectedOpponent} size="sm" showUploadButton={false} />
                  <span className="text-sm">{selectedOpponent.name}</span>
                </div>
                <button 
                  type="button" 
                  onClick={clearOpponent}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <>
                <Input
                  type="text"
                  placeholder="Поиск соперника..."
                  value={opponentSearch}
                  onChange={(e) => {
                    setOpponentSearch(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  className="w-full py-3 px-4 border rounded-lg"
                  style={{ borderColor: 'var(--app-border)', backgroundColor: 'var(--app-secondary)', color: 'var(--app-text)' }}
                />
                {showSuggestions && opponentSearch && (
                  <div className="absolute z-10 w-full mt-1 border rounded-lg shadow-lg max-h-48 overflow-y-auto" style={{ backgroundColor: 'var(--app-bg)', borderColor: 'var(--app-border)' }}>
                    {filteredOpponents.length > 0 ? (
                      filteredOpponents.map((opponent: any) => (
                        <button
                          key={opponent.id}
                          type="button"
                          onClick={() => selectOpponent(opponent)}
                          className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
                          style={{ color: 'var(--app-text)' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--app-secondary)'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <AvatarUpload user={opponent} size="sm" showUploadButton={false} />
                          <span className="text-sm">{opponent.name}</span>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-sm text-gray-500">
                        Соперники не найдены
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Date */}
        <div>
          <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Дата</h3>
          <Input
            type="date"
            value={form.date}
            onChange={(e) => setForm(prev => ({ ...prev, date: e.target.value }))}
            className="w-full py-3 px-4 border rounded-lg"
            style={{ borderColor: 'var(--app-border)', backgroundColor: 'var(--app-secondary)', color: 'var(--app-text)' }}
          />
        </div>

        {/* Score */}
        <div>
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-base sm:text-lg font-semibold">Счет</h3>
            <button
              type="button"
              onClick={addSet}
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
            >
              <Plus size={16} />
              Добавить сет
            </button>
          </div>
          <div className="space-y-3">
            {form.sets.map((set, index) => (
              <div key={index} className="flex items-center gap-3">
                <span className="text-sm w-16">Сет {index + 1}:</span>
                <Input
                  type="number"
                  placeholder="0"
                  min="0"
                  max="99"
                  value={set.p1 || ""}
                  onChange={(e) => updateSet(index, 'p1', e.target.value)}
                  className="w-16 text-center border rounded py-2"
                  style={{ borderColor: 'var(--app-border)', backgroundColor: 'var(--app-secondary)', color: 'var(--app-text)' }}
                />
                <span className="text-gray-400">-</span>
                <Input
                  type="number"
                  placeholder="0"
                  min="0"
                  max="99"
                  value={set.p2 || ""}
                  onChange={(e) => updateSet(index, 'p2', e.target.value)}
                  className="w-16 text-center border rounded py-2"
                  style={{ borderColor: 'var(--app-border)', backgroundColor: 'var(--app-secondary)', color: 'var(--app-text)' }}
                />
                {form.sets.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSet(index)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Заметки</h3>
          <Textarea
            value={form.notes}
            onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Заметки о матче..."
            rows={3}
            className="w-full border rounded-lg resize-none"
            style={{ borderColor: 'var(--app-border)', backgroundColor: 'var(--app-secondary)', color: 'var(--app-text)' }}
          />
        </div>

        <div className="flex gap-4 pt-4">
          <Button
            type="button"
            onClick={() => setLocation("/home")}
            variant="outline"
            className="flex-1"
          >
            Отмена
          </Button>
          <Button
            type="submit"
            disabled={createMatchMutation.isPending}
            className="flex-1"
            style={{ backgroundColor: 'var(--app-primary)', color: 'var(--app-bg)' }}
          >
            {createMatchMutation.isPending ? "Сохранение..." : "Сохранить матч"}
          </Button>
        </div>
      </form>
    </div>
  );
}