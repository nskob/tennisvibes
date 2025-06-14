import { useLocation } from "wouter";
import { Link } from "wouter";
import { Home, Users, Plus, Dumbbell, User } from "lucide-react";

export default function TabBar() {
  const [location] = useLocation();

  const tabs = [
    { path: "/home", icon: Home, label: "Home" },
    { path: "/players", icon: Users, label: "Players" },
    { path: "/training-checkin", icon: Dumbbell, label: "Training" },
    { path: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-app-secondary border-t border-app-border">
      <div className="flex items-center justify-around py-3">
        {tabs.map((tab, index) => {
          const Icon = tab.icon;
          const isActive = location === tab.path || (location === "/" && tab.path === "/home");
          
          if (index === 2) {
            // Add the plus button in the middle
            return (
              <div key="tabs-section" className="flex items-center">
                <Link href={tab.path}>
                  <button className={`flex flex-col items-center p-2 ${isActive ? 'text-app-primary' : 'text-gray-400'}`}>
                    <Icon size={20} />
                  </button>
                </Link>
                <Link href="/match/new">
                  <button className="flex flex-col items-center p-2 bg-app-primary text-black rounded-full w-12 h-12 justify-center mx-4">
                    <Plus size={24} />
                  </button>
                </Link>
              </div>
            );
          }
          
          return (
            <Link key={tab.path} href={tab.path}>
              <button className={`flex flex-col items-center p-2 ${isActive ? 'text-app-primary' : 'text-gray-400'}`}>
                <Icon size={20} />
              </button>
            </Link>
          );
        })}
        
        {/* Profile tab */}
        <Link href="/profile">
          <button className={`flex flex-col items-center p-2 ${location === "/profile" ? 'text-app-primary' : 'text-gray-400'}`}>
            <User size={20} />
          </button>
        </Link>
      </div>
    </div>
  );
}
