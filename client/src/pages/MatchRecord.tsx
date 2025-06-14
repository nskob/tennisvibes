import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

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
    mutationFn: async (matchData: any) => {
      const response = await apiRequest("POST", "/api/matches", matchData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Match Recorded",
        description: "Your match has been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/matches"] });
      setLocation("/home");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save match. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.opponentId) {
      toast({
        title: "Error",
        description: "Please select an opponent.",
        variant: "destructive",
      });
      return;
    }

    // Filter out empty sets
    const validSets = form.sets.filter(set => set.p1 > 0 || set.p2 > 0);
    
    if (validSets.length === 0) {
      toast({
        title: "Error",
        description: "Please enter at least one set score.",
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

  const opponents = users?.filter((user: any) => user.id !== 1) || [];

  return (
    <div className="p-6 pt-12">
      <h1 className="text-2xl mb-8">Record Match</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Opponent Selection */}
        <div>
          <Label className="block text-sm mb-2">Opponent</Label>
          <Select value={form.opponentId} onValueChange={(value) => setForm(prev => ({ ...prev, opponentId: value }))}>
            <SelectTrigger className="w-full bg-app-secondary text-app-text border-none">
              <SelectValue placeholder="Select opponent" />
            </SelectTrigger>
            <SelectContent>
              {opponents.map((user: any) => (
                <SelectItem key={user.id} value={user.id.toString()}>
                  {user.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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

        {/* Match Type */}
        <div>
          <Label className="block text-sm mb-2">Type</Label>
          <RadioGroup
            value={form.type}
            onValueChange={(value) => setForm(prev => ({ ...prev, type: value }))}
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="casual" id="casual" />
              <Label htmlFor="casual">Casual</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="tournament" id="tournament" />
              <Label htmlFor="tournament">Tournament</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Score */}
        <div>
          <Label className="block text-sm mb-2">Score</Label>
          <div className="space-y-3">
            {form.sets.map((set, index) => (
              <div key={index} className="flex items-center space-x-4">
                <span className="text-sm w-12">Set {index + 1}:</span>
                <Input
                  type="number"
                  placeholder="0"
                  min="0"
                  max="99"
                  value={set.p1 || ""}
                  onChange={(e) => updateSet(index, 'p1', e.target.value)}
                  className="w-16 bg-app-secondary text-app-text text-center border-none"
                />
                <span>-</span>
                <Input
                  type="number"
                  placeholder="0"
                  min="0"
                  max="99"
                  value={set.p2 || ""}
                  onChange={(e) => updateSet(index, 'p2', e.target.value)}
                  className="w-16 bg-app-secondary text-app-text text-center border-none"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <Label className="block text-sm mb-2">Notes</Label>
          <Textarea
            value={form.notes}
            onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Match notes..."
            rows={3}
            className="w-full bg-app-secondary text-app-text border-none resize-none"
          />
        </div>

        <Button
          type="submit"
          disabled={createMatchMutation.isPending}
          className="btn-text text-app-success bg-transparent border-none p-0 h-auto hover:bg-transparent"
        >
          {createMatchMutation.isPending ? "Saving..." : "Save Match"}
        </Button>
      </form>
    </div>
  );
}
