import { describe, expect, it } from "vitest";

import { canAccessSection, getVisibleSections } from "@/lib/clinic";

describe("clinic role visibility", () => {
  it("shows Staff only Dashboard, Patient Records, Invoices, Payments, and Reports", () => {
    expect(getVisibleSections("staff").map((section) => section.label)).toEqual([
      "Dashboard",
      "Patient Records",
      "Invoices",
      "Payments",
      "Reports",
    ]);
  });

  it("shows Admin every workspace and clinic administration section", () => {
    expect(getVisibleSections("admin").map((section) => section.label)).toEqual([
      "Dashboard",
      "Patient Records",
      "Invoices",
      "Payments",
      "Staff Management",
      "Reports",
      "Activity Logs",
      "Settings",
    ]);
  });

  it("denies Staff direct access to admin-only sections", () => {
    expect(canAccessSection("staff", "staff")).toBe(false);
    expect(canAccessSection("staff", "activity")).toBe(false);
    expect(canAccessSection("staff", "settings")).toBe(false);
  });
});