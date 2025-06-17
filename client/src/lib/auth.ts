export const updateUserSession = async (userId: number) => {
  try {
    const response = await fetch(`/api/users/${userId}`);
    if (response.ok) {
      const userData = await response.json();
      localStorage.setItem("user", JSON.stringify(userData));
      return userData;
    }
  } catch (error) {
    console.error("Failed to update user session:", error);
  }
  return null;
};

export const getCurrentUser = () => {
  const userData = localStorage.getItem("user");
  return userData ? JSON.parse(userData) : null;
};

export const clearUserSession = () => {
  localStorage.removeItem("user");
};