import { ReactNode } from "react";
import TabBar from "./TabBar";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="max-w-md mx-auto min-h-screen bg-app-bg relative">
      <div className="pb-20">
        {children}
      </div>
      <TabBar />
    </div>
  );
}
