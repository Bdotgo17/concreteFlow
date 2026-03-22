import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { invoicesTable, quotesTable, quoteLineItemsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { UpdateInvoiceStatusBody } from "@workspace/api-zod";

const router: IRouter = Router();

function serializeInvoice(inv: typeof invoicesTable.$inferSelect) {
  return {
    id: inv.id,
    quoteId: inv.quoteId,
    customerName: inv.customerName,
    customerEmail: inv.customerEmail,
    totalAmount: parseFloat(inv.totalAmount),
    status: inv.status,
    dueDate: inv.dueDate ?? null,
    paidAt: inv.paidAt ? inv.paidAt.toISOString() : null,
    notes: inv.notes,
    createdAt: inv.createdAt.toISOString(),
  };
}

router.post("/invoices/from-quote/:quoteId", async (req, res) => {
  try {
    const quoteId = Number(req.params.quoteId);
    const [quote] = await db
      .select()
      .from(quotesTable)
      .where(eq(quotesTable.id, quoteId));

    if (!quote) {
      res.status(404).json({ error: "Quote not found" });
      return;
    }
    if (quote.status !== "accepted") {
      res
        .status(400)
        .json({ error: "Invoice can only be generated from an accepted quote" });
      return;
    }

    const lineItems = await db
      .select()
      .from(quoteLineItemsTable)
      .where(eq(quoteLineItemsTable.quoteId, quoteId));

    const totalAmount = lineItems
      .reduce(
        (sum, item) =>
          sum + Number(item.quantity) * Number(item.unitPrice),
        0,
      )
      .toFixed(2);

    const [invoice] = await db
      .insert(invoicesTable)
      .values({ 
        quoteId, 
        customerName: quote.customerName,
        customerEmail: quote.customerEmail,
        totalAmount, 
        status: "unpaid" 
      })
      .returning();

    res.status(201).json(serializeInvoice(invoice));
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.get("/invoices", async (req, res) => {
  try {
    const rows = await db
      .select()
      .from(invoicesTable)
      .orderBy(invoicesTable.createdAt);
    res.json(rows.map(serializeInvoice));
  } catch (err) {
    req.log?.error?.(err, "Error listing invoices") || console.error(err);
    res.status(500).json({ error: String(err) });
  }
});

router.get("/invoices/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }
    const [invoice] = await db
      .select()
      .from(invoicesTable)
      .where(eq(invoicesTable.id, id));
    if (!invoice) {
      res.status(404).json({ error: "Invoice not found" });
      return;
    }
    res.json(serializeInvoice(invoice));
  } catch (err) {
    req.log?.error?.(err, "Error getting invoice") || console.error(err);
    res.status(500).json({ error: String(err) });
  }
});

router.patch("/invoices/:id/status", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }
    const body = UpdateInvoiceStatusBody.parse(req.body);
    const [updated] = await db
      .update(invoicesTable)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(invoicesTable.id, id))
      .returning();
    if (!updated) {
      res.status(404).json({ error: "Invoice not found" });
      return;
    }
    res.json(serializeInvoice(updated));
  } catch (err) {
    res.status(400).json({ error: String(err) });
  }
});

router.post("/invoices/:id/mark-paid", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }
    const [existing] = await db.select().from(invoicesTable).where(eq(invoicesTable.id, id));
    if (!existing) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    const [updated] = await db
      .update(invoicesTable)
      .set({ status: "paid", paidAt: new Date(), updatedAt: new Date() })
      .where(eq(invoicesTable.id, id))
      .returning();
    res.json(serializeInvoice(updated));
  } catch (err) {
    req.log?.error?.(err, "Error marking invoice as paid") || console.error(err);
    res.status(500).json({ error: String(err) });
  }
});

export default router;
