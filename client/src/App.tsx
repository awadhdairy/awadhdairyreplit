import { Switch, Route, Redirect, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageLoader } from "@/components/LoadingSpinner";

// Pages
import LoginPage from "@/pages/login";
import DashboardPage from "@/pages/dashboard";
import CattlePage from "@/pages/cattle";
import ProductionPage from "@/pages/production";
import CustomersPage from "@/pages/customers";
import ProductsPage from "@/pages/products";
import DeliveriesPage from "@/pages/deliveries";
import BillingPage from "@/pages/billing";
import EmployeesPage from "@/pages/employees";
import ExpensesPage from "@/pages/expenses";
import SettingsPage from "@/pages/settings";
import HealthPage from "@/pages/health";
import BreedingPage from "@/pages/breeding";
import InventoryPage from "@/pages/inventory";
import EquipmentPage from "@/pages/equipment";
import RoutesPage from "@/pages/routes";
import ReportsPage from "@/pages/reports";
import ProcurementPage from "@/pages/procurement";
import BottlesPage from "@/pages/bottles";
import UsersPage from "@/pages/users";
import AuditLogsPage from "@/pages/audit-logs";
import NotFoundPage from "@/pages/not-found";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  return (
    <DashboardLayout>
      <Component />
    </DashboardLayout>
  );
}

function PublicRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <PageLoader />;
  }

  if (isAuthenticated) {
    return <Redirect to="/dashboard" />;
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/">
        <Redirect to="/dashboard" />
      </Route>
      <Route path="/login">
        <PublicRoute component={LoginPage} />
      </Route>
      <Route path="/dashboard">
        <ProtectedRoute component={DashboardPage} />
      </Route>
      <Route path="/cattle">
        <ProtectedRoute component={CattlePage} />
      </Route>
      <Route path="/production">
        <ProtectedRoute component={ProductionPage} />
      </Route>
      <Route path="/procurement">
        <ProtectedRoute component={ProcurementPage} />
      </Route>
      <Route path="/customers">
        <ProtectedRoute component={CustomersPage} />
      </Route>
      <Route path="/products">
        <ProtectedRoute component={ProductsPage} />
      </Route>
      <Route path="/deliveries">
        <ProtectedRoute component={DeliveriesPage} />
      </Route>
      <Route path="/billing">
        <ProtectedRoute component={BillingPage} />
      </Route>
      <Route path="/bottles">
        <ProtectedRoute component={BottlesPage} />
      </Route>
      <Route path="/health">
        <ProtectedRoute component={HealthPage} />
      </Route>
      <Route path="/breeding">
        <ProtectedRoute component={BreedingPage} />
      </Route>
      <Route path="/inventory">
        <ProtectedRoute component={InventoryPage} />
      </Route>
      <Route path="/equipment">
        <ProtectedRoute component={EquipmentPage} />
      </Route>
      <Route path="/routes">
        <ProtectedRoute component={RoutesPage} />
      </Route>
      <Route path="/employees">
        <ProtectedRoute component={EmployeesPage} />
      </Route>
      <Route path="/expenses">
        <ProtectedRoute component={ExpensesPage} />
      </Route>
      <Route path="/reports">
        <ProtectedRoute component={ReportsPage} />
      </Route>
      <Route path="/users">
        <ProtectedRoute component={UsersPage} />
      </Route>
      <Route path="/audit-logs">
        <ProtectedRoute component={AuditLogsPage} />
      </Route>
      <Route path="/settings">
        <ProtectedRoute component={SettingsPage} />
      </Route>
      <Route>
        <NotFoundPage />
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="awadh-dairy-theme">
        <TooltipProvider>
          <AuthProvider>
            <Router />
            <Toaster />
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
