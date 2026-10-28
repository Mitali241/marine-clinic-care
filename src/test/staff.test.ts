import { describe, expect, it } from "vitest";
import {
  staffMemberSchema,
  initialStaffMembers,
  staffDepartments,
  staffStatuses,
} from "@/lib/staff";

describe("Staff Management Module validation", () => {
  it("validates a complete staff member with documents and salary", () => {
    const input = {
      id: "SMC-EMP-099",
      name: "Dr. Vikram Malhotra",
      initials: "VM",
      gender: "Male" as const,
      dob: "1985-05-12",
      phone: "+91 98200 12345",
      email: "dr.vikram@sailorsmedical.com",
      address: "Seawoods, Navi Mumbai",
      emergencyContactName: "Anjali Malhotra",
      emergencyContactPhone: "+91 98200 54321",
      role: "DG Shipping Approved Medical Examiner",
      department: "Medical & DG Examinations" as const,
      employmentType: "Full-time" as const,
      status: "Active / On duty" as const,
      joiningDate: "2023-01-10",
      schedule: "Mon – Fri, 8:00 AM – 4:00 PM",
      basicSalary: 120000,
      allowances: 20000,
      deductions: 5000,
      netSalary: 135000,
      payFrequency: "Monthly" as const,
      panNo: "ABCDE1234F",
      bankName: "HDFC Bank",
      bankAccountNo: "•••• •••• 9812",
      ifscCode: "HDFC0001245",
      documents: [
        {
          id: "DOC-101",
          name: "DG Shipping Medical Examiner Approval",
          type: "Medical License & DG Approval" as const,
          documentNo: "DG-MED-2023-11",
          verificationStatus: "Verified" as const,
        },
      ],
    };

    const parsed = staffMemberSchema.safeParse(input);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.name).toBe("Dr. Vikram Malhotra");
      expect(parsed.data.documents).toHaveLength(1);
      expect(parsed.data.documents[0].verificationStatus).toBe("Verified");
    }
  });

  it("validates a resigned employee with exit and relieving dates", () => {
    const input = {
      id: "SMC-EMP-007",
      name: "Priya Deshmukh",
      initials: "PD",
      gender: "Female" as const,
      phone: "+91 98190 77123",
      email: "priya.d@sailorsmedical.com",
      role: "Front Desk Executive",
      department: "Clinic Administration" as const,
      status: "Resigned" as const,
      joiningDate: "2023-09-01",
      resignationDate: "2026-08-31",
      relievingDate: "2026-09-30",
      resignationReason: "Relocated to Pune for higher studies",
      noticePeriodDays: 30,
      basicSalary: 32000,
      allowances: 4000,
      deductions: 1200,
      netSalary: 34800,
    };

    const parsed = staffMemberSchema.safeParse(input);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.status).toBe("Resigned");
      expect(parsed.data.resignationDate).toBe("2026-08-31");
      expect(parsed.data.relievingDate).toBe("2026-09-30");
    }
  });

  it("fails validation if name or role is missing", () => {
    const invalid = {
      id: "SMC-EMP-000",
      name: "",
      role: "",
      phone: "+91 99999 99999",
      email: "test@example.com",
      joiningDate: "2026-01-01",
    };
    const parsed = staffMemberSchema.safeParse(invalid);
    expect(parsed.success).toBe(false);
  });

  it("contains rich initial staff members for Sailors Medical Clinic", () => {
    expect(initialStaffMembers.length).toBeGreaterThanOrEqual(5);
    for (const sm of initialStaffMembers) {
      expect(sm.id).toMatch(/^SMC-EMP-/);
      expect(sm.name).toBeDefined();
      expect(sm.role).toBeDefined();
      expect(sm.joiningDate).toBeDefined();
      expect(sm.basicSalary).toBeGreaterThan(0);
      expect(Array.isArray(sm.documents)).toBe(true);
    }
  });
});
