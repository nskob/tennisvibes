import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "wouter";

export default function League() {
  const { data: rankings, isLoading } = useQuery({
    queryKey: ["/api/rankings"],
  });

  if (isLoading) {
    return (
      <div className="p-6 pt-12">
        <h1 className="text-2xl mb-6">League Rankings</h1>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex items-center space-x-4">
              <div className="w-8 h-6 bg-app-secondary rounded"></div>
              <div className="w-10 h-10 bg-app-secondary rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-app-secondary rounded mb-1"></div>
                <div className="h-3 bg-app-secondary rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const getInitials = (name: string) => {
    if (!name) return "?";
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="p-6 pt-12">
      <h1 className="text-2xl mb-6">League Rankings</h1>
      
      {/* Rankings Table */}
      <div className="space-y-4 mb-8">
        {rankings?.map((ranking: any, index: number) => (
          <div key={ranking.id} className="flex items-center space-x-4 p-3 bg-app-secondary rounded-lg">
            <div className="w-8 text-center font-medium">
              {index + 1}
            </div>
            <Avatar className="w-10 h-10">
              <AvatarImage src={ranking.userAvatar} alt={ranking.userName} />
              <AvatarFallback className="bg-app-bg text-app-text">
                {getInitials(ranking.userName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="font-medium">{ranking.userName || 'Unknown Player'}</div>
              <div className="text-sm text-gray-400">{ranking.rating} pts</div>
            </div>
            {index < 3 && (
              <div className="text-2xl">
                {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
              </div>
            )}
          </div>
        ))}
        
        {!rankings || rankings.length === 0 && (
          <div className="text-center text-gray-400 py-8">
            No rankings available yet. Play some rated matches to get ranked!
          </div>
        )}
      </div>

      {/* Start Rated Match Button */}
      <div className="text-center">
        <Link href="/match/new?type=rated">
          <button className="btn-text text-app-primary text-lg">
            Start Rated Match
          </button>
        </Link>
      </div>
    </div>
  );
}
