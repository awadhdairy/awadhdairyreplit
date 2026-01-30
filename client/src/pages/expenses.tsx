import { useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Plus, Edit, Trash2, DollarSign, Download, Receipt } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/PageHeader";
import { DataTable, Column, Action } from "@/components/DataTable";
import { useToast } from "@/hooks/use-toast";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import type { Expense, ExpenseCategory } from "@shared/types";

const sampleExpenses: Expense[] = [
  { id: "1", category: "feed", title: "Green Fodder Purchase", amount: 15000, expense_date: "2024-01-28", notes: "Monthly fodder stock", created_at: "2024-01-28" },
  { id: "2", category: "medicine", title: "Vaccination supplies", amount: 5500, expense_date: "2024-01-25", notes: "FMD vaccine batch", created_at: "2024-01-25" },
  { id: "3", category: "salary", title: "[AUTO] Ramesh Kumar - Jan 2024", amount: 18000, expense_date: "2024-01-31", created_at: "2024-01-31" },
  { id: "4", category: "maintenance", title: "Milking machine repair", amount: 3500, expense_date: "2024-01-20", created_at: "2024-01-20" },
  { id: "5", category: "electricity", title: "Electricity Bill - January", amount: 8500, expense_date: "2024-01-15", created_at: "2024-01-15" },
  { id: "6", category: "transport", title: "Milk delivery van fuel", amount: 4000, expense_date: "2024-01-10", created_at: "2024-01-10" },
  { id: "7", category: "feed", title: "Concentrate feed", amount: 25000, expense_date: "2024-01-05", created_at: "2024-01-05" },
];

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

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>(sampleExpenses);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    category: "feed" as ExpenseCategory,
    title: "",
    amount: "",
    expense_date: format(new Date(), "yyyy-MM-dd"),
    notes: "",
  });

  const filteredExpenses = filterCategory === "all" ? expenses : expenses.filter((e) => e.category === filterCategory);

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const categoryBreakdown = Object.entries(categoryLabels).map(([key]) => ({
    name: categoryLabels[key as ExpenseCategory],
    value: expenses.filter((e) => e.category === key).reduce((sum, e) => sum + e.amount, 0),
    color: categoryColors[key as ExpenseCategory],
  })).filter((c) => c.value > 0);

  const columns: Column<Expense>[] = [
    { key: "expense_date", header: "Date", sortable: true, render: (item) => format(new Date(item.expense_date), "dd MMM yyyy") },
    {
      key: "title",
      header: "Description",
      sortable: true,
      render: (item) => (
        <div>
          <span className="font-medium">{item.title}</span>
          {item.notes?.startsWith("[AUTO]") && <Badge variant="outline" className="ml-2 text-xs">Auto</Badge>}
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
        setExpenses((prev) => prev.filter((e) => e.id !== item.id));
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

    if (selectedExpense) {
      setExpenses((prev) =>
        prev.map((e) => (e.id === selectedExpense.id ? { ...e, ...formData, amount: parseFloat(formData.amount) } : e))
      );
      toast({ title: "Expense Updated", description: "Expense has been updated" });
    } else {
      const newExpense: Expense = {
        id: Date.now().toString(),
        ...formData,
        amount: parseFloat(formData.amount),
        created_at: new Date().toISOString(),
      };
      setExpenses((prev) => [...prev, newExpense]);
      toast({ title: "Expense Added", description: "Expense has been recorded" });
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({ category: "feed", title: "", amount: "", expense_date: format(new Date(), "yyyy-MM-dd"), notes: "" });
    setSelectedExpense(null);
    setIsDialogOpen(false);
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Expenses"
        description="Track and manage all expenses"
        action={{ label: "Add Expense", onClick: () => { resetForm(); setIsDialogOpen(true); } }}
      >
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2 grid grid-cols-2 gap-4">
          <Card className="hover-elevate">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Total Expenses</p>
              <p className="text-2xl font-bold text-destructive">₹{totalExpenses.toLocaleString("en-IN")}</p>
            </CardContent>
          </Card>
          <Card className="hover-elevate">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">This Month</p>
              <p className="text-2xl font-bold text-amber-600">
                ₹{expenses.filter((e) => new Date(e.expense_date).getMonth() === new Date().getMonth()).reduce((sum, e) => sum + e.amount, 0).toLocaleString("en-IN")}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Category Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categoryBreakdown} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={2} dataKey="value">
                      {categoryBreakdown.map((entry, index) => (
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

      <div className="flex items-center gap-4">
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[180px]" data-testid="select-expense-category">
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

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <DataTable data={filteredExpenses} columns={columns} actions={actions} searchKey="title" searchPlaceholder="Search expenses..." emptyMessage="No expenses found." />
      </motion.div>

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
            <Button onClick={handleSubmit} data-testid="button-submit-expense">{selectedExpense ? "Update" : "Add"} Expense</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
