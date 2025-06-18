import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { User } from "@shared/schema";
import { Star, Users, Award } from "lucide-react";
import AvatarUpload from "@/components/AvatarUpload";

export default function Players() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const { data: coaches } = useQuery<User[]>({
    queryKey: ["/api/coaches"],
  });

  if (isLoading) {
    return (
      <div className="p-4 pt-12 pb-20">
        <h1 className="text-2xl mb-4">Игроки</h1>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-app-secondary rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-app-secondary rounded mb-2"></div>
                <div className="h-3 bg-app-secondary rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Get current user ID from localStorage
  const currentUserId = JSON.parse(localStorage.getItem("user") || "{}").id || 13;

  // Filter out current user and apply search
  const allPlayers = Array.isArray(users) ? users
    .filter((user: User) => user.id !== currentUserId)
    .filter((user: User) => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase())
    ) : [];

  const filteredCoaches = Array.isArray(coaches) ? coaches
    .filter((coach: User) => coach.id !== currentUserId)
    .filter((coach: User) => 
      coach.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coach.username.toLowerCase().includes(searchTerm.toLowerCase())
    ) : [];

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

  const PlayerCard = ({ player }: { player: User }) => {
    return (
      <div key={player.id} className="flex items-center space-x-4 py-2">
        <Link href={`/player/${player.id}`}>
          <div className="cursor-pointer">
            <AvatarUpload user={player} size="md" showUploadButton={false} />
          </div>
        </Link>
        <div className="flex-1 min-w-0">
          <Link href={`/player/${player.id}`}>
            <div className="flex items-center gap-2 mb-1">
              <div className="font-medium cursor-pointer hover:text-app-primary truncate">
                {player.name}
              </div>
              {player.isCoach && (
                <Badge variant="secondary" className="text-xs flex-shrink-0">
                  <Award className="w-3 h-3 mr-1" />
                  Тренер
                </Badge>
              )}
            </div>
          </Link>
          
          <div className="space-y-1">
            <div className="text-sm text-gray-400">
              Уровень {player.skillLevel || '3.0'}
            </div>
            
            <div className="text-xs text-gray-400">
              Побед/Поражений: {player.wins || 0}/{player.losses || 0}
            </div>
            
            {player.isCoach && player.specialization && (
              <div className="text-blue-600 text-sm">
                {getSpecializationLabel(player.specialization)}
              </div>
            )}
            
            {player.isCoach && player.rating && (
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{player.rating}</span>
                {player.experience && (
                  <span className="text-gray-400 text-sm ml-2">
                    {player.experience} лет опыта
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 pt-12 pb-20">
      <h1 className="text-2xl mb-4">Игроки</h1>
      
      {/* Search */}
      <div className="mb-4">
        <Input
          type="text"
          placeholder="Поиск игроков..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-app-secondary text-app-text border-none"
        />
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6 h-auto p-1">
          <TabsTrigger value="all" className="flex items-center justify-center gap-1 text-xs px-3 py-2 h-auto">
            <Users className="w-3 h-3" />
            Все игроки ({allPlayers.length})
          </TabsTrigger>
          <TabsTrigger value="coaches" className="flex items-center justify-center gap-1 text-xs px-3 py-2 h-auto">
            <Award className="w-3 h-3" />
            Тренеры ({filteredCoaches.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6">
          <div className="space-y-4">
            {allPlayers.map((player) => (
              <PlayerCard key={player.id} player={player} />
            ))}
            
            {allPlayers.length === 0 && (
              <div className="text-center text-gray-400 py-8">
                <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <div className="text-lg font-medium mb-2">
                  {searchTerm ? "Игроки не найдены" : "Нет игроков"}
                </div>
                <div className="text-sm">
                  {searchTerm ? "Попробуйте изменить поисковый запрос" : "Пока нет зарегистрированных игроков"}
                </div>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="coaches" className="mt-6">
          <div className="space-y-4">
            {filteredCoaches.map((coach) => (
              <PlayerCard key={coach.id} player={coach} />
            ))}
            
            {filteredCoaches.length === 0 && (
              <div className="text-center text-gray-400 py-8">
                <Award className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <div className="text-lg font-medium mb-2">
                  {searchTerm ? "Тренеры не найдены" : "Нет тренеров"}
                </div>
                <div className="text-sm">
                  {searchTerm ? "Попробуйте изменить поисковый запрос" : "Пока нет зарегистрированных тренеров"}
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}