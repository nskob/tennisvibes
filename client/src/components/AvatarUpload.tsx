import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Upload } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@shared/schema";

interface AvatarUploadProps {
  user: User;
  size?: "sm" | "md" | "lg";
  showUploadButton?: boolean;
  showLevelBadge?: boolean;
}

export default function AvatarUpload({ user, size = "md", showUploadButton = false, showLevelBadge = false }: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12", 
    lg: "h-20 w-20"
  };

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('avatar', file);
      
      const response = await fetch(`/api/users/${user.id}/avatar`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users', user.id] });
      toast({
        title: "Аватарка обновлена",
        description: "Ваше фото профиля успешно загружено",
      });
      setIsUploading(false);
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка загрузки",
        description: error.message || "Не удалось загрузить фото",
        variant: "destructive",
      });
      setIsUploading(false);
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Неверный формат файла",
        description: "Пожалуйста, выберите изображение",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Файл слишком большой",
        description: "Размер файла не должен превышать 5MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    uploadMutation.mutate(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const getInitials = (name: string) => {
    if (!name) return "??";
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Get avatar URL with proper fallback handling
  const getAvatarUrl = () => {
    if (user.avatarUrl) {
      return user.avatarUrl;
    }
    if (user.telegramPhotoUrl) {
      return user.telegramPhotoUrl;
    }
    return undefined;
  };

  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <Avatar className={sizeClasses[size]}>
          <AvatarImage 
            src={getAvatarUrl()} 
            alt={user.name}
            className="object-cover"
          />
          <AvatarFallback className="bg-cream-200 text-dark-brown font-medium">
            {getInitials(user.name || "User")}
          </AvatarFallback>
        </Avatar>
        
        {showUploadButton && (
          <button
            onClick={triggerFileInput}
            disabled={isUploading}
            className="absolute -bottom-1 -right-1 bg-cream-100 border border-cream-300 rounded-full p-1.5 hover:bg-cream-200 transition-colors disabled:opacity-50"
          >
            <Camera className="h-3 w-3 text-dark-brown" />
          </button>
        )}
        
        {showLevelBadge && user.skillLevel && (
          <div
            className="absolute -bottom-1 -right-1 rounded-full font-medium text-xs border shadow-sm"
            style={{
              background: "#f8f9fa",
              color: "#374151",
              border: "1px solid #d1d5db",
              padding: "4px 8px",
              minWidth: "20px",
              textAlign: "center",
              fontSize: "0.75rem",
              fontWeight: "600",
              boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)"
            }}
          >
            {user.skillLevel}
          </div>
        )}
      </div>

      {showUploadButton && (
        <div className="flex flex-col gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={triggerFileInput}
            disabled={isUploading}
            className="bg-cream-50 border-cream-300 hover:bg-cream-100"
          >
            <Upload className="h-4 w-4 mr-2" />
            {isUploading ? "Загружается..." : "Изменить фото"}
          </Button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}