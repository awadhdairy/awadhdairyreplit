import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Plus, Heart, Baby, Sparkles, Check, Download, Edit, Trash2, Loader2 } from "lucide-react";
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
import type { BreedingRecord, BreedingRecordType } from "@shared/types";
import { useBreedingRecords, useAddBreedingRecord, useUpdateBreedingRecord, useDeleteBreedingRecord, useCattle } from "@/hooks/useData";

const recordTypeLabels: Record<BreedingRecordType, string> = { heat_detection: "Heat Detection", artificial_insemination: "AI", pregnancy_check: "Pregnancy Check", calving: "Calving" };
const recordTypeColors: Record<BreedingRecordType, string> = { heat_detection: "bg-red-500/10 text-red-600", artificial_insemination: "bg-blue-500/10 text-blue-600", pregnancy_check: "bg-purple-500/10 text-purple-600", calving: "bg-green-500/10 text-green-600" };
const recordTypeIcons: Record<BreedingRecordType, React.ComponentType<{ className?: string }>> = { heat_detection: Heart, artificial_insemination: Sparkles, pregnancy_check: Check, calving: Baby };

export default function BreedingPage() {
  const { data: recordsData, isLoading: isRecordsLoading } = useBreedingRecords();
  const { data: cattleData, isLoading: isCattleLoading } = useCattle();

  const addMutation = useAddBreedingRecord();
  const updateMutation = useUpdateBreedingRecord();
  const deleteMutation = useDeleteBreedingRecord();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<BreedingRecord | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    cattle_id: "",
    record_type: "heat_detection" as BreedingRecordType,
    record_date: format(new Date(), "yyyy-MM-dd"),
    notes: "",
    insemination_bull: "",
    insemination_technician: "",
    pregnancy_confirmed: false,
    expected_calving_date: ""
  });

  const records = recordsData || [];
  const cattleList = cattleData || [];

  // Create lookup map for cattle
  const cattleLookup = useMemo(() => {
    return new Map(cattleList.map(c => [c.id, c]));
  }, [cattleList]);

  const stats = {
    total: records.length,
    heat: records.filter(r => r.record_type === "heat_detection").length,
    inseminated: records.filter(r => r.record_type === "artificial_insemination").length,
    pregnant: records.filter(r => r.record_type === "pregnancy_check" && r.pregnancy_confirmed).length,
    calved: records.filter(r => r.record_type === "calving").length
  };

  const columns: Column<BreedingRecord>[] = [
    { key: "record_date", header: "Date", sortable: true, render: (item) => format(new Date(item.record_date), "dd MMM yyyy") },
    {
      key: "cattle_id", header: "Cattle", render: (item) => {
        const c = cattleLookup.get(item.cattle_id);
        return c ? <span className="font-mono text-primary">{c.tag_number}</span> : "-";
      }
    },
    { key: "record_type", header: "Type", render: (item) => { const Icon = recordTypeIcons[item.record_type]; return <Badge variant="secondary" className={recordTypeColors[item.record_type]}><Icon className="h-3 w-3 mr-1" />{recordTypeLabels[item.record_type]}</Badge>; } },
    { key: "insemination_bull", header: "Bull/Details", render: (item) => item.insemination_bull || (item.calf_details ? `Calf: ${item.calf_details.gender}, ${item.calf_details.weight}kg` : "-") },
    { key: "expected_calving_date", header: "Expected Calving", render: (item) => item.expected_calving_date ? format(new Date(item.expected_calving_date), "dd MMM yyyy") : "-" },
    { key: "notes", header: "Notes", render: (item) => item.notes ? <span className="text-sm text-muted-foreground truncate max-w-[150px]">{item.notes}</span> : "-" },
  ];

  const actions: Action<BreedingRecord>[] = [
    {
      label: "Edit",
      onClick: (item) => {
        setSelectedRecord(item);
        setFormData({
          cattle_id: item.cattle_id,
          record_type: item.record_type,
          record_date: item.record_date,
          notes: item.notes || "",
          insemination_bull: item.insemination_bull || "",
          insemination_technician: item.insemination_technician || "",
          pregnancy_confirmed: item.pregnancy_confirmed || false,
          expected_calving_date: item.expected_calving_date || ""
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
    if (!formData.cattle_id) { toast({ title: "Validation Error", description: "Please select cattle", variant: "destructive" }); return; }

    const payload = {
      ...formData,
      insemination_bull: formData.insemination_bull || undefined,
      insemination_technician: formData.insemination_technician || undefined,
      expected_calving_date: formData.expected_calving_date || undefined
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

  const resetForm = () => { setFormData({ cattle_id: "", record_type: "heat_detection", record_date: format(new Date(), "yyyy-MM-dd"), notes: "", insemination_bull: "", insemination_technician: "", pregnancy_confirmed: false, expected_calving_date: "" }); setSelectedRecord(null); setIsDialogOpen(false); };

  const isLoading = isRecordsLoading || isCattleLoading;
  const isSaving = addMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  if (isLoading) {
    return <div className="flex h-96 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Breeding Management" description="Track breeding cycles, insemination, and calvings" action={{ label: "Add Record", onClick: () => { resetForm(); setIsDialogOpen(true); } }}>
        <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-2" />Export</Button>
      </PageHeader>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="hover-elevate"><CardContent className="p-4"><p className="text-sm text-muted-foreground">Total Records</p><p className="text-2xl font-bold text-primary">{stats.total}</p></CardContent></Card>
        <Card className="hover-elevate"><CardContent className="p-4"><div className="flex items-center gap-2"><Heart className="h-4 w-4 text-red-500" /><p className="text-sm text-muted-foreground">In Heat</p></div><p className="text-2xl font-bold text-red-600">{stats.heat}</p></CardContent></Card>
        <Card className="hover-elevate"><CardContent className="p-4"><div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-blue-500" /><p className="text-sm text-muted-foreground">Inseminated</p></div><p className="text-2xl font-bold text-blue-600">{stats.inseminated}</p></CardContent></Card>
        <Card className="hover-elevate"><CardContent className="p-4"><div className="flex items-center gap-2"><Check className="h-4 w-4 text-purple-500" /><p className="text-sm text-muted-foreground">Pregnant</p></div><p className="text-2xl font-bold text-purple-600">{stats.pregnant}</p></CardContent></Card>
        <Card className="hover-elevate"><CardContent className="p-4"><div className="flex items-center gap-2"><Baby className="h-4 w-4 text-green-500" /><p className="text-sm text-muted-foreground">Calved</p></div><p className="text-2xl font-bold text-green-600">{stats.calved}</p></CardContent></Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <DataTable data={records} columns={columns} actions={actions} searchKey="cattle_id" searchPlaceholder="Search records..." emptyMessage="No breeding records found." />
      </motion.div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{selectedRecord ? "Edit Breeding Record" : "Add Breeding Record"}</DialogTitle><DialogDescription>Record a breeding event</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Cattle *</Label><Select value={formData.cattle_id} onValueChange={(v) => setFormData({ ...formData, cattle_id: v })}><SelectTrigger><SelectValue placeholder="Select cattle" /></SelectTrigger><SelectContent>{cattleList.map(c => <SelectItem key={c.id} value={c.id}>{c.tag_number} - {c.name}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label>Record Type *</Label><Select value={formData.record_type} onValueChange={(v) => setFormData({ ...formData, record_type: v as BreedingRecordType })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(recordTypeLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent></Select></div>
            </div>
            <div className="space-y-2"><Label>Record Date</Label><Input type="date" value={formData.record_date} onChange={(e) => setFormData({ ...formData, record_date: e.target.value })} /></div>
            {formData.record_type === "artificial_insemination" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Bull</Label><Input value={formData.insemination_bull} onChange={(e) => setFormData({ ...formData, insemination_bull: e.target.value })} placeholder="Bull name/ID" /></div>
                <div className="space-y-2"><Label>Technician</Label><Input value={formData.insemination_technician} onChange={(e) => setFormData({ ...formData, insemination_technician: e.target.value })} /></div>
              </div>
            )}
            {formData.record_type === "pregnancy_check" && (
              <div className="space-y-2"><Label>Expected Calving</Label><Input type="date" value={formData.expected_calving_date} onChange={(e) => setFormData({ ...formData, expected_calving_date: e.target.value })} /></div>
            )}
            <div className="space-y-2"><Label>Notes</Label><Textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Additional notes..." /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={resetForm} disabled={isSaving}>Cancel</Button><Button onClick={handleSubmit} disabled={isSaving}>{isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{selectedRecord ? "Update" : "Add"} Record</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
