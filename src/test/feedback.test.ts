import { describe, expect, it } from "vitest";
import {
  createFeedbackSchema,
  initialFeedbackRecords,
  ratingOptions,
  feedbackQuestions,
} from "@/lib/feedback";

describe("Sailor's Medical Clinic feedback validation", () => {
  it("validates a complete DG Shipping candidate feedback submission", () => {
    const input = {
      name: "Capt. Rajesh Nair",
      date: "2026-10-27",
      companyName: "Maersk Marine Services",
      rank: "Master / Captain",
      passportOrCdcNo: "MUM 248910",
      indosNo: "02NL1844",
      mobileNo: "+91 95614 50104",
      email: "rajesh.nair@maritime.demo",
      timeTakenAtReception: "Good" as const,
      skillAndFriendlinessTechnician: "Excellent" as const,
      ecgAudiometryTechnician: "Excellent" as const,
      guidanceByStaffDuringWait: "Good" as const,
      hygieneCleanlinessClinics: "Excellent" as const,
      friendlinessMedicalStaff: "Excellent" as const,
      interactionWithDoctor: "Excellent" as const,
      turnaroundTimeReports: "Good" as const,
      suggestionsComments: "Prompt service and courteous medical staff.",
      candidateSignature: "Capt. Rajesh Nair",
    };

    const parsed = createFeedbackSchema.safeParse(input);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.name).toBe("Capt. Rajesh Nair");
      expect(parsed.data.timeTakenAtReception).toBe("Good");
      expect(parsed.data.hygieneCleanlinessClinics).toBe("Excellent");
    }
  });

  it("applies default ratings when optional criteria ratings are not explicitly overridden", () => {
    const input = {
      name: "Pooja Sharma",
      date: "2026-10-27",
      mobileNo: "+91 98402 11963",
    };

    const parsed = createFeedbackSchema.safeParse(input);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.timeTakenAtReception).toBe("Good");
      expect(parsed.data.turnaroundTimeReports).toBe("Good");
    }
  });

  it("rejects invalid inputs when name or mobile is missing or invalid", () => {
    const invalidShortName = {
      name: "A",
      date: "2026-10-27",
      mobileNo: "+91 95614 50104",
    };
    expect(createFeedbackSchema.safeParse(invalidShortName).success).toBe(false);

    const invalidShortMobile = {
      name: "Capt. Nair",
      date: "2026-10-27",
      mobileNo: "123", // too short
    };
    expect(createFeedbackSchema.safeParse(invalidShortMobile).success).toBe(false);
  });

  it("has exactly 8 feedback questions matching the physical form", () => {
    expect(feedbackQuestions).toHaveLength(8);
    expect(ratingOptions).toEqual(["Excellent", "Good", "Avg", "Below Avg"]);
    expect(feedbackQuestions[0].label).toBe("Time taken at reception");
    expect(feedbackQuestions[7].label).toBe("Turnaround time for reports");
  });

  it("has valid initial Sailor's Medical Clinic feedback records", () => {
    expect(initialFeedbackRecords.length).toBeGreaterThanOrEqual(4);
    for (const r of initialFeedbackRecords) {
      expect(r.id).toMatch(/^SMC-FB-/);
      expect(r.name).toBeDefined();
      expect(r.mobileNo).toBeDefined();
      expect(r.timeTakenAtReception).toBeDefined();
      expect(r.status).toBeDefined();
    }
  });
});
