import { useGetQuoteRequest } from "@workspace/api-client-react";
import { StaffLayout } from "@/components/layout/StaffLayout";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";
import { Link, useParams } from "wouter";
import { ArrowLeft, FilePlus2, User, Phone, Mail, Calendar, Cuboid, FileText } from "lucide-react";

export default function QuoteRequestDetail() {
  const { id } = useParams();
  const requestId = parseInt(id || "0", 10);
  
  const { data: request, isLoading } = useGetQuoteRequest(requestId, {
    query: { enabled: !!requestId }
  });

  if (isLoading) {
    return <StaffLayout><div className="animate-pulse h-64 bg-card rounded-2xl"></div></StaffLayout>;
  }

  if (!request) {
    return <StaffLayout><div>Request not found.</div></StaffLayout>;
  }

  return (
    <StaffLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <Link href="/staff/requests" className="inline-flex items-center text-sm font-bold text-muted-foreground hover:text-primary uppercase tracking-wider transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Requests
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-display font-bold">Request #{request.id}</h1>
            <p className="text-muted-foreground mt-1">Submitted on {formatDate(request.createdAt)}</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant={request.status === 'converted' ? 'success' : request.status === 'pending' ? 'warning' : 'neutral'} className="text-sm px-4 py-1">
              {request.status}
            </Badge>
            {request.status !== 'converted' && (
              <Link href={`/staff/quotes/new?requestId=${request.id}`}>
                <Button className="gap-2">
                  <FilePlus2 className="w-5 h-5" />
                  Create Quote
                </Button>
              </Link>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Customer Info */}
          <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
            <h3 className="text-lg font-bold uppercase tracking-wide mb-6 flex items-center gap-2 border-b pb-4">
              <User className="w-5 h-5 text-primary" /> Customer Details
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground font-bold uppercase tracking-wider">Full Name</p>
                <p className="text-lg font-medium">{request.customerName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-bold uppercase tracking-wider">Email</p>
                <p className="flex items-center gap-2 text-lg font-medium">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <a href={`mailto:${request.customerEmail}`} className="text-primary hover:underline">{request.customerEmail}</a>
                </p>
              </div>
              {request.customerPhone && (
                <div>
                  <p className="text-sm text-muted-foreground font-bold uppercase tracking-wider">Phone</p>
                  <p className="flex items-center gap-2 text-lg font-medium">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <a href={`tel:${request.customerPhone}`} className="text-primary hover:underline">{request.customerPhone}</a>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Project Details */}
          <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
            <h3 className="text-lg font-bold uppercase tracking-wide mb-6 flex items-center gap-2 border-b pb-4">
              <Cuboid className="w-5 h-5 text-primary" /> Project Specifications
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground font-bold uppercase tracking-wider">Mix Type</p>
                  <p className="text-lg font-medium">{request.concreteType}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-bold uppercase tracking-wider">Volume</p>
                  <p className="text-lg font-medium font-mono bg-muted inline-block px-2 py-1 rounded">{request.volumeEstimate} cu yd</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-bold uppercase tracking-wider">Desired Delivery</p>
                <p className="flex items-center gap-2 text-lg font-medium">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  {formatDate(request.desiredDeliveryDate)}
                </p>
              </div>
            </div>
          </div>

          {/* Description Full Width */}
          <div className="bg-card p-6 rounded-2xl border border-border shadow-sm md:col-span-2">
            <h3 className="text-lg font-bold uppercase tracking-wide mb-4 flex items-center gap-2 border-b pb-4">
              <FileText className="w-5 h-5 text-primary" /> Description
            </h3>
            <p className="whitespace-pre-wrap text-lg leading-relaxed">{request.projectDescription}</p>
          </div>
        </div>
      </div>
    </StaffLayout>
  );
}
