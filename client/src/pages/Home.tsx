import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";
import AvatarUpload from "@/components/AvatarUpload";

export default function Home() {
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/users/1"], // Main user ID is 1
  });

  const { data: matches, isLoading: matchesLoading } = useQuery({
    queryKey: ["/api/matches/user/1"],
  });

  const { data: training, isLoading: trainingLoading } = useQuery({
    queryKey: ["/api/training/user/1"],
  });

  if (isLoading) {
    return (
      <div className="p-6 pt-12">
        <div className="animate-pulse">
          <div className="h-8 bg-app-secondary rounded mb-2"></div>
          <div className="h-4 bg-app-secondary rounded mb-8"></div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const recentMatches = matches?.slice(0, 3) || [];
  const recentTraining = training?.slice(0, 3) || [];

  // Calculate recent form (last 5 matches)
  const lastFiveMatches = matches?.slice(0, 5) || [];
  const form = lastFiveMatches.map(match => 
    match.winner === user.id ? 'W' : 'L'
  );

  const formatDate = (date: string | Date) => {
    const d = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - d.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 14) return "1 week ago";
    return `${Math.floor(diffDays / 7)} weeks ago`;
  };

  const formatMatchScore = (sets: any[]) => {
    return sets.map(set => `${set.p1}:${set.p2}`).join(' ');
  };

  return (
    <div className="p-6 pt-12">
      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <AvatarUpload user={user} size="md" showUploadButton={false} />
        <div>
          <h1 className="text-2xl text-app-text mb-2">{user.name}</h1>
          <p className="text-sm text-gray-400">
            Побед/Поражений: {user.wins}/{user.losses} · Матчей сыграно: {user.matchesPlayed} · Турниры: {user.tournamentsPlayed}
          </p>
        </div>
      </div>

      {/* Recent Matches */}
      <div className="mb-8">
        <h2 className="text-lg mb-4">Последние матчи</h2>
        {matchesLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-app-secondary rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {recentMatches.map((match: any) => (
              <div key={match.id} className="text-sm">
                <span className="text-app-text">
                  vs {match.player1Id === user.id ? match.player2Name : match.player1Name}
                </span>
                <span className="text-gray-400 mx-2">·</span>
                <span className={match.winner === user.id ? 'text-app-success' : 'text-red-400'}>
                  {formatMatchScore(match.sets)}
                </span>
                <span className="text-gray-400 mx-2">·</span>
                <span className="text-gray-400">{formatDate(match.date)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form Streak */}
      <div className="mb-8">
        <h2 className="text-lg mb-4">Последняя форма</h2>
        <div className="flex space-x-3">
          {form.map((result, index) => (
            <div
              key={index}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                result === 'W' ? 'bg-app-success' : 'bg-red-500'
              }`}
            >
              {result === 'W' ? 'П' : 'Р'}
            </div>
          ))}
          {form.length === 0 && (
            <div className="text-gray-400 text-sm">Нет последних матчей</div>
          )}
        </div>
      </div>



      {/* Recent Training */}
      <div className="mb-8">
        <h2 className="text-lg mb-4">Последние тренировки</h2>
        {trainingLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-app-secondary rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {recentTraining.map((session: any) => (
              <div key={session.id} className="text-sm">
                <div className="flex justify-between">
                  <span className="text-app-text">
                    Тренер: {session.coach}
                  </span>
                  <span className="text-gray-400">{formatDate(session.date)}</span>
                </div>
                <div className="text-gray-400 text-xs mt-1">
                  {session.type === 'technique' ? 'Техника' : 
                   session.type === 'fitness' ? 'Физическая подготовка' :
                   session.type === 'match' ? 'Игровая практика' : 
                   session.type}
                </div>
              </div>
            ))}
            {recentTraining.length === 0 && (
              <div className="text-gray-400 text-sm">Нет записей о тренировках</div>
            )}
          </div>
        )}
      </div>

      {/* Check In Button */}
      <div>
        <a href="/training-checkin" className="btn-text text-app-primary">
          Check In Training
        </a>
      </div>
    </div>
  );
}
