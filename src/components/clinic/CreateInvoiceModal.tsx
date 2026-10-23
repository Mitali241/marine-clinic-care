import { useState } from "react";
import {
  Building2,
  Calendar,
  CreditCard,
  FileCheck2,
  FilePlus2,
  FileText,
  Plus,
  Ship,
  Trash2,
  User,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  formatINR,
  type InvoiceItem,
  type InvoiceRecord,
  type PatientRecord,
} from "@/lib/clinic";

interface CreateInvoiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patients: PatientRecord[];
  nextInvoiceNum: number;
  onSave: (invoice: InvoiceRecord) => void;
}

const COMMON_SERVICES = [
  { description: "DG Shipping Comprehensive Medical Fitness Examination", sacCode: "999312", rate: 2500 },
  { description: "Digital Chest X-Ray (PA View with Radiologist Report)", sacCode: "999312", rate: 1200 },
  { description: "Whole Abdomen & Pelvis Ultrasonography (USG)", sacCode: "999312", rate: 2200 },
  { description: "Pathology Diagnostics (Complete Haemogram, Blood Sugar, LFT, KFT)", sacCode: "999312", rate: 1200 },
  { description: "Audiometry & Ishihara 38 Plates Color Vision Test", sacCode: "999312", rate: 800 },
  { description: "Cardiology Evaluation & 12-Lead Resting ECG", sacCode: "999312", rate: 2500 },
  { description: "Urine Routine & Drug / Alcohol Screening Panel", sacCode: "999312", rate: 900 },
];

export function CreateInvoiceModal({
  open,
  onOpenChange,
  patients,
  nextInvoiceNum,
  onSave,
}: CreateInvoiceModalProps) {
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [invoiceId, setInvoiceId] = useState<string>(`INV-2026-${String(nextInvoiceNum).padStart(3, "0")}`);
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState<string>(
    new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );
  const [candidateName, setCandidateName] = useState<string>("");
  const [rank, setRank] = useState<string>("Chief Officer");
  const [indosNo, setIndosNo] = useState<string>("");
  const [cdcNo, setCdcNo] = useState<string>("");
  const [certificateNo, setCertificateNo] = useState<string>("");
  const [company, setCompany] = useState<string>("Maersk Marine Services India Pvt Ltd");
  const [companyGstin, setCompanyGstin] = useState<string>("27AAACM0124P1Z4");
  const [companyAddress, setCompanyAddress] = useState<string>("Peninsula Business Park, Lower Parel, Mumbai");

  const [status, setStatus] = useState<"Paid" | "Pending" | "Overdue">("Paid");
  const [paymentMethod, setPaymentMethod] = useState<string>("UPI / Digital Transfer");
  const [transactionRef, setTransactionRef] = useState<string>(`TXN-${Math.floor(10000 + Math.random() * 90000)}`);
  const [notes, setNotes] = useState<string>("DG Shipping maritime examination fee receipt.");

  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: "1",
      description: "DG Shipping Comprehensive Medical Fitness Examination",
      sacCode: "999312",
      qty: 1,
      rate: 2500,
      amount: 2500,
    },
    {
      id: "2",
      description: "Digital Chest X-Ray (PA View with Radiologist Report)",
      sacCode: "999312",
      qty: 1,
      rate: 1200,
      amount: 1200,
    },
    {
      id: "3",
      description: "Pathology Diagnostics (Complete Haemogram & Glucose)",
      sacCode: "999312",
      qty: 1,
      rate: 800,
      amount: 800,
    },
  ]);

  const handlePatientSelect = (patientId: string) => {
    setSelectedPatientId(patientId);
    const found = patients.find((p) => p.id === patientId);
    if (found) {
      setCandidateName(found.name);
      setRank(found.rank || "Seafarer");
      setIndosNo(found.indosNo || "");
      setCdcNo(found.cdcNo || "");
      setCertificateNo(found.certificateNo || "");
      setCompany(found.companyName || "Maersk Marine Services");
      if (found.invoiceNo) {
        setInvoiceId(found.invoiceNo);
      }
    }
  };

  const handleAddItem = (presetIndex?: number) => {
    const preset = presetIndex !== undefined ? COMMON_SERVICES[presetIndex] : COMMON_SERVICES[0];
    const newItem: InvoiceItem = {
      id: String(Date.now()),
      description: preset.description,
      sacCode: preset.sacCode,
      qty: 1,
      rate: preset.rate,
      amount: preset.rate,
    };
    setItems((prev) => [...prev, newItem]);
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, val: string | number) => {
    setItems((prev) => {
      const copy = [...prev];
      const target = { ...copy[index] };
      if (field === "rate" || field === "qty") {
        const numVal = Number(val) || 0;
        target[field] = numVal as never;
        target.amount = target.qty * target.rate;
      } else {
        target[field] = val as never;
      }
      copy[index] = target;
      return copy;
    });
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const total = subtotal;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateName.trim() || !company.trim()) return;

    const formattedDate = new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const formattedDue = new Date(dueDate).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    const newInvoice: InvoiceRecord = {
      id: invoiceId.trim() || `INV-2026-${String(nextInvoiceNum).padStart(3, "0")}`,
      date: formattedDate,
      dueDate: formattedDue,
      patient: candidateName.trim(),
      patientId: selectedPatientId || undefined,
      rank,
      indosNo: indosNo.toUpperCase().trim(),
      cdcNo: cdcNo.toUpperCase().trim(),
      certificateNo: certificateNo.toUpperCase().trim(),
      company: company.trim(),
      companyGstin: companyGstin.trim() || "27AAACM0124P1Z4",
      companyAddress: companyAddress.trim() || "Mumbai Corporate Office",
      status,
      items,
      subtotal,
      tax: 0,
      discount: 0,
      total,
      amount: formatINR(total),
      paymentMethod,
      transactionRef,
      paidDate: status === "Paid" ? formattedDate : undefined,
      notes,
    };

    onSave(newInvoice);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] w-full max-w-3xl overflow-y-auto p-0 sm:rounded-xl">
        <DialogHeader className="border-b border-border bg-muted/40 p-5 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <FilePlus2 className="size-5" />
            </span>
            <div>
              <DialogTitle className="text-lg font-semibold tracking-tight">
                Create Standard Maritime Tax Invoice
              </DialogTitle>
              <DialogDescription className="mt-0.5 text-xs text-muted-foreground">
                Issue a compliant DG Shipping seafarer medical bill in Indian Rupees (INR)
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 text-xs">
          {/* Top Invoice Metadata */}
          <div className="rounded-lg border border-border/80 bg-card p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-border/60 pb-2">
              <span className="font-semibold text-foreground uppercase tracking-wider text-[11px]">
                Invoice Details & Candidate Selection
              </span>
              <span className="text-primary font-mono font-bold text-xs">{invoiceId}</span>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1.5">
                <label className="font-medium text-foreground">Select Candidate (Pre-fill)</label>
                <select
                  value={selectedPatientId}
                  onChange={(e) => handlePatientSelect(e.target.value)}
                  className="h-9 w-full rounded-md border border-input bg-background px-2.5 text-xs"
                >
                  <option value="">— Or enter custom details —</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.rank} · {p.companyName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-medium text-foreground">Invoice Number</label>
                <Input
                  value={invoiceId}
                  onChange={(e) => setInvoiceId(e.target.value)}
                  className="h-9 text-xs font-mono font-semibold uppercase"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-medium text-foreground">Invoice Date</label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="h-9 text-xs"
                  required
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 pt-1">
              <div className="space-y-1.5">
                <label className="font-medium text-foreground">
                  Candidate Name <span className="text-destructive">*</span>
                </label>
                <Input
                  placeholder="e.g. Captain Rajesh Kumar"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  className="h-9 text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-medium text-foreground">Rank / Designation</label>
                <Input
                  placeholder="e.g. Chief Officer"
                  value={rank}
                  onChange={(e) => setRank(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-medium text-foreground">Due Date</label>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 pt-1 font-mono">
              <div className="space-y-1.5">
                <label className="font-medium text-foreground font-sans">INDoS No.</label>
                <Input
                  placeholder="e.g. 12NL8492"
                  value={indosNo}
                  onChange={(e) => setIndosNo(e.target.value.toUpperCase())}
                  className="h-9 text-xs uppercase"
                />
              </div>
              <div className="space-y-1.5">
                <label className="font-medium text-foreground font-sans">CDC No.</label>
                <Input
                  placeholder="e.g. MUM 248910"
                  value={cdcNo}
                  onChange={(e) => setCdcNo(e.target.value.toUpperCase())}
                  className="h-9 text-xs uppercase"
                />
              </div>
              <div className="space-y-1.5">
                <label className="font-medium text-foreground font-sans">Certificate No.</label>
                <Input
                  placeholder="e.g. MC-2026-9041"
                  value={certificateNo}
                  onChange={(e) => setCertificateNo(e.target.value.toUpperCase())}
                  className="h-9 text-xs uppercase"
                />
              </div>
            </div>
          </div>

          {/* Company Billing Info */}
          <div className="rounded-lg border border-border/80 bg-card p-4 space-y-3">
            <span className="font-semibold text-foreground uppercase tracking-wider text-[11px] block border-b border-border/60 pb-2">
              Billed To (Shipping Company / Agency)
            </span>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="font-medium text-foreground">Company Name</label>
                <Input
                  placeholder="e.g. Maersk Marine Services India Pvt Ltd"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="h-9 text-xs"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="font-medium text-foreground">Company GSTIN</label>
                <Input
                  placeholder="27AAACM0124P1Z4"
                  value={companyGstin}
                  onChange={(e) => setCompanyGstin(e.target.value.toUpperCase())}
                  className="h-9 text-xs font-mono uppercase"
                />
              </div>
            </div>
          </div>

          {/* Itemized Services in INR */}
          <div className="rounded-lg border border-border/80 bg-card p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-2">
              <div>
                <span className="font-semibold text-foreground uppercase tracking-wider text-[11px]">
                  Clinical Examination & Laboratory Services
                </span>
                <span className="text-[10px] text-muted-foreground block">
                  All rates and subtotals calculated in INR (₹)
                </span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1 text-xs h-7"
                onClick={() => handleAddItem()}
              >
                <Plus className="size-3.5" /> Add Service Row
              </Button>
            </div>

            <div className="space-y-2">
              {items.map((item, idx) => (
                <div
                  key={item.id}
                  className="grid grid-cols-12 gap-2 items-center bg-muted/40 p-2 rounded-md border border-border/60"
                >
                  <div className="col-span-6 space-y-1">
                    <span className="text-[10px] text-muted-foreground">Description</span>
                    <Input
                      value={item.description}
                      onChange={(e) => handleItemChange(idx, "description", e.target.value)}
                      className="h-8 text-xs bg-background"
                      required
                    />
                  </div>

                  <div className="col-span-2 space-y-1">
                    <span className="text-[10px] text-muted-foreground font-mono">SAC Code</span>
                    <Input
                      value={item.sacCode}
                      onChange={(e) => handleItemChange(idx, "sacCode", e.target.value)}
                      className="h-8 text-xs font-mono bg-background text-center"
                    />
                  </div>

                  <div className="col-span-1 space-y-1">
                    <span className="text-[10px] text-muted-foreground">Qty</span>
                    <Input
                      type="number"
                      min="1"
                      value={item.qty}
                      onChange={(e) => handleItemChange(idx, "qty", e.target.value)}
                      className="h-8 text-xs bg-background text-center"
                    />
                  </div>

                  <div className="col-span-2 space-y-1">
                    <span className="text-[10px] text-muted-foreground">Rate (₹)</span>
                    <Input
                      type="number"
                      min="0"
                      step="50"
                      value={item.rate}
                      onChange={(e) => handleItemChange(idx, "rate", e.target.value)}
                      className="h-8 text-xs bg-background font-mono text-right"
                    />
                  </div>

                  <div className="col-span-1 flex items-end justify-center pt-3">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-7 text-muted-foreground hover:text-destructive"
                      onClick={() => handleRemoveItem(idx)}
                      disabled={items.length <= 1}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Presets */}
            <div className="pt-2 flex flex-wrap items-center gap-1.5 text-[11px]">
              <span className="text-muted-foreground">Quick Add:</span>
              <button
                type="button"
                onClick={() => handleAddItem(1)}
                className="rounded bg-muted px-2 py-0.5 text-primary hover:bg-primary/10 transition-colors"
              >
                + Digital X-Ray (₹1,200)
              </button>
              <button
                type="button"
                onClick={() => handleAddItem(2)}
                className="rounded bg-muted px-2 py-0.5 text-primary hover:bg-primary/10 transition-colors"
              >
                + USG Screening (₹2,200)
              </button>
              <button
                type="button"
                onClick={() => handleAddItem(5)}
                className="rounded bg-muted px-2 py-0.5 text-primary hover:bg-primary/10 transition-colors"
              >
                + Cardiology ECG (₹2,500)
              </button>
            </div>

            {/* Financial Summary */}
            <div className="pt-3 border-t border-border flex justify-between items-center bg-primary/5 p-3 rounded-lg">
              <div>
                <span className="text-[10px] uppercase font-bold text-primary block">
                  Taxable Subtotal (INR)
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Healthcare exemption applies (0% GST)
                </span>
              </div>
              <div className="text-right">
                <span className="text-base font-mono font-bold text-foreground">
                  {formatINR(total)}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Status & Settlement */}
          <div className="rounded-lg border border-border/80 bg-card p-4 space-y-3">
            <span className="font-semibold text-foreground uppercase tracking-wider text-[11px] block border-b border-border/60 pb-2">
              Payment Status & Transaction Particulars
            </span>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1.5">
                <label className="font-medium text-foreground">Payment Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as "Paid" | "Pending" | "Overdue")}
                  className="h-9 w-full rounded-md border border-input bg-background px-2.5 text-xs font-semibold"
                >
                  <option value="Paid">Paid (Settled)</option>
                  <option value="Pending">Pending (Awaiting payment)</option>
                  <option value="Overdue">Overdue (Payment delayed)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-medium text-foreground">Payment Mode</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="h-9 w-full rounded-md border border-input bg-background px-2.5 text-xs"
                >
                  <option value="UPI / Digital Transfer">UPI / Digital Transfer</option>
                  <option value="HDFC Bank IMPS">HDFC Bank IMPS</option>
                  <option value="NEFT / RTGS Corporate">NEFT / RTGS Corporate</option>
                  <option value="Cash Receipt">Cash Receipt</option>
                  <option value="Company Invoice Credit">Company Invoice Credit</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-medium text-foreground">Transaction / UTR Ref</label>
                <Input
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  className="h-9 text-xs font-mono"
                  placeholder="e.g. TXN-50941"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="border-t border-border pt-4 flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" className="gap-1.5">
              <FileCheck2 className="size-4" /> Generate & Save Invoice
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
