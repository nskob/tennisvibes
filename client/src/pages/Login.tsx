import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

declare global {
  interface Window {
    onTelegramAuth: (user: any) => void;
  }
}

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Define the Telegram callback function
    window.onTelegramAuth = async (user: any) => {
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

    // Load Telegram Widget script
    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.setAttribute("data-telegram-login", "sport_vibes_bot");
    script.setAttribute("data-size", "large");
    script.setAttribute("data-onauth", "onTelegramAuth(user)");
    script.setAttribute("data-request-access", "write");
    script.async = true;

    const telegramContainer = document.getElementById("telegram-login-container");
    if (telegramContainer) {
      // Clear any existing content
      telegramContainer.innerHTML = "";
      telegramContainer.appendChild(script);
    }

    // Fallback: show manual login button if widget doesn't load
    const fallbackTimeout = setTimeout(() => {
      if (telegramContainer && telegramContainer.children.length === 1) {
        const fallbackButton = document.createElement("button");
        fallbackButton.className = "bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2 mx-auto";
        fallbackButton.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.374 0 0 5.373 0 12s5.374 12 12 12 12-5.373 12-12S18.626 0 12 0zm5.568 8.16c-.169 1.858-.896 6.728-.896 6.728-.315 2.17-.816 2.552-1.314 2.552-.546 0-.896-.317-1.569-.878l-2.815-2.226c-.804-.63-1.33-1.03-2.155-1.654-1.006-.76-.354-1.177.22-1.86.15-.18 2.73-2.748 2.785-2.98.007-.029.013-.13-.05-.184-.064-.054-.158-.035-.226-.02-.096.02-1.626 1.035-4.598 3.04-.435.298-.828.442-1.18.432-.389-.01-1.135-.22-1.69-.4-.68-.22-1.22-.34-1.174-.71.024-.193.29-.39.798-.592 3.48-1.51 5.81-2.51 6.998-3.004 3.33-1.414 4.025-1.66 4.476-1.67.1 0 .321.023.465.14.12.096.154.22.17.31-.002.09-.002.29-.002.29z"/>
          </svg>
          Войти через Telegram
        `;
        fallbackButton.onclick = () => {
          window.open(`https://t.me/sport_vibes_bot?start=auth_${Date.now()}`, '_blank');
        };
        telegramContainer.appendChild(fallbackButton);
      }
    }, 3000);

    return () => {
      // Cleanup
      if (telegramContainer && script.parentNode === telegramContainer) {
        telegramContainer.removeChild(script);
      }
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
              className="flex justify-center min-h-[50px] items-center"
            >
              {/* Loading placeholder while widget loads */}
              <div className="animate-pulse bg-gray-200 rounded-lg h-10 w-48"></div>
            </div>
            
            {/* Test Telegram Login Button */}
            <div className="mt-4">
              <button
                onClick={async () => {
                  setIsLoading(true);
                  
                  // Simulate Telegram authentication data for testing
                  const mockTelegramData = {
                    id: "123456789",
                    first_name: "Тестовый",
                    last_name: "Пользователь",
                    username: "test_user",
                    photo_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
                    auth_date: Math.floor(Date.now() / 1000).toString(),
                    hash: "test_hash_for_demo"
                  };

                  try {
                    const response = await apiRequest("POST", "/api/auth/telegram", mockTelegramData);
                    const result = await response.json();

                    if (result.success) {
                      localStorage.setItem("user", JSON.stringify(result.user));
                      
                      toast({
                        title: "Успешный вход",
                        description: `Добро пожаловать, ${result.user.name}!`,
                      });

                      setLocation("/home");
                    } else {
                      throw new Error(result.message);
                    }
                  } catch (error: any) {
                    console.error("Authentication error:", error);
                    toast({
                      title: "Ошибка входа", 
                      description: "Демонстрационный вход через Telegram",
                      variant: "destructive",
                    });
                  } finally {
                    setIsLoading(false);
                  }
                }}
                disabled={isLoading}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.374 0 0 5.373 0 12s5.374 12 12 12 12-5.373 12-12S18.626 0 12 0zm5.568 8.16c-.169 1.858-.896 6.728-.896 6.728-.315 2.17-.816 2.552-1.314 2.552-.546 0-.896-.317-1.569-.878l-2.815-2.226c-.804-.63-1.33-1.03-2.155-1.654-1.006-.76-.354-1.177.22-1.86.15-.18 2.73-2.748 2.785-2.98.007-.029.013-.13-.05-.184-.064-.054-.158-.035-.226-.02-.096.02-1.626 1.035-4.598 3.04-.435.298-.828.442-1.18.432-.389-.01-1.135-.22-1.69-.4-.68-.22-1.22-.34-1.174-.71.024-.193.29-.39.798-.592 3.48-1.51 5.81-2.51 6.998-3.004 3.33-1.414 4.025-1.66 4.476-1.67.1 0 .321.023.465.14.12.096.154.22.17.31-.002.09-.002.29-.002.29z"/>
                </svg>
                Демо вход через Telegram
              </button>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Тестовый вход для демонстрации функционала
              </p>
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
              variant="outline"
              onClick={() => setLocation("/home")}
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