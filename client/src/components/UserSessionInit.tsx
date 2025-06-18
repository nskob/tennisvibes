import { useEffect } from "react";
import { useLocation } from "wouter";

export default function UserSessionInit() {
  const [location, setLocation] = useLocation();

  useEffect(() => {
    // Clear invalid user session and redirect to login
    const validateUserSession = async () => {
      try {
        const currentUser = localStorage.getItem("user");
        if (currentUser) {
          const parsedUser = JSON.parse(currentUser);
          
          // Verify user still exists in database
          const response = await fetch(`/api/users/${parsedUser.id}`);
          if (!response.ok) {
            // User doesn't exist, clear session and redirect to login
            localStorage.removeItem("user");
            if (location !== "/login") {
              setLocation("/login");
            }
          }
        } else if (location !== "/login") {
          // No user session, redirect to login
          setLocation("/login");
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