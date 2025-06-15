import { useLocation } from "wouter";
import { Link } from "wouter";
import { Home, Users, Plus, Dumbbell, User } from "lucide-react";

export default function TabBar() {
  const [location] = useLocation();

  const tabs = [
    { path: "/home", icon: Home, label: "Главная" },
    { path: "/players", icon: Users, label: "Игроки" },
    { path: "/training-checkin", icon: Dumbbell, label: "Тренировки" },
  ];

  return (
    <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md border-t" style={{ backgroundColor: 'var(--app-secondary)', borderColor: 'var(--app-border)' }}>
      <div className="flex items-center justify-around py-3">
        {tabs.map((tab, index) => {
          const Icon = tab.icon;
          const isActive = location === tab.path || (location === "/" && tab.path === "/home");
          
          return (
            <Link key={tab.path} href={tab.path}>
              <button className={`flex flex-col items-center p-2`} style={{ color: isActive ? 'var(--app-primary)' : 'hsl(0, 0%, 50%)' }}>
                <Icon size={20} />
              </button>
            </Link>
          );
        })}
        
        {/* Add match button in center */}
        <Link href="/match/new">
          <button className="flex flex-col items-center p-2 rounded-full w-12 h-12 justify-center" style={{ backgroundColor: 'var(--app-primary)', color: 'var(--app-bg)' }}>
            <Plus size={24} />
          </button>
        </Link>
      </div>
    </div>
  );
}
