import { NavLink } from "@/components/NavLink";
import { Home, Calendar, DollarSign, Users, Heart, BookOpen, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const navigationItems = [
  { title: "Dashboard", icon: Home, path: "/dashboard" },
  { title: "Weekly Routine", icon: Calendar, path: "/weekly-routine" },
  { title: "Budget", icon: DollarSign, path: "/budget" },
  { title: "Social Hub", icon: Users, path: "/social-hub" },
  { title: "Study tools", icon: BookOpen, path: "/study-tools" },
  { title: "Wellness", icon: Heart, path: "/wellness" },
  { title: "settings", icon: Settings, path: "/settings" },
];

export const Sidebar = () => {
  return (
    <aside className="w-64 min-h-screen bg-sidebar border-r border-sidebar-border flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-sidebar-foreground">Colly</h1>
      </div>
      
      <nav className="flex-1 px-3">
        {navigationItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className="flex items-center gap-3 px-3 py-3 mb-1 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
            activeClassName="bg-sidebar-accent"
          >
            <item.icon className="w-5 h-5" />
            <span className="text-sm">{item.title}</span>
          </NavLink>
        ))}
      </nav>
      
      <div className="p-3 mb-4">
        <button className="flex items-center gap-3 px-3 py-3 w-full rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors">
          <LogOut className="w-5 h-5" />
          <span className="text-sm">Logout</span>
        </button>
      </div>
    </aside>
  );
};
