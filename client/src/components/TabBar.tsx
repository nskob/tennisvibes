import { useLocation } from "wouter";
import { Link } from "wouter";
import { Home, Users, Plus, Dumbbell } from "lucide-react";

export default function TabBar() {
  const [location] = useLocation();

  const tabs = [
    { path: "/home", icon: Home, label: "Главная" },
    { path: "/players", icon: Users, label: "Игроки" },
    { path: "/training-checkin", icon: Dumbbell, label: "Тренировки" },
  ];

  return (
    <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md border-t" style={{ backgroundColor: 'var(--app-secondary)', borderColor: 'var(--app-border)' }}>
      <div className="flex items-center justify-around py-2">
        {tabs.map((tab, index) => {
          const Icon = tab.icon;
          const isActive = location === tab.path || (location === "/" && tab.path === "/home");
          
          return (
            <Link key={tab.path} href={tab.path}>
              <button className={`flex flex-col items-center py-2 px-3 min-w-[60px] relative`}>
                <Icon size={20} style={{ color: isActive ? 'var(--app-primary)' : 'hsl(0, 0%, 50%)' }} />
                <span className="text-xs mt-1" style={{ color: isActive ? 'var(--app-primary)' : 'hsl(0, 0%, 45%)' }}>
                  {tab.label}
                </span>
                {isActive && (
                  <div 
                    className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 rounded-full"
                    style={{ backgroundColor: 'var(--app-primary)' }}
                  />
                )}
              </button>
            </Link>
          );
        })}
        
        {/* Add match button in center */}
        <Link href="/match/new">
          <button className="flex flex-col items-center py-2 px-3 min-w-[60px]">
            <div className="rounded-full w-10 h-10 flex items-center justify-center" style={{ backgroundColor: 'var(--app-primary)' }}>
              <Plus size={20} style={{ color: 'var(--app-bg)' }} />
            </div>
            <span className="text-xs mt-1 text-gray-400">Матч</span>
          </button>
        </Link>
      </div>
    </div>
  );
}
