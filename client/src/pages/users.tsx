import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, User, Shield, Key, Trash2, Phone, Download } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/PageHeader";
import { DataTable, Column, Action } from "@/components/DataTable";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import type { Profile, UserRole } from "@shared/types";

const sampleUsers: Profile[] = [
  { id: "1", full_name: "Admin User", phone: "9876543210", role: "super_admin", is_active: true, created_at: "2024-01-01", updated_at: "2024-01-01" },
  { id: "2", full_name: "Priya Sharma", phone: "9876543211", role: "manager", is_active: true, created_at: "2024-01-05", updated_at: "2024-01-05" },
  { id: "3", full_name: "Ramesh Kumar", phone: "9876543212", role: "farm_worker", is_active: true, created_at: "2024-01-10", updated_at: "2024-01-10" },
  { id: "4", full_name: "Suresh Singh", phone: "9876543213", role: "delivery_staff", is_active: true, created_at: "2024-01-15", updated_at: "2024-01-15" },
  { id: "5", full_name: "Dr. Anil Verma", phone: "9876543214", role: "vet_staff", is_active: true, created_at: "2024-01-20", updated_at: "2024-01-20" },
];

const roleLabels: Record<UserRole, string> = { super_admin: "Super Admin", manager: "Manager", accountant: "Accountant", delivery_staff: "Delivery Staff", farm_worker: "Farm Worker", vet_staff: "Vet Staff", auditor: "Auditor" };
const roleColors: Record<UserRole, string> = { super_admin: "bg-red-500/10 text-red-600", manager: "bg-purple-500/10 text-purple-600", accountant: "bg-blue-500/10 text-blue-600", delivery_staff: "bg-amber-500/10 text-amber-600", farm_worker: "bg-green-500/10 text-green-600", vet_staff: "bg-pink-500/10 text-pink-600", auditor: "bg-slate-500/10 text-slate-600" };

export default function UsersPage() {
  const [users, setUsers] = useState<Profile[]>(sampleUsers);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isResetPinDialogOpen, setIsResetPinDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const { user: currentUser } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({ full_name: "", phone: "", role: "farm_worker" as UserRole, pin: "" });
  const [newPin, setNewPin] = useState("");

  const columns: Column<Profile>[] = [
    { key: "full_name", header: "User", sortable: true, render: (item) => (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><User className="h-5 w-5 text-primary" /></div>
        <div><span className="font-medium">{item.full_name}</span><p className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="h-3 w-3" />{item.phone}</p></div>
      </div>
    ) },
    { key: "role", header: "Role", render: (item) => <Badge variant="secondary" className={roleColors[item.role]}><Shield className="h-3 w-3 mr-1" />{roleLabels[item.role]}</Badge> },
    { key: "is_active", header: "Status", render: (item) => <Badge variant={item.is_active ? "default" : "secondary"}>{item.is_active ? "Active" : "Inactive"}</Badge> },
  ];

  const actions: Action<Profile>[] = [
    { label: "Reset PIN", onClick: (item) => { setSelectedUser(item); setNewPin(""); setIsResetPinDialogOpen(true); }, icon: Key },
    { label: "Delete User", onClick: (item) => { if (item.role === "super_admin") { toast({ title: "Cannot Delete", description: "Cannot delete super admin", variant: "destructive" }); return; } setUsers(prev => prev.filter(u => u.id !== item.id)); toast({ title: "User Deleted" }); }, icon: Trash2, variant: "destructive" },
  ];

  const handleSubmit = () => {
    if (!formData.full_name || !formData.phone || !formData.pin) { toast({ title: "Validation Error", description: "Please fill all required fields", variant: "destructive" }); return; }
    if (formData.pin.length !== 6) { toast({ title: "Invalid PIN", description: "PIN must be 6 digits", variant: "destructive" }); return; }
    const newUser: Profile = { id: Date.now().toString(), ...formData, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    setUsers(prev => [...prev, newUser]);
    toast({ title: "User Created", description: `${formData.full_name} has been added` });
    resetForm();
  };

  const handleResetPin = () => {
    if (!selectedUser || !newPin || newPin.length !== 6) { toast({ title: "Invalid PIN", description: "PIN must be 6 digits", variant: "destructive" }); return; }
    toast({ title: "PIN Reset", description: `PIN reset for ${selectedUser.full_name}` });
    setIsResetPinDialogOpen(false);
  };

  const resetForm = () => { setFormData({ full_name: "", phone: "", role: "farm_worker", pin: "" }); setIsDialogOpen(false); };

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="User Management" description="Manage staff users and access control" action={{ label: "Create User", onClick: () => { resetForm(); setIsDialogOpen(true); } }}>
        <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-2" />Export</Button>
      </PageHeader>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="hover-elevate"><CardContent className="p-4"><p className="text-sm text-muted-foreground">Total Users</p><p className="text-2xl font-bold text-primary">{users.length}</p></CardContent></Card>
        <Card className="hover-elevate"><CardContent className="p-4"><p className="text-sm text-muted-foreground">Active</p><p className="text-2xl font-bold text-green-600">{users.filter(u => u.is_active).length}</p></CardContent></Card>
        <Card className="hover-elevate"><CardContent className="p-4"><p className="text-sm text-muted-foreground">Admins</p><p className="text-2xl font-bold text-red-600">{users.filter(u => u.role === "super_admin" || u.role === "manager").length}</p></CardContent></Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <DataTable data={users} columns={columns} actions={actions} searchKey="full_name" searchPlaceholder="Search users..." emptyMessage="No users found." />
      </motion.div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Create New User</DialogTitle><DialogDescription>Add a new staff user to the system</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2"><Label>Full Name *</Label><Input value={formData.full_name} onChange={(e) => setFormData({...formData, full_name: e.target.value})} placeholder="e.g., Ramesh Kumar" /></div>
            <div className="space-y-2"><Label>Phone Number *</Label><Input value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/\D/g, "").slice(0, 10)})} placeholder="10-digit phone number" maxLength={10} /></div>
            <div className="space-y-2"><Label>Role *</Label><Select value={formData.role} onValueChange={(v) => setFormData({...formData, role: v as UserRole})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(roleLabels).filter(([k]) => k !== "super_admin").map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2"><Label>Initial PIN *</Label><Input type="password" value={formData.pin} onChange={(e) => setFormData({...formData, pin: e.target.value.replace(/\D/g, "").slice(0, 6)})} placeholder="6-digit PIN" maxLength={6} /><p className="text-xs text-muted-foreground">User will use this PIN to login</p></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={resetForm}>Cancel</Button><Button onClick={handleSubmit}>Create User</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isResetPinDialogOpen} onOpenChange={setIsResetPinDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Reset PIN</DialogTitle><DialogDescription>Set a new PIN for {selectedUser?.full_name}</DialogDescription></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2"><Label>New 6-Digit PIN</Label><Input type="password" value={newPin} onChange={(e) => setNewPin(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="Enter new PIN" maxLength={6} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setIsResetPinDialogOpen(false)}>Cancel</Button><Button onClick={handleResetPin}>Reset PIN</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
