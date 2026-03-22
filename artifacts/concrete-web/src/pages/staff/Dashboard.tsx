import { useGetDashboardStats } from "@workspace/api-client-react";
import { StaffLayout } from "@/components/layout/StaffLayout";
import { ClipboardList, FileText, Receipt, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";

export default function Dashboard() {
  const { data: stats, isLoading } = useGetDashboardStats();

  if (isLoading) {
    return (
      <StaffLayout>
        <div className="animate-pulse space-y-8">
          <div className="h-10 bg-muted rounded-xl w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <div key={i} className="h-32 bg-muted rounded-2xl"></div>)}
          </div>
        </div>
      </StaffLayout>
    );
  }

  const statCards = [
    { 
      label: "Open Requests", 
      value: stats?.openRequestsCount || 0, 
      icon: ClipboardList, 
      color: "text-blue-500", 
      bg: "bg-blue-500/10",
      href: "/staff/requests"
    },
    { 
      label: "Active Quotes", 
      value: stats?.activeQuotesCount || 0, 
      icon: FileText, 
      color: "text-amber-500", 
      bg: "bg-amber-500/10",
      href: "/staff/quotes"
    },
    { 
      label: "Unpaid Invoices", 
      value: stats?.unpaidInvoicesCount || 0, 
      icon: Receipt, 
      color: "text-red-500", 
      bg: "bg-red-500/10",
      href: "/staff/invoices"
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'reviewed': return 'neutral';
      case 'converted': return 'success';
      case 'draft': return 'neutral';
      case 'sent': return 'default';
      case 'accepted': return 'success';
      case 'rejected': return 'destructive';
      default: return 'default';
    }
  };

  return (
    <StaffLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-display font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-lg">Welcome back. Here's what's happening today.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {statCards.map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Link href={stat.href}>
                <div className="bg-card p-6 rounded-2xl border border-border shadow-sm hover:shadow-md transition-all group cursor-pointer h-full">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </div>
                  <h3 className="text-muted-foreground font-bold uppercase tracking-wider text-sm mb-1">{stat.label}</h3>
                  <p className="text-4xl font-display font-bold text-foreground">{stat.value}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Requests */}
          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-border bg-muted/30 flex justify-between items-center">
              <h3 className="font-display text-2xl font-bold">Recent Requests</h3>
              <Link href="/staff/requests" className="text-sm font-bold text-primary hover:underline uppercase tracking-wide">View All</Link>
            </div>
            <div className="divide-y divide-border">
              {stats?.recentRequests?.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">No recent requests.</div>
              ) : (
                stats?.recentRequests?.slice(0, 5).map((req) => (
                  <Link key={req.id} href={`/staff/requests/${req.id}`}>
                    <div className="p-4 hover:bg-muted/50 transition-colors cursor-pointer flex justify-between items-center">
                      <div>
                        <p className="font-bold text-foreground">{req.customerName}</p>
                        <p className="text-sm text-muted-foreground">{req.concreteType} • {req.volumeEstimate} cu yd</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={getStatusColor(req.status)} className="mb-1">{req.status}</Badge>
                        <p className="text-xs text-muted-foreground block">{formatDate(req.createdAt)}</p>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Recent Quotes */}
          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-border bg-muted/30 flex justify-between items-center">
              <h3 className="font-display text-2xl font-bold">Recent Quotes</h3>
              <Link href="/staff/quotes" className="text-sm font-bold text-primary hover:underline uppercase tracking-wide">View All</Link>
            </div>
            <div className="divide-y divide-border">
              {stats?.recentQuotes?.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">No recent quotes.</div>
              ) : (
                stats?.recentQuotes?.slice(0, 5).map((quote) => (
                  <Link key={quote.id} href={`/staff/quotes/${quote.id}`}>
                    <div className="p-4 hover:bg-muted/50 transition-colors cursor-pointer flex justify-between items-center">
                      <div>
                        <p className="font-bold text-foreground">{quote.customerName}</p>
                        <p className="text-sm text-muted-foreground font-medium text-primary">${quote.totalAmount.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={getStatusColor(quote.status)} className="mb-1">{quote.status}</Badge>
                        <p className="text-xs text-muted-foreground block">{formatDate(quote.createdAt)}</p>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </StaffLayout>
  );
}
