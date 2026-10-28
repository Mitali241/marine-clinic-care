import { useState, useEffect } from "react";
import {
  ShieldCheck,
  User,
  Mail,
  Phone,
  Briefcase,
  FileBadge,
  Building,
  Save,
  CheckCircle2,
  AlertCircle,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface UserProfileData {
  id?: string;
  name: string;
  email: string;
  role: "admin" | "staff";
  phone?: string;
  designation?: string;
  regNo?: string;
  department?: string;
}

interface AdminProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUser: UserProfileData;
  onProfileUpdated: (updated: UserProfileData) => void;
  onNotice: (msg: string) => void;
}

export function AdminProfileModal({
  open,
  onOpenChange,
  currentUser,
  onProfileUpdated,
  onNotice,
}: AdminProfileModalProps) {
  const [name, setName] = useState(currentUser.name);
  const [phone, setPhone] = useState(currentUser.phone || "");
  const [designation, setDesignation] = useState(currentUser.designation || "");
  const [regNo, setRegNo] = useState(currentUser.regNo || "");
  const [department, setDepartment] = useState(currentUser.department || "");
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Sync form state when modal opens or user prop changes
  useEffect(() => {
    if (open) {
      setName(currentUser.name || "");
      setPhone(currentUser.phone || "");
      setDesignation(
        currentUser.designation ||
          (currentUser.role === "admin"
            ? "Chief Medical Administrator & Director"
            : "Clinical Coordinator")
      );
      setRegNo(
        currentUser.regNo ||
          (currentUser.role === "admin"
            ? "MMC-2015-84920 / DG-SMC-04"
            : "NUR-2019-3381")
      );
      setDepartment(
        currentUser.department || "Marine Medical Examination & DG Shipping Care"
      );
      setErrorMsg("");
    }
  }, [open, currentUser]);

  const initials =
    name
      .trim()
      .split(" ")
      .filter(Boolean)
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || (currentUser.role === "admin" ? "MG" : "RA");

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Please enter the administrator full name.");
      return;
    }

    setIsSaving(true);
    setErrorMsg("");

    try {
      const response = await fetch("/api/auth/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          designation: designation.trim(),
          regNo: regNo.trim(),
          department: department.trim(),
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message || "Failed to update admin profile.");
      }

      const resData = (await response.json()) as { success: boolean; user: UserProfileData };
      const updated: UserProfileData = {
        ...currentUser,
        name: name.trim(),
        phone: phone.trim(),
        designation: designation.trim(),
        regNo: regNo.trim(),
        department: department.trim(),
        ...resData.user,
      };

      onProfileUpdated(updated);
      onNotice("Admin profile credentials updated and saved to MongoDB.");
      onOpenChange(false);
    } catch (err) {
      console.error("Failed to update profile:", err);
      setErrorMsg(err instanceof Error ? err.message : "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
              <ShieldCheck className="size-5" />
            </span>
            <div>
              <DialogTitle className="text-lg font-semibold">
                Edit {currentUser.role === "admin" ? "Admin" : "User"} Profile
              </DialogTitle>
              <DialogDescription className="text-xs">
                Manage your profile identity, professional credentials, and medical licenses for Sailor's Medical Clinic.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Live Profile Card Preview */}
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="size-16 ring-2 ring-primary/30">
                <AvatarFallback className="bg-primary text-primary-foreground text-lg font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-foreground">
                    {name || "Administrator"}
                  </h3>
                  <Badge variant="default" className="text-[10px] uppercase font-semibold">
                    {currentUser.role}
                  </Badge>
                </div>
                <p className="text-xs text-primary font-medium mt-0.5">
                  {designation || "Medical Administrator"}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1.5">
                  <Mail className="size-3" /> {currentUser.email}
                  {phone ? (
                    <>
                      <span>•</span>
                      <Phone className="size-3" /> {phone}
                    </>
                  ) : null}
                </p>
              </div>
            </div>

            {regNo && (
              <div className="rounded-lg border border-border/80 bg-background/80 p-2.5 text-right sm:text-right">
                <span className="block text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                  Council / DG Lic.
                </span>
                <span className="text-xs font-mono font-semibold text-foreground">
                  {regNo}
                </span>
              </div>
            )}
          </div>
        </div>

        {errorMsg && (
          <div
            role="alert"
            className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive"
          >
            <AlertCircle className="size-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4 pt-1">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="admin-full-name" className="text-xs font-semibold">
                Full Name <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <User className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                <Input
                  id="admin-full-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dr. Mitali Gadge"
                  className="pl-9 text-xs"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="admin-email" className="text-xs font-semibold">
                Official Email (Login ID)
              </Label>
              <div className="relative">
                <Mail className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                <Input
                  id="admin-email"
                  value={currentUser.email}
                  readOnly
                  disabled
                  className="pl-9 text-xs bg-muted/50 cursor-not-allowed"
                />
              </div>
              <p className="text-[10px] text-muted-foreground">
                Configured via clinic security credentials.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="admin-phone" className="text-xs font-semibold">
                Mobile / Contact Number
              </Label>
              <div className="relative">
                <Phone className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                <Input
                  id="admin-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 95614 50104"
                  className="pl-9 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="admin-designation" className="text-xs font-semibold">
                Designation / Professional Title
              </Label>
              <div className="relative">
                <Briefcase className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                <Input
                  id="admin-designation"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  placeholder="e.g. Chief Medical Officer / Clinic Administrator"
                  className="pl-9 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="admin-regNo" className="text-xs font-semibold">
                Medical Council / D.G. Shipping Reg. No.
              </Label>
              <div className="relative">
                <FileBadge className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                <Input
                  id="admin-regNo"
                  value={regNo}
                  onChange={(e) => setRegNo(e.target.value)}
                  placeholder="e.g. MMC-2015-84920 / DG-SMC-04"
                  className="pl-9 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="admin-dept" className="text-xs font-semibold">
                Department / Clinical Division
              </Label>
              <div className="relative">
                <Building className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                <Input
                  id="admin-dept"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Marine Medical & Health Examination"
                  className="pl-9 text-xs"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 pt-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSaving}
              className="gap-1.5 bg-primary text-primary-foreground"
            >
              <Save className="size-3.5" />
              {isSaving ? "Saving to MongoDB..." : "Save Profile Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

