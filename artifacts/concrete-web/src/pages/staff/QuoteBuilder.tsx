import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { StaffLayout } from "@/components/layout/StaffLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useCreateQuoteWrapper, useUpdateQuoteWrapper } from "@/hooks/use-api";
import { useGetQuote, useGetQuoteRequest } from "@workspace/api-client-react";
import { useLocation, useParams } from "wouter";
import { Plus, Trash2, ArrowLeft, Save } from "lucide-react";
import { useEffect } from "react";
import { formatCurrency } from "@/lib/utils";

const lineItemSchema = z.object({
  description: z.string().min(1, "Required"),
  quantity: z.coerce.number().min(0.1, "Min 0.1"),
  unitPrice: z.coerce.number().min(0, "Min 0"),
});

const quoteSchema = z.object({
  customerName: z.string().min(2, "Required"),
  customerEmail: z.string().email("Invalid email"),
  notes: z.string().optional().nullable(),
  status: z.enum(["draft", "sent", "accepted", "rejected"]).optional(),
  lineItems: z.array(lineItemSchema).min(1, "At least one line item required"),
});

type QuoteFormValues = z.infer<typeof quoteSchema>;

export default function QuoteBuilder() {
  const { id } = useParams();
  const [location, setLocation] = useLocation();
  const isEdit = Boolean(id && id !== "new");
  const quoteId = isEdit ? parseInt(id!, 10) : undefined;
  
  // Extract requestId from search params if coming from request detail
  const searchParams = new URLSearchParams(window.location.search);
  const sourceRequestId = searchParams.get("requestId");

  const { data: existingQuote, isLoading: isQuoteLoading } = useGetQuote(quoteId || 0, {
    query: { enabled: isEdit }
  });

  const { data: sourceRequest, isLoading: isRequestLoading } = useGetQuoteRequest(
    sourceRequestId ? parseInt(sourceRequestId, 10) : 0, 
    { query: { enabled: !isEdit && !!sourceRequestId } }
  );

  const createMutation = useCreateQuoteWrapper();
  const updateMutation = useUpdateQuoteWrapper();

  const { register, control, handleSubmit, reset, watch, formState: { errors } } = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      lineItems: [{ description: "", quantity: 1, unitPrice: 0 }],
      status: "draft"
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "lineItems",
  });

  // Prefill logic
  useEffect(() => {
    if (isEdit && existingQuote) {
      reset({
        customerName: existingQuote.customerName,
        customerEmail: existingQuote.customerEmail,
        notes: existingQuote.notes,
        status: existingQuote.status,
        lineItems: existingQuote.lineItems.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice
        }))
      });
    } else if (!isEdit && sourceRequest) {
      reset({
        customerName: sourceRequest.customerName,
        customerEmail: sourceRequest.customerEmail,
        notes: `Based on request for ${sourceRequest.concreteType} concrete.\nProject description: ${sourceRequest.projectDescription}`,
        lineItems: [{
          description: `${sourceRequest.concreteType} Concrete (${sourceRequest.volumeEstimate} cu yd)`,
          quantity: sourceRequest.volumeEstimate,
          unitPrice: 150 // Default rough estimate
        }]
      });
    }
  }, [isEdit, existingQuote, sourceRequest, reset]);

  const watchLineItems = watch("lineItems");
  const grandTotal = watchLineItems?.reduce((acc, item) => {
    const q = Number(item.quantity) || 0;
    const p = Number(item.unitPrice) || 0;
    return acc + (q * p);
  }, 0) || 0;

  const onSubmit = (data: QuoteFormValues) => {
    if (isEdit && quoteId) {
      updateMutation.mutate(
        { id: quoteId, data },
        { onSuccess: () => setLocation("/staff/quotes") }
      );
    } else {
      createMutation.mutate(
        { 
          data: {
            ...data,
            quoteRequestId: sourceRequestId ? parseInt(sourceRequestId, 10) : null
          } 
        },
        { onSuccess: () => setLocation("/staff/quotes") }
      );
    }
  };

  if ((isEdit && isQuoteLoading) || (!isEdit && isRequestLoading)) {
    return <StaffLayout><div className="animate-pulse h-96 bg-card rounded-2xl"></div></StaffLayout>;
  }

  return (
    <StaffLayout>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-5xl mx-auto pb-20">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <button type="button" onClick={() => window.history.back()} className="inline-flex items-center text-sm font-bold text-muted-foreground hover:text-primary uppercase tracking-wider transition-colors mb-2">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </button>
            <h1 className="text-4xl font-display font-bold">{isEdit ? `Edit Quote #${quoteId}` : 'Build Quote'}</h1>
          </div>
          <div className="flex gap-4 items-center w-full sm:w-auto">
            {isEdit && (
              <Select 
                {...register("status")}
                className="w-40 h-11"
                options={[
                  { label: "Draft", value: "draft" },
                  { label: "Sent", value: "sent" },
                  { label: "Accepted", value: "accepted" },
                  { label: "Rejected", value: "rejected" },
                ]}
              />
            )}
            <Button type="submit" isLoading={createMutation.isPending || updateMutation.isPending} className="flex-1 sm:flex-none gap-2">
              <Save className="w-4 h-4" /> Save Quote
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-card p-6 rounded-2xl border border-border shadow-sm space-y-4">
            <h3 className="font-bold uppercase tracking-wide border-b pb-2 mb-4">Customer Details</h3>
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase">Name</label>
              <Input {...register("customerName")} error={errors.customerName?.message} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase">Email</label>
              <Input type="email" {...register("customerEmail")} error={errors.customerEmail?.message} />
            </div>
          </div>

          <div className="bg-card p-6 rounded-2xl border border-border shadow-sm space-y-4">
            <h3 className="font-bold uppercase tracking-wide border-b pb-2 mb-4">Internal Notes</h3>
            <textarea 
              className="flex w-full h-32 rounded-xl border-2 border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/10 resize-none"
              placeholder="Terms, conditions, internal notes..."
              {...register("notes")}
            />
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border bg-muted/30 flex justify-between items-center">
            <h3 className="font-bold uppercase tracking-wide">Line Items</h3>
            <Button type="button" variant="outline" size="sm" onClick={() => append({ description: "", quantity: 1, unitPrice: 0 })} className="gap-2">
              <Plus className="w-4 h-4" /> Add Item
            </Button>
          </div>
          
          <div className="overflow-x-auto p-6">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  <th className="pb-4 w-1/2">Description</th>
                  <th className="pb-4 w-1/6">Qty</th>
                  <th className="pb-4 w-1/6">Unit Price</th>
                  <th className="pb-4 text-right">Total</th>
                  <th className="pb-4 w-12"></th>
                </tr>
              </thead>
              <tbody className="space-y-2">
                {fields.map((field, index) => {
                  const q = Number(watchLineItems?.[index]?.quantity) || 0;
                  const p = Number(watchLineItems?.[index]?.unitPrice) || 0;
                  const rowTotal = q * p;
                  
                  return (
                    <tr key={field.id} className="group">
                      <td className="pr-2 pb-2">
                        <Input 
                          placeholder="Item description" 
                          {...register(`lineItems.${index}.description` as const)} 
                          className="h-10"
                        />
                      </td>
                      <td className="pr-2 pb-2">
                        <Input 
                          type="number" step="0.1" 
                          {...register(`lineItems.${index}.quantity` as const)} 
                          className="h-10 font-mono"
                        />
                      </td>
                      <td className="pr-2 pb-2">
                        <Input 
                          type="number" step="0.01" 
                          {...register(`lineItems.${index}.unitPrice` as const)} 
                          className="h-10 font-mono"
                        />
                      </td>
                      <td className="pb-2 text-right font-mono font-bold pt-2">
                        {formatCurrency(rowTotal)}
                      </td>
                      <td className="pb-2 pl-2 text-right">
                        <button 
                          type="button" 
                          onClick={() => remove(index)}
                          className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3} className="text-right pt-6 pr-4 font-bold uppercase tracking-wider text-muted-foreground">Grand Total</td>
                  <td className="text-right pt-6 font-mono text-2xl font-bold text-primary">
                    {formatCurrency(grandTotal)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
            {errors.lineItems?.root && (
              <p className="text-sm text-destructive mt-4">{errors.lineItems.root.message}</p>
            )}
          </div>
        </div>
      </form>
    </StaffLayout>
  );
}
