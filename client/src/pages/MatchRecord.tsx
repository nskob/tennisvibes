import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { ArrowLeft, Minus, Plus, Search, Trash2, Clock, User } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import AvatarUpload from "@/components/AvatarUpload";
import { formatForDateInput, toISOString } from "@/lib/dateUtils";

interface MatchForm {
  opponentId: string;
  date: string;
  sets: Array<{ p1: number; p2: number }>;
  notes: string;
}

interface TrainingForm {
  trainerId: string;
  date: string;
  duration: number;
  notes: string;
}

export default function MatchRecord() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  // Get current user from localStorage
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      setCurrentUserId(user.id);
    } else {
      setCurrentUserId(13); // Fallback to Nikita Skob
    }
  }, []);
  
  const [form, setForm] = useState<MatchForm>({
    opponentId: "",
    date: formatForDateInput(),
    sets: [{ p1: 0, p2: 0 }],
    notes: ""
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Hide suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.search-container')) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const { data: users } = useQuery({
    queryKey: ["/api/users"],
  });

  const createMatchMutation = useMutation({
    mutationFn: (matchData: any) => apiRequest("POST", "/api/matches", matchData),
    onSuccess: async () => {
      // Invalidate specific user data and match queries
      queryClient.invalidateQueries({ queryKey: [`/api/users/${currentUserId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/matches/user/${currentUserId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      
      // Update localStorage with fresh user data
      try {
        const response = await fetch(`/api/users/${currentUserId}`);
        if (response.ok) {
          const updatedUser = await response.json();
          localStorage.setItem("user", JSON.stringify(updatedUser));
          // Trigger custom event to notify other components
          window.dispatchEvent(new Event('userDataUpdated'));
        }
      } catch (error) {
        console.log("Failed to update user data in localStorage");
      }
      
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
    
    if (!currentUserId) {
      toast({
        title: "Ошибка",
        description: "Пользователь не найден. Пожалуйста, войдите в систему.",
        variant: "destructive",
      });
      return;
    }
    
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
    
    const winner = player1SetsWon > player2SetsWon ? currentUserId : parseInt(form.opponentId);

    const matchData = {
      player1Id: currentUserId, // Current user
      player2Id: parseInt(form.opponentId),
      date: toISOString(form.date),
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

  const opponents = Array.isArray(users) ? users.filter((user: any) => user.id !== currentUserId) : [];
  
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
          <div className="relative search-container">
            <div className="relative">
              <Search size={18} className="absolute left-0 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Поиск соперника..."
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
            
            {showSuggestions && !selectedOpponent && opponents && (
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
          <div className="relative">
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm(prev => ({ ...prev, date: e.target.value }))}
              className="w-full py-3 bg-transparent border-0 border-b-2 border-gray-200 focus:outline-none focus:border-gray-800 cursor-pointer transition-colors text-gray-800"
              style={{ 
                backgroundColor: 'var(--app-bg)',
                colorScheme: 'light'
              }}
            />
          </div>
        </div>

        {/* Sets */}
        <div>
          <label className="block text-sm text-gray-600 mb-4">Счет по сетам</label>
          <div className="space-y-6">
            {form.sets.map((set, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-700">Сет {index + 1}</span>
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => removeSet(index)}
                      className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
                <div className="flex items-center justify-center gap-6">
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => updateSet(index, 'p1', Math.max(0, set.p1 - 1).toString())}
                      className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600"
                    >
                      <Minus size={20} />
                    </button>
                    <div className="w-12 text-center">
                      <span className="text-2xl font-light text-gray-800">{set.p1}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => updateSet(index, 'p1', (set.p1 + 1).toString())}
                      className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                  
                  <span className="text-xl text-gray-400">:</span>
                  
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => updateSet(index, 'p2', Math.max(0, set.p2 - 1).toString())}
                      className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600"
                    >
                      <Minus size={20} />
                    </button>
                    <div className="w-12 text-center">
                      <span className="text-2xl font-light text-gray-800">{set.p2}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => updateSet(index, 'p2', (set.p2 + 1).toString())}
                      className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </div>
                {index < form.sets.length - 1 && (
                  <div className="mt-4 border-b border-gray-200"></div>
                )}
              </div>
            ))}
            
            {form.sets.length < 5 && (
              <button
                type="button"
                onClick={addSet}
                className="w-full py-4 text-gray-500 hover:text-gray-700 transition-colors border-b-2 border-dashed border-gray-300 hover:border-gray-400"
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