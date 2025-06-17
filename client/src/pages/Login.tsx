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

    // Load Telegram Widget using iframe approach
    const loadTelegramWidget = () => {
      const telegramContainer = document.getElementById("telegram-login-container");
      if (!telegramContainer) {
        console.error("Telegram container not found");
        return;
      }

      // Clear existing content except loading text
      const loadingText = telegramContainer.innerHTML;
      
      // Try direct script method first
      const script = document.createElement("script");
      script.src = "https://telegram.org/js/telegram-widget.js?22";
      script.setAttribute("data-telegram-login", "sport_vibes_bot");
      script.setAttribute("data-size", "large");
      script.setAttribute("data-onauth", "onTelegramAuth(user)");
      script.setAttribute("data-request-access", "write");
      script.async = true;
      
      // Clear container and add script
      telegramContainer.innerHTML = '';
      telegramContainer.appendChild(script);
      
      // Check if widget renders after delay and show iframe if script fails
      setTimeout(() => {
        const hasWidget = telegramContainer.querySelector('iframe');
        if (!hasWidget) {
          console.log("Script method failed, showing iframe");
          telegramContainer.innerHTML = '';
          
          const iframe = document.createElement("iframe");
          iframe.src = `https://oauth.telegram.org/embed/sport_vibes_bot?origin=${encodeURIComponent(window.location.origin)}&size=large&request_access=write`;
          iframe.width = "238";
          iframe.height = "40";
          iframe.frameBorder = "0";
          iframe.scrolling = "no";
          iframe.style.border = "1px solid #e5e7eb";
          iframe.style.borderRadius = "8px";
          iframe.style.margin = "0 auto";
          iframe.style.display = "block";
          iframe.style.backgroundColor = "white";
          
          iframe.onload = () => {
            console.log("Fallback iframe loaded");
          };
          
          telegramContainer.appendChild(iframe);
        }
      }, 1000);

      // Listen for messages from the iframe
      window.addEventListener('message', (event) => {
        if (event.origin !== 'https://oauth.telegram.org') {
          return;
        }
        
        console.log("Received message from Telegram iframe:", event.data);
        
        if (event.data && event.data.user) {
          window.onTelegramAuth(event.data.user);
        }
      });
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
              className="flex justify-center min-h-[50px] items-center border border-gray-200 rounded-lg p-4 bg-gray-50"
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