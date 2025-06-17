import { useEffect } from "react";

export default function UserSessionInit() {
  useEffect(() => {
    // Initialize session with Nikita Skob's data
    const initializeUserSession = async () => {
      try {
        const response = await fetch('/api/users/13');
        if (response.ok) {
          const userData = await response.json();
          localStorage.setItem("user", JSON.stringify(userData));
          // Reload the page to apply changes
          window.location.reload();
        }
      } catch (error) {
        console.error("Failed to initialize user session:", error);
      }
    };

    // Check if we need to initialize
    const currentUser = localStorage.getItem("user");
    const parsedUser = currentUser ? JSON.parse(currentUser) : null;
    
    // Initialize if no user or if user is not Nikita Skob
    if (!parsedUser || parsedUser.id !== 13) {
      initializeUserSession();
    }
  }, []);

  return null;
}