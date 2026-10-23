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
  srNo: number;
  date: string;
  name: string;
  initials: string;
  dob: string;
  age: number;
  gender: string;
  phone: string;
  email: string;
  rank: string;
  typeOfMedical: string;
  usgXray: string;
  companyName: string;
  paymentStatus: "Paid" | "Own" | "Pending";
  paymentAmount: string;
  paymentMode: "Cash" | "Trans. ID" | "UPI" | "Bank Transfer";
  paymentProof: string;
  transactionId: string;
  timeIn: string;
  timeOut: string;
  certificateNo: string;
  indosNo: string;
  cdcNo: string;
  invoiceNo?: string;
  candidateName?: string;
  lastVisit: string;
  nextVisit: string;
  condition: string;
  status: "Active" | "Follow-up" | "New";
};

export const initialPatients: PatientRecord[] = [
  {
    id: "PT-2408",
    srNo: 1,
    date: "2026-10-21",
    name: "Amara Johnson",
    initials: "AJ",
    dob: "1992-04-12",
    age: 34,
    gender: "Female",
    phone: "+91 98201 44821",
    email: "amara.j@seafarer.demo",
    rank: "Chief Officer",
    typeOfMedical: "Annual Seafarer Medical",
    usgXray: "USG & Chest X-Ray Normal",
    companyName: "Maersk Marine Services",
    paymentStatus: "Paid",
    paymentAmount: "₹4,500.00",
    paymentMode: "Trans. ID",
    paymentProof: "TXN-PR-88219",
    transactionId: "TXN-50941",
    timeIn: "08:30 AM",
    timeOut: "12:15 PM",
    certificateNo: "MC-2026-9041",
    indosNo: "12NL8492",
    cdcNo: "MUM 248910",
    invoiceNo: "INV-2026-084",
    candidateName: "Amara Johnson",
    lastVisit: "Oct 21, 2026",
    nextVisit: "Oct 28, 2026",
    condition: "Annual Seafarer Medical",
    status: "Active",
  },
  {
    id: "PT-2407",
    srNo: 2,
    date: "2026-10-21",
    name: "Noah Williams",
    initials: "NW",
    dob: "1974-09-18",
    age: 52,
    gender: "Male",
    phone: "+91 98402 11963",
    email: "noah.w@seafarer.demo",
    rank: "Captain / Master",
    typeOfMedical: "Flag State Medical",
    usgXray: "Chest X-Ray Done",
    companyName: "Synergy Maritime",
    paymentStatus: "Own",
    paymentAmount: "₹8,200.00",
    paymentMode: "Cash",
    paymentProof: "Cash Voucher #441",
    transactionId: "CSH-2026-018",
    timeIn: "09:00 AM",
    timeOut: "01:30 PM",
    certificateNo: "MC-2026-9040",
    indosNo: "05NL3190",
    cdcNo: "CHE 192844",
    invoiceNo: "INV-2026-083",
    candidateName: "Noah Williams",
    lastVisit: "Oct 21, 2026",
    nextVisit: "Oct 24, 2026",
    condition: "Cardiology Review",
    status: "Follow-up",
  },
  {
    id: "PT-2406",
    srNo: 3,
    date: "2026-10-20",
    name: "Sofia Patel",
    initials: "SP",
    dob: "1998-11-05",
    age: 28,
    gender: "Female",
    phone: "+91 97115 90113",
    email: "sofia.p@seafarer.demo",
    rank: "2nd Officer",
    typeOfMedical: "Pre-Sea Examination",
    usgXray: "USG & X-Ray Normal",
    companyName: "Fleet Management Ltd",
    paymentStatus: "Paid",
    paymentAmount: "₹3,800.00",
    paymentMode: "Trans. ID",
    paymentProof: "Receipt #0982",
    transactionId: "TXN-50940",
    timeIn: "08:45 AM",
    timeOut: "11:50 AM",
    certificateNo: "MC-2026-9039",
    indosNo: "18NL7714",
    cdcNo: "KOL 309112",
    invoiceNo: "INV-2026-082",
    candidateName: "Sofia Patel",
    lastVisit: "Oct 20, 2026",
    nextVisit: "Oct 29, 2026",
    condition: "Pre-Sea Fitness",
    status: "Active",
  },
  {
    id: "PT-2405",
    srNo: 4,
    date: "2026-10-20",
    name: "Ethan Chen",
    initials: "EC",
    dob: "1985-02-14",
    age: 41,
    gender: "Male",
    phone: "+91 98334 50177",
    email: "ethan.c@seafarer.demo",
    rank: "Chief Engineer",
    typeOfMedical: "Periodic Maritime Medical",
    usgXray: "Pending USG",
    companyName: "Anglo-Eastern Shipping",
    paymentStatus: "Own",
    paymentAmount: "₹6,500.00",
    paymentMode: "Cash",
    paymentProof: "Cash Memo #829",
    transactionId: "CSH-2026-015",
    timeIn: "10:00 AM",
    timeOut: "02:00 PM",
    certificateNo: "MC-2026-9038",
    indosNo: "11NL4562",
    cdcNo: "GOA 154890",
    invoiceNo: "INV-2026-081",
    candidateName: "Ethan Chen",
    lastVisit: "Oct 20, 2026",
    nextVisit: "Oct 23, 2026",
    condition: "Physical Fitness Review",
    status: "Follow-up",
  },
  {
    id: "PT-2404",
    srNo: 5,
    date: "2026-10-19",
    name: "Olivia Martinez",
    initials: "OM",
    dob: "2007-06-25",
    age: 19,
    gender: "Female",
    phone: "+91 98210 50144",
    email: "olivia.m@seafarer.demo",
    rank: "Deck Cadet",
    typeOfMedical: "Pre-Sea Examination",
    usgXray: "USG & X-Ray Normal",
    companyName: "MSC Mediterranean",
    paymentStatus: "Paid",
    paymentAmount: "₹2,500.00",
    paymentMode: "Trans. ID",
    paymentProof: "Online Conf #7712",
    transactionId: "TXN-50935",
    timeIn: "09:15 AM",
    timeOut: "12:30 PM",
    certificateNo: "MC-2026-9037",
    indosNo: "24NL9012",
    cdcNo: "MUM 398110",
    invoiceNo: "INV-2026-080",
    candidateName: "Olivia Martinez",
    lastVisit: "Oct 19, 2026",
    nextVisit: "Nov 02, 2026",
    condition: "Pre-Sea Medical Check",
    status: "New",
  },
  {
    id: "PT-2403",
    srNo: 6,
    date: "2026-10-19",
    name: "Liam Thompson",
    initials: "LT",
    dob: "1959-03-30",
    age: 67,
    gender: "Male",
    phone: "+91 98401 55182",
    email: "liam.t@seafarer.demo",
    rank: "Bosun",
    typeOfMedical: "Periodic Maritime Medical",
    usgXray: "Chest X-Ray Normal",
    companyName: "Teekay Tankers",
    paymentStatus: "Paid",
    paymentAmount: "₹9,800.00",
    paymentMode: "Trans. ID",
    paymentProof: "Company Voucher #662",
    transactionId: "TXN-50939",
    timeIn: "08:15 AM",
    timeOut: "01:00 PM",
    certificateNo: "MC-2026-9036",
    indosNo: "98NL0123",
    cdcNo: "CHE 087221",
    invoiceNo: "INV-2026-079",
    candidateName: "Liam Thompson",
    lastVisit: "Oct 19, 2026",
    nextVisit: "Oct 26, 2026",
    condition: "Cardiology Review",
    status: "Active",
  },
];

export type InvoiceItem = {
  id: string;
  description: string;
  sacCode: string;
  qty: number;
  rate: number;
  amount: number;
};

export type InvoiceRecord = {
  id: string;
  date: string;
  dueDate: string;
  patient: string;
  patientId?: string;
  rank?: string;
  indosNo?: string;
  cdcNo?: string;
  certificateNo?: string;
  company: string;
  companyGstin?: string;
  companyAddress?: string;
  status: "Paid" | "Pending" | "Overdue";
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  amount: string;
  paymentMethod?: string;
  transactionRef?: string;
  paidDate?: string;
  notes?: string;
};

export function formatINR(val: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(val);
}

export function amountToWordsINR(num: number): string {
  const a = [
    "",
    "One ",
    "Two ",
    "Three ",
    "Four ",
    "Five ",
    "Six ",
    "Seven ",
    "Eight ",
    "Nine ",
    "Ten ",
    "Eleven ",
    "Twelve ",
    "Thirteen ",
    "Fourteen ",
    "Fifteen ",
    "Sixteen ",
    "Seventeen ",
    "Eighteen ",
    "Nineteen ",
  ];
  const b = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  function inWords(n: number): string {
    if ((n = n.toString().length > 9 ? parseFloat(n.toString().slice(0, 9)) : n) === 0)
      return "";
    let str = "";
    const nStr = ("000000000" + n).slice(-9);
    const crore = parseInt(nStr.substring(0, 2), 10);
    const lakh = parseInt(nStr.substring(2, 4), 10);
    const thousand = parseInt(nStr.substring(4, 6), 10);
    const hundred = parseInt(nStr.substring(6, 7), 10);
    const rest = parseInt(nStr.substring(7, 9), 10);

    if (crore > 0) {
      str += (a[crore] || b[Math.floor(crore / 10)] + " " + a[crore % 10]) + "Crore ";
    }
    if (lakh > 0) {
      str += (a[lakh] || b[Math.floor(lakh / 10)] + " " + a[lakh % 10]) + "Lakh ";
    }
    if (thousand > 0) {
      str += (a[thousand] || b[Math.floor(thousand / 10)] + " " + a[thousand % 10]) + "Thousand ";
    }
    if (hundred > 0) {
      str += a[hundred] + "Hundred ";
    }
    if (rest > 0) {
      if (str !== "") str += "and ";
      str += a[rest] || b[Math.floor(rest / 10)] + " " + a[rest % 10];
    }
    return str.trim();
  }

  const rounded = Math.round(num);
  const words = inWords(rounded);
  return words ? `Rupees ${words} Only` : "Rupees Zero Only";
}

export const invoiceRecords: InvoiceRecord[] = [
  {
    id: "INV-2026-084",
    date: "Oct 21, 2026",
    dueDate: "Nov 05, 2026",
    patient: "Amara Johnson",
    patientId: "PT-2408",
    rank: "Chief Officer",
    indosNo: "12NL8492",
    cdcNo: "MUM 248910",
    certificateNo: "MC-2026-9041",
    company: "Maersk Marine Services India Pvt Ltd",
    companyGstin: "27AAACM0124P1Z4",
    companyAddress: "12th Floor, Tower B, Peninsula Business Park, Lower Parel, Mumbai 400013",
    status: "Paid",
    subtotal: 4500,
    tax: 0,
    discount: 0,
    total: 4500,
    amount: "₹4,500.00",
    paymentMethod: "UPI / Trans. ID",
    transactionRef: "TXN-50941 / UTR-882190",
    paidDate: "Oct 21, 2026",
    notes: "DG Shipping Annual Seafarer Fitness examination cleared.",
    items: [
      { id: "1", description: "DG Shipping Comprehensive Medical Fitness Examination", sacCode: "999312", qty: 1, rate: 2500, amount: 2500 },
      { id: "2", description: "Digital Chest X-Ray (PA View with Radiologist Report)", sacCode: "999312", qty: 1, rate: 1200, amount: 1200 },
      { id: "3", description: "Pathology Diagnostics (Complete Haemogram & Fasting Glucose)", sacCode: "999312", qty: 1, rate: 800, amount: 800 },
    ],
  },
  {
    id: "INV-2026-083",
    date: "Oct 21, 2026",
    dueDate: "Nov 05, 2026",
    patient: "Noah Williams",
    patientId: "PT-2407",
    rank: "Captain / Master",
    indosNo: "05NL3190",
    cdcNo: "CHE 192844",
    certificateNo: "MC-2026-9040",
    company: "Synergy Maritime Pvt Ltd",
    companyGstin: "33AABCS8891Q1Z8",
    companyAddress: "4th Floor, Apex Chambers, Chennai 600017",
    status: "Pending",
    subtotal: 8200,
    tax: 0,
    discount: 0,
    total: 8200,
    amount: "₹8,200.00",
    paymentMethod: "Cash / Pending",
    transactionRef: "CSH-2026-018",
    paidDate: "Pending Verification",
    notes: "Flag state medical with Cardiology review protocol.",
    items: [
      { id: "1", description: "Flag State Master Mariner Fitness Examination", sacCode: "999312", qty: 1, rate: 3500, amount: 3500 },
      { id: "2", description: "Cardiology Evaluation & 12-Lead Resting ECG", sacCode: "999312", qty: 1, rate: 2500, amount: 2500 },
      { id: "3", description: "Whole Abdomen Ultrasound Screening (USG)", sacCode: "999312", qty: 1, rate: 2200, amount: 2200 },
    ],
  },
  {
    id: "INV-2026-082",
    date: "Oct 20, 2026",
    dueDate: "Nov 04, 2026",
    patient: "Sofia Patel",
    patientId: "PT-2406",
    rank: "2nd Officer",
    indosNo: "18NL7714",
    cdcNo: "KOL 309112",
    certificateNo: "MC-2026-9039",
    company: "Fleet Management India Ltd",
    companyGstin: "27AACCF1209M1ZG",
    companyAddress: "601, Enterprise Hub, Andheri East, Mumbai 400069",
    status: "Paid",
    subtotal: 3800,
    tax: 0,
    discount: 0,
    total: 3800,
    amount: "₹3,800.00",
    paymentMethod: "HDFC Bank IMPS",
    transactionRef: "TXN-50940 / IMPS-90172",
    paidDate: "Oct 20, 2026",
    notes: "Pre-Sea medical certificate issued.",
    items: [
      { id: "1", description: "Pre-Sea Seafarer Medical Examination", sacCode: "999312", qty: 1, rate: 2200, amount: 2200 },
      { id: "2", description: "Digital Chest X-Ray (PA View)", sacCode: "999312", qty: 1, rate: 1000, amount: 1000 },
      { id: "3", description: "Audiometry & Ishihara 38 Plates Color Vision Test", sacCode: "999312", qty: 1, rate: 600, amount: 600 },
    ],
  },
  {
    id: "INV-2026-081",
    date: "Oct 20, 2026",
    dueDate: "Oct 15, 2026",
    patient: "Ethan Chen",
    patientId: "PT-2405",
    rank: "Chief Engineer",
    indosNo: "11NL4562",
    cdcNo: "GOA 154890",
    certificateNo: "MC-2026-9038",
    company: "Anglo-Eastern Ship Management India",
    companyGstin: "27AABCA3319L1ZP",
    companyAddress: "Anglo-Eastern House, MIDC, Andheri East, Mumbai 400093",
    status: "Overdue",
    subtotal: 6500,
    tax: 0,
    discount: 0,
    total: 6500,
    amount: "₹6,500.00",
    paymentMethod: "Corporate Billing / Due",
    transactionRef: "INV-REF-081",
    notes: "USG pending; follow-up payment overdue.",
    items: [
      { id: "1", description: "Periodic Maritime Medical Checkup (Chief Engineer)", sacCode: "999312", qty: 1, rate: 2800, amount: 2800 },
      { id: "2", description: "Whole Abdomen & Pelvis Ultrasonography (USG)", sacCode: "999312", qty: 1, rate: 2200, amount: 2200 },
      { id: "3", description: "Biochemical Lab Panel (Lipid, LFT, KFT & Serum Creatinine)", sacCode: "999312", qty: 1, rate: 1500, amount: 1500 },
    ],
  },
  {
    id: "INV-2026-080",
    date: "Oct 19, 2026",
    dueDate: "Nov 03, 2026",
    patient: "Olivia Martinez",
    patientId: "PT-2404",
    rank: "Deck Cadet",
    indosNo: "24NL9012",
    cdcNo: "MUM 398110",
    certificateNo: "MC-2026-9037",
    company: "MSC Mediterranean Shipping Co. India",
    companyGstin: "27AABCM7712E1Z2",
    companyAddress: "MSC House, Andheri Kurla Road, Mumbai 400059",
    status: "Pending",
    subtotal: 2500,
    tax: 0,
    discount: 0,
    total: 2500,
    amount: "₹2,500.00",
    paymentMethod: "Trans. ID / Online",
    transactionRef: "TXN-50935",
    notes: "New deck cadet joining examination.",
    items: [
      { id: "1", description: "Deck Cadet Pre-Sea Medical Examination", sacCode: "999312", qty: 1, rate: 1800, amount: 1800 },
      { id: "2", description: "Chest X-Ray & Vision Acuity Screening", sacCode: "999312", qty: 1, rate: 700, amount: 700 },
    ],
  },
  {
    id: "INV-2026-079",
    date: "Oct 19, 2026",
    dueDate: "Nov 02, 2026",
    patient: "Liam Thompson",
    patientId: "PT-2403",
    rank: "Bosun",
    indosNo: "98NL0123",
    cdcNo: "CHE 087221",
    certificateNo: "MC-2026-9036",
    company: "Teekay Tankers India Pvt Ltd",
    companyGstin: "27AABCT9918F1ZU",
    companyAddress: "7th Floor, Solitaire Corporate Park, Mumbai 400093",
    status: "Paid",
    subtotal: 9800,
    tax: 0,
    discount: 0,
    total: 9800,
    amount: "₹9,800.00",
    paymentMethod: "Teekay Corporate NEFT",
    transactionRef: "TXN-50939 / NEFT-66219",
    paidDate: "Oct 19, 2026",
    notes: "Senior deck crew physical fitness clearance.",
    items: [
      { id: "1", description: "Periodic Seafarer Medical Examination", sacCode: "999312", qty: 1, rate: 3000, amount: 3000 },
      { id: "2", description: "Echocardiogram & Cardiac Stress Evaluation", sacCode: "999312", qty: 1, rate: 4200, amount: 4200 },
      { id: "3", description: "Whole Abdomen Ultrasound Screening", sacCode: "999312", qty: 1, rate: 2600, amount: 2600 },
    ],
  },
];

export const paymentRecords = [
  { id: "TXN-50941", patient: "Amara Johnson", method: "UPI / GPay •••• 4829", date: "Today, 10:42 AM", amount: "₹4,500.00", status: "Completed" },
  { id: "TXN-50940", patient: "Sofia Patel", method: "HDFC Bank IMPS", date: "Today, 09:18 AM", amount: "₹3,800.00", status: "Completed" },
  { id: "TXN-50939", patient: "Liam Thompson", method: "Teekay Corporate NEFT", date: "Today, 08:55 AM", amount: "₹9,800.00", status: "Completed" },
  { id: "TXN-50938", patient: "Ethan Chen", method: "Cash Deposit Memo", date: "Yesterday, 04:32 PM", amount: "₹6,500.00", status: "Processing" },
  { id: "TXN-50937", patient: "Noah Williams", method: "SBI NetBanking", date: "Yesterday, 02:11 PM", amount: "₹8,200.00", status: "Completed" },
];

export const staffRecords = [
  { name: "Dr. Maya Bennett", initials: "MB", role: "Medical Director", specialty: "Internal Medicine & DG Approved", schedule: "Mon – Fri, 8:00 AM – 4:00 PM", status: "On duty" },
  { name: "Dr. Daniel Kim", initials: "DK", role: "Cardiologist", specialty: "Cardiology & Stress Testing", schedule: "Mon – Thu, 9:00 AM – 5:00 PM", status: "On duty" },
  { name: "Rachel Adams", initials: "RA", role: "Registered Nurse", specialty: "Patient care & Phlebotomy", schedule: "Tue – Sat, 7:00 AM – 3:00 PM", status: "On duty" },
  { name: "Michael Rivera", initials: "MR", role: "Clinic Manager", specialty: "Billing & DG Documentation", schedule: "Mon – Fri, 8:30 AM – 5:00 PM", status: "On break" },
  { name: "Dr. Aisha Khan", initials: "AK", role: "Radiologist", specialty: "USG & Digital X-Ray", schedule: "Mon, Wed, Fri, 10:00 AM – 6:00 PM", status: "Off duty" },
];

export const activityRecords = [
  { user: "Rachel Adams", action: "Updated patient record", subject: "Amara Johnson · PT-2408", time: "2 min ago", kind: "Patients" },
  { user: "Michael Rivera", action: "Generated tax invoice", subject: "INV-2026-084 · ₹4,500.00", time: "18 min ago", kind: "Billing" },
  { user: "Dr. Maya Bennett", action: "Completed maritime medical", subject: "Noah Williams · Cardiology", time: "36 min ago", kind: "Appointments" },
  { user: "Rachel Adams", action: "Recorded UPI payment", subject: "TXN-50941 · ₹4,500.00", time: "1 hr ago", kind: "Payments" },
  { user: "Michael Rivera", action: "Added new seafarer", subject: "Olivia Martinez · PT-2404", time: "2 hr ago", kind: "Patients" },
  { user: "Dr. Daniel Kim", action: "Updated fitness certificate", subject: "Ethan Chen · PT-2405", time: "3 hr ago", kind: "Patients" },
];

export const appointmentRecords = [
  { time: "09:00 AM", patient: "Amara Johnson", initials: "AJ", doctor: "Dr. Maya Bennett", type: "Annual Seafarer Medical", status: "Completed" },
  { time: "10:30 AM", patient: "Noah Williams", initials: "NW", doctor: "Dr. Daniel Kim", type: "Cardiology Review", status: "In progress" },
  { time: "11:15 AM", patient: "Sofia Patel", initials: "SP", doctor: "Dr. Aisha Khan", type: "Pre-Sea Examination", status: "Upcoming" },
  { time: "01:00 PM", patient: "Ethan Chen", initials: "EC", doctor: "Rachel Adams, RN", type: "Periodic Physical Fitness", status: "Upcoming" },
];