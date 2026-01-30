import { useState, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { 
  Plus, 
  Eye, 
  Download, 
  IndianRupee, 
  Calendar,
  FileText,
  Printer,
  Send,
  CreditCard,
  X,
  FileSpreadsheet,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { useInvoices, useCustomers, useAddInvoice, useUpdateInvoice } from "@/hooks/useData";
import type { Invoice, PaymentStatus, Customer } from "@shared/types";

interface InvoiceWithCustomer extends Invoice {
  customerName: string;
  customerPhone?: string;
  customerAddress?: string;
}

export default function BillingPage() {
  const { data: invoicesData, isLoading: invoicesLoading } = useInvoices();
  const { data: customersData, isLoading: customersLoading } = useCustomers();
  const addInvoiceMutation = useAddInvoice();
  const updateInvoiceMutation = useUpdateInvoice();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceWithCustomer | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const { toast } = useToast();

  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState("cash");
  const [paymentNotes, setPaymentNotes] = useState("");

  const [formData, setFormData] = useState({
    customer_id: "",
    billing_period_start: "",
    billing_period_end: "",
    due_date: "",
    total_amount: "",
    tax_amount: "0",
    discount_amount: "0",
    notes: "",
  });

  const customers = customersData || [];
  const invoices = invoicesData || [];

  const invoicesWithCustomer: InvoiceWithCustomer[] = useMemo(() => {
    return invoices.map((invoice) => {
      const customer = customers.find((c) => c.id === invoice.customer_id);
      return {
        ...invoice,
        customerName: customer?.name || "Unknown Customer",
        customerPhone: customer?.phone,
        customerAddress: customer?.address,
      };
    });
  }, [invoices, customers]);

  const filteredInvoices = filterStatus === "all" 
    ? invoicesWithCustomer 
    : invoicesWithCustomer.filter((i) => i.payment_status === filterStatus);

  const stats = useMemo(() => ({
    total: invoicesWithCustomer.reduce((sum, i) => sum + (i.final_amount || 0), 0),
    collected: invoicesWithCustomer.reduce((sum, i) => sum + (i.paid_amount || 0), 0),
    pending: invoicesWithCustomer.reduce((sum, i) => sum + ((i.final_amount || 0) - (i.paid_amount || 0)), 0),
    overdue: invoicesWithCustomer
      .filter((i) => i.payment_status === "overdue")
      .reduce((sum, i) => sum + ((i.final_amount || 0) - (i.paid_amount || 0)), 0),
  }), [invoicesWithCustomer]);

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
        <span className="font-semibold">₹{(item.final_amount || 0).toLocaleString("en-IN")}</span>
      ),
    },
    {
      key: "paid_amount",
      header: "Paid",
      sortable: true,
      render: (item) => (
        <span className="text-green-600">₹{(item.paid_amount || 0).toLocaleString("en-IN")}</span>
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
        <span className="text-sm">
          {item.due_date ? format(new Date(item.due_date), "dd MMM yyyy") : "-"}
        </span>
      ),
    },
  ];

  const actions: Action<InvoiceWithCustomer>[] = [
    {
      label: "View Invoice",
      onClick: (item) => {
        setSelectedInvoice(item);
        setIsViewDialogOpen(true);
      },
      icon: Eye,
    },
    {
      label: "Record Payment",
      onClick: (item) => {
        setSelectedInvoice(item);
        setPaymentAmount("");
        setPaymentMode("cash");
        setPaymentNotes("");
        setIsPaymentDialogOpen(true);
      },
      icon: CreditCard,
    },
    {
      label: "Download PDF",
      onClick: (item) => handleDownloadPDF(item),
      icon: Download,
    },
    {
      label: "Print",
      onClick: (item) => handlePrint(item),
      icon: Printer,
    },
    {
      label: "Send to Customer",
      onClick: (item) => {
        toast({ 
          title: "Invoice Sent", 
          description: `Invoice ${item.invoice_number} sent to ${item.customerName}` 
        });
      },
      icon: Send,
    },
  ];

  const handleGenerateInvoice = () => {
    if (!formData.customer_id || !formData.billing_period_start || !formData.billing_period_end) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const customer = customers.find(c => c.id === formData.customer_id);
    const totalAmount = parseFloat(formData.total_amount) || 0;
    const taxAmount = parseFloat(formData.tax_amount) || 0;
    const discountAmount = parseFloat(formData.discount_amount) || 0;
    const finalAmount = totalAmount + taxAmount - discountAmount;

    const invoiceNumber = `AWD-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(3, '0')}`;

    addInvoiceMutation.mutate(
      {
        invoice_number: invoiceNumber,
        customer_id: formData.customer_id,
        billing_period_start: formData.billing_period_start,
        billing_period_end: formData.billing_period_end,
        due_date: formData.due_date || undefined,
        total_amount: totalAmount,
        tax_amount: taxAmount,
        discount_amount: discountAmount,
        final_amount: finalAmount,
        paid_amount: 0,
        payment_status: "pending",
        notes: formData.notes || undefined,
      },
      {
        onSuccess: () => {
          toast({
            title: "Invoice Generated",
            description: `Invoice ${invoiceNumber} created for ${customer?.name}`,
          });
          setIsDialogOpen(false);
          resetForm();
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to generate invoice",
            variant: "destructive",
          });
        },
      }
    );
  };

  const resetForm = () => {
    setFormData({
      customer_id: "",
      billing_period_start: "",
      billing_period_end: "",
      due_date: "",
      total_amount: "",
      tax_amount: "0",
      discount_amount: "0",
      notes: "",
    });
  };

  const handleRecordPayment = () => {
    if (!selectedInvoice || !paymentAmount) return;

    const amount = parseFloat(paymentAmount);
    const remaining = (selectedInvoice.final_amount || 0) - (selectedInvoice.paid_amount || 0);

    if (amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Payment amount must be greater than 0",
        variant: "destructive",
      });
      return;
    }

    if (amount > remaining) {
      toast({
        title: "Invalid Amount",
        description: `Maximum payment allowed is ₹${remaining.toLocaleString("en-IN")}`,
        variant: "destructive",
      });
      return;
    }

    const newPaidAmount = (selectedInvoice.paid_amount || 0) + amount;
    const newStatus: PaymentStatus = newPaidAmount >= (selectedInvoice.final_amount || 0) ? "paid" : "partial";

    updateInvoiceMutation.mutate(
      {
        id: selectedInvoice.id,
        paid_amount: newPaidAmount,
        payment_status: newStatus,
        payment_date: newStatus === "paid" ? new Date().toISOString().split('T')[0] : selectedInvoice.payment_date,
      },
      {
        onSuccess: () => {
          toast({
            title: "Payment Recorded",
            description: `₹${amount.toLocaleString("en-IN")} recorded for ${selectedInvoice.invoice_number}`,
          });
          setIsPaymentDialogOpen(false);
          setSelectedInvoice(null);
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to record payment",
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleDownloadPDF = (invoice: InvoiceWithCustomer) => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.setTextColor(34, 139, 34);
    doc.text("AWADH DAIRY", 105, 20, { align: "center" });
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("Premium Dairy Products", 105, 27, { align: "center" });
    
    doc.setDrawColor(34, 139, 34);
    doc.setLineWidth(0.5);
    doc.line(20, 32, 190, 32);
    
    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.text("TAX INVOICE", 105, 42, { align: "center" });
    
    doc.setFontSize(10);
    doc.text(`Invoice Number: ${invoice.invoice_number}`, 20, 55);
    doc.text(`Date: ${format(new Date(invoice.created_at), "dd MMM yyyy")}`, 20, 62);
    doc.text(`Due Date: ${invoice.due_date ? format(new Date(invoice.due_date), "dd MMM yyyy") : "N/A"}`, 20, 69);
    
    doc.text("Bill To:", 120, 55);
    doc.setFontSize(11);
    doc.text(invoice.customerName, 120, 62);
    doc.setFontSize(10);
    doc.text(invoice.customerPhone || "", 120, 69);
    doc.text(invoice.customerAddress || "", 120, 76);
    
    doc.setFontSize(10);
    doc.text(`Billing Period: ${format(new Date(invoice.billing_period_start), "dd MMM yyyy")} - ${format(new Date(invoice.billing_period_end), "dd MMM yyyy")}`, 20, 90);
    
    autoTable(doc, {
      startY: 100,
      head: [["Description", "Amount (₹)"]],
      body: [
        ["Total Amount", invoice.total_amount?.toLocaleString("en-IN") || "0"],
        ["Tax Amount", invoice.tax_amount?.toLocaleString("en-IN") || "0"],
        ["Discount", `-${invoice.discount_amount?.toLocaleString("en-IN") || "0"}`],
      ],
      foot: [
        ["Final Amount", `₹${invoice.final_amount?.toLocaleString("en-IN") || "0"}`],
        ["Amount Paid", `₹${invoice.paid_amount?.toLocaleString("en-IN") || "0"}`],
        ["Balance Due", `₹${((invoice.final_amount || 0) - (invoice.paid_amount || 0)).toLocaleString("en-IN")}`],
      ],
      theme: "striped",
      headStyles: { fillColor: [34, 139, 34] },
      footStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: "bold" },
    });
    
    const finalY = (doc as any).lastAutoTable.finalY + 20;
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("Thank you for your business!", 105, finalY, { align: "center" });
    doc.text("For any queries, please contact us.", 105, finalY + 7, { align: "center" });
    
    doc.save(`Invoice_${invoice.invoice_number}.pdf`);
    
    toast({
      title: "PDF Downloaded",
      description: `Invoice ${invoice.invoice_number} downloaded successfully`,
    });
  };

  const handlePrint = (invoice: InvoiceWithCustomer) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast({
        title: "Print Error",
        description: "Please allow popups to print invoices",
        variant: "destructive",
      });
      return;
    }

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${invoice.invoice_number}</title>
        <style>
          body { font-family: 'Outfit', Arial, sans-serif; padding: 40px; color: #333; }
          .header { text-align: center; border-bottom: 2px solid #228B22; padding-bottom: 20px; margin-bottom: 30px; }
          .header h1 { color: #228B22; margin: 0; font-size: 28px; }
          .header p { color: #666; margin: 5px 0 0; }
          .invoice-title { text-align: center; font-size: 20px; font-weight: bold; margin: 20px 0; }
          .details { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .details-left, .details-right { width: 45%; }
          .details-right { text-align: right; }
          .label { color: #666; font-size: 12px; margin-bottom: 5px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th { background: #228B22; color: white; padding: 12px; text-align: left; }
          td { padding: 12px; border-bottom: 1px solid #ddd; }
          .total-row { font-weight: bold; background: #f5f5f5; }
          .footer { text-align: center; margin-top: 40px; color: #666; font-size: 12px; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>AWADH DAIRY</h1>
          <p>Premium Dairy Products</p>
        </div>
        <div class="invoice-title">TAX INVOICE</div>
        <div class="details">
          <div class="details-left">
            <div class="label">Invoice Number</div>
            <div><strong>${invoice.invoice_number}</strong></div>
            <div class="label" style="margin-top: 10px;">Date</div>
            <div>${format(new Date(invoice.created_at), "dd MMM yyyy")}</div>
            <div class="label" style="margin-top: 10px;">Due Date</div>
            <div>${invoice.due_date ? format(new Date(invoice.due_date), "dd MMM yyyy") : "N/A"}</div>
          </div>
          <div class="details-right">
            <div class="label">Bill To</div>
            <div><strong>${invoice.customerName}</strong></div>
            <div>${invoice.customerPhone || ""}</div>
            <div>${invoice.customerAddress || ""}</div>
          </div>
        </div>
        <div class="label">Billing Period</div>
        <div>${format(new Date(invoice.billing_period_start), "dd MMM yyyy")} - ${format(new Date(invoice.billing_period_end), "dd MMM yyyy")}</div>
        <table>
          <tr><th>Description</th><th style="text-align: right;">Amount (₹)</th></tr>
          <tr><td>Total Amount</td><td style="text-align: right;">${(invoice.total_amount || 0).toLocaleString("en-IN")}</td></tr>
          <tr><td>Tax Amount</td><td style="text-align: right;">${(invoice.tax_amount || 0).toLocaleString("en-IN")}</td></tr>
          <tr><td>Discount</td><td style="text-align: right;">-${(invoice.discount_amount || 0).toLocaleString("en-IN")}</td></tr>
          <tr class="total-row"><td>Final Amount</td><td style="text-align: right;">₹${(invoice.final_amount || 0).toLocaleString("en-IN")}</td></tr>
          <tr><td>Amount Paid</td><td style="text-align: right;">₹${(invoice.paid_amount || 0).toLocaleString("en-IN")}</td></tr>
          <tr class="total-row"><td>Balance Due</td><td style="text-align: right;">₹${((invoice.final_amount || 0) - (invoice.paid_amount || 0)).toLocaleString("en-IN")}</td></tr>
        </table>
        <div class="footer">
          <p>Thank you for your business!</p>
          <p>For any queries, please contact us.</p>
        </div>
        <script>window.onload = function() { window.print(); }</script>
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    
    toast({
      title: "Print Initiated",
      description: `Printing invoice ${invoice.invoice_number}`,
    });
  };

  const handleExportAll = () => {
    const exportData = invoicesWithCustomer.map((inv) => ({
      "Invoice Number": inv.invoice_number,
      "Customer Name": inv.customerName,
      "Customer Phone": inv.customerPhone || "",
      "Billing Period Start": format(new Date(inv.billing_period_start), "dd/MM/yyyy"),
      "Billing Period End": format(new Date(inv.billing_period_end), "dd/MM/yyyy"),
      "Total Amount": inv.total_amount || 0,
      "Tax Amount": inv.tax_amount || 0,
      "Discount": inv.discount_amount || 0,
      "Final Amount": inv.final_amount || 0,
      "Paid Amount": inv.paid_amount || 0,
      "Balance Due": (inv.final_amount || 0) - (inv.paid_amount || 0),
      "Status": inv.payment_status,
      "Due Date": inv.due_date ? format(new Date(inv.due_date), "dd/MM/yyyy") : "",
      "Payment Date": inv.payment_date ? format(new Date(inv.payment_date), "dd/MM/yyyy") : "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Invoices");
    
    const colWidths = [
      { wch: 18 }, { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
      { wch: 12 }, { wch: 12 }, { wch: 10 }, { wch: 12 }, { wch: 12 },
      { wch: 12 }, { wch: 10 }, { wch: 12 }, { wch: 12 },
    ];
    worksheet['!cols'] = colWidths;

    XLSX.writeFile(workbook, `Invoices_${format(new Date(), "yyyy-MM-dd")}.xlsx`);

    toast({
      title: "Export Complete",
      description: `${invoicesWithCustomer.length} invoices exported to Excel`,
    });
  };

  if (invoicesLoading || customersLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading billing data...</span>
      </div>
    );
  }

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
        <Button variant="outline" size="sm" onClick={handleExportAll} data-testid="button-export-all">
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Export All
        </Button>
      </PageHeader>

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
        <span className="text-sm text-muted-foreground">
          Showing {filteredInvoices.length} of {invoicesWithCustomer.length} invoices
        </span>
      </div>

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
          emptyMessage="No invoices found. Click 'Generate Invoice' to create one."
        />
      </motion.div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Generate Invoice</DialogTitle>
            <DialogDescription>
              Create a new invoice for a customer
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="customer">Customer *</Label>
              <Select 
                value={formData.customer_id} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, customer_id: value }))}
              >
                <SelectTrigger data-testid="select-invoice-customer">
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name} ({customer.phone})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start">Period Start *</Label>
                <Input 
                  type="date" 
                  id="start" 
                  value={formData.billing_period_start}
                  onChange={(e) => setFormData(prev => ({ ...prev, billing_period_start: e.target.value }))}
                  data-testid="input-period-start" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end">Period End *</Label>
                <Input 
                  type="date" 
                  id="end" 
                  value={formData.billing_period_end}
                  onChange={(e) => setFormData(prev => ({ ...prev, billing_period_end: e.target.value }))}
                  data-testid="input-period-end" 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="due">Due Date</Label>
                <Input 
                  type="date" 
                  id="due" 
                  value={formData.due_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                  data-testid="input-due-date" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="total">Total Amount (₹) *</Label>
                <Input 
                  type="number" 
                  id="total" 
                  placeholder="0"
                  value={formData.total_amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, total_amount: e.target.value }))}
                  data-testid="input-total-amount" 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tax">Tax Amount (₹)</Label>
                <Input 
                  type="number" 
                  id="tax" 
                  placeholder="0"
                  value={formData.tax_amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, tax_amount: e.target.value }))}
                  data-testid="input-tax-amount" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discount">Discount (₹)</Label>
                <Input 
                  type="number" 
                  id="discount" 
                  placeholder="0"
                  value={formData.discount_amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, discount_amount: e.target.value }))}
                  data-testid="input-discount-amount" 
                />
              </div>
            </div>

            <div className="p-3 bg-muted rounded-md">
              <div className="flex justify-between text-sm">
                <span>Total: ₹{(parseFloat(formData.total_amount) || 0).toLocaleString("en-IN")}</span>
                <span>Tax: ₹{(parseFloat(formData.tax_amount) || 0).toLocaleString("en-IN")}</span>
                <span>Discount: ₹{(parseFloat(formData.discount_amount) || 0).toLocaleString("en-IN")}</span>
              </div>
              <div className="text-lg font-bold text-primary mt-2">
                Final Amount: ₹{(
                  (parseFloat(formData.total_amount) || 0) + 
                  (parseFloat(formData.tax_amount) || 0) - 
                  (parseFloat(formData.discount_amount) || 0)
                ).toLocaleString("en-IN")}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea 
                id="notes" 
                placeholder="Optional notes..."
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                data-testid="input-invoice-notes"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsDialogOpen(false); resetForm(); }}>
              Cancel
            </Button>
            <Button 
              onClick={handleGenerateInvoice} 
              disabled={addInvoiceMutation.isPending}
              data-testid="button-generate-invoice"
            >
              {addInvoiceMutation.isPending ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating...</>
              ) : (
                <>Generate Invoice</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                    Remaining: ₹{((selectedInvoice.final_amount || 0) - (selectedInvoice.paid_amount || 0)).toLocaleString("en-IN")}
                  </span>
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Payment Amount (₹) *</Label>
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

            <div className="space-y-2">
              <Label htmlFor="payment-notes">Notes</Label>
              <Textarea
                id="payment-notes"
                placeholder="Optional payment notes..."
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                data-testid="input-payment-notes"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleRecordPayment} 
              disabled={updateInvoiceMutation.isPending}
              data-testid="button-record-payment"
            >
              {updateInvoiceMutation.isPending ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Recording...</>
              ) : (
                <>Record Payment</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Invoice Details
            </DialogTitle>
            <DialogDescription>
              {selectedInvoice?.invoice_number}
            </DialogDescription>
          </DialogHeader>

          {selectedInvoice && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Customer</p>
                    <p className="font-medium">{selectedInvoice.customerName}</p>
                    <p className="text-sm">{selectedInvoice.customerPhone}</p>
                    <p className="text-sm text-muted-foreground">{selectedInvoice.customerAddress}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Billing Period</p>
                    <p className="font-medium">
                      {format(new Date(selectedInvoice.billing_period_start), "dd MMM yyyy")} - {format(new Date(selectedInvoice.billing_period_end), "dd MMM yyyy")}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Invoice Date</p>
                    <p className="font-medium">{format(new Date(selectedInvoice.created_at), "dd MMM yyyy")}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Due Date</p>
                    <p className="font-medium">{selectedInvoice.due_date ? format(new Date(selectedInvoice.due_date), "dd MMM yyyy") : "Not set"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <StatusBadge status={selectedInvoice.payment_status} type="payment" />
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span>Total Amount</span>
                  <span>₹{(selectedInvoice.total_amount || 0).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax Amount</span>
                  <span>₹{(selectedInvoice.tax_amount || 0).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Discount</span>
                  <span className="text-red-600">-₹{(selectedInvoice.discount_amount || 0).toLocaleString("en-IN")}</span>
                </div>
                <div className="border-t pt-3 flex justify-between font-bold text-lg">
                  <span>Final Amount</span>
                  <span className="text-primary">₹{(selectedInvoice.final_amount || 0).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Amount Paid</span>
                  <span>₹{(selectedInvoice.paid_amount || 0).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Balance Due</span>
                  <span className={((selectedInvoice.final_amount || 0) - (selectedInvoice.paid_amount || 0)) > 0 ? "text-red-600" : "text-green-600"}>
                    ₹{((selectedInvoice.final_amount || 0) - (selectedInvoice.paid_amount || 0)).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {selectedInvoice.notes && (
                <div>
                  <p className="text-sm text-muted-foreground">Notes</p>
                  <p className="text-sm">{selectedInvoice.notes}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => selectedInvoice && handleDownloadPDF(selectedInvoice)}>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            <Button variant="outline" onClick={() => selectedInvoice && handlePrint(selectedInvoice)}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button 
              onClick={() => {
                setIsViewDialogOpen(false);
                setIsPaymentDialogOpen(true);
              }}
              disabled={(selectedInvoice?.final_amount || 0) <= (selectedInvoice?.paid_amount || 0)}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Record Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
