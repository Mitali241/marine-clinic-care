import { useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  CreditCard,
  Download,
  Eye,
  FileCheck2,
  FilePlus2,
  FileText,
  Filter,
  MoreHorizontal,
  Printer,
  Search,
  Trash2,
  TrendingUp,
  WalletCards,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  formatINR,
  type InvoiceRecord,
  type PatientRecord,
} from "@/lib/clinic";
import { CreateInvoiceModal } from "./CreateInvoiceModal";
import { InvoiceModal } from "./InvoiceModal";

interface InvoiceModuleProps {
  invoices: InvoiceRecord[];
  patients: PatientRecord[];
  onAddInvoice: (invoice: InvoiceRecord) => void;
  onUpdateInvoice: (invoice: InvoiceRecord) => void;
  onDeleteInvoice: (id: string) => void;
  onNotice: (message: string) => void;
}

export function InvoiceModule({
  invoices,
  patients,
  onAddInvoice,
  onUpdateInvoice,
  onDeleteInvoice,
  onNotice,
}: InvoiceModuleProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceRecord | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Financial statistics calculated dynamically in INR
  const stats = useMemo(() => {
    const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.total, 0);
    const paidInvoices = invoices.filter((inv) => inv.status === "Paid");
    const totalCollected = paidInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const pendingInvoices = invoices.filter(
      (inv) => inv.status === "Pending" || inv.status === "Overdue"
    );
    const totalOutstanding = pendingInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const avgInvoice = invoices.length ? Math.round(totalInvoiced / invoices.length) : 0;

    return {
      totalInvoiced,
      totalCollected,
      totalOutstanding,
      paidCount: paidInvoices.length,
      pendingCount: pendingInvoices.length,
      avgInvoice,
    };
  }, [invoices]);

  // Filtered invoices
  const filtered = useMemo(() => {
    return invoices.filter((inv) => {
      const matchSearch =
        `${inv.id} ${inv.patient} ${inv.company} ${inv.rank || ""} ${inv.indosNo || ""} ${inv.cdcNo || ""}`
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchStatus =
        statusFilter === "all" || inv.status.toLowerCase() === statusFilter.toLowerCase();

      return matchSearch && matchStatus;
    });
  }, [invoices, search, statusFilter]);

  const handleView = (invoice: InvoiceRecord) => {
    setSelectedInvoice(invoice);
    setViewModalOpen(true);
  };

  const handleMarkPaid = (invoice: InvoiceRecord) => {
    const updated: InvoiceRecord = {
      ...invoice,
      status: "Paid",
      paidDate: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    };
    onUpdateInvoice(updated);
    onNotice(`Invoice ${invoice.id} marked as Paid (${invoice.amount}).`);
  };

  return (
    <div className="space-y-6">
      {/* Metric Cards in INR */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Total Invoiced (INR)</span>
            <span className="grid size-8 place-items-center rounded bg-primary/10 text-primary">
              <WalletCards className="size-4" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold font-mono text-foreground">
            {formatINR(stats.totalInvoiced)}
          </p>
          <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
            <span>{invoices.length} tax invoices generated</span>
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Collected / Settled</span>
            <span className="grid size-8 place-items-center rounded bg-accent/20 text-accent-foreground">
              <CheckCircle2 className="size-4" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold font-mono text-accent-foreground">
            {formatINR(stats.totalCollected)}
          </p>
          <p className="mt-1 flex items-center gap-1 text-[11px] text-accent-foreground">
            <ArrowUpRight className="size-3" />
            <span>{stats.paidCount} cleared invoices</span>
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Outstanding Due</span>
            <span className="grid size-8 place-items-center rounded bg-destructive/10 text-destructive">
              <Clock3 className="size-4" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold font-mono text-destructive">
            {formatINR(stats.totalOutstanding)}
          </p>
          <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
            <span>{stats.pendingCount} pending verification</span>
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Avg. Examination Bill</span>
            <span className="grid size-8 place-items-center rounded bg-secondary text-secondary-foreground">
              <TrendingUp className="size-4" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold font-mono text-foreground">
            {formatINR(stats.avgInvoice)}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">Per DG Shipping candidate</p>
        </div>
      </div>

      {/* Invoice Management Table */}
      <section className="rounded-xl border border-border bg-card shadow-xs">
        {/* Table Toolbar */}
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold tracking-tight">Standard Maritime Invoices</h2>
              <Badge variant="outline" className="font-mono text-xs">
                {filtered.length} of {invoices.length}
              </Badge>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              DG Shipping approved medical bills in INR with itemized examination services
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-full sm:w-56">
              <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
              <Input
                placeholder="Search invoice, candidate..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 pl-8 text-xs"
              />
            </div>

            {/* Status Filter */}
            <select
              aria-label="Filter by invoice status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-2.5 text-xs font-medium"
            >
              <option value="all">All Statuses</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
            </select>

            <Button
              size="sm"
              onClick={() => setCreateModalOpen(true)}
              className="gap-1.5 shadow-sm text-xs"
            >
              <FilePlus2 className="size-3.5" /> Create Invoice
            </Button>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent bg-muted/30">
                <TableHead className="pl-6 w-32 text-xs font-semibold">Invoice #</TableHead>
                <TableHead className="min-w-[190px] text-xs font-semibold">Candidate / Seafarer</TableHead>
                <TableHead className="min-w-[180px] text-xs font-semibold">Billed To (Company)</TableHead>
                <TableHead className="text-xs font-semibold">Issue Date</TableHead>
                <TableHead className="text-xs font-semibold">Due Date</TableHead>
                <TableHead className="text-right text-xs font-semibold">Total Amount (₹)</TableHead>
                <TableHead className="text-center text-xs font-semibold">Status</TableHead>
                <TableHead className="pr-6 text-right text-xs font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length > 0 ? (
                filtered.map((invoice) => {
                  const isPaid = invoice.status === "Paid";
                  const isOverdue = invoice.status === "Overdue";
                  return (
                    <TableRow key={invoice.id} className="hover:bg-muted/30 transition-colors">
                      {/* Invoice ID */}
                      <TableCell className="pl-6 font-mono text-xs font-bold text-primary whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleView(invoice)}
                          className="hover:underline flex items-center gap-1.5 text-left"
                        >
                          <FileText className="size-3.5 shrink-0" />
                          {invoice.id}
                        </button>
                      </TableCell>

                      {/* Candidate Name & Rank */}
                      <TableCell>
                        <div className="font-semibold text-xs text-foreground">
                          {invoice.patient}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mt-0.5">
                          {invoice.rank && <span>{invoice.rank}</span>}
                          {invoice.indosNo && (
                            <>
                              <span>·</span>
                              <span className="font-mono">{invoice.indosNo}</span>
                            </>
                          )}
                        </div>
                      </TableCell>

                      {/* Company Name */}
                      <TableCell>
                        <div className="text-xs font-medium text-foreground truncate max-w-[180px]" title={invoice.company}>
                          {invoice.company}
                        </div>
                        {invoice.companyGstin && (
                          <div className="text-[10px] font-mono text-muted-foreground">
                            {invoice.companyGstin}
                          </div>
                        )}
                      </TableCell>

                      {/* Dates */}
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {invoice.date}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {invoice.dueDate}
                      </TableCell>

                      {/* Amount in INR */}
                      <TableCell className="text-right font-mono text-xs font-bold text-foreground whitespace-nowrap">
                        {formatINR(invoice.total)}
                      </TableCell>

                      {/* Status */}
                      <TableCell className="text-center whitespace-nowrap">
                        <Badge
                          variant={isPaid ? "default" : isOverdue ? "destructive" : "secondary"}
                          className="text-[10px] px-2 py-0.5 font-semibold uppercase tracking-wide"
                        >
                          {invoice.status}
                        </Badge>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="pr-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 gap-1 px-2 text-xs font-medium text-primary hover:bg-primary/10 border-primary/30 shadow-xs"
                            onClick={() => handleView(invoice)}
                            title="View Standard Tax Invoice"
                          >
                            <Eye className="size-3" />
                            View
                          </Button>

                          {!isPaid && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2 text-xs text-accent-foreground hover:bg-accent/10"
                              onClick={() => handleMarkPaid(invoice)}
                              title="Mark as Paid"
                            >
                              <Check className="size-3.5 mr-0.5" />
                              Pay
                            </Button>
                          )}

                          <Button
                            size="sm"
                            variant="ghost"
                            className="size-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={() => onDeleteInvoice(invoice.id)}
                            title="Delete Invoice"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="py-12 text-center text-muted-foreground text-xs">
                    No matching invoices found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Footer info note */}
        <div className="border-t border-border px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>Showing {filtered.length} of {invoices.length} invoices (All amounts in INR ₹)</span>
          <div className="flex items-center gap-2">
            <span className="inline-block size-2 rounded-full bg-primary" />
            <span>Standard DG Shipping Compliant Billing</span>
          </div>
        </div>
      </section>

      {/* Invoice Document View Modal */}
      <InvoiceModal
        invoice={selectedInvoice}
        open={viewModalOpen}
        onOpenChange={setViewModalOpen}
        onMarkPaid={(id) => {
          const target = invoices.find((inv) => inv.id === id);
          if (target) handleMarkPaid(target);
        }}
      />

      {/* Create New Invoice Modal */}
      <CreateInvoiceModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        patients={patients}
        nextInvoiceNum={invoices.length + 85}
        onSave={(newInv) => {
          onAddInvoice(newInv);
          onNotice(`Invoice ${newInv.id} created for ${newInv.patient} (${newInv.amount}).`);
        }}
      />
    </div>
  );
}
