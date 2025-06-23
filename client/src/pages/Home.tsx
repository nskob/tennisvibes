import { useQuery, useQueryClient } from "@tanstack/react-query";
import { User, Match, TrainingSession } from "@shared/schema";
import AvatarUpload from "@/components/AvatarUpload";
import ProfileCard from "@/components/ProfileCard";
import { useLocation } from "wouter";
import { Edit, Clock, Calendar, Plus, User as UserIcon } from "lucide-react";
import { formatMatchDate } from "@/lib/dateUtils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

export default function Home() {
  const [, setLocation] = useLocation();
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const queryClient = useQueryClient();
  
  const refreshStats = async () => {
    if (currentUserId) {
      await queryClient.invalidateQueries({ queryKey: [`/api/users/${currentUserId}`] });
      await queryClient.invalidateQueries({ queryKey: [`/api/matches/user/${currentUserId}`] });
    }
  };
  
  // Get current user from localStorage
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      setCurrentUserId(user.id);
    } else {
      // Fallback to user ID 13 (Nikita Skob)
      setCurrentUserId(13);
    }
  }, []);


  
  const { data: user, isLoading } = useQuery<User>({
    queryKey: [`/api/users/${currentUserId}`],
    enabled: !!currentUserId,
  });

  const { data: matches, isLoading: matchesLoading } = useQuery({
    queryKey: [`/api/matches/user/${currentUserId}`],
    enabled: !!currentUserId,
  });

  const { data: trainingSessions } = useQuery<TrainingSession[]>({
    queryKey: [`/api/training-sessions/student/${currentUserId}`],
    enabled: !!currentUserId,
  });

  const { data: allUsers } = useQuery({
    queryKey: ["/api/users"],
  });

  if (isLoading || !currentUserId) {
    return (
      <div className="p-6 pt-12">
        <div className="animate-pulse">
          <div className="h-8 bg-app-secondary rounded mb-2"></div>
          <div className="h-4 bg-app-secondary rounded mb-8"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6 pt-12">
        <div className="text-center text-gray-500">
          Загрузка профиля... (ID: {currentUserId})
        </div>
      </div>
    );
  }



  const recentMatches = Array.isArray(matches) ? matches.slice(0, 3) : [];


  // Calculate statistics from actual matches data
  const allMatches = Array.isArray(matches) ? matches : [];
  const wins = allMatches.filter((match: any) => match.winner === user.id).length;
  const losses = allMatches.filter((match: any) => match.winner !== user.id).length;
  const totalMatches = allMatches.length;

  // Calculate recent form (last 5 matches)
  const lastFiveMatches = Array.isArray(matches) ? matches.slice(0, 5) : [];
  const form = lastFiveMatches.map((match: any) => 
    match.winner === user.id ? 'W' : 'L'
  );



  const formatMatchScore = (sets: any[]) => {
    return sets.map(set => `${set.p1}:${set.p2}`).join(' ');
  };

  return (
    <div className="px-4 sm:px-6 pt-8 sm:pt-12 pb-24 max-w-md mx-auto">
      {/* Header */}
      <div className="mb-6 sm:mb-8 flex items-start gap-3 sm:gap-4">
        <ProfileCard 
          name={user.name} 
          user={user} 
          level={user.skillLevel ? user.skillLevel : undefined} 
          size="lg" 
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl text-app-text truncate">{user.name}</h1>
            <Edit 
              size={16} 
              className="text-gray-400 cursor-pointer hover:text-app-primary flex-shrink-0" 
              onClick={() => setLocation('/profile')}
            />
          </div>
          <div className="text-xs sm:text-sm text-gray-400 mt-1 space-y-1">
            <div>Побед/Поражений: {wins}/{losses}</div>
            <div>Матчей сыграно: {totalMatches} · Турниры: 0</div>
          </div>
        </div>
      </div>

      {/* Recent Matches */}
      <div className="mb-6 sm:mb-8">
        <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Последние матчи</h2>
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
                <div 
                  key={match.id} 
                  className="flex items-center gap-2 py-2 cursor-pointer hover:bg-gray-50 rounded-lg px-2"
                  onClick={() => setLocation(`/match/${match.id}`)}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-app-text text-sm">vs</span>
                    {opponent && (
                      <ProfileCard 
                        name={opponent.name} 
                        user={opponent} 
                        size="sm" 
                      />
                    )}
                    <span 
                      className="text-sm truncate"
                      style={{ color: '#2563eb' }}
                    >
                      {opponentName}
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-1 text-sm flex-shrink-0">
                    <span className={`text-xs font-medium ${match.winner === user.id ? 'text-green-600' : 'text-red-500'}`}>
                      {match.winner === user.id ? 'Победа' : 'Поражение'}
                    </span>
                    <span className="text-gray-400 text-xs">{formatMatchDate(match.createdAt || match.date)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>







      {/* Frequent Opponents */}
      <div className="mb-6 sm:mb-8">
        <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Частые соперники</h2>
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
                <div key={index} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {opponent.user && (
                      <AvatarUpload user={opponent.user} size="sm" showUploadButton={false} />
                    )}
                    <span 
                      className="cursor-pointer hover:underline text-sm truncate"
                      style={{ color: '#2563eb' }}
                      onClick={() => setLocation(`/player/${opponent.user?.id}`)}
                    >
                      {opponent.name}
                    </span>
                  </div>
                  <span className="text-gray-400 text-sm">{opponent.count} матчей</span>
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
