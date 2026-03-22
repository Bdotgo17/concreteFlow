import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import {
  quoteRequestsTable,
} from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreateQuoteRequestBody } from "@workspace/api-zod";

const router: IRouter = Router();

function serializeRequest(r: typeof quoteRequestsTable.$inferSelect) {
  return {
    id: r.id,
    customerName: r.customerName,
    customerEmail: r.customerEmail,
    customerPhone: r.customerPhone ?? undefined,
    projectDescription: r.projectDescription,
    concreteType: r.concreteType,
    volumeEstimate: parseFloat(r.volumeEstimate),
    desiredDeliveryDate: r.desiredDeliveryDate,
    status: r.status,
    createdAt: r.createdAt.toISOString(),
  };
}

router.get("/quote-requests", async (req, res) => {
  try {
    const requests = await db.select().from(quoteRequestsTable).orderBy(quoteRequestsTable.createdAt);
    res.json(requests.map(serializeRequest));
  } catch (err) {
    req.log.error(err, "Error listing quote requests");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/quote-requests", async (req, res) => {
  try {
    const rawBody = {
      ...req.body,
      desiredDeliveryDate: req.body.desiredDeliveryDate ? new Date(req.body.desiredDeliveryDate) : undefined,
    };
    const body = CreateQuoteRequestBody.parse(rawBody);
    const [inserted] = await db
      .insert(quoteRequestsTable)
      .values({
        customerName: body.customerName,
        customerEmail: body.customerEmail,
        customerPhone: body.customerPhone ?? null,
        projectDescription: body.projectDescription,
        concreteType: body.concreteType,
        volumeEstimate: body.volumeEstimate.toString(),
        desiredDeliveryDate: body.desiredDeliveryDate.toISOString().split("T")[0],
      })
      .returning();
    res.status(201).json(serializeRequest(inserted));
  } catch (err) {
    req.log.error(err, "Error creating quote request");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/quote-requests/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }
    const [request] = await db
      .select()
      .from(quoteRequestsTable)
      .where(eq(quoteRequestsTable.id, id));
    if (!request) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json(serializeRequest(request));
  } catch (err) {
    req.log.error(err, "Error getting quote request");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
