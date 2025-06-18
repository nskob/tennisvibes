import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { formatMatchDate, formatAbsoluteDate } from "@/lib/dateUtils";
import { Match, User } from "@shared/schema";

// Format match score for display
function formatMatchScore(sets: Array<{ p1: number; p2: number }>): string {
  return sets.map(set => `${set.p1}-${set.p2}`).join(', ');
}

export default function MatchDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  
  const { data: match, isLoading: matchLoading } = useQuery<Match>({
    queryKey: [`/api/matches/${id}`],
    enabled: !!id,
  });

  const { data: player1 } = useQuery<User>({
    queryKey: [`/api/users/${match?.player1Id}`],
    enabled: !!match?.player1Id,
  });

  const { data: player2 } = useQuery<User>({
    queryKey: [`/api/users/${match?.player2Id}`],
    enabled: !!match?.player2Id,
  });

  if (matchLoading) {
    return (
      <div className="max-w-md mx-auto p-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="max-w-md mx-auto p-4">
        <div className="text-center">
          <h1 className="text-xl font-bold mb-4">Матч не найден</h1>
          <button 
            onClick={() => setLocation('/')}
            className="text-blue-600 hover:underline"
          >
            Вернуться на главную
          </button>
        </div>
      </div>
    );
  }

  const currentUserId = JSON.parse(localStorage.getItem("user") || "{}").id;
  const isPlayer1Current = match.player1Id === currentUserId;
  const winner = match.winner === match.player1Id ? player1 : player2;
  const loser = match.winner === match.player1Id ? player2 : player1;

  return (
    <div className="max-w-md mx-auto p-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button 
          onClick={() => setLocation('/')}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold">Детали матча</h1>
      </div>

      {/* Match Info */}
      <div className="bg-white rounded-lg border p-4 mb-4">
        <div className="text-center mb-4">
          <p className="text-sm text-gray-600 mb-1">{formatAbsoluteDate(match.date)}</p>
          <p className="text-xs text-gray-500 capitalize">{match.type}</p>
        </div>

        {/* Players */}
        <div className="space-y-4">
          {/* Player 1 */}
          <div className={`flex items-center justify-between p-3 rounded-lg ${match.winner === match.player1Id ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-3">
              {player1 && (
                <Avatar className="w-10 h-10">
                  <AvatarImage src={player1.avatarUrl || undefined} alt={player1.name} />
                  <AvatarFallback>
                    {player1.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              )}
              <div>
                <p className="font-medium">{player1?.name || 'Неизвестный игрок'}</p>
                {match.winner === match.player1Id && (
                  <p className="text-xs text-green-600 font-medium">Победитель</p>
                )}
              </div>
            </div>
          </div>

          {/* VS */}
          <div className="text-center text-gray-400 text-sm font-medium">
            VS
          </div>

          {/* Player 2 */}
          <div className={`flex items-center justify-between p-3 rounded-lg ${match.winner === match.player2Id ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-3">
              {player2 && (
                <Avatar className="w-10 h-10">
                  <AvatarImage src={player2.avatarUrl || undefined} alt={player2.name} />
                  <AvatarFallback>
                    {player2.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              )}
              <div>
                <p className="font-medium">{player2?.name || 'Неизвестный игрок'}</p>
                {match.winner === match.player2Id && (
                  <p className="text-xs text-green-600 font-medium">Победитель</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Score Details */}
      <div className="bg-white rounded-lg border p-4">
        <h3 className="font-semibold mb-3">Счет по сетам</h3>
        <div className="space-y-2">
          {match.sets.map((set, index) => (
            <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <span className="text-sm font-medium">Сет {index + 1}</span>
              <span className="font-mono text-sm">
                {set.p1} - {set.p2}
              </span>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-3 border-t">
          <div className="flex justify-between items-center">
            <span className="font-medium">Итоговый счет:</span>
            <span className="font-mono text-lg">
              {formatMatchScore(match.sets)}
            </span>
          </div>
        </div>

        {match.notes && (
          <div className="mt-4 pt-3 border-t">
            <h4 className="font-medium mb-2">Заметки:</h4>
            <p className="text-sm text-gray-600">{match.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}