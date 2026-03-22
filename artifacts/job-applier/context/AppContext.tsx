import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

function getApiBase(): string {
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;
  const domain = process.env.EXPO_PUBLIC_DOMAIN;
  if (domain) return `https://${domain}`;
  return "";
}

const BASE_URL = getApiBase();

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}/api${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export interface LineItem {
  id: number;
  quoteId: number;
  description: string;
  unit: string;
  quantity: string;
  unitPrice: string;
  createdAt: string;
  updatedAt: string;
}

export type QuoteRequestStatus = "pending" | "reviewed" | "converted" | "rejected";

export interface QuoteRequest {
  id: number;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  customerAddress?: string | null;
  projectDescription: string;
  desiredDate?: string | null;
  status: QuoteRequestStatus;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type QuoteStatus = "draft" | "sent" | "accepted" | "declined";

export interface Quote {
  id: number;
  quoteRequestId: number;
  status: QuoteStatus;
  expiryDate?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  lineItems?: LineItem[];
}

export type InvoiceStatus = "unpaid" | "paid";

export interface Invoice {
  id: number;
  quoteId: number;
  status: InvoiceStatus;
  dueDate?: string | null;
  total: string;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export function calcLineItemTotal(li: LineItem): number {
  return parseFloat(li.quantity) * parseFloat(li.unitPrice);
}

export function calcTotal(lineItems: LineItem[]): number {
  return lineItems.reduce((sum, li) => sum + calcLineItemTotal(li), 0);
}

interface AppContextType {
  quoteRequests: QuoteRequest[];
  quotes: Quote[];
  invoices: Invoice[];
  isLoading: boolean;
  error: string | null;
  refreshAll: () => Promise<void>;
  createQuoteRequest: (data: {
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    customerAddress?: string;
    projectDescription: string;
    desiredDate?: string;
    notes?: string;
  }) => Promise<QuoteRequest>;
  updateQuoteRequestStatus: (id: number, status: QuoteRequestStatus, notes?: string) => Promise<void>;
  createQuote: (data: {
    quoteRequestId: number;
    notes?: string;
    expiryDate?: string;
    lineItems: { description: string; unit: string; quantity: string; unitPrice: string }[];
  }) => Promise<Quote>;
  updateQuoteStatus: (id: number, status: QuoteStatus) => Promise<void>;
  createInvoiceFromQuote: (quoteId: number) => Promise<Invoice>;
  updateInvoiceStatus: (id: number, status: InvoiceStatus) => Promise<void>;
  getQuoteRequest: (id: number) => QuoteRequest | undefined;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [quoteRequests, setQuoteRequests] = useState<QuoteRequest[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshAll = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [qrs, qs, invs] = await Promise.all([
        apiFetch<QuoteRequest[]>("/quote-requests"),
        apiFetch<Quote[]>("/quotes"),
        apiFetch<Invoice[]>("/invoices"),
      ]);
      setQuoteRequests(qrs);
      setQuotes(qs);
      setInvoices(invs);
    } catch (e) {
      setError("Failed to load data from server");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const createQuoteRequest = useCallback(async (data: {
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    customerAddress?: string;
    projectDescription: string;
    desiredDate?: string;
    notes?: string;
  }) => {
    const created = await apiFetch<QuoteRequest>("/quote-requests", {
      method: "POST",
      body: JSON.stringify(data),
    });
    setQuoteRequests((prev) => [created, ...prev]);
    return created;
  }, []);

  const updateQuoteRequestStatus = useCallback(async (id: number, status: QuoteRequestStatus, notes?: string) => {
    const updated = await apiFetch<QuoteRequest>(`/quote-requests/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status, notes }),
    });
    setQuoteRequests((prev) => prev.map((qr) => (qr.id === id ? updated : qr)));
  }, []);

  const createQuote = useCallback(async (data: {
    quoteRequestId: number;
    notes?: string;
    expiryDate?: string;
    lineItems: { description: string; unit: string; quantity: string; unitPrice: string }[];
  }) => {
    const { lineItems, ...quoteBody } = data;
    const created = await apiFetch<Quote>("/quotes", {
      method: "POST",
      body: JSON.stringify(quoteBody),
    });
    for (const li of lineItems) {
      await apiFetch(`/quotes/${created.id}/line-items`, {
        method: "POST",
        body: JSON.stringify(li),
      });
    }
    const quoteWithItems = await apiFetch<Quote>(`/quotes/${created.id}`);
    setQuotes((prev) => [quoteWithItems, ...prev]);
    return quoteWithItems;
  }, []);

  const updateQuoteStatus = useCallback(async (id: number, status: QuoteStatus) => {
    const updated = await apiFetch<Quote>(`/quotes/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    setQuotes((prev) => prev.map((q) => (q.id === id ? updated : q)));
  }, []);

  const createInvoiceFromQuote = useCallback(async (quoteId: number) => {
    const created = await apiFetch<Invoice>(`/invoices/from-quote/${quoteId}`, {
      method: "POST",
    });
    setInvoices((prev) => [created, ...prev]);
    return created;
  }, []);

  const updateInvoiceStatus = useCallback(async (id: number, status: InvoiceStatus) => {
    const updated = await apiFetch<Invoice>(`/invoices/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    setInvoices((prev) => prev.map((inv) => (inv.id === id ? updated : inv)));
  }, []);

  const getQuoteRequest = useCallback((id: number) => {
    return quoteRequests.find((qr) => qr.id === id);
  }, [quoteRequests]);

  return (
    <AppContext.Provider
      value={{
        quoteRequests,
        quotes,
        invoices,
        isLoading,
        error,
        refreshAll,
        createQuoteRequest,
        updateQuoteRequestStatus,
        createQuote,
        updateQuoteStatus,
        createInvoiceFromQuote,
        updateInvoiceStatus,
        getQuoteRequest,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
