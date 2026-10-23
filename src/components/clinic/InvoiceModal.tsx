import {
  CheckCircle2,
  Download,
  Edit,
  FileCheck2,
  FileText,
  Printer,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { InvoiceRecord } from "@/lib/clinic";
import { InvoiceDocument } from "./InvoiceDocument";

interface InvoiceModalProps {
  invoice: InvoiceRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMarkPaid?: (invoiceId: string) => void;
  onEdit?: (invoice: InvoiceRecord) => void;
}

export function InvoiceModal({
  invoice,
  open,
  onOpenChange,
  onMarkPaid,
  onEdit,
}: InvoiceModalProps) {
  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[94vh] w-full max-w-4xl overflow-y-auto p-4 sm:p-6 sm:rounded-xl">
        <DialogHeader className="sr-only">
          <DialogTitle>Tax Invoice {invoice.id}</DialogTitle>
          <DialogDescription>
            Official DG Shipping Medical Examination Invoice
          </DialogDescription>
        </DialogHeader>

        <InvoiceDocument
          invoice={invoice}
          onPrint={handlePrint}
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
