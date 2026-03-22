import { Router, type IRouter, type Request, type Response } from "express";

const router: IRouter = Router();

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

interface QuoteRequest {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  projectDescription: string;
  desiredDate: string;
  status: "new" | "reviewed" | "quoted" | "declined";
  createdAt: string;
  address?: string;
}

interface Quote {
  id: string;
  quoteRequestId: string;
  customerName: string;
  customerEmail: string;
  lineItems: LineItem[];
  notes?: string;
  status: "draft" | "sent" | "accepted" | "declined";
  createdAt: string;
  updatedAt: string;
}

interface Invoice {
  id: string;
  quoteId: string;
  customerName: string;
  customerEmail: string;
  lineItems: LineItem[];
  notes?: string;
  status: "unpaid" | "paid";
  dueDate: string;
  createdAt: string;
  paidAt?: string;
}

const quoteRequests: QuoteRequest[] = [
  {
    id: "qr1",
    customerName: "Mike Thompson",
    customerEmail: "mike.t@email.com",
    customerPhone: "555-0101",
    projectDescription: "Need a concrete driveway poured, approx 2-car width, 40ft long",
    desiredDate: "2026-04-15",
    status: "new",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    address: "142 Oak Street, Springfield",
  },
  {
    id: "qr2",
    customerName: "Sarah Johnson",
    customerEmail: "sarah.j@email.com",
    customerPhone: "555-0102",
    projectDescription: "Basement floor needs resurfacing and sealing, about 800 sq ft",
    desiredDate: "2026-04-22",
    status: "reviewed",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    address: "77 Elm Avenue, Lakeside",
  },
  {
    id: "qr3",
    customerName: "Dave Chen",
    customerEmail: "dave.c@email.com",
    customerPhone: "555-0103",
    projectDescription: "Concrete patio extension, 20x15 feet, stamped finish preferred",
    desiredDate: "2026-05-01",
    status: "quoted",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    address: "309 Maple Court, Riverside",
  },
];

const quotes: Quote[] = [
  {
    id: "q1",
    quoteRequestId: "qr3",
    customerName: "Dave Chen",
    customerEmail: "dave.c@email.com",
    lineItems: [
      { id: "li1", description: "Concrete material (6 cubic yards)", quantity: 6, unitPrice: 180 },
      { id: "li2", description: "Labor - excavation and forming", quantity: 1, unitPrice: 850 },
      { id: "li3", description: "Labor - pour and finish (stamped)", quantity: 1, unitPrice: 1200 },
      { id: "li4", description: "Sealer application", quantity: 1, unitPrice: 250 },
    ],
    notes: "Stamped pattern: cobblestone. Color: charcoal. Includes 1-year warranty.",
    status: "sent",
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "q2",
    quoteRequestId: "qr2",
    customerName: "Sarah Johnson",
    customerEmail: "sarah.j@email.com",
    lineItems: [
      { id: "li5", description: "Surface grinding and prep", quantity: 800, unitPrice: 0.75 },
      { id: "li6", description: "Self-leveling overlay (800 sq ft)", quantity: 1, unitPrice: 1600 },
      { id: "li7", description: "Epoxy sealer application", quantity: 1, unitPrice: 400 },
    ],
    notes: "2-coat epoxy system. Color: light gray.",
    status: "draft",
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const invoices: Invoice[] = [
  {
    id: "inv1",
    quoteId: "q1",
    customerName: "Dave Chen",
    customerEmail: "dave.c@email.com",
    lineItems: [
      { id: "li1", description: "Concrete material (6 cubic yards)", quantity: 6, unitPrice: 180 },
      { id: "li2", description: "Labor - excavation and forming", quantity: 1, unitPrice: 850 },
      { id: "li3", description: "Labor - pour and finish (stamped)", quantity: 1, unitPrice: 1200 },
      { id: "li4", description: "Sealer application", quantity: 1, unitPrice: 250 },
    ],
    notes: "Thank you for your business! Payment due within 30 days.",
    status: "unpaid",
    dueDate: "2026-05-15",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "inv2",
    quoteId: "q0",
    customerName: "Linda Park",
    customerEmail: "linda.p@email.com",
    lineItems: [
      { id: "li8", description: "Concrete sidewalk (50 linear ft)", quantity: 50, unitPrice: 28 },
      { id: "li9", description: "Demo and haul away", quantity: 1, unitPrice: 350 },
    ],
    notes: "Sidewalk replacement complete.",
    status: "paid",
    dueDate: "2026-03-01",
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    paidAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

router.get("/quote-requests", (_req: Request, res: Response) => {
  res.json(quoteRequests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
});

router.get("/quote-requests/:id", (req: Request, res: Response) => {
  const item = quoteRequests.find((qr) => qr.id === req.params.id);
  if (!item) return res.status(404).json({ error: "Not found" });
  return res.json(item);
});

router.post("/quote-requests", (req: Request, res: Response) => {
  const body = req.body as Omit<QuoteRequest, "id" | "createdAt" | "status">;
  const newItem: QuoteRequest = {
    ...body,
    id: generateId(),
    status: "new",
    createdAt: new Date().toISOString(),
  };
  quoteRequests.push(newItem);
  return res.status(201).json(newItem);
});

router.patch("/quote-requests/:id", (req: Request, res: Response) => {
  const idx = quoteRequests.findIndex((qr) => qr.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  quoteRequests[idx] = { ...quoteRequests[idx], ...req.body } as QuoteRequest;
  return res.json(quoteRequests[idx]);
});

router.get("/quotes", (_req: Request, res: Response) => {
  res.json(quotes.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
});

router.get("/quotes/:id", (req: Request, res: Response) => {
  const item = quotes.find((q) => q.id === req.params.id);
  if (!item) return res.status(404).json({ error: "Not found" });
  return res.json(item);
});

router.post("/quotes", (req: Request, res: Response) => {
  const body = req.body as Omit<Quote, "id" | "createdAt" | "updatedAt">;
  const now = new Date().toISOString();
  const newItem: Quote = {
    ...body,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  };
  quotes.push(newItem);
  return res.status(201).json(newItem);
});

router.put("/quotes/:id", (req: Request, res: Response) => {
  const idx = quotes.findIndex((q) => q.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  quotes[idx] = { ...req.body, id: req.params.id, updatedAt: new Date().toISOString() } as Quote;
  return res.json(quotes[idx]);
});

router.patch("/quotes/:id", (req: Request, res: Response) => {
  const idx = quotes.findIndex((q) => q.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  quotes[idx] = { ...quotes[idx], ...req.body, updatedAt: new Date().toISOString() } as Quote;
  return res.json(quotes[idx]);
});

router.get("/invoices", (_req: Request, res: Response) => {
  res.json(invoices.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
});

router.get("/invoices/:id", (req: Request, res: Response) => {
  const item = invoices.find((inv) => inv.id === req.params.id);
  if (!item) return res.status(404).json({ error: "Not found" });
  return res.json(item);
});

router.post("/invoices", (req: Request, res: Response) => {
  const body = req.body as Omit<Invoice, "id" | "createdAt">;
  const newItem: Invoice = {
    ...body,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  invoices.push(newItem);
  return res.status(201).json(newItem);
});

router.patch("/invoices/:id", (req: Request, res: Response) => {
  const idx = invoices.findIndex((inv) => inv.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  invoices[idx] = { ...invoices[idx], ...req.body } as Invoice;
  return res.json(invoices[idx]);
});

export default router;
