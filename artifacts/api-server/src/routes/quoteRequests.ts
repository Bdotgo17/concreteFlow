import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { quoteRequestsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import {
  SubmitQuoteRequestBody,
  UpdateQuoteRequestStatusBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/quote-requests", async (req, res) => {
  try {
    const body = SubmitQuoteRequestBody.parse(req.body);
    const [created] = await db
      .insert(quoteRequestsTable)
      .values(body)
      .returning();
    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ error: String(err) });
  }
});

router.get("/quote-requests", async (_req, res) => {
  try {
    const rows = await db
      .select()
      .from(quoteRequestsTable)
      .orderBy(quoteRequestsTable.createdAt);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.get("/quote-requests/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [row] = await db
      .select()
      .from(quoteRequestsTable)
      .where(eq(quoteRequestsTable.id, id));
    if (!row) {
      res.status(404).json({ error: "Quote request not found" });
      return;
    }
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.patch("/quote-requests/:id/status", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const body = UpdateQuoteRequestStatusBody.parse(req.body);
    const [updated] = await db
      .update(quoteRequestsTable)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(quoteRequestsTable.id, id))
      .returning();
    if (!updated) {
      res.status(404).json({ error: "Quote request not found" });
      return;
    }
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: String(err) });
  }
});

export default router;
