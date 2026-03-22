import {
  pgTable,
  serial,
  text,
  timestamp,
  date,
  integer,
  numeric,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { quotesTable } from "./quotes";

export const invoiceStatusValues = ["unpaid", "paid"] as const;
export type InvoiceStatus = (typeof invoiceStatusValues)[number];

export const invoicesTable = pgTable("invoices", {
  id: serial("id").primaryKey(),
  quoteId: integer("quote_id")
    .references(() => quotesTable.id)
    .notNull(),
  status: text("status").$type<InvoiceStatus>().default("unpaid").notNull(),
  dueDate: date("due_date"),
  total: numeric("total", { precision: 10, scale: 2 }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertInvoiceSchema = createInsertSchema(invoicesTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateInvoiceStatusSchema = z.object({
  status: z.enum(invoiceStatusValues),
});

export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type UpdateInvoiceStatus = z.infer<typeof updateInvoiceStatusSchema>;
export type Invoice = typeof invoicesTable.$inferSelect;
