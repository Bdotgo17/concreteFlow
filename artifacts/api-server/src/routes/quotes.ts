import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import {
  quotesTable,
  quoteLineItemsTable,
  invoicesTable,
  quoteRequestsTable,
} from "@workspace/db";
import { and, eq } from "drizzle-orm";
import { CreateQuoteBody, UpdateQuoteBody, UpdateQuoteStatusBody, AddLineItemBody, UpdateLineItemBody } from "@workspace/api-zod";

const router: IRouter = Router();

function serializeQuote(q: typeof quotesTable.$inferSelect) {
  return {
    id: q.id,
    quoteRequestId: q.quoteRequestId ?? null,
    customerName: q.customerName,
    customerEmail: q.customerEmail,
    status: q.status,
    totalAmount: parseFloat(q.totalAmount),
    expiryDate: q.expiryDate ?? null,
    notes: q.notes ?? null,
    createdAt: q.createdAt.toISOString(),
    updatedAt: q.updatedAt.toISOString(),
  };
}

function serializeLineItem(li: typeof quoteLineItemsTable.$inferSelect) {
  const qty = parseFloat(li.quantity);
  const price = parseFloat(li.unitPrice);
  return {
    id: li.id,
    quoteId: li.quoteId,
    description: li.description,
    unit: li.unit,
    quantity: qty,
    unitPrice: price,
    total: qty * price,
  };
}

async function computeAndUpdateTotal(quoteId: number) {
  const items = await db
    .select()
    .from(quoteLineItemsTable)
    .where(eq(quoteLineItemsTable.quoteId, quoteId));
  const total = items.reduce(
    (sum, item) => sum + parseFloat(item.quantity) * parseFloat(item.unitPrice),
    0
  );
  await db
    .update(quotesTable)
    .set({ totalAmount: total.toString(), updatedAt: new Date() })
    .where(eq(quotesTable.id, quoteId));
  return total;
}

async function maybeCreateInvoice(quoteId: number, quote: typeof quotesTable.$inferSelect) {
  const [existing] = await db
    .select()
    .from(invoicesTable)
    .where(eq(invoicesTable.quoteId, quoteId));
  if (!existing) {
    const items = await db.select().from(quoteLineItemsTable).where(eq(quoteLineItemsTable.quoteId, quoteId));
    const total = items.reduce((sum, item) => sum + parseFloat(item.quantity) * parseFloat(item.unitPrice), 0);
    await db.insert(invoicesTable).values({
      quoteId,
      customerName: quote.customerName,
      customerEmail: quote.customerEmail,
      totalAmount: total.toString(),
      status: "unpaid",
    });
  }
}

router.get("/quotes", async (req, res) => {
  try {
    const rows = await db.select().from(quotesTable).orderBy(quotesTable.createdAt);
    res.json(rows.map(serializeQuote));
  } catch (err) {
    req.log.error(err, "Error listing quotes");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/quotes", async (req, res) => {
  try {
    const body = CreateQuoteBody.parse(req.body);
    const lineItems = body.lineItems ?? [];
    const total = lineItems.reduce((acc, li) => acc + li.quantity * li.unitPrice, 0);

    const [created] = await db
      .insert(quotesTable)
      .values({
        quoteRequestId: body.quoteRequestId ?? null,
        customerName: body.customerName,
        customerEmail: body.customerEmail,
        notes: body.notes ?? null,
        expiryDate: body.expiryDate ?? null,
        totalAmount: total.toString(),
        status: "draft",
      })
      .returning();

    if (lineItems.length > 0) {
      await db.insert(quoteLineItemsTable).values(
        lineItems.map((li) => ({
          quoteId: created.id,
          description: li.description,
          unit: li.unit ?? "each",
          quantity: li.quantity.toString(),
          unitPrice: li.unitPrice.toString(),
        }))
      );
    }

    if (body.quoteRequestId) {
      await db
        .update(quoteRequestsTable)
        .set({ status: "converted", updatedAt: new Date() })
        .where(eq(quoteRequestsTable.id, body.quoteRequestId));
    }

    const items = await db.select().from(quoteLineItemsTable).where(eq(quoteLineItemsTable.quoteId, created.id));
    res.status(201).json({ ...serializeQuote(created), lineItems: items.map(serializeLineItem) });
  } catch (err) {
    req.log.error(err, "Error creating quote");
    res.status(400).json({ error: String(err) });
  }
});

router.get("/quotes/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
    const [quote] = await db.select().from(quotesTable).where(eq(quotesTable.id, id));
    if (!quote) { res.status(404).json({ error: "Quote not found" }); return; }
    const items = await db.select().from(quoteLineItemsTable).where(eq(quoteLineItemsTable.quoteId, id));
    res.json({ ...serializeQuote(quote), lineItems: items.map(serializeLineItem) });
  } catch (err) {
    req.log.error(err, "Error getting quote");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/quotes/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
    const [deleted] = await db.delete(quotesTable).where(eq(quotesTable.id, id)).returning();
    if (!deleted) { res.status(404).json({ error: "Quote not found" }); return; }
    res.status(204).send();
  } catch (err) {
    req.log.error(err, "Error deleting quote");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/quotes/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
    const body = UpdateQuoteBody.parse(req.body);

    const [existing] = await db.select().from(quotesTable).where(eq(quotesTable.id, id));
    if (!existing) { res.status(404).json({ error: "Quote not found" }); return; }

    const updateData: Partial<typeof quotesTable.$inferInsert> = { updatedAt: new Date() };
    if (body.status !== undefined) updateData.status = body.status;
    if (body.notes !== undefined) updateData.notes = body.notes ?? null;
    if (body.expiryDate !== undefined) updateData.expiryDate = body.expiryDate ?? null;

    if (body.lineItems !== undefined) {
      await db.delete(quoteLineItemsTable).where(eq(quoteLineItemsTable.quoteId, id));
      if (body.lineItems.length > 0) {
        await db.insert(quoteLineItemsTable).values(
          body.lineItems.map((li) => ({
            quoteId: id,
            description: li.description,
            unit: li.unit ?? "each",
            quantity: li.quantity.toString(),
            unitPrice: li.unitPrice.toString(),
          }))
        );
      }
      const total = body.lineItems.reduce((acc, li) => acc + li.quantity * li.unitPrice, 0);
      updateData.totalAmount = total.toString();
    }

    const [updated] = await db.update(quotesTable).set(updateData).where(eq(quotesTable.id, id)).returning();

    if (body.status === "accepted" && existing.status !== "accepted") {
      await maybeCreateInvoice(id, updated);
    }

    const items = await db.select().from(quoteLineItemsTable).where(eq(quoteLineItemsTable.quoteId, id));
    res.json({ ...serializeQuote(updated), lineItems: items.map(serializeLineItem) });
  } catch (err) {
    req.log.error(err, "Error updating quote");
    res.status(400).json({ error: String(err) });
  }
});

router.patch("/quotes/:id/status", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
    const body = UpdateQuoteStatusBody.parse(req.body);
    const [existing] = await db.select().from(quotesTable).where(eq(quotesTable.id, id));
    if (!existing) { res.status(404).json({ error: "Quote not found" }); return; }
    const [updated] = await db
      .update(quotesTable)
      .set({ status: body.status, updatedAt: new Date() })
      .where(eq(quotesTable.id, id))
      .returning();
    if (body.status === "accepted" && existing.status !== "accepted") {
      await maybeCreateInvoice(id, updated);
    }
    res.json(serializeQuote(updated));
  } catch (err) {
    req.log.error(err, "Error updating quote status");
    res.status(400).json({ error: String(err) });
  }
});

router.post("/quotes/:quoteId/line-items", async (req, res) => {
  try {
    const quoteId = parseInt(req.params.quoteId, 10);
    if (isNaN(quoteId)) { res.status(400).json({ error: "Invalid quoteId" }); return; }
    const [quote] = await db.select().from(quotesTable).where(eq(quotesTable.id, quoteId));
    if (!quote) { res.status(404).json({ error: "Quote not found" }); return; }
    const body = AddLineItemBody.parse(req.body);
    const [item] = await db
      .insert(quoteLineItemsTable)
      .values({
        quoteId,
        description: body.description,
        unit: body.unit,
        quantity: body.quantity.toString(),
        unitPrice: body.unitPrice.toString(),
      })
      .returning();
    await computeAndUpdateTotal(quoteId);
    res.status(201).json(serializeLineItem(item));
  } catch (err) {
    req.log.error(err, "Error adding line item");
    res.status(400).json({ error: String(err) });
  }
});

router.put("/quotes/:quoteId/line-items/:lineItemId", async (req, res) => {
  try {
    const quoteId = parseInt(req.params.quoteId, 10);
    const lineItemId = parseInt(req.params.lineItemId, 10);
    if (isNaN(quoteId) || isNaN(lineItemId)) { res.status(400).json({ error: "Invalid id" }); return; }
    const body = UpdateLineItemBody.parse(req.body);
    const [updated] = await db
      .update(quoteLineItemsTable)
      .set({
        description: body.description,
        unit: body.unit,
        quantity: body.quantity.toString(),
        unitPrice: body.unitPrice.toString(),
      })
      .where(and(eq(quoteLineItemsTable.id, lineItemId), eq(quoteLineItemsTable.quoteId, quoteId)))
      .returning();
    if (!updated) { res.status(404).json({ error: "Line item not found" }); return; }
    await computeAndUpdateTotal(quoteId);
    res.json(serializeLineItem(updated));
  } catch (err) {
    req.log.error(err, "Error updating line item");
    res.status(400).json({ error: String(err) });
  }
});

router.delete("/quotes/:quoteId/line-items/:lineItemId", async (req, res) => {
  try {
    const quoteId = parseInt(req.params.quoteId, 10);
    const lineItemId = parseInt(req.params.lineItemId, 10);
    if (isNaN(quoteId) || isNaN(lineItemId)) { res.status(400).json({ error: "Invalid id" }); return; }
    await db
      .delete(quoteLineItemsTable)
      .where(and(eq(quoteLineItemsTable.id, lineItemId), eq(quoteLineItemsTable.quoteId, quoteId)));
    await computeAndUpdateTotal(quoteId);
    res.status(204).send();
  } catch (err) {
    req.log.error(err, "Error deleting line item");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
