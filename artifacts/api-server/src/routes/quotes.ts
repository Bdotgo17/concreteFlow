import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { quotesTable, quoteLineItemsTable } from "@workspace/db/schema";
import { and, eq } from "drizzle-orm";
import {
  CreateQuoteBody,
  UpdateQuoteStatusBody,
  AddLineItemBody,
  UpdateLineItemBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/quotes", async (req, res) => {
  try {
    const body = CreateQuoteBody.parse(req.body);
    const [created] = await db.insert(quotesTable).values(body).returning();
    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ error: String(err) });
  }
});

router.get("/quotes", async (_req, res) => {
  try {
    const rows = await db
      .select()
      .from(quotesTable)
      .orderBy(quotesTable.createdAt);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.get("/quotes/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [quote] = await db
      .select()
      .from(quotesTable)
      .where(eq(quotesTable.id, id));
    if (!quote) {
      res.status(404).json({ error: "Quote not found" });
      return;
    }
    const lineItems = await db
      .select()
      .from(quoteLineItemsTable)
      .where(eq(quoteLineItemsTable.quoteId, id));
    res.json({ ...quote, lineItems });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.delete("/quotes/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [deleted] = await db
      .delete(quotesTable)
      .where(eq(quotesTable.id, id))
      .returning();
    if (!deleted) {
      res.status(404).json({ error: "Quote not found" });
      return;
    }
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.patch("/quotes/:id/status", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const body = UpdateQuoteStatusBody.parse(req.body);
    const [updated] = await db
      .update(quotesTable)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(quotesTable.id, id))
      .returning();
    if (!updated) {
      res.status(404).json({ error: "Quote not found" });
      return;
    }
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: String(err) });
  }
});

router.post("/quotes/:id/line-items", async (req, res) => {
  try {
    const quoteId = Number(req.params.id);
    const body = AddLineItemBody.parse(req.body);
    const [created] = await db
      .insert(quoteLineItemsTable)
      .values({ ...body, quoteId })
      .returning();
    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ error: String(err) });
  }
});

router.put("/quotes/:id/line-items/:itemId", async (req, res) => {
  try {
    const quoteId = Number(req.params.id);
    const itemId = Number(req.params.itemId);
    const body = UpdateLineItemBody.parse(req.body);
    const [updated] = await db
      .update(quoteLineItemsTable)
      .set({ ...body, updatedAt: new Date() })
      .where(
        and(
          eq(quoteLineItemsTable.id, itemId),
          eq(quoteLineItemsTable.quoteId, quoteId),
        ),
      )
      .returning();
    if (!updated) {
      res.status(404).json({ error: "Line item not found" });
      return;
    }
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: String(err) });
  }
});

router.delete("/quotes/:id/line-items/:itemId", async (req, res) => {
  try {
    const quoteId = Number(req.params.id);
    const itemId = Number(req.params.itemId);
    const [deleted] = await db
      .delete(quoteLineItemsTable)
      .where(
        and(
          eq(quoteLineItemsTable.id, itemId),
          eq(quoteLineItemsTable.quoteId, quoteId),
        ),
      )
      .returning();
    if (!deleted) {
      res.status(404).json({ error: "Line item not found" });
      return;
    }
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
