import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Milk,
  Package,
  Users,
  Truck,
  Receipt,
  DollarSign,
  Heart,
  Baby,
  Wheat,
  Wrench,
  UserCog,
  Route,
  FileText,
  Settings,
  LogOut,
  ChevronDown,
  Stethoscope,
  BarChart3,
  History,
  ShoppingCart,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import type { UserRole } from "@shared/types";

interface NavItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: UserRole[];
  children?: { title: string; url: string }[];
}

const mainNavItems: NavItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
];

const farmNavItems: NavItem[] = [
  {
    title: "Cattle",
    url: "/cattle",
    icon: Milk,
    roles: ["super_admin", "manager", "farm_worker", "vet_staff", "auditor"],
  },
  {
    title: "Production",
    url: "/production",
    icon: Package,
    roles: ["super_admin", "manager", "farm_worker", "auditor"],
  },
  {
    title: "Procurement",
    url: "/procurement",
    icon: ShoppingCart,
    roles: ["super_admin", "manager", "accountant", "auditor"],
  },
  {
    title: "Health Records",
    url: "/health",
    icon: Heart,
    roles: ["super_admin", "manager", "farm_worker", "vet_staff", "auditor"],
  },
  {
    title: "Breeding",
    url: "/breeding",
    icon: Baby,
    roles: ["super_admin", "manager", "farm_worker", "vet_staff", "auditor"],
  },
  {
    title: "Feed & Inventory",
    url: "/inventory",
    icon: Wheat,
    roles: ["super_admin", "manager", "farm_worker", "auditor"],
  },
  {
    title: "Equipment",
    url: "/equipment",
    icon: Wrench,
    roles: ["super_admin", "manager", "farm_worker", "auditor"],
  },
];

const salesNavItems: NavItem[] = [
  {
    title: "Products",
    url: "/products",
    icon: Package,
    roles: ["super_admin", "manager", "accountant", "auditor"],
  },
  {
    title: "Customers",
    url: "/customers",
    icon: Users,
    roles: ["super_admin", "manager", "accountant", "delivery_staff", "auditor"],
  },
  {
    title: "Deliveries",
    url: "/deliveries",
    icon: Truck,
    roles: ["super_admin", "manager", "delivery_staff", "auditor"],
  },
  {
    title: "Routes",
    url: "/routes",
    icon: Route,
    roles: ["super_admin", "manager", "delivery_staff", "auditor"],
  },
  {
    title: "Bottles",
    url: "/bottles",
    icon: Package,
    roles: ["super_admin", "manager", "delivery_staff", "auditor"],
  },
];

const financeNavItems: NavItem[] = [
  {
    title: "Billing",
    url: "/billing",
    icon: Receipt,
    roles: ["super_admin", "manager", "accountant", "auditor"],
  },
  {
    title: "Expenses",
    url: "/expenses",
    icon: DollarSign,
    roles: ["super_admin", "manager", "accountant", "auditor"],
  },
  {
    title: "Reports",
    url: "/reports",
    icon: BarChart3,
    roles: ["super_admin", "manager", "accountant", "auditor"],
  },
];

const adminNavItems: NavItem[] = [
  {
    title: "Employees",
    url: "/employees",
    icon: UserCog,
    roles: ["super_admin", "manager", "accountant", "auditor"],
  },
  {
    title: "User Management",
    url: "/users",
    icon: Users,
    roles: ["super_admin"],
  },
  {
    title: "Audit Logs",
    url: "/audit-logs",
    icon: History,
    roles: ["super_admin", "auditor"],
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
    roles: ["super_admin", "manager"],
  },
];

const roleColors: Record<UserRole, string> = {
  super_admin: "bg-red-500/10 text-red-600 dark:text-red-400",
  manager: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  accountant: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  delivery_staff: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  farm_worker: "bg-green-500/10 text-green-600 dark:text-green-400",
  vet_staff: "bg-pink-500/10 text-pink-600 dark:text-pink-400",
  auditor: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
};

const roleLabels: Record<UserRole, string> = {
  super_admin: "Super Admin",
  manager: "Manager",
  accountant: "Accountant",
  delivery_staff: "Delivery",
  farm_worker: "Farm Worker",
  vet_staff: "Vet Staff",
  auditor: "Auditor",
};

function filterNavItems(items: NavItem[], role: UserRole | undefined) {
  if (!role) return items;
  return items.filter((item) => !item.roles || item.roles.includes(role));
}

function NavGroup({ 
  label, 
  items, 
  role 
}: { 
  label: string; 
  items: NavItem[]; 
  role: UserRole | undefined;
}) {
  const [location] = useLocation();
  const filteredItems = filterNavItems(items, role);

  if (filteredItems.length === 0) return null;

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {filteredItems.map((item) => (
            <SidebarMenuItem key={item.url}>
              <SidebarMenuButton 
                asChild 
                isActive={location === item.url}
                tooltip={item.title}
              >
                <Link href={item.url} data-testid={`nav-${item.url.replace('/', '')}`}>
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export function AppSidebar() {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border px-4 py-3">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Milk className="h-5 w-5" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold">AWADH DAIRY</span>
            <span className="text-xs text-muted-foreground">Management</span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="custom-scrollbar">
        <NavGroup label="Overview" items={mainNavItems} role={user?.role} />
        <NavGroup label="Farm Operations" items={farmNavItems} role={user?.role} />
        <NavGroup label="Sales & Distribution" items={salesNavItems} role={user?.role} />
        <NavGroup label="Finance" items={financeNavItems} role={user?.role} />
        <NavGroup label="Administration" items={adminNavItems} role={user?.role} />
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <Collapsible>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton className="w-full justify-between" data-testid="button-user-menu">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatar_url} />
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">
                        {user?.full_name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start group-data-[collapsible=icon]:hidden">
                      <span className="text-sm font-medium truncate max-w-[120px]">
                        {user?.full_name || "User"}
                      </span>
                      <Badge 
                        variant="secondary" 
                        className={`text-[10px] px-1.5 py-0 ${user?.role ? roleColors[user.role] : ''}`}
                      >
                        {user?.role ? roleLabels[user.role] : "Staff"}
                      </Badge>
                    </div>
                  </div>
                  <ChevronDown className="h-4 w-4 group-data-[collapsible=icon]:hidden" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild>
                      <Link href="/settings" data-testid="link-settings">
                        <Settings className="h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton onClick={handleLogout} data-testid="button-logout">
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              </CollapsibleContent>
            </Collapsible>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
