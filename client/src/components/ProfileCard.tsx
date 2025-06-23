import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { User } from "@shared/schema";

interface ProfileCardProps {
  name: string;
  photoUrl?: string;
  level?: string | number;
  user?: User;
  size?: "sm" | "md" | "lg";
}

export default function ProfileCard({ name, photoUrl, level, user, size = "md" }: ProfileCardProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12", 
    lg: "h-20 w-20"
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

  return (
    <div className="relative inline-block">
      <Avatar className={sizeClasses[size]}>
        <AvatarImage 
          src={photoUrl || (user?.avatarUrl ? user.avatarUrl : undefined)} 
          alt={name}
          className="object-cover"
        />
        <AvatarFallback className="bg-cream-200 text-dark-brown font-medium">
          {getInitials(name)}
        </AvatarFallback>
      </Avatar>
      
      
    </div>
  );
}