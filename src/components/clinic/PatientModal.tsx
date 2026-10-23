import { useEffect, useState } from "react";
import {
  Calendar,
  Clock,
  CreditCard,
  FileBadge,
  FileCheck2,
  FileText,
  HeartPulse,
  Ship,
  Sparkles,
  Stethoscope,
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
import type { PatientRecord } from "@/lib/clinic";

interface PatientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientToEdit?: PatientRecord | null;
  nextSrNo: number;
  onSave: (patient: PatientRecord) => void;
}

const COMMON_RANKS = [
  "Captain / Master",
  "Chief Officer",
  "2nd Officer",
  "3rd Officer",
  "Chief Engineer",
  "2nd Engineer",
  "3rd Engineer",
  "4th Engineer",
  "Electrical Officer (ETO)",
  "Bosun",
  "Able Seaman (AB)",
  "Ordinary Seaman (OS)",
  "Deck Cadet",
  "Engine Cadet",
  "Oiler / Motorman",
  "Fitter",
  "Chief Cook",
  "Trainee Seaman",
];

const MEDICAL_TYPES = [
  "Pre-Sea Examination",
  "Annual Seafarer Medical",
  "Flag State Medical",
  "Periodic Maritime Medical",
  "Offshore / DG Shipping",
  "Re-examination / Follow-up",
  "Routine Checkup",
];

const USG_XRAY_OPTIONS = [
  "USG & Chest X-Ray Normal",
  "Chest X-Ray Normal",
  "USG Normal",
  "Pending USG",
  "Pending X-Ray",
  "Both Pending",
  "Not Required",
  "Abnormal - Requires Review",
];

const COMMON_COMPANIES = [
  "Maersk Marine Services",
  "Synergy Maritime",
  "Anglo-Eastern Shipping",
  "Fleet Management Ltd",
  "MSC Mediterranean",
  "Teekay Tankers",
  "Bernhard Schulte (BSM)",
  "V.Group / V.Ships",
  "Great Eastern Shipping",
  "Executive Ship Management",
];

export function PatientModal({
  open,
  onOpenChange,
  patientToEdit,
  nextSrNo,
  onSave,
}: PatientModalProps) {
  const isEditing = Boolean(patientToEdit);

  const [srNo, setSrNo] = useState<number>(nextSrNo);
  const [date, setDate] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [dob, setDob] = useState<string>("");
  const [age, setAge] = useState<string>("");
  const [gender, setGender] = useState<string>("Male");
  const [rank, setRank] = useState<string>("");
  const [typeOfMedical, setTypeOfMedical] = useState<string>("Annual Seafarer Medical");
  const [usgXray, setUsgXray] = useState<string>("USG & Chest X-Ray Normal");
  const [companyName, setCompanyName] = useState<string>("");

  // Payment status
  const [paymentStatus, setPaymentStatus] = useState<"Paid" | "Own" | "Pending">("Paid");
  const [paymentAmount, setPaymentAmount] = useState<string>("₹4,500.00");
  const [paymentMode, setPaymentMode] = useState<"Cash" | "Trans. ID" | "UPI" | "Bank Transfer">("Trans. ID");
  const [paymentProof, setPaymentProof] = useState<string>("");
  const [transactionId, setTransactionId] = useState<string>("");

  // Timing
  const [timeIn, setTimeIn] = useState<string>("09:00 AM");
  const [timeOut, setTimeOut] = useState<string>("01:00 PM");

  // Alphanumeric credentials
  const [certificateNo, setCertificateNo] = useState<string>("");
  const [indosNo, setIndosNo] = useState<string>("");
  const [cdcNo, setCdcNo] = useState<string>("");
  const [invoiceNo, setInvoiceNo] = useState<string>("");

  const [activeTab, setActiveTab] = useState<"candidate" | "medical" | "credentials" | "payment">("candidate");

  // Populate when patientToEdit changes or modal opens
  useEffect(() => {
    if (patientToEdit) {
      setSrNo(patientToEdit.srNo || 1);
      setDate(patientToEdit.date || new Date().toISOString().slice(0, 10));
      setName(patientToEdit.name || "");
      setPhone(patientToEdit.phone || "");
      setEmail(patientToEdit.email || "");
      setDob(patientToEdit.dob || "");
      setAge(patientToEdit.age ? String(patientToEdit.age) : "");
      setGender(patientToEdit.gender || "Male");
      setRank(patientToEdit.rank || "");
      setTypeOfMedical(patientToEdit.typeOfMedical || "Annual Seafarer Medical");
      setUsgXray(patientToEdit.usgXray || "USG & Chest X-Ray Normal");
      setCompanyName(patientToEdit.companyName || "");
      setPaymentStatus(patientToEdit.paymentStatus || "Paid");
      setPaymentAmount(patientToEdit.paymentAmount || "₹4,500.00");
      setPaymentMode(patientToEdit.paymentMode || "Trans. ID");
      setPaymentProof(patientToEdit.paymentProof || "");
      setTransactionId(patientToEdit.transactionId || "");
      setTimeIn(patientToEdit.timeIn || "09:00 AM");
      setTimeOut(patientToEdit.timeOut || "01:00 PM");
      setCertificateNo(patientToEdit.certificateNo || "");
      setIndosNo(patientToEdit.indosNo || "");
      setCdcNo(patientToEdit.cdcNo || "");
      setInvoiceNo(patientToEdit.invoiceNo || `INV-2026-${String(patientToEdit.srNo || nextSrNo).padStart(3, "0")}`);
    } else {
      // New patient defaults
      const today = new Date().toISOString().slice(0, 10);
      setSrNo(nextSrNo);
      setDate(today);
      setName("");
      setPhone("");
      setEmail("");
      setDob("1995-05-15");
      setAge("31");
      setGender("Male");
      setRank("Chief Officer");
      setTypeOfMedical("Annual Seafarer Medical");
      setUsgXray("USG & Chest X-Ray Normal");
      setCompanyName("Maersk Marine Services");
      setPaymentStatus("Paid");
      setPaymentAmount("₹4,500.00");
      setPaymentMode("Trans. ID");
      setPaymentProof("Online receipt attached");
      setTransactionId(`TXN-${Math.floor(10000 + Math.random() * 90000)}`);
      setTimeIn("09:00 AM");
      setTimeOut("01:30 PM");
      setCertificateNo(`MC-2026-${Math.floor(9000 + nextSrNo)}`);
      setIndosNo(`${Math.floor(10 + Math.random() * 89)}NL${Math.floor(1000 + Math.random() * 9000)}`);
      setCdcNo(`MUM ${Math.floor(100000 + Math.random() * 900000)}`);
      setInvoiceNo(`INV-2026-${String(nextSrNo + 84).padStart(3, "0")}`);
    }
    setActiveTab("candidate");
  }, [patientToEdit, open, nextSrNo]);

  // Auto calculate age when DOB changes
  const handleDobChange = (value: string) => {
    setDob(value);
    if (value) {
      const birth = new Date(value);
      if (!isNaN(birth.getTime())) {
        const diff = Date.now() - birth.getTime();
        const calculatedAge = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
        if (calculatedAge >= 0 && calculatedAge < 120) {
          setAge(String(calculatedAge));
        }
      }
    }
  };

  // Enforce Alphanumeric helper (Char A-Z, 0-9)
  const sanitizeAlphanumeric = (val: string) => {
    return val.replace(/[^a-zA-Z0-9\s-]/g, "").toUpperCase();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) return;

    const initials = cleanName
      .split(/\s+/)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    const id = patientToEdit ? patientToEdit.id : `PT-${(2400 + srNo).toString()}`;

    const formattedDate = date
      ? new Date(date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "Oct 22, 2026";

    const savedRecord: PatientRecord = {
      id,
      srNo: Number(srNo) || nextSrNo,
      date: date || new Date().toISOString().slice(0, 10),
      name: cleanName,
      candidateName: cleanName,
      initials,
      dob: dob || "1995-01-01",
      age: Number(age) || 30,
      gender: gender || "Male",
      phone: phone || "—",
      email: email || `${cleanName.toLowerCase().replace(/\s+/g, ".")}@seafarer.demo`,
      rank: rank || "Seafarer",
      typeOfMedical: typeOfMedical || "Annual Seafarer Medical",
      usgXray: usgXray || "USG & Chest X-Ray Normal",
      companyName: companyName || "Independent / Agency",
      paymentStatus: paymentStatus || "Paid",
      paymentAmount: paymentAmount || "₹4,500.00",
      paymentMode: paymentMode || "Trans. ID",
      paymentProof: paymentProof || "Standard voucher",
      transactionId: transactionId || `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
      timeIn: timeIn || "09:00 AM",
      timeOut: timeOut || "01:00 PM",
      certificateNo: sanitizeAlphanumeric(certificateNo),
      indosNo: sanitizeAlphanumeric(indosNo),
      cdcNo: sanitizeAlphanumeric(cdcNo),
      invoiceNo: invoiceNo || `INV-2026-${String(srNo).padStart(3, "0")}`,
      lastVisit: formattedDate,
      nextVisit: "Scheduled in 1 yr",
      condition: typeOfMedical || "Annual Seafarer Medical",
      status: paymentStatus === "Paid" ? "Active" : "Follow-up",
    };

    onSave(savedRecord);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] w-full max-w-3xl overflow-y-auto p-0 sm:rounded-xl">
        <DialogHeader className="border-b border-border bg-muted/40 p-5 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <Ship className="size-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <DialogTitle className="text-lg font-semibold tracking-tight">
                  {isEditing ? "Edit Patient Record" : "Add New Patient Record"}
                </DialogTitle>
                <Badge variant={isEditing ? "secondary" : "default"} className="text-[11px]">
                  {isEditing ? `Record #${patientToEdit?.id}` : "DG Shipping / Maritime"}
                </Badge>
              </div>
              <DialogDescription className="mt-0.5 text-xs text-muted-foreground">
                Marine seafarer clinical dossier & medical fitness examination fields
              </DialogDescription>
            </div>
          </div>

          {/* Form Tabs */}
          <div className="mt-4 flex flex-wrap gap-1.5 border-t border-border/60 pt-3">
            <button
              type="button"
              onClick={() => setActiveTab("candidate")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                activeTab === "candidate"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <User className="size-3.5" />
              1. Candidate Details
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("credentials")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                activeTab === "credentials"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <FileBadge className="size-3.5" />
              2. Credentials (INDoS / CDC)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("medical")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                activeTab === "medical"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Stethoscope className="size-3.5" />
              3. Medical & Timing
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("payment")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                activeTab === "payment"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <CreditCard className="size-3.5" />
              4. Payment & Invoice
            </button>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6">
          {/* TAB 1: Candidate Details */}
          {activeTab === "candidate" && (
            <div className="space-y-4">
              <div className="rounded-lg border border-border/70 bg-card p-4">
                <div className="mb-3 flex items-center justify-between border-b border-border/50 pb-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Basic Maritime Candidate Info
                  </h3>
                  <span className="text-[11px] text-muted-foreground">Sr. No #{srNo}</span>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="space-y-1.5">
                    <label htmlFor="field-srno" className="text-xs font-medium text-foreground">
                      Sr. No <span className="text-destructive">*</span>
                    </label>
                    <Input
                      id="field-srno"
                      type="number"
                      min="1"
                      value={srNo}
                      onChange={(e) => setSrNo(Number(e.target.value))}
                      className="h-9 text-xs"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="field-date" className="text-xs font-medium text-foreground">
                      Date <span className="text-destructive">*</span>
                    </label>
                    <Input
                      id="field-date"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="h-9 text-xs"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="field-dob" className="text-xs font-medium text-foreground">
                      DOB (Date of Birth) <span className="text-destructive">*</span>
                    </label>
                    <Input
                      id="field-dob"
                      type="date"
                      value={dob}
                      onChange={(e) => handleDobChange(e.target.value)}
                      className="h-9 text-xs"
                      required
                    />
                  </div>
                </div>

                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <div className="space-y-1.5 sm:col-span-2">
                    <label htmlFor="field-name" className="text-xs font-medium text-foreground">
                      Candidate Name / Full Name <span className="text-destructive">*</span>
                    </label>
                    <Input
                      id="field-name"
                      placeholder="e.g. Captain Rajesh Kumar"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="h-9 text-xs"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="field-age" className="text-xs font-medium text-foreground">
                      Age & Gender
                    </label>
                    <div className="flex gap-2">
                      <Input
                        id="field-age"
                        type="number"
                        placeholder="Age"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        className="h-9 w-20 text-xs"
                      />
                      <select
                        aria-label="Gender"
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="h-9 flex-1 rounded-md border border-input bg-background px-2 text-xs"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label htmlFor="field-contact" className="text-xs font-medium text-foreground">
                      Contact No. <span className="text-destructive">*</span>
                    </label>
                    <Input
                      id="field-contact"
                      type="tel"
                      placeholder="+91 98765 43210 or +1 (212) 555-0148"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="h-9 text-xs"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="field-email" className="text-xs font-medium text-foreground">
                      Email Address
                    </label>
                    <Input
                      id="field-email"
                      type="email"
                      placeholder="candidate@marine.demo"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-9 text-xs"
                    />
                  </div>
                </div>

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label htmlFor="field-rank" className="text-xs font-medium text-foreground">
                      Rank <span className="text-destructive">*</span>
                    </label>
                    <div className="relative">
                      <Input
                        id="field-rank"
                        list="rank-suggestions"
                        placeholder="e.g. Chief Officer, Captain, Bosun"
                        value={rank}
                        onChange={(e) => setRank(e.target.value)}
                        className="h-9 text-xs"
                        required
                      />
                      <datalist id="rank-suggestions">
                        {COMMON_RANKS.map((r) => (
                          <option key={r} value={r} />
                        ))}
                      </datalist>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="field-company" className="text-xs font-medium text-foreground">
                      Company Name <span className="text-destructive">*</span>
                    </label>
                    <div className="relative">
                      <Input
                        id="field-company"
                        list="company-suggestions"
                        placeholder="e.g. Maersk Marine, Synergy, MSC"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="h-9 text-xs"
                        required
                      />
                      <datalist id="company-suggestions">
                        {COMMON_COMPANIES.map((c) => (
                          <option key={c} value={c} />
                        ))}
                      </datalist>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Alphanumeric Credentials */}
          {activeTab === "credentials" && (
            <div className="space-y-4">
              <div className="rounded-lg border border-border/70 bg-card p-4">
                <div className="mb-3 flex items-center justify-between border-b border-border/50 pb-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Maritime Identification & Certificates
                  </h3>
                  <Badge variant="outline" className="text-[10px]">
                    Alphanumeric: Char A-Z, 0-9
                  </Badge>
                </div>

                <div className="space-y-3.5">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label htmlFor="field-cert" className="text-xs font-medium text-foreground">
                        Certificate No.
                      </label>
                      <span className="text-[11px] text-muted-foreground">Char. A to Z, Numbers</span>
                    </div>
                    <Input
                      id="field-cert"
                      placeholder="e.g. MC-2026-9041"
                      value={certificateNo}
                      onChange={(e) => setCertificateNo(sanitizeAlphanumeric(e.target.value))}
                      className="h-9 font-mono text-xs uppercase tracking-wide"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Official Medical Fitness Certificate Reference issued by DG Shipping approved medical examiner.
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label htmlFor="field-indos" className="text-xs font-medium text-foreground">
                          INDoS No. <span className="text-destructive">*</span>
                        </label>
                        <span className="text-[11px] text-muted-foreground">Char. A to Z, Numbers</span>
                      </div>
                      <Input
                        id="field-indos"
                        placeholder="e.g. 12NL8492"
                        value={indosNo}
                        onChange={(e) => setIndosNo(sanitizeAlphanumeric(e.target.value))}
                        className="h-9 font-mono text-xs uppercase tracking-wide"
                        required
                      />
                      <p className="text-[11px] text-muted-foreground">
                        Indian National Database of Seafarers identifier.
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label htmlFor="field-cdc" className="text-xs font-medium text-foreground">
                          CDC No. <span className="text-destructive">*</span>
                        </label>
                        <span className="text-[11px] text-muted-foreground">Char. A to Z, Numbers</span>
                      </div>
                      <Input
                        id="field-cdc"
                        placeholder="e.g. MUM 248910 or CHE 087221"
                        value={cdcNo}
                        onChange={(e) => setCdcNo(sanitizeAlphanumeric(e.target.value))}
                        className="h-9 font-mono text-xs uppercase tracking-wide"
                        required
                      />
                      <p className="text-[11px] text-muted-foreground">
                        Continuous Discharge Certificate / Seaman’s Book Number.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Medical & Timing */}
          {activeTab === "medical" && (
            <div className="space-y-4">
              <div className="rounded-lg border border-border/70 bg-card p-4">
                <div className="mb-3 flex items-center justify-between border-b border-border/50 pb-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Medical Examination & Clinical Diagnostics
                  </h3>
                  <span className="text-[11px] text-muted-foreground">Clinic Protocol</span>
                </div>

                <div className="grid gap-3.5 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label htmlFor="field-type" className="text-xs font-medium text-foreground">
                      Type of Medical <span className="text-destructive">*</span>
                    </label>
                    <select
                      id="field-type"
                      value={typeOfMedical}
                      onChange={(e) => setTypeOfMedical(e.target.value)}
                      className="h-9 w-full rounded-md border border-input bg-background px-2.5 text-xs"
                      required
                    >
                      {MEDICAL_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="field-usg" className="text-xs font-medium text-foreground">
                      USG / XRay Status & Findings <span className="text-destructive">*</span>
                    </label>
                    <select
                      id="field-usg"
                      value={usgXray}
                      onChange={(e) => setUsgXray(e.target.value)}
                      className="h-9 w-full rounded-md border border-input bg-background px-2.5 text-xs"
                      required
                    >
                      {USG_XRAY_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-4 border-t border-border/60 pt-3">
                  <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-foreground">
                    <Clock className="size-3.5 text-primary" />
                    Time . In & Out (Check-in & Departure)
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label htmlFor="field-timein" className="text-xs font-medium text-foreground">
                        Time In <span className="text-destructive">*</span>
                      </label>
                      <Input
                        id="field-timein"
                        placeholder="09:00 AM"
                        value={timeIn}
                        onChange={(e) => setTimeIn(e.target.value)}
                        className="h-9 text-xs"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="field-timeout" className="text-xs font-medium text-foreground">
                        Time Out
                      </label>
                      <Input
                        id="field-timeout"
                        placeholder="01:30 PM (or In Progress)"
                        value={timeOut}
                        onChange={(e) => setTimeOut(e.target.value)}
                        className="h-9 text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Payment & Invoice */}
          {activeTab === "payment" && (
            <div className="space-y-4">
              <div className="rounded-lg border border-border/70 bg-card p-4">
                <div className="mb-3 flex items-center justify-between border-b border-border/50 pb-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Payment Status & Financial Settlement
                  </h3>
                  <Badge
                    variant={paymentStatus === "Paid" ? "default" : "outline"}
                    className="text-[10px]"
                  >
                    Status: {paymentStatus}
                  </Badge>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="space-y-1.5">
                    <label htmlFor="field-status" className="text-xs font-medium text-foreground">
                      Status (Payment - Paid / Own) <span className="text-destructive">*</span>
                    </label>
                    <select
                      id="field-status"
                      value={paymentStatus}
                      onChange={(e) => setPaymentStatus(e.target.value as "Paid" | "Own" | "Pending")}
                      className="h-9 w-full rounded-md border border-input bg-background px-2.5 text-xs font-semibold"
                    >
                      <option value="Paid">Paid (Company / Cleared)</option>
                      <option value="Own">Own (Candidate Paid)</option>
                      <option value="Pending">Pending / Due</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="field-amt" className="text-xs font-medium text-foreground">
                      Amount (Amt) <span className="text-destructive">*</span>
                    </label>
                    <Input
                      id="field-amt"
                      placeholder="₹4,500.00 or Rs. 4,500"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      className="h-9 text-xs font-medium"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="field-mode" className="text-xs font-medium text-foreground">
                      Payment Mode (Cash / Trans. ID) <span className="text-destructive">*</span>
                    </label>
                    <select
                      id="field-mode"
                      value={paymentMode}
                      onChange={(e) =>
                        setPaymentMode(e.target.value as "Cash" | "Trans. ID" | "UPI" | "Bank Transfer")
                      }
                      className="h-9 w-full rounded-md border border-input bg-background px-2.5 text-xs"
                    >
                      <option value="Cash">Cash</option>
                      <option value="Trans. ID">Trans. ID (Online / POS)</option>
                      <option value="UPI">UPI / Digital</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                    </select>
                  </div>
                </div>

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label htmlFor="field-transid" className="text-xs font-medium text-foreground">
                      Trans. ID / Transaction Reference
                    </label>
                    <Input
                      id="field-transid"
                      placeholder="e.g. TXN-50941 or UPI/UTR reference"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      className="h-9 font-mono text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="field-proof" className="text-xs font-medium text-foreground">
                      Payment Proof (Proof / Receipt Memo)
                    </label>
                    <Input
                      id="field-proof"
                      placeholder="e.g. Receipt #441 / Voucher #0912"
                      value={paymentProof}
                      onChange={(e) => setPaymentProof(e.target.value)}
                      className="h-9 text-xs"
                    />
                  </div>
                </div>

                {/* Invoice Section from Note */}
                <div className="mt-4 rounded-md border border-primary/20 bg-primary/5 p-3.5">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                      <FileText className="size-3.5" />
                      Invoice Section
                    </div>
                    <span className="text-[10px] text-muted-foreground">Auto-generated invoice link</span>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1">
                      <label htmlFor="field-inv" className="text-[11px] font-medium text-foreground">
                        Invoice No.
                      </label>
                      <Input
                        id="field-inv"
                        value={invoiceNo}
                        onChange={(e) => setInvoiceNo(e.target.value)}
                        className="h-8 font-mono text-xs uppercase"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[11px] font-medium text-foreground">Candidate Name</span>
                      <p className="truncate rounded-md border border-border/60 bg-background px-3 py-1.5 text-xs font-semibold text-foreground">
                        {name || "Candidate Name —"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation & Submit Footer */}
          <DialogFooter className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-between sm:space-x-0 border-t border-border pt-4">
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <span>* Required seafarer fields</span>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" className="gap-1.5">
                <FileCheck2 className="size-4" />
                {isEditing ? "Save Changes" : "Save Record"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
