import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Route, MapPin, User, Download, Edit, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { PageHeader } from "@/components/PageHeader";
import { DataTable, Column, Action } from "@/components/DataTable";
import { useToast } from "@/hooks/use-toast";
import type { DeliveryRoute } from "@shared/types";

const sampleRoutes: DeliveryRoute[] = [
  { id: "1", name: "Route A - Sector 12", description: "Morning route covering Sector 12 and nearby areas", assigned_staff: "Suresh Singh", is_active: true, created_at: "2024-01-01" },
  { id: "2", name: "Route B - Model Town", description: "Model Town and Civil Lines delivery", assigned_staff: "Ramesh Kumar", is_active: true, created_at: "2024-01-01" },
  { id: "3", name: "Route C - Main Market", description: "Commercial area and shops", assigned_staff: "Suresh Singh", is_active: true, created_at: "2024-01-01" },
  { id: "4", name: "Route D - Industrial", description: "Industrial area - bulk deliveries", is_active: false, created_at: "2024-01-01" },
];

const staffOptions = ["Suresh Singh", "Ramesh Kumar", "Mohan Lal"];

export default function RoutesPage() {
  const [routes, setRoutes] = useState<DeliveryRoute[]>(sampleRoutes);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<DeliveryRoute | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({ name: "", description: "", assigned_staff: "", is_active: true });

  const stats = { total: routes.length, active: routes.filter(r => r.is_active).length };

  const columns: Column<DeliveryRoute>[] = [
    { key: "name", header: "Route", sortable: true, render: (item) => (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><Route className="h-5 w-5 text-primary" /></div>
        <div><span className="font-medium">{item.name}</span>{item.description && <p className="text-xs text-muted-foreground truncate max-w-[200px]">{item.description}</p>}</div>
      </div>
    ) },
    { key: "assigned_staff", header: "Assigned Staff", render: (item) => item.assigned_staff ? <Badge variant="outline" className="gap-1"><User className="h-3 w-3" />{item.assigned_staff}</Badge> : <span className="text-muted-foreground">Unassigned</span> },
    { key: "is_active", header: "Status", render: (item) => <Badge variant={item.is_active ? "default" : "secondary"}>{item.is_active ? "Active" : "Inactive"}</Badge> },
  ];

  const actions: Action<DeliveryRoute>[] = [
    { label: "Edit", onClick: (item) => { setSelectedRoute(item); setFormData({ name: item.name, description: item.description || "", assigned_staff: item.assigned_staff || "", is_active: item.is_active }); setIsDialogOpen(true); }, icon: Edit },
    { label: "Delete", onClick: (item) => { setRoutes(prev => prev.filter(r => r.id !== item.id)); toast({ title: "Route Deleted" }); }, icon: Trash2, variant: "destructive" },
  ];

  const handleSubmit = () => {
    if (!formData.name) { toast({ title: "Validation Error", description: "Please enter route name", variant: "destructive" }); return; }
    if (selectedRoute) {
      setRoutes(prev => prev.map(r => r.id === selectedRoute.id ? { ...r, ...formData } : r));
      toast({ title: "Route Updated" });
    } else {
      const newRoute: DeliveryRoute = { id: Date.now().toString(), ...formData, created_at: new Date().toISOString() };
      setRoutes(prev => [...prev, newRoute]);
      toast({ title: "Route Added" });
    }
    resetForm();
  };

  const resetForm = () => { setFormData({ name: "", description: "", assigned_staff: "", is_active: true }); setSelectedRoute(null); setIsDialogOpen(false); };

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Delivery Routes" description="Manage delivery routes and assignments" action={{ label: "Add Route", onClick: () => { resetForm(); setIsDialogOpen(true); } }}>
        <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-2" />Export</Button>
      </PageHeader>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="hover-elevate"><CardContent className="p-4"><p className="text-sm text-muted-foreground">Total Routes</p><p className="text-2xl font-bold text-primary">{stats.total}</p></CardContent></Card>
        <Card className="hover-elevate"><CardContent className="p-4"><p className="text-sm text-muted-foreground">Active</p><p className="text-2xl font-bold text-green-600">{stats.active}</p></CardContent></Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <DataTable data={routes} columns={columns} actions={actions} searchKey="name" searchPlaceholder="Search routes..." emptyMessage="No routes found." />
      </motion.div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{selectedRoute ? "Edit Route" : "Add Route"}</DialogTitle><DialogDescription>Manage delivery route details</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2"><Label>Route Name *</Label><Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g., Route A - Sector 12" /></div>
            <div className="space-y-2"><Label>Description</Label><Textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Route details..." /></div>
            <div className="space-y-2"><Label>Assigned Staff</Label><Select value={formData.assigned_staff} onValueChange={(v) => setFormData({...formData, assigned_staff: v})}><SelectTrigger><SelectValue placeholder="Select staff" /></SelectTrigger><SelectContent>{staffOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
            <div className="flex items-center justify-between"><Label>Active Status</Label><Switch checked={formData.is_active} onCheckedChange={(checked) => setFormData({...formData, is_active: checked})} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={resetForm}>Cancel</Button><Button onClick={handleSubmit}>{selectedRoute ? "Update" : "Add"} Route</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
