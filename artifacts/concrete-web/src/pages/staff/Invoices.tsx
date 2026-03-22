import { useListInvoices } from "@workspace/api-client-react";
import { useMarkInvoicePaidWrapper } from "@/hooks/use-api";
import { StaffLayout } from "@/components/layout/StaffLayout";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";

export default function Invoices() {
  const { data: invoices, isLoading } = useListInvoices();
  const markPaidMutation = useMarkInvoicePaidWrapper();

  const handleMarkPaid = (id: number) => {
    if (confirm("Are you sure you want to mark this invoice as paid?")) {
      markPaidMutation.mutate({ id });
    }
  };

  return (
    <StaffLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-display font-bold">Invoices</h1>
          <p className="text-muted-foreground mt-1 text-lg">Track payments and outstanding balances.</p>
        </div>

        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-muted-foreground uppercase tracking-wider font-bold">
                <tr>
                  <th className="px-6 py-4">Invoice ID</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Due Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">Loading invoices...</td>
                  </tr>
                ) : invoices?.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">No invoices found.</td>
                  </tr>
                ) : (
                  invoices?.map((invoice, idx) => (
                    <motion.tr 
                      key={invoice.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="hover:bg-muted/30 transition-colors group"
                    >
                      <td className="px-6 py-4 font-mono font-medium text-muted-foreground">
                        INV-{invoice.id.toString().padStart(4, '0')}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-foreground">{invoice.customerName}</p>
                        <p className="text-xs text-muted-foreground">{invoice.customerEmail}</p>
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-bold text-lg">
                        {formatCurrency(invoice.totalAmount)}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={invoice.status === 'paid' ? 'success' : 'warning'}>
                          {invoice.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground font-medium">
                        {invoice.dueDate ? formatDate(invoice.dueDate) : '-'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {invoice.status === 'unpaid' ? (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleMarkPaid(invoice.id)}
                            isLoading={markPaidMutation.isPending && markPaidMutation.variables?.id === invoice.id}
                            className="gap-2 border-emerald-500/30 text-emerald-600 hover:bg-emerald-50"
                          >
                            <CheckCircle className="w-4 h-4" /> Mark Paid
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground font-medium">Paid {invoice.paidAt ? formatDate(invoice.paidAt) : ''}</span>
                        )}
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
