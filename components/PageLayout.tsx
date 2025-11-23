'use client';

import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "./ui/sidebar";

interface PageLayoutProps {
  children: ReactNode;
}

export const PageLayout = ({ children }: PageLayoutProps) => {
  return (
    <SidebarProvider>
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 w-full bg-background/95 backdrop-blur-sm border-b border-border/50 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="h-10 w-10" />
            <div className="text-lg font-semibold text-foreground">Colly</div>
          </div>
        </div>
      </header>

      <div className="flex min-h-screen w-full pt-16">
        <Sidebar />
        <SidebarInset className="bg-linear-to-br from-background/50 via-background to-background/80">
          <div className="flex flex-1 flex-col gap-2 sm:gap-4 p-2 sm:p-4">
            {children}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};
