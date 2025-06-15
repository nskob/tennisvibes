import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import AvatarUpload from "@/components/AvatarUpload";

export default function Players() {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const { data: users, isLoading } = useQuery({
    queryKey: ["/api/users"],
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
  const players = (users || [])
    .filter((user: any) => user.id !== 1)
    .filter((user: any) => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const followedPlayerIds = new Set((follows || []).map((follow: any) => follow.followingId));

  const handleFollowToggle = (playerId: number, isFollowing: boolean) => {
    if (isFollowing) {
      unfollowMutation.mutate({ followingId: playerId });
    } else {
      followMutation.mutate({ followingId: playerId });
    }
  };



  return (
    <div className="p-6 pt-12">
      <h1 className="text-2xl mb-6">Players</h1>
      
      {/* Search */}
      <div className="mb-6">
        <Input
          type="text"
          placeholder="Search players..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-app-secondary text-app-text border-none"
        />
      </div>

      {/* Players List */}
      <div className="space-y-4">
        {players.map((player: any) => {
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
                  <div className="font-medium cursor-pointer hover:text-app-primary">
                    {player.name}
                  </div>
                </Link>
                <div className="text-sm text-gray-400">
                  Skill {player.skillLevel || '3.0'}
                </div>
              </div>
              <button
                onClick={() => handleFollowToggle(player.id, isFollowing)}
                disabled={followMutation.isPending || unfollowMutation.isPending}
                className="btn-text text-app-primary"
              >
                {isFollowing ? "Unfollow" : "Follow"}
              </button>
            </div>
          );
        })}
        
        {players.length === 0 && (
          <div className="text-center text-gray-400 py-8">
            {searchTerm ? "No players found matching your search." : "No players available."}
          </div>
        )}
      </div>
    </div>
  );
}
