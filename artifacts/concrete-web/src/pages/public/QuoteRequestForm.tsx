import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { HardHat, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useCreateQuoteRequestWrapper } from "@/hooks/use-api";
import { useState } from "react";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  customerName: z.string().min(2, "Name is required"),
  customerEmail: z.string().email("Invalid email address"),
  customerPhone: z.string().optional(),
  projectDescription: z.string().min(10, "Please provide more details about your project"),
  concreteType: z.string().min(1, "Please select a concrete type"),
  volumeEstimate: z.coerce.number().min(1, "Volume must be at least 1 cubic yard"),
  desiredDeliveryDate: z.string().min(1, "Delivery date is required"),
});

type FormValues = z.infer<typeof formSchema>;

const CONCRETE_TYPES = [
  { label: "Ready-Mix Standard", value: "Ready-Mix" },
  { label: "Stamped / Patterned", value: "Stamped" },
  { label: "Decorative / Colored", value: "Decorative" },
  { label: "Fiber-Reinforced", value: "Fiber-Reinforced" },
  { label: "Lightweight", value: "Lightweight" },
  { label: "Heavyweight / Structural", value: "Heavyweight" },
];

export default function QuoteRequestForm() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const createMutation = useCreateQuoteRequestWrapper();

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = (data: FormValues) => {
    createMutation.mutate(
      { data },
      {
        onSuccess: () => setIsSubmitted(true),
      }
    );
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-card p-8 rounded-3xl industrial-shadow text-center"
        >
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-3xl font-display font-bold text-foreground mb-4">Request Received!</h2>
          <p className="text-muted-foreground mb-8 text-lg">
            Thank you for choosing Apex Concrete. Our team will review your project details and get back to you with a comprehensive quote shortly.
          </p>
          <Button onClick={() => setIsSubmitted(false)} className="w-full">
            Submit Another Request
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex">
      {/* Split layout: Image on left (desktop), Form on right */}
      <div className="hidden lg:block lg:w-5/12 relative">
        <div className="absolute inset-0 bg-secondary/80 mix-blend-multiply z-10" />
        <img 
          src={`${import.meta.env.BASE_URL}images/concrete-bg.png`}
          alt="Concrete texture" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 z-20 flex flex-col justify-end p-12 text-white">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-8">
            <HardHat className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-6xl font-display font-bold uppercase leading-none mb-6">
            Build on a <br/><span className="text-primary">Solid</span> Foundation.
          </h1>
          <p className="text-lg text-white/80 max-w-md font-medium">
            Premium concrete delivery and contracting services for commercial and residential projects.
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 lg:p-12 bg-background overflow-y-auto">
        <div className="w-full max-w-xl">
          <div className="lg:hidden mb-8 text-center">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
              <HardHat className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-display font-bold uppercase">Apex Concrete</h1>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-card p-6 sm:p-10 rounded-3xl industrial-shadow border border-border"
          >
            <div className="mb-8">
              <h2 className="text-3xl font-display font-bold text-foreground">Request a Quote</h2>
              <p className="text-muted-foreground mt-2 font-medium">Tell us about your project and we'll prepare an estimate.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground uppercase tracking-wide">Full Name</label>
                  <Input placeholder="John Doe" {...register("customerName")} error={errors.customerName?.message} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground uppercase tracking-wide">Email Address</label>
                  <Input type="email" placeholder="john@example.com" {...register("customerEmail")} error={errors.customerEmail?.message} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground uppercase tracking-wide">Phone Number (Optional)</label>
                <Input type="tel" placeholder="(555) 123-4567" {...register("customerPhone")} error={errors.customerPhone?.message} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground uppercase tracking-wide">Project Description</label>
                <textarea 
                  className={cn(
                    "flex min-h-[120px] w-full rounded-xl border-2 border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/10 transition-all duration-200 resize-y",
                    errors.projectDescription && "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/10"
                  )}
                  placeholder="Describe your project (e.g., 20x30 driveway, patio extension)..."
                  {...register("projectDescription")}
                />
                {errors.projectDescription && <p className="text-sm text-destructive font-medium">{errors.projectDescription.message}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground uppercase tracking-wide">Concrete Type</label>
                  <Select options={CONCRETE_TYPES} {...register("concreteType")} error={errors.concreteType?.message} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground uppercase tracking-wide">Volume (Cubic Yards)</label>
                  <Input type="number" min="1" step="0.1" placeholder="10" {...register("volumeEstimate")} error={errors.volumeEstimate?.message} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground uppercase tracking-wide">Desired Delivery Date</label>
                <Input type="date" {...register("desiredDeliveryDate")} error={errors.desiredDeliveryDate?.message} />
              </div>

              <Button type="submit" size="lg" className="w-full mt-4" isLoading={createMutation.isPending}>
                Submit Request
              </Button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
