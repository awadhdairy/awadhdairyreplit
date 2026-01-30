import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Plus, Edit, Trash2, DollarSign, Download, Receipt, Stethoscope, Users, Package, Wrench, ChevronDown, ChevronUp, Zap, Banknote } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/PageHeader";
import { DataTable, Column, Action } from "@/components/DataTable";
import { useToast } from "@/hooks/use-toast";
import { useExpenses, useHealthRecords, useEmployees, useInventory, useEquipment, useCattle, useAddExpense, useVendorPayments } from "@/hooks/useData";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import type { Expense, ExpenseCategory, HealthRecord, Employee, InventoryItem, Equipment, Cattle, VendorPayment } from "@shared/types";
import { Skeleton } from "@/components/ui/skeleton";

interface AutoExpense {
  id: string;
  source: 'health_record' | 'employee_salary' | 'inventory' | 'equipment' | 'vendor_payment';
  sourceId: string;
  title: string;
  amount: number;
  date: string;
  category: ExpenseCategory;
  details: string;
}

const categoryLabels: Record<ExpenseCategory, string> = {
  feed: "Feed & Fodder",
  medicine: "Medicine",
  salary: "Salary",
  transport: "Transport",
  electricity: "Electricity",
  maintenance: "Maintenance",
  misc: "Miscellaneous",
};

const categoryColors: Record<ExpenseCategory, string> = {
  feed: "hsl(142, 55%, 38%)",
  medicine: "hsl(199, 89%, 48%)",
  salary: "hsl(280, 65%, 60%)",
  transport: "hsl(48, 96%, 53%)",
  electricity: "hsl(25, 95%, 53%)",
  maintenance: "hsl(340, 65%, 55%)",
  misc: "hsl(160, 15%, 50%)",
};

const sourceLabels = {
  health_record: "Veterinary & Health",
  employee_salary: "Employee Salaries",
  inventory: "Inventory Purchases",
  equipment: "Equipment Maintenance",
  vendor_payment: "Vendor Payments",
};

const sourceIcons = {
  health_record: Stethoscope,
  employee_salary: Users,
  inventory: Package,
  equipment: Wrench,
  vendor_payment: Banknote,
};

const sourceColors = {
  health_record: "text-blue-600 bg-blue-100 dark:bg-blue-900/30",
  employee_salary: "text-purple-600 bg-purple-100 dark:bg-purple-900/30",
  inventory: "text-green-600 bg-green-100 dark:bg-green-900/30",
  equipment: "text-orange-600 bg-orange-100 dark:bg-orange-900/30",
  vendor_payment: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30",
};

export default function ExpensesPage() {
  const { toast } = useToast();
  
  // Fetch all data sources
  const { data: expensesData, isLoading: expensesLoading } = useExpenses();
  const { data: healthRecords, isLoading: healthLoading } = useHealthRecords();
  const { data: employees, isLoading: employeesLoading } = useEmployees();
  const { data: inventory, isLoading: inventoryLoading } = useInventory();
  const { data: equipment, isLoading: equipmentLoading } = useEquipment();
  const { data: cattle } = useCattle();
  const { data: vendorPayments, isLoading: paymentsLoading } = useVendorPayments();
  const addExpenseMutation = useAddExpense();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [autoExpensesOpen, setAutoExpensesOpen] = useState(true);

  const [formData, setFormData] = useState({
    category: "feed" as ExpenseCategory,
    title: "",
    amount: "",
    expense_date: format(new Date(), "yyyy-MM-dd"),
    notes: "",
  });

  // Transform data into auto expenses
  const autoExpenses = useMemo(() => {
    const expenses: AutoExpense[] = [];
    
    // Health Records -> Veterinary Expenses
    if (healthRecords) {
      healthRecords.forEach((record: HealthRecord) => {
        if (record.cost && record.cost > 0) {
          const cattleName = cattle?.find((c: Cattle) => c.id === record.cattle_id)?.name || 'Unknown';
          expenses.push({
            id: `health-${record.id}`,
            source: 'health_record',
            sourceId: record.id,
            title: `${record.title} - ${cattleName}`,
            amount: record.cost,
            date: record.record_date,
            category: 'medicine',
            details: `${record.record_type} by ${record.vet_name || 'Unknown vet'}`,
          });
        }
      });
    }
    
    // Employees -> Salary Expenses (Monthly calculation)
    if (employees) {
      const currentMonth = format(new Date(), 'MMMM yyyy');
      employees.forEach((emp: Employee) => {
        if (emp.salary && emp.salary > 0 && emp.is_active) {
          expenses.push({
            id: `salary-${emp.id}`,
            source: 'employee_salary',
            sourceId: emp.id,
            title: `${emp.name} - ${currentMonth}`,
            amount: emp.salary,
            date: format(new Date(), 'yyyy-MM-dd'),
            category: 'salary',
            details: `${emp.role}`,
          });
        }
      });
    }
    
    // Inventory -> Purchase Expenses
    if (inventory) {
      inventory.forEach((item: InventoryItem) => {
        if (item.unit_price && item.quantity && item.unit_price > 0) {
          const totalCost = item.unit_price * item.quantity;
          let category: ExpenseCategory = 'misc';
          if (item.category === 'feed') category = 'feed';
          else if (item.category === 'medicine') category = 'medicine';
          else if (item.category === 'equipment') category = 'maintenance';
          
          expenses.push({
            id: `inventory-${item.id}`,
            source: 'inventory',
            sourceId: item.id,
            title: `${item.name} Purchase`,
            amount: totalCost,
            date: item.created_at.split('T')[0],
            category,
            details: `${item.quantity} ${item.unit} @ ₹${item.unit_price}/${item.unit}`,
          });
        }
      });
    }
    
    // Equipment -> Purchase Cost Expenses
    if (equipment) {
      equipment.forEach((eq: Equipment) => {
        if (eq.purchase_cost && eq.purchase_cost > 0) {
          expenses.push({
            id: `equipment-${eq.id}`,
            source: 'equipment',
            sourceId: eq.id,
            title: `${eq.name} Purchase`,
            amount: eq.purchase_cost,
            date: eq.purchase_date || eq.created_at.split('T')[0],
            category: 'maintenance',
            details: `Status: ${eq.status} - ${eq.location || 'Farm'}`,
          });
        }
      });
    }
    
    // Vendor Payments -> Milk Procurement Expenses
    if (vendorPayments) {
      vendorPayments.forEach((payment: VendorPayment) => {
        if (payment.amount && payment.amount > 0) {
          const paymentModeLabels: Record<string, string> = {
            'cash': 'Cash',
            'bank_transfer': 'Bank Transfer',
            'upi': 'UPI',
            'cheque': 'Cheque',
          };
          expenses.push({
            id: `vendor-payment-${payment.id}`,
            source: 'vendor_payment',
            sourceId: payment.id,
            title: `Payment to ${payment.vendor_name || 'Vendor'}`,
            amount: payment.amount,
            date: payment.payment_date,
            category: 'misc',
            details: `${paymentModeLabels[payment.payment_mode] || payment.payment_mode}${payment.reference_number ? ` - Ref: ${payment.reference_number}` : ''}`,
          });
        }
      });
    }
    
    return expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [healthRecords, employees, inventory, equipment, cattle, vendorPayments]);

  // Group auto expenses by source
  const autoExpensesBySource = useMemo(() => {
    const grouped: Record<string, AutoExpense[]> = {
      health_record: [],
      employee_salary: [],
      inventory: [],
      equipment: [],
      vendor_payment: [],
    };
    autoExpenses.forEach(exp => {
      grouped[exp.source].push(exp);
    });
    return grouped;
  }, [autoExpenses]);

  // Calculate totals
  const expenses = expensesData || [];
  const totalManualExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalAutoExpenses = autoExpenses.reduce((sum, e) => sum + e.amount, 0);
  const grandTotal = totalManualExpenses + totalAutoExpenses;

  // Combined category breakdown for chart
  const combinedCategoryBreakdown = useMemo(() => {
    const categoryTotals: Record<ExpenseCategory, number> = {
      feed: 0, medicine: 0, salary: 0, transport: 0, electricity: 0, maintenance: 0, misc: 0
    };
    
    expenses.forEach(e => categoryTotals[e.category] += e.amount);
    autoExpenses.forEach(e => categoryTotals[e.category] += e.amount);
    
    return Object.entries(categoryLabels).map(([key]) => ({
      name: categoryLabels[key as ExpenseCategory],
      value: categoryTotals[key as ExpenseCategory],
      color: categoryColors[key as ExpenseCategory],
    })).filter(c => c.value > 0);
  }, [expenses, autoExpenses]);

  const filteredExpenses = filterCategory === "all" ? expenses : expenses.filter((e) => e.category === filterCategory);

  const columns: Column<Expense>[] = [
    { key: "expense_date", header: "Date", sortable: true, render: (item) => format(new Date(item.expense_date), "dd MMM yyyy") },
    {
      key: "title",
      header: "Description",
      sortable: true,
      render: (item) => (
        <div>
          <span className="font-medium">{item.title}</span>
          {item.title?.startsWith("[AUTO]") && <Badge variant="outline" className="ml-2 text-xs">Auto</Badge>}
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      render: (item) => (
        <Badge variant="secondary" style={{ backgroundColor: `${categoryColors[item.category]}20`, color: categoryColors[item.category] }}>
          {categoryLabels[item.category]}
        </Badge>
      ),
    },
    { key: "amount", header: "Amount", sortable: true, render: (item) => <span className="font-semibold text-destructive">₹{item.amount.toLocaleString("en-IN")}</span> },
  ];

  const actions: Action<Expense>[] = [
    {
      label: "Edit",
      onClick: (item) => {
        setSelectedExpense(item);
        setFormData({
          category: item.category,
          title: item.title,
          amount: item.amount.toString(),
          expense_date: item.expense_date,
          notes: item.notes || "",
        });
        setIsDialogOpen(true);
      },
      icon: Edit,
    },
    {
      label: "Delete",
      onClick: (item) => {
        toast({ title: "Expense Deleted", description: "Expense has been removed" });
      },
      icon: Trash2,
      variant: "destructive",
    },
  ];

  const handleSubmit = () => {
    if (!formData.title || !formData.amount) {
      toast({ title: "Validation Error", description: "Please fill all required fields", variant: "destructive" });
      return;
    }

    addExpenseMutation.mutate({
      category: formData.category,
      title: formData.title,
      amount: parseFloat(formData.amount),
      expense_date: formData.expense_date,
      notes: formData.notes,
    }, {
      onSuccess: () => {
        toast({ title: selectedExpense ? "Expense Updated" : "Expense Added", description: "Expense has been recorded" });
        resetForm();
      },
      onError: () => {
        toast({ title: "Error", description: "Failed to save expense", variant: "destructive" });
      }
    });
  };

  const resetForm = () => {
    setFormData({ category: "feed", title: "", amount: "", expense_date: format(new Date(), "yyyy-MM-dd"), notes: "" });
    setSelectedExpense(null);
    setIsDialogOpen(false);
  };

  const isLoading = expensesLoading || healthLoading || employeesLoading || inventoryLoading || equipmentLoading;

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Expenses"
        description="Track and manage all expenses including auto-fetched entries"
        action={{ label: "Add Expense", onClick: () => { resetForm(); setIsDialogOpen(true); } }}
      >
        <Button variant="outline" size="sm" data-testid="button-export-expenses">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </PageHeader>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="hover-elevate">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-destructive" />
                <p className="text-sm text-muted-foreground">Total Expenses</p>
              </div>
              <p className="text-2xl font-bold text-destructive mt-1">₹{grandTotal.toLocaleString("en-IN")}</p>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Card className="hover-elevate">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-amber-600" />
                <p className="text-sm text-muted-foreground">Manual Entries</p>
              </div>
              <p className="text-2xl font-bold text-amber-600 mt-1">₹{totalManualExpenses.toLocaleString("en-IN")}</p>
              <p className="text-xs text-muted-foreground">{expenses.length} entries</p>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="hover-elevate border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                <p className="text-sm text-muted-foreground">Auto Fetched</p>
              </div>
              <p className="text-2xl font-bold text-primary mt-1">₹{totalAutoExpenses.toLocaleString("en-IN")}</p>
              <p className="text-xs text-muted-foreground">{autoExpenses.length} entries</p>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card>
            <CardHeader className="pb-2 pt-3">
              <CardTitle className="text-sm">Category Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="pb-3">
              <div className="h-[100px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={combinedCategoryBreakdown} cx="50%" cy="50%" innerRadius={25} outerRadius={45} paddingAngle={2} dataKey="value">
                      {combinedCategoryBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `₹${Number(value).toLocaleString("en-IN")}`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Auto Fetched Expenses Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Collapsible open={autoExpensesOpen} onOpenChange={setAutoExpensesOpen}>
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader className="pb-3">
              <CollapsibleTrigger className="flex items-center justify-between w-full cursor-pointer" data-testid="button-toggle-auto-expenses">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Zap className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <CardTitle className="text-lg">Auto Fetched Expenses</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Automatically collected from Health Records, Employees, Inventory & Equipment
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="text-primary bg-primary/10">
                    {autoExpenses.length} items • ₹{totalAutoExpenses.toLocaleString("en-IN")}
                  </Badge>
                  {autoExpensesOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </div>
              </CollapsibleTrigger>
            </CardHeader>
            
            <CollapsibleContent>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(autoExpensesBySource).map(([source, items]) => {
                    const Icon = sourceIcons[source as keyof typeof sourceIcons];
                    const total = items.reduce((sum, i) => sum + i.amount, 0);
                    if (items.length === 0) return null;
                    
                    return (
                      <Card key={source} className="overflow-hidden">
                        <CardHeader className={`py-3 ${sourceColors[source as keyof typeof sourceColors]}`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Icon className="h-5 w-5" />
                              <CardTitle className="text-base">{sourceLabels[source as keyof typeof sourceLabels]}</CardTitle>
                            </div>
                            <Badge variant="outline" className="font-semibold">
                              ₹{total.toLocaleString("en-IN")}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="p-0 max-h-[200px] overflow-y-auto">
                          {items.map((item, idx) => (
                            <div key={item.id} className={`flex items-center justify-between p-3 ${idx !== items.length - 1 ? 'border-b' : ''}`}>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{item.title}</p>
                                <p className="text-xs text-muted-foreground truncate">{item.details}</p>
                                <p className="text-xs text-muted-foreground">{format(new Date(item.date), 'dd MMM yyyy')}</p>
                              </div>
                              <div className="flex items-center gap-2 ml-2">
                                <Badge variant="secondary" style={{ backgroundColor: `${categoryColors[item.category]}20`, color: categoryColors[item.category] }} className="text-xs">
                                  {categoryLabels[item.category]}
                                </Badge>
                                <span className="font-semibold text-sm text-destructive whitespace-nowrap">
                                  ₹{item.amount.toLocaleString("en-IN")}
                                </span>
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
                
                {autoExpenses.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Zap className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">No Auto Expenses Found</p>
                    <p className="text-sm">Expenses will appear here when you add health records, employees, inventory items, or equipment with costs.</p>
                  </div>
                )}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      </motion.div>

      {/* Manual Expenses Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                  <Receipt className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Manual Expenses</CardTitle>
                  <p className="text-sm text-muted-foreground">Manually recorded expense entries</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-[160px]" data-testid="select-expense-category">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {Object.entries(categoryLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable 
              data={filteredExpenses} 
              columns={columns} 
              actions={actions} 
              searchKey="title" 
              searchPlaceholder="Search expenses..." 
              emptyMessage="No manual expenses found. Click 'Add Expense' to record one." 
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* Add/Edit Expense Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedExpense ? "Edit Expense" : "Add New Expense"}</DialogTitle>
            <DialogDescription>Record a new expense entry</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value as ExpenseCategory })}>
                  <SelectTrigger data-testid="select-expense-form-category"><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoryLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input id="date" type="date" value={formData.expense_date} onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })} data-testid="input-expense-date" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Description *</Label>
              <Input id="title" placeholder="e.g., Green Fodder Purchase" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} data-testid="input-expense-title" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₹) *</Label>
              <Input id="amount" type="number" placeholder="e.g., 15000" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} data-testid="input-expense-amount" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" placeholder="Additional notes..." value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} data-testid="input-expense-notes" />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={resetForm}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={addExpenseMutation.isPending} data-testid="button-submit-expense">
              {addExpenseMutation.isPending ? "Saving..." : (selectedExpense ? "Update" : "Add")} Expense
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
