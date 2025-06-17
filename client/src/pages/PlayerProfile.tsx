import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import AvatarUpload from "@/components/AvatarUpload";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Award, Star, Phone, Mail, Clock, Users } from "lucide-react";
import { formatMatchDate } from "@/lib/dateUtils";
import { User } from "@shared/schema";

export default function PlayerProfile() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const playerId = params.id;

  const { data: player, isLoading } = useQuery<User>({
    queryKey: [`/api/users/${playerId}`],
  });

  const { data: matches } = useQuery({
    queryKey: [`/api/matches/user/${playerId}`],
  });

  const { data: training } = useQuery({
    queryKey: [`/api/training/user/${playerId}`],
  });

  // If this is a coach, get their training sessions as a coach
  const { data: coachTraining } = useQuery({
    queryKey: [`/api/training/coach/${playerId}`],
    enabled: player?.isCoach === true,
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
  const recentCoachTraining = Array.isArray(coachTraining) ? coachTraining.slice(0, 5) : [];

  const getSpecializationLabel = (specialization: string | null) => {
    const labels: Record<string, string> = {
      serve: "Подача",
      backhand: "Бэкхенд",
      forehand: "Форхенд", 
      volley: "Игра у сетки",
      fitness: "Физподготовка",
      mental: "Психология",
      general: "Общая подготовка",
    };
    return specialization ? labels[specialization] || specialization : "Общая подготовка";
  };

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
        <div className="flex items-center justify-center gap-2 mb-2">
          <h1 className="text-2xl">{player.name}</h1>
          {player.isCoach && (
            <Badge variant="secondary">
              <Award className="w-3 h-3 mr-1" />
              Тренер
            </Badge>
          )}
        </div>
        <p className="text-gray-400 text-sm">
          {player.club || "Теннисист"}
        </p>
        
        {/* Coach-specific info */}
        {player.isCoach && (
          <div className="mt-4 space-y-2">
            {player.specialization && (
              <p className="text-blue-600 text-sm">
                {getSpecializationLabel(player.specialization)}
              </p>
            )}
            
            {player.rating && (
              <div className="flex items-center justify-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{player.rating}</span>
                {player.experience && (
                  <span className="text-gray-400 text-sm ml-2">
                    {player.experience} лет опыта
                  </span>
                )}
              </div>
            )}
            
            {player.bio && (
              <p className="text-gray-600 text-sm mt-3 max-w-md mx-auto">
                {player.bio}
              </p>
            )}
          </div>
        )}
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

      {/* Coach-specific stats and contact */}
      {player.isCoach && (
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-4">Информация о тренере</h3>
          
          {/* Coach stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-medium text-blue-600">
                {recentCoachTraining.length}
              </div>
              <div className="text-sm text-gray-400">Активных тренировок</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-medium text-green-600">
                {player.hourlyRate ? `${player.hourlyRate}₽` : "—"}
              </div>
              <div className="text-sm text-gray-400">За час</div>
            </div>
          </div>

          {/* Contact info */}
          <div className="space-y-3">
            {player.phone && (
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-sm">{player.phone}</span>
              </div>
            )}
            {player.email && (
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-sm">{player.email}</span>
              </div>
            )}
            {player.availability && (
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-sm">{player.availability}</span>
              </div>
            )}
          </div>
        </div>
      )}

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
                <span className="text-gray-400">{formatMatchDate(match.createdAt || match.date)}</span>
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
                <span className="text-gray-400">{formatMatchDate(session.createdAt || session.date)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Coach's Training Sessions */}
      {player.isCoach && recentCoachTraining.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Проводимые тренировки
          </h2>
          <div className="space-y-3">
            {recentCoachTraining.map((session: any) => (
              <div key={session.id} className="text-sm">
                <span className="text-app-text">
                  {session.type || 'Тренировка'} - {session.duration || 60} мин
                </span>
                <span className="text-gray-400 mx-2">·</span>
                <span className="text-gray-400">{formatMatchDate(session.createdAt || session.date)}</span>
                {session.notes && (
                  <div className="text-xs text-gray-500 mt-1">
                    {session.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}