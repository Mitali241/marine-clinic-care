export type ClinicRole = "admin" | "staff";

export type ClinicSection =
  | "dashboard"
  | "patients"
  | "invoices"
  | "payments"
  | "staff"
  | "reports"
  | "activity"
  | "settings";

export const clinicSections: Array<{ id: ClinicSection; label: string; group: string }> = [
  { id: "dashboard", label: "Dashboard", group: "Workspace" },
  { id: "patients", label: "Patient Records", group: "Workspace" },
  { id: "invoices", label: "Invoices", group: "Workspace" },
  { id: "payments", label: "Payments", group: "Workspace" },
  { id: "staff", label: "Staff Management", group: "Clinic administration" },
  { id: "reports", label: "Reports", group: "Clinic administration" },
  { id: "activity", label: "Activity Logs", group: "Clinic administration" },
  { id: "settings", label: "Settings", group: "Clinic administration" },
];

const staffSections: ClinicSection[] = [
  "dashboard",
  "patients",
  "invoices",
  "payments",
  "reports",
];

export function getVisibleSections(role: ClinicRole) {
  return clinicSections.filter((section) => role === "admin" || staffSections.includes(section.id));
}

export function canAccessSection(role: ClinicRole, section: ClinicSection) {
  return role === "admin" || staffSections.includes(section);
}

export type PatientRecord = {
  id: string;
  name: string;
  initials: string;
  age: number;
  gender: string;
  phone: string;
  email: string;
  lastVisit: string;
  nextVisit: string;
  condition: string;
  status: "Active" | "Follow-up" | "New";
};

export const initialPatients: PatientRecord[] = [
  { id: "PT-2408", name: "Amara Johnson", initials: "AJ", age: 34, gender: "Female", phone: "+1 (212) 555-0148", email: "amara.j@email.com", lastVisit: "Oct 21, 2026", nextVisit: "Oct 28, 2026", condition: "Routine checkup", status: "Active" },
  { id: "PT-2407", name: "Noah Williams", initials: "NW", age: 52, gender: "Male", phone: "+1 (212) 555-0196", email: "noah.w@email.com", lastVisit: "Oct 21, 2026", nextVisit: "Oct 24, 2026", condition: "Cardiology", status: "Follow-up" },
  { id: "PT-2406", name: "Sofia Patel", initials: "SP", age: 28, gender: "Female", phone: "+1 (212) 555-0113", email: "sofia.p@email.com", lastVisit: "Oct 20, 2026", nextVisit: "Oct 29, 2026", condition: "Dermatology", status: "Active" },
  { id: "PT-2405", name: "Ethan Chen", initials: "EC", age: 41, gender: "Male", phone: "+1 (212) 555-0177", email: "ethan.c@email.com", lastVisit: "Oct 20, 2026", nextVisit: "Oct 23, 2026", condition: "Physical therapy", status: "Follow-up" },
  { id: "PT-2404", name: "Olivia Martinez", initials: "OM", age: 19, gender: "Female", phone: "+1 (212) 555-0144", email: "olivia.m@email.com", lastVisit: "Oct 19, 2026", nextVisit: "Nov 02, 2026", condition: "General medicine", status: "New" },
  { id: "PT-2403", name: "Liam Thompson", initials: "LT", age: 67, gender: "Male", phone: "+1 (212) 555-0182", email: "liam.t@email.com", lastVisit: "Oct 19, 2026", nextVisit: "Oct 26, 2026", condition: "Cardiology", status: "Active" },
];

export const invoiceRecords = [
  { id: "INV-2026-084", patient: "Amara Johnson", date: "Oct 21, 2026", amount: "$240.00", status: "Paid" },
  { id: "INV-2026-083", patient: "Noah Williams", date: "Oct 21, 2026", amount: "$480.00", status: "Pending" },
  { id: "INV-2026-082", patient: "Sofia Patel", date: "Oct 20, 2026", amount: "$185.00", status: "Paid" },
  { id: "INV-2026-081", patient: "Ethan Chen", date: "Oct 20, 2026", amount: "$320.00", status: "Overdue" },
  { id: "INV-2026-080", patient: "Olivia Martinez", date: "Oct 19, 2026", amount: "$125.00", status: "Pending" },
  { id: "INV-2026-079", patient: "Liam Thompson", date: "Oct 19, 2026", amount: "$560.00", status: "Paid" },
];

export const paymentRecords = [
  { id: "TXN-50941", patient: "Amara Johnson", method: "Visa •••• 4829", date: "Today, 10:42 AM", amount: "$240.00", status: "Completed" },
  { id: "TXN-50940", patient: "Sofia Patel", method: "Mastercard •••• 9017", date: "Today, 09:18 AM", amount: "$185.00", status: "Completed" },
  { id: "TXN-50939", patient: "Liam Thompson", method: "Insurance", date: "Today, 08:55 AM", amount: "$560.00", status: "Processing" },
  { id: "TXN-50938", patient: "Ethan Chen", method: "Visa •••• 2301", date: "Yesterday, 04:32 PM", amount: "$320.00", status: "Refunded" },
  { id: "TXN-50937", patient: "Noah Williams", method: "Bank transfer", date: "Yesterday, 02:11 PM", amount: "$480.00", status: "Completed" },
];

export const staffRecords = [
  { name: "Dr. Maya Bennett", initials: "MB", role: "Medical Director", specialty: "Internal Medicine", schedule: "Mon – Fri, 8:00 AM – 4:00 PM", status: "On duty" },
  { name: "Dr. Daniel Kim", initials: "DK", role: "Cardiologist", specialty: "Cardiology", schedule: "Mon – Thu, 9:00 AM – 5:00 PM", status: "On duty" },
  { name: "Rachel Adams", initials: "RA", role: "Registered Nurse", specialty: "Patient care", schedule: "Tue – Sat, 7:00 AM – 3:00 PM", status: "On duty" },
  { name: "Michael Rivera", initials: "MR", role: "Clinic Manager", specialty: "Administration", schedule: "Mon – Fri, 8:30 AM – 5:00 PM", status: "On break" },
  { name: "Dr. Aisha Khan", initials: "AK", role: "Dermatologist", specialty: "Dermatology", schedule: "Mon, Wed, Fri, 10:00 AM – 6:00 PM", status: "Off duty" },
];

export const activityRecords = [
  { user: "Rachel Adams", action: "Updated patient record", subject: "Amara Johnson · PT-2408", time: "2 min ago", kind: "Patients" },
  { user: "Michael Rivera", action: "Generated invoice", subject: "INV-2026-084 · $240.00", time: "18 min ago", kind: "Billing" },
  { user: "Dr. Maya Bennett", action: "Completed appointment", subject: "Noah Williams · Cardiology", time: "36 min ago", kind: "Appointments" },
  { user: "Rachel Adams", action: "Recorded payment", subject: "TXN-50941 · Visa", time: "1 hr ago", kind: "Payments" },
  { user: "Michael Rivera", action: "Added new patient", subject: "Olivia Martinez · PT-2404", time: "2 hr ago", kind: "Patients" },
  { user: "Dr. Daniel Kim", action: "Updated care notes", subject: "Ethan Chen · PT-2405", time: "3 hr ago", kind: "Patients" },
];

export const appointmentRecords = [
  { time: "09:00 AM", patient: "Amara Johnson", initials: "AJ", doctor: "Dr. Maya Bennett", type: "General checkup", status: "Completed" },
  { time: "10:30 AM", patient: "Noah Williams", initials: "NW", doctor: "Dr. Daniel Kim", type: "Cardiology review", status: "In progress" },
  { time: "11:15 AM", patient: "Sofia Patel", initials: "SP", doctor: "Dr. Aisha Khan", type: "Skin consultation", status: "Upcoming" },
  { time: "01:00 PM", patient: "Ethan Chen", initials: "EC", doctor: "Rachel Adams, RN", type: "Physical therapy", status: "Upcoming" },
];