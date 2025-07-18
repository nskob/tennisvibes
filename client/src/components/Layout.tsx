import { ReactNode, useEffect } from "react";
import { useLocation } from "wouter";
import TabBar from "./TabBar";
import AuthButton from "./AuthButton";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location, setLocation] = useLocation();
  const isLoginPage = location === "/login";

  // Check authentication status on layout mount
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData && !isLoginPage) {
      setLocation("/login");
    }
  }, [location, setLocation, isLoginPage]);

  return (
    <div className="max-w-md mx-auto min-h-screen relative" style={{ backgroundColor: 'var(--app-bg)' }}>
      {!isLoginPage && (
        <header className="flex justify-between items-center p-4 border-b" style={{ borderColor: 'var(--app-border)' }}>
          <h1 className="text-xl font-bold">Теннис Трекер</h1>
          <AuthButton />
        </header>
      )}
      <div className={isLoginPage ? "" : "pb-20"}>
        {children}
      </div>
      {!isLoginPage && <TabBar />}
    </div>
  );
}
