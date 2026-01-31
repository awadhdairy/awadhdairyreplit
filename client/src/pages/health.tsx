import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Plus, Heart, Syringe, Stethoscope, AlertTriangle, Download, Edit, Trash2, Loader2 } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import type { HealthRecord, HealthRecordType } from "@shared/types";
import { useHealthRecords, useAddHealthRecord, useUpdateHealthRecord, useDeleteHealthRecord, useCattle } from "@/hooks/useData";

const recordTypeLabels: Record<HealthRecordType, string> = { vaccination: "Vaccination", treatment: "Treatment", checkup: "Checkup", disease: "Disease" };
const recordTypeColors: Record<HealthRecordType, string> = { vaccination: "bg-green-500/10 text-green-600", treatment: "bg-amber-500/10 text-amber-600", checkup: "bg-blue-500/10 text-blue-600", disease: "bg-red-500/10 text-red-600" };
const recordTypeIcons: Record<HealthRecordType, React.ComponentType<{ className?: string }>> = { vaccination: Syringe, treatment: Heart, checkup: Stethoscope, disease: AlertTriangle };

export default function HealthPage() {
  const { data: recordsData, isLoading: isRecordsLoading } = useHealthRecords();
  const { data: cattleData, isLoading: isCattleLoading } = useCattle();

  const addMutation = useAddHealthRecord();
  const updateMutation = useUpdateHealthRecord();
  const deleteMutation = useDeleteHealthRecord();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<HealthRecord | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({ cattle_id: "", record_type: "vaccination" as HealthRecordType, title: "", description: "", vet_name: "", cost: "", next_due_date: "", record_date: format(new Date(), "yyyy-MM-dd") });

  const records = recordsData || [];
  const cattleList = cattleData || [];

  // Lookup map for display
  const cattleLookup = useMemo(() => {
    return new Map(cattleList.map(c => [c.id, c]));
  }, [cattleList]);

  const stats = {
    total: records.length,
    vaccinations: records.filter(r => r.record_type === "vaccination").length,
    treatments: records.filter(r => r.record_type === "treatment").length,
    upcoming: records.filter(r => r.next_due_date && new Date(r.next_due_date) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)).length
  };

  const columns: Column<HealthRecord>[] = [
    { key: "record_date", header: "Date", sortable: true, render: (item) => format(new Date(item.record_date), "dd MMM yyyy") },
    {
      key: "cattle_id", header: "Cattle", render: (item) => {
        const c = cattleLookup.get(item.cattle_id);
        return c ? <span className="font-mono text-primary">{c.tag_number}</span> : "-";
      }
    },
    { key: "record_type", header: "Type", render: (item) => { const Icon = recordTypeIcons[item.record_type]; return <Badge variant="secondary" className={recordTypeColors[item.record_type]}><Icon className="h-3 w-3 mr-1" />{recordTypeLabels[item.record_type]}</Badge>; } },
    { key: "title", header: "Title", sortable: true, render: (item) => <span className="font-medium">{item.title}</span> },
    { key: "vet_name", header: "Vet", render: (item) => item.vet_name || "-" },
    { key: "cost", header: "Cost", sortable: true, render: (item) => item.cost ? `₹${item.cost.toLocaleString("en-IN")}` : "-" },
    { key: "next_due_date", header: "Next Due", render: (item) => item.next_due_date ? <Badge variant="outline">{format(new Date(item.next_due_date), "dd MMM yyyy")}</Badge> : "-" },
  ];

  const actions: Action<HealthRecord>[] = [
    {
      label: "Edit",
      onClick: (item) => {
        setSelectedRecord(item);
        setFormData({
          cattle_id: item.cattle_id,
          record_type: item.record_type,
          title: item.title,
          description: item.description || "",
          vet_name: item.vet_name || "",
          cost: item.cost?.toString() || "",
          next_due_date: item.next_due_date || "",
          record_date: item.record_date
        });
        setIsDialogOpen(true);
      },
      icon: Edit
    },
    {
      label: "Delete",
      onClick: (item) => {
        deleteMutation.mutate(item.id, {
          onSuccess: () => toast({ title: "Record Deleted" }),
          onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" })
        });
      },
      icon: Trash2,
      variant: "destructive"
    },
  ];

  const handleSubmit = () => {
    if (!formData.cattle_id || !formData.title) { toast({ title: "Validation Error", description: "Please fill required fields", variant: "destructive" }); return; }

    const payload = {
      ...formData,
      cost: formData.cost ? parseFloat(formData.cost) : undefined,
      description: formData.description || undefined,
      vet_name: formData.vet_name || undefined,
      next_due_date: formData.next_due_date || undefined
    };

    if (selectedRecord) {
      updateMutation.mutate({ id: selectedRecord.id, ...payload }, {
        onSuccess: () => { toast({ title: "Record Updated" }); resetForm(); },
        onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" })
      });
    } else {
      addMutation.mutate(payload, {
        onSuccess: () => { toast({ title: "Record Added" }); resetForm(); },
        onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" })
      });
    }
  };

  const resetForm = () => { setFormData({ cattle_id: "", record_type: "vaccination", title: "", description: "", vet_name: "", cost: "", next_due_date: "", record_date: format(new Date(), "yyyy-MM-dd") }); setSelectedRecord(null); setIsDialogOpen(false); };

  const isLoading = isRecordsLoading || isCattleLoading;
  const isSaving = addMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  if (isLoading) {
    return <div className="flex h-96 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Health Records" description="Track cattle health, vaccinations, and treatments" action={{ label: "Add Record", onClick: () => { resetForm(); setIsDialogOpen(true); } }}>
        <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-2" />Export</Button>
      </PageHeader>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="hover-elevate"><CardContent className="p-4"><p className="text-sm text-muted-foreground">Total Records</p><p className="text-2xl font-bold text-primary">{stats.total}</p></CardContent></Card>
        <Card className="hover-elevate"><CardContent className="p-4"><p className="text-sm text-muted-foreground">Vaccinations</p><p className="text-2xl font-bold text-green-600">{stats.vaccinations}</p></CardContent></Card>
        <Card className="hover-elevate"><CardContent className="p-4"><p className="text-sm text-muted-foreground">Treatments</p><p className="text-2xl font-bold text-amber-600">{stats.treatments}</p></CardContent></Card>
        <Card className="hover-elevate"><CardContent className="p-4"><p className="text-sm text-muted-foreground">Due (30 days)</p><p className="text-2xl font-bold text-red-600">{stats.upcoming}</p></CardContent></Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <DataTable data={records} columns={columns} actions={actions} searchKey="title" searchPlaceholder="Search records..." emptyMessage="No health records found." />
      </motion.div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{selectedRecord ? "Edit Health Record" : "Add Health Record"}</DialogTitle><DialogDescription>Record a health event for cattle</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Cattle *</Label><Select value={formData.cattle_id} onValueChange={(v) => setFormData({ ...formData, cattle_id: v })}><SelectTrigger><SelectValue placeholder="Select cattle" /></SelectTrigger><SelectContent>{cattleList.map(c => <SelectItem key={c.id} value={c.id}>{c.tag_number} - {c.name}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label>Type *</Label><Select value={formData.record_type} onValueChange={(v) => setFormData({ ...formData, record_type: v as HealthRecordType })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(recordTypeLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent></Select></div>
            </div>
            <div className="space-y-2"><Label>Title *</Label><Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="e.g., FMD Vaccination" /></div>
            <div className="space-y-2"><Label>Description</Label><Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Details..." /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Vet Name</Label><Input value={formData.vet_name} onChange={(e) => setFormData({ ...formData, vet_name: e.target.value })} /></div>
              <div className="space-y-2"><Label>Cost (₹)</Label><Input type="number" value={formData.cost} onChange={(e) => setFormData({ ...formData, cost: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Record Date</Label><Input type="date" value={formData.record_date} onChange={(e) => setFormData({ ...formData, record_date: e.target.value })} /></div>
              <div className="space-y-2"><Label>Next Due Date</Label><Input type="date" value={formData.next_due_date} onChange={(e) => setFormData({ ...formData, next_due_date: e.target.value })} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetForm} disabled={isSaving}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={isSaving}>{isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{selectedRecord ? "Update" : "Add"} Record</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
