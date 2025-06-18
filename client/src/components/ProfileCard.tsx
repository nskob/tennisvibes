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
      
      {level && (
        <div
          className={`absolute rounded-full font-medium border border-gray-300 shadow-sm ${
            size === "sm" ? "text-xs" : "text-xs"
          }`}
          style={{
            position: "absolute",
            bottom: size === "sm" ? "-2px" : "0",
            right: size === "sm" ? "-2px" : "0",
            background: "#f8f9fa",
            color: "#374151",
            borderRadius: "50%",
            padding: size === "sm" ? "2px 6px" : "4px 8px",
            fontWeight: "600",
            fontSize: size === "sm" ? "0.65rem" : "0.75rem",
            border: "1px solid #d1d5db",
            minWidth: size === "sm" ? "16px" : "20px",
            textAlign: "center",
            boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)"
          }}
        >
          {level}
        </div>
      )}
    </div>
  );
}