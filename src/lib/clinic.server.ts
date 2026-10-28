import { createServerFn } from "@tanstack/react-start";
import { getDatabase } from "@/lib/mongodb.server";
import {
  initialPatients,
  invoiceRecords,
  activityRecords,
  staffRecords,
  type PatientRecord,
  type InvoiceRecord,
} from "@/lib/clinic";
import {
  initialFeedbackRecords,
  createFeedbackSchema,
  type FeedbackRecord,
  type CreateFeedbackInput,
  type FeedbackStatus,
} from "@/lib/feedback";
import {
  initialStaffMembers,
  type StaffMember,
} from "@/lib/staff";

// ==========================================
// SEEDING HELPER: Ensures MongoDB has collections
// ==========================================
async function ensureCollectionsSeeded() {
  try {
    const db = await getDatabase();

    // 1. Seed Patients if collection is empty
    const patientCount = await db.collection("patients").countDocuments();
    if (patientCount === 0) {
      console.log("Seeding MongoDB patients collection with initial marine patients...");
      const patientsToInsert = initialPatients.map((p) => ({ ...p }));
      await db.collection("patients").insertMany(patientsToInsert);
    }

    // 2. Seed Invoices if collection is empty
    const invoiceCount = await db.collection("invoices").countDocuments();
    if (invoiceCount === 0) {
      console.log("Seeding MongoDB invoices collection with initial marine invoices...");
      const invoicesToInsert = invoiceRecords.map((inv) => ({ ...inv }));
      await db.collection("invoices").insertMany(invoicesToInsert);
    }

    // 3. Seed Feedback / Grievances if empty or upgrade legacy schema
    const legacyCount = await db.collection("feedback").countDocuments({ timeTakenAtReception: { $exists: false } });
    if (legacyCount > 0) {
      console.log("Upgrading legacy feedback documents to Sailor's Medical Clinic format...");
      await db.collection("feedback").deleteMany({ timeTakenAtReception: { $exists: false } });
      const currentCount = await db.collection("feedback").countDocuments();
      if (currentCount === 0) {
        const feedbackToInsert = initialFeedbackRecords.map((f) => ({ ...f }));
        await db.collection("feedback").insertMany(feedbackToInsert);
      }
    } else {
      const feedbackCount = await db.collection("feedback").countDocuments();
      if (feedbackCount === 0) {
        console.log("Seeding MongoDB feedback collection with initial compliance records...");
        const feedbackToInsert = initialFeedbackRecords.map((f) => ({ ...f }));
        await db.collection("feedback").insertMany(feedbackToInsert);
      }
    }

    // 4. Seed Activity Logs if empty
    const activityCount = await db.collection("activity_logs").countDocuments();
    if (activityCount === 0) {
      const activitiesToInsert = activityRecords.map((act) => ({
        ...act,
        id: `ACT-${crypto.randomUUID().slice(0, 8)}`,
        timestamp: new Date().toISOString(),
      }));
      await db.collection("activity_logs").insertMany(activitiesToInsert);
    }

    // 5. Seed Staff if empty or upgrade legacy format
    const legacyStaff = await db.collection("staff").countDocuments({ joiningDate: { $exists: false } });
    if (legacyStaff > 0) {
      console.log("Upgrading legacy staff documents to full StaffMember schema...");
      await db.collection("staff").deleteMany({ joiningDate: { $exists: false } });
    }
    const staffCount = await db.collection("staff").countDocuments();
    if (staffCount === 0) {
      console.log("Seeding MongoDB staff collection with initial staff members...");
      const staffToInsert = initialStaffMembers.map((st) => ({ ...st }));
      await db.collection("staff").insertMany(staffToInsert);
    }
  } catch (err) {
    console.warn("MongoDB initial seed check failed:", err);
  }
}

// ==========================================
// PATIENTS SERVER FUNCTIONS
// ==========================================
export const listPatientsServer = createServerFn({ method: "GET" }).handler(
  async (): Promise<PatientRecord[]> => {
    try {
      await ensureCollectionsSeeded();
      const db = await getDatabase();
      const raw = await db
        .collection("patients")
        .find({}, { projection: { _id: 0 } })
        .sort({ srNo: 1 })
        .toArray();

      if (!raw || raw.length === 0) {
        return initialPatients;
      }

      // Return clean plain objects guaranteed to be Seroval serializable
      return JSON.parse(JSON.stringify(raw)) as PatientRecord[];
    } catch (error) {
      console.error("Failed to load patients from MongoDB:", error);
      return initialPatients;
    }
  },
);

export const savePatientServer = createServerFn({ method: "POST" })
  .validator((input: unknown): PatientRecord => input as PatientRecord)
  .handler(async ({ data }): Promise<{ success: boolean; patient: PatientRecord; message?: string }> => {
    try {
      const db = await getDatabase();
      const cleanPatient = JSON.parse(JSON.stringify(data)) as PatientRecord;

      await db.collection("patients").updateOne(
        { id: cleanPatient.id },
        { $set: cleanPatient },
        { upsert: true },
      );

      // Log activity
      try {
        await db.collection("activity_logs").insertOne({
          id: `ACT-${Date.now()}`,
          user: "Clinic Administration",
          action: "Updated seafarer record",
          subject: `${cleanPatient.name} · ${cleanPatient.id} (${cleanPatient.rank || "Marine"})`,
          time: "Just now",
          kind: "Patients",
          timestamp: new Date().toISOString(),
        });
      } catch {}

      return { success: true, patient: cleanPatient };
    } catch (error) {
      console.error("Failed to save patient in MongoDB:", error);
      return {
        success: false,
        patient: data as PatientRecord,
        message: error instanceof Error ? error.message : "Failed to save patient to MongoDB.",
      };
    }
  });

export const deletePatientServer = createServerFn({ method: "POST" })
  .validator((input: unknown): { id: string; name?: string } => input as { id: string; name?: string })
  .handler(async ({ data }): Promise<{ success: boolean; message?: string }> => {
    try {
      const db = await getDatabase();
      await db.collection("patients").deleteOne({ id: data.id });

      try {
        await db.collection("activity_logs").insertOne({
          id: `ACT-${Date.now()}`,
          user: "Clinic Administration",
          action: "Deleted seafarer record",
          subject: `${data.name || data.id} removed from register`,
          time: "Just now",
          kind: "Patients",
          timestamp: new Date().toISOString(),
        });
      } catch {}

      return { success: true };
    } catch (error) {
      console.error("Failed to delete patient from MongoDB:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to delete patient.",
      };
    }
  });

// ==========================================
// INVOICES SERVER FUNCTIONS
// ==========================================
export const listInvoicesServer = createServerFn({ method: "GET" }).handler(
  async (): Promise<InvoiceRecord[]> => {
    try {
      await ensureCollectionsSeeded();
      const db = await getDatabase();
      const raw = await db
        .collection("invoices")
        .find({}, { projection: { _id: 0 } })
        .sort({ date: -1 })
        .toArray();

      if (!raw || raw.length === 0) {
        return invoiceRecords;
      }

      return JSON.parse(JSON.stringify(raw)) as InvoiceRecord[];
    } catch (error) {
      console.error("Failed to load invoices from MongoDB:", error);
      return invoiceRecords;
    }
  },
);

export const saveInvoiceServer = createServerFn({ method: "POST" })
  .validator((input: unknown): InvoiceRecord => input as InvoiceRecord)
  .handler(async ({ data }): Promise<{ success: boolean; invoice: InvoiceRecord; message?: string }> => {
    try {
      const db = await getDatabase();
      const cleanInvoice = JSON.parse(JSON.stringify(data)) as InvoiceRecord;

      await db.collection("invoices").updateOne(
        { id: cleanInvoice.id },
        { $set: cleanInvoice },
        { upsert: true },
      );

      try {
        await db.collection("activity_logs").insertOne({
          id: `ACT-${Date.now()}`,
          user: "Billing Desk",
          action: "Saved invoice",
          subject: `${cleanInvoice.id} · ${cleanInvoice.amount} for ${cleanInvoice.patient}`,
          time: "Just now",
          kind: "Billing",
          timestamp: new Date().toISOString(),
        });
      } catch {}

      return { success: true, invoice: cleanInvoice };
    } catch (error) {
      console.error("Failed to save invoice in MongoDB:", error);
      return {
        success: false,
        invoice: data as InvoiceRecord,
        message: error instanceof Error ? error.message : "Failed to save invoice.",
      };
    }
  });

export const deleteInvoiceServer = createServerFn({ method: "POST" })
  .validator((input: unknown): { id: string } => input as { id: string })
  .handler(async ({ data }): Promise<{ success: boolean; message?: string }> => {
    try {
      const db = await getDatabase();
      await db.collection("invoices").deleteOne({ id: data.id });
      return { success: true };
    } catch (error) {
      console.error("Failed to delete invoice from MongoDB:", error);
      return { success: false, message: error instanceof Error ? error.message : "Failed to delete invoice." };
    }
  });

// ==========================================
// FEEDBACK & COMPLAINTS SERVER FUNCTIONS
// ==========================================
export const listFeedbackServer = createServerFn({ method: "GET" }).handler(
  async (): Promise<FeedbackRecord[]> => {
    try {
      await ensureCollectionsSeeded();
      const db = await getDatabase();
      const raw = await db
        .collection("feedback")
        .find({}, { projection: { _id: 0 } })
        .sort({ createdAt: -1 })
        .toArray();

      if (!raw || raw.length === 0) {
        return initialFeedbackRecords;
      }

      const sanitized = raw.map((item: any) => ({
        id: String(item.id || `SMC-FB-${Date.now()}`),
        date: String(item.date || new Date().toISOString().slice(0, 10)),
        name: String(item.name || "Candidate"),
        companyName: item.companyName ? String(item.companyName) : "",
        rank: item.rank ? String(item.rank) : "",
        passportOrCdcNo: item.passportOrCdcNo ? String(item.passportOrCdcNo) : "",
        indosNo: item.indosNo ? String(item.indosNo) : "",
        mobileNo: String(item.mobileNo || item.phone || "+91 95614 50104"),
        email: item.email ? String(item.email) : "",
        timeTakenAtReception: item.timeTakenAtReception || "Good",
        skillAndFriendlinessTechnician: item.skillAndFriendlinessTechnician || "Good",
        ecgAudiometryTechnician: item.ecgAudiometryTechnician || "Good",
        guidanceByStaffDuringWait: item.guidanceByStaffDuringWait || "Good",
        hygieneCleanlinessClinics: item.hygieneCleanlinessClinics || "Good",
        friendlinessMedicalStaff: item.friendlinessMedicalStaff || "Good",
        interactionWithDoctor: item.interactionWithDoctor || "Good",
        turnaroundTimeReports: item.turnaroundTimeReports || "Good",
        suggestionsComments: item.suggestionsComments || item.message || "",
        candidateSignature: item.candidateSignature || item.name || "",
        status: (item.status as FeedbackStatus) || "New",
        createdAt: String(item.createdAt || new Date().toISOString()),
        resolutionRemarks: item.resolutionRemarks ? String(item.resolutionRemarks) : "",
        resolvedAt: item.resolvedAt ? String(item.resolvedAt) : "",
      }));

      return JSON.parse(JSON.stringify(sanitized)) as FeedbackRecord[];
    } catch (error) {
      console.error("Failed to load feedback from MongoDB:", error);
      return initialFeedbackRecords;
    }
  },
);

export const submitFeedbackServer = createServerFn({ method: "POST" })
  .validator((input: unknown): CreateFeedbackInput => input as CreateFeedbackInput)
  .handler(
    async ({
      data,
    }): Promise<{
      success: boolean;
      record?: FeedbackRecord;
      message: string;
    }> => {
      try {
        const parsed = createFeedbackSchema.safeParse(data);
        if (!parsed.success) {
          const firstErr = parsed.error.issues[0]?.message || "Invalid submission details.";
          return { success: false, message: firstErr };
        }

        const valid = parsed.data;
        const db = await getDatabase();

        const randomNum = Math.floor(1000 + Math.random() * 9000);
        const recordId = `SMC-FB-${new Date().getFullYear()}-${randomNum}`;

        const record: FeedbackRecord = {
          id: recordId,
          date: valid.date || new Date().toISOString().slice(0, 10),
          name: valid.name,
          ...(valid.companyName ? { companyName: valid.companyName } : {}),
          ...(valid.rank ? { rank: valid.rank } : {}),
          ...(valid.passportOrCdcNo ? { passportOrCdcNo: valid.passportOrCdcNo } : {}),
          ...(valid.indosNo ? { indosNo: valid.indosNo } : {}),
          mobileNo: valid.mobileNo,
          ...(valid.email ? { email: valid.email } : {}),
          timeTakenAtReception: valid.timeTakenAtReception,
          skillAndFriendlinessTechnician: valid.skillAndFriendlinessTechnician,
          ecgAudiometryTechnician: valid.ecgAudiometryTechnician,
          guidanceByStaffDuringWait: valid.guidanceByStaffDuringWait,
          hygieneCleanlinessClinics: valid.hygieneCleanlinessClinics,
          friendlinessMedicalStaff: valid.friendlinessMedicalStaff,
          interactionWithDoctor: valid.interactionWithDoctor,
          turnaroundTimeReports: valid.turnaroundTimeReports,
          ...(valid.suggestionsComments ? { suggestionsComments: valid.suggestionsComments } : {}),
          candidateSignature: valid.candidateSignature || valid.name,
          status: "New",
          createdAt: new Date().toISOString(),
        };

        // Clone before insert so MongoDB driver does not mutate object with ObjectId
        await db.collection("feedback").insertOne({ ...record });

        // Log to activity log
        try {
          await db.collection("activity_logs").insertOne({
            id: `ACT-${Date.now()}`,
            user: "Sailors Portal / Candidate",
            action: `Submitted candidate feedback`,
            subject: `${record.id} · ${record.name} (${record.rank || "Seafarer"})`,
            time: "Just now",
            kind: "Feedback",
            timestamp: new Date().toISOString(),
          });
        } catch {}

        const cleanRecord = JSON.parse(JSON.stringify(record)) as FeedbackRecord;
        return {
          success: true,
          record: cleanRecord,
          message: `Your feedback form has been registered under Token #${recordId}.`,
        };
      } catch (error) {
        console.error("Failed to submit feedback to MongoDB:", error);
        return {
          success: false,
          message: "Could not save your submission to MongoDB Atlas. Please check connection and try again.",
        };
      }
    },
  );

export const updateFeedbackStatusServer = createServerFn({ method: "POST" })
  .validator(
    (
      input: unknown,
    ): {
      id: string;
      status: FeedbackStatus;
      resolutionRemarks?: string;
    } => input as { id: string; status: FeedbackStatus; resolutionRemarks?: string },
  )
  .handler(
    async ({
      data,
    }): Promise<{
      success: boolean;
      record?: FeedbackRecord;
      message?: string;
    }> => {
      try {
        const db = await getDatabase();
        const updateDoc: Record<string, unknown> = {
          status: data.status,
        };

        if (data.resolutionRemarks !== undefined) {
          updateDoc.resolutionRemarks = data.resolutionRemarks;
        }

        if (data.status === "Resolved") {
          updateDoc.resolvedAt = new Date().toISOString();
        }

        await db.collection("feedback").updateOne({ id: data.id }, { $set: updateDoc });

        const updated = await db
          .collection("feedback")
          .findOne({ id: data.id }, { projection: { _id: 0 } });

        try {
          await db.collection("activity_logs").insertOne({
            id: `ACT-${Date.now()}`,
            user: "Grievance Redressal Officer",
            action: `Marked grievance as ${data.status.toLowerCase()}`,
            subject: `${data.id} status updated`,
            time: "Just now",
            kind: "Grievance",
            timestamp: new Date().toISOString(),
          });
        } catch {}

        return {
          success: true,
          record: updated ? (JSON.parse(JSON.stringify(updated)) as FeedbackRecord) : undefined,
        };
      } catch (error) {
        console.error("Failed to update feedback status in MongoDB:", error);
        return {
          success: false,
          message: error instanceof Error ? error.message : "Failed to update grievance record.",
        };
      }
    },
  );

export const deleteFeedbackServer = createServerFn({ method: "POST" })
  .validator((input: unknown): { id: string } => input as { id: string })
  .handler(async ({ data }): Promise<{ success: boolean; message?: string }> => {
    try {
      const db = await getDatabase();
      await db.collection("feedback").deleteOne({ id: data.id });
      try {
        await db.collection("activity_logs").insertOne({
          id: `ACT-${Date.now()}`,
          user: "Clinic Administrator",
          action: "Deleted grievance record",
          subject: `${data.id} permanently removed`,
          time: "Just now",
          kind: "Grievance",
          timestamp: new Date().toISOString(),
        });
      } catch {}
      return { success: true };
    } catch (error) {
      console.error("Failed to delete feedback record from MongoDB:", error);
      return { success: false, message: error instanceof Error ? error.message : "Failed to delete record." };
    }
  });

// ==========================================
// ACTIVITY LOGS SERVER FUNCTION
// ==========================================
export const listActivitiesServer = createServerFn({ method: "GET" }).handler(
  async (): Promise<Array<{ user: string; action: string; subject: string; time: string; kind: string }>> => {
    try {
      await ensureCollectionsSeeded();
      const db = await getDatabase();
      const raw = await db
        .collection("activity_logs")
        .find({}, { projection: { _id: 0 } })
        .sort({ timestamp: -1 })
        .limit(20)
        .toArray();

      if (!raw || raw.length === 0) {
        return activityRecords;
      }

      return JSON.parse(JSON.stringify(raw));
    } catch {
      return activityRecords;
    }
  },
);

// ==========================================
// STAFF MANAGEMENT SERVER FUNCTIONS
// ==========================================
export const listStaffServer = createServerFn({ method: "GET" }).handler(
  async (): Promise<StaffMember[]> => {
    try {
      await ensureCollectionsSeeded();
      const db = await getDatabase();
      const raw = await db
        .collection("staff")
        .find({}, { projection: { _id: 0 } })
        .sort({ joiningDate: 1 })
        .toArray();

      if (!raw || raw.length === 0) {
        return initialStaffMembers;
      }

      const sanitized = raw.map((item: any) => ({
        id: String(item.id || `SMC-EMP-${Date.now().toString().slice(-3)}`),
        name: String(item.name || "Employee"),
        initials: String(item.initials || "EM"),
        gender: item.gender || "Male",
        dob: String(item.dob || "1990-01-01"),
        phone: String(item.phone || "+91 95614 50104"),
        email: String(item.email || "staff@sailorsmedical.com"),
        address: String(item.address || "Navi Mumbai, Maharashtra"),
        emergencyContactName: String(item.emergencyContactName || "Emergency Contact"),
        emergencyContactPhone: String(item.emergencyContactPhone || "+91 95614 50104"),
        role: String(item.role || "Staff Member"),
        department: item.department || "Clinic Administration",
        employmentType: item.employmentType || "Full-time",
        status: item.status || "Active / On duty",
        joiningDate: String(item.joiningDate || "2023-01-01"),
        schedule: String(item.schedule || "Mon – Fri, 9:00 AM – 5:00 PM"),
        resignationDate: item.resignationDate ? String(item.resignationDate) : undefined,
        relievingDate: item.relievingDate ? String(item.relievingDate) : undefined,
        resignationReason: item.resignationReason ? String(item.resignationReason) : undefined,
        noticePeriodDays: typeof item.noticePeriodDays === "number" ? item.noticePeriodDays : 30,
        basicSalary: Number(item.basicSalary) || 40000,
        allowances: Number(item.allowances) || 8000,
        deductions: Number(item.deductions) || 2000,
        netSalary: Number(item.netSalary) || 46000,
        payFrequency: item.payFrequency || "Monthly",
        panNo: item.panNo ? String(item.panNo) : undefined,
        bankName: item.bankName ? String(item.bankName) : undefined,
        bankAccountNo: item.bankAccountNo ? String(item.bankAccountNo) : undefined,
        ifscCode: item.ifscCode ? String(item.ifscCode) : undefined,
        documents: Array.isArray(item.documents) ? item.documents : [],
        notes: item.notes ? String(item.notes) : undefined,
        createdAt: String(item.createdAt || new Date().toISOString()),
        updatedAt: item.updatedAt ? String(item.updatedAt) : undefined,
      }));

      return JSON.parse(JSON.stringify(sanitized)) as StaffMember[];
    } catch (error) {
      console.error("Failed to load staff members from MongoDB:", error);
      return initialStaffMembers;
    }
  },
);

export const saveStaffServer = createServerFn({ method: "POST" })
  .validator((input: unknown): StaffMember => input as StaffMember)
  .handler(async ({ data }): Promise<{ success: boolean; staffMember: StaffMember; message?: string }> => {
    try {
      const db = await getDatabase();
      const clean = JSON.parse(JSON.stringify(data)) as StaffMember;
      clean.updatedAt = new Date().toISOString();

      await db.collection("staff").updateOne(
        { id: clean.id },
        { $set: clean },
        { upsert: true },
      );

      try {
        await db.collection("activity_logs").insertOne({
          id: `ACT-${Date.now()}`,
          user: "Admin / HR",
          action: "Updated staff member record",
          subject: `${clean.name} · ${clean.role} (${clean.id})`,
          time: "Just now",
          kind: "Staff",
          timestamp: new Date().toISOString(),
        });
      } catch {}

      return { success: true, staffMember: clean };
    } catch (error) {
      console.error("Failed to save staff member to MongoDB:", error);
      return {
        success: false,
        staffMember: data as StaffMember,
        message: error instanceof Error ? error.message : "Failed to save staff member.",
      };
    }
  });

export const deleteStaffServer = createServerFn({ method: "POST" })
  .validator((input: unknown): { id: string; name: string } => input as { id: string; name: string })
  .handler(async ({ data }): Promise<{ success: boolean; message?: string }> => {
    try {
      const db = await getDatabase();
      await db.collection("staff").deleteOne({ id: data.id });

      try {
        await db.collection("activity_logs").insertOne({
          id: `ACT-${Date.now()}`,
          user: "Admin / HR",
          action: "Removed staff record",
          subject: `${data.name} · ID ${data.id}`,
          time: "Just now",
          kind: "Staff",
          timestamp: new Date().toISOString(),
        });
      } catch {}

      return { success: true };
    } catch (error) {
      console.error("Failed to delete staff member from MongoDB:", error);
      return { success: false, message: error instanceof Error ? error.message : "Failed to delete record." };
    }
  });

