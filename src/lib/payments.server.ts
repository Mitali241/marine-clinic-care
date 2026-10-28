import { createServerFn } from "@tanstack/react-start";

import { getDatabase } from "@/lib/mongodb.server";
import {
  createPaymentSchema,
  type PaymentRecord,
} from "@/lib/payments";

export const listPayments = createServerFn({ method: "GET" }).handler(
  async (): Promise<PaymentRecord[]> => {
    try {
      const db = await getDatabase();
      const rawPayments = await db
        .collection("payments")
        .find({}, { projection: { _id: 0 } })
        .sort({ date: -1 })
        .limit(500)
        .toArray();

      // Return clean, plain objects without any MongoDB BSON symbols or ObjectId
      return rawPayments.map((p) => ({
        id: String(p.id || ""),
        patientId: String(p.patientId || ""),
        patientName: String(p.patientName || ""),
        ...(p.invoiceId ? { invoiceId: String(p.invoiceId) } : {}),
        method: p.method as PaymentRecord["method"],
        amount: Number(p.amount || 0),
        ...(p.reference ? { reference: String(p.reference) } : {}),
        date: String(p.date || new Date().toISOString()),
        status: (p.status || "Completed") as PaymentRecord["status"],
      }));
    } catch (error) {
      console.error("Failed to fetch payments from MongoDB:", error);
      return [];
    }
  },
);

type RecordPaymentInput = {
  patientId: string;
  patientName: string;
  invoiceId?: string;
  method: (typeof import("@/lib/payments").paymentMethods)[number];
  amount: number;
  reference?: string;
};
type RecordPaymentResult =
  | { success: true; payment: PaymentRecord }
  | { success: false; message: string };

export const recordPayment = createServerFn({ method: "POST" })
  .validator((input: unknown): RecordPaymentInput => input as RecordPaymentInput)
  .handler(async ({ data }): Promise<RecordPaymentResult> => {
    try {
      const parsed = createPaymentSchema.safeParse(data);
      if (!parsed.success) {
        return {
          success: false,
          message: "Payment details are invalid. Check the selected patient, payment method, and amount.",
        };
      }

      const validatedData = parsed.data;
      const db = await getDatabase();
      const payment: PaymentRecord = {
        ...validatedData,
        id: `TXN-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
        date: new Date().toISOString(),
        status: "Completed",
      };

      // Clone object so MongoDB driver's internal _id mutation does not attach ObjectId to payment
      await db.collection("payments").insertOne({ ...payment });

      // If payment is linked to an invoice, mark the invoice as Paid in MongoDB
      if (payment.invoiceId) {
        try {
          await db.collection("invoices").updateOne(
            { id: payment.invoiceId },
            {
              $set: {
                status: "Paid",
                paymentMethod: payment.method,
                transactionRef: payment.id,
                paidDate: new Date().toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                }),
              },
            },
          );
        } catch (invoiceErr) {
          console.warn("Could not auto-update invoice status in MongoDB:", invoiceErr);
        }
      }

      // Record activity in MongoDB activity log
      try {
        await db.collection("activity_logs").insertOne({
          user: "Clinic Reception",
          action: "Recorded payment",
          subject: `${payment.id} · ₹${payment.amount.toLocaleString("en-IN")} (${payment.patientName})`,
          time: "Just now",
          kind: "Payments",
          timestamp: new Date().toISOString(),
        });
      } catch (actErr) {
        console.warn("Could not log payment activity in MongoDB:", actErr);
      }

      // Return clean, serializable plain object (guaranteed no BSON/ObjectId properties)
      const safePayment: PaymentRecord = {
        id: payment.id,
        patientId: payment.patientId,
        patientName: payment.patientName,
        ...(payment.invoiceId ? { invoiceId: payment.invoiceId } : {}),
        method: payment.method,
        amount: payment.amount,
        ...(payment.reference ? { reference: payment.reference } : {}),
        date: payment.date,
        status: payment.status,
      };

      return { success: true, payment: safePayment };
    } catch (error) {
      console.error("MongoDB failed to record clinic payment.", error);
      return { success: false, message: getPaymentSaveErrorMessage(error) };
    }
  });

function getPaymentSaveErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : "";
  const code = (error as { code?: number } | null)?.code;

  if (error && typeof error === "object" && "issues" in error) {
    return "Payment details are invalid. Check the selected patient, payment method, and amount.";
  }

  if (/Missing MONGODB_URI/.test(message)) {
    return "Payment storage is not configured. Set MONGODB_URI on the server and restart the app.";
  }

  if (code === 13 || code === 18 || /authentication failed|not authorized/i.test(message)) {
    return "MongoDB rejected the connection. Check the Atlas database username, password, and permissions.";
  }

  if (/ENOTFOUND|ECONNREFUSED|ETIMEDOUT|Server selection timed out|network|TLS/i.test(message)) {
    return "MongoDB could not be reached. Check the Atlas network access list and server connection.";
  }

  return "MongoDB could not save this payment. Check the server log for the database error.";
}
