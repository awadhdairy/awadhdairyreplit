import { useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Plus, Heart, Syringe, Stethoscope, AlertTriangle, Download, Edit, Trash2 } from "lucide-react";
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
import type { CattleHealth, HealthRecordType } from "@shared/types";

const sampleRecords: CattleHealth[] = [
  { id: "1", cattle_id: "1", record_date: "2024-01-25", record_type: "vaccination", title: "FMD Vaccination", description: "Annual FMD vaccine administered", vet_name: "Dr. Anil", cost: 500, next_due_date: "2025-01-25", created_at: "2024-01-25" },
  { id: "2", cattle_id: "2", record_date: "2024-01-20", record_type: "treatment", title: "Mastitis Treatment", description: "Antibiotic treatment for mild mastitis", vet_name: "Dr. Anil", cost: 1500, created_at: "2024-01-20" },
  { id: "3", cattle_id: "3", record_date: "2024-01-15", record_type: "checkup", title: "Routine Checkup", description: "Monthly health checkup - all vitals normal", vet_name: "Dr. Verma", cost: 300, created_at: "2024-01-15" },
  { id: "4", cattle_id: "1", record_date: "2024-01-10", record_type: "vaccination", title: "Brucellosis Vaccine", cost: 400, next_due_date: "2025-01-10", created_at: "2024-01-10" },
];

const cattleOptions = [
  { id: "1", tag_number: "AW-001", name: "Lakshmi" },
  { id: "2", tag_number: "AW-002", name: "Kamdhenu" },
  { id: "3", tag_number: "AW-003", name: "Nandi" },
];

const recordTypeLabels: Record<HealthRecordType, string> = { vaccination: "Vaccination", treatment: "Treatment", checkup: "Checkup", disease: "Disease" };
const recordTypeColors: Record<HealthRecordType, string> = { vaccination: "bg-green-500/10 text-green-600", treatment: "bg-amber-500/10 text-amber-600", checkup: "bg-blue-500/10 text-blue-600", disease: "bg-red-500/10 text-red-600" };
const recordTypeIcons: Record<HealthRecordType, React.ComponentType<{className?: string}>> = { vaccination: Syringe, treatment: Heart, checkup: Stethoscope, disease: AlertTriangle };

export default function HealthPage() {
  const [records, setRecords] = useState<CattleHealth[]>(sampleRecords);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<CattleHealth | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({ cattle_id: "", record_type: "vaccination" as HealthRecordType, title: "", description: "", vet_name: "", cost: "", next_due_date: "", record_date: format(new Date(), "yyyy-MM-dd") });

  const stats = { total: records.length, vaccinations: records.filter(r => r.record_type === "vaccination").length, treatments: records.filter(r => r.record_type === "treatment").length, upcoming: records.filter(r => r.next_due_date && new Date(r.next_due_date) <= new Date(Date.now() + 30*24*60*60*1000)).length };

  const columns: Column<CattleHealth>[] = [
    { key: "record_date", header: "Date", sortable: true, render: (item) => format(new Date(item.record_date), "dd MMM yyyy") },
    { key: "cattle_id", header: "Cattle", render: (item) => { const c = cattleOptions.find(o => o.id === item.cattle_id); return c ? <span className="font-mono text-primary">{c.tag_number}</span> : "-"; } },
    { key: "record_type", header: "Type", render: (item) => { const Icon = recordTypeIcons[item.record_type]; return <Badge variant="secondary" className={recordTypeColors[item.record_type]}><Icon className="h-3 w-3 mr-1" />{recordTypeLabels[item.record_type]}</Badge>; } },
    { key: "title", header: "Title", sortable: true, render: (item) => <span className="font-medium">{item.title}</span> },
    { key: "vet_name", header: "Vet", render: (item) => item.vet_name || "-" },
    { key: "cost", header: "Cost", sortable: true, render: (item) => item.cost ? `₹${item.cost.toLocaleString("en-IN")}` : "-" },
    { key: "next_due_date", header: "Next Due", render: (item) => item.next_due_date ? <Badge variant="outline">{format(new Date(item.next_due_date), "dd MMM yyyy")}</Badge> : "-" },
  ];

  const actions: Action<CattleHealth>[] = [
    { label: "Edit", onClick: (item) => { setSelectedRecord(item); setFormData({ cattle_id: item.cattle_id, record_type: item.record_type, title: item.title, description: item.description || "", vet_name: item.vet_name || "", cost: item.cost?.toString() || "", next_due_date: item.next_due_date || "", record_date: item.record_date }); setIsDialogOpen(true); }, icon: Edit },
    { label: "Delete", onClick: (item) => { setRecords(prev => prev.filter(r => r.id !== item.id)); toast({ title: "Record Deleted" }); }, icon: Trash2, variant: "destructive" },
  ];

  const handleSubmit = () => {
    if (!formData.cattle_id || !formData.title) { toast({ title: "Validation Error", description: "Please fill required fields", variant: "destructive" }); return; }
    if (selectedRecord) {
      setRecords(prev => prev.map(r => r.id === selectedRecord.id ? { ...r, ...formData, cost: formData.cost ? parseFloat(formData.cost) : undefined } : r));
      toast({ title: "Record Updated" });
    } else {
      const newRecord: CattleHealth = { id: Date.now().toString(), ...formData, cost: formData.cost ? parseFloat(formData.cost) : undefined, created_at: new Date().toISOString() };
      setRecords(prev => [...prev, newRecord]);
      toast({ title: "Record Added" });
    }
    resetForm();
  };

  const resetForm = () => { setFormData({ cattle_id: "", record_type: "vaccination", title: "", description: "", vet_name: "", cost: "", next_due_date: "", record_date: format(new Date(), "yyyy-MM-dd") }); setSelectedRecord(null); setIsDialogOpen(false); };

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
              <div className="space-y-2"><Label>Cattle *</Label><Select value={formData.cattle_id} onValueChange={(v) => setFormData({...formData, cattle_id: v})}><SelectTrigger><SelectValue placeholder="Select cattle" /></SelectTrigger><SelectContent>{cattleOptions.map(c => <SelectItem key={c.id} value={c.id}>{c.tag_number} - {c.name}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label>Type *</Label><Select value={formData.record_type} onValueChange={(v) => setFormData({...formData, record_type: v as HealthRecordType})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(recordTypeLabels).map(([k,v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent></Select></div>
            </div>
            <div className="space-y-2"><Label>Title *</Label><Input value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="e.g., FMD Vaccination" /></div>
            <div className="space-y-2"><Label>Description</Label><Textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Details..." /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Vet Name</Label><Input value={formData.vet_name} onChange={(e) => setFormData({...formData, vet_name: e.target.value})} /></div>
              <div className="space-y-2"><Label>Cost (₹)</Label><Input type="number" value={formData.cost} onChange={(e) => setFormData({...formData, cost: e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Record Date</Label><Input type="date" value={formData.record_date} onChange={(e) => setFormData({...formData, record_date: e.target.value})} /></div>
              <div className="space-y-2"><Label>Next Due Date</Label><Input type="date" value={formData.next_due_date} onChange={(e) => setFormData({...formData, next_due_date: e.target.value})} /></div>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={resetForm}>Cancel</Button><Button onClick={handleSubmit}>{selectedRecord ? "Update" : "Add"} Record</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
