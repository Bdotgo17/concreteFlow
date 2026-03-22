import {
  pgTable,
  serial,
  text,
  numeric,
  date,
  timestamp,
  integer,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const quoteRequestStatusEnum = pgEnum("quote_request_status", [
  "pending",
  "reviewed",
  "converted",
]);

export const quoteStatusEnum = pgEnum("quote_status", [
  "draft",
  "sent",
  "accepted",
  "rejected",
]);

export const invoiceStatusEnum = pgEnum("invoice_status", ["unpaid", "paid"]);

export const quoteRequestsTable = pgTable("quote_requests", {
  id: serial("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone"),
  projectDescription: text("project_description").notNull(),
  concreteType: text("concrete_type").notNull(),
  volumeEstimate: numeric("volume_estimate", { precision: 10, scale: 2 }).notNull(),
  desiredDeliveryDate: date("desired_delivery_date").notNull(),
  status: quoteRequestStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const quotesTable = pgTable("quotes", {
  id: serial("id").primaryKey(),
  quoteRequestId: integer("quote_request_id").references(() => quoteRequestsTable.id),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  status: quoteStatusEnum("status").notNull().default("draft"),
  totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull().default("0"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const lineItemsTable = pgTable("line_items", {
  id: serial("id").primaryKey(),
  quoteId: integer("quote_id").notNull().references(() => quotesTable.id, { onDelete: "cascade" }),
  description: text("description").notNull(),
  quantity: numeric("quantity", { precision: 10, scale: 2 }).notNull(),
  unitPrice: numeric("unit_price", { precision: 10, scale: 2 }).notNull(),
});

export const invoicesTable = pgTable("invoices", {
  id: serial("id").primaryKey(),
  quoteId: integer("quote_id").notNull().references(() => quotesTable.id),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull(),
  status: invoiceStatusEnum("status").notNull().default("unpaid"),
  dueDate: date("due_date"),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertQuoteRequestSchema = createInsertSchema(quoteRequestsTable).omit({ id: true, status: true, createdAt: true });
export const insertQuoteSchema = createInsertSchema(quotesTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertLineItemSchema = createInsertSchema(lineItemsTable).omit({ id: true });

export type QuoteRequest = typeof quoteRequestsTable.$inferSelect;
export type InsertQuoteRequest = z.infer<typeof insertQuoteRequestSchema>;
export type Quote = typeof quotesTable.$inferSelect;
export type InsertQuote = z.infer<typeof insertQuoteSchema>;
export type LineItem = typeof lineItemsTable.$inferSelect;
export type InsertLineItem = z.infer<typeof insertLineItemSchema>;
export type Invoice = typeof invoicesTable.$inferSelect;
