import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";
import AvatarUpload from "@/components/AvatarUpload";
import { getCurrentUser } from "@/lib/auth";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";

export default function Profile() {
  const [, setLocation] = useLocation();
  const [currentUser, setCurrentUser] = useState(getCurrentUser());

  useEffect(() => {
    if (!currentUser) {
      setLocation("/login");
    }
  }, [currentUser, setLocation]);

  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ["/api/users", currentUser?.id],
    enabled: !!currentUser?.id,
  });

  if (!currentUser) {
    return null; // Will redirect to login
  }

  if (isLoading) {
    return (
      <div className="p-6 pt-12">
        <div className="text-center text-gray-500">
          Загрузка профиля... (ID: {currentUser.id})
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="p-6 pt-12">
        <div className="text-center text-red-500">
          Ошибка загрузки профиля. 
          <button 
            onClick={() => setLocation("/login")} 
            className="block mt-2 text-app-primary underline"
          >
            Войти заново
          </button>
        </div>
      </div>
    );
  }

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
