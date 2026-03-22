import { useListQuotes } from "@workspace/api-client-react";
import { StaffLayout } from "@/components/layout/StaffLayout";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";

export default function Quotes() {
  const { data: quotes, isLoading } = useListQuotes();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'neutral';
      case 'sent': return 'default';
      case 'accepted': return 'success';
      case 'rejected': return 'destructive';
      default: return 'default';
    }
  };

  return (
    <StaffLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-4xl font-display font-bold">Quotes</h1>
            <p className="text-muted-foreground mt-1 text-lg">Manage and create project estimates.</p>
          </div>
          <Link href="/staff/quotes/new">
            <Button className="gap-2">
              <Plus className="w-5 h-5" /> New Quote
            </Button>
          </Link>
        </div>

        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-muted-foreground uppercase tracking-wider font-bold">
                <tr>
                  <th className="px-6 py-4">Quote ID</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4 text-right">Total Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">Loading quotes...</td>
                  </tr>
                ) : quotes?.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">No quotes found.</td>
                  </tr>
                ) : (
                  quotes?.map((quote, idx) => (
                    <motion.tr 
                      key={quote.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="hover:bg-muted/30 transition-colors group"
                    >
                      <td className="px-6 py-4 font-mono font-medium text-muted-foreground">
                        #{quote.id}
                      </td>
                      <td className="px-6 py-4">
                        <Link href={`/staff/quotes/${quote.id}`} className="block">
                          <p className="font-bold text-foreground group-hover:text-primary transition-colors">{quote.customerName}</p>
                          <p className="text-xs text-muted-foreground">{quote.customerEmail}</p>
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-bold text-lg">
                        {formatCurrency(quote.totalAmount)}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={getStatusColor(quote.status)}>{quote.status}</Badge>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {formatDate(quote.createdAt)}
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </StaffLayout>
  );
}
