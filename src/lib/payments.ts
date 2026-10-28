import { z } from "zod";

export const paymentMethods = [
  "Cash",
  "UPI",
  "Bank Transfer",
  "Card",
  "Cheque",
] as const;

export const createPaymentSchema = z.object({
  patientId: z.string().trim().min(1).max(80),
  patientName: z.string().trim().min(1).max(160),
  invoiceId: z.string().trim().max(80).optional(),
  method: z.enum(paymentMethods),
  amount: z.number().finite().positive().max(10_000_000),
  reference: z.string().trim().max(120).optional(),
});

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;

export type PaymentRecord = CreatePaymentInput & {
  id: string;
  date: string;
  status: "Completed";
};
