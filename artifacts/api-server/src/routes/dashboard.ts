import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { quoteRequestsTable, quotesTable, invoicesTable } from "@workspace/db";
import { eq, count } from "drizzle-orm";

const router: IRouter = Router();

router.get("/dashboard", async (req, res) => {
  try {
    const [openRequestsResult] = await db
      .select({ count: count() })
      .from(quoteRequestsTable)
      .where(eq(quoteRequestsTable.status, "pending"));

    const [activeQuotesResult] = await db
      .select({ count: count() })
      .from(quotesTable)
      .where(eq(quotesTable.status, "sent"));

    const [unpaidInvoicesResult] = await db
      .select({ count: count() })
      .from(invoicesTable)
      .where(eq(invoicesTable.status, "unpaid"));

    const recentRequests = await db
      .select()
      .from(quoteRequestsTable)
      .orderBy(quoteRequestsTable.createdAt)
      .limit(5);

    const recentQuotes = await db
      .select()
      .from(quotesTable)
      .orderBy(quotesTable.createdAt)
      .limit(5);

    res.json({
      openRequestsCount: openRequestsResult.count,
      activeQuotesCount: activeQuotesResult.count,
      unpaidInvoicesCount: unpaidInvoicesResult.count,
      recentRequests: recentRequests.map((r) => ({
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
      })),
      recentQuotes: recentQuotes.map((q) => ({
        id: q.id,
        quoteRequestId: q.quoteRequestId ?? null,
        customerName: q.customerName,
        customerEmail: q.customerEmail,
        status: q.status,
        totalAmount: parseFloat(q.totalAmount),
        notes: q.notes ?? null,
        createdAt: q.createdAt.toISOString(),
        updatedAt: q.updatedAt.toISOString(),
      })),
    });
  } catch (err) {
    req.log.error(err, "Error getting dashboard stats");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
