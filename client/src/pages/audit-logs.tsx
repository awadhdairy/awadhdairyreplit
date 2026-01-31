import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { History, User, Filter, Download, Search, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/PageHeader";
import { DataTable, Column } from "@/components/DataTable";
import type { AuditLog } from "@shared/types";
import { useAuditLogs } from "@/hooks/useData";

// Extended type to include joined data
interface AuditLogWithUser extends AuditLog {
  userName?: string;
}

const actionColors: Record<string, string> = {
  CREATE: "bg-green-500/10 text-green-600",
  UPDATE: "bg-blue-500/10 text-blue-600",
  DELETE: "bg-red-500/10 text-red-600",
  LOGIN: "bg-purple-500/10 text-purple-600",
  LOGOUT: "bg-gray-500/10 text-gray-600"
};

const entityLabels: Record<string, string> = {
  cattle: "Cattle",
  production: "Production",
  delivery: "Delivery",
  invoice: "Invoice",
  expense: "Expense",
  customer: "Customer",
  auth: "Authentication",
  employee: "Employee",
  health: "Health Record",
  breeding: "Breeding",
  bottles: "Bottles",
  inventory: "Inventory"
};

export default function AuditLogsPage() {
  const { data: logsData, isLoading } = useAuditLogs();

  const [filterAction, setFilterAction] = useState<string>("all");
  const [filterEntity, setFilterEntity] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const logs = (logsData || []) as AuditLogWithUser[];

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesAction = filterAction === "all" || log.action === filterAction;
      const matchesEntity = filterEntity === "all" || log.entity_type === filterEntity;

      // Search in details or user name or entity ID
      const searchLower = searchTerm.toLowerCase();
      const detailsString = log.details ? JSON.stringify(log.details).toLowerCase() : "";
      const matchesSearch = !searchTerm ||
        detailsString.includes(searchLower) ||
        (log.userName && log.userName.toLowerCase().includes(searchLower)) ||
        (log.entity_id && log.entity_id.includes(searchTerm));

      return matchesAction && matchesEntity && matchesSearch;
    });
  }, [logs, filterAction, filterEntity, searchTerm]);

  const stats = useMemo(() => ({
    total: logs.length,
    creates: logs.filter(l => l.action === "CREATE").length,
    updates: logs.filter(l => l.action === "UPDATE").length,
    deletes: logs.filter(l => l.action === "DELETE").length
  }), [logs]);

  const columns: Column<AuditLogWithUser>[] = [
    {
      key: "created_at", header: "Timestamp", sortable: true, render: (item) => (
        <div>
          <span className="font-mono text-sm">{format(new Date(item.created_at), "dd MMM yyyy")}</span>
          <p className="text-xs text-muted-foreground">{format(new Date(item.created_at), "hh:mm:ss a")}</p>
        </div>
      )
    },
    {
      key: "user_id", header: "User", render: (item) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{item.userName || "System"}</span>
        </div>
      )
    },
    { key: "action", header: "Action", render: (item) => <Badge variant="secondary" className={actionColors[item.action] || ""}>{item.action}</Badge> },
    { key: "entity_type", header: "Entity", render: (item) => <Badge variant="outline">{entityLabels[item.entity_type] || item.entity_type}</Badge> },
    {
      key: "details", header: "Details", render: (item) => (
        <div className="max-w-[300px]">
          {item.entity_id && <span className="text-xs text-muted-foreground mr-2">ID: {item.entity_id}</span>}
          {item.details && <span className="text-sm truncate block">{JSON.stringify(item.details).slice(0, 50)}...</span>}
        </div>
      )
    },
  ];

  if (isLoading) {
    return <div className="flex h-96 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Audit Logs" description="Track all system activities and changes">
        <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-2" />Export</Button>
      </PageHeader>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="hover-elevate"><CardContent className="p-4"><p className="text-sm text-muted-foreground">Total Activities</p><p className="text-2xl font-bold text-primary">{stats.total}</p></CardContent></Card>
        <Card className="hover-elevate"><CardContent className="p-4"><p className="text-sm text-muted-foreground">Creates</p><p className="text-2xl font-bold text-green-600">{stats.creates}</p></CardContent></Card>
        <Card className="hover-elevate"><CardContent className="p-4"><p className="text-sm text-muted-foreground">Updates</p><p className="text-2xl font-bold text-blue-600">{stats.updates}</p></CardContent></Card>
        <Card className="hover-elevate"><CardContent className="p-4"><p className="text-sm text-muted-foreground">Deletes</p><p className="text-2xl font-bold text-red-600">{stats.deletes}</p></CardContent></Card>
      </motion.div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search logs..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" data-testid="input-search-logs" />
        </div>
        <Select value={filterAction} onValueChange={setFilterAction}>
          <SelectTrigger className="w-[150px]"><Filter className="h-4 w-4 mr-2" /><SelectValue placeholder="Action" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            <SelectItem value="CREATE">Create</SelectItem>
            <SelectItem value="UPDATE">Update</SelectItem>
            <SelectItem value="DELETE">Delete</SelectItem>
            <SelectItem value="LOGIN">Login</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterEntity} onValueChange={setFilterEntity}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Entity" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Entities</SelectItem>
            {Object.entries(entityLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <DataTable data={filteredLogs} columns={columns} emptyMessage="No audit logs found for the selected filters." />
      </motion.div>
    </div>
  );
}
