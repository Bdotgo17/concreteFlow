import { pgTable, serial, text, timestamp, date, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const quoteRequestStatusValues = [
  "pending",
  "reviewed",
  "converted",
  "rejected",
] as const;
export type QuoteRequestStatus = (typeof quoteRequestStatusValues)[number];

export const quoteRequestsTable = pgTable("quote_requests", {
  id: serial("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone"),
  customerAddress: text("customer_address"),
  projectDescription: text("project_description").notNull(),
  concreteType: text("concrete_type").notNull().default("Ready-Mix"),
  volumeEstimate: numeric("volume_estimate", { precision: 10, scale: 2 }).notNull().default("0"),
  desiredDeliveryDate: date("desired_delivery_date"),
  status: text("status")
    .$type<QuoteRequestStatus>()
    .default("pending")
    .notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertQuoteRequestSchema = createInsertSchema(
  quoteRequestsTable,
).omit({
  id: true,
  status: true,
  createdAt: true,
  updatedAt: true,
});

export const updateQuoteRequestStatusSchema = z.object({
  status: z.enum(quoteRequestStatusValues),
  notes: z.string().optional(),
});

export type InsertQuoteRequest = z.infer<typeof insertQuoteRequestSchema>;
export type UpdateQuoteRequestStatus = z.infer<
  typeof updateQuoteRequestStatusSchema
>;
export type QuoteRequest = typeof quoteRequestsTable.$inferSelect;
