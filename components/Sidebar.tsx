'use client';

import { NavLink } from "@/components/NavLink";
import { Home, Calendar, DollarSign, Users, Heart, BookOpen, Settings, LogOut, Sparkles, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { trpc } from "@/lib/trpc-client";
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const navigationItems = [
  { title: "Dashboard", icon: Home, path: "/dashboard" },
  { title: "Weekly Routine", icon: Calendar, path: "/routines" },
  { title: "Budget", icon: DollarSign, path: "/budgets" },
  { title: "Social Hub", icon: Users, path: "/social-hub" },
  { title: "Study Tools", icon: BookOpen, path: "/study-tools" },
  { title: "Wellness", icon: Heart, path: "/wellness" },
  { title: "Settings", icon: Settings, path: "/settings" },
];

function AppSidebar() {
  const { logout } = useAuth();
  const { data: user } = trpc.user.profile.get.useQuery();

  const handleLogout = () => {
    logout();
  };

  return (
    <ShadcnSidebar variant="inset" collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-4 px-4 py-4">
          <div className="w-12 h-12 bg-linear-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg">
            <Sparkles className="w-7 h-7 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-sidebar-foreground bg-linear-to-r from-sidebar-foreground to-sidebar-foreground/80 bg-clip-text">
              Colly
            </h1>
            <p className="text-sm text-sidebar-foreground/60">Productivity Suite</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2 px-2">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      href={item.path}
                      className="flex items-center gap-3 px-4 py-5 text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all duration-200 group relative overflow-hidden"
                      activeClassName="bg-linear-to-r from-primary/20 to-primary/10 text-primary border-l-4 border-primary shadow-sm"
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="text-sm font-medium">{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-4 px-4 py-4">
              <Avatar className="w-10 h-10">
                <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                  {user?.name ? user.name.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-sidebar-foreground truncate">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-sidebar-foreground/60 truncate">
                  {user?.email}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="w-9 h-9 text-sidebar-foreground/70 hover:bg-destructive/10 hover:text-destructive"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </ShadcnSidebar>
  );
}

export const Sidebar = () => {
  return <AppSidebar />;
};
