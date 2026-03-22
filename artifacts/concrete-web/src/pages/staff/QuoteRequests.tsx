import { useListQuoteRequests } from "@workspace/api-client-react";
import { StaffLayout } from "@/components/layout/StaffLayout";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { Link } from "wouter";
import { motion } from "framer-motion";

export default function QuoteRequests() {
  const { data: requests, isLoading } = useListQuoteRequests();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'reviewed': return 'neutral';
      case 'converted': return 'success';
      default: return 'default';
    }
  };

  return (
    <StaffLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-display font-bold">Quote Requests</h1>
          <p className="text-muted-foreground mt-1 text-lg">Manage incoming customer project inquiries.</p>
        </div>

        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-muted-foreground uppercase tracking-wider font-bold">
                <tr>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Project</th>
                  <th className="px-6 py-4">Volume</th>
                  <th className="px-6 py-4">Delivery</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">Loading requests...</td>
                  </tr>
                ) : requests?.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">No requests found.</td>
                  </tr>
                ) : (
                  requests?.map((req, idx) => (
                    <motion.tr 
                      key={req.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="hover:bg-muted/30 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <Link href={`/staff/requests/${req.id}`} className="block">
                          <p className="font-bold text-foreground group-hover:text-primary transition-colors">{req.customerName}</p>
                          <p className="text-xs text-muted-foreground">{req.customerEmail}</p>
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium">{req.concreteType}</p>
                      </td>
                      <td className="px-6 py-4 font-mono font-medium">
                        {req.volumeEstimate} cy
                      </td>
                      <td className="px-6 py-4">
                        {formatDate(req.desiredDeliveryDate)}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={getStatusColor(req.status)}>{req.status}</Badge>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {formatDate(req.createdAt)}
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
