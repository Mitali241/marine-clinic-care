import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  Filter,
  Phone,
  RefreshCw,
  Search,
  ShieldCheck,
  Ship,
  Star,
  User,
  Trash2,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  listFeedbackServer,
  updateFeedbackStatusServer,
  deleteFeedbackServer,
} from "@/lib/clinic.server";
import { exportGrievancesToExcel, exportGrievancesToCSV } from "@/lib/excel-export";
import {
  feedbackQuestions,
  feedbackStatuses,
  type FeedbackRecord,
  type FeedbackStatus,
  type RatingScale,
} from "@/lib/feedback";

interface FeedbackAdminModuleProps {
  onNotice: (msg: string) => void;
}

export function FeedbackAdminModule({ onNotice }: FeedbackAdminModuleProps) {
  const [records, setRecords] = useState<FeedbackRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Detail & Resolution Modal
  const [selectedRecord, setSelectedRecord] = useState<FeedbackRecord | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editStatus, setEditStatus] = useState<FeedbackStatus>("New");
  const [resolutionRemarks, setResolutionRemarks] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<FeedbackRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchFeedback = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");
    try {
      const data = await listFeedbackServer();
      setRecords(data);
    } catch (err) {
      console.error("Failed to load feedback from MongoDB:", err);
      setLoadError("Failed to load records from MongoDB Atlas. Please check network connection.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchFeedback();
  }, [fetchFeedback]);

  // Auto-refresh when the tab/window regains focus so newly submitted
  // grievances from the public portal appear without a manual reload.
  useEffect(() => {
    const onFocus = () => void fetchFeedback();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [fetchFeedback]);

  const filteredRecords = useMemo(() => {
    const q = search.trim().toLowerCase();
    return records.filter((r) => {
      const matchesSearch =
        !q ||
        `${r.id} ${r.name} ${r.companyName || ""} ${r.rank || ""} ${r.passportOrCdcNo || ""} ${r.indosNo || ""} ${r.mobileNo} ${r.email || ""} ${r.suggestionsComments || ""}`
          .toLowerCase()
          .includes(q);

      const matchesStatus =
        statusFilter === "all" || r.status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [records, search, statusFilter]);

  // Overall statistics
  const totalCount = records.length;
  const resolvedCount = records.filter((r) => r.status === "Resolved").length;
  const underReviewCount = records.filter((r) => r.status === "Under Review").length;
  const newCount = records.filter((r) => r.status === "New").length;

  function handleOpenDetail(record: FeedbackRecord) {
    setSelectedRecord(record);
    setEditStatus(record.status);
    setResolutionRemarks(record.resolutionRemarks || "");
    setDialogOpen(true);
  }

  async function handleSaveStatus() {
    if (!selectedRecord) return;
    setIsUpdating(true);
    try {
      const res = await updateFeedbackStatusServer({
        data: {
          id: selectedRecord.id,
          status: editStatus,
          resolutionRemarks: resolutionRemarks.trim(),
        },
      });

      if (!res.success) {
        onNotice(res.message || "Failed to update record in MongoDB.");
        return;
      }

      setRecords((prev) =>
        prev.map((item) =>
          item.id === selectedRecord.id
            ? {
                ...item,
                status: editStatus,
                resolutionRemarks: resolutionRemarks.trim(),
                resolvedAt:
                  editStatus === "Resolved" ? new Date().toISOString() : item.resolvedAt,
              }
            : item,
        ),
      );

      setDialogOpen(false);
      onNotice(`Feedback ${selectedRecord.id} marked as ${editStatus}. Stored in MongoDB.`);
    } catch (err) {
      console.error("Failed to update status in MongoDB:", err);
      onNotice("Could not update record status in MongoDB.");
    } finally {
      setIsUpdating(false);
    }
  }

  function handlePromptDelete(record: FeedbackRecord) {
    setRecordToDelete(record);
    setDeleteDialogOpen(true);
  }

  async function handleConfirmDelete() {
    if (!recordToDelete) return;
    setIsDeleting(true);
    try {
      const res = await deleteFeedbackServer({ data: { id: recordToDelete.id } });
      if (!res.success) {
        onNotice(res.message || "Failed to delete feedback record.");
        return;
      }
      setRecords((prev) => prev.filter((r) => r.id !== recordToDelete.id));
      setDeleteDialogOpen(false);
      setDialogOpen(false);
      onNotice(`Feedback record #${recordToDelete.id} from ${recordToDelete.name} has been permanently deleted.`);
      setRecordToDelete(null);
    } catch (err) {
      console.error("Failed to delete feedback record:", err);
      onNotice("Could not delete record from MongoDB.");
    } finally {
      setIsDeleting(false);
    }
  }

  function handleExportExcel() {
    if (!filteredRecords.length) {
      onNotice("No feedback records to export.");
      return;
    }
    exportGrievancesToExcel(filteredRecords);
    onNotice(`Downloaded Sailor's Medical Clinic Excel file with ${filteredRecords.length} records.`);
  }

  function handleExportCSV() {
    if (!filteredRecords.length) {
      onNotice("No feedback records to export.");
      return;
    }
    exportGrievancesToCSV(filteredRecords);
    onNotice(`Downloaded CSV file with ${filteredRecords.length} records.`);
  }

  return (
    <div className="space-y-5">
      {/* Clinic Header Banner */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3.5">
            <span className="grid size-11 place-items-center rounded-lg bg-primary/10 text-primary">
              <Ship className="size-6" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-foreground">
                  Sailor's Medical Clinic · Candidate Feedback Registry
                </h1>
                <Badge variant="outline" className="text-[10px] font-mono">
                  D.G. Shipping Approved
                </Badge>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Shop No. 21, Punit Tower - 1, CBD Belapur, Navi Mumbai • Mob: +91 95614 50104 • Email: medical@sailorsmedical.com
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              className="gap-1.5 text-xs"
            >
              <Download className="size-3.5" /> Export CSV
            </Button>
            <Button
              size="sm"
              onClick={handleExportExcel}
              className="gap-1.5 bg-emerald-600 text-xs font-semibold text-white hover:bg-emerald-700 shadow-xs"
            >
              <FileSpreadsheet className="size-3.5" /> Download in Excel (.xlsx)
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Total Candidate Responses"
          value={String(totalCount)}
          note="Stored in MongoDB Atlas"
          icon={FileText}
          accent="text-primary"
        />
        <MetricCard
          label="New Submissions"
          value={String(newCount)}
          note="Awaiting review"
          icon={AlertCircle}
          accent="text-blue-500"
        />
        <MetricCard
          label="Under Review"
          value={String(underReviewCount)}
          note="Clinical supervisor audit"
          icon={Clock}
          accent="text-amber-500"
        />
        <MetricCard
          label="Resolved / Filed"
          value={String(resolvedCount)}
          note={`${totalCount ? Math.round((resolvedCount / totalCount) * 100) : 100}% compliance rate`}
          icon={CheckCircle2}
          accent="text-emerald-600"
        />
      </div>

      {/* Table Section */}
      <section className="rounded-md border border-border bg-card shadow-xs">
        {/* Table Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/20 px-4 py-3 sm:px-5">
          <div className="relative min-w-[220px] flex-1 sm:max-w-xs">
            <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
            <Input
              aria-label="Search feedback"
              placeholder="Search candidate, company, INDOS, CDC..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 pl-8 text-xs"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              aria-label="Filter by status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-8 rounded-md border border-input bg-background px-2 text-xs"
            >
              <option value="all">All Statuses</option>
              {feedbackStatuses.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => void fetchFeedback()}
              className="h-8 gap-1.5 px-3 text-xs text-muted-foreground hover:text-foreground"
              title="Refresh from MongoDB"
            >
              <RefreshCw className={`size-3.5 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        {loadError && (
          <div
            role="alert"
            className="flex items-center justify-between border-b border-destructive/20 bg-destructive/10 px-4 py-2 text-xs text-destructive sm:px-5"
          >
            <span>{loadError}</span>
            <Button variant="outline" size="sm" onClick={() => void fetchFeedback()}>
              Retry
            </Button>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-5">Token / Date</TableHead>
                <TableHead>Candidate & Rank</TableHead>
                <TableHead>Company</TableHead>
                <TableHead className="hidden md:table-cell">CDC / INDOS</TableHead>
                <TableHead>Doctor & Staff Rating</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="pr-5 text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-28 text-center text-xs text-muted-foreground"
                  >
                    Loading Sailor's Medical Clinic feedback from MongoDB...
                  </TableCell>
                </TableRow>
              ) : filteredRecords.length ? (
                filteredRecords.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="whitespace-nowrap pl-5 text-xs font-semibold">
                      <div className="font-mono text-primary">{r.id}</div>
                      <div className="text-[10px] font-normal text-muted-foreground">{r.date}</div>
                    </TableCell>
                    <TableCell className="text-xs">
                      <div className="font-semibold text-foreground">{r.name}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {r.rank || "Seafarer"} • {r.mobileNo}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs font-medium">
                      {r.companyName || "Private Candidate"}
                    </TableCell>
                    <TableCell className="hidden text-xs text-muted-foreground md:table-cell font-mono">
                      <div>CDC: {r.passportOrCdcNo || "N/A"}</div>
                      <div className="text-[10px]">INDOS: {r.indosNo || "N/A"}</div>
                    </TableCell>
                    <TableCell className="text-xs">
                      <div className="flex flex-wrap gap-1">
                        <RatingPill label="Doctor" val={r.interactionWithDoctor} />
                        <RatingPill label="Staff" val={r.friendlinessMedicalStaff} />
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={r.status} />
                    </TableCell>
                    <TableCell className="pr-5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDetail(r)}
                          className="h-8 gap-1 px-2.5 text-xs font-medium text-primary hover:bg-primary/10"
                        >
                          <Eye className="size-3.5" /> View Form
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePromptDelete(r)}
                          className="size-8 p-0 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                          title="Delete Grievance Record"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-28 text-center text-xs text-muted-foreground"
                  >
                    {records.length
                      ? "No records match the current search filters."
                      : "No candidate feedback forms have been submitted yet."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between border-t border-border px-4 py-3 text-xs text-muted-foreground sm:px-5">
          <span>
            Showing {filteredRecords.length} of {records.length} feedback responses
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="size-3.5 text-emerald-600" />
            Connected to MongoDB Atlas
          </span>
        </div>
      </section>

      {/* Full Sheet Detail Modal */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between gap-2 pr-6">
              <span>Candidate Feedback Sheet</span>
              {selectedRecord && (
                <span className="font-mono text-xs font-bold text-primary">
                  {selectedRecord.id}
                </span>
              )}
            </DialogTitle>
            <DialogDescription>
              Exact submission copy as filled by the candidate at Sailor's Medical Clinic.
            </DialogDescription>
          </DialogHeader>

          {selectedRecord && (
            <div className="space-y-4 pt-2 text-xs">
              {/* Candidate Info Box */}
              <div className="grid gap-3 rounded-lg border border-border bg-muted/30 p-4 sm:grid-cols-2">
                <div>
                  <span className="text-muted-foreground">Candidate Name:</span>
                  <div className="font-semibold text-foreground text-sm">{selectedRecord.name}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Date:</span>
                  <div className="font-semibold text-foreground">{selectedRecord.date}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Company Name:</span>
                  <div className="font-semibold text-foreground">
                    {selectedRecord.companyName || "N/A"}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Rank:</span>
                  <div className="font-semibold text-foreground">{selectedRecord.rank || "N/A"}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Passport or CDC No:</span>
                  <div className="font-mono font-semibold text-foreground">
                    {selectedRecord.passportOrCdcNo || "N/A"}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Indos No:</span>
                  <div className="font-mono font-semibold text-foreground">
                    {selectedRecord.indosNo || "N/A"}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Mobile No:</span>
                  <div className="font-semibold text-foreground">{selectedRecord.mobileNo}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Email Add:</span>
                  <div className="font-semibold text-foreground">{selectedRecord.email || "N/A"}</div>
                </div>
              </div>

              {/* The 8 Criteria Table */}
              <div className="rounded-lg border border-border p-3 space-y-2">
                <span className="font-bold text-muted-foreground uppercase text-[10px] tracking-wider">
                  8-Point Evaluation Checklist:
                </span>
                <div className="divide-y divide-border">
                  {feedbackQuestions.map((q) => {
                    const score = selectedRecord[q.id as keyof FeedbackRecord] as RatingScale;
                    return (
                      <div
                        key={q.id}
                        className="flex items-center justify-between py-2 text-xs"
                      >
                        <span className="text-foreground">{q.label}</span>
                        <ScoreBadge val={score} />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Suggestions / Comments */}
              <div className="rounded-lg border border-border p-3.5 bg-card">
                <span className="font-bold text-muted-foreground text-[11px]">
                  Suggestions / Comments:
                </span>
                <p className="mt-1 whitespace-pre-wrap text-xs text-foreground italic">
                  "{selectedRecord.suggestionsComments || "No additional comments provided."}"
                </p>
                <div className="mt-3 text-right text-[11px] text-muted-foreground">
                  Signature: <span className="font-serif italic font-bold text-foreground">{selectedRecord.candidateSignature || selectedRecord.name}</span>
                </div>
              </div>

              {/* Resolution Action Section */}
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-3">
                <span className="text-xs font-bold text-foreground">
                  Official Administrative Review & Action
                </span>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Record Status</label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value as FeedbackStatus)}
                      className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      {feedbackStatuses.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium">Reviewing Authority</label>
                    <Input
                      readOnly
                      value="D.G. Approved Medical Officer"
                      className="h-9 text-xs bg-muted/40 cursor-default"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium">Official Resolution Remarks</label>
                  <textarea
                    rows={2}
                    value={resolutionRemarks}
                    onChange={(e) => setResolutionRemarks(e.target.value)}
                    placeholder="Enter resolution notes, clinic corrective action or acknowledgment..."
                    className="w-full rounded-md border border-input bg-background p-2.5 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-border pt-4">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => {
                if (selectedRecord) handlePromptDelete(selectedRecord);
              }}
              disabled={isUpdating || isDeleting}
              className="gap-1.5 bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground border border-destructive/30"
            >
              <Trash2 className="size-3.5" /> Delete Record
            </Button>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDialogOpen(false)}
                disabled={isUpdating || isDeleting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleSaveStatus}
                disabled={isUpdating || isDeleting}
                className="gap-1.5"
              >
                {isUpdating ? "Saving to MongoDB..." : "Save Status to MongoDB"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog for Permanent Record Deletion */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="size-5" />
              <DialogTitle className="text-base font-bold">Delete Grievance Record?</DialogTitle>
            </div>
            <DialogDescription className="text-xs pt-1 leading-relaxed">
              Are you sure you want to delete grievance record{" "}
              <span className="font-mono font-bold text-foreground">{recordToDelete?.id}</span>{" "}
              submitted by{" "}
              <span className="font-bold text-foreground">{recordToDelete?.name}</span>?
              <br />
              This action cannot be undone and will permanently remove this record from MongoDB Atlas.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 pt-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="gap-1.5"
            >
              <Trash2 className="size-3.5" />
              {isDeleting ? "Deleting..." : "Permanently Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ScoreBadge({ val }: { val: RatingScale }) {
  if (val === "Excellent") {
    return (
      <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
        Excellent
      </span>
    );
  }
  if (val === "Good") {
    return (
      <span className="inline-flex rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
        Good
      </span>
    );
  }
  if (val === "Avg") {
    return (
      <span className="inline-flex rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
        Avg
      </span>
    );
  }
  return (
    <span className="inline-flex rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-700 dark:bg-red-950/40 dark:text-red-300">
      Below Avg
    </span>
  );
}

function RatingPill({ label, val }: { label: string; val: RatingScale }) {
  return (
    <span className="inline-flex items-center gap-1 rounded bg-muted/60 px-1.5 py-0.5 text-[10px] text-muted-foreground">
      <span>{label}:</span>
      <span
        className={`font-bold ${
          val === "Excellent"
            ? "text-emerald-600"
            : val === "Good"
              ? "text-blue-600"
              : val === "Avg"
                ? "text-amber-600"
                : "text-red-600"
        }`}
      >
        {val}
      </span>
    </span>
  );
}

function StatusBadge({ status }: { status: FeedbackStatus }) {
  switch (status) {
    case "Resolved":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
          <CheckCircle2 className="size-3" /> Resolved
        </span>
      );
    case "Under Review":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
          <Clock className="size-3" /> Under Review
        </span>
      );
    case "Archived":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
          Archived
        </span>
      );
    case "New":
    default:
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
          <AlertCircle className="size-3" /> New
        </span>
      );
  }
}

function MetricCard({
  label,
  value,
  note,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  note: string;
  icon: typeof FileText;
  accent: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-xs">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <span className={`grid size-8 place-items-center rounded bg-muted/60 ${accent}`}>
          <Icon className="size-4" />
        </span>
      </div>
      <p className="mt-3 text-2xl font-bold font-mono text-foreground">{value}</p>
      <p className="mt-1 text-[11px] text-muted-foreground">{note}</p>
    </div>
  );
}
