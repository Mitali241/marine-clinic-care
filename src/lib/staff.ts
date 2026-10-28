import { z } from "zod";

export const staffDepartments = [
  "Medical & DG Examinations",
  "Cardiology & ECG",
  "Radiology & Diagnostics",
  "Pathology & Laboratory",
  "Nursing & Phlebotomy",
  "Clinic Administration",
] as const;
export type StaffDepartment = (typeof staffDepartments)[number];

export const staffStatuses = [
  "Active / On duty",
  "On leave",
  "Resigned",
  "Terminated",
] as const;
export type StaffStatus = (typeof staffStatuses)[number];

export const documentTypes = [
  "Medical License & DG Approval",
  "Identity Proof (Aadhaar / Passport)",
  "Educational Degree / Qualification",
  "Employment Agreement & Offer Letter",
  "Experience / Relieving Certificate",
  "PAN Card / Tax Document",
  "Other",
] as const;
export type DocumentType = (typeof documentTypes)[number];

export interface StaffDocument {
  id: string;
  name: string;
  type: DocumentType;
  documentNo?: string;
  issuedDate?: string;
  expiryDate?: string;
  fileUrl?: string;
  fileName?: string;
  fileData?: string;
  fileType?: string;
  verificationStatus: "Verified" | "Pending" | "Expired";
}

export interface StaffMember {
  id: string; // e.g. SMC-EMP-001
  name: string;
  initials: string;
  gender: "Male" | "Female" | "Other";
  dob: string;
  phone: string;
  email: string;
  address: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  
  // Employment Details
  role: string;
  department: StaffDepartment;
  employmentType: "Full-time" | "Part-time" | "Consultant" | "Visiting Doctor";
  status: StaffStatus;
  joiningDate: string; // YYYY-MM-DD
  schedule: string; // e.g. "Mon – Fri, 8:00 AM – 4:00 PM"
  
  // Resignation Details
  resignationDate?: string; // YYYY-MM-DD
  relievingDate?: string; // YYYY-MM-DD
  resignationReason?: string;
  noticePeriodDays?: number;

  // Salary & Banking
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  payFrequency: "Monthly" | "Bi-Weekly" | "Consultation Fee";
  panNo?: string;
  bankName?: string;
  bankAccountNo?: string;
  ifscCode?: string;

  // Documents
  documents: StaffDocument[];
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export const staffMemberSchema = z.object({
  id: z.string().trim().min(1, "Employee ID is required"),
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  initials: z.string().trim().max(5).default("SM"),
  gender: z.enum(["Male", "Female", "Other"]).default("Male"),
  dob: z.string().trim().default("1990-01-01"),
  phone: z.string().trim().min(8, "Phone number is required"),
  email: z.string().trim().email("Invalid email"),
  address: z.string().trim().default("Navi Mumbai, Maharashtra"),
  emergencyContactName: z.string().trim().default("Emergency Contact"),
  emergencyContactPhone: z.string().trim().default("+91 95614 50104"),
  role: z.string().trim().min(2, "Role/Designation is required"),
  department: z.enum(staffDepartments).default("Medical & DG Examinations"),
  employmentType: z
    .enum(["Full-time", "Part-time", "Consultant", "Visiting Doctor"])
    .default("Full-time"),
  status: z.enum(staffStatuses).default("Active / On duty"),
  joiningDate: z.string().trim().min(1, "Joining date is required"),
  schedule: z.string().trim().default("Mon – Fri, 9:00 AM – 5:00 PM"),
  resignationDate: z.string().trim().optional().or(z.literal("")),
  relievingDate: z.string().trim().optional().or(z.literal("")),
  resignationReason: z.string().trim().optional().or(z.literal("")),
  noticePeriodDays: z.number().nonnegative().optional().default(30),
  basicSalary: z.number().nonnegative().default(50000),
  allowances: z.number().nonnegative().default(10000),
  deductions: z.number().nonnegative().default(2500),
  netSalary: z.number().nonnegative().default(57500),
  payFrequency: z.enum(["Monthly", "Bi-Weekly", "Consultation Fee"]).default("Monthly"),
  panNo: z.string().trim().optional().or(z.literal("")),
  bankName: z.string().trim().optional().or(z.literal("")),
  bankAccountNo: z.string().trim().optional().or(z.literal("")),
  ifscCode: z.string().trim().optional().or(z.literal("")),
  notes: z.string().trim().optional().or(z.literal("")),
  documents: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        type: z.enum(documentTypes),
        documentNo: z.string().optional(),
        issuedDate: z.string().optional(),
        expiryDate: z.string().optional(),
        fileUrl: z.string().optional(),
        verificationStatus: z.enum(["Verified", "Pending", "Expired"]),
      }),
    )
    .default([]),
});

export type StaffMemberInput = z.infer<typeof staffMemberSchema>;

export const initialStaffMembers: StaffMember[] = [
  {
    id: "SMC-EMP-001",
    name: "Dr. Maya Bennett",
    initials: "MB",
    gender: "Female",
    dob: "1980-08-14",
    phone: "+91 98201 44910",
    email: "dr.maya@sailorsmedical.com",
    address: "Sea Breeze Towers, Palm Beach Road, Sanpada, Navi Mumbai 400705",
    emergencyContactName: "Dr. Bennett (Spouse)",
    emergencyContactPhone: "+91 98201 44919",
    role: "Medical Director & DG Examiner",
    department: "Medical & DG Examinations",
    employmentType: "Full-time",
    status: "Active / On duty",
    joiningDate: "2021-03-01",
    schedule: "Mon – Fri, 8:00 AM – 4:00 PM",
    basicSalary: 180000,
    allowances: 35000,
    deductions: 7500,
    netSalary: 207500,
    payFrequency: "Monthly",
    panNo: "AAAPB9812K",
    bankName: "HDFC Bank (CBD Belapur)",
    bankAccountNo: "•••• •••• 4481",
    ifscCode: "HDFC0000492",
    notes: "Lead medical superintendent and authorized DG Shipping medical examiner.",
    createdAt: "2021-03-01T00:00:00.000Z",
    documents: [
      {
        id: "DOC-001",
        name: "DG Shipping Medical Approval Certificate",
        type: "Medical License & DG Approval",
        documentNo: "DG-MED-MUM-2019-041",
        issuedDate: "2019-04-10",
        expiryDate: "2029-04-09",
        verificationStatus: "Verified",
      },
      {
        id: "DOC-002",
        name: "Maharashtra Medical Council (MMC) Registration",
        type: "Medical License & DG Approval",
        documentNo: "MMC-2005-08-2914",
        issuedDate: "2005-08-15",
        expiryDate: "2030-08-14",
        verificationStatus: "Verified",
      },
      {
        id: "DOC-003",
        name: "MD Internal Medicine Degree Certificate",
        type: "Educational Degree / Qualification",
        documentNo: "BOM-UNI-MED-8491",
        issuedDate: "2005-05-20",
        verificationStatus: "Verified",
      },
    ],
  },
  {
    id: "SMC-EMP-002",
    name: "Dr. Daniel Kim",
    initials: "DK",
    gender: "Male",
    dob: "1983-11-22",
    phone: "+91 98334 22019",
    email: "dr.kim@sailorsmedical.com",
    address: "Sector 15, CBD Belapur, Navi Mumbai 400614",
    emergencyContactName: "Eunji Kim",
    emergencyContactPhone: "+91 98334 22020",
    role: "Cardiologist & TMT Specialist",
    department: "Cardiology & ECG",
    employmentType: "Full-time",
    status: "Active / On duty",
    joiningDate: "2022-01-15",
    schedule: "Mon – Thu, 9:00 AM – 5:00 PM",
    basicSalary: 140000,
    allowances: 25000,
    deductions: 5000,
    netSalary: 160000,
    payFrequency: "Monthly",
    panNo: "BCDPK1042M",
    bankName: "ICICI Bank (Sector 11)",
    bankAccountNo: "•••• •••• 9912",
    ifscCode: "ICIC0000881",
    notes: "Supervises resting ECG, stress echocardiograms, and cardiology approvals.",
    createdAt: "2022-01-15T00:00:00.000Z",
    documents: [
      {
        id: "DOC-004",
        name: "DM Cardiology Fellowship Certificate",
        type: "Educational Degree / Qualification",
        documentNo: "CARD-FELL-2012-99",
        issuedDate: "2012-07-01",
        verificationStatus: "Verified",
      },
      {
        id: "DOC-005",
        name: "Aadhaar Card",
        type: "Identity Proof (Aadhaar / Passport)",
        documentNo: "•••• •••• 8102",
        issuedDate: "2016-02-10",
        verificationStatus: "Verified",
      },
    ],
  },
  {
    id: "SMC-EMP-003",
    name: "Rachel Adams",
    initials: "RA",
    gender: "Female",
    dob: "1992-04-18",
    phone: "+91 97110 33819",
    email: "rachel.adams@sailorsmedical.com",
    address: "Kharghar Sector 20, Navi Mumbai 400710",
    emergencyContactName: "David Adams",
    emergencyContactPhone: "+91 97110 33825",
    role: "Registered Nurse & Head Phlebotomist",
    department: "Nursing & Phlebotomy",
    employmentType: "Full-time",
    status: "Active / On duty",
    joiningDate: "2023-05-10",
    schedule: "Tue – Sat, 7:00 AM – 3:00 PM",
    basicSalary: 48000,
    allowances: 8000,
    deductions: 2200,
    netSalary: 53800,
    payFrequency: "Monthly",
    panNo: "ADMPR8821B",
    bankName: "State Bank of India",
    bankAccountNo: "•••• •••• 3319",
    ifscCode: "SBIN0004921",
    notes: "Conducts blood samples collection, vitals measurement, and vaccines.",
    createdAt: "2023-05-10T00:00:00.000Z",
    documents: [
      {
        id: "DOC-006",
        name: "B.Sc Nursing Degree & State Nursing Council Reg.",
        type: "Educational Degree / Qualification",
        documentNo: "MNC-NURS-2015-883",
        issuedDate: "2015-06-30",
        verificationStatus: "Verified",
      },
      {
        id: "DOC-007",
        name: "BLS / ACLS Healthcare Provider Certificate",
        type: "Medical License & DG Approval",
        documentNo: "AHA-ACLS-2024-118",
        issuedDate: "2024-03-12",
        expiryDate: "2026-03-11",
        verificationStatus: "Verified",
      },
    ],
  },
  {
    id: "SMC-EMP-004",
    name: "Michael Rivera",
    initials: "MR",
    gender: "Male",
    dob: "1988-09-05",
    phone: "+91 98331 44820",
    email: "m.rivera@sailorsmedical.com",
    address: "Seawoods Estates, Sector 54, Nerul, Navi Mumbai 400706",
    emergencyContactName: "Elena Rivera",
    emergencyContactPhone: "+91 98331 44829",
    role: "Clinic Operations & Billing Manager",
    department: "Clinic Administration",
    employmentType: "Full-time",
    status: "Active / On duty",
    joiningDate: "2022-08-01",
    schedule: "Mon – Fri, 8:30 AM – 5:00 PM",
    basicSalary: 65000,
    allowances: 12000,
    deductions: 3000,
    netSalary: 74000,
    payFrequency: "Monthly",
    panNo: "RVRMR6612Q",
    bankName: "Axis Bank",
    bankAccountNo: "•••• •••• 6614",
    ifscCode: "UTIB0001092",
    notes: "Supervises candidate registration, GST invoicing, and corporate billing.",
    createdAt: "2022-08-01T00:00:00.000Z",
    documents: [
      {
        id: "DOC-008",
        name: "MBA Healthcare Management Degree",
        type: "Educational Degree / Qualification",
        documentNo: "MBA-HCM-2012-441",
        issuedDate: "2012-05-15",
        verificationStatus: "Verified",
      },
      {
        id: "DOC-009",
        name: "Employment Contract & Non-Disclosure Agreement",
        type: "Employment Agreement & Offer Letter",
        documentNo: "SMC-EMP-AGR-2022-04",
        issuedDate: "2022-08-01",
        verificationStatus: "Verified",
      },
    ],
  },
  {
    id: "SMC-EMP-005",
    name: "Dr. Aisha Khan",
    initials: "AK",
    gender: "Female",
    dob: "1986-03-30",
    phone: "+91 98401 55921",
    email: "dr.aisha@sailorsmedical.com",
    address: "Vashi Sector 9, Navi Mumbai 400703",
    emergencyContactName: "Tariq Khan",
    emergencyContactPhone: "+91 98401 55930",
    role: "Consultant Radiologist",
    department: "Radiology & Diagnostics",
    employmentType: "Consultant",
    status: "Active / On duty",
    joiningDate: "2023-11-01",
    schedule: "Mon, Wed, Fri, 10:00 AM – 6:00 PM",
    basicSalary: 110000,
    allowances: 15000,
    deductions: 4000,
    netSalary: 121000,
    payFrequency: "Monthly",
    panNo: "KHNAK9901R",
    bankName: "HDFC Bank",
    bankAccountNo: "•••• •••• 1042",
    ifscCode: "HDFC0000180",
    notes: "Conducts USG Abdomen and reviews Digital Chest X-Rays for DG fitness.",
    createdAt: "2023-11-01T00:00:00.000Z",
    documents: [
      {
        id: "DOC-010",
        name: "MD Radio-Diagnosis Degree",
        type: "Educational Degree / Qualification",
        documentNo: "MUM-RAD-2014-991",
        issuedDate: "2014-06-25",
        verificationStatus: "Verified",
      },
    ],
  },
  {
    id: "SMC-EMP-006",
    name: "Sanjay Verma",
    initials: "SV",
    gender: "Male",
    dob: "1994-07-12",
    phone: "+91 98209 11844",
    email: "sanjay.v@sailorsmedical.com",
    address: "Ulwe Sector 19, Navi Mumbai 410206",
    emergencyContactName: "Ramesh Verma (Father)",
    emergencyContactPhone: "+91 98209 11850",
    role: "ECG & Audiometry Technician",
    department: "Cardiology & ECG",
    employmentType: "Full-time",
    status: "Active / On duty",
    joiningDate: "2024-02-15",
    schedule: "Mon – Sat, 8:30 AM – 4:30 PM",
    basicSalary: 35000,
    allowances: 5000,
    deductions: 1500,
    netSalary: 38500,
    payFrequency: "Monthly",
    panNo: "VRMSV4410P",
    bankName: "Kotak Mahindra Bank",
    bankAccountNo: "•••• •••• 9840",
    ifscCode: "KKBK0001421",
    notes: "Operates Pure Tone Audiometry booth and computerized 12-lead ECG.",
    createdAt: "2024-02-15T00:00:00.000Z",
    documents: [
      {
        id: "DOC-011",
        name: "Diploma in Medical Laboratory & Audiology Technology",
        type: "Educational Degree / Qualification",
        documentNo: "DMLT-AUD-2016-081",
        issuedDate: "2016-05-18",
        verificationStatus: "Verified",
      },
    ],
  },
  {
    id: "SMC-EMP-007",
    name: "Priya Deshmukh",
    initials: "PD",
    gender: "Female",
    dob: "1996-12-04",
    phone: "+91 98190 77123",
    email: "priya.d@sailorsmedical.com",
    address: "Koperkhairane Sector 4, Navi Mumbai 400709",
    emergencyContactName: "Sunil Deshmukh",
    emergencyContactPhone: "+91 98190 77125",
    role: "Former Front Desk Executive",
    department: "Clinic Administration",
    employmentType: "Full-time",
    status: "Resigned",
    joiningDate: "2023-09-01",
    resignationDate: "2026-08-31",
    relievingDate: "2026-09-30",
    resignationReason: "Relocated to Pune for family reasons & higher studies",
    noticePeriodDays: 30,
    schedule: "Mon – Fri, 9:00 AM – 5:30 PM",
    basicSalary: 32000,
    allowances: 4000,
    deductions: 1200,
    netSalary: 34800,
    payFrequency: "Monthly",
    panNo: "DSMPD1129T",
    bankName: "Bank of Baroda",
    bankAccountNo: "•••• •••• 7719",
    ifscCode: "BARB0BELAPU",
    notes: "Successfully completed full handover and received official relieving letter.",
    createdAt: "2023-09-01T00:00:00.000Z",
    documents: [
      {
        id: "DOC-012",
        name: "Official Relieving & Experience Letter",
        type: "Experience / Relieving Certificate",
        documentNo: "SMC-REL-2026-091",
        issuedDate: "2026-09-30",
        verificationStatus: "Verified",
      },
      {
        id: "DOC-013",
        name: "No-Dues Clearance Form",
        type: "Other",
        documentNo: "NODUES-2026-091",
        issuedDate: "2026-09-30",
        verificationStatus: "Verified",
      },
    ],
  },
];
