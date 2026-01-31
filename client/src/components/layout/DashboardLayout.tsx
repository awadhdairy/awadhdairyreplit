import { useState } from "react";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { BottomNavigation } from "./BottomNavigation";
import { MobileHeader } from "./MobileHeader";
import { MobileMenu } from "./MobileMenu";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const sidebarStyle = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3.5rem",
  } as React.CSSProperties;

  return (
    <>
      {/* Mobile Layout */}
      <div className="flex flex-col min-h-screen md:hidden">
        <MobileHeader />
        <main className="flex-1 overflow-auto pb-20">
          {children}
        </main>
        <BottomNavigation onMoreClick={() => setIsMobileMenuOpen(true)} />
        <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block">
        <SidebarProvider style={sidebarStyle}>
          <div className="flex min-h-screen w-full">
            <AppSidebar />
            <SidebarInset className="flex flex-col flex-1">
              <header className="sticky top-0 z-40 flex h-14 items-center justify-between gap-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
                <div className="flex items-center gap-4">
                  <SidebarTrigger data-testid="button-sidebar-toggle" />
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(), "EEEE, dd MMMM yyyy")}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search..."
                      className="w-64 pl-8 h-9"
                      data-testid="input-search"
                    />
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="relative" data-testid="button-notifications">
                        <Bell className="h-5 w-5" />
                        <Badge 
                          variant="destructive" 
                          className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px]"
                        >
                          3
                        </Badge>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80">
                      <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
                        <span className="font-medium text-sm">Low Stock Alert</span>
                        <span className="text-xs text-muted-foreground">Green fodder stock is below minimum level</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
                        <span className="font-medium text-sm">Vaccination Due</span>
                        <span className="text-xs text-muted-foreground">3 cattle have vaccinations due today</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
                        <span className="font-medium text-sm">Pending Deliveries</span>
                        <span className="text-xs text-muted-foreground">5 deliveries are pending for today</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-center justify-center text-primary">
                        View all notifications
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <ThemeToggle />
                </div>
              </header>

              <main className="flex-1 overflow-auto">
                {children}
              </main>
            </SidebarInset>
          </div>
        </SidebarProvider>
      </div>
    </>
  );
}
