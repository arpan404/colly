'use client';

import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "./ui/sidebar";

interface PageLayoutProps {
  children: ReactNode;
}

export const PageLayout = ({ children }: PageLayoutProps) => {
  return (
    <SidebarProvider>
      <Sidebar />
      <SidebarInset>
        <header className='flex h-16 shrink-0 items-center gap-2 px-4'>
          <SidebarTrigger className='-ml-1' />
        </header>
        <div className='flex flex-1 flex-col gap-4 p-4 pt-0'>
          <div className="min-h-[100vh] flex-1 rounded-xl md:min-h-min">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};
