import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

declare global {
  interface Window {
    onTelegramAuth: (user: any) => void;
    telegramLogin: () => void;
  }
}

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Define the Telegram callback function
    window.onTelegramAuth = async (user: any) => {
      console.log("Telegram auth callback triggered:", user);
      setIsLoading(true);
      try {
        const response = await apiRequest("POST", "/api/auth/telegram", user);
        const result = await response.json();

        if (result.success) {
          // Store user data in localStorage for simple session management
          localStorage.setItem("user", JSON.stringify(result.user));
          
          toast({
            title: "Успешный вход",
            description: `Добро пожаловать, ${result.user.name}!`,
          });

          // Redirect to home page
          setLocation("/home");
        } else {
          throw new Error(result.message);
        }
      } catch (error: any) {
        console.error("Authentication error:", error);
        toast({
          title: "Ошибка входа",
          description: error.message || "Не удалось войти через Telegram",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    // Load Telegram Widget using multiple approaches
    const loadTelegramWidget = () => {
      const telegramContainer = document.getElementById("telegram-login-container");
      if (!telegramContainer) {
        console.error("Telegram container not found");
        return;
      }

      // Clear container
      telegramContainer.innerHTML = '';

      // Create a simple HTML structure that mimics the Telegram widget
      const widgetHtml = `
        <div style="text-align: center;">
          <script async src="https://telegram.org/js/telegram-widget.js?22" 
                  data-telegram-login="sport_vibes_bot" 
                  data-size="large" 
                  data-onauth="onTelegramAuth(user)" 
                  data-request-access="write">
          </script>
        </div>
      `;
      
      telegramContainer.innerHTML = widgetHtml;
      
      // Always show a working button after delay
      setTimeout(() => {
        console.log("Creating visible Telegram login button");
        
        telegramContainer.innerHTML = `
          <button 
            onclick="window.telegramLogin()"
            class="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-transparent px-6 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
            style="font-family: ui-sans-serif, system-ui, sans-serif;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style="color: hsl(210, 55%, 45%);">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.13-.31-1.09-.65.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
            </svg>
            Войти через Telegram
          </button>
        `;

      }, 1000);

      // Add telegram login function to window
      (window as any).telegramLogin = () => {
        // Generate a unique identifier for this auth session
        const authSessionId = Date.now().toString();
        const authUrl = `https://t.me/sport_vibes_bot?start=web_auth_${authSessionId}`;
        
        // Open Telegram bot for authentication
        window.open(authUrl, '_blank');
        
        // Show waiting state and start polling for authentication
        const container = document.getElementById("telegram-login-container");
        if (container) {
          container.innerHTML = `
            <div style="text-align: center; padding: 20px;">
              <div style="margin-bottom: 15px;">
                <div style="display: inline-block; width: 20px; height: 20px; border: 2px solid #0088cc; border-top: 2px solid transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div>
              </div>
              <p style="margin-bottom: 15px; color: #666;">
                Ожидание входа через Telegram...
              </p>
              <p style="font-size: 12px; color: #999;">
                После входа в бота вернитесь на эту страницу
              </p>
              <button 
                onclick="window.telegramLogin()"
                class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-transparent hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 mt-3 text-muted-foreground"
                style="font-family: ui-sans-serif, system-ui, sans-serif;">
                Открыть бота снова
              </button>
            </div>
            <style>
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            </style>
          `;
        }

        // Start polling for authentication completion
        let initialUserCount = 0;
        
        // Check immediately if there's already a Telegram user authenticated
        fetch('/api/auth/telegram/latest').then(res => res.json()).then(result => {
          if (result.success && result.user) {
            // Save user data to localStorage and redirect
            localStorage.setItem("user", JSON.stringify(result.user));
            toast({
              title: "Успешный вход",
              description: `Добро пожаловать, ${result.user.name}!`,
            });
            // Force page refresh to clear any cached data
            window.location.href = "/home";
          }
        });

        // Get initial user count for fallback
        fetch('/api/users').then(res => res.json()).then(users => {
          initialUserCount = users.length;
        });

        const checkAuthInterval = setInterval(async () => {
          try {
            // Check for latest Telegram user authentication
            const response = await fetch('/api/auth/telegram/latest');
            const result = await response.json();
            
            if (result.success && result.user) {
              // Store user data and redirect
              localStorage.setItem("user", JSON.stringify(result.user));
              
              setIsLoading(false);
              toast({
                title: "Успешный вход",
                description: `Добро пожаловать, ${result.user.name}!`,
              });

              clearInterval(checkAuthInterval);
              setLocation("/home");
            }
          } catch (error) {
            console.error('Error checking auth status:', error);
          }
        }, 2000); // Check every 2 seconds

        // Stop checking after 5 minutes
        setTimeout(() => {
          clearInterval(checkAuthInterval);
        }, 300000);
      };
    };

    // Load widget after a short delay to ensure DOM is ready
    const timer = setTimeout(loadTelegramWidget, 100);

    return () => {
      clearTimeout(timer);
      window.onTelegramAuth = undefined as any;
    };
  }, [setLocation, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Добро пожаловать</CardTitle>
          <CardDescription>
            Войдите в теннисное приложение через Telegram
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              Для входа в систему используйте ваш Telegram аккаунт
            </p>
            
            {/* Telegram Login Widget Container */}
            <div 
              id="telegram-login-container" 
              className="flex justify-center min-h-[50px] items-center rounded-lg p-4 bg-transparent"
            >
              <div className="text-sm text-gray-400">Загрузка виджета Telegram...</div>
            </div>
            
            {isLoading && (
              <div className="mt-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Вход в систему...</p>
              </div>
            )}
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">Или</span>
            </div>
          </div>

          <div className="text-center">
            <Button
              variant="ghost"
              onClick={async () => {
                try {
                  // Use the first available user from the database
                  const response = await fetch('/api/users');
                  const users = await response.json();
                  
                  if (users && users.length > 0) {
                    const demoUser = users[0]; // Use first user as demo
                    localStorage.setItem("user", JSON.stringify(demoUser));
                    
                    toast({
                      title: "Демо режим",
                      description: `Вход выполнен как ${demoUser.name}`,
                    });
                    
                    setLocation("/home");
                  } else {
                    toast({
                      title: "Ошибка",
                      description: "Нет доступных пользователей",
                      variant: "destructive",
                    });
                  }
                } catch (error) {
                  console.error('Guest login error:', error);
                  toast({
                    title: "Ошибка входа",
                    description: "Не удалось войти в демо режиме",
                    variant: "destructive",
                  });
                }
              }}
              className="w-full"
            >
              Продолжить как гость
            </Button>
          </div>

          <div className="text-center text-xs text-gray-500">
            <p>
              Входя в систему, вы соглашаетесь с условиями использования
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}