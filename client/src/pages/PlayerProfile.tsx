import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import AvatarUpload from "@/components/AvatarUpload";
import { ArrowLeft } from "lucide-react";

export default function PlayerProfile() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const playerId = params.id;

  const { data: player, isLoading } = useQuery({
    queryKey: [`/api/users/${playerId}`],
  });

  const { data: matches } = useQuery({
    queryKey: [`/api/matches/user/${playerId}`],
  });

  const { data: training } = useQuery({
    queryKey: [`/api/training/user/${playerId}`],
  });

  if (isLoading) {
    return (
      <div className="p-6 pt-12">
        <div className="animate-pulse space-y-4">
          <div className="h-20 bg-app-secondary rounded"></div>
          <div className="h-32 bg-app-secondary rounded"></div>
        </div>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="p-6 pt-12">
        <div className="text-center text-gray-400">
          Игрок не найден
        </div>
      </div>
    );
  }

  const recentMatches = Array.isArray(matches) ? matches.slice(0, 5) : [];
  const recentTraining = Array.isArray(training) ? training.slice(0, 5) : [];

  const formatDate = (date: string | Date) => {
    const d = new Date(date);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours}ч назад`;
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)}д назад`;
    } else {
      return d.toLocaleDateString('ru-RU');
    }
  };

  return (
    <div className="p-6 pt-12">
      {/* Header with back button */}
      <div className="flex items-center mb-6">
        <ArrowLeft 
          size={24} 
          className="cursor-pointer text-gray-400 hover:text-app-primary mr-4"
          onClick={() => setLocation('/players')}
        />
        <h1 className="text-xl">Профиль игрока</h1>
      </div>

      {/* Player Info */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <AvatarUpload user={player} size="lg" showUploadButton={false} />
        </div>
        <h1 className="text-2xl mb-2">{player.name}</h1>
        <p className="text-gray-400 text-sm">
          {player.club || "Теннисист"}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="text-center">
          <div className="text-2xl font-medium text-app-success">
            {player.wins || 0}
          </div>
          <div className="text-sm text-gray-400">Побед</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-medium text-red-400">
            {player.losses || 0}
          </div>
          <div className="text-sm text-gray-400">Поражений</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-medium">
            {player.matchesPlayed || 0}
          </div>
          <div className="text-sm text-gray-400">Матчей</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-medium">
            {player.tournamentsPlayed || 0}
          </div>
          <div className="text-sm text-gray-400">Турниров</div>
        </div>
      </div>

      {/* Player Info Grid */}
      <div className="grid grid-cols-1 gap-4 mb-8">
        {player.skillLevel && (
          <div className="flex justify-between py-2 border-b border-app-border">
            <span className="text-gray-400">Уровень навыка</span>
            <span>{player.skillLevel}</span>
          </div>
        )}
        {player.playingStyle && (
          <div className="flex justify-between py-2 border-b border-app-border">
            <span className="text-gray-400">Стиль игры</span>
            <span>{player.playingStyle}</span>
          </div>
        )}
        {player.racket && (
          <div className="flex justify-between py-2 border-b border-app-border">
            <span className="text-gray-400">Ракетка</span>
            <span>{player.racket}</span>
          </div>
        )}
      </div>

      {/* Recent Matches */}
      {recentMatches.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg mb-4">Последние матчи</h2>
          <div className="space-y-3">
            {recentMatches.map((match: any) => (
              <div key={match.id} className="text-sm">
                <span className="text-app-text">
                  vs {match.player1Id === player.id ? match.player2Name : match.player1Name}
                </span>
                <span className="text-gray-400 mx-2">·</span>
                <span className="text-gray-400">{formatDate(match.date)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Training */}
      {recentTraining.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg mb-4">Последние тренировки</h2>
          <div className="space-y-3">
            {recentTraining.map((session: any) => (
              <div key={session.id} className="text-sm">
                <span className="text-app-text">
                  {session.coach || 'Самостоятельная тренировка'}
                </span>
                <span className="text-gray-400 mx-2">·</span>
                <span className="text-gray-400">{formatDate(session.date)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}