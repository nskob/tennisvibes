import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

export default function ProfileRefresh() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Refresh user data when component mounts
    const refreshProfile = () => {
      // Get current user from localStorage
      const currentUser = localStorage.getItem("user");
      if (currentUser) {
        const user = JSON.parse(currentUser);
        
        // Fetch updated user data
        fetch(`/api/users/${user.id}`)
          .then(res => res.json())
          .then(updatedUser => {
            // Update localStorage with fresh data
            localStorage.setItem("user", JSON.stringify(updatedUser));
            
            // Invalidate all user-related queries to trigger refetch
            queryClient.invalidateQueries({ queryKey: ['/api/users'] });
            queryClient.invalidateQueries({ queryKey: ['/api/users', user.id] });
            
            // Force page refresh to show updated data
            window.location.reload();
          });
      }
    };

    // Check if we need to refresh (for Telegram users)
    const currentUser = localStorage.getItem("user");
    if (currentUser) {
      const user = JSON.parse(currentUser);
      if (user.telegramId && (!user.avatarUrl || user.name === "Nikita Skob")) {
        setTimeout(refreshProfile, 1000); // Delay to ensure DB update is complete
      }
    }
  }, [queryClient]);

  return null; // This component doesn't render anything
}