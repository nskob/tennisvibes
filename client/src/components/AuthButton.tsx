import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { User, LogOut, LogIn } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AuthUser {
  id: number;
  name: string;
  username: string;
  avatarUrl?: string;
  authProvider: string;
}

export default function AuthButton() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        localStorage.removeItem("user");
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    setLocation("/home");
  };

  const handleLogin = () => {
    setLocation("/login");
  };

  if (user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2">
            {user.avatarUrl ? (
              <img 
                src={user.avatarUrl} 
                alt={user.name}
                className="w-6 h-6 rounded-full"
              />
            ) : (
              <User className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">{user.name}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setLocation("/profile")}>
            <User className="w-4 h-4 mr-2" />
            Профиль
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Выйти
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Button variant="ghost" onClick={handleLogin} className="flex items-center gap-2">
      <LogIn className="w-4 h-4" />
      <span className="hidden sm:inline">Войти</span>
    </Button>
  );
}