import { useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { 
  Plus, 
  Eye, 
  Download, 
  IndianRupee, 
  Calendar,
  FileText,
  Printer,
  Send,
  CreditCard
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { PageHeader } from "@/components/PageHeader";
import { DataTable, Column, Action } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { useToast } from "@/hooks/use-toast";
import type { Invoice, PaymentStatus } from "@shared/types";

interface InvoiceWithCustomer extends Invoice {
  customerName: string;
}

const sampleInvoices: InvoiceWithCustomer[] = [
  {
    id: "1",
    invoice_number: "INV-2024-001",
    customer_id: "1",
    customerName: "Sharma Family",
    billing_period_start: "2024-01-01",
    billing_period_end: "2024-01-31",
    total_amount: 4550,
    tax_amount: 0,
    discount_amount: 50,
    final_amount: 4500,
    paid_amount: 4500,
    payment_status: "paid",
    due_date: "2024-02-05",
    payment_date: "2024-02-03",
    created_at: "2024-02-01",
  },
  {
    id: "2",
    invoice_number: "INV-2024-002",
    customer_id: "2",
    customerName: "Gupta Residence",
    billing_period_start: "2024-01-01",
    billing_period_end: "2024-01-31",
    total_amount: 2475,
    tax_amount: 0,
    discount_amount: 0,
    final_amount: 2475,
    paid_amount: 1200,
    payment_status: "partial",
    due_date: "2024-02-05",
    created_at: "2024-02-01",
  },
  {
    id: "3",
    invoice_number: "INV-2024-003",
    customer_id: "3",
    customerName: "Singh House",
    billing_period_start: "2024-01-01",
    billing_period_end: "2024-01-31",
    total_amount: 8200,
    tax_amount: 25,
    discount_amount: 0,
    final_amount: 8225,
    paid_amount: 0,
    payment_status: "pending",
    due_date: "2024-02-05",
    created_at: "2024-02-01",
  },
  {
    id: "4",
    invoice_number: "INV-2024-004",
    customer_id: "4",
    customerName: "Verma Dairy Store",
    billing_period_start: "2024-01-01",
    billing_period_end: "2024-01-31",
    total_amount: 28500,
    tax_amount: 0,
    discount_amount: 500,
    final_amount: 28000,
    paid_amount: 0,
    payment_status: "overdue",
    due_date: "2024-01-20",
    created_at: "2024-01-15",
  },
];

const customers = [
  { id: "1", name: "Sharma Family" },
  { id: "2", name: "Gupta Residence" },
  { id: "3", name: "Singh House" },
  { id: "4", name: "Verma Dairy Store" },
  { id: "5", name: "Patel Family" },
];

export default function BillingPage() {
  const [invoices, setInvoices] = useState<InvoiceWithCustomer[]>(sampleInvoices);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceWithCustomer | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const { toast } = useToast();

  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState("cash");

  const filteredInvoices = filterStatus === "all" 
    ? invoices 
    : invoices.filter((i) => i.payment_status === filterStatus);

  const stats = {
    total: invoices.reduce((sum, i) => sum + i.final_amount, 0),
    collected: invoices.reduce((sum, i) => sum + i.paid_amount, 0),
    pending: invoices.reduce((sum, i) => sum + (i.final_amount - i.paid_amount), 0),
    overdue: invoices
      .filter((i) => i.payment_status === "overdue")
      .reduce((sum, i) => sum + (i.final_amount - i.paid_amount), 0),
  };

  const columns: Column<InvoiceWithCustomer>[] = [
    {
      key: "invoice_number",
      header: "Invoice #",
      sortable: true,
      render: (item) => (
        <span className="font-mono text-primary">{item.invoice_number}</span>
      ),
    },
    {
      key: "customerName",
      header: "Customer",
      sortable: true,
      render: (item) => <span className="font-medium">{item.customerName}</span>,
    },
    {
      key: "billing_period_end",
      header: "Period",
      render: (item) => (
        <span className="text-sm">
          {format(new Date(item.billing_period_start), "dd MMM")} -{" "}
          {format(new Date(item.billing_period_end), "dd MMM yyyy")}
        </span>
      ),
    },
    {
      key: "final_amount",
      header: "Amount",
      sortable: true,
      render: (item) => (
        <span className="font-semibold">₹{item.final_amount.toLocaleString("en-IN")}</span>
      ),
    },
    {
      key: "paid_amount",
      header: "Paid",
      sortable: true,
      render: (item) => (
        <span className="text-green-600">₹{item.paid_amount.toLocaleString("en-IN")}</span>
      ),
    },
    {
      key: "payment_status",
      header: "Status",
      render: (item) => <StatusBadge status={item.payment_status} type="payment" />,
    },
    {
      key: "due_date",
      header: "Due Date",
      sortable: true,
      render: (item) => (
        <span className="text-sm">{format(new Date(item.due_date!), "dd MMM yyyy")}</span>
      ),
    },
  ];

  const actions: Action<InvoiceWithCustomer>[] = [
    {
      label: "View Invoice",
      onClick: (item) => {
        setSelectedInvoice(item);
        toast({ title: "View Invoice", description: `Viewing ${item.invoice_number}` });
      },
      icon: Eye,
    },
    {
      label: "Record Payment",
      onClick: (item) => {
        setSelectedInvoice(item);
        setPaymentAmount("");
        setIsPaymentDialogOpen(true);
      },
      icon: CreditCard,
    },
    {
      label: "Download PDF",
      onClick: (item) => {
        toast({ title: "Download", description: `Downloading ${item.invoice_number}` });
      },
      icon: Download,
    },
    {
      label: "Print",
      onClick: (item) => {
        toast({ title: "Print", description: `Printing ${item.invoice_number}` });
      },
      icon: Printer,
    },
    {
      label: "Send to Customer",
      onClick: (item) => {
        toast({ title: "Sent", description: `Invoice sent to customer` });
      },
      icon: Send,
    },
  ];

  const handleRecordPayment = () => {
    if (!selectedInvoice || !paymentAmount) return;

    const amount = parseFloat(paymentAmount);
    const remaining = selectedInvoice.final_amount - selectedInvoice.paid_amount;

    if (amount > remaining) {
      toast({
        title: "Invalid Amount",
        description: `Maximum payment allowed is ₹${remaining}`,
        variant: "destructive",
      });
      return;
    }

    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id === selectedInvoice.id) {
          const newPaidAmount = inv.paid_amount + amount;
          const newStatus: PaymentStatus =
            newPaidAmount >= inv.final_amount ? "paid" : "partial";
          return {
            ...inv,
            paid_amount: newPaidAmount,
            payment_status: newStatus,
            payment_date: newStatus === "paid" ? new Date().toISOString() : inv.payment_date,
          };
        }
        return inv;
      })
    );

    toast({
      title: "Payment Recorded",
      description: `₹${amount} recorded for ${selectedInvoice.invoice_number}`,
    });

    setIsPaymentDialogOpen(false);
    setSelectedInvoice(null);
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Billing & Invoices"
        description="Manage invoices and track payments"
        action={{
          label: "Generate Invoice",
          onClick: () => setIsDialogOpen(true),
        }}
      >
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export All
        </Button>
      </PageHeader>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <Card className="hover-elevate">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Billed</p>
            <p className="text-2xl font-bold text-primary">
              ₹{stats.total.toLocaleString("en-IN")}
            </p>
          </CardContent>
        </Card>
        <Card className="hover-elevate">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Collected</p>
            <p className="text-2xl font-bold text-green-600">
              ₹{stats.collected.toLocaleString("en-IN")}
            </p>
          </CardContent>
        </Card>
        <Card className="hover-elevate">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold text-amber-600">
              ₹{stats.pending.toLocaleString("en-IN")}
            </p>
          </CardContent>
        </Card>
        <Card className="hover-elevate">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Overdue</p>
            <p className="text-2xl font-bold text-red-600">
              ₹{stats.overdue.toLocaleString("en-IN")}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]" data-testid="select-invoice-status">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="partial">Partial</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Data Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <DataTable
          data={filteredInvoices}
          columns={columns}
          actions={actions}
          searchKey="invoice_number"
          searchPlaceholder="Search invoices..."
          emptyMessage="No invoices found."
        />
      </motion.div>

      {/* Generate Invoice Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Generate Invoice</DialogTitle>
            <DialogDescription>
              Create a new invoice for a customer
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="customer">Customer</Label>
              <Select>
                <SelectTrigger data-testid="select-invoice-customer">
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start">Period Start</Label>
                <Input type="date" id="start" data-testid="input-period-start" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end">Period End</Label>
                <Input type="date" id="end" data-testid="input-period-end" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="due">Due Date</Label>
              <Input type="date" id="due" data-testid="input-due-date" />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              toast({
                title: "Invoice Generated",
                description: "New invoice has been created"
              });
              setIsDialogOpen(false);
            }} data-testid="button-generate-invoice">
              Generate Invoice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Record Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              {selectedInvoice && (
                <>
                  Recording payment for {selectedInvoice.invoice_number}
                  <br />
                  <span className="font-medium">
                    Remaining: ₹{(selectedInvoice.final_amount - selectedInvoice.paid_amount).toLocaleString("en-IN")}
                  </span>
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Payment Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                data-testid="input-payment-amount"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mode">Payment Mode</Label>
              <Select value={paymentMode} onValueChange={setPaymentMode}>
                <SelectTrigger data-testid="select-payment-mode">
                  <SelectValue placeholder="Select mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRecordPayment} data-testid="button-record-payment">
              Record Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
