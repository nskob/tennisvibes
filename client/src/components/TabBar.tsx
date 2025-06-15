import { useLocation } from "wouter";
import { Link } from "wouter";
import { Home, Users, Plus, Dumbbell, BarChart3, Trophy } from "lucide-react";

export default function TabBar() {
  const [location] = useLocation();

  const tabs = [
    { path: "/home", icon: Home, label: "Главная" },
    { path: "/players", icon: Users, label: "Игроки" },
    { path: "/analytics", icon: BarChart3, label: "Аналитика" },
    { path: "/tournaments", icon: Trophy, label: "Турниры" },
  ];

  return (
    <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md border-t" style={{ backgroundColor: 'var(--app-secondary)', borderColor: 'var(--app-border)' }}>
      <div className="flex items-center justify-around py-2 sm:py-3 px-2">
        {/* First two tabs */}
        {tabs.slice(0, 2).map((tab) => {
          const Icon = tab.icon;
          const isActive = location === tab.path || (location === "/" && tab.path === "/home");
          
          return (
            <Link key={tab.path} href={tab.path}>
              <button className={`flex flex-col items-center p-2 min-h-[44px] min-w-[44px] justify-center`} style={{ color: isActive ? 'var(--app-primary)' : 'hsl(0, 0%, 50%)' }}>
                <Icon size={18} />
              </button>
            </Link>
          );
        })}
        
        {/* Add match button in center */}
        <Link href="/match/new">
          <button className="flex flex-col items-center p-1 rounded-full w-11 h-11 sm:w-12 sm:h-12 justify-center" style={{ backgroundColor: 'var(--app-primary)', color: 'var(--app-bg)' }}>
            <Plus size={20} />
          </button>
        </Link>

        {/* Last two tabs */}
        {tabs.slice(2).map((tab) => {
          const Icon = tab.icon;
          const isActive = location === tab.path;
          
          return (
            <Link key={tab.path} href={tab.path}>
              <button className={`flex flex-col items-center p-2 min-h-[44px] min-w-[44px] justify-center`} style={{ color: isActive ? 'var(--app-primary)' : 'hsl(0, 0%, 50%)' }}>
                <Icon size={18} />
              </button>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
