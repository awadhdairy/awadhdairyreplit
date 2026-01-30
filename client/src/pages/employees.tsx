import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Eye, Edit, Trash2, Phone, Calendar, IndianRupee, UserCog, Download } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { PageHeader } from "@/components/PageHeader";
import { DataTable, Column, Action } from "@/components/DataTable";
import { useToast } from "@/hooks/use-toast";
import type { Employee, UserRole } from "@shared/types";
import { format } from "date-fns";

const sampleEmployees: Employee[] = [
  { id: "1", name: "Ramesh Kumar", phone: "9876543210", role: "farm_worker", salary: 18000, joining_date: "2022-03-15", is_active: true, address: "Village Rampur", created_at: "2022-03-15" },
  { id: "2", name: "Suresh Singh", phone: "9876543211", role: "delivery_staff", salary: 15000, joining_date: "2023-01-10", is_active: true, address: "Sector 5, City", created_at: "2023-01-10" },
  { id: "3", name: "Priya Sharma", phone: "9876543212", role: "accountant", salary: 25000, joining_date: "2021-06-01", is_active: true, address: "Model Town", created_at: "2021-06-01" },
  { id: "4", name: "Dr. Anil Verma", phone: "9876543213", role: "vet_staff", salary: 35000, joining_date: "2020-08-20", is_active: true, address: "Civil Lines", created_at: "2020-08-20" },
  { id: "5", name: "Mohan Lal", phone: "9876543214", role: "farm_worker", salary: 16000, joining_date: "2023-06-15", is_active: false, address: "Village Sundar", created_at: "2023-06-15" },
];

const roleLabels: Record<UserRole, string> = {
  super_admin: "Super Admin",
  manager: "Manager",
  accountant: "Accountant",
  delivery_staff: "Delivery Staff",
  farm_worker: "Farm Worker",
  vet_staff: "Vet Staff",
  auditor: "Auditor",
};

const roleColors: Record<UserRole, string> = {
  super_admin: "bg-red-500/10 text-red-600",
  manager: "bg-purple-500/10 text-purple-600",
  accountant: "bg-blue-500/10 text-blue-600",
  delivery_staff: "bg-amber-500/10 text-amber-600",
  farm_worker: "bg-green-500/10 text-green-600",
  vet_staff: "bg-pink-500/10 text-pink-600",
  auditor: "bg-slate-500/10 text-slate-600",
};

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>(sampleEmployees);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    role: "farm_worker" as UserRole,
    salary: "",
    joining_date: "",
    address: "",
    is_active: true,
  });

  const stats = {
    total: employees.length,
    active: employees.filter((e) => e.is_active).length,
    totalSalary: employees.filter((e) => e.is_active).reduce((sum, e) => sum + (e.salary || 0), 0),
  };

  const columns: Column<Employee>[] = [
    {
      key: "name",
      header: "Employee",
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <UserCog className="h-5 w-5 text-primary" />
          </div>
          <div>
            <span className="font-medium">{item.name}</span>
            {item.phone && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {item.phone}
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      render: (item) => (
        <Badge variant="secondary" className={roleColors[item.role]}>
          {roleLabels[item.role]}
        </Badge>
      ),
    },
    {
      key: "salary",
      header: "Salary",
      sortable: true,
      render: (item) => (
        <span className="font-medium">₹{item.salary?.toLocaleString("en-IN") || "-"}</span>
      ),
    },
    {
      key: "joining_date",
      header: "Joined",
      sortable: true,
      render: (item) => item.joining_date ? format(new Date(item.joining_date), "dd MMM yyyy") : "-",
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

  const actions: Action<Employee>[] = [
    {
      label: "Edit",
      onClick: (item) => {
        setSelectedEmployee(item);
        setFormData({
          name: item.name,
          phone: item.phone || "",
          role: item.role,
          salary: item.salary?.toString() || "",
          joining_date: item.joining_date || "",
          address: item.address || "",
          is_active: item.is_active,
        });
        setIsDialogOpen(true);
      },
      icon: Edit,
    },
    {
      label: "Delete",
      onClick: (item) => {
        setEmployees((prev) => prev.filter((e) => e.id !== item.id));
        toast({ title: "Employee Deleted", description: `${item.name} has been removed` });
      },
      icon: Trash2,
      variant: "destructive",
    },
  ];

  const handleSubmit = () => {
    if (!formData.name) {
      toast({ title: "Validation Error", description: "Please enter employee name", variant: "destructive" });
      return;
    }

    if (selectedEmployee) {
      setEmployees((prev) =>
        prev.map((e) =>
          e.id === selectedEmployee.id
            ? { ...e, ...formData, salary: formData.salary ? parseFloat(formData.salary) : undefined }
            : e
        )
      );
      toast({ title: "Employee Updated", description: `${formData.name} has been updated` });
    } else {
      const newEmployee: Employee = {
        id: Date.now().toString(),
        ...formData,
        salary: formData.salary ? parseFloat(formData.salary) : undefined,
        created_at: new Date().toISOString(),
      };
      setEmployees((prev) => [...prev, newEmployee]);
      toast({ title: "Employee Added", description: `${formData.name} has been added` });
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({ name: "", phone: "", role: "farm_worker", salary: "", joining_date: "", address: "", is_active: true });
    setSelectedEmployee(null);
    setIsDialogOpen(false);
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Employees"
        description="Manage staff and payroll"
        action={{ label: "Add Employee", onClick: () => { resetForm(); setIsDialogOpen(true); } }}
      >
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </PageHeader>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="hover-elevate">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Employees</p>
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
            <p className="text-sm text-muted-foreground">Monthly Payroll</p>
            <p className="text-2xl font-bold text-blue-600">₹{stats.totalSalary.toLocaleString("en-IN")}</p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <DataTable data={employees} columns={columns} actions={actions} searchKey="name" searchPlaceholder="Search employees..." emptyMessage="No employees found." />
      </motion.div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedEmployee ? "Edit Employee" : "Add New Employee"}</DialogTitle>
            <DialogDescription>{selectedEmployee ? "Update the employee information" : "Enter the details of the new employee"}</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input id="name" placeholder="e.g., Ramesh Kumar" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} data-testid="input-employee-name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" placeholder="e.g., 9876543210" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} data-testid="input-employee-phone" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value as UserRole })}>
                  <SelectTrigger data-testid="select-employee-role"><SelectValue placeholder="Select role" /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(roleLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="salary">Monthly Salary (₹)</Label>
                <Input id="salary" type="number" placeholder="e.g., 18000" value={formData.salary} onChange={(e) => setFormData({ ...formData, salary: e.target.value })} data-testid="input-employee-salary" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="joining">Joining Date</Label>
              <Input id="joining" type="date" value={formData.joining_date} onChange={(e) => setFormData({ ...formData, joining_date: e.target.value })} data-testid="input-employee-joining" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea id="address" placeholder="Address..." value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} data-testid="input-employee-address" />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="active">Active Status</Label>
              <Switch id="active" checked={formData.is_active} onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })} data-testid="switch-employee-active" />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={resetForm}>Cancel</Button>
            <Button onClick={handleSubmit} data-testid="button-submit-employee">{selectedEmployee ? "Update" : "Add"} Employee</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
