import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { User } from "@shared/schema";
import { Star, Users, Award } from "lucide-react";
import AvatarUpload from "@/components/AvatarUpload";

export default function Players() {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const { data: coaches } = useQuery<User[]>({
    queryKey: ["/api/coaches"],
  });

  const { data: follows } = useQuery({
    queryKey: ["/api/follows/1"], // Current user follows
  });

  const followMutation = useMutation({
    mutationFn: async ({ followingId }: { followingId: number }) => {
      const response = await apiRequest("POST", "/api/follows", {
        followerId: 1, // Current user
        followingId,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/follows"] });
      toast({
        title: "Following",
        description: "You are now following this player.",
      });
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: async ({ followingId }: { followingId: number }) => {
      const response = await apiRequest("DELETE", `/api/follows/1/${followingId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/follows"] });
      toast({
        title: "Unfollowed",
        description: "You are no longer following this player.",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="p-6 pt-12">
        <h1 className="text-2xl mb-6">Players</h1>
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

  // Filter out current user and apply search
  const allPlayers = Array.isArray(users) ? users
    .filter((user: User) => user.id !== 1)
    .filter((user: User) => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase())
    ) : [];

  const filteredCoaches = Array.isArray(coaches) ? coaches
    .filter((coach: User) => coach.id !== 1)
    .filter((coach: User) => 
      coach.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coach.username.toLowerCase().includes(searchTerm.toLowerCase())
    ) : [];

  const followedPlayerIds = new Set(Array.isArray(follows) ? follows.map((follow: any) => follow.followingId) : []);

  const handleFollowToggle = (playerId: number, isFollowing: boolean) => {
    if (isFollowing) {
      unfollowMutation.mutate({ followingId: playerId });
    } else {
      followMutation.mutate({ followingId: playerId });
    }
  };

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
    const isFollowing = followedPlayerIds.has(player.id);
    
    return (
      <div key={player.id} className="flex items-center space-x-4">
        <Link href={`/player/${player.id}`}>
          <div className="cursor-pointer">
            <AvatarUpload user={player} size="md" showUploadButton={false} />
          </div>
        </Link>
        <div className="flex-1">
          <Link href={`/player/${player.id}`}>
            <div className="flex items-center gap-2 mb-1">
              <div className="font-medium cursor-pointer hover:text-app-primary">
                {player.name}
              </div>
              {player.isCoach && (
                <Badge variant="secondary" className="text-xs">
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
        <button
          onClick={() => handleFollowToggle(player.id, isFollowing)}
          disabled={followMutation.isPending || unfollowMutation.isPending}
          className="btn-text text-app-primary"
        >
          {isFollowing ? "Отписаться" : "Подписаться"}
        </button>
      </div>
    );
  };

  return (
    <div className="p-6 pt-12">
      <h1 className="text-2xl mb-6">Игроки</h1>
      
      {/* Search */}
      <div className="mb-6">
        <Input
          type="text"
          placeholder="Поиск игроков..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-app-secondary text-app-text border-none"
        />
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Все игроки ({allPlayers.length})
          </TabsTrigger>
          <TabsTrigger value="coaches" className="flex items-center gap-2">
            <Award className="w-4 h-4" />
            Тренеры ({filteredCoaches.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
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
        
        <TabsContent value="coaches">
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
