import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "wouter";

export default function PlayerProfile() {
  const [, params] = useRoute("/player/:id");
  const playerId = params?.id;

  const { data: player, isLoading } = useQuery({
    queryKey: [`/api/users/${playerId}`],
    enabled: !!playerId,
  });

  const { data: matches, isLoading: matchesLoading } = useQuery({
    queryKey: [`/api/matches/user/${playerId}`],
    enabled: !!playerId,
  });

  if (isLoading) {
    return (
      <div className="p-6 pt-12">
        <div className="animate-pulse">
          <div className="w-24 h-24 bg-app-secondary rounded-full mx-auto mb-4"></div>
          <div className="h-8 bg-app-secondary rounded mb-2"></div>
          <div className="h-4 bg-app-secondary rounded mb-8"></div>
        </div>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="p-6 pt-12">
        <div className="text-center text-gray-400 py-8">
          Player not found.
        </div>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const recentMatches = matches?.slice(0, 6) || [];

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString();
  };

  const formatMatchScore = (sets: any[]) => {
    return sets.map(set => `${set.p1}-${set.p2}`).join(', ');
  };

  return (
    <div className="p-6 pt-12">
      {/* Header */}
      <div className="text-center mb-8">
        <Avatar className="w-24 h-24 mx-auto mb-4">
          <AvatarImage src={player.avatarUrl} alt={player.name} />
          <AvatarFallback className="bg-app-secondary text-app-text text-2xl">
            {getInitials(player.name)}
          </AvatarFallback>
        </Avatar>
        <h1 className="text-2xl mb-2">{player.name}</h1>
        <p className="text-gray-400 text-sm">
          Skill Level: {player.skillLevel || '3.0'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="text-center">
          <div className="text-2xl font-medium text-app-success">
            {player.wins || 0}
          </div>
          <div className="text-sm text-gray-400">Wins</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-medium text-red-400">
            {player.losses || 0}
          </div>
          <div className="text-sm text-gray-400">Losses</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-medium">
            {player.tournamentsPlayed || 0}
          </div>
          <div className="text-sm text-gray-400">Tournaments</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-medium">
            {player.matchesPlayed || 0}
          </div>
          <div className="text-sm text-gray-400">Matches</div>
        </div>
      </div>

      {/* Action Button */}
      <div className="mb-8 text-center">
        <Link href={`/match/new?opponent=${player.id}`}>
          <button className="btn-text text-app-primary text-lg">
            Start Match
          </button>
        </Link>
      </div>

      {/* Recent Matches */}
      <div className="mb-8">
        <h2 className="text-lg mb-4">Recent Matches</h2>
        {matchesLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-app-secondary rounded"></div>
              </div>
            ))}
          </div>
        ) : recentMatches.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {recentMatches.map((match: any) => (
              <div key={match.id} className="bg-app-secondary p-4 rounded-lg">
                <div className="text-sm font-medium mb-1">
                  vs {match.player1Id === player.id ? match.player2Name : match.player1Name}
                </div>
                <div className={`text-xs mb-1 ${
                  match.winner === player.id ? 'text-app-success' : 'text-red-400'
                }`}>
                  {match.winner === player.id ? 'Won' : 'Lost'}
                </div>
                <div className="text-xs text-gray-400">
                  {formatDate(match.date)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-400 text-sm">No recent matches.</div>
        )}
      </div>

      {/* Additional Info */}
      {(player.club || player.playingStyle || player.racket) && (
        <div className="space-y-2">
          <h2 className="text-lg mb-4">Player Info</h2>
          {player.club && (
            <div className="text-sm">
              <span className="text-gray-400">Club:</span> {player.club}
            </div>
          )}
          {player.playingStyle && (
            <div className="text-sm">
              <span className="text-gray-400">Playing Style:</span> {player.playingStyle}
            </div>
          )}
          {player.racket && (
            <div className="text-sm">
              <span className="text-gray-400">Racket:</span> {player.racket}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
