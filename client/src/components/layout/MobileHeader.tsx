import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import logo from "@assets/awadh_dairy_bg_logo_1769831028374.png";

export function MobileHeader() {
  return (
    <header 
      className="sticky top-0 z-40 flex md:hidden h-14 items-center justify-between gap-2 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 safe-area-top"
      data-testid="mobile-header"
    >
      <div className="flex items-center gap-3">
        <img src={logo} alt="Awadh Dairy" className="h-8 w-8 rounded-lg" />
        <div className="flex flex-col">
          <span className="font-semibold text-sm text-foreground leading-tight">Awadh Dairy</span>
          <span className="text-[10px] text-muted-foreground leading-tight">Farm ERP</span>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-9 w-9" data-testid="button-mobile-search">
          <Search className="h-4 w-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-9 w-9" data-testid="button-mobile-notifications">
              <Bell className="h-4 w-4" />
              <Badge 
                variant="destructive" 
                className="absolute -top-0.5 -right-0.5 h-4 w-4 p-0 flex items-center justify-center text-[9px]"
              >
                3
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
              <span className="font-medium text-sm">Low Stock Alert</span>
              <span className="text-xs text-muted-foreground">Green fodder stock is below minimum</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
              <span className="font-medium text-sm">Vaccination Due</span>
              <span className="text-xs text-muted-foreground">3 cattle have vaccinations due</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-center justify-center text-primary text-sm">
              View all
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <ThemeToggle />
      </div>
    </header>
  );
}
