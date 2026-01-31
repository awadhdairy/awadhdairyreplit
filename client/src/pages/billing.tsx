import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";
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
  Loader2,
  Trash2,
  Phone,
  Mail,
  MapPin,
  QrCode,
  Smartphone,
  Edit2,
  Check
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { useInvoices, useCustomers, useAddInvoice, useUpdateInvoice, useDeliveries, useProducts } from "@/hooks/useData";
import type { Invoice, PaymentStatus, Customer, Product } from "@shared/types";
import logoImage from "@assets/awadh_dairy_bg_logo_1769831028374.png";

interface InvoiceWithCustomer extends Invoice {
  customerName: string;
  customerPhone?: string;
  customerAddress?: string;
}

interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
  type: 'delivery' | 'addon' | 'adjustment' | 'previous_due';
}

const COMPANY_INFO = {
  name: "AWADH DAIRY",
  tagline: "Premium Quality Dairy Products",
  email: "contact@awadhdairy.com",
  phone: "9451574464",
  address: "Barabanki, U.P. India",
  upi_id: "awadhdairy@upi",
  gstin: "09XXXXX1234X1ZX",
};

const DEMO_DELIVERY_ITEMS = [
  { delivery_id: '1', product_id: '1', product_name: 'Fresh Cow Milk', quantity: 5, unit_price: 60 },
  { delivery_id: '1', product_id: '3', product_name: 'Fresh Curd', quantity: 1, unit_price: 80 },
  { delivery_id: '2', product_id: '1', product_name: 'Fresh Cow Milk', quantity: 3, unit_price: 60 },
  { delivery_id: '3', product_id: '1', product_name: 'Fresh Cow Milk', quantity: 10, unit_price: 60 },
  { delivery_id: '3', product_id: '5', product_name: 'Fresh Paneer', quantity: 2, unit_price: 320 },
  { delivery_id: '4', product_id: '1', product_name: 'Fresh Cow Milk', quantity: 4, unit_price: 60 },
  { delivery_id: '5', product_id: '2', product_name: 'Pasteurized Milk', quantity: 8, unit_price: 65 },
];

export default function BillingPage() {
  const { data: invoicesData, isLoading: invoicesLoading } = useInvoices();
  const { data: customersData, isLoading: customersLoading } = useCustomers();
  const { data: deliveriesData } = useDeliveries();
  const { data: productsData } = useProducts();
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
    billing_period_start: format(startOfMonth(new Date()), "yyyy-MM-dd"),
    billing_period_end: format(endOfMonth(new Date()), "yyyy-MM-dd"),
    due_date: format(subDays(new Date(), -15), "yyyy-MM-dd"),
    tax_percentage: "5",
    discount_amount: "0",
    notes: "",
  });

  const [invoiceItems, setInvoiceItems] = useState<InvoiceLineItem[]>([]);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  const customers = customersData || [];
  const invoices = invoicesData || [];
  const deliveries = deliveriesData || [];
  const products = productsData || [];

  const selectedCustomer = useMemo(() => {
    return customers.find(c => c.id === formData.customer_id);
  }, [customers, formData.customer_id]);

  useEffect(() => {
    if (formData.customer_id && formData.billing_period_start && formData.billing_period_end) {
      const customerDeliveries = deliveries.filter(d => 
        d.customer_id === formData.customer_id &&
        d.delivery_date >= formData.billing_period_start &&
        d.delivery_date <= formData.billing_period_end &&
        (d.status === 'delivered' || d.status === 'partial')
      );

      const productTotals: Record<string, { product_name: string; quantity: number; unit_price: number; unit: string }> = {};

      customerDeliveries.forEach(delivery => {
        const deliveryItems = DEMO_DELIVERY_ITEMS.filter(item => item.delivery_id === delivery.id);
        deliveryItems.forEach(item => {
          const product = products.find(p => p.id === item.product_id);
          const key = item.product_id;
          if (!productTotals[key]) {
            productTotals[key] = {
              product_name: item.product_name,
              quantity: 0,
              unit_price: item.unit_price,
              unit: product?.unit || 'units'
            };
          }
          productTotals[key].quantity += item.quantity;
        });
      });

      const lineItems: InvoiceLineItem[] = Object.entries(productTotals).map(([productId, data], idx) => ({
        id: `delivery-${productId}-${idx}`,
        description: data.product_name,
        quantity: data.quantity,
        unit: data.unit,
        rate: data.unit_price,
        amount: data.quantity * data.unit_price,
        type: 'delivery' as const
      }));

      const customer = customers.find(c => c.id === formData.customer_id);
      if (customer && customer.credit_balance > 0) {
        lineItems.push({
          id: 'previous-due',
          description: 'Previous Balance Due',
          quantity: 1,
          unit: '',
          rate: customer.credit_balance,
          amount: customer.credit_balance,
          type: 'previous_due' as const
        });
      }

      setInvoiceItems(lineItems);
    } else {
      setInvoiceItems([]);
    }
  }, [formData.customer_id, formData.billing_period_start, formData.billing_period_end, deliveries, products, customers]);

  const invoiceTotals = useMemo(() => {
    const subtotal = invoiceItems.reduce((sum, item) => sum + item.amount, 0);
    const taxPercentage = parseFloat(formData.tax_percentage) || 0;
    const taxAmount = (subtotal * taxPercentage) / 100;
    const discountAmount = parseFloat(formData.discount_amount) || 0;
    const finalAmount = subtotal + taxAmount - discountAmount;
    return { subtotal, taxAmount, discountAmount, finalAmount };
  }, [invoiceItems, formData.tax_percentage, formData.discount_amount]);

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
        <span className="text-primary">₹{(item.paid_amount || 0).toLocaleString("en-IN")}</span>
      ),
    },
    {
      key: "payment_status",
      header: "Status",
      render: (item) => <StatusBadge status={item.payment_status} type="payment" />,
    },
  ];

  const actions: Action<InvoiceWithCustomer>[] = [
    {
      label: "View",
      icon: Eye,
      onClick: (item) => {
        setSelectedInvoice(item);
        setIsViewDialogOpen(true);
      },
    },
    {
      label: "Download",
      icon: Download,
      onClick: (item) => handleDownloadPDF(item),
    },
    {
      label: "Record Payment",
      icon: CreditCard,
      onClick: (item) => {
        setSelectedInvoice(item);
        setPaymentAmount("");
        setIsPaymentDialogOpen(true);
      },
    },
  ];

  const handleAddItem = () => {
    const newItem: InvoiceLineItem = {
      id: `addon-${Date.now()}`,
      description: '',
      quantity: 1,
      unit: 'units',
      rate: 0,
      amount: 0,
      type: 'addon'
    };
    setInvoiceItems([...invoiceItems, newItem]);
    setEditingItemId(newItem.id);
  };

  const handleUpdateItem = (id: string, updates: Partial<InvoiceLineItem>) => {
    setInvoiceItems(items => items.map(item => {
      if (item.id === id) {
        const updated = { ...item, ...updates };
        updated.amount = updated.quantity * updated.rate;
        return updated;
      }
      return item;
    }));
  };

  const handleRemoveItem = (id: string) => {
    setInvoiceItems(items => items.filter(item => item.id !== id));
  };

  const resetForm = () => {
    setFormData({
      customer_id: "",
      billing_period_start: format(startOfMonth(new Date()), "yyyy-MM-dd"),
      billing_period_end: format(endOfMonth(new Date()), "yyyy-MM-dd"),
      due_date: format(subDays(new Date(), -15), "yyyy-MM-dd"),
      tax_percentage: "5",
      discount_amount: "0",
      notes: "",
    });
    setInvoiceItems([]);
    setEditingItemId(null);
  };

  const handleGenerateInvoice = () => {
    if (!formData.customer_id) {
      toast({
        title: "Validation Error",
        description: "Please select a customer",
        variant: "destructive",
      });
      return;
    }

    if (invoiceItems.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please add at least one invoice item",
        variant: "destructive",
      });
      return;
    }

    const invoiceNumber = `AWD-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(3, '0')}`;
    
    const newInvoice: Omit<Invoice, 'id'> = {
      invoice_number: invoiceNumber,
      customer_id: formData.customer_id,
      billing_period_start: formData.billing_period_start,
      billing_period_end: formData.billing_period_end,
      due_date: formData.due_date,
      total_amount: invoiceTotals.subtotal,
      tax_amount: invoiceTotals.taxAmount,
      discount_amount: invoiceTotals.discountAmount,
      final_amount: invoiceTotals.finalAmount,
      paid_amount: 0,
      payment_status: 'pending' as PaymentStatus,
      notes: formData.notes,
      created_at: new Date().toISOString(),
    };

    addInvoiceMutation.mutate(newInvoice as Invoice, {
      onSuccess: () => {
        toast({
          title: "Invoice Generated",
          description: `Invoice ${invoiceNumber} created successfully`,
        });
        setIsDialogOpen(false);
        resetForm();
      },
    });
  };

  const handleRecordPayment = () => {
    if (!selectedInvoice || !paymentAmount) {
      toast({
        title: "Validation Error",
        description: "Please enter payment amount",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(paymentAmount);
    const newPaidAmount = (selectedInvoice.paid_amount || 0) + amount;
    const remaining = (selectedInvoice.final_amount || 0) - newPaidAmount;

    let newStatus: PaymentStatus = 'partial';
    if (remaining <= 0) newStatus = 'paid';
    else if (remaining === selectedInvoice.final_amount) newStatus = 'pending';

    updateInvoiceMutation.mutate({
      id: selectedInvoice.id,
      paid_amount: newPaidAmount,
      payment_status: newStatus,
      payment_date: new Date().toISOString(),
    }, {
      onSuccess: () => {
        toast({
          title: "Payment Recorded",
          description: `₹${amount.toLocaleString("en-IN")} payment recorded successfully`,
        });
        setIsPaymentDialogOpen(false);
        setPaymentAmount("");
        setPaymentNotes("");
      },
    });
  };

  const generateUPILink = (amount: number, invoiceNumber: string) => {
    const upiParams = new URLSearchParams({
      pa: COMPANY_INFO.upi_id,
      pn: COMPANY_INFO.name,
      am: amount.toString(),
      cu: 'INR',
      tn: `Payment for ${invoiceNumber}`,
    });
    return `upi://pay?${upiParams.toString()}`;
  };

  const handleDownloadPDF = (invoice: InvoiceWithCustomer) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    doc.setFillColor(34, 139, 34);
    doc.rect(0, 0, pageWidth, 45, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text(COMPANY_INFO.name, pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(COMPANY_INFO.tagline, pageWidth / 2, 28, { align: 'center' });
    doc.text(`${COMPANY_INFO.email} | ${COMPANY_INFO.phone}`, pageWidth / 2, 35, { align: 'center' });
    doc.text(COMPANY_INFO.address, pageWidth / 2, 42, { align: 'center' });
    
    doc.setTextColor(200, 200, 200);
    doc.setFontSize(60);
    doc.setFont('helvetica', 'bold');
    doc.text('AWADH DAIRY', pageWidth / 2, 150, { align: 'center', angle: 45 });
    
    doc.setTextColor(34, 139, 34);
    doc.setFontSize(18);
    doc.text('TAX INVOICE', pageWidth / 2, 60, { align: 'center' });
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Invoice Number:', 14, 75);
    doc.setFont('helvetica', 'normal');
    doc.text(invoice.invoice_number, 50, 75);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Date:', 14, 82);
    doc.setFont('helvetica', 'normal');
    doc.text(format(new Date(invoice.created_at), "dd MMM yyyy"), 50, 82);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Due Date:', 14, 89);
    doc.setFont('helvetica', 'normal');
    doc.text(invoice.due_date ? format(new Date(invoice.due_date), "dd MMM yyyy") : "N/A", 50, 89);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Bill To:', 120, 75);
    doc.setFont('helvetica', 'normal');
    doc.text(invoice.customerName, 120, 82);
    doc.text(invoice.customerPhone || '', 120, 89);
    doc.text(invoice.customerAddress || '', 120, 96);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Billing Period:', 14, 96);
    doc.setFont('helvetica', 'normal');
    doc.text(`${format(new Date(invoice.billing_period_start), "dd MMM yyyy")} - ${format(new Date(invoice.billing_period_end), "dd MMM yyyy")}`, 50, 96);
    
    autoTable(doc, {
      startY: 110,
      head: [['Description', 'Qty', 'Rate (₹)', 'Amount (₹)']],
      body: [
        ['Total Amount', '', '', (invoice.total_amount || 0).toLocaleString("en-IN")],
        ['Tax Amount', '', '', (invoice.tax_amount || 0).toLocaleString("en-IN")],
        ['Discount', '', '', `-${(invoice.discount_amount || 0).toLocaleString("en-IN")}`],
      ],
      foot: [
        ['Final Amount', '', '', `₹${(invoice.final_amount || 0).toLocaleString("en-IN")}`],
        ['Amount Paid', '', '', `₹${(invoice.paid_amount || 0).toLocaleString("en-IN")}`],
        ['Balance Due', '', '', `₹${((invoice.final_amount || 0) - (invoice.paid_amount || 0)).toLocaleString("en-IN")}`],
      ],
      headStyles: { fillColor: [34, 139, 34], textColor: 255 },
      footStyles: { fillColor: [240, 240, 240], textColor: 0, fontStyle: 'bold' },
      theme: 'grid',
    });
    
    const finalY = (doc as any).lastAutoTable.finalY || 180;
    
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(14, finalY + 10, 80, 35, 3, 3, 'F');
    doc.setTextColor(34, 139, 34);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Pay via UPI', 20, finalY + 20);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.text(COMPANY_INFO.upi_id, 20, finalY + 28);
    doc.setFontSize(8);
    doc.text('Scan or click UPI link in digital invoice', 20, finalY + 36);
    
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(9);
    doc.text('Thank you for your business!', pageWidth / 2, finalY + 55, { align: 'center' });
    doc.text('For queries, contact us at ' + COMPANY_INFO.email, pageWidth / 2, finalY + 62, { align: 'center' });
    
    doc.save(`Invoice_${invoice.invoice_number}.pdf`);
    
    toast({
      title: "PDF Downloaded",
      description: `Invoice ${invoice.invoice_number} downloaded successfully`,
    });
  };

  const handlePrint = (invoice: InvoiceWithCustomer) => {
    const balanceDue = (invoice.final_amount || 0) - (invoice.paid_amount || 0);
    const upiLink = generateUPILink(balanceDue, invoice.invoice_number);
    
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
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Outfit', Arial, sans-serif; padding: 20px; color: #333; background: #fff; position: relative; }
          .watermark { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); font-size: 80px; font-weight: bold; color: rgba(34, 139, 34, 0.06); z-index: 0; pointer-events: none; white-space: nowrap; }
          .content { position: relative; z-index: 1; }
          .header { background: linear-gradient(135deg, #228B22 0%, #2E8B57 100%); padding: 25px; border-radius: 12px; color: white; margin-bottom: 25px; display: flex; align-items: center; gap: 20px; }
          .logo { width: 80px; height: 80px; background: white; border-radius: 10px; padding: 5px; display: flex; align-items: center; justify-content: center; }
          .logo img { max-width: 100%; max-height: 100%; object-fit: contain; }
          .company-info { flex: 1; }
          .company-name { font-size: 28px; font-weight: 700; letter-spacing: 1px; }
          .company-tagline { font-size: 12px; opacity: 0.9; margin-top: 5px; }
          .company-contact { font-size: 11px; margin-top: 10px; opacity: 0.85; }
          .invoice-title { text-align: center; padding: 15px; background: #f8f9fa; border-radius: 8px; margin-bottom: 20px; }
          .invoice-title h2 { color: #228B22; font-size: 22px; font-weight: 600; }
          .invoice-title span { color: #666; font-size: 12px; }
          .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px; }
          .detail-box { padding: 15px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #228B22; }
          .detail-label { font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px; }
          .detail-value { font-weight: 500; color: #333; }
          .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          .items-table th { background: #228B22; color: white; padding: 12px 15px; text-align: left; font-weight: 500; font-size: 13px; }
          .items-table th:last-child { text-align: right; }
          .items-table td { padding: 12px 15px; border-bottom: 1px solid #eee; font-size: 13px; }
          .items-table td:last-child { text-align: right; font-weight: 500; }
          .items-table tr:nth-child(even) { background: #f8f9fa; }
          .totals-section { background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 20px; border-radius: 8px; margin-bottom: 20px; }
          .total-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; }
          .total-row.final { border-top: 2px solid #228B22; padding-top: 12px; margin-top: 8px; font-size: 18px; font-weight: 700; color: #228B22; }
          .total-row.due { color: #dc3545; font-weight: 600; }
          .payment-section { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
          .upi-box { padding: 20px; background: linear-gradient(135deg, #228B22 0%, #2E8B57 100%); border-radius: 10px; color: white; }
          .upi-box h4 { font-size: 14px; margin-bottom: 10px; display: flex; align-items: center; gap: 8px; }
          .upi-id { background: rgba(255,255,255,0.2); padding: 10px 15px; border-radius: 6px; font-family: monospace; font-size: 14px; }
          .upi-link { display: inline-block; margin-top: 10px; padding: 8px 16px; background: white; color: #228B22; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 13px; }
          .bank-box { padding: 20px; background: #f8f9fa; border-radius: 10px; border: 1px solid #ddd; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; border-top: 1px solid #eee; }
          @media print { body { padding: 10px; } .header { -webkit-print-color-adjust: exact; print-color-adjust: exact; } .watermark { color: rgba(34, 139, 34, 0.04); } }
        </style>
      </head>
      <body>
        <div class="watermark">AWADH DAIRY</div>
        <div class="content">
          <div class="header">
            <div class="logo">
              <img src="${logoImage}" alt="Awadh Dairy Logo" />
            </div>
            <div class="company-info">
              <div class="company-name">AWADH DAIRY</div>
              <div class="company-tagline">Premium Quality Dairy Products</div>
              <div class="company-contact">
                📧 ${COMPANY_INFO.email} | 📞 ${COMPANY_INFO.phone} | 📍 ${COMPANY_INFO.address}
              </div>
            </div>
          </div>
          
          <div class="invoice-title">
            <h2>TAX INVOICE</h2>
            <span>${invoice.invoice_number}</span>
          </div>
          
          <div class="details-grid">
            <div class="detail-box">
              <div class="detail-label">Bill To</div>
              <div class="detail-value" style="font-size: 16px; font-weight: 600;">${invoice.customerName}</div>
              <div class="detail-value">${invoice.customerPhone || ''}</div>
              <div class="detail-value" style="color: #666;">${invoice.customerAddress || ''}</div>
            </div>
            <div class="detail-box">
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <div>
                  <div class="detail-label">Invoice Date</div>
                  <div class="detail-value">${format(new Date(invoice.created_at), "dd MMM yyyy")}</div>
                </div>
                <div>
                  <div class="detail-label">Due Date</div>
                  <div class="detail-value">${invoice.due_date ? format(new Date(invoice.due_date), "dd MMM yyyy") : 'N/A'}</div>
                </div>
                <div style="grid-column: span 2;">
                  <div class="detail-label">Billing Period</div>
                  <div class="detail-value">${format(new Date(invoice.billing_period_start), "dd MMM yyyy")} - ${format(new Date(invoice.billing_period_end), "dd MMM yyyy")}</div>
                </div>
              </div>
            </div>
          </div>
          
          <table class="items-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Qty</th>
                <th>Rate (₹)</th>
                <th>Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Dairy Products & Deliveries</td>
                <td>-</td>
                <td>-</td>
                <td>${(invoice.total_amount || 0).toLocaleString("en-IN")}</td>
              </tr>
            </tbody>
          </table>
          
          <div class="totals-section">
            <div class="total-row">
              <span>Subtotal</span>
              <span>₹${(invoice.total_amount || 0).toLocaleString("en-IN")}</span>
            </div>
            <div class="total-row">
              <span>Tax</span>
              <span>₹${(invoice.tax_amount || 0).toLocaleString("en-IN")}</span>
            </div>
            <div class="total-row">
              <span>Discount</span>
              <span style="color: #dc3545;">-₹${(invoice.discount_amount || 0).toLocaleString("en-IN")}</span>
            </div>
            <div class="total-row final">
              <span>Total Amount</span>
              <span>₹${(invoice.final_amount || 0).toLocaleString("en-IN")}</span>
            </div>
            <div class="total-row">
              <span>Amount Paid</span>
              <span style="color: #228B22;">₹${(invoice.paid_amount || 0).toLocaleString("en-IN")}</span>
            </div>
            <div class="total-row due">
              <span>Balance Due</span>
              <span>₹${balanceDue.toLocaleString("en-IN")}</span>
            </div>
          </div>
          
          <div class="payment-section">
            <div class="upi-box">
              <h4>💳 Pay via UPI</h4>
              <div class="upi-id">${COMPANY_INFO.upi_id}</div>
              <a href="${upiLink}" class="upi-link">Pay ₹${balanceDue.toLocaleString("en-IN")} Now</a>
            </div>
            <div class="bank-box">
              <h4 style="color: #228B22; margin-bottom: 10px;">📋 Payment Terms</h4>
              <p style="font-size: 12px; color: #666; line-height: 1.6;">
                • Payment due within 15 days<br>
                • For queries contact ${COMPANY_INFO.phone}<br>
                • Email: ${COMPANY_INFO.email}
              </p>
            </div>
          </div>
          
          <div class="footer">
            <p><strong>Thank you for your business!</strong></p>
            <p style="margin-top: 5px;">AWADH DAIRY - Your Trusted Dairy Partner</p>
          </div>
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
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <PageHeader
        title="Billing"
        description="Generate invoices"
        action={{
          label: "New Invoice",
          onClick: () => setIsDialogOpen(true),
        }}
      >
        <Button variant="outline" size="sm" onClick={handleExportAll} data-testid="button-export-all" className="hidden md:flex">
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Export All
        </Button>
      </PageHeader>

      {/* Stats Cards - Modern gradient cards */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4"
      >
        <Card className="gradient-card-green overflow-visible stagger-1">
          <CardContent className="p-3 md:p-4">
            <p className="text-xs md:text-sm text-muted-foreground">Total Billed</p>
            <p className="text-lg md:text-2xl font-bold text-green-600 dark:text-green-400">
              <span className="md:hidden">₹{stats.total >= 1000 ? `${(stats.total / 1000).toFixed(1)}K` : stats.total.toLocaleString("en-IN")}</span>
              <span className="hidden md:inline">₹{stats.total.toLocaleString("en-IN")}</span>
            </p>
          </CardContent>
        </Card>
        <Card className="gradient-card-blue overflow-visible stagger-2">
          <CardContent className="p-3 md:p-4">
            <p className="text-xs md:text-sm text-muted-foreground">Collected</p>
            <p className="text-lg md:text-2xl font-bold text-blue-600 dark:text-blue-400">
              <span className="md:hidden">₹{stats.collected >= 1000 ? `${(stats.collected / 1000).toFixed(1)}K` : stats.collected.toLocaleString("en-IN")}</span>
              <span className="hidden md:inline">₹{stats.collected.toLocaleString("en-IN")}</span>
            </p>
          </CardContent>
        </Card>
        <Card className="gradient-card-amber overflow-visible stagger-3">
          <CardContent className="p-3 md:p-4">
            <p className="text-xs md:text-sm text-muted-foreground">Pending</p>
            <p className="text-lg md:text-2xl font-bold text-amber-600 dark:text-amber-400">
              <span className="md:hidden">₹{stats.pending >= 1000 ? `${(stats.pending / 1000).toFixed(1)}K` : stats.pending.toLocaleString("en-IN")}</span>
              <span className="hidden md:inline">₹{stats.pending.toLocaleString("en-IN")}</span>
            </p>
          </CardContent>
        </Card>
        <Card className="gradient-card-red overflow-visible stagger-4">
          <CardContent className="p-3 md:p-4">
            <p className="text-xs md:text-sm text-muted-foreground">Overdue</p>
            <p className="text-lg md:text-2xl font-bold text-red-600 dark:text-red-400">
              <span className="md:hidden">₹{stats.overdue >= 1000 ? `${(stats.overdue / 1000).toFixed(1)}K` : stats.overdue.toLocaleString("en-IN")}</span>
              <span className="hidden md:inline">₹{stats.overdue.toLocaleString("en-IN")}</span>
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filter - Mobile optimized */}
      <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:gap-4">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-[180px]" data-testid="select-invoice-status">
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
        <div className="flex items-center justify-between">
          <span className="text-xs md:text-sm text-muted-foreground">
            {filteredInvoices.length} of {invoicesWithCustomer.length} invoices
          </span>
          <Button variant="outline" size="sm" onClick={handleExportAll} className="md:hidden">
            <FileSpreadsheet className="h-4 w-4" />
          </Button>
        </div>
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
          searchKey="customerName"
          searchPlaceholder="Search invoices..."
          emptyMessage="No invoices found"
        />
      </motion.div>

      {/* Generate Invoice Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <img src={logoImage} alt="Awadh Dairy" className="h-10 w-10 object-contain" />
              <div>
                <span>Generate Invoice</span>
                <p className="text-sm font-normal text-muted-foreground">Auto-fetch deliveries and create professional invoices</p>
              </div>
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-6 py-4">
              {/* Customer & Period Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Customer *</Label>
                  <Select value={formData.customer_id} onValueChange={(v) => setFormData({ ...formData, customer_id: v })}>
                    <SelectTrigger data-testid="select-customer">
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.name} - {c.phone}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label>Period Start</Label>
                    <Input type="date" value={formData.billing_period_start} onChange={(e) => setFormData({ ...formData, billing_period_start: e.target.value })} data-testid="input-period-start" />
                  </div>
                  <div className="space-y-2">
                    <Label>Period End</Label>
                    <Input type="date" value={formData.billing_period_end} onChange={(e) => setFormData({ ...formData, billing_period_end: e.target.value })} data-testid="input-period-end" />
                  </div>
                </div>
              </div>

              {selectedCustomer && (
                <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-primary">{selectedCustomer.name}</p>
                      <p className="text-sm text-muted-foreground">{selectedCustomer.address}</p>
                    </div>
                    {selectedCustomer.credit_balance > 0 && (
                      <Badge variant="destructive">Previous Due: ₹{selectedCustomer.credit_balance.toLocaleString("en-IN")}</Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Invoice Items */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Invoice Items</Label>
                  <Button size="sm" variant="outline" onClick={handleAddItem} data-testid="button-add-item">
                    <Plus className="h-4 w-4 mr-1" /> Add Item
                  </Button>
                </div>

                {invoiceItems.length > 0 ? (
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-primary text-primary-foreground">
                        <tr>
                          <th className="text-left p-3 text-sm font-medium">Description</th>
                          <th className="text-center p-3 text-sm font-medium w-20">Qty</th>
                          <th className="text-center p-3 text-sm font-medium w-24">Rate (₹)</th>
                          <th className="text-right p-3 text-sm font-medium w-28">Amount (₹)</th>
                          <th className="p-3 w-10"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoiceItems.map((item, idx) => (
                          <tr key={item.id} className={idx % 2 === 0 ? 'bg-muted/30' : ''}>
                            <td className="p-2">
                              {editingItemId === item.id ? (
                                <Input 
                                  value={item.description} 
                                  onChange={(e) => handleUpdateItem(item.id, { description: e.target.value })}
                                  className="h-8"
                                />
                              ) : (
                                <div className="flex items-center gap-2">
                                  <Badge variant={item.type === 'delivery' ? 'default' : item.type === 'previous_due' ? 'destructive' : 'secondary'} className="text-xs">
                                    {item.type === 'delivery' ? '📦' : item.type === 'previous_due' ? '⚠️' : '➕'}
                                  </Badge>
                                  <span className="text-sm">{item.description}</span>
                                </div>
                              )}
                            </td>
                            <td className="p-2 text-center">
                              {editingItemId === item.id ? (
                                <Input 
                                  type="number" 
                                  value={item.quantity} 
                                  onChange={(e) => handleUpdateItem(item.id, { quantity: parseFloat(e.target.value) || 0 })}
                                  className="h-8 text-center w-16"
                                />
                              ) : (
                                <span className="text-sm">{item.quantity} {item.unit}</span>
                              )}
                            </td>
                            <td className="p-2 text-center">
                              {editingItemId === item.id ? (
                                <Input 
                                  type="number" 
                                  value={item.rate} 
                                  onChange={(e) => handleUpdateItem(item.id, { rate: parseFloat(e.target.value) || 0 })}
                                  className="h-8 text-center w-20"
                                />
                              ) : (
                                <span className="text-sm">₹{item.rate.toLocaleString("en-IN")}</span>
                              )}
                            </td>
                            <td className="p-2 text-right font-medium text-sm">₹{item.amount.toLocaleString("en-IN")}</td>
                            <td className="p-2">
                              <div className="flex gap-1">
                                {editingItemId === item.id ? (
                                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditingItemId(null)}>
                                    <Check className="h-3 w-3" />
                                  </Button>
                                ) : (
                                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditingItemId(item.id)}>
                                    <Edit2 className="h-3 w-3" />
                                  </Button>
                                )}
                                <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => handleRemoveItem(item.id)}>
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-8 border border-dashed rounded-lg text-center text-muted-foreground">
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Select a customer and billing period to auto-fetch deliveries</p>
                    <p className="text-xs mt-1">Or click "Add Item" to manually add invoice items</p>
                  </div>
                )}
              </div>

              {/* Tax, Discount, Due Date */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Tax (%)</Label>
                  <Input type="number" value={formData.tax_percentage} onChange={(e) => setFormData({ ...formData, tax_percentage: e.target.value })} data-testid="input-tax" />
                </div>
                <div className="space-y-2">
                  <Label>Discount (₹)</Label>
                  <Input type="number" value={formData.discount_amount} onChange={(e) => setFormData({ ...formData, discount_amount: e.target.value })} data-testid="input-discount" />
                </div>
                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Input type="date" value={formData.due_date} onChange={(e) => setFormData({ ...formData, due_date: e.target.value })} data-testid="input-due-date" />
                </div>
              </div>

              {/* Totals Section */}
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4 rounded-lg border border-primary/20">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>₹{invoiceTotals.subtotal.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax ({formData.tax_percentage}%)</span>
                    <span>₹{invoiceTotals.taxAmount.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Discount</span>
                    <span className="text-destructive">-₹{invoiceTotals.discountAmount.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="border-t border-primary/30 pt-2 mt-2">
                    <div className="flex justify-between text-lg font-bold text-primary">
                      <span>Total Amount</span>
                      <span>₹{invoiceTotals.finalAmount.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea placeholder="Additional notes..." value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} data-testid="input-notes" />
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="border-t pt-4">
            <Button variant="outline" onClick={() => { setIsDialogOpen(false); resetForm(); }}>Cancel</Button>
            <Button onClick={handleGenerateInvoice} disabled={addInvoiceMutation.isPending} data-testid="button-generate-invoice">
              {addInvoiceMutation.isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating...</> : <>Generate Invoice</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
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
              <Label>Payment Amount (₹) *</Label>
              <Input type="number" placeholder="Enter amount" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} data-testid="input-payment-amount" />
            </div>

            <div className="space-y-2">
              <Label>Payment Mode</Label>
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
              <Label>Notes</Label>
              <Textarea placeholder="Optional payment notes..." value={paymentNotes} onChange={(e) => setPaymentNotes(e.target.value)} data-testid="input-payment-notes" />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleRecordPayment} disabled={updateInvoiceMutation.isPending} data-testid="button-record-payment">
              {updateInvoiceMutation.isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Recording...</> : <>Record Payment</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Invoice Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="pb-0">
            <DialogTitle className="flex items-center gap-3">
              <img src={logoImage} alt="Awadh Dairy" className="h-10 w-10 object-contain" />
              Invoice Details
            </DialogTitle>
          </DialogHeader>

          {selectedInvoice && (
            <ScrollArea className="flex-1">
              <div className="space-y-6 p-4 relative">
                {/* Watermark */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] z-0">
                  <img src={logoImage} alt="" className="w-64 h-64 object-contain" />
                </div>

                {/* Invoice Header */}
                <div className="bg-gradient-to-r from-primary to-primary/80 p-6 rounded-xl text-primary-foreground relative z-10">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-white p-2 rounded-lg">
                        <img src={logoImage} alt="Awadh Dairy" className="h-14 w-14 object-contain" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">{COMPANY_INFO.name}</h2>
                        <p className="text-sm opacity-90">{COMPANY_INFO.tagline}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs opacity-80">
                          <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {COMPANY_INFO.email}</span>
                          <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {COMPANY_INFO.phone}</span>
                        </div>
                        <p className="text-xs opacity-80 mt-1 flex items-center gap-1"><MapPin className="h-3 w-3" /> {COMPANY_INFO.address}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary" className="text-lg px-3 py-1">TAX INVOICE</Badge>
                      <p className="font-mono text-lg mt-2">{selectedInvoice.invoice_number}</p>
                    </div>
                  </div>
                </div>

                {/* Customer & Invoice Info */}
                <div className="grid grid-cols-2 gap-6 relative z-10">
                  <div className="p-4 bg-muted/50 rounded-lg border-l-4 border-primary">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Bill To</p>
                    <p className="font-semibold text-lg">{selectedInvoice.customerName}</p>
                    <p className="text-sm">{selectedInvoice.customerPhone}</p>
                    <p className="text-sm text-muted-foreground">{selectedInvoice.customerAddress}</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Invoice Date</p>
                        <p className="font-medium">{format(new Date(selectedInvoice.created_at), "dd MMM yyyy")}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Due Date</p>
                        <p className="font-medium">{selectedInvoice.due_date ? format(new Date(selectedInvoice.due_date), "dd MMM yyyy") : "N/A"}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs text-muted-foreground">Billing Period</p>
                        <p className="font-medium">{format(new Date(selectedInvoice.billing_period_start), "dd MMM yyyy")} - {format(new Date(selectedInvoice.billing_period_end), "dd MMM yyyy")}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs text-muted-foreground">Status</p>
                        <StatusBadge status={selectedInvoice.payment_status} type="payment" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Amount Breakdown */}
                <div className="border rounded-xl overflow-hidden relative z-10">
                  <div className="bg-primary/5 p-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>₹{(selectedInvoice.total_amount || 0).toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tax</span>
                      <span>₹{(selectedInvoice.tax_amount || 0).toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Discount</span>
                      <span className="text-destructive">-₹{(selectedInvoice.discount_amount || 0).toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                  <div className="bg-primary text-primary-foreground p-4">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total Amount</span>
                      <span>₹{(selectedInvoice.final_amount || 0).toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                  <div className="p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Amount Paid</span>
                      <span className="text-primary font-medium">₹{(selectedInvoice.paid_amount || 0).toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg">
                      <span>Balance Due</span>
                      <span className={((selectedInvoice.final_amount || 0) - (selectedInvoice.paid_amount || 0)) > 0 ? "text-destructive" : "text-primary"}>
                        ₹{((selectedInvoice.final_amount || 0) - (selectedInvoice.paid_amount || 0)).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* UPI Payment Section */}
                {((selectedInvoice.final_amount || 0) - (selectedInvoice.paid_amount || 0)) > 0 && (
                  <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-5 rounded-xl border border-primary/20 relative z-10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary text-primary-foreground p-2 rounded-lg">
                          <Smartphone className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-semibold">Pay via UPI</p>
                          <p className="text-sm text-muted-foreground font-mono">{COMPANY_INFO.upi_id}</p>
                        </div>
                      </div>
                      <a 
                        href={generateUPILink((selectedInvoice.final_amount || 0) - (selectedInvoice.paid_amount || 0), selectedInvoice.invoice_number)}
                        className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                        data-testid="link-pay-upi"
                      >
                        <QrCode className="h-4 w-4" />
                        Pay ₹{((selectedInvoice.final_amount || 0) - (selectedInvoice.paid_amount || 0)).toLocaleString("en-IN")}
                      </a>
                    </div>
                  </div>
                )}

                {selectedInvoice.notes && (
                  <div className="relative z-10">
                    <p className="text-sm text-muted-foreground">Notes</p>
                    <p className="text-sm mt-1">{selectedInvoice.notes}</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}

          <DialogFooter className="border-t pt-4 gap-2">
            <Button variant="outline" onClick={() => selectedInvoice && handleDownloadPDF(selectedInvoice)}>
              <Download className="h-4 w-4 mr-2" /> Download PDF
            </Button>
            <Button variant="outline" onClick={() => selectedInvoice && handlePrint(selectedInvoice)}>
              <Printer className="h-4 w-4 mr-2" /> Print
            </Button>
            <Button 
              onClick={() => { setIsViewDialogOpen(false); setIsPaymentDialogOpen(true); }}
              disabled={(selectedInvoice?.final_amount || 0) <= (selectedInvoice?.paid_amount || 0)}
            >
              <CreditCard className="h-4 w-4 mr-2" /> Record Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
