import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Plus, Eye, Edit, Trash2, Phone, MapPin, Calendar, IndianRupee, Download } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/PageHeader";
import { DataTable, Column, Action } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useToast } from "@/hooks/use-toast";
import { useCustomers, useAddCustomer, useUpdateCustomer, useDeleteCustomer, useInvoices } from "@/hooks/useData";
import type { Customer, SubscriptionType, Invoice } from "@shared/types";

const areas = ["Sector 12", "Model Town", "Civil Lines", "Main Market", "Garden Colony", "Industrial Area"];

interface CustomerWithBalance extends Customer {
  calculatedCredit: number;
}

export default function CustomersPage() {
  const { data: customersData, isLoading } = useCustomers();
  const { data: invoicesData } = useInvoices();
  const addCustomerMutation = useAddCustomer();
  const updateCustomerMutation = useUpdateCustomer();
  const deleteCustomerMutation = useDeleteCustomer();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerWithBalance | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    area: "",
    subscription_type: "daily" as SubscriptionType,
    billing_cycle: "monthly",
    notes: "",
  });

  const invoices = invoicesData || [];

  // Calculate credit balance dynamically from invoices for each customer
  const customers: CustomerWithBalance[] = useMemo(() => {
    const rawCustomers = customersData || [];
    return rawCustomers.map(customer => {
      // Calculate outstanding amount from invoices
      const customerInvoices = invoices.filter(inv => inv.customer_id === customer.id);
      const totalBilled = customerInvoices.reduce((sum, inv) => sum + (inv.final_amount || 0), 0);
      const totalPaid = customerInvoices.reduce((sum, inv) => sum + (inv.paid_amount || 0), 0);
      const calculatedCredit = totalBilled - totalPaid;

      return {
        ...customer,
        calculatedCredit,
        credit_balance: calculatedCredit, // Override with calculated value
      };
    });
  }, [customersData, invoices]);

  const stats = useMemo(() => ({
    total: customers.length,
    active: customers.filter((c) => c.is_active).length,
    credit: customers.reduce((sum, c) => sum + (c.calculatedCredit || 0), 0),
    advance: customers.reduce((sum, c) => sum + (c.advance_balance || 0), 0),
  }), [customers]);

  const columns: Column<CustomerWithBalance>[] = [
    {
      key: "name",
      header: "Customer",
      sortable: true,
      render: (item) => (
        <div className="flex flex-col">
          <span className="font-medium">{item.name}</span>
          {item.phone && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Phone className="h-3 w-3" />
              {item.phone}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "area",
      header: "Area",
      sortable: true,
      render: (item) => (
        <Badge variant="outline" className="gap-1">
          <MapPin className="h-3 w-3" />
          {item.area || "-"}
        </Badge>
      ),
    },
    {
      key: "subscription_type",
      header: "Type",
      render: (item) => (
        <Badge variant="secondary" className="capitalize">
          {item.subscription_type || "daily"}
        </Badge>
      ),
    },
    {
      key: "credit_balance",
      header: "Credit Due",
      sortable: true,
      render: (item) => {
        const balance = item.calculatedCredit || 0;
        return (
          <span className={balance > 0 ? "text-red-600 font-medium" : "text-muted-foreground"}>
            ₹{balance.toLocaleString("en-IN")}
          </span>
        );
      },
    },
    {
      key: "advance_balance",
      header: "Advance",
      sortable: true,
      render: (item) => {
        const advance = item.advance_balance || 0;
        return (
          <span className={advance > 0 ? "text-green-600 font-medium" : "text-muted-foreground"}>
            ₹{advance.toLocaleString("en-IN")}
          </span>
        );
      },
    },
    {
      key: "is_active",
      header: "Status",
      render: (item) => (
        <Badge variant={item.is_active ? "default" : "secondary"}>
          {item.is_active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
  ];

  const actions: Action<CustomerWithBalance>[] = [
    {
      label: "View Details",
      onClick: (item) => {
        setSelectedCustomer(item);
        setIsViewDialogOpen(true);
      },
      icon: Eye,
    },
    {
      label: "Edit",
      onClick: (item) => {
        setSelectedCustomer(item);
        setFormData({
          name: item.name,
          phone: item.phone || "",
          email: item.email || "",
          address: item.address || "",
          area: item.area || "",
          subscription_type: item.subscription_type,
          billing_cycle: item.billing_cycle,
          notes: item.notes || "",
        });
        setIsDialogOpen(true);
      },
      icon: Edit,
    },
    {
      label: "Delete",
      onClick: (item) => {
        deleteCustomerMutation.mutate(item.id, {
          onSuccess: () => {
            toast({
              title: "Customer Deleted",
              description: `${item.name} has been removed`,
            });
          },
          onError: () => {
            toast({
              title: "Error",
              description: "Failed to delete customer",
              variant: "destructive",
            });
          },
        });
      },
      icon: Trash2,
      variant: "destructive",
    },
  ];

  const handleSubmit = () => {
    if (!formData.name) {
      toast({
        title: "Validation Error",
        description: "Please enter customer name",
        variant: "destructive",
      });
      return;
    }

    const customerPayload = {
      name: formData.name,
      phone: formData.phone || undefined,
      email: formData.email || undefined,
      address: formData.address || undefined,
      area: formData.area || undefined,
      subscription_type: formData.subscription_type,
      billing_cycle: formData.billing_cycle,
      notes: formData.notes || undefined,
    };

    if (selectedCustomer) {
      updateCustomerMutation.mutate(
        { id: selectedCustomer.id, ...customerPayload },
        {
          onSuccess: () => {
            toast({
              title: "Customer Updated",
              description: `${formData.name} has been updated`,
            });
            resetForm();
          },
          onError: () => {
            toast({
              title: "Error",
              description: "Failed to update customer",
              variant: "destructive",
            });
          },
        }
      );
    } else {
      addCustomerMutation.mutate(
        { ...customerPayload, is_active: true, credit_balance: 0, advance_balance: 0 },
        {
          onSuccess: () => {
            toast({
              title: "Customer Added",
              description: `${formData.name} has been added`,
            });
            resetForm();
          },
          onError: () => {
            toast({
              title: "Error",
              description: "Failed to add customer",
              variant: "destructive",
            });
          },
        }
      );
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      email: "",
      address: "",
      area: "",
      subscription_type: "daily",
      billing_cycle: "monthly",
      notes: "",
    });
    setSelectedCustomer(null);
    setIsDialogOpen(false);
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Customer Management"
        description="Manage your customers and their subscriptions"
        action={{
          label: "Add Customer",
          onClick: () => {
            resetForm();
            setIsDialogOpen(true);
          },
        }}
      >
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </PageHeader>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <Card className="hover-elevate">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Customers</p>
            <p className="text-2xl font-bold text-primary">{stats.total}</p>
          </CardContent>
        </Card>
        <Card className="hover-elevate">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Active</p>
            <p className="text-2xl font-bold text-green-600">{stats.active}</p>
          </CardContent>
        </Card>
        <Card className="hover-elevate">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Credit</p>
            <p className="text-2xl font-bold text-red-600">
              ₹{stats.credit.toLocaleString("en-IN")}
            </p>
          </CardContent>
        </Card>
        <Card className="hover-elevate">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Advance</p>
            <p className="text-2xl font-bold text-green-600">
              ₹{stats.advance.toLocaleString("en-IN")}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Data Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <DataTable
          data={customers}
          columns={columns}
          actions={actions}
          searchKey="name"
          searchPlaceholder="Search customers..."
          emptyMessage="No customers found. Add your first customer to get started."
        />
      </motion.div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedCustomer ? "Edit Customer" : "Add New Customer"}
            </DialogTitle>
            <DialogDescription>
              {selectedCustomer
                ? "Update the customer information"
                : "Enter the details of the new customer"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Sharma Family"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  data-testid="input-customer-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  placeholder="e.g., 9876543210"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  data-testid="input-customer-phone"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="e.g., email@example.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                data-testid="input-customer-email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                placeholder="Full address..."
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                data-testid="input-customer-address"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="area">Area</Label>
                <Select
                  value={formData.area}
                  onValueChange={(value) =>
                    setFormData({ ...formData, area: value })
                  }
                >
                  <SelectTrigger data-testid="select-area">
                    <SelectValue placeholder="Select area" />
                  </SelectTrigger>
                  <SelectContent>
                    {areas.map((area) => (
                      <SelectItem key={area} value={area}>
                        {area}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subscription">Subscription</Label>
                <Select
                  value={formData.subscription_type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, subscription_type: value as SubscriptionType })
                  }
                >
                  <SelectTrigger data-testid="select-subscription">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="alternate">Alternate</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="billing">Billing Cycle</Label>
              <Select
                value={formData.billing_cycle}
                onValueChange={(value) =>
                  setFormData({ ...formData, billing_cycle: value })
                }
              >
                <SelectTrigger data-testid="select-billing">
                  <SelectValue placeholder="Select billing cycle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="fortnightly">Fortnightly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={resetForm}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} data-testid="button-submit-customer">
              {selectedCustomer ? "Update" : "Add"} Customer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
          </DialogHeader>

          {selectedCustomer && (
            <Tabs defaultValue="info">
              <TabsList className="w-full">
                <TabsTrigger value="info" className="flex-1">Info</TabsTrigger>
                <TabsTrigger value="ledger" className="flex-1">Ledger</TabsTrigger>
                <TabsTrigger value="deliveries" className="flex-1">Deliveries</TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="space-y-4 mt-4">
                <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xl font-bold text-primary">
                      {selectedCustomer.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{selectedCustomer.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedCustomer.subscription_type} subscription
                    </p>
                  </div>
                  <Badge className="ml-auto" variant={selectedCustomer.is_active ? "default" : "secondary"}>
                    {selectedCustomer.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg border">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Phone className="h-3 w-3" /> Phone
                    </p>
                    <p className="font-medium">{selectedCustomer.phone || "-"}</p>
                  </div>
                  <div className="p-3 rounded-lg border">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> Area
                    </p>
                    <p className="font-medium">{selectedCustomer.area || "-"}</p>
                  </div>
                  <div className="p-3 rounded-lg border">
                    <p className="text-sm text-muted-foreground">Credit Balance</p>
                    <p className="font-medium text-red-600">
                      ₹{(selectedCustomer.calculatedCredit || 0).toLocaleString("en-IN")}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg border">
                    <p className="text-sm text-muted-foreground">Advance Balance</p>
                    <p className="font-medium text-green-600">
                      ₹{selectedCustomer.advance_balance.toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>

                {selectedCustomer.address && (
                  <div className="p-3 rounded-lg border">
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="mt-1">{selectedCustomer.address}</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="ledger" className="mt-4">
                <div className="text-center py-8 text-muted-foreground">
                  <IndianRupee className="h-12 w-12 mx-auto mb-2 opacity-20" />
                  <p>Transaction ledger coming soon</p>
                </div>
              </TabsContent>

              <TabsContent value="deliveries" className="mt-4">
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-2 opacity-20" />
                  <p>Delivery history coming soon</p>
                </div>
              </TabsContent>
            </Tabs>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
