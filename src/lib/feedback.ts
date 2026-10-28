import { z } from "zod";

export const ratingOptions = ["Excellent", "Good", "Avg", "Below Avg"] as const;
export type RatingScale = (typeof ratingOptions)[number];

export const feedbackQuestions = [
  {
    id: "timeTakenAtReception",
    number: 1,
    label: "Time taken at reception",
  },
  {
    id: "skillAndFriendlinessTechnician",
    number: 2,
    label: "Skill & Friendliness of technician collecting blood",
  },
  {
    id: "ecgAudiometryTechnician",
    number: 3,
    label: "ECG - Audiometry Technician",
  },
  {
    id: "guidanceByStaffDuringWait",
    number: 4,
    label: "Guidance by staff during your wait",
  },
  {
    id: "hygieneCleanlinessClinics",
    number: 5,
    label: "Hygiene / Cleanliness of Clinics",
  },
  {
    id: "friendlinessMedicalStaff",
    number: 6,
    label: "Friendliness of the Medical Centre Staff",
  },
  {
    id: "interactionWithDoctor",
    number: 7,
    label: "Interaction with the Doctor",
  },
  {
    id: "turnaroundTimeReports",
    number: 8,
    label: "Turnaround time for reports",
  },
] as const;

export type QuestionId = (typeof feedbackQuestions)[number]["id"];

export const feedbackStatuses = ["New", "Under Review", "Resolved", "Archived"] as const;
export type FeedbackStatus = (typeof feedbackStatuses)[number];

export interface FeedbackRecord {
  id: string; // e.g. SMC-FB-2026-9041
  date: string;
  name: string;
  companyName?: string;
  rank?: string;
  passportOrCdcNo?: string;
  indosNo?: string;
  mobileNo: string;
  email?: string;
  // The 8 evaluation fields exactly as per attached form
  timeTakenAtReception: RatingScale;
  skillAndFriendlinessTechnician: RatingScale;
  ecgAudiometryTechnician: RatingScale;
  guidanceByStaffDuringWait: RatingScale;
  hygieneCleanlinessClinics: RatingScale;
  friendlinessMedicalStaff: RatingScale;
  interactionWithDoctor: RatingScale;
  turnaroundTimeReports: RatingScale;
  suggestionsComments?: string;
  candidateSignature?: string;
  status: FeedbackStatus;
  createdAt: string;
  resolutionRemarks?: string;
  resolvedAt?: string;
}

export const createFeedbackSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  date: z.string().trim().min(1, "Date is required"),
  companyName: z.string().trim().max(100).optional().or(z.literal("")),
  rank: z.string().trim().max(50).optional().or(z.literal("")),
  passportOrCdcNo: z.string().trim().max(50).optional().or(z.literal("")),
  indosNo: z.string().trim().max(50).optional().or(z.literal("")),
  mobileNo: z
    .string()
    .trim()
    .min(8, "Mobile number must be at least 8 digits")
    .max(20),
  email: z.string().trim().email("Invalid email address").optional().or(z.literal("")),
  timeTakenAtReception: z.enum(ratingOptions).default("Good"),
  skillAndFriendlinessTechnician: z.enum(ratingOptions).default("Good"),
  ecgAudiometryTechnician: z.enum(ratingOptions).default("Good"),
  guidanceByStaffDuringWait: z.enum(ratingOptions).default("Good"),
  hygieneCleanlinessClinics: z.enum(ratingOptions).default("Good"),
  friendlinessMedicalStaff: z.enum(ratingOptions).default("Good"),
  interactionWithDoctor: z.enum(ratingOptions).default("Good"),
  turnaroundTimeReports: z.enum(ratingOptions).default("Good"),
  suggestionsComments: z.string().trim().max(3000).optional().or(z.literal("")),
  candidateSignature: z.string().trim().max(100).optional().or(z.literal("")),
});

export type CreateFeedbackInput = z.infer<typeof createFeedbackSchema>;

export const initialFeedbackRecords: FeedbackRecord[] = [
  {
    id: "SMC-FB-2026-8812",
    date: "2026-10-24",
    name: "Capt. Rajesh Nair",
    companyName: "Maersk Marine Services",
    rank: "Master / Captain",
    passportOrCdcNo: "MUM 248910",
    indosNo: "02NL1844",
    mobileNo: "+91 95614 50104",
    email: "rajesh.nair@maritime.demo",
    timeTakenAtReception: "Good",
    skillAndFriendlinessTechnician: "Excellent",
    ecgAudiometryTechnician: "Excellent",
    guidanceByStaffDuringWait: "Good",
    hygieneCleanlinessClinics: "Excellent",
    friendlinessMedicalStaff: "Excellent",
    interactionWithDoctor: "Excellent",
    turnaroundTimeReports: "Good",
    suggestionsComments:
      "Very professional marine examination centre. Staff was cooperative and clinical procedures were swift.",
    candidateSignature: "Capt. Rajesh Nair",
    status: "Resolved",
    createdAt: "2026-10-24T05:30:00.000Z",
    resolutionRemarks: "Feedback reviewed and filed under DG Shipping annual quality register.",
    resolvedAt: "2026-10-24T08:15:00.000Z",
  },
  {
    id: "SMC-FB-2026-8815",
    date: "2026-10-25",
    name: "Pooja Sharma",
    companyName: "Synergy Maritime",
    rank: "2nd Officer",
    passportOrCdcNo: "CHE 192844",
    indosNo: "18NL7714",
    mobileNo: "+91 98402 11963",
    email: "pooja.s@seafarer.demo",
    timeTakenAtReception: "Excellent",
    skillAndFriendlinessTechnician: "Excellent",
    ecgAudiometryTechnician: "Excellent",
    guidanceByStaffDuringWait: "Excellent",
    hygieneCleanlinessClinics: "Excellent",
    friendlinessMedicalStaff: "Excellent",
    interactionWithDoctor: "Excellent",
    turnaroundTimeReports: "Excellent",
    suggestionsComments:
      "Blood collection was completely painless. Dr. Maya Bennett explained the fitness criteria thoroughly.",
    candidateSignature: "Pooja Sharma",
    status: "Resolved",
    createdAt: "2026-10-25T07:10:00.000Z",
    resolutionRemarks: "Commendation acknowledged and shared with clinical team.",
    resolvedAt: "2026-10-25T09:00:00.000Z",
  },
  {
    id: "SMC-FB-2026-8820",
    date: "2026-10-26",
    name: "Ethan Chen",
    companyName: "Anglo-Eastern Shipping",
    rank: "Chief Engineer",
    passportOrCdcNo: "GOA 154890",
    indosNo: "11NL4562",
    mobileNo: "+91 98334 50177",
    email: "ethan.c@seafarer.demo",
    timeTakenAtReception: "Good",
    skillAndFriendlinessTechnician: "Good",
    ecgAudiometryTechnician: "Good",
    guidanceByStaffDuringWait: "Avg",
    hygieneCleanlinessClinics: "Excellent",
    friendlinessMedicalStaff: "Good",
    interactionWithDoctor: "Excellent",
    turnaroundTimeReports: "Good",
    suggestionsComments:
      "Waiting area seating during morning rush hours could have an additional drinking water dispenser.",
    candidateSignature: "Ethan Chen",
    status: "Under Review",
    createdAt: "2026-10-26T11:45:00.000Z",
    resolutionRemarks: "Clinic supervisor notified to install secondary water dispenser in waiting lobby.",
  },
  {
    id: "SMC-FB-2026-8824",
    date: "2026-10-27",
    name: "Liam Thompson",
    companyName: "Teekay Tankers",
    rank: "Bosun",
    passportOrCdcNo: "CHE 087221",
    indosNo: "98NL0123",
    mobileNo: "+91 98401 55182",
    email: "liam.t@seafarer.demo",
    timeTakenAtReception: "Excellent",
    skillAndFriendlinessTechnician: "Excellent",
    ecgAudiometryTechnician: "Good",
    guidanceByStaffDuringWait: "Excellent",
    hygieneCleanlinessClinics: "Excellent",
    friendlinessMedicalStaff: "Excellent",
    interactionWithDoctor: "Excellent",
    turnaroundTimeReports: "Excellent",
    suggestionsComments:
      "Digital audiometry and vision test was organized very smoothly without any delay.",
    candidateSignature: "Liam Thompson",
    status: "New",
    createdAt: "2026-10-27T03:15:00.000Z",
  },
];
