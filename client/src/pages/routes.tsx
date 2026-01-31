import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Plus, Route as RouteIcon, MapPin, User, Download, Edit, Trash2, Loader2 } from "lucide-react";
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
import type { Route } from "@shared/types";
import { useRoutes, useEmployees, useAddRoute, useUpdateRoute, useDeleteRoute } from "@/hooks/useData";

export default function RoutesPage() {
  const { data: routesData, isLoading: isRoutesLoading } = useRoutes();
  const { data: employeesData } = useEmployees();

  const addRouteMutation = useAddRoute();
  const updateRouteMutation = useUpdateRoute();
  const deleteRouteMutation = useDeleteRoute();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({ name: "", description: "", assigned_staff: "", is_active: true });

  const routes = routesData || [];
  const staffOptions = employeesData?.map(e => ({ name: e.name, id: e.id })) || [];

  const stats = useMemo(() => ({
    total: routes.length,
    active: routes.filter(r => r.is_active).length
  }), [routes]);

  const columns: Column<Route>[] = [
    {
      key: "name", header: "Route", sortable: true, render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><RouteIcon className="h-5 w-5 text-primary" /></div>
          <div><span className="font-medium">{item.name}</span>{item.description && <p className="text-xs text-muted-foreground truncate max-w-[200px]">{item.description}</p>}</div>
        </div>
      )
    },
    { key: "assigned_staff", header: "Assigned Staff", render: (item) => item.assigned_staff ? <Badge variant="outline" className="gap-1"><User className="h-3 w-3" />{item.assigned_staff}</Badge> : <span className="text-muted-foreground">Unassigned</span> },
    { key: "is_active", header: "Status", render: (item) => <Badge variant={item.is_active ? "default" : "secondary"}>{item.is_active ? "Active" : "Inactive"}</Badge> },
  ];

  const actions: Action<Route>[] = [
    {
      label: "Edit",
      onClick: (item) => {
        setSelectedRoute(item);
        setFormData({
          name: item.name,
          description: item.description || "",
          assigned_staff: item.assigned_staff || "",
          is_active: item.is_active !== false
        });
        setIsDialogOpen(true);
      },
      icon: Edit
    },
    {
      label: "Delete",
      onClick: (item) => {
        if (confirm("Are you sure you want to delete this route?")) {
          deleteRouteMutation.mutate(item.id, {
            onSuccess: () => toast({ title: "Route Deleted" }),
            onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" })
          });
        }
      },
      icon: Trash2,
      variant: "destructive"
    },
  ];

  const handleSubmit = () => {
    if (!formData.name) { toast({ title: "Validation Error", description: "Please enter route name", variant: "destructive" }); return; }

    if (selectedRoute) {
      updateRouteMutation.mutate({
        id: selectedRoute.id,
        name: formData.name,
        description: formData.description || undefined,
        assigned_staff: formData.assigned_staff || undefined,
        is_active: formData.is_active
      }, {
        onSuccess: () => { toast({ title: "Route Updated" }); resetForm(); },
        onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" })
      });
    } else {
      addRouteMutation.mutate({
        name: formData.name,
        description: formData.description || undefined,
        assigned_staff: formData.assigned_staff || undefined,
        is_active: formData.is_active
      }, {
        onSuccess: () => { toast({ title: "Route Added" }); resetForm(); },
        onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" })
      });
    }
  };

  const resetForm = () => { setFormData({ name: "", description: "", assigned_staff: "", is_active: true }); setSelectedRoute(null); setIsDialogOpen(false); };

  const isSaving = addRouteMutation.isPending || updateRouteMutation.isPending;

  if (isRoutesLoading) {
    return <div className="flex h-96 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

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
            <div className="space-y-2"><Label>Route Name *</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g., Route A - Sector 12" /></div>
            <div className="space-y-2"><Label>Description</Label><Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Route details..." /></div>
            <div className="space-y-2"><Label>Assigned Staff</Label>
              <Select value={formData.assigned_staff} onValueChange={(v) => setFormData({ ...formData, assigned_staff: v })}>
                <SelectTrigger><SelectValue placeholder="Select staff" /></SelectTrigger>
                <SelectContent>
                  {staffOptions.map(s => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between"><Label>Active Status</Label><Switch checked={formData.is_active} onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={resetForm} disabled={isSaving}>Cancel</Button><Button onClick={handleSubmit} disabled={isSaving}>{isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} {selectedRoute ? "Update" : "Add"} Route</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
