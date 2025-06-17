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
          console.log("User session initialized:", userData);
        }
      } catch (error) {
        console.error("Failed to initialize user session:", error);
      }
    };

    // Check current localStorage state
    const currentUser = localStorage.getItem("user");
    if (!currentUser) {
      initializeUserSession();
    } else {
      const parsedUser = JSON.parse(currentUser);
      console.log("Current user in localStorage:", parsedUser);
      
      // Ensure we have Nikita Skob's data
      if (parsedUser.id !== 13) {
        initializeUserSession();
      }
    }
  }, []);

  return null;
}