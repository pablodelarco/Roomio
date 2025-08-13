import { Building2, Home, Users, CreditCard, Settings, BarChart3, Receipt } from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { LogOut, User } from "lucide-react"

const navigationItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Apartments", url: "/apartments", icon: Building2 },
  { title: "Tenants", url: "/tenants", icon: Users },
  { title: "Bills", url: "/bills", icon: Receipt },
  { title: "Payments", url: "/payments", icon: CreditCard },
  { title: "Reports", url: "/reports", icon: BarChart3 },
  { title: "Settings", url: "/settings", icon: Settings },
]

export function AppSidebar() {
  const location = useLocation()
  const { user, signOut } = useAuth();

  const getNavCls = (props: { isActive: boolean }) =>
    props.isActive 
      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" 
      : "hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground transition-colors"

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <Sidebar
      className="w-64"
      collapsible="icon"
    >
      <SidebarContent>
        <div className="p-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
              <Building2 className="h-4 w-4 text-sidebar-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-sidebar-foreground">StayWell</h1>
              <p className="text-xs text-sidebar-foreground/60">Property Manager</p>
            </div>
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end={item.url === "/"}
                      className={({ isActive }) => getNavCls({ isActive })}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarGroup>
          <SidebarGroupContent>
            <div className="flex items-center gap-2 px-2 py-1.5 text-sm text-sidebar-foreground">
              <User className="h-4 w-4" />
              <span className="truncate">{user?.email}</span>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleSignOut}
              className="w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  )
}