import { useEffect } from "react";
import { useLocation } from "wouter";

export default function UserSessionInit() {
  const [location, setLocation] = useLocation();

  useEffect(() => {
    // Handle user session validation and routing
    const validateUserSession = async () => {
      try {
        const currentUser = localStorage.getItem("user");
        if (currentUser) {
          const parsedUser = JSON.parse(currentUser);
          
          // Verify user still exists in database
          const response = await fetch(`/api/users/${parsedUser.id}`);
          if (response.ok) {
            // User exists and is valid
            if (location === "/login" || location === "/") {
              setLocation("/home");
            }
          } else {
            // User doesn't exist, clear session and redirect to login
            localStorage.removeItem("user");
            if (location !== "/login") {
              setLocation("/login");
            }
          }
        } else {
          // Check if there's a logged in Telegram user and auto-login
          try {
            const response = await fetch('/api/auth/telegram/latest');
            const result = await response.json();
            if (result.success && result.user) {
              localStorage.setItem("user", JSON.stringify(result.user));
              setLocation("/home");
              return;
            }
          } catch (e) {
            console.warn("Could not check for Telegram user:", e);
          }
          
          // No user session, redirect to login only if not already there
          if (location !== "/login") {
            setLocation("/login");
          }
        }
      } catch (error) {
        console.error("Failed to validate user session:", error);
        localStorage.removeItem("user");
        if (location !== "/login") {
          setLocation("/login");
        }
      }
    };

    validateUserSession();
  }, [location, setLocation]);

  return null;
}