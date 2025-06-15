import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { ArrowLeft, Minus, Plus, Search } from "lucide-react";
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

  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Hide suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setShowSuggestions(false);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

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

  const opponents = Array.isArray(users) ? users.filter((user: any) => user.id !== 1) : [];
  
  const filteredOpponents = opponents.filter((opponent: any) =>
    opponent.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedOpponent = opponents.find((opponent: any) => 
    opponent.id.toString() === form.opponentId
  );

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
        {/* Opponent Selection with Search */}
        <div>
          <label className="block text-sm text-gray-600 mb-3">Соперник</label>
          <div className="relative">
            <div className="relative">
              <Search size={18} className="absolute left-0 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={selectedOpponent ? selectedOpponent.name : "Поиск соперника..."}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                className="w-full pl-6 pr-4 py-3 bg-transparent border-0 border-b-2 border-gray-200 focus:outline-none focus:border-gray-800 transition-colors"
                style={{ backgroundColor: 'var(--app-bg)' }}
              />
            </div>
            
            {showSuggestions && !selectedOpponent && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {(searchQuery ? filteredOpponents : opponents).length > 0 ? (
                  (searchQuery ? filteredOpponents : opponents).map((opponent: any) => (
                    <div
                      key={opponent.id}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer"
                      onClick={() => {
                        setForm(prev => ({ ...prev, opponentId: opponent.id.toString() }));
                        setSearchQuery("");
                        setShowSuggestions(false);
                      }}
                    >
                      <AvatarUpload user={opponent} size="sm" showUploadButton={false} />
                      <span className="text-sm">{opponent.name}</span>
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-sm text-gray-500">Нет результатов</div>
                )}
              </div>
            )}
            
            {selectedOpponent && (
              <div className="mt-3 flex items-center gap-3">
                <AvatarUpload user={selectedOpponent} size="sm" showUploadButton={false} />
                <span className="text-sm text-gray-700">{selectedOpponent.name}</span>
                <button
                  type="button"
                  onClick={() => {
                    setForm(prev => ({ ...prev, opponentId: "" }));
                    setSearchQuery("");
                  }}
                  className="ml-auto text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm text-gray-600 mb-3">Дата</label>
          <input
            type="text"
            value={new Date(form.date).toLocaleDateString('ru-RU', { 
              day: 'numeric', 
              month: 'long', 
              year: 'numeric' 
            })}
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'date';
              input.value = form.date;
              input.onchange = (e) => setForm(prev => ({ ...prev, date: (e.target as HTMLInputElement).value }));
              input.click();
            }}
            readOnly
            className="w-full py-3 bg-transparent border-0 border-b-2 border-gray-200 focus:outline-none focus:border-gray-800 cursor-pointer transition-colors"
            style={{ backgroundColor: 'var(--app-bg)' }}
          />
        </div>

        {/* Sets */}
        <div>
          <label className="block text-sm text-gray-600 mb-4">Счет по сетам</label>
          <div className="space-y-4">
            {form.sets.map((set, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">Сет {index + 1}</span>
                </div>
                <div className="flex items-center justify-center gap-4">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => updateSet(index, 'p1', Math.max(0, set.p1 - 1).toString())}
                      className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-gray-200 hover:bg-gray-100"
                    >
                      <Minus size={16} />
                    </button>
                    <div className="w-16 h-16 flex items-center justify-center bg-white border-2 border-gray-200 rounded-lg">
                      <span className="text-xl font-bold text-gray-800">{set.p1}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => updateSet(index, 'p1', (set.p1 + 1).toString())}
                      className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-gray-200 hover:bg-gray-100"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  
                  <span className="text-2xl font-bold text-gray-400">:</span>
                  
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => updateSet(index, 'p2', Math.max(0, set.p2 - 1).toString())}
                      className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-gray-200 hover:bg-gray-100"
                    >
                      <Minus size={16} />
                    </button>
                    <div className="w-16 h-16 flex items-center justify-center bg-white border-2 border-gray-200 rounded-lg">
                      <span className="text-xl font-bold text-gray-800">{set.p2}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => updateSet(index, 'p2', (set.p2 + 1).toString())}
                      className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-gray-200 hover:bg-gray-100"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {form.sets.length < 5 && (
              <button
                type="button"
                onClick={addSet}
                className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors"
              >
                + Добавить сет
              </button>
            )}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm text-gray-600 mb-3">Заметки (по желанию)</label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Добавьте заметки о матче..."
            className="w-full py-3 bg-transparent border-0 border-b-2 border-gray-200 focus:outline-none focus:border-gray-800 resize-none transition-colors"
            style={{ backgroundColor: 'var(--app-bg)' }}
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