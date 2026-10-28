import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Download,
  FileSpreadsheet,
  FileText,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Briefcase,
  Building,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  UserX,
  FileCheck,
  ExternalLink,
  Plus,
  Printer,
  Upload,
  RefreshCw,
  X,
  Phone,
  Mail,
  MapPin,
  HeartPulse,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  listStaffServer,
  saveStaffServer,
  deleteStaffServer,
} from "@/lib/clinic.server";
import { exportStaffToExcel } from "@/lib/excel-export";
import { ClinicLogo } from "@/components/clinic/ClinicLogo";
import {
  initialStaffMembers,
  staffDepartments,
  staffStatuses,
  documentTypes,
  type StaffMember,
  type StaffDocument,
  type StaffDepartment,
  type StaffStatus,
  type DocumentType,
} from "@/lib/staff";
import { formatINR } from "@/lib/clinic";

interface StaffManagementModuleProps {
  onNotice: (msg: string) => void;
}

export function StaffManagementModule({ onNotice }: StaffManagementModuleProps) {
  const [staffList, setStaffList] = useState<StaffMember[]>(initialStaffMembers);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Modals
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);

  const [formModalOpen, setFormModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<StaffMember>>({});

  // Resignation Modal
  const [resignationModalOpen, setResignationModalOpen] = useState(false);
  const [resignationStaff, setResignationStaff] = useState<StaffMember | null>(null);
  const [resignationDate, setResignationDate] = useState("");
  const [relievingDate, setRelievingDate] = useState("");
  const [resignationReason, setResignationReason] = useState("");

  // Document Add State inside View Modal
  const [addDocModalOpen, setAddDocModalOpen] = useState(false);
  const [newDocName, setNewDocName] = useState("");
  const [newDocType, setNewDocType] = useState<DocumentType>("Medical License & DG Approval");
  const [newDocNo, setNewDocNo] = useState("");
  const [newDocExpiry, setNewDocExpiry] = useState("");

  // Document Viewer State
  const [docViewerOpen, setDocViewerOpen] = useState(false);
  const [viewingDoc, setViewingDoc] = useState<StaffDocument | null>(null);

  // Document File Upload State
  const [newDocFileData, setNewDocFileData] = useState("");
  const [newDocFileName, setNewDocFileName] = useState("");
  const [newDocFileType, setNewDocFileType] = useState("");
  const [newDocFileSize, setNewDocFileSize] = useState(0);

  const handleDocFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      onNotice("File size exceeds 8MB limit. Please choose a smaller file.");
      return;
    }

    setNewDocFileName(file.name);
    setNewDocFileType(file.type);
    setNewDocFileSize(Math.round(file.size / 1024));

    if (!newDocName.trim()) {
      const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
      setNewDocName(cleanName);
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setNewDocFileData(result);
    };
    reader.readAsDataURL(file);
  };

  const handleOpenDocument = (doc: StaffDocument) => {
    setViewingDoc(doc);
    setDocViewerOpen(true);
  };

  const loadStaff = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await listStaffServer();
      if (data && data.length > 0) {
        setStaffList(data);
      }
    } catch (err) {
      console.warn("Could not load staff from MongoDB, using baseline:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStaff();
  }, [loadStaff]);

  // Metrics
  const metrics = useMemo(() => {
    const total = staffList.length;
    const active = staffList.filter((s) => s.status.includes("Active")).length;
    const doctors = staffList.filter(
      (s) => s.department === "Medical & DG Examinations" || s.role.toLowerCase().includes("dr"),
    ).length;
    const resigned = staffList.filter((s) => s.status === "Resigned").length;
    return { total, active, doctors, resigned };
  }, [staffList]);

  // Filtered List
  const filteredStaff = useMemo(() => {
    const q = search.trim().toLowerCase();
    return staffList.filter((s) => {
      const matchesSearch =
        !q ||
        `${s.id} ${s.name} ${s.role} ${s.department} ${s.phone} ${s.email}`
          .toLowerCase()
          .includes(q);

      const matchesDept =
        departmentFilter === "all" || s.department === departmentFilter;

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && s.status.includes("Active")) ||
        (statusFilter === "resigned" && s.status === "Resigned") ||
        (statusFilter === "leave" && s.status === "On leave");

      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [staffList, search, departmentFilter, statusFilter]);

  // Open Add Form
  const handleOpenAdd = () => {
    const nextNum = staffList.length + 1;
    const nextId = `SMC-EMP-${String(nextNum).padStart(3, "0")}`;
    setFormData({
      id: nextId,
      name: "",
      initials: "",
      gender: "Male",
      dob: "1990-01-01",
      phone: "+91 ",
      email: "",
      address: "CBD Belapur, Navi Mumbai",
      emergencyContactName: "",
      emergencyContactPhone: "",
      role: "",
      department: "Medical & DG Examinations",
      employmentType: "Full-time",
      status: "Active / On duty",
      joiningDate: new Date().toISOString().slice(0, 10),
      schedule: "Mon – Fri, 9:00 AM – 5:00 PM",
      basicSalary: 45000,
      allowances: 8000,
      deductions: 2000,
      netSalary: 51000,
      payFrequency: "Monthly",
      panNo: "",
      bankName: "",
      bankAccountNo: "",
      ifscCode: "",
      documents: [],
    });
    setIsEditing(false);
    setFormModalOpen(true);
  };

  // Open Edit Form
  const handleOpenEdit = (staff: StaffMember) => {
    setFormData({ ...staff });
    setIsEditing(true);
    setFormModalOpen(true);
  };

  // Save Form (Add or Edit)
  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.role || !formData.phone || !formData.joiningDate) {
      alert("Please fill all required fields (Name, Role, Phone, Joining Date).");
      return;
    }

    const calculatedNet =
      (Number(formData.basicSalary) || 0) +
      (Number(formData.allowances) || 0) -
      (Number(formData.deductions) || 0);

    const initials =
      formData.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 3)
        .toUpperCase() || "SM";

    const completeRecord: StaffMember = {
      id: formData.id || `SMC-EMP-${Date.now().toString().slice(-3)}`,
      name: formData.name,
      initials: formData.initials || initials,
      gender: formData.gender || "Male",
      dob: formData.dob || "1990-01-01",
      phone: formData.phone,
      email: formData.email || "staff@sailorsmedical.com",
      address: formData.address || "Navi Mumbai",
      emergencyContactName: formData.emergencyContactName || "Family Contact",
      emergencyContactPhone: formData.emergencyContactPhone || "+91 95614 50104",
      role: formData.role,
      department: formData.department || "Medical & DG Examinations",
      employmentType: formData.employmentType || "Full-time",
      status: formData.status || "Active / On duty",
      joiningDate: formData.joiningDate,
      schedule: formData.schedule || "Mon – Fri, 9:00 AM – 5:00 PM",
      resignationDate: formData.resignationDate,
      relievingDate: formData.relievingDate,
      resignationReason: formData.resignationReason,
      noticePeriodDays: formData.noticePeriodDays ?? 30,
      basicSalary: Number(formData.basicSalary) || 0,
      allowances: Number(formData.allowances) || 0,
      deductions: Number(formData.deductions) || 0,
      netSalary: calculatedNet,
      payFrequency: formData.payFrequency || "Monthly",
      panNo: formData.panNo,
      bankName: formData.bankName,
      bankAccountNo: formData.bankAccountNo,
      ifscCode: formData.ifscCode,
      documents: formData.documents || [],
      notes: formData.notes,
      createdAt: formData.createdAt || new Date().toISOString(),
    };

    if (isEditing) {
      setStaffList((prev) =>
        prev.map((s) => (s.id === completeRecord.id ? completeRecord : s)),
      );
      onNotice(`Staff member ${completeRecord.name} (${completeRecord.id}) updated and saved to MongoDB.`);
    } else {
      setStaffList((prev) => [completeRecord, ...prev]);
      onNotice(`New staff member ${completeRecord.name} added and saved to MongoDB.`);
    }

    setFormModalOpen(false);

    try {
      await saveStaffServer({ data: completeRecord });
    } catch (err) {
      console.error("Failed to save staff to MongoDB:", err);
    }
  };

  // Open Resignation Modal
  const handleOpenResignation = (staff: StaffMember) => {
    setResignationStaff(staff);
    setResignationDate(staff.resignationDate || new Date().toISOString().slice(0, 10));
    const defaultRelieving = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);
    setRelievingDate(staff.relievingDate || defaultRelieving);
    setResignationReason(staff.resignationReason || "");
    setResignationModalOpen(true);
  };

  // Confirm Resignation
  const handleConfirmResignation = async () => {
    if (!resignationStaff) return;
    const updated: StaffMember = {
      ...resignationStaff,
      status: "Resigned",
      resignationDate,
      relievingDate,
      resignationReason: resignationReason || "Resignation recorded by administration",
    };

    setStaffList((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    if (selectedStaff?.id === updated.id) {
      setSelectedStaff(updated);
    }
    setResignationModalOpen(false);
    onNotice(`Recorded resignation for ${updated.name} (Effective: ${relievingDate}).`);

    try {
      await saveStaffServer({ data: updated });
    } catch (err) {
      console.error("Failed to update resignation in MongoDB:", err);
    }
  };

  // Delete Staff
  const handleDeleteStaff = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove the record for ${name} (${id})?`)) {
      return;
    }
    setStaffList((prev) => prev.filter((s) => s.id !== id));
    if (selectedStaff?.id === id) {
      setViewModalOpen(false);
    }
    onNotice(`Staff member ${name} removed from clinic register.`);

    try {
      await deleteStaffServer({ data: { id, name } });
    } catch (err) {
      console.error("Failed to delete staff member from MongoDB:", err);
    }
  };

  // Add Document to Selected Staff
  const handleAddDocument = async () => {
    if (!selectedStaff || !newDocName) return;
    const newDoc: StaffDocument = {
      id: `DOC-${Date.now().toString().slice(-4)}`,
      name: newDocName,
      type: newDocType,
      documentNo: newDocNo || undefined,
      issuedDate: new Date().toISOString().slice(0, 10),
      expiryDate: newDocExpiry || undefined,
      fileName: newDocFileName || undefined,
      fileData: newDocFileData || undefined,
      fileType: newDocFileType || undefined,
      fileUrl: newDocFileData || undefined,
      verificationStatus: "Verified",
    };

    const updated: StaffMember = {
      ...selectedStaff,
      documents: [...(selectedStaff.documents || []), newDoc],
    };

    setSelectedStaff(updated);
    setStaffList((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    setAddDocModalOpen(false);
    setNewDocName("");
    setNewDocNo("");
    setNewDocExpiry("");
    setNewDocFileData("");
    setNewDocFileName("");
    setNewDocFileType("");
    setNewDocFileSize(0);
    onNotice(`Document "${newDoc.name}" uploaded and verified for ${updated.name}.`);

    try {
      await saveStaffServer({ data: updated });
    } catch (err) {
      console.error("Failed to add document to MongoDB:", err);
    }
  };

  // Remove Document
  const handleRemoveDocument = async (docId: string, docName: string) => {
    if (!selectedStaff) return;
    const updated: StaffMember = {
      ...selectedStaff,
      documents: selectedStaff.documents.filter((d) => d.id !== docId),
    };
    setSelectedStaff(updated);
    setStaffList((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    onNotice(`Removed document "${docName}".`);

    try {
      await saveStaffServer({ data: updated });
    } catch (err) {
      console.error("Failed to update documents in MongoDB:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Staff
            </span>
            <span className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
              <Users className="size-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">{metrics.total}</span>
            <span className="text-xs text-muted-foreground">registered personnel</span>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Active / On Duty
            </span>
            <span className="grid size-9 place-items-center rounded-lg bg-emerald-500/10 text-emerald-600">
              <CheckCircle2 className="size-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-600">{metrics.active}</span>
            <span className="text-xs text-muted-foreground">in active service</span>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Medical Officers
            </span>
            <span className="grid size-9 place-items-center rounded-lg bg-blue-500/10 text-blue-600">
              <HeartPulse className="size-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-blue-600">{metrics.doctors}</span>
            <span className="text-xs text-muted-foreground">DG approved physicians</span>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Resigned / Relieved
            </span>
            <span className="grid size-9 place-items-center rounded-lg bg-amber-500/10 text-amber-600">
              <UserX className="size-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-600">{metrics.resigned}</span>
            <span className="text-xs text-muted-foreground">completed handovers</span>
          </div>
        </div>
      </div>

      {/* Main Staff Directory Card */}
      <div className="rounded-xl border border-border bg-card shadow-2xs overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col gap-4 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div>
            <h2 className="text-base font-bold text-foreground">Staff & Employee Directory</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Comprehensive personnel management, joining records, salary breakdown & verified documents
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportStaffToExcel(filteredStaff)}
              className="gap-1.5 text-xs h-9 border-emerald-600/30 text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
              title="Download Staff Directory as Excel spreadsheet"
            >
              <FileSpreadsheet className="size-3.5 text-emerald-600" />
              Export to Excel (.xlsx)
            </Button>
            <Button
              onClick={handleOpenAdd}
              size="sm"
              className="gap-1.5 text-xs h-9 bg-primary text-primary-foreground shadow-xs"
            >
              <UserPlus className="size-3.5" />
              Add Employee
            </Button>
          </div>
        </div>

        {/* Search & Filters Bar */}
        <div className="flex flex-col gap-3 border-b border-border bg-muted/20 p-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, ID, role, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 pl-9 text-xs"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Department Filter */}
            <select
              aria-label="Filter by department"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-2.5 text-xs font-medium"
            >
              <option value="all">All Departments</option>
              {staffDepartments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              aria-label="Filter by status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-2.5 text-xs font-medium"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active / On Duty</option>
              <option value="leave">On Leave</option>
              <option value="resigned">Resigned</option>
            </select>

            <Button
              variant="ghost"
              size="sm"
              onClick={loadStaff}
              className="size-9 p-0 text-muted-foreground hover:text-foreground"
              title="Refresh from MongoDB Atlas"
            >
              <RefreshCw className={`size-3.5 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        {/* Staff Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b border-border">
                <TableHead className="pl-5 text-xs font-bold text-muted-foreground uppercase">
                  Employee ID & Name
                </TableHead>
                <TableHead className="text-xs font-bold text-muted-foreground uppercase">
                  Role & Department
                </TableHead>
                <TableHead className="text-xs font-bold text-muted-foreground uppercase">
                  Joining & Status
                </TableHead>
                <TableHead className="text-xs font-bold text-muted-foreground uppercase">
                  Salary (Monthly)
                </TableHead>
                <TableHead className="text-xs font-bold text-muted-foreground uppercase">
                  Verified Documents
                </TableHead>
                <TableHead className="pr-5 text-right text-xs font-bold text-muted-foreground uppercase">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStaff.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                    <Users className="mx-auto size-8 opacity-40 mb-2" />
                    <p className="text-sm font-medium">No employee records found matching your filters</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredStaff.map((staff) => (
                  <TableRow key={staff.id} className="hover:bg-muted/40 transition-colors">
                    {/* 1. Name & Avatar */}
                    <TableCell className="pl-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar className="size-9 border border-border">
                          <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
                            {staff.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-foreground">{staff.name}</span>
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-mono">
                              {staff.id}
                            </Badge>
                          </div>
                          <div className="text-[11px] text-muted-foreground flex items-center gap-2 mt-0.5">
                            <span>{staff.phone}</span>
                            <span>•</span>
                            <span className="truncate max-w-[150px]">{staff.email}</span>
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    {/* 2. Role & Department */}
                    <TableCell>
                      <div className="text-xs font-semibold text-foreground">{staff.role}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">{staff.department}</div>
                    </TableCell>

                    {/* 3. Joining & Status */}
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`size-2 rounded-full ${
                            staff.status === "Resigned"
                              ? "bg-amber-500"
                              : staff.status.includes("Active")
                                ? "bg-emerald-500"
                                : "bg-muted-foreground"
                          }`}
                        />
                        <span className="text-xs font-medium text-foreground">{staff.status}</span>
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">
                        Joined: {staff.joiningDate}
                        {staff.resignationDate && (
                          <span className="text-amber-600 dark:text-amber-400 font-medium ml-1">
                            · Resigned: {staff.resignationDate}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* 4. Salary */}
                    <TableCell>
                      <div className="text-xs font-bold text-foreground">{formatINR(staff.netSalary)}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">
                        Basic: {formatINR(staff.basicSalary)} · {staff.payFrequency}
                      </div>
                    </TableCell>

                    {/* 5. Documents */}
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Badge
                          variant="secondary"
                          className="text-[10px] px-2 py-0.5 font-medium gap-1 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                        >
                          <FileCheck className="size-3" />
                          {staff.documents?.length || 0} Docs
                        </Badge>
                        {staff.documents && staff.documents.length > 0 && (
                          <span className="text-[10px] text-emerald-600 font-medium">
                            ({staff.documents.filter((d) => d.verificationStatus === "Verified").length} Verified)
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* 6. Actions */}
                    <TableCell className="pr-5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 px-2 text-xs gap-1 text-primary hover:bg-primary/10"
                          onClick={() => {
                            setSelectedStaff(staff);
                            setViewModalOpen(true);
                          }}
                          title="View Employee Dossier & Documents"
                        >
                          <Eye className="size-3.5" />
                          Dossier
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="size-8 p-0 text-muted-foreground hover:text-foreground"
                          onClick={() => handleOpenEdit(staff)}
                          title="Edit Employee Information"
                        >
                          <Edit className="size-3.5" />
                        </Button>
                        {staff.status !== "Resigned" ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="size-8 p-0 text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                            onClick={() => handleOpenResignation(staff)}
                            title="Record Resignation & Exit"
                          >
                            <UserX className="size-3.5" />
                          </Button>
                        ) : null}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="size-8 p-0 text-destructive/80 hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteStaff(staff.id, staff.name)}
                          title="Remove Employee"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL 1: VIEW EMPLOYEE DOSSIER, SALARY & DOCUMENTS     */}
      {/* ======================================================== */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedStaff && (
            <div className="space-y-6">
              {/* Header */}
              <DialogHeader className="border-b border-border pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-12 border border-border">
                      <AvatarFallback className="bg-primary/10 text-base font-bold text-primary">
                        {selectedStaff.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <DialogTitle className="text-lg font-bold flex items-center gap-2">
                        <span>{selectedStaff.name}</span>
                        <Badge variant="outline" className="font-mono text-xs">
                          {selectedStaff.id}
                        </Badge>
                      </DialogTitle>
                      <DialogDescription className="text-xs mt-0.5">
                        {selectedStaff.role} · {selectedStaff.department}
                      </DialogDescription>
                    </div>
                  </div>
                  <Badge
                    variant={selectedStaff.status === "Resigned" ? "destructive" : "default"}
                    className="text-xs px-2.5 py-1"
                  >
                    {selectedStaff.status}
                  </Badge>
                </div>
              </DialogHeader>

              {/* Grid 1: Basic & Employment Profile */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                  <Briefcase className="size-3.5 text-primary" /> Employment & Personal Details
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 rounded-lg border border-border bg-muted/20 p-3.5 text-xs">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Joining Date:</span>
                    <span className="font-semibold">{selectedStaff.joiningDate}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Employment Type:</span>
                    <span className="font-semibold">{selectedStaff.employmentType}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Working Schedule:</span>
                    <span className="font-semibold">{selectedStaff.schedule}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Mobile Phone:</span>
                    <span className="font-semibold">{selectedStaff.phone}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Email Address:</span>
                    <span className="font-semibold">{selectedStaff.email}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Date of Birth (Gender):</span>
                    <span className="font-semibold">
                      {selectedStaff.dob} ({selectedStaff.gender})
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground block text-[11px]">Residential Address:</span>
                    <span className="font-semibold">{selectedStaff.address}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Emergency Contact:</span>
                    <span className="font-semibold">
                      {selectedStaff.emergencyContactName} ({selectedStaff.emergencyContactPhone})
                    </span>
                  </div>
                </div>
              </div>

              {/* Grid 2: Resignation Information (If Resigned) */}
              {selectedStaff.status === "Resigned" && (
                <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-xs">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-2 flex items-center gap-1.5">
                    <UserX className="size-3.5" /> Resignation & Relieving Record
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Resignation Tendered:</span>
                      <span className="font-semibold">{selectedStaff.resignationDate || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Relieving / Exit Date:</span>
                      <span className="font-semibold">{selectedStaff.relievingDate || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Notice Period:</span>
                      <span className="font-semibold">{selectedStaff.noticePeriodDays || 30} Days</span>
                    </div>
                    <div className="sm:col-span-3">
                      <span className="text-muted-foreground block text-[11px]">Reason for Resignation:</span>
                      <span className="font-medium text-foreground">
                        {selectedStaff.resignationReason || "Standard career progression / relocation"}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Grid 3: Salary & Banking Structure */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                  <CreditCard className="size-3.5 text-primary" /> Salary & Banking Structure
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-lg border border-border bg-card p-3.5 text-xs">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Basic Salary:</span>
                    <span className="font-bold text-foreground">{formatINR(selectedStaff.basicSalary)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Allowances (HRA/Med):</span>
                    <span className="font-bold text-foreground">{formatINR(selectedStaff.allowances)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Deductions (PF/PT):</span>
                    <span className="font-bold text-destructive">-{formatINR(selectedStaff.deductions)}</span>
                  </div>
                  <div className="bg-primary/5 rounded p-1.5 border border-primary/20">
                    <span className="text-primary block text-[10px] uppercase font-bold">Net In-Hand Salary:</span>
                    <span className="text-sm font-bold text-primary">{formatINR(selectedStaff.netSalary)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Bank Name:</span>
                    <span className="font-semibold">{selectedStaff.bankName || "—"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Account Number:</span>
                    <span className="font-semibold font-mono">{selectedStaff.bankAccountNo || "—"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">IFSC Code:</span>
                    <span className="font-semibold font-mono">{selectedStaff.ifscCode || "—"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">PAN Card Number:</span>
                    <span className="font-semibold font-mono">{selectedStaff.panNo || "—"}</span>
                  </div>
                </div>
              </div>

              {/* Grid 4: Documents Repository */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <FileCheck className="size-3.5 text-primary" /> Employee Documents & Certifications
                  </h3>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs gap-1 border-primary/30 text-primary"
                    onClick={() => setAddDocModalOpen(true)}
                  >
                    <Plus className="size-3" /> Add Document
                  </Button>
                </div>

                {(!selectedStaff.documents || selectedStaff.documents.length === 0) ? (
                  <div className="rounded-lg border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                    No documents currently on file. Click &quot;Add Document&quot; to upload licenses or agreements.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedStaff.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between rounded-lg border border-border bg-card p-3 text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <span className="grid size-8 place-items-center rounded bg-primary/10 text-primary">
                            <FileText className="size-4" />
                          </span>
                          <div>
                            <div className="font-bold text-foreground">{doc.name}</div>
                            <div className="text-[11px] text-muted-foreground mt-0.5">
                              Type: {doc.type} {doc.documentNo && `· Ref: ${doc.documentNo}`}
                              {doc.expiryDate && ` · Valid Till: ${doc.expiryDate}`}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs gap-1.5 text-primary border-primary/30 hover:bg-primary/5 hover:text-primary font-medium"
                            onClick={() => handleOpenDocument(doc)}
                            title="Open / View Document"
                          >
                            <Eye className="size-3" /> Open
                          </Button>
                          <Badge
                            variant={doc.verificationStatus === "Verified" ? "default" : "outline"}
                            className="text-[10px] px-2 py-0.5"
                          >
                            {doc.verificationStatus}
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="size-7 p-0 text-destructive/70 hover:text-destructive"
                            onClick={() => handleRemoveDocument(doc.id, doc.name)}
                            title="Delete Document"
                          >
                            <Trash2 className="size-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <DialogFooter className="border-t border-border pt-4">
                <Button variant="outline" size="sm" onClick={() => setViewModalOpen(false)}>
                  Close
                </Button>
                <Button
                  size="sm"
                  className="gap-1.5"
                  onClick={() => {
                    setViewModalOpen(false);
                    handleOpenEdit(selectedStaff);
                  }}
                >
                  <Edit className="size-3.5" /> Edit Employee
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ======================================================== */}
      {/* MODAL 2: ADD / EDIT EMPLOYEE DETAILS                    */}
      {/* ======================================================== */}
      <Dialog open={formModalOpen} onOpenChange={setFormModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleSaveForm} className="space-y-4">
            <DialogHeader className="border-b border-border pb-3">
              <DialogTitle className="text-base font-bold">
                {isEditing ? `Edit Staff Member (${formData.id})` : "Add New Staff Member"}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Fill employee particulars, role, salary details, and joining information.
              </DialogDescription>
            </DialogHeader>

            {/* Section 1: Basic Particulars */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
                1. Personal Particulars
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                    Employee ID *
                  </label>
                  <Input
                    value={formData.id || ""}
                    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                    className="h-8 text-xs font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                    Full Name *
                  </label>
                  <Input
                    placeholder="e.g. Dr. Maya Bennett"
                    value={formData.name || ""}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="h-8 text-xs font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                    Mobile Phone *
                  </label>
                  <Input
                    placeholder="+91 98201 44910"
                    value={formData.phone || ""}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="h-8 text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    placeholder="name@sailorsmedical.com"
                    value={formData.email || ""}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="h-8 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                    Gender & DOB
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={formData.gender || "Male"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          gender: e.target.value as "Male" | "Female" | "Other",
                        })
                      }
                      className="h-8 rounded-md border border-input bg-background px-2 text-xs font-medium"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                    <Input
                      type="date"
                      value={formData.dob || "1990-01-01"}
                      onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                    Residential Address
                  </label>
                  <Input
                    placeholder="e.g. CBD Belapur, Navi Mumbai"
                    value={formData.address || ""}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Role & Employment */}
            <div className="space-y-3 pt-2 border-t border-border">
              <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
                2. Job Designation & Schedule
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                    Role / Designation *
                  </label>
                  <Input
                    placeholder="e.g. Cardiologist & TMT Specialist"
                    value={formData.role || ""}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="h-8 text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                    Department
                  </label>
                  <select
                    value={formData.department || "Medical & DG Examinations"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        department: e.target.value as StaffDepartment,
                      })
                    }
                    className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs font-medium"
                  >
                    {staffDepartments.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                    Joining Date *
                  </label>
                  <Input
                    type="date"
                    value={formData.joiningDate || ""}
                    onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                    className="h-8 text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                    Employment Status
                  </label>
                  <select
                    value={formData.status || "Active / On duty"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as StaffStatus,
                      })
                    }
                    className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs font-medium"
                  >
                    {staffStatuses.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                    Working Schedule / Shift
                  </label>
                  <Input
                    placeholder="e.g. Mon – Fri, 8:00 AM – 4:00 PM"
                    value={formData.schedule || ""}
                    onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Salary & Banking Details */}
            <div className="space-y-3 pt-2 border-t border-border">
              <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
                3. Salary & Banking Info
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                    Basic Salary (₹)
                  </label>
                  <Input
                    type="number"
                    value={formData.basicSalary ?? 0}
                    onChange={(e) =>
                      setFormData({ ...formData, basicSalary: Number(e.target.value) })
                    }
                    className="h-8 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                    Allowances (₹)
                  </label>
                  <Input
                    type="number"
                    value={formData.allowances ?? 0}
                    onChange={(e) =>
                      setFormData({ ...formData, allowances: Number(e.target.value) })
                    }
                    className="h-8 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                    Deductions (₹)
                  </label>
                  <Input
                    type="number"
                    value={formData.deductions ?? 0}
                    onChange={(e) =>
                      setFormData({ ...formData, deductions: Number(e.target.value) })
                    }
                    className="h-8 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                    PAN Card No
                  </label>
                  <Input
                    placeholder="ABCDE1234F"
                    value={formData.panNo || ""}
                    onChange={(e) => setFormData({ ...formData, panNo: e.target.value.toUpperCase() })}
                    className="h-8 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                    Bank Name
                  </label>
                  <Input
                    placeholder="e.g. HDFC Bank"
                    value={formData.bankName || ""}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                    className="h-8 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                    Account No & IFSC
                  </label>
                  <Input
                    placeholder="Acc No / IFSC"
                    value={formData.bankAccountNo || ""}
                    onChange={(e) => setFormData({ ...formData, bankAccountNo: e.target.value })}
                    className="h-8 text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="border-t border-border pt-4">
              <Button type="button" variant="outline" size="sm" onClick={() => setFormModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                {isEditing ? "Save Changes" : "Create Employee Record"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ======================================================== */}
      {/* MODAL 3: RECORD RESIGNATION & EXIT                      */}
      {/* ======================================================== */}
      <Dialog open={resignationModalOpen} onOpenChange={setResignationModalOpen}>
        <DialogContent className="max-w-md">
          <div className="space-y-4">
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2 text-amber-700 dark:text-amber-400">
                <UserX className="size-4" /> Record Employee Resignation
              </DialogTitle>
              <DialogDescription className="text-xs">
                Process exit formalities for {resignationStaff?.name} ({resignationStaff?.id}).
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                  Resignation Tendered Date *
                </label>
                <Input
                  type="date"
                  value={resignationDate}
                  onChange={(e) => setResignationDate(e.target.value)}
                  className="h-8 text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                  Final Relieving / Exit Date *
                </label>
                <Input
                  type="date"
                  value={relievingDate}
                  onChange={(e) => setRelievingDate(e.target.value)}
                  className="h-8 text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                  Reason for Leaving
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Relocated to another city / higher studies / career transition"
                  value={resignationReason}
                  onChange={(e) => setResignationReason(e.target.value)}
                  className="w-full rounded-md border border-input bg-background p-2 text-xs"
                />
              </div>
            </div>

            <DialogFooter className="border-t border-border pt-4">
              <Button variant="outline" size="sm" onClick={() => setResignationModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleConfirmResignation}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                Confirm Resignation
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* ======================================================== */}
      {/* MODAL 4: ADD DOCUMENT MODAL                             */}
      {/* ======================================================== */}
      <Dialog open={addDocModalOpen} onOpenChange={setAddDocModalOpen}>
        <DialogContent className="max-w-md">
          <div className="space-y-4">
            <DialogHeader>
              <DialogTitle className="text-sm font-bold flex items-center gap-2">
                <FileCheck className="size-4 text-primary" /> Add Staff Document
              </DialogTitle>
              <DialogDescription className="text-xs">
                Upload medical license, degree, Aadhaar, or employment contract.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                  Document Title *
                </label>
                <Input
                  placeholder="e.g. DG Shipping Medical Approval Certificate"
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                  className="h-8 text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                  Document Category
                </label>
                <select
                  value={newDocType}
                  onChange={(e) => setNewDocType(e.target.value as DocumentType)}
                  className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs font-medium"
                >
                  {documentTypes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                  Certificate / Registration Number
                </label>
                <Input
                  placeholder="e.g. DG-MED-MUM-2024-091"
                  value={newDocNo}
                  onChange={(e) => setNewDocNo(e.target.value)}
                  className="h-8 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                  Expiry / Renewal Date (Optional)
                </label>
                <Input
                  type="date"
                  value={newDocExpiry}
                  onChange={(e) => setNewDocExpiry(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                  Upload Document File (PDF or Image)
                </label>
                <div className="rounded-lg border-2 border-dashed border-border/80 p-3 text-center hover:border-primary/50 transition-colors bg-muted/20">
                  <input
                    type="file"
                    id="staff-doc-upload"
                    accept="image/*,application/pdf"
                    onChange={handleDocFileSelect}
                    className="hidden"
                  />
                  <label
                    htmlFor="staff-doc-upload"
                    className="flex flex-col items-center justify-center cursor-pointer gap-1.5"
                  >
                    <Upload className="size-5 text-primary" />
                    <span className="text-xs font-semibold text-foreground">
                      {newDocFileName ? newDocFileName : "Click to select document file"}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {newDocFileName
                        ? `${newDocFileSize} KB · Ready to verify & store`
                        : "Supports PDF, JPG, PNG up to 8MB"}
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <DialogFooter className="border-t border-border pt-4">
              <Button variant="outline" size="sm" onClick={() => setAddDocModalOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleAddDocument}>
                Verify & Attach Document
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* ======================================================== */}
      {/* MODAL 5: STAFF DOCUMENT VIEWER                          */}
      {/* ======================================================== */}
      <Dialog open={docViewerOpen} onOpenChange={setDocViewerOpen}>
        <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto">
          {viewingDoc && selectedStaff && (
            <div className="space-y-4">
              <DialogHeader className="border-b border-border pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
                      <FileCheck className="size-5" />
                    </span>
                    <div>
                      <DialogTitle className="text-base font-bold flex items-center gap-2">
                        <span>{viewingDoc.name}</span>
                        <Badge variant="outline" className="text-[10px]">
                          {viewingDoc.type}
                        </Badge>
                      </DialogTitle>
                      <DialogDescription className="text-xs">
                        Personnel: {selectedStaff.name} ({selectedStaff.id}) · {selectedStaff.role}
                      </DialogDescription>
                    </div>
                  </div>
                  <Badge
                    variant={viewingDoc.verificationStatus === "Verified" ? "default" : "outline"}
                    className="self-start sm:self-auto text-xs"
                  >
                    {viewingDoc.verificationStatus}
                  </Badge>
                </div>
              </DialogHeader>

              {/* Document Content View */}
              <div className="rounded-xl border border-border bg-muted/20 p-4">
                {viewingDoc.fileData ? (
                  viewingDoc.fileType?.includes("pdf") ? (
                    <div className="space-y-2">
                      <iframe
                        src={viewingDoc.fileData}
                        title={viewingDoc.name}
                        className="w-full h-[60vh] rounded-lg border bg-white shadow-xs"
                      />
                      <div className="flex justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs gap-1.5"
                          onClick={() => {
                            const win = window.open();
                            win?.document.write(
                              `<iframe src="${viewingDoc.fileData}" frameborder="0" style="border:0; top:0; left:0; bottom:0; right:0; width:100%; height:100%;" allowfullscreen></iframe>`
                            );
                          }}
                        >
                          <ExternalLink className="size-3.5" /> Open PDF in Full Window
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center space-y-3">
                      <img
                        src={viewingDoc.fileData}
                        alt={viewingDoc.name}
                        className="max-h-[60vh] mx-auto rounded-lg border bg-white shadow-sm object-contain"
                      />
                      <div className="flex justify-center">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs gap-1.5"
                          onClick={() => {
                            const win = window.open();
                            win?.document.write(
                              `<img src="${viewingDoc.fileData}" style="max-width:100%; height:auto; margin:20px auto; display:block;" />`
                            );
                          }}
                        >
                          <ExternalLink className="size-3.5" /> View Full Image
                        </Button>
                      </div>
                    </div>
                  )
                ) : (
                  /* Verified Digital Certificate Template for on-file credentials */
                  <div className="rounded-lg border-2 border-primary/20 bg-background p-6 shadow-sm print:border-none print:shadow-none space-y-5">
                    {/* Official Letterhead */}
                    <div className="flex items-center justify-between border-b-2 border-primary/30 pb-4">
                      <div className="flex items-center gap-3">
                        <ClinicLogo size="md" showText={true} />
                      </div>
                      <div className="text-right text-[10px] text-muted-foreground leading-tight">
                        <div className="font-bold text-foreground">D.G. Shipping Approved Centre</div>
                        <div>ISO 9001:2015 & ISO 45001:2018</div>
                        <div>Reg No: DG-MUM-SMC-04</div>
                      </div>
                    </div>

                    <div className="text-center space-y-1 py-2">
                      <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider text-primary border-primary/40">
                        OFFICIAL VERIFIED PERSONNEL RECORD
                      </Badge>
                      <h2 className="text-xl font-bold text-foreground">
                        {viewingDoc.name}
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        Category: {viewingDoc.type}
                      </p>
                    </div>

                    {/* Meta Table */}
                    <div className="grid grid-cols-2 gap-3 rounded-lg border border-border bg-muted/30 p-4 text-xs">
                      <div>
                        <span className="text-[11px] text-muted-foreground block">Employee / Holder:</span>
                        <span className="font-bold text-foreground">{selectedStaff.name}</span>
                      </div>
                      <div>
                        <span className="text-[11px] text-muted-foreground block">Employee ID:</span>
                        <span className="font-mono font-semibold text-foreground">{selectedStaff.id}</span>
                      </div>
                      <div>
                        <span className="text-[11px] text-muted-foreground block">Clinical Role:</span>
                        <span className="font-medium text-foreground">{selectedStaff.role}</span>
                      </div>
                      <div>
                        <span className="text-[11px] text-muted-foreground block">Department:</span>
                        <span className="font-medium text-foreground">{selectedStaff.department}</span>
                      </div>
                      <div>
                        <span className="text-[11px] text-muted-foreground block">Certificate / Ref Number:</span>
                        <span className="font-mono font-bold text-primary">
                          {viewingDoc.documentNo || `SMC-${viewingDoc.id}`}
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] text-muted-foreground block">Issued / Active Since:</span>
                        <span className="font-medium text-foreground">{viewingDoc.issuedDate || selectedStaff.joiningDate}</span>
                      </div>
                      {viewingDoc.expiryDate && (
                        <div>
                          <span className="text-[11px] text-muted-foreground block">Valid Till / Renewal:</span>
                          <span className="font-medium text-foreground">{viewingDoc.expiryDate}</span>
                        </div>
                      )}
                      <div>
                        <span className="text-[11px] text-muted-foreground block">Audit Verification:</span>
                        <span className="font-bold text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 className="size-3.5" /> Digitally Verified
                        </span>
                      </div>
                    </div>

                    {/* Official Stamp & Sign */}
                    <div className="flex items-center justify-between border-t border-border pt-4 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="grid size-9 place-items-center rounded-full bg-emerald-500/10 text-emerald-600">
                          <ShieldCheck className="size-5" />
                        </span>
                        <div>
                          <div className="font-bold text-foreground">Sailor&apos;s Medical Clinic Seal</div>
                          <div className="text-[10px] text-muted-foreground">CBD Belapur, Navi Mumbai, India</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-serif italic font-bold text-foreground text-sm">Dr. Mitali Gadge</div>
                        <div className="text-[10px] text-muted-foreground">Chief Medical Administrator</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => window.print()}
                  className="gap-1.5 text-xs"
                >
                  <Printer className="size-3.5" /> Print / Save PDF
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setDocViewerOpen(false)}
                  className="text-xs"
                >
                  Close Document
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
