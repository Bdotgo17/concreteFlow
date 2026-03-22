import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { invoicesTable, quotesTable, quoteLineItemsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { UpdateInvoiceStatusBody } from "@workspace/api-zod";

const router: IRouter = Router();

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

    const total = lineItems
      .reduce(
        (sum, item) =>
          sum + Number(item.quantity) * Number(item.unitPrice),
        0,
      )
      .toFixed(2);

    const [invoice] = await db
      .insert(invoicesTable)
      .values({ quoteId, total, status: "unpaid" })
      .returning();

    res.status(201).json(invoice);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.get("/invoices", async (_req, res) => {
  try {
    const rows = await db
      .select()
      .from(invoicesTable)
      .orderBy(invoicesTable.createdAt);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.get("/invoices/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [invoice] = await db
      .select()
      .from(invoicesTable)
      .where(eq(invoicesTable.id, id));
    if (!invoice) {
      res.status(404).json({ error: "Invoice not found" });
      return;
    }
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.patch("/invoices/:id/status", async (req, res) => {
  try {
    const id = Number(req.params.id);
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
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: String(err) });
  }
});

export default router;
