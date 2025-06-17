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

    // Load Telegram Widget
    const loadTelegramWidget = () => {
      const telegramContainer = document.getElementById("telegram-login-container");
      if (!telegramContainer) {
        console.error("Telegram container not found");
        return;
      }

      // Clear existing content
      telegramContainer.innerHTML = '';

      // Direct HTML insertion for Telegram Login Widget
      telegramContainer.innerHTML = `
        <script 
          async 
          src="https://telegram.org/js/telegram-widget.js?22"
          data-telegram-login="sport_vibes_bot"
          data-size="large"
          data-onauth="onTelegramAuth(user)"
          data-request-access="write">
        </script>
      `;

      // Also try dynamic script method as fallback
      const script = document.createElement("script");
      script.src = "https://telegram.org/js/telegram-widget.js?22";
      script.setAttribute("data-telegram-login", "sport_vibes_bot");
      script.setAttribute("data-size", "large");
      script.setAttribute("data-onauth", "onTelegramAuth(user)");
      script.setAttribute("data-request-access", "write");
      script.async = true;
      
      script.onload = () => {
        console.log("Telegram widget script loaded successfully");
      };
      
      script.onerror = (error) => {
        console.error("Failed to load Telegram widget script:", error);
      };

      document.head.appendChild(script);
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
              className="flex justify-center min-h-[50px] items-center"
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