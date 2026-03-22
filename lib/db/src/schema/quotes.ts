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
import { quoteRequestsTable } from "./quoteRequests";

export const quoteStatusValues = [
  "draft",
  "sent",
  "accepted",
  "declined",
] as const;
export type QuoteStatus = (typeof quoteStatusValues)[number];

export const quotesTable = pgTable("quotes", {
  id: serial("id").primaryKey(),
  quoteRequestId: integer("quote_request_id")
    .references(() => quoteRequestsTable.id)
    .notNull(),
  status: text("status").$type<QuoteStatus>().default("draft").notNull(),
  expiryDate: date("expiry_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const quoteLineItemsTable = pgTable("quote_line_items", {
  id: serial("id").primaryKey(),
  quoteId: integer("quote_id")
    .references(() => quotesTable.id)
    .notNull(),
  description: text("description").notNull(),
  unit: text("unit").notNull(),
  quantity: numeric("quantity", { precision: 10, scale: 2 }).notNull(),
  unitPrice: numeric("unit_price", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertQuoteSchema = createInsertSchema(quotesTable).omit({
  id: true,
  status: true,
  createdAt: true,
  updatedAt: true,
});

export const insertQuoteLineItemSchema = createInsertSchema(
  quoteLineItemsTable,
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateQuoteStatusSchema = z.object({
  status: z.enum(quoteStatusValues),
});

export type InsertQuote = z.infer<typeof insertQuoteSchema>;
export type InsertQuoteLineItem = z.infer<typeof insertQuoteLineItemSchema>;
export type UpdateQuoteStatus = z.infer<typeof updateQuoteStatusSchema>;
export type Quote = typeof quotesTable.$inferSelect;
export type QuoteLineItem = typeof quoteLineItemsTable.$inferSelect;
