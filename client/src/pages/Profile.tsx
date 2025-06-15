import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";
import AvatarUpload from "@/components/AvatarUpload";

export default function Profile() {
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/users/1"], // Main user ID is 1
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

  if (!user) return null;

  return (
    <div className="p-6 pt-12">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <AvatarUpload user={user} size="lg" showUploadButton={true} />
        </div>
        <h1 className="text-2xl mb-2">{user.name}</h1>
        <p className="text-gray-400 text-sm">
          {user.club || "Профессиональный теннисист"}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="text-center">
          <div className="text-2xl font-medium text-app-success">
            {user.wins}
          </div>
          <div className="text-sm text-gray-400">Wins</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-medium text-red-400">
            {user.losses}
          </div>
          <div className="text-sm text-gray-400">Losses</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-medium">
            {user.tournamentsPlayed}
          </div>
          <div className="text-sm text-gray-400">Tournaments</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-medium">
            {user.matchesPlayed}
          </div>
          <div className="text-sm text-gray-400">Matches</div>
        </div>
      </div>

      {/* Achievements */}
      <div className="mb-8">
        <h2 className="text-lg mb-4">Achievements</h2>
        <div className="flex space-x-4">
          {user.achievements && user.achievements.length > 0 ? (
            user.achievements.slice(0, 3).map((achievement, index) => (
              <div key={index} className="text-4xl">
                {index === 0 ? '🏆' : index === 1 ? '🥇' : '🎾'}
              </div>
            ))
          ) : (
            <div className="flex space-x-4">
              <div className="text-4xl">🏆</div>
              <div className="text-4xl">🥇</div>
              <div className="text-4xl">🎾</div>
            </div>
          )}
        </div>
      </div>



      {/* Player Info */}
      <div className="space-y-3 mb-8">
        <h2 className="text-lg mb-4">Player Info</h2>
        {user.skillLevel && (
          <div className="text-sm">
            <span className="text-gray-400">Skill Level:</span> {user.skillLevel}
          </div>
        )}
        {user.playingStyle && (
          <div className="text-sm">
            <span className="text-gray-400">Playing Style:</span> {user.playingStyle}
          </div>
        )}
        {user.racket && (
          <div className="text-sm">
            <span className="text-gray-400">Racket:</span> {user.racket}
          </div>
        )}
      </div>

      <button className="btn-text text-app-primary">
        Edit Profile
      </button>
    </div>
  );
}
