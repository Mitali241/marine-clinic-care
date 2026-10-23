import {
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  Download,
  FileCheck2,
  FileText,
  Mail,
  MapPin,
  Phone,
  Printer,
  QrCode,
  ShieldCheck,
  Ship,
  Sparkles,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { amountToWordsINR, formatINR, type InvoiceRecord } from "@/lib/clinic";

interface InvoiceDocumentProps {
  invoice: InvoiceRecord;
  onPrint?: () => void;
  onClose?: () => void;
}

export function InvoiceDocument({ invoice, onPrint, onClose }: InvoiceDocumentProps) {
  const isPaid = invoice.status === "Paid";
  const isOverdue = invoice.status === "Overdue";

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  return (
    <div className="invoice-container bg-background text-foreground max-w-4xl mx-auto">
      {/* Action Bar (hidden when printing) */}
      <div className="print:hidden mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <Badge
            variant={isPaid ? "default" : isOverdue ? "destructive" : "secondary"}
            className="text-xs font-semibold px-2.5 py-0.5"
          >
            {invoice.status.toUpperCase()}
          </Badge>
          <span className="text-xs text-muted-foreground font-mono">
            {invoice.id}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="gap-1.5 text-xs font-medium shadow-xs"
          >
            <Printer className="size-3.5" />
            Print / Save PDF
          </Button>
          {onClose && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-xs"
            >
              Close
            </Button>
          )}
        </div>
      </div>

      {/* Actual Printable Invoice Paper */}
      <div className="invoice-paper rounded-xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm print:border-0 print:shadow-none print:p-0">
        {/* Header with Clinic Letterhead */}
        <div className="border-b-2 border-primary/20 pb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="flex items-start gap-3.5">
              <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm print:border print:border-primary">
                <Ship className="size-7" />
              </span>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                  MARINE CLINIC CARE
                </h1>
                <p className="text-xs font-semibold text-primary uppercase tracking-wider mt-0.5">
                  DG Shipping Approved Maritime Medical Centre
                </p>
                <p className="text-[11px] text-muted-foreground mt-1 max-w-[340px] leading-relaxed">
                  402, Maritime Corporate Tower, Ballard Estate, Fort, Mumbai, Maharashtra 400001, India
                </p>
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground mt-1.5 font-mono">
                  <span>GSTIN: 27AABCM9124P1Z3</span>
                  <span>·</span>
                  <span>DG Approval No: DG-MED-MUM/2024/082</span>
                </div>
              </div>
            </div>

            <div className="sm:text-right mt-2 sm:mt-0">
              <div className="inline-block rounded-md bg-primary/10 px-3 py-1 text-xs font-bold text-primary uppercase tracking-widest border border-primary/20">
                TAX INVOICE
              </div>
              <p className="text-lg font-mono font-bold text-foreground mt-2">
                {invoice.id}
              </p>
              <div className="text-[11px] text-muted-foreground space-y-0.5 mt-1 font-mono">
                <div>
                  <span className="text-muted-foreground">Invoice Date:</span>{" "}
                  <strong className="text-foreground">{invoice.date}</strong>
                </div>
                <div>
                  <span className="text-muted-foreground">Due Date:</span>{" "}
                  <strong className="text-foreground">{invoice.dueDate}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Two-Column Party Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 py-5 border-b border-border/80 text-xs">
          {/* Column 1: Billed To (Company / Shipping Agency) */}
          <div className="rounded-lg bg-muted/40 p-4 border border-border/60">
            <div className="flex items-center gap-1.5 font-semibold text-primary uppercase tracking-wider text-[11px] mb-2">
              <Building2 className="size-3.5" />
              Billed To (Company / Agency)
            </div>
            <p className="text-sm font-bold text-foreground">
              {invoice.company}
            </p>
            {invoice.companyGstin && (
              <p className="text-[11px] font-mono text-muted-foreground mt-1">
                GSTIN: <span className="font-semibold text-foreground">{invoice.companyGstin}</span>
              </p>
            )}
            <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
              {invoice.companyAddress || "Shipping Agency & Manning Division, Fort, Mumbai"}
            </p>
            <div className="mt-3 flex items-center gap-1 text-[11px] font-medium text-foreground">
              <span>Place of Supply:</span>
              <span className="font-semibold">Maharashtra (27)</span>
            </div>
          </div>

          {/* Column 2: Candidate & Seafarer Credentials */}
          <div className="rounded-lg bg-muted/40 p-4 border border-border/60">
            <div className="flex items-center gap-1.5 font-semibold text-primary uppercase tracking-wider text-[11px] mb-2">
              <User className="size-3.5" />
              Candidate & Seafarer Particulars
            </div>
            <div className="flex justify-between items-start">
              <p className="text-sm font-bold text-foreground">
                {invoice.patient}
              </p>
              {invoice.rank && (
                <Badge variant="secondary" className="text-[10px] font-medium">
                  {invoice.rank}
                </Badge>
              )}
            </div>

            <div className="mt-2.5 grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div className="rounded bg-background/80 p-1.5 border border-border/40">
                <span className="text-muted-foreground text-[10px] block">INDoS No:</span>
                <span className="font-bold text-foreground">{invoice.indosNo || "—"}</span>
              </div>
              <div className="rounded bg-background/80 p-1.5 border border-border/40">
                <span className="text-muted-foreground text-[10px] block">CDC No:</span>
                <span className="font-bold text-foreground">{invoice.cdcNo || "—"}</span>
              </div>
              <div className="rounded bg-background/80 p-1.5 border border-border/40 col-span-2">
                <span className="text-muted-foreground text-[10px] block">Medical Certificate Reference:</span>
                <span className="font-bold text-foreground">{invoice.certificateNo || "MC-2026-9041"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Itemized Services Table */}
        <div className="py-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border/80 bg-muted/50 text-muted-foreground">
                  <th className="py-2.5 px-3 font-semibold w-12 text-center">#</th>
                  <th className="py-2.5 px-3 font-semibold">Service Description / Examination</th>
                  <th className="py-2.5 px-3 font-semibold font-mono text-center w-24">HSN / SAC</th>
                  <th className="py-2.5 px-3 font-semibold text-center w-16">Qty</th>
                  <th className="py-2.5 px-3 font-semibold text-right w-28">Rate (₹)</th>
                  <th className="py-2.5 px-3 font-semibold text-right w-28">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {invoice.items && invoice.items.length > 0 ? (
                  invoice.items.map((item, idx) => (
                    <tr key={item.id || idx} className="hover:bg-muted/20">
                      <td className="py-3 px-3 text-center font-mono text-muted-foreground">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-3">
                        <p className="font-medium text-foreground">{item.description}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          Conducted under DG Shipping / ILO MLC 2006 Standards
                        </p>
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-muted-foreground">
                        {item.sacCode || "999312"}
                      </td>
                      <td className="py-3 px-3 text-center font-medium">
                        {item.qty || 1}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-medium">
                        {formatINR(item.rate)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-semibold text-foreground">
                        {formatINR(item.amount)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="py-3 px-3 text-center font-mono text-muted-foreground">1</td>
                    <td className="py-3 px-3 font-medium text-foreground">
                      DG Shipping Comprehensive Maritime Medical Examination & Certification
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-muted-foreground">999312</td>
                    <td className="py-3 px-3 text-center font-medium">1</td>
                    <td className="py-3 px-3 text-right font-mono font-medium">{formatINR(invoice.subtotal)}</td>
                    <td className="py-3 px-3 text-right font-mono font-semibold text-foreground">{formatINR(invoice.total)}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Calculation Summary & Amount in Words */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 py-4 border-t border-border/80">
          <div className="md:col-span-7 space-y-3">
            {/* Amount in words */}
            <div className="rounded-lg bg-primary/5 p-3.5 border border-primary/20">
              <span className="text-[10px] font-semibold text-primary uppercase tracking-wider block">
                Total Amount in Words (INR):
              </span>
              <p className="text-xs font-semibold text-foreground mt-0.5 italic">
                {amountToWordsINR(invoice.total)}
              </p>
            </div>

            {/* Bank details & payment mode */}
            <div className="rounded-lg border border-border/80 p-3.5 text-xs bg-card">
              <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-border/60">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <CreditCard className="size-3.5 text-primary" />
                  Payment Particulars & Bank Details
                </span>
                <span className="text-[10px] font-mono text-muted-foreground">
                  Status: <strong className="text-foreground">{invoice.status}</strong>
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-muted-foreground">
                <div>Bank: <strong className="text-foreground">HDFC Bank Ltd</strong></div>
                <div>IFSC: <strong className="text-foreground">HDFC0001234</strong></div>
                <div>A/C Name: <strong className="text-foreground">Marine Clinic Care Pvt Ltd</strong></div>
                <div>A/C No: <strong className="text-foreground">50200084920192</strong></div>
              </div>
              <div className="mt-2.5 pt-2 border-t border-border/50 flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground">Payment Method:</span>
                <span className="font-semibold text-foreground">{invoice.paymentMethod || "UPI / Digital Transfer"}</span>
              </div>
              {invoice.transactionRef && (
                <div className="flex items-center justify-between text-[11px] mt-1 font-mono">
                  <span className="text-muted-foreground">UTR / Transaction Ref:</span>
                  <span className="font-bold text-foreground">{invoice.transactionRef}</span>
                </div>
              )}
            </div>
          </div>

          {/* Subtotal, GST & Grand Total */}
          <div className="md:col-span-5 flex flex-col justify-between">
            <div className="space-y-2 text-xs border border-border/80 rounded-lg p-4 bg-muted/30">
              <div className="flex justify-between py-1 text-muted-foreground">
                <span>Taxable Subtotal:</span>
                <span className="font-mono font-medium text-foreground">{formatINR(invoice.subtotal)}</span>
              </div>
              <div className="flex justify-between py-1 text-muted-foreground">
                <span>CGST (0% - Healthcare Exempt):</span>
                <span className="font-mono font-medium text-foreground">₹0.00</span>
              </div>
              <div className="flex justify-between py-1 text-muted-foreground">
                <span>SGST (0% - Healthcare Exempt):</span>
                <span className="font-mono font-medium text-foreground">₹0.00</span>
              </div>
              {invoice.discount > 0 && (
                <div className="flex justify-between py-1 text-accent-foreground font-medium">
                  <span>Discount:</span>
                  <span className="font-mono">- {formatINR(invoice.discount)}</span>
                </div>
              )}
              <div className="border-t-2 border-primary/20 pt-2 flex justify-between items-baseline">
                <span className="text-sm font-bold text-foreground uppercase tracking-wide">
                  Grand Total (INR):
                </span>
                <span className="text-lg font-mono font-bold text-primary">
                  {formatINR(invoice.total)}
                </span>
              </div>
            </div>

            <p className="text-[10px] text-muted-foreground mt-2 leading-tight">
              * Note: Healthcare diagnosis & seafarer fitness services are exempt from GST under Notification No. 12/2017-Central Tax (Rate).
            </p>
          </div>
        </div>

        {/* Declarations & Signature Footer */}
        <div className="pt-6 mt-4 border-t-2 border-border/80 flex flex-col sm:flex-row justify-between items-end gap-6 text-xs">
          <div className="max-w-[420px] space-y-1 text-[11px] text-muted-foreground">
            <p className="font-semibold text-foreground uppercase tracking-wider text-[10px]">
              Terms & Legal Declaration
            </p>
            <p className="leading-relaxed">
              1. This is a computer-generated official tax invoice issued for maritime seafarer medical evaluation.
            </p>
            <p className="leading-relaxed">
              2. Examined strictly pursuant to Merchant Shipping (Medical Examination) Rules & MLC 2006 guidelines.
            </p>
          </div>

          <div className="text-center sm:text-right shrink-0">
            <div className="inline-block border-b border-foreground/60 w-48 pb-1 mb-1">
              <span className="font-serif italic text-sm text-foreground/80 block">
                Dr. Maya Bennett, MD
              </span>
            </div>
            <p className="font-bold text-xs text-foreground">Authorized Medical Examiner</p>
            <p className="text-[10px] text-muted-foreground">DG Shipping Registration #MUM-DOC-4081</p>
          </div>
        </div>
      </div>
    </div>
  );
}
