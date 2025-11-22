import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";

interface PageLayoutProps {
  children: ReactNode;
}

export const PageLayout = ({ children }: PageLayoutProps) => {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar />
      <main className="flex-1 bg-gradient-light min-h-screen">
        {children}
      </main>
    </div>
  );
};
