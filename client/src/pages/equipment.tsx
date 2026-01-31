import { useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Plus, Wrench, AlertTriangle, Download, Edit, Trash2, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/PageHeader";
import { DataTable, Column, Action } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { useToast } from "@/hooks/use-toast";
import type { Equipment, EquipmentStatus } from "@shared/types";
import { useEquipment, useAddEquipment, useUpdateEquipment, useDeleteEquipment } from "@/hooks/useData";

const categories = ["Milking", "Storage", "Processing", "Utility", "Transport", "Other"];

export default function EquipmentPage() {
  const { data: equipmentData, isLoading } = useEquipment();
  const addMutation = useAddEquipment();
  const updateMutation = useUpdateEquipment();
  const deleteMutation = useDeleteEquipment();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({ name: "", category: "Milking", model: "", serial_number: "", purchase_date: "", purchase_cost: "", warranty_expiry: "", status: "active" as EquipmentStatus, location: "", notes: "" });

  const equipment = equipmentData || [];

  const stats = {
    total: equipment.length,
    active: equipment.filter(e => e.status === "active").length,
    maintenance: equipment.filter(e => e.status === "maintenance").length,
    totalValue: equipment.reduce((sum, e) => sum + (e.purchase_cost || 0), 0)
  };

  const columns: Column<Equipment>[] = [
    {
      key: "name", header: "Equipment", sortable: true, render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><Wrench className="h-5 w-5 text-primary" /></div>
          <div><span className="font-medium">{item.name}</span>{item.model && <p className="text-xs text-muted-foreground">{item.model}</p>}</div>
        </div>
      )
    },
    { key: "category", header: "Category", render: (item) => <Badge variant="outline">{item.category}</Badge> },
    { key: "status", header: "Status", render: (item) => <StatusBadge status={item.status} type="equipment" /> },
    { key: "location", header: "Location", render: (item) => item.location || "-" },
    { key: "purchase_cost", header: "Value", sortable: true, render: (item) => item.purchase_cost ? `₹${item.purchase_cost.toLocaleString("en-IN")}` : "-" },
    { key: "warranty_expiry", header: "Warranty", render: (item) => item.warranty_expiry ? (new Date(item.warranty_expiry) > new Date() ? <Badge variant="secondary" className="bg-green-500/10 text-green-600">{format(new Date(item.warranty_expiry), "MMM yyyy")}</Badge> : <Badge variant="secondary" className="bg-red-500/10 text-red-600">Expired</Badge>) : "-" },
  ];

  const actions: Action<Equipment>[] = [
    {
      label: "Edit",
      onClick: (item) => {
        setSelectedEquipment(item);
        setFormData({ name: item.name, category: item.category, model: item.model || "", serial_number: item.serial_number || "", purchase_date: item.purchase_date || "", purchase_cost: item.purchase_cost?.toString() || "", warranty_expiry: item.warranty_expiry || "", status: item.status, location: item.location || "", notes: item.notes || "" });
        setIsDialogOpen(true);
      },
      icon: Edit
    },
    {
      label: "Delete",
      onClick: (item) => {
        deleteMutation.mutate(item.id, {
          onSuccess: () => toast({ title: "Equipment Deleted" }),
          onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" })
        });
      },
      icon: Trash2,
      variant: "destructive"
    },
  ];

  const handleSubmit = () => {
    if (!formData.name) { toast({ title: "Validation Error", description: "Please enter equipment name", variant: "destructive" }); return; }

    const payload = {
      ...formData,
      purchase_cost: formData.purchase_cost ? parseFloat(formData.purchase_cost) : undefined
    };

    if (selectedEquipment) {
      updateMutation.mutate({ id: selectedEquipment.id, ...payload }, {
        onSuccess: () => { toast({ title: "Equipment Updated" }); resetForm(); },
        onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" })
      });
    } else {
      addMutation.mutate(payload, {
        onSuccess: () => { toast({ title: "Equipment Added" }); resetForm(); },
        onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" })
      });
    }
  };

  const resetForm = () => { setFormData({ name: "", category: "Milking", model: "", serial_number: "", purchase_date: "", purchase_cost: "", warranty_expiry: "", status: "active", location: "", notes: "" }); setSelectedEquipment(null); setIsDialogOpen(false); };

  const isSaving = addMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  if (isLoading) {
    return <div className="flex h-96 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Equipment" description="Manage dairy equipment and maintenance" action={{ label: "Add Equipment", onClick: () => { resetForm(); setIsDialogOpen(true); } }}>
        <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-2" />Export</Button>
      </PageHeader>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="hover-elevate"><CardContent className="p-4"><p className="text-sm text-muted-foreground">Total Equipment</p><p className="text-2xl font-bold text-primary">{stats.total}</p></CardContent></Card>
        <Card className="hover-elevate"><CardContent className="p-4"><p className="text-sm text-muted-foreground">Active</p><p className="text-2xl font-bold text-green-600">{stats.active}</p></CardContent></Card>
        <Card className="hover-elevate"><CardContent className="p-4"><div className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-500" /><p className="text-sm text-muted-foreground">Maintenance</p></div><p className="text-2xl font-bold text-amber-600">{stats.maintenance}</p></CardContent></Card>
        <Card className="hover-elevate"><CardContent className="p-4"><p className="text-sm text-muted-foreground">Total Value</p><p className="text-2xl font-bold text-blue-600">₹{stats.totalValue.toLocaleString("en-IN")}</p></CardContent></Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <DataTable data={equipment} columns={columns} actions={actions} searchKey="name" searchPlaceholder="Search equipment..." emptyMessage="No equipment found." />
      </motion.div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{selectedEquipment ? "Edit Equipment" : "Add Equipment"}</DialogTitle><DialogDescription>Manage equipment details</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2"><Label>Equipment Name *</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g., Milking Machine" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Category</Label><Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label>Status</Label><Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v as EquipmentStatus })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="maintenance">Maintenance</SelectItem><SelectItem value="retired">Retired</SelectItem></SelectContent></Select></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Model</Label><Input value={formData.model} onChange={(e) => setFormData({ ...formData, model: e.target.value })} /></div>
              <div className="space-y-2"><Label>Serial Number</Label><Input value={formData.serial_number} onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Purchase Date</Label><Input type="date" value={formData.purchase_date} onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })} /></div>
              <div className="space-y-2"><Label>Purchase Cost (₹)</Label><Input type="number" value={formData.purchase_cost} onChange={(e) => setFormData({ ...formData, purchase_cost: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Warranty Expiry</Label><Input type="date" value={formData.warranty_expiry} onChange={(e) => setFormData({ ...formData, warranty_expiry: e.target.value })} /></div>
              <div className="space-y-2"><Label>Location</Label><Input value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label>Notes</Label><Textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Additional notes..." /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetForm} disabled={isSaving}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={isSaving}>{isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{selectedEquipment ? "Update" : "Add"} Equipment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
