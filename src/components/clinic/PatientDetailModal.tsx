import {
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  Download,
  Edit,
  ExternalLink,
  FileBadge,
  FileCheck2,
  FileText,
  Mail,
  MapPin,
  Phone,
  Printer,
  ShieldCheck,
  Ship,
  Stethoscope,
  User,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import type { PatientRecord } from "@/lib/clinic";

interface PatientDetailModalProps {
  patient: PatientRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (patient: PatientRecord) => void;
  onPrintNotice?: () => void;
}

export function PatientDetailModal({
  patient,
  open,
  onOpenChange,
  onEdit,
  onPrintNotice,
}: PatientDetailModalProps) {
  if (!patient) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] w-full max-w-2xl overflow-y-auto p-0 sm:rounded-xl">
        <DialogHeader className="border-b border-border bg-muted/40 p-5 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Avatar className="size-12 border-2 border-primary/20">
                <AvatarFallback className="bg-primary/10 text-sm font-bold text-primary">
                  {patient.initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <DialogTitle className="text-lg font-semibold tracking-tight">
                    {patient.name}
                  </DialogTitle>
                  <Badge variant="outline" className="font-mono text-[10px]">
                    Sr. #{patient.srNo}
                  </Badge>
                </div>
                <DialogDescription className="mt-0.5 text-xs text-muted-foreground flex items-center gap-2">
                  <span className="font-medium text-foreground">{patient.rank}</span>
                  <span>·</span>
                  <span>{patient.companyName}</span>
                </DialogDescription>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs"
                onClick={() => {
                  onOpenChange(false);
                  onEdit(patient);
                }}
              >
                <Edit className="size-3.5" />
                Edit Record
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 p-5 sm:p-6 text-xs">
          {/* Top Quick Badges */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <div className="rounded-lg border border-border/80 bg-card p-2.5">
              <span className="text-[10px] font-medium text-muted-foreground">Examination Date</span>
              <p className="mt-0.5 font-semibold text-foreground">{patient.date || patient.lastVisit}</p>
            </div>
            <div className="rounded-lg border border-border/80 bg-card p-2.5">
              <span className="text-[10px] font-medium text-muted-foreground">Payment Status</span>
              <p className="mt-0.5 font-semibold text-accent-foreground flex items-center gap-1">
                <CheckCircle2 className="size-3" /> {patient.paymentStatus} ({patient.paymentAmount})
              </p>
            </div>
            <div className="rounded-lg border border-border/80 bg-card p-2.5">
              <span className="text-[10px] font-medium text-muted-foreground">Time In / Out</span>
              <p className="mt-0.5 font-semibold text-foreground">
                {patient.timeIn} - {patient.timeOut}
              </p>
            </div>
            <div className="rounded-lg border border-border/80 bg-card p-2.5">
              <span className="text-[10px] font-medium text-muted-foreground">Invoice Ref</span>
              <p className="mt-0.5 font-mono font-semibold text-primary">{patient.invoiceNo || "INV-2026-084"}</p>
            </div>
          </div>

          {/* Maritime Documentation Block */}
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-semibold text-primary">
                <FileBadge className="size-4" />
                Seafarer Official Credentials
              </div>
              <Badge variant="outline" className="bg-background text-[10px]">
                Char A-Z, 0-9
              </Badge>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded bg-background p-2.5 border border-border/60">
                <span className="text-[10px] text-muted-foreground">Certificate No.</span>
                <p className="mt-0.5 font-mono font-semibold tracking-wide text-foreground">
                  {patient.certificateNo || "—"}
                </p>
              </div>
              <div className="rounded bg-background p-2.5 border border-border/60">
                <span className="text-[10px] text-muted-foreground">INDoS No. (DG Shipping)</span>
                <p className="mt-0.5 font-mono font-semibold tracking-wide text-foreground">
                  {patient.indosNo || "—"}
                </p>
              </div>
              <div className="rounded bg-background p-2.5 border border-border/60">
                <span className="text-[10px] text-muted-foreground">CDC No. (Seaman’s Book)</span>
                <p className="mt-0.5 font-mono font-semibold tracking-wide text-foreground">
                  {patient.cdcNo || "—"}
                </p>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Candidate & Contact Details */}
            <div className="rounded-lg border border-border bg-card p-4 space-y-2.5">
              <div className="flex items-center gap-1.5 font-semibold text-foreground border-b border-border/60 pb-2">
                <User className="size-3.5 text-primary" />
                Candidate & Contact Information
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Candidate Name:</span>
                  <span className="font-medium text-foreground">{patient.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date of Birth (DOB):</span>
                  <span className="font-medium text-foreground">
                    {patient.dob} ({patient.age} yrs)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Gender:</span>
                  <span className="font-medium text-foreground">{patient.gender}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Contact No.:</span>
                  <span className="font-medium text-foreground">{patient.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium text-foreground truncate max-w-[180px]">{patient.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Company Name:</span>
                  <span className="font-medium text-foreground">{patient.companyName}</span>
                </div>
              </div>
            </div>

            {/* Medical & Diagnostic Details */}
            <div className="rounded-lg border border-border bg-card p-4 space-y-2.5">
              <div className="flex items-center gap-1.5 font-semibold text-foreground border-b border-border/60 pb-2">
                <Stethoscope className="size-3.5 text-primary" />
                Medical & Diagnostics
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type of Medical:</span>
                  <span className="font-semibold text-foreground">{patient.typeOfMedical}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">USG / XRay:</span>
                  <span className="font-medium text-accent-foreground">{patient.usgXray}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time In:</span>
                  <span className="font-medium text-foreground">{patient.timeIn}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time Out:</span>
                  <span className="font-medium text-foreground">{patient.timeOut}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fitness Condition:</span>
                  <span className="font-medium text-foreground">{patient.condition}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Record Status:</span>
                  <Badge variant="secondary" className="text-[10px]">{patient.status}</Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="rounded-lg border border-border bg-card p-4 space-y-2.5">
            <div className="flex items-center gap-1.5 font-semibold text-foreground border-b border-border/60 pb-2">
              <CreditCard className="size-3.5 text-primary" />
              Financial & Invoice Statement
            </div>
            <div className="grid gap-3 sm:grid-cols-4">
              <div>
                <span className="text-[10px] text-muted-foreground">Payment Status</span>
                <p className="mt-0.5 font-semibold text-foreground">{patient.paymentStatus}</p>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground">Amount (Amt)</span>
                <p className="mt-0.5 font-semibold text-foreground">{patient.paymentAmount}</p>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground">Payment Mode</span>
                <p className="mt-0.5 font-semibold text-foreground">{patient.paymentMode}</p>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground">Trans. ID / Proof</span>
                <p className="mt-0.5 font-mono text-[11px] text-foreground truncate">
                  {patient.transactionId || patient.paymentProof || "—"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="border-t border-border bg-muted/20 px-5 py-3 sm:px-6 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground"
            onClick={onPrintNotice}
          >
            <Printer className="size-3.5 mr-1" />
            Print Dossier
          </Button>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
            <Button
              type="button"
              size="sm"
              className="gap-1.5"
              onClick={() => {
                onOpenChange(false);
                onEdit(patient);
              }}
            >
              <Edit className="size-3.5" />
              Edit Record
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
