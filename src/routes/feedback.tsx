import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Anchor,
  ArrowLeft,
  CheckCircle2,
  FileCheck,
  Printer,
  RotateCcw,
  Send,
  ShieldCheck,
  Ship,
  Sparkles,
} from "lucide-react";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ClinicLogo } from "@/components/clinic/ClinicLogo";
import { submitFeedbackServer } from "@/lib/clinic.server";
import {
  feedbackQuestions,
  ratingOptions,
  type CreateFeedbackInput,
  type FeedbackRecord,
  type RatingScale,
} from "@/lib/feedback";

export const Route = createFileRoute("/feedback")({
  head: () => ({
    meta: [
      {
        title:
          "Feedback Form | Sailor's Medical Clinic - Centre for Marine Medical Examinations",
      },
      {
        name: "description",
        content:
          "Official Candidate Feedback Form for Sailor's Medical Clinic, approved by the D.G. Shipping Govt. of India.",
      },
    ],
  }),
  component: SailorFeedbackFormPage,
});

export function SailorFeedbackFormPage() {
  const todayStr = new Date().toISOString().slice(0, 10);

  // Form Fields matching physical sheet
  const [name, setName] = useState("");
  const [date, setDate] = useState(todayStr);
  const [companyName, setCompanyName] = useState("");
  const [rank, setRank] = useState("");
  const [passportOrCdcNo, setPassportOrCdcNo] = useState("");
  const [indosNo, setIndosNo] = useState("");
  const [mobileNo, setMobileNo] = useState("+91 ");
  const [email, setEmail] = useState("");

  // 8 Rating Items
  const [ratings, setRatings] = useState<Record<string, RatingScale>>({
    timeTakenAtReception: "Good",
    skillAndFriendlinessTechnician: "Good",
    ecgAudiometryTechnician: "Good",
    guidanceByStaffDuringWait: "Good",
    hygieneCleanlinessClinics: "Good",
    friendlinessMedicalStaff: "Good",
    interactionWithDoctor: "Good",
    turnaroundTimeReports: "Good",
  });

  const [suggestionsComments, setSuggestionsComments] = useState("");
  const [candidateSignature, setCandidateSignature] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [submittedRecord, setSubmittedRecord] = useState<FeedbackRecord | null>(null);

  const handleRatingChange = (qId: string, val: RatingScale) => {
    setRatings((prev) => ({ ...prev, [qId]: val }));
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    if (!name.trim()) {
      setErrorMessage("Please enter candidate name.");
      return;
    }
    if (!mobileNo.trim() || mobileNo.trim() === "+91") {
      setErrorMessage("Please enter a valid mobile number.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: CreateFeedbackInput = {
        name: name.trim(),
        date,
        companyName: companyName.trim(),
        rank: rank.trim(),
        passportOrCdcNo: passportOrCdcNo.trim(),
        indosNo: indosNo.trim(),
        mobileNo: mobileNo.trim(),
        email: email.trim(),
        timeTakenAtReception: ratings.timeTakenAtReception,
        skillAndFriendlinessTechnician: ratings.skillAndFriendlinessTechnician,
        ecgAudiometryTechnician: ratings.ecgAudiometryTechnician,
        guidanceByStaffDuringWait: ratings.guidanceByStaffDuringWait,
        hygieneCleanlinessClinics: ratings.hygieneCleanlinessClinics,
        friendlinessMedicalStaff: ratings.friendlinessMedicalStaff,
        interactionWithDoctor: ratings.interactionWithDoctor,
        turnaroundTimeReports: ratings.turnaroundTimeReports,
        suggestionsComments: suggestionsComments.trim(),
        candidateSignature: candidateSignature.trim() || name.trim(),
      };

      let record: FeedbackRecord | null = null;

      try {
        const result = await submitFeedbackServer({ data: payload });
        if (result?.success && result.record) {
          record = result.record;
        } else if (result && !result.success && result.message) {
          setErrorMessage(result.message);
          return;
        }
      } catch (sfErr) {
        console.warn("serverFn call error, falling back to direct endpoint:", sfErr);
      }

      if (!record) {
        const res = await fetch("/api/feedback/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => null);
          throw new Error(errData?.message || "Failed to submit feedback.");
        }
        const data = (await res.json()) as {
          success: boolean;
          record: FeedbackRecord;
          message?: string;
        };
        if (!data.success || !data.record) {
          setErrorMessage(data.message || "Failed to submit feedback.");
          return;
        }
        record = data.record;
      }

      setSubmittedRecord(record);

    } catch (err) {
      console.error("Submission failed:", err);
      setErrorMessage(
        "Could not save feedback to MongoDB Atlas. Please verify internet connection and retry.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleReset() {
    setName("");
    setDate(todayStr);
    setCompanyName("");
    setRank("");
    setPassportOrCdcNo("");
    setIndosNo("");
    setMobileNo("+91 ");
    setEmail("");
    setRatings({
      timeTakenAtReception: "Good",
      skillAndFriendlinessTechnician: "Good",
      ecgAudiometryTechnician: "Good",
      guidanceByStaffDuringWait: "Good",
      hygieneCleanlinessClinics: "Good",
      friendlinessMedicalStaff: "Good",
      interactionWithDoctor: "Good",
      turnaroundTimeReports: "Good",
    });
    setSuggestionsComments("");
    setCandidateSignature("");
    setErrorMessage("");
    setSubmittedRecord(null);
  }

  return (
    <div className="min-h-screen bg-slate-100 py-6 text-slate-900 print:bg-white print:py-0 print:text-black dark:bg-slate-950 dark:text-slate-100">
      {/* Top Bar for Web Navigation */}
      <div className="mx-auto mb-6 flex max-w-4xl items-center justify-between px-4 print:hidden">
        <Link to="/">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <ArrowLeft className="size-3.5" /> Back to Clinic Workspace
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="gap-1.5 text-xs"
          >
            <Printer className="size-3.5" /> Print Physical Form
          </Button>
        </div>
      </div>

      {/* Main Feedback Form Card */}
      <main className="mx-auto max-w-4xl px-4 sm:px-6">
        {submittedRecord ? (
          <div className="mx-auto max-w-lg rounded-2xl border border-emerald-500/30 bg-card p-8 text-center shadow-xl print:hidden sm:p-12">
            <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 ring-8 ring-emerald-500/5">
              <CheckCircle2 className="size-10" />
            </div>

            <span className="mt-6 inline-block text-xs font-bold uppercase tracking-wider text-emerald-600">
              Response Submitted
            </span>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Thank You!
            </h1>
            <p className="mt-2 text-sm text-muted-foreground sm:text-base">
              Thank you for taking the time to share your feedback.
            </p>

            <div className="mt-6 rounded-xl border border-border/80 bg-muted/40 p-4 text-xs text-muted-foreground text-left space-y-2.5">
              <div className="flex items-center justify-between border-b border-border/50 pb-2">
                <span>Reference Token ID</span>
                <span className="font-mono font-bold text-primary text-sm">{submittedRecord.id}</span>
              </div>
              <div className="flex items-center justify-between border-b border-border/50 pb-2">
                <span>Candidate Name</span>
                <span className="font-semibold text-foreground">{submittedRecord.name}</span>
              </div>
              <div className="flex items-center justify-between pt-0.5">
                <span>Date Recorded</span>
                <span className="text-foreground">{submittedRecord.date}</span>
              </div>
            </div>

            <p className="mt-6 text-xs text-muted-foreground leading-relaxed">
              Your feedback has been securely registered with Sailor's Medical Clinic. Your ratings and suggestions help us continually uphold high medical standards.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="w-full sm:w-auto text-xs"
              >
                Submit Another Response
              </Button>
              <Link to="/" className="w-full sm:w-auto">
                <Button size="sm" className="w-full sm:w-auto text-xs">
                  Back to Clinic Home
                </Button>
              </Link>
            </div>
          </div>
        ) : false ? (
          <div className="hidden">
            <div className="flex items-center gap-4 border-b border-border pb-6">
              <div className="grid size-14 place-items-center rounded-full bg-emerald-500/10 text-emerald-600">
                <CheckCircle2 className="size-8" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                  Submission Confirmed
                </span>
                <h1 className="text-2xl font-bold">Feedback Successfully Recorded</h1>
                <p className="text-xs text-muted-foreground">
                  Your feedback form has been securely stored in the Sailor's Medical Clinic database.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg bg-muted/40 p-4">
                <div>
                  <span className="text-xs text-muted-foreground uppercase">Token ID</span>
                  <div className="font-mono text-xl font-bold text-primary">
                    {submittedRecord.id}
                  </div>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground uppercase">Date Recorded</span>
                  <div className="text-sm font-semibold">{submittedRecord.date}</div>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground uppercase">Candidate</span>
                  <div className="text-sm font-semibold">{submittedRecord.name}</div>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground uppercase">Status</span>
                  <div className="inline-flex rounded-full bg-blue-500/10 px-2 py-0.5 text-xs font-semibold text-blue-600">
                    {submittedRecord.status}
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-border p-4">
                <h3 className="mb-3 text-xs font-bold uppercase text-muted-foreground">
                  Ratings Summary Submitted:
                </h3>
                <div className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
                  {feedbackQuestions.map((q) => (
                    <div
                      key={q.id}
                      className="flex items-center justify-between rounded bg-muted/30 px-3 py-1.5"
                    >
                      <span className="text-muted-foreground">{q.label}</span>
                      <span className="font-semibold text-foreground">
                        {submittedRecord[q.id as keyof FeedbackRecord] as string}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {submittedRecord.suggestionsComments && (
                <div className="rounded-lg border border-border p-4 text-xs">
                  <span className="font-bold text-muted-foreground">Suggestions / Comments:</span>
                  <p className="mt-1 leading-relaxed text-foreground">
                    "{submittedRecord.suggestionsComments}"
                  </p>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-4">
                <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-2">
                  <Printer className="size-4" /> Print Receipt
                </Button>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleReset}>
                    Submit Another Form
                  </Button>
                  <Link to="/">
                    <Button size="sm">Go to Clinic Dashboard</Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* The Exact Physical Paper Form Reproduction */
          <div className="overflow-hidden rounded-lg border border-slate-300 bg-white p-6 shadow-md print:rounded-none print:border-none print:p-0 print:shadow-none dark:border-slate-800 dark:bg-card sm:p-10">
            {/* Header Exactly As Attached Physical Sheet */}
            <header className="border-b-2 border-slate-800 pb-4 text-center dark:border-slate-300">
              <div className="flex flex-col items-center justify-between gap-3 sm:flex-row sm:items-start sm:text-left">
                {/* Logo & Certifications */}
                <div className="flex items-center gap-3">
                  <ClinicLogo size="lg" showText={false} />
                  <div className="text-left text-[9px] font-bold leading-tight text-slate-700 dark:text-slate-300">
                    <div>ISO 9001: 2015</div>
                    <div>ISO 45001: 2018</div>
                    <div className="text-[8px] uppercase tracking-wider text-slate-500">
                      CERTIFIED CENTRE
                    </div>
                  </div>
                </div>

                {/* Main Titles */}
                <div className="flex-1 text-center">
                  <h1 className="font-serif text-2xl font-extrabold uppercase tracking-tight text-blue-950 dark:text-blue-300 sm:text-3xl">
                    SAILOR'S MEDICAL CLINIC
                  </h1>
                  <h2 className="mt-0.5 text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    CENTRE FOR MARINE MEDICAL EXAMINATIONS
                  </h2>
                  <div className="text-[10px] font-semibold uppercase text-slate-600 dark:text-slate-400">
                    BY
                  </div>
                  <h3 className="text-[11px] font-bold uppercase tracking-wide text-slate-900 dark:text-slate-100">
                    THE D.G. SHIPPING GOVT. OF INDIA APPROVED DOCTORS
                  </h3>
                </div>
              </div>

              {/* Address Bar */}
              <div className="mt-3 border-t border-slate-300 pt-2 text-[10px] font-medium text-slate-700 dark:border-slate-800 dark:text-slate-300 sm:text-[11px]">
                <span>
                  Shop No. 21, Punit Tower - 1, Sec-11, CBD Belapur, Navi Mumbai
                </span>{" "}
                | <span>Mob.: +91 95614 50104</span> |{" "}
                <span>Email : medical@sailorsmedical.com</span>
              </div>
            </header>

            {/* Candidate Details Fields */}
            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div className="space-y-3 text-xs sm:text-sm">
                {/* Row 1: Name and Date */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-12 sm:items-center">
                  <div className="flex items-center gap-2 sm:col-span-8">
                    <label
                      htmlFor="cand-name"
                      className="whitespace-nowrap font-bold text-slate-900 dark:text-slate-100"
                    >
                      Name :
                    </label>
                    <input
                      id="cand-name"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Full Name as in CDC / Passport"
                      className="w-full border-b border-slate-500 bg-transparent px-2 py-1 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none dark:border-slate-600 dark:text-slate-100"
                    />
                  </div>
                  <div className="flex items-center gap-2 sm:col-span-4">
                    <label
                      htmlFor="cand-date"
                      className="whitespace-nowrap font-bold text-slate-900 dark:text-slate-100"
                    >
                      Date :
                    </label>
                    <input
                      id="cand-date"
                      required
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full border-b border-slate-500 bg-transparent px-2 py-1 text-xs font-medium text-slate-900 focus:border-blue-600 focus:outline-none dark:border-slate-600 dark:text-slate-100"
                    />
                  </div>
                </div>

                {/* Row 2: Company Name */}
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="cand-company"
                    className="whitespace-nowrap font-bold text-slate-900 dark:text-slate-100"
                  >
                    Company Name
                  </label>
                  <input
                    id="cand-company"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Shipping Company / Manning Agency"
                    className="w-full border-b border-slate-500 bg-transparent px-2 py-1 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none dark:border-slate-600 dark:text-slate-100"
                  />
                </div>

                {/* Row 3: Rank, Passport or CDC No, Indos No */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-12 sm:items-center">
                  <div className="flex items-center gap-2 sm:col-span-4">
                    <label
                      htmlFor="cand-rank"
                      className="whitespace-nowrap font-bold text-slate-900 dark:text-slate-100"
                    >
                      Rank :
                    </label>
                    <input
                      id="cand-rank"
                      value={rank}
                      onChange={(e) => setRank(e.target.value)}
                      placeholder="e.g. Master, Chief Officer, Bosun"
                      className="w-full border-b border-slate-500 bg-transparent px-2 py-1 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none dark:border-slate-600 dark:text-slate-100"
                    />
                  </div>
                  <div className="flex items-center gap-2 sm:col-span-4">
                    <label
                      htmlFor="cand-cdc"
                      className="whitespace-nowrap font-bold text-slate-900 dark:text-slate-100"
                    >
                      Passport or CDC No:
                    </label>
                    <input
                      id="cand-cdc"
                      value={passportOrCdcNo}
                      onChange={(e) => setPassportOrCdcNo(e.target.value)}
                      placeholder="CDC / Passport"
                      className="w-full border-b border-slate-500 bg-transparent px-2 py-1 text-xs font-medium font-mono text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none dark:border-slate-600 dark:text-slate-100"
                    />
                  </div>
                  <div className="flex items-center gap-2 sm:col-span-4">
                    <label
                      htmlFor="cand-indos"
                      className="whitespace-nowrap font-bold text-slate-900 dark:text-slate-100"
                    >
                      Indos No:
                    </label>
                    <input
                      id="cand-indos"
                      value={indosNo}
                      onChange={(e) => setIndosNo(e.target.value)}
                      placeholder="e.g. 12NL8492"
                      className="w-full border-b border-slate-500 bg-transparent px-2 py-1 text-xs font-medium font-mono text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none dark:border-slate-600 dark:text-slate-100"
                    />
                  </div>
                </div>

                {/* Row 4: Mobile No and Email Add */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-12 sm:items-center">
                  <div className="flex items-center gap-2 sm:col-span-5">
                    <label
                      htmlFor="cand-mobile"
                      className="whitespace-nowrap font-bold text-slate-900 dark:text-slate-100"
                    >
                      Mobile No :
                    </label>
                    <input
                      id="cand-mobile"
                      required
                      value={mobileNo}
                      onChange={(e) => setMobileNo(e.target.value)}
                      placeholder="+91 95614 50104"
                      className="w-full border-b border-slate-500 bg-transparent px-2 py-1 text-xs font-medium font-mono text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none dark:border-slate-600 dark:text-slate-100"
                    />
                  </div>
                  <div className="flex items-center gap-2 sm:col-span-7">
                    <label
                      htmlFor="cand-email"
                      className="whitespace-nowrap font-bold text-slate-900 dark:text-slate-100"
                    >
                      Email Add :
                    </label>
                    <input
                      id="cand-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="candidate@maritime.com"
                      className="w-full border-b border-slate-500 bg-transparent px-2 py-1 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none dark:border-slate-600 dark:text-slate-100"
                    />
                  </div>
                </div>
              </div>

              {/* FEEDBACK FORM Title */}
              <div className="pt-3 text-center">
                <h4 className="text-base font-extrabold uppercase tracking-wide text-blue-950 dark:text-blue-300">
                  FEEDBACK FORM
                </h4>
                <p className="text-[11px] italic text-slate-600 dark:text-slate-400">
                  Please Tick the appropriate rating
                </p>
              </div>

              {/* The 8 Questions Table */}
              <div className="overflow-x-auto rounded border border-slate-300 dark:border-slate-700">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-[11px] font-bold text-slate-700 dark:bg-slate-900 dark:text-slate-300">
                    <tr className="border-b border-slate-300 dark:border-slate-700">
                      <th className="py-2.5 pl-3 pr-2 sm:w-1/2">Evaluation Criteria</th>
                      <th className="py-2.5 px-1 text-center sm:w-1/8">[ Excellent ]</th>
                      <th className="py-2.5 px-1 text-center sm:w-1/8">[ Good ]</th>
                      <th className="py-2.5 px-1 text-center sm:w-1/8">[ Avg ]</th>
                      <th className="py-2.5 pr-3 text-center sm:w-1/8">[ Below Avg ]</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {feedbackQuestions.map((q) => {
                      const selectedVal = ratings[q.id];
                      return (
                        <tr
                          key={q.id}
                          className="transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-900/40"
                        >
                          <td className="py-2.5 pl-3 pr-2 font-medium text-slate-800 dark:text-slate-200">
                            {q.label}
                          </td>
                          {ratingOptions.map((opt) => {
                            const isChecked = selectedVal === opt;
                            return (
                              <td key={opt} className="py-2.5 px-1 text-center">
                                <label className="inline-flex cursor-pointer items-center justify-center p-1">
                                  <input
                                    type="radio"
                                    name={q.id}
                                    value={opt}
                                    checked={isChecked}
                                    onChange={() => handleRatingChange(q.id, opt)}
                                    className="size-4 cursor-pointer accent-blue-900"
                                  />
                                </label>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Suggestions / Comments */}
              <div className="space-y-1 pt-2">
                <label
                  htmlFor="cand-suggestions"
                  className="block font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100"
                >
                  Suggestions / Comments
                </label>
                <div className="relative">
                  <textarea
                    id="cand-suggestions"
                    rows={4}
                    maxLength={3000}
                    value={suggestionsComments}
                    onChange={(e) => setSuggestionsComments(e.target.value)}
                    placeholder="Write any suggestions, feedback, or appreciation for our clinical staff and doctors..."
                    className="w-full rounded border border-slate-300 bg-transparent p-2.5 text-xs leading-6 text-slate-900 focus:border-blue-600 focus:outline-none dark:border-slate-700 dark:text-slate-100"
                  />
                </div>
              </div>

              {/* Closing statement and Candidate Signature */}
              <div className="space-y-4 pt-3">
                <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">
                  We thanks you for taking the time to leave your feedback. It is your comments and
                  suggestions that will help us to serve you better.
                </p>

                <div className="flex flex-col items-end pt-2 text-right">
                  <div className="w-64 border-b border-slate-600 pb-1 dark:border-slate-400">
                    <input
                      value={candidateSignature}
                      onChange={(e) => setCandidateSignature(e.target.value)}
                      placeholder="Type name as signature"
                      className="w-full bg-transparent text-right font-serif text-sm italic text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-slate-100"
                    />
                  </div>
                  <span className="mt-1 text-xs font-bold text-slate-900 dark:text-slate-200">
                    Signature of Candidate
                  </span>
                </div>
              </div>

              {errorMessage && (
                <div className="rounded-md border border-red-500/30 bg-red-50 p-3 text-xs text-red-600 dark:bg-red-950/30 dark:text-red-300">
                  {errorMessage}
                </div>
              )}

              {/* Action Buttons (Hidden when printing) */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-5 print:hidden dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="gap-1.5 text-xs"
                >
                  <RotateCcw className="size-3.5" /> Clear Form
                </Button>

                <div className="flex items-center gap-3">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="gap-2 bg-blue-900 px-6 font-semibold text-white hover:bg-blue-800 shadow-sm"
                  >
                    {isSubmitting ? (
                      "Saving..."
                    ) : (
                      <>
                        <Send className="size-4" /> Submit Feedback Form
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-8 text-center text-xs text-slate-500 print:hidden dark:text-slate-400">
        <p>Sailor's Medical Clinic · Centre for Marine Medical Examinations · CBD Belapur, Navi Mumbai</p>
        <p className="mt-1 text-[11px]">
          Approved by the D.G. Shipping Govt. of India · ISO 9001:2015 & ISO 45001:2018 Certified Centre
        </p>
      </footer>
    </div>
  );
}
