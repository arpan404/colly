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
      <div className="flex min-h-screen w-full">
        <Sidebar />
        <SidebarInset className="bg-linear-to-br from-background/50 via-background to-background/80">
            <SidebarTrigger />

          <div className="flex flex-1 flex-col gap-4 p-4">
            {children}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};
