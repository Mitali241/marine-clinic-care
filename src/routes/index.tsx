import { createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  ArrowDownLeft,
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Bell,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ClipboardList,
  Clock3,
  CreditCard,
  Download,
  FileChartColumnIncreasing,
  FilePlus2,
  FileText,
  Filter,
  HeartPulse,
  LayoutDashboard,
  LogOut,
  Menu,
  MoreHorizontal,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Stethoscope,
  UserRound,
  UserRoundPlus,
  Users,
  WalletCards,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  activityRecords,
  appointmentRecords,
  canAccessSection,
  clinicSections,
  getVisibleSections,
  initialPatients,
  invoiceRecords,
  paymentRecords,
  staffRecords,
  type ClinicRole,
  type ClinicSection,
  type PatientRecord,
} from "@/lib/clinic";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Marine Clinic | Clinical workspace" },
      {
        name: "description",
        content: "A clear, connected view of patient care and clinic operations.",
      },
      { property: "og:title", content: "Marine Clinic | Clinical workspace" },
      {
        property: "og:description",
        content: "A clear, connected view of patient care and clinic operations.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ClinicApp,
});

const navIcons: Record<ClinicSection, typeof LayoutDashboard> = {
  dashboard: LayoutDashboard,
  patients: Users,
  invoices: FileText,
  payments: CreditCard,
  staff: UserRound,
  reports: FileChartColumnIncreasing,
  activity: Activity,
  settings: Settings,
};

const sectionDescriptions: Record<ClinicSection, string> = {
  dashboard: "Here's what's happening across your clinic today.",
  patients: "View and manage your clinic's patient records.",
  invoices: "Manage billing and keep tabs on outstanding balances.",
  payments: "A real-time view of incoming payments and transactions.",
  staff: "Manage your clinical team and day-to-day coverage.",
  reports: "Track clinic performance and financial health.",
  activity: "A secure timeline of changes across your clinic.",
  settings: "Manage your clinic details and workspace preferences.",
};

function ClinicApp() {
  const [role, setRole] = useState<ClinicRole | null>(null);
  const [section, setSection] = useState<ClinicSection>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [patients, setPatients] = useState(initialPatients);
  const [patientSearch, setPatientSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("Today, Oct 21, 2026");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 3200);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const openSection = (target: ClinicSection) => {
    if (role && !canAccessSection(role, target)) {
      setNotice("This section is only available to administrators.");
      return;
    }
    setSection(target);
    setPatientSearch("");
    setMobileMenuOpen(false);
  };

  if (!role) {
    return <SignIn onSignIn={setRole} />;
  }

  const visibleSections = getVisibleSections(role);
  const adminName = role === "admin" ? "Mitali Gadge" : "Rachel Adams";
  const adminInitials = role === "admin" ? "MG" : "RA";

  return (
    <div className="min-h-svh bg-background text-foreground">
      <div className="flex min-h-svh">
        <aside
          className={`hidden shrink-0 flex-col border-r border-border bg-sidebar transition-[width] duration-200 lg:flex ${sidebarOpen ? "w-64" : "w-20"}`}
        >
          <SidebarContent
            role={role}
            active={section}
            collapsed={!sidebarOpen}
            onSelect={openSection}
          />
        </aside>

        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent side="left" className="w-72 p-0">
            <SheetTitle className="sr-only">Clinic navigation</SheetTitle>
            <SidebarContent
              role={role}
              active={section}
              collapsed={false}
              onSelect={openSection}
            />
          </SheetContent>
        </Sheet>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-3 border-b border-border bg-card/95 px-4 backdrop-blur sm:px-6 lg:px-8">
            <Button
              aria-label="Open navigation"
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu />
            </Button>
            <Button
              aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
              title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
              variant="ghost"
              size="icon"
              className="hidden lg:inline-flex"
              onClick={() => setSidebarOpen((current) => !current)}
            >
              {sidebarOpen ? <PanelLeftClose /> : <PanelLeftOpen />}
            </Button>
            <div className="hidden h-5 w-px bg-border sm:block" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="hidden sm:inline">Clinic</span>
                <ChevronRight className="hidden size-3.5 sm:block" />
                <span className="truncate font-medium text-foreground">
                  {clinicSections.find((item) => item.id === section)?.label}
                </span>
              </div>
            </div>
            <div className="hidden items-center gap-2 text-right sm:flex">
              <span className="grid size-8 place-items-center rounded-md border border-border bg-muted text-primary">
                <CalendarDays className="size-4" />
              </span>
              <span className="text-sm font-medium">Wednesday, Oct 21</span>
              <ChevronDown className="size-4 text-muted-foreground" />
            </div>
            <Button
              aria-label="Notifications"
              title="Notifications"
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => setNotice("You're all caught up on notifications.")}
            >
              <Bell />
              <span className="absolute right-2 top-2 size-2 rounded-full bg-primary ring-2 ring-card" />
            </Button>
            <div className="hidden h-8 w-px bg-border sm:block" />
            <button
              type="button"
              aria-label={`${adminName} account`}
              title={`${adminName} · ${role === "admin" ? "Admin" : "Staff"}`}
              className="flex items-center gap-2 rounded-md p-1.5 pr-0 text-left transition-colors hover:bg-muted"
              onClick={() => {
                setRole(null);
                setSection("dashboard");
              }}
            >
              <Avatar className="size-8">
                <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                  {adminInitials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden text-sm font-semibold md:block">{adminName}</span>
              <LogOut className="ml-1 size-4 text-muted-foreground" />
            </button>
          </header>

          <main className="min-w-0 flex-1">
            <div className="mx-auto w-full max-w-[1440px] px-4 pb-8 pt-7 sm:px-6 sm:pt-8 lg:px-8">
              <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <div className="mb-1 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <span className="size-1.5 rounded-full bg-[color:var(--chart-2)]" />
                    CLINIC OVERVIEW
                  </div>
                  <h1 className="text-2xl font-semibold tracking-normal sm:text-[26px]">
                    {clinicSections.find((item) => item.id === section)?.label}
                  </h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {sectionDescriptions[section]}
                  </p>
                </div>
                <PageActions section={section} onSelect={openSection} onNotice={setNotice} />
              </div>

              {section === "dashboard" && (
                <Dashboard onSelect={openSection} onNotice={setNotice} />
              )}
              {section === "patients" && (
                <PatientRecords
                  patients={patients}
                  search={patientSearch}
                  onSearch={setPatientSearch}
                  onAdd={() => openSection("patients")}
                  onNotice={setNotice}
                />
              )}
              {section === "invoices" && <InvoiceView onNotice={setNotice} />}
              {section === "payments" && <PaymentView onNotice={setNotice} />}
              {section === "staff" && <StaffView onNotice={setNotice} />}
              {section === "reports" && <ReportsView dateFilter={dateFilter} onDateFilter={setDateFilter} />} 
              {section === "activity" && <ActivityView />}
              {section === "settings" && <SettingsView onNotice={setNotice} />}

              {section === "patients" && (
                <AddPatientForm
                  onAdd={(patient) => {
                    setPatients((current) => [patient, ...current]);
                    setNotice(`${patient.name} was added to patient records.`);
                  }}
                />
              )}
            </div>
          </main>
          <footer className="border-t border-border px-4 py-4 text-center text-xs text-muted-foreground sm:px-6 lg:px-8">
            Marine Clinic <span className="mx-1.5">·</span> Secure care, clearly connected
            <span className="mx-1.5">·</span> Workspace demo
          </footer>
        </div>
      </div>

      {notice && (
        <div
          role="status"
          className="fixed bottom-5 right-5 z-[60] flex max-w-[calc(100vw-2rem)] items-start gap-2.5 rounded-md border border-border bg-card px-4 py-3 text-sm shadow-lg"
        >
          <Check className="mt-0.5 size-4 shrink-0 text-accent-foreground" />
          <span>{notice}</span>
          <Button
            aria-label="Dismiss notification"
            variant="ghost"
            size="icon"
            className="-mr-2 -mt-1 size-7"
            onClick={() => setNotice("")}
          >
            <X className="size-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}

function SidebarContent({
  role,
  active,
  collapsed,
  onSelect,
}: {
  role: ClinicRole;
  active: ClinicSection;
  collapsed: boolean;
  onSelect: (target: ClinicSection) => void;
}) {
  const groups = getVisibleSections(role).reduce(
    (acc, item) => {
      acc[item.group] = [...(acc[item.group] ?? []), item];
      return acc;
    },
    {} as Record<string, typeof clinicSections>,
  );

  return (
    <div className="flex h-full flex-col">
      <div className={`flex h-16 shrink-0 items-center border-b border-sidebar-border px-5 ${collapsed ? "justify-center px-3" : "gap-3"}`}>
        <span className="grid size-9 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground">
          <Stethoscope className="size-[19px]" />
        </span>
        {!collapsed && (
          <div className="min-w-0">
            <div className="text-[15px] font-semibold leading-tight">Marine Clinic</div>
            <div className="mt-1 text-[10px] font-medium uppercase leading-none text-muted-foreground">
              Care, connected
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-5">
        {!collapsed && (
          <div className="mb-5 flex items-center gap-2 rounded-md border border-sidebar-border bg-muted/50 px-3 py-2">
            <div className="grid size-8 shrink-0 place-items-center rounded bg-accent text-accent-foreground">
              <HeartPulse className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold">Marine Clinic</p>
              <p className="mt-0.5 truncate text-[10px] text-muted-foreground">New York, NY</p>
            </div>
            <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
          </div>
        )}

        {Object.entries(groups).map(([groupName, items], groupIndex) => (
          <div key={groupName} className={groupIndex > 0 ? "mt-7" : ""}>
            {!collapsed && (
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase text-muted-foreground">
                {groupName}
              </p>
            )}
            <nav aria-label={groupName} className="space-y-1">
              {items.map((item) => {
                const Icon = navIcons[item.id];
                const selected = active === item.id;
                return (
                  <Button
                    type="button"
                    key={item.id}
                    variant="ghost"
                    title={collapsed ? item.label : undefined}
                    aria-current={selected ? "page" : undefined}
                    aria-label={collapsed ? item.label : undefined}
                    onClick={() => onSelect(item.id)}
                    className={`h-9 w-full justify-start gap-2.5 rounded-md px-3 text-[13px] font-medium ${selected ? "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary" : "text-muted-foreground hover:text-foreground"} ${collapsed ? "justify-center px-0" : ""}`}
                  >
                    <Icon className="size-[17px] shrink-0" />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                    {!collapsed && item.id === "patients" && (
                      <span className="ml-auto rounded px-1.5 py-0.5 text-[10px] text-muted-foreground">
                        {initialPatients.length.toString().padStart(2, "0")}
                      </span>
                    )}
                  </Button>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      <div className={`border-t border-sidebar-border p-3 ${collapsed ? "flex justify-center" : ""}`}>
        {collapsed ? (
          <Avatar className="size-9">
            <AvatarFallback className="bg-secondary text-xs font-semibold text-secondary-foreground">{role === "admin" ? "MG" : "RA"}</AvatarFallback>
          </Avatar>
        ) : (
          <div className="flex items-center gap-2.5 rounded-md px-2 py-2">
            <Avatar className="size-9">
              <AvatarFallback className="bg-secondary text-xs font-semibold text-secondary-foreground">{role === "admin" ? "MG" : "RA"}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-semibold">{role === "admin" ? "Mitali Gadge" : "Rachel Adams"}</div>
              <div className="mt-0.5 flex items-center gap-1 text-[10px] text-muted-foreground">
                <ShieldCheck className="size-3" />
                {role === "admin" ? "Administrator" : "Staff member"}
              </div>
            </div>
            <MoreHorizontal className="size-4 text-muted-foreground" />
          </div>
        )}
      </div>
    </div>
  );
}

function SignIn({ onSignIn }: { onSignIn: (role: ClinicRole) => void }) {
  const [selectedRole, setSelectedRole] = useState<ClinicRole>("admin");
  const [email, setEmail] = useState("mitali@marineclinic.demo");
  const [password, setPassword] = useState("clinic-demo");

  const chooseRole = (nextRole: ClinicRole) => {
    setSelectedRole(nextRole);
    setEmail(nextRole === "admin" ? "mitali@marineclinic.demo" : "rachel@marineclinic.demo");
  };

  return (
    <main className="grid min-h-svh bg-card lg:grid-cols-[1.05fr_0.95fr]">
      <section className="clinic-grid relative hidden min-h-svh overflow-hidden border-r border-border bg-secondary/50 px-12 py-10 lg:flex lg:flex-col xl:px-20">
        <div className="absolute right-[-12%] top-[18%] size-[450px] rounded-full border border-primary/10" />
        <div className="absolute right-[-3%] top-[26%] size-[310px] rounded-full border border-primary/10" />
        <div className="absolute right-[8%] top-[35%] size-[145px] rounded-full border border-primary/10" />
        <div className="relative flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-md bg-primary text-primary-foreground">
            <Stethoscope className="size-5" />
          </span>
          <div>
            <div className="text-[15px] font-semibold">Marine Clinic</div>
            <div className="text-[11px] text-muted-foreground">Care, connected</div>
          </div>
        </div>
        <div className="relative my-auto max-w-[560px] pb-12 pt-14">
          <p className="mb-4 flex items-center gap-2 text-xs font-medium uppercase text-primary">
            <span className="size-1.5 rounded-full bg-primary" /> YOUR CLINIC. ONE CLEAR VIEW.
          </p>
          <h1 className="max-w-[500px] text-[44px] font-semibold leading-[1.1] tracking-normal text-foreground xl:text-[52px]">
            Thoughtful care begins with a better view.
          </h1>
          <p className="mt-5 max-w-[430px] text-base leading-7 text-muted-foreground">
            Keep people, care, and clinic operations moving together — from the first visit to the final follow-up.
          </p>
          <div className="mt-10 flex items-center gap-3 border-t border-border pt-6">
            <div className="flex -space-x-2">
              {["MB", "DK", "RA", "AK"].map((initials) => (
                <Avatar key={initials} className="size-9 border-2 border-background">
                  <AvatarFallback className="bg-card text-[10px] font-semibold text-secondary-foreground">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
            <p className="text-xs leading-5 text-muted-foreground">
              <span className="font-semibold text-foreground">One connected team</span>
              <br />working together for every patient
            </p>
            <HeartPulse className="ml-auto size-8 text-primary/40" />
          </div>
        </div>
        <div className="relative flex items-center justify-between border-t border-border pt-5 text-[11px] text-muted-foreground">
          <span>© 2026 Marine Clinic</span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="size-3.5 text-primary" /> Private and secure
          </span>
        </div>
      </section>

      <section className="flex min-h-svh items-center justify-center px-5 py-10 sm:px-10 lg:px-12">
        <div className="w-full max-w-[430px]">
          <div className="mb-10 flex items-center gap-3 lg:hidden">
            <span className="grid size-10 place-items-center rounded-md bg-primary text-primary-foreground">
              <Stethoscope className="size-5" />
            </span>
            <div>
              <div className="text-[15px] font-semibold">Marine Clinic</div>
              <div className="text-[11px] text-muted-foreground">Care, connected</div>
            </div>
          </div>
          <div className="mb-8">
            <div className="mb-2 text-xs font-medium uppercase text-primary">Welcome back</div>
            <h2 className="text-[28px] font-semibold leading-tight">Sign in to your workspace</h2>
            <p className="mt-2 text-sm text-muted-foreground">Enter your details to access your clinic.</p>
          </div>

          <form
            className="space-y-5"
            onSubmit={(event) => {
              event.preventDefault();
              onSignIn(selectedRole);
            }}
          >
            <fieldset>
              <legend className="mb-2.5 text-sm font-medium">Sign in as</legend>
              <div className="grid grid-cols-2 gap-3">
                {(["admin", "staff"] as const).map((nextRole) => {
                  const active = selectedRole === nextRole;
                  const Icon = nextRole === "admin" ? ShieldCheck : Users;
                  return (
                    <Button
                      key={nextRole}
                      type="button"
                      variant="outline"
                      aria-pressed={active}
                      onClick={() => chooseRole(nextRole)}
                      className={`h-auto justify-start gap-3 rounded-md p-3.5 text-left ${active ? "border-primary bg-primary/5 ring-1 ring-primary" : ""}`}
                    >
                      <span className="grid size-9 place-items-center rounded-md bg-secondary text-primary">
                        <Icon className="size-[18px]" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold capitalize text-foreground">
                          {nextRole === "admin" ? "Admin" : "Staff"}
                        </span>
                        <span className="mt-0.5 block text-[10px] font-normal text-muted-foreground">
                          {nextRole === "admin" ? "Full workspace" : "Care team access"}
                        </span>
                      </span>
                    </Button>
                  );
                })}
              </div>
            </fieldset>

            <div className="space-y-2">
              <label htmlFor="clinic-email" className="text-sm font-medium">Email address</label>
              <Input
                id="clinic-email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="h-10 rounded-md"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="clinic-password" className="text-sm font-medium">Password</label>
              <Input
                id="clinic-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="h-10 rounded-md"
                required
              />
            </div>

            <Button type="submit" className="h-10 w-full justify-center rounded-md text-sm font-semibold">
              Sign in securely
              <ArrowRight className="size-4" />
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3 text-[11px] text-muted-foreground">
            <div className="h-px flex-1 bg-border" />
            <span>DEMO WORKSPACE</span>
            <div className="h-px flex-1 bg-border" />
          </div>
          <p className="text-center text-xs leading-5 text-muted-foreground">
            Use the role selector above to explore the Admin and Staff experience.
            <br />No patient information is stored.
          </p>
        </div>
      </section>
    </main>
  );
}

function PageActions({
  section,
  onSelect,
  onNotice,
}: {
  section: ClinicSection;
  onSelect: (target: ClinicSection) => void;
  onNotice: (message: string) => void;
}) {
  if (section === "patients") {
    return (
      <Button onClick={() => document.getElementById("add-patient")?.scrollIntoView({ behavior: "smooth", block: "start" })}>
        <UserRoundPlus />
        Add patient
      </Button>
    );
  }
  if (section === "dashboard") {
    return (
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => onNotice("Today's clinic summary is ready to download.")}>
          <Download />
          <span className="hidden sm:inline">Export</span>
        </Button>
        <Button onClick={() => onSelect("patients")}>
          <Plus />
          New patient
        </Button>
      </div>
    );
  }
  if (section === "invoices") {
    return <Button onClick={() => onNotice("A new invoice draft has been created.")}><FilePlus2 /> New invoice</Button>;
  }
  if (section === "staff") {
    return <Button onClick={() => onNotice("Invite link copied for a new team member.")}><UserRoundPlus /> Add team member</Button>;
  }
  return null;
}

function Dashboard({
  onSelect,
  onNotice,
}: {
  onSelect: (target: ClinicSection) => void;
  onNotice: (message: string) => void;
}) {
  const metricCards = [
    { label: "Total patients", value: "2,486", detail: "+12.8% this month", positive: true, icon: Users, shade: "bg-secondary text-secondary-foreground", trend: "M0 18 L10 15 L20 17 L30 8 L40 11 L50 4 L60 7" },
    { label: "Appointments", value: "64", detail: "+8 scheduled today", positive: true, icon: CalendarDays, shade: "bg-accent text-accent-foreground", trend: "M0 16 L10 13 L20 15 L30 7 L40 10 L50 2 L60 5" },
    { label: "Revenue this month", value: "$48,290", detail: "+6.2% vs last month", positive: true, icon: WalletCards, shade: "bg-[color:color-mix(in_oklab,var(--chart-3)_14%,white)] text-foreground", trend: "M0 19 L10 16 L20 12 L30 15 L40 8 L50 7 L60 2" },
    { label: "Pending invoices", value: "18", detail: "$3,840 outstanding", positive: false, icon: FileText, shade: "bg-[color:color-mix(in_oklab,var(--chart-4)_12%,white)] text-foreground", trend: "M0 5 L10 9 L20 4 L30 11 L40 8 L50 15 L60 13" },
  ];

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-4">
        {metricCards.map((metric) => {
          const Icon = metric.icon;
          return (
            <section key={metric.label} className="rounded-md border border-border bg-card p-4 sm:p-[18px]">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[13px] font-medium text-muted-foreground">{metric.label}</p>
                <span className={`grid size-8 place-items-center rounded ${metric.shade}`}>
                  <Icon className="size-[17px]" />
                </span>
              </div>
              <div className="mt-4 flex items-end justify-between gap-2">
                <div>
                  <p className="text-[26px] font-semibold leading-none">{metric.value}</p>
                  <p className={`mt-2 flex items-center gap-1 text-[11px] ${metric.positive ? "text-accent-foreground" : "text-muted-foreground"}`}>
                    {metric.positive ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
                    {metric.detail}
                  </p>
                </div>
                <svg aria-hidden="true" viewBox="0 0 60 24" className="mb-1 h-8 w-[62px] text-primary/50">
                  <path d={metric.trend} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </section>
          );
        })}
      </div>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(300px,0.85fr)]">
        <section className="min-w-0 rounded-md border border-border bg-card">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-4 sm:px-5">
            <div>
              <h2 className="text-sm font-semibold">Appointments today</h2>
              <p className="mt-1 text-xs text-muted-foreground">Your clinic schedule at a glance</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => onNotice("Full appointment calendar opened.")}>
              View schedule <ArrowRight />
            </Button>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[105px] pl-5">Time</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead className="hidden md:table-cell">Provider</TableHead>
                  <TableHead className="hidden sm:table-cell">Visit type</TableHead>
                  <TableHead className="pr-5 text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointmentRecords.map((appointment) => (
                  <TableRow key={appointment.patient}>
                    <TableCell className="whitespace-nowrap pl-5 text-xs font-medium">{appointment.time}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <Avatar className="size-7">
                          <AvatarFallback className="bg-secondary text-[9px] font-semibold text-secondary-foreground">{appointment.initials}</AvatarFallback>
                        </Avatar>
                        <span className="whitespace-nowrap text-xs font-medium">{appointment.patient}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden whitespace-nowrap text-xs text-muted-foreground md:table-cell">{appointment.doctor}</TableCell>
                    <TableCell className="hidden whitespace-nowrap text-xs text-muted-foreground sm:table-cell">{appointment.type}</TableCell>
                    <TableCell className="pr-5 text-right"><StatusBadge status={appointment.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <button type="button" onClick={() => onSelect("patients")} className="flex w-full items-center justify-between border-t border-border px-5 py-3 text-xs font-medium text-primary hover:bg-muted/40">
            See patient records <ArrowRight className="size-3.5" />
          </button>
        </section>

        <div className="space-y-5">
          <section className="rounded-md border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-4 py-4 sm:px-5">
              <div>
                <h2 className="text-sm font-semibold">Quick actions</h2>
                <p className="mt-1 text-xs text-muted-foreground">Frequently used shortcuts</p>
              </div>
              <MoreHorizontal className="size-4 text-muted-foreground" />
            </div>
            <div className="grid grid-cols-2 gap-2.5 p-4 sm:p-5">
              <QuickAction icon={UserRoundPlus} title="Add patient" detail="Create a new record" onClick={() => onSelect("patients")} />
              <QuickAction icon={FilePlus2} title="New invoice" detail="Start a billing draft" onClick={() => onSelect("invoices")} />
              <QuickAction icon={CreditCard} title="Record payment" detail="Log a transaction" onClick={() => onSelect("payments")} />
              <QuickAction icon={FileChartColumnIncreasing} title="View reports" detail="Explore clinic metrics" onClick={() => onSelect("reports")} />
            </div>
          </section>

          <section className="rounded-md border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-4 py-4 sm:px-5">
              <div>
                <h2 className="text-sm font-semibold">Recent activity</h2>
                <p className="mt-1 text-xs text-muted-foreground">Latest updates from your team</p>
              </div>
              <Button variant="ghost" size="sm" className="h-8 px-2 text-xs text-primary" onClick={() => onSelect("activity")}>
                View all <ArrowRight />
              </Button>
            </div>
            <div className="divide-y divide-border px-4 sm:px-5">
              {activityRecords.slice(0, 3).map((entry) => (
                <div key={entry.subject} className="flex gap-3 py-3.5">
                  <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded bg-secondary text-secondary-foreground">
                    <Activity className="size-3.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs leading-5"><span className="font-semibold">{entry.user}</span> {entry.action.toLowerCase()}</p>
                    <p className="truncate text-[11px] text-muted-foreground">{entry.subject}</p>
                  </div>
                  <span className="whitespace-nowrap pt-0.5 text-[10px] text-muted-foreground">{entry.time}</span>
                </div>
              ))}
            </div>
            <button type="button" onClick={() => onSelect("activity")} className="flex w-full items-center justify-between border-t border-border px-5 py-3 text-xs font-medium text-primary hover:bg-muted/40">
              Open activity log <ArrowRight className="size-3.5" />
            </button>
          </section>
        </div>
      </div>

      <section className="rounded-md border border-border bg-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-4 sm:px-5">
          <div>
            <h2 className="text-sm font-semibold">Recently added patients</h2>
            <p className="mt-1 text-xs text-muted-foreground">The latest patients in your care</p>
          </div>
          <Button variant="ghost" size="sm" className="text-xs text-primary" onClick={() => onSelect("patients")}>
            All patients <ArrowRight />
          </Button>
        </div>
        <PatientTable patients={initialPatients.slice(0, 4)} compact />
      </section>
    </div>
  );
}

function QuickAction({
  icon: Icon,
  title,
  detail,
  onClick,
}: {
  icon: typeof UserRound;
  title: string;
  detail: string;
  onClick: () => void;
}) {
  return (
    <Button type="button" variant="outline" onClick={onClick} className="h-auto min-h-[86px] flex-col items-start justify-start gap-2 rounded-md whitespace-normal px-3 py-3 text-left">
      <span className="grid size-7 place-items-center rounded bg-secondary text-primary"><Icon className="size-4" /></span>
      <span className="w-full text-left">
        <span className="block text-xs font-semibold text-foreground">{title}</span>
        <span className="mt-0.5 block text-[10px] font-normal leading-4 text-muted-foreground">{detail}</span>
      </span>
    </Button>
  );
}

function PatientRecords({
  patients,
  search,
  onSearch,
  onAdd,
  onNotice,
}: {
  patients: PatientRecord[];
  search: string;
  onSearch: (value: string) => void;
  onAdd: () => void;
  onNotice: (message: string) => void;
}) {
  const filtered = useMemo(
    () => patients.filter((patient) => `${patient.name} ${patient.id} ${patient.condition}`.toLowerCase().includes(search.toLowerCase())),
    [patients, search],
  );

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <SmallMetric label="Total records" value="2,486" icon={Users} note="Across all services" />
        <SmallMetric label="Active this month" value="184" icon={Activity} note="+12% from last month" />
        <SmallMetric label="Follow-up due" value="36" icon={CalendarDays} note="Next 7 days" />
      </div>
      <section className="rounded-md border border-border bg-card">
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div>
            <h2 className="text-sm font-semibold">All patient records</h2>
            <p className="mt-1 text-xs text-muted-foreground">{patients.length} patients in this demo workspace</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative sm:w-[230px]">
              <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <Input
                aria-label="Search patient records"
                placeholder="Search patients..."
                value={search}
                onChange={(event) => onSearch(event.target.value)}
                className="h-9 pl-9 text-xs"
              />
            </div>
            <Button variant="outline" size="sm" onClick={() => onNotice("Showing all patient statuses.")}>
              <Filter /> Status
            </Button>
            <Button size="sm" onClick={onAdd}><UserRoundPlus /> Add patient</Button>
          </div>
        </div>
        {filtered.length ? <PatientTable patients={filtered} /> : <EmptyState title="No matching patients" detail="Try another name or record number." />}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-4 py-3 text-xs text-muted-foreground sm:px-5">
          <span>Showing {filtered.length} of {patients.length} records</span>
          <div className="flex items-center gap-1">
            <Button aria-label="Previous page" variant="outline" size="icon" className="size-7" onClick={() => onNotice("You're viewing the newest patient records.")}><ChevronLeft /></Button>
            <Button size="icon" className="size-7" aria-current="page">1</Button>
            <Button aria-label="Next page" variant="outline" size="icon" className="size-7" onClick={() => onNotice("There are no additional demo records.")}><ChevronRight /></Button>
          </div>
        </div>
      </section>
      <section id="add-patient" className="scroll-mt-24 rounded-md border border-border bg-card">
        <AddPatientForm onAdd={(patient) => {
          onSearch("");
          onNotice(`${patient.name} was added to patient records.`);
        }} />
      </section>
    </div>
  );
}

function AddPatientForm({ onAdd }: { onAdd: (patient: PatientRecord) => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [condition, setCondition] = useState("");
  const [age, setAge] = useState("");

  return (
    <form
      className="p-4 sm:p-5"
      onSubmit={(event) => {
        event.preventDefault();
        const cleanName = name.trim();
        if (!cleanName) return;
        onAdd({
          id: `PT-${Date.now().toString().slice(-4)}`,
          name: cleanName,
          initials: cleanName.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase(),
          age: Number(age) || 0,
          gender: "Not specified",
          phone: phone || "—",
          email: email || "—",
          lastVisit: "Oct 21, 2026",
          nextVisit: "Not scheduled",
          condition: condition || "General medicine",
          status: "New",
        });
        setName(""); setEmail(""); setPhone(""); setCondition(""); setAge("");
      }}
    >
      <div className="mb-4 flex items-center gap-3 border-b border-border pb-4">
        <span className="grid size-9 place-items-center rounded-md bg-secondary text-primary"><UserRoundPlus className="size-[18px]" /></span>
        <div>
          <h2 className="text-sm font-semibold">Add a patient</h2>
          <p className="mt-1 text-xs text-muted-foreground">Create a local demo record.</p>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Full name" htmlFor="patient-name"><Input id="patient-name" placeholder="Patient name" value={name} onChange={(event) => setName(event.target.value)} required /></Field>
        <Field label="Email address" htmlFor="patient-email"><Input id="patient-email" type="email" placeholder="name@example.com" value={email} onChange={(event) => setEmail(event.target.value)} /></Field>
        <Field label="Phone number" htmlFor="patient-phone"><Input id="patient-phone" type="tel" placeholder="+1 (212) 555-0100" value={phone} onChange={(event) => setPhone(event.target.value)} /></Field>
        <Field label="Age" htmlFor="patient-age"><Input id="patient-age" type="number" min="0" max="125" placeholder="Age" value={age} onChange={(event) => setAge(event.target.value)} /></Field>
        <Field label="Visit reason" htmlFor="patient-condition"><Input id="patient-condition" placeholder="e.g. Annual checkup" value={condition} onChange={(event) => setCondition(event.target.value)} /></Field>
        <div className="flex items-end"><Button type="submit" className="w-full sm:w-auto"><Plus /> Save patient</Button></div>
      </div>
      <p className="mt-3 text-[11px] text-muted-foreground">Demo details stay in this browser session only.</p>
    </form>
  );
}

function PatientTable({ patients, compact = false }: { patients: PatientRecord[]; compact?: boolean }) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="min-w-[210px] pl-5">Patient</TableHead>
            <TableHead className="min-w-[115px]">Patient ID</TableHead>
            {!compact && <TableHead className="hidden min-w-[175px] lg:table-cell">Contact</TableHead>}
            <TableHead className="min-w-[155px]">Last visit</TableHead>
            <TableHead className="hidden min-w-[165px] md:table-cell">Next appointment</TableHead>
            <TableHead className="min-w-[120px]">Status</TableHead>
            <TableHead className="pr-5 text-right"> </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {patients.map((patient) => (
            <TableRow key={patient.id}>
              <TableCell className="pl-5">
                <div className="flex items-center gap-2.5">
                  <Avatar className="size-8"><AvatarFallback className="bg-secondary text-[10px] font-semibold text-secondary-foreground">{patient.initials}</AvatarFallback></Avatar>
                  <div>
                    <div className="whitespace-nowrap text-xs font-semibold">{patient.name}</div>
                    <div className="mt-0.5 text-[10px] text-muted-foreground">{patient.age || "—"} yrs <span className="mx-1">·</span> {patient.condition}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="whitespace-nowrap text-xs text-muted-foreground">{patient.id}</TableCell>
              {!compact && <TableCell className="hidden whitespace-nowrap text-xs text-muted-foreground lg:table-cell">{patient.phone}</TableCell>}
              <TableCell className="whitespace-nowrap text-xs">{patient.lastVisit}</TableCell>
              <TableCell className="hidden whitespace-nowrap text-xs text-muted-foreground md:table-cell">{patient.nextVisit}</TableCell>
              <TableCell><StatusBadge status={patient.status} /></TableCell>
              <TableCell className="pr-5 text-right"><Button aria-label={`More about ${patient.name}`} variant="ghost" size="icon" className="size-7"><MoreHorizontal /></Button></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function InvoiceView({ onNotice }: { onNotice: (message: string) => void }) {
  const total = invoiceRecords.filter((invoice) => invoice.status === "Pending" || invoice.status === "Overdue").length;
  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <SmallMetric label="Collected this month" value="$38,450" icon={WalletCards} note="+9.4% vs last month" />
        <SmallMetric label="Outstanding" value="$3,840" icon={Clock3} note={`${total} invoices to follow up`} />
        <SmallMetric label="Paid invoices" value="142" icon={Check} note="This month" />
      </div>
      <section className="rounded-md border border-border bg-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-4 sm:px-5">
          <div><h2 className="text-sm font-semibold">All invoices</h2><p className="mt-1 text-xs text-muted-foreground">Recent billing activity from your clinic</p></div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => onNotice("Invoice status filters applied.")}><Filter /> Filter</Button>
            <Button size="sm" onClick={() => onNotice("A new invoice draft has been created.")}><FilePlus2 /> Create invoice</Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table><TableHeader><TableRow className="hover:bg-transparent"><TableHead className="pl-5">Invoice</TableHead><TableHead>Patient</TableHead><TableHead>Date issued</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead><TableHead className="pr-5 text-right"> </TableHead></TableRow></TableHeader>
            <TableBody>{invoiceRecords.map((invoice) => <TableRow key={invoice.id}><TableCell className="whitespace-nowrap pl-5 text-xs font-semibold text-primary">{invoice.id}</TableCell><TableCell className="whitespace-nowrap text-xs font-medium">{invoice.patient}</TableCell><TableCell className="whitespace-nowrap text-xs text-muted-foreground">{invoice.date}</TableCell><TableCell className="whitespace-nowrap text-xs font-semibold">{invoice.amount}</TableCell><TableCell><StatusBadge status={invoice.status} /></TableCell><TableCell className="pr-5 text-right"><Button variant="ghost" size="icon" aria-label={`More actions for ${invoice.id}`} className="size-7" onClick={() => onNotice(`${invoice.id} details opened.`)}><MoreHorizontal /></Button></TableCell></TableRow>)}</TableBody>
          </Table>
        </div>
        <TableFooterNote text="Showing 6 of 160 invoices" />
      </section>
    </div>
  );
}

function PaymentView({ onNotice }: { onNotice: (message: string) => void }) {
  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <SmallMetric label="Collected today" value="$985.00" icon={WalletCards} note="5 transactions" />
        <SmallMetric label="This month" value="$38,450" icon={CreditCard} note="+9.4% vs last month" />
        <SmallMetric label="Processing" value="3" icon={Clock3} note="$1,280 awaiting settlement" />
      </div>
      <section className="rounded-md border border-border bg-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-4 sm:px-5">
          <div><h2 className="text-sm font-semibold">Recent transactions</h2><p className="mt-1 text-xs text-muted-foreground">Incoming payments across all methods</p></div>
          <div className="flex gap-2"><Button variant="outline" size="sm" onClick={() => onNotice("Showing transactions for all methods.")}><Filter /> Filter</Button><Button size="sm" onClick={() => onNotice("Payment recording form opened.")}><Plus /> Record payment</Button></div>
        </div>
        <div className="overflow-x-auto"><Table><TableHeader><TableRow className="hover:bg-transparent"><TableHead className="pl-5">Transaction</TableHead><TableHead>Patient</TableHead><TableHead>Payment method</TableHead><TableHead>Date</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead></TableRow></TableHeader><TableBody>{paymentRecords.map((payment) => <TableRow key={payment.id}><TableCell className="whitespace-nowrap pl-5 text-xs font-semibold">{payment.id}</TableCell><TableCell className="whitespace-nowrap text-xs font-medium">{payment.patient}</TableCell><TableCell className="whitespace-nowrap text-xs text-muted-foreground">{payment.method}</TableCell><TableCell className="whitespace-nowrap text-xs text-muted-foreground">{payment.date}</TableCell><TableCell className="whitespace-nowrap text-xs font-semibold">{payment.amount}</TableCell><TableCell><StatusBadge status={payment.status} /></TableCell></TableRow>)}</TableBody></Table></div>
        <TableFooterNote text="Showing 5 of 509 transactions" />
      </section>
    </div>
  );
}

function StaffView({ onNotice }: { onNotice: (message: string) => void }) {
  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3"><SmallMetric label="Team members" value="24" icon={Users} note="Across 4 departments" /><SmallMetric label="On duty today" value="18" icon={Activity} note="Available in clinic" /><SmallMetric label="Appointments" value="64" icon={CalendarDays} note="8 providers scheduled" /></div>
      <section className="rounded-md border border-border bg-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-4 sm:px-5"><div><h2 className="text-sm font-semibold">Clinical team</h2><p className="mt-1 text-xs text-muted-foreground">Roles and coverage for your staff</p></div><Button onClick={() => onNotice("Invite link copied for a new team member.")}><UserRoundPlus /> Invite member</Button></div>
        <div className="overflow-x-auto"><Table><TableHeader><TableRow className="hover:bg-transparent"><TableHead className="min-w-[210px] pl-5">Team member</TableHead><TableHead>Role</TableHead><TableHead className="hidden md:table-cell">Specialty</TableHead><TableHead className="hidden min-w-[220px] lg:table-cell">Schedule</TableHead><TableHead className="pr-5">Status</TableHead></TableRow></TableHeader><TableBody>{staffRecords.map((staff) => <TableRow key={staff.name}><TableCell className="pl-5"><div className="flex items-center gap-2.5"><Avatar className="size-8"><AvatarFallback className="bg-secondary text-[10px] font-semibold text-secondary-foreground">{staff.initials}</AvatarFallback></Avatar><span className="whitespace-nowrap text-xs font-semibold">{staff.name}</span></div></TableCell><TableCell className="whitespace-nowrap text-xs">{staff.role}</TableCell><TableCell className="hidden text-xs text-muted-foreground md:table-cell">{staff.specialty}</TableCell><TableCell className="hidden whitespace-nowrap text-xs text-muted-foreground lg:table-cell">{staff.schedule}</TableCell><TableCell className="pr-5"><StatusBadge status={staff.status} /></TableCell></TableRow>)}</TableBody></Table></div>
      </section>
      <section className="grid gap-3 sm:grid-cols-3"><InfoLine icon={Clock3} title="On-call rotation" detail="Dr. Maya Bennett · until 6:00 PM" /><InfoLine icon={CalendarDays} title="Coverage today" detail="Internal medicine · 3 providers" /><InfoLine icon={Users} title="Open positions" detail="Registered nurse · 1 opening" /></section>
    </div>
  );
}

function ReportsView({ dateFilter, onDateFilter }: { dateFilter: string; onDateFilter: (value: string) => void }) {
  const bars = [36, 47, 42, 64, 52, 73, 59, 83, 67, 91, 75, 100];
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-card px-4 py-3 sm:px-5"><div className="flex items-center gap-2 text-sm font-medium"><CalendarDays className="size-4 text-primary" /> Reporting period</div><select aria-label="Reporting period" value={dateFilter} onChange={(event) => onDateFilter(event.target.value)} className="h-9 max-w-[185px] rounded-md border border-input bg-background px-2 text-xs font-medium"><option>Today, Oct 21, 2026</option><option>This week, Oct 19–25</option><option>This month, October 2026</option><option>This quarter, Q4 2026</option></select></div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><SmallMetric label="Total revenue" value="$48,290" icon={WalletCards} note="+6.2% vs previous period" /><SmallMetric label="Patients seen" value="1,284" icon={Users} note="+12.8% vs previous period" /><SmallMetric label="Appointments" value="1,406" icon={CalendarDays} note="94.2% completion rate" /><SmallMetric label="Avg. visit value" value="$176.40" icon={FileChartColumnIncreasing} note="+3.1% vs previous period" /></div>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(280px,0.8fr)]">
        <section className="rounded-md border border-border bg-card p-4 sm:p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-sm font-semibold">Clinic revenue</h2><p className="mt-1 text-xs text-muted-foreground">Monthly revenue over the last 12 months</p></div><div className="text-right"><p className="text-xl font-semibold">$48,290</p><p className="mt-1 flex items-center justify-end gap-1 text-[11px] text-accent-foreground"><ArrowUpRight className="size-3.5" /> 6.2%</p></div></div><div className="mt-8 grid h-48 grid-cols-12 items-end gap-2 border-b border-l border-border pl-3 pt-4 sm:gap-4">{bars.map((height, index) => <div key={index} className="flex h-full flex-col items-center justify-end gap-2"><div title={`Month ${index + 1}`} className={`w-full max-w-8 rounded-t-sm ${index === bars.length - 1 ? "bg-primary" : "bg-primary/20"}`} style={{ height: `${height}%` }} /><span className="pb-2 text-[9px] text-muted-foreground">{["N", "D", "J", "F", "M", "A", "M", "J", "J", "A", "S", "O"][index]}</span></div>)}</div><div className="mt-3 flex items-center justify-between text-[10px] text-muted-foreground"><span>Nov 2025</span><span>Oct 2026</span></div></section>
        <section className="rounded-md border border-border bg-card"><div className="border-b border-border px-4 py-4 sm:px-5"><h2 className="text-sm font-semibold">By department</h2><p className="mt-1 text-xs text-muted-foreground">Revenue contribution</p></div><div className="space-y-4 p-4 sm:p-5">{[{ name: "General medicine", pct: 38, amount: "$18,350" }, { name: "Cardiology", pct: 27, amount: "$13,040" }, { name: "Dermatology", pct: 20, amount: "$9,658" }, { name: "Physical therapy", pct: 15, amount: "$7,242" }].map((dept) => <div key={dept.name}><div className="mb-1.5 flex justify-between gap-2 text-xs"><span className="font-medium">{dept.name}</span><span className="text-muted-foreground">{dept.amount}</span></div><div className="h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${dept.pct}%` }} /></div></div>)}</div></section>
      </div>
    </div>
  );
}

function ActivityView() {
  return (
    <section className="rounded-md border border-border bg-card"><div className="flex items-center justify-between border-b border-border px-4 py-4 sm:px-5"><div><h2 className="text-sm font-semibold">Activity log</h2><p className="mt-1 text-xs text-muted-foreground">Recent events across your clinic workspace</p></div><Button variant="outline" size="sm"><Filter /> Filters</Button></div><div className="overflow-x-auto"><Table><TableHeader><TableRow className="hover:bg-transparent"><TableHead className="pl-5">Team member</TableHead><TableHead>Action</TableHead><TableHead>Record</TableHead><TableHead>Category</TableHead><TableHead className="pr-5">Time</TableHead></TableRow></TableHeader><TableBody>{activityRecords.map((event) => <TableRow key={`${event.user}-${event.subject}`}><TableCell className="whitespace-nowrap pl-5 text-xs font-medium">{event.user}</TableCell><TableCell className="whitespace-nowrap text-xs">{event.action}</TableCell><TableCell className="whitespace-nowrap text-xs text-muted-foreground">{event.subject}</TableCell><TableCell><Badge variant="secondary" className="text-[10px]">{event.kind}</Badge></TableCell><TableCell className="whitespace-nowrap pr-5 text-xs text-muted-foreground">{event.time}</TableCell></TableRow>)}</TableBody></Table></div><TableFooterNote text="Showing 6 recent activities" /></section>
  );
}

function SettingsView({ onNotice }: { onNotice: (message: string) => void }) {
  return (
    <div className="grid items-start gap-5 xl:grid-cols-[220px_minmax(0,1fr)]">
      <nav aria-label="Settings categories" className="flex gap-1 overflow-x-auto border-b border-border pb-2 xl:block xl:space-y-1 xl:border-b-0 xl:pb-0">{["Clinic profile", "Preferences", "Notifications", "Access & roles"].map((label, index) => {const Icon = [HeartPulse, Settings, Bell, ShieldCheck][index]; return <button key={label} type="button" className={`flex shrink-0 items-center gap-2.5 rounded-md px-3 py-2 text-left text-xs font-medium ${index === 0 ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"}`} onClick={() => index > 0 && onNotice(`${label} settings opened.`)}><Icon className="size-4" />{label}</button>;})}</nav>
      <div className="space-y-5">
        <section className="rounded-md border border-border bg-card"><div className="border-b border-border px-4 py-4 sm:px-5"><h2 className="text-sm font-semibold">Clinic profile</h2><p className="mt-1 text-xs text-muted-foreground">The details your team sees across the workspace</p></div><div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5"><Field label="Clinic name" htmlFor="setting-clinic-name"><Input id="setting-clinic-name" defaultValue="Marine Clinic" /></Field><Field label="Contact email" htmlFor="setting-clinic-email"><Input id="setting-clinic-email" defaultValue="hello@marineclinic.demo" /></Field><Field label="Phone number" htmlFor="setting-clinic-phone"><Input id="setting-clinic-phone" defaultValue="+1 (212) 555-0100" /></Field><Field label="Location" htmlFor="setting-clinic-location"><Input id="setting-clinic-location" defaultValue="New York, NY" /></Field><Field label="Timezone" htmlFor="setting-clinic-timezone"><Input id="setting-clinic-timezone" defaultValue="Eastern Time (ET)" /></Field><Field label="Clinic hours" htmlFor="setting-clinic-hours"><Input id="setting-clinic-hours" defaultValue="Monday – Friday, 8 AM – 6 PM" /></Field></div><div className="flex justify-end border-t border-border px-4 py-3 sm:px-5"><Button onClick={() => onNotice("Clinic profile saved in this demo.")}>Save changes</Button></div></section>
        <section className="rounded-md border border-border bg-card"><div className="border-b border-border px-4 py-4 sm:px-5"><h2 className="text-sm font-semibold">Workspace access</h2><p className="mt-1 text-xs text-muted-foreground">Current demo permissions by role</p></div><div className="space-y-3 p-4 sm:p-5"><div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 size-4 text-primary" /><div><p className="text-xs font-semibold">Admin access</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Full access to all clinic areas and settings.</p></div></div><div className="flex items-start gap-3"><Users className="mt-0.5 size-4 text-primary" /><div><p className="text-xs font-semibold">Staff access</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Dashboard, patients, invoices, payments, and reports.</p></div></div></div></section>
      </div>
    </div>
  );
}

function SmallMetric({
  label,
  value,
  icon: Icon,
  note,
}: {
  label: string;
  value: string;
  icon: typeof Users;
  note: string;
}) {
  return (
    <div className="rounded-md border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-2"><p className="text-xs font-medium text-muted-foreground">{label}</p><Icon className="size-4 text-primary" /></div>
      <p className="mt-3 text-2xl font-semibold">{value}</p>
      <p className="mt-1.5 text-[11px] text-muted-foreground">{note}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const tone = /paid|active|completed|on duty/i.test(status)
    ? "border-transparent bg-accent text-accent-foreground"
    : /overdue|refunded/i.test(status)
      ? "border-transparent bg-destructive/10 text-destructive"
      : /pending|upcoming|processing|follow-up|break/i.test(status)
        ? "border-transparent bg-secondary text-secondary-foreground"
        : "border-border bg-muted text-muted-foreground";
  return <Badge variant="outline" className={`whitespace-nowrap px-2 py-0.5 text-[10px] font-medium ${tone}`}>{status}</Badge>;
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><label htmlFor={htmlFor} className="text-xs font-medium">{label}</label>{children}</div>;
}

function InfoLine({ icon: Icon, title, detail }: { icon: typeof Clock3; title: string; detail: string }) {
  return <div className="flex items-start gap-3 rounded-md border border-border bg-card p-4"><span className="grid size-8 shrink-0 place-items-center rounded bg-secondary text-primary"><Icon className="size-4" /></span><div><h3 className="text-xs font-semibold">{title}</h3><p className="mt-1 text-[11px] leading-5 text-muted-foreground">{detail}</p></div></div>;
}

function TableFooterNote({ text }: { text: string }) {
  return <div className="flex items-center justify-between gap-2 border-t border-border px-4 py-3 text-xs text-muted-foreground sm:px-5"><span>{text}</span><div className="flex items-center gap-1"><Button aria-label="Previous page" variant="outline" size="icon" className="size-7"><ChevronLeft /></Button><Button aria-current="page" size="icon" className="size-7">1</Button><Button aria-label="Next page" variant="outline" size="icon" className="size-7"><ChevronRight /></Button></div></div>;
}

function EmptyState({ title, detail }: { title: string; detail: string }) {
  return <div className="flex flex-col items-center justify-center px-4 py-12 text-center"><Search className="size-6 text-muted-foreground" /><p className="mt-3 text-sm font-semibold">{title}</p><p className="mt-1 text-xs text-muted-foreground">{detail}</p></div>;
}