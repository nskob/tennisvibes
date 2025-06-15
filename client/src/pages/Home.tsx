import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";
import AvatarUpload from "@/components/AvatarUpload";
import { useLocation } from "wouter";
import { Edit } from "lucide-react";

export default function Home() {
  const [, setLocation] = useLocation();
  
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/users/1"], // Main user ID is 1
  });

  const { data: matches, isLoading: matchesLoading } = useQuery({
    queryKey: ["/api/matches/user/1"],
  });

  const { data: training, isLoading: trainingLoading } = useQuery({
    queryKey: ["/api/training/user/1"],
  });

  const { data: allUsers } = useQuery({
    queryKey: ["/api/users"],
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

  const recentMatches = Array.isArray(matches) ? matches.slice(0, 3) : [];
  const recentTraining = Array.isArray(training) ? training.slice(0, 3) : [];

  // Calculate recent form (last 5 matches)
  const lastFiveMatches = Array.isArray(matches) ? matches.slice(0, 5) : [];
  const form = lastFiveMatches.map((match: any) => 
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
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl text-app-text">{user.name}</h1>
            <Edit 
              size={16} 
              className="text-gray-400 cursor-pointer hover:text-app-primary" 
              onClick={() => setLocation('/profile')}
            />
          </div>
          <p className="text-sm text-gray-400 mt-1">
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
            {recentMatches.map((match: any) => {
              const opponentId = match.player1Id === user.id ? match.player2Id : match.player1Id;
              const opponentName = match.player1Id === user.id ? match.player2Name : match.player1Name;
              const opponent = Array.isArray(allUsers) ? allUsers.find((u: any) => u.id === opponentId) : null;
              
              return (
                <div key={match.id} className="text-sm flex items-center gap-2">
                  <span className="text-app-text">vs</span>
                  {opponent && (
                    <AvatarUpload user={opponent} size="sm" showUploadButton={false} />
                  )}
                  <span 
                    className="cursor-pointer hover:underline"
                    style={{ color: '#2563eb' }}
                    onClick={() => setLocation(`/player/${opponentId}`)}
                  >
                    {opponentName}
                  </span>
                  <span className="text-gray-400 mx-2">·</span>
                  <span className={match.winner === user.id ? 'text-app-success' : 'text-red-400'}>
                    {formatMatchScore(match.sets)}
                  </span>
                  <span className="text-gray-400 mx-2">·</span>
                  <span className="text-gray-400">{formatDate(match.date)}</span>
                </div>
              );
            })}
          </div>
        )}
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
                <span className="text-app-text">
                  {session.coach ? (
                    <span 
                      className="cursor-pointer hover:underline"
                      style={{ color: '#2563eb' }}
                      onClick={() => console.log('Navigate to coach profile:', session.coach)}
                    >
                      {session.coach}
                    </span>
                  ) : 'Самостоятельная тренировка'}
                </span>
                <span className="text-gray-400 mx-2">·</span>
                <span className="text-gray-400">{formatDate(session.date)}</span>
              </div>
            ))}
            {recentTraining.length === 0 && (
              <div className="text-gray-400 text-sm">Нет записей о тренировках</div>
            )}
          </div>
        )}
      </div>

      {/* Frequent Opponents */}
      <div className="mb-8">
        <h2 className="text-lg mb-4">Частые соперники</h2>
        {(() => {
          // Calculate opponent frequency
          const opponentCount: { [key: number]: { count: number; name: string; user: any } } = {};
          
          if (Array.isArray(matches)) {
            matches.forEach((match: any) => {
              const opponentId = match.player1Id === user.id ? match.player2Id : match.player1Id;
              const opponentName = match.player1Id === user.id ? match.player2Name : match.player1Name;
              const opponent = Array.isArray(allUsers) ? allUsers.find((u: any) => u.id === opponentId) : null;
              
              if (!opponentCount[opponentId]) {
                opponentCount[opponentId] = { count: 0, name: opponentName, user: opponent };
              }
              opponentCount[opponentId].count++;
            });
          }

          const frequentOpponents = Object.values(opponentCount)
            .sort((a, b) => b.count - a.count)
            .slice(0, 3);

          return (
            <div className="space-y-3">
              {frequentOpponents.map((opponent: any, index) => (
                <div key={index} className="text-sm flex items-center gap-2">
                  {opponent.user && (
                    <AvatarUpload user={opponent.user} size="sm" showUploadButton={false} />
                  )}
                  <span 
                    className="cursor-pointer hover:underline"
                    style={{ color: '#2563eb' }}
                    onClick={() => setLocation(`/player/${opponent.user?.id}`)}
                  >
                    {opponent.name}
                  </span>
                  <span className="text-gray-400 mx-2">·</span>
                  <span className="text-gray-400">{opponent.count} матчей</span>
                </div>
              ))}
              {frequentOpponents.length === 0 && (
                <div className="text-gray-400 text-sm">Нет данных о соперниках</div>
              )}
            </div>
          );
        })()}
      </div>

      {/* Achievements */}
      <div className="mb-8">
        <h2 className="text-lg mb-4">Достижения</h2>
        <div className="space-y-3">
          <div className="text-sm flex items-center justify-between">
            <span className="text-app-text">🏆 Побед подряд</span>
            <span className="text-gray-400">
              {(() => {
                if (!Array.isArray(matches)) return 0;
                let maxStreak = 0;
                let currentStreak = 0;
                
                matches.forEach((match: any) => {
                  if (match.winner === user.id) {
                    currentStreak++;
                    maxStreak = Math.max(maxStreak, currentStreak);
                  } else {
                    currentStreak = 0;
                  }
                });
                
                return maxStreak;
              })()}
            </span>
          </div>
          
          <div className="text-sm flex items-center justify-between">
            <span className="text-app-text">🎾 Процент побед</span>
            <span className="text-gray-400">
              {(user.matchesPlayed || 0) > 0 ? Math.round(((user.wins || 0) / (user.matchesPlayed || 1)) * 100) : 0}%
            </span>
          </div>
        </div>
      </div>

      {/* Check In Button */}
      <div>
        <a href="/training-checkin" className="btn-text text-app-primary">
          Записать тренировку
        </a>
      </div>
    </div>
  );
}
