import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Tournaments() {
  const { data: tournaments, isLoading } = useQuery({
    queryKey: ["/api/tournaments"],
  });

  if (isLoading) {
    return (
      <div className="p-6 pt-12">
        <h1 className="text-2xl mb-6">Tournaments</h1>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-app-secondary rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  const upcomingTournaments = tournaments?.filter((t: any) => t.status === 'upcoming') || [];
  const ongoingTournaments = tournaments?.filter((t: any) => t.status === 'ongoing') || [];
  const completedTournaments = tournaments?.filter((t: any) => t.status === 'completed') || [];

  return (
    <div className="p-6 pt-12">
      <h1 className="text-2xl mb-6">Tournaments</h1>
      
      <Tabs defaultValue="my-tournaments" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-app-secondary">
          <TabsTrigger value="my-tournaments" className="text-app-text data-[state=active]:bg-app-primary data-[state=active]:text-black">
            My Tournaments
          </TabsTrigger>
          <TabsTrigger value="find-tournaments" className="text-app-text data-[state=active]:bg-app-primary data-[state=active]:text-black">
            Find Tournaments
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="my-tournaments" className="space-y-6 mt-6">
          {/* Upcoming */}
          {upcomingTournaments.length > 0 && (
            <div>
              <h3 className="text-lg mb-3">Upcoming</h3>
              <div className="space-y-3">
                {upcomingTournaments.map((tournament: any) => (
                  <div key={tournament.id} className="bg-app-secondary p-4 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{tournament.name}</h4>
                        <p className="text-sm text-gray-400">
                          {tournament.participants?.length || 0} players · {tournament.type}
                        </p>
                      </div>
                      <button className="btn-text text-app-primary">View</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ongoing */}
          {ongoingTournaments.length > 0 && (
            <div>
              <h3 className="text-lg mb-3">Ongoing</h3>
              <div className="space-y-3">
                {ongoingTournaments.map((tournament: any) => (
                  <div key={tournament.id} className="bg-app-secondary p-4 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{tournament.name}</h4>
                        <p className="text-sm text-gray-400">
                          {tournament.participants?.length || 0} players
                        </p>
                      </div>
                      <button className="btn-text text-app-primary">View</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Completed */}
          {completedTournaments.length > 0 && (
            <div>
              <h3 className="text-lg mb-3">Completed</h3>
              <div className="space-y-3">
                {completedTournaments.map((tournament: any) => (
                  <div key={tournament.id} className="bg-app-secondary p-4 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{tournament.name}</h4>
                        <p className="text-sm text-gray-400">
                          {tournament.participants?.length || 0} players · {tournament.type}
                        </p>
                      </div>
                      <button className="btn-text text-app-primary">Results</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tournaments?.length === 0 && (
            <div className="text-center text-gray-400 py-8">
              No tournaments found. Join some tournaments to track your progress!
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="find-tournaments" className="space-y-4 mt-6">
          <div className="text-center text-gray-400 py-8">
            <h3 className="text-lg mb-2">Find Local Tournaments</h3>
            <p className="text-sm">Tournament discovery feature coming soon!</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
