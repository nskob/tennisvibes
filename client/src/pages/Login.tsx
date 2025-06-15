import { useState } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleTelegramLogin = async () => {
    setIsLoading(true);
    
    try {
      // Simulate Telegram login with demo data
      toast({
        title: "Функция в разработке",
        description: "Telegram авторизация будет доступна в следующих версиях",
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось выполнить вход",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    
    try {
      // Demo login
      toast({
        title: "Демо-вход",
        description: "Добро пожаловать в Set Point!",
      });
      setLocation('/');
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось выполнить вход",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-app-bg">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl text-app-text mb-2">Set Point</h1>
          <p className="text-gray-600 mb-8">Ваш теннисный помощник</p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-sm space-y-6">
          <div className="text-center">
            <h2 className="text-xl text-app-text mb-4">Вход в приложение</h2>
            <p className="text-sm text-gray-600 mb-6">
              Войдите через Telegram, чтобы автоматически подтянуть ваше имя и фотографию
            </p>
          </div>

          {/* Telegram Login Button */}
          <div className="flex flex-col space-y-4">
            <div 
              id="telegram-login"
              className="flex justify-center"
            >
              <button
                onClick={handleTelegramLogin}
                disabled={isLoading}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.376 0 0 5.376 0 12s5.376 12 12 12 12-5.376 12-12S18.624 0 12 0zm5.568 8.16c-.169 1.858-.896 6.728-.896 6.728-.377 2.617-1.407 3.077-2.896 1.588l-3.249-2.39-1.563 1.507c-.173.173-.32.32-.657.32l.234-3.32L15.717 6.4c.234-.208-.05-.323-.363-.115L8.985 10.4l-3.206-.994c-.695-.22-.707-.695.145-1.027L20.116 6.96c.57-.218 1.07.135.88 1.2z"/>
                    </svg>
                    Войти через Telegram
                  </>
                )}
              </button>
            </div>

            {/* Demo Login for Development */}
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-2">Для разработки:</p>
              <button
                onClick={handleDemoLogin}
                disabled={isLoading}
                className="text-gray-600 hover:text-gray-800 text-sm underline"
              >
                Демо-вход
              </button>
            </div>
          </div>
        </div>

        <div className="text-center text-xs text-gray-500">
          <p>Входя в приложение, вы соглашаетесь с условиями использования</p>
        </div>
      </div>
    </div>
  );
}