import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

// Pages
import QuoteRequestForm from "./pages/public/QuoteRequestForm";
import Dashboard from "./pages/staff/Dashboard";
import QuoteRequests from "./pages/staff/QuoteRequests";
import QuoteRequestDetail from "./pages/staff/QuoteRequestDetail";
import Quotes from "./pages/staff/Quotes";
import QuoteBuilder from "./pages/staff/QuoteBuilder";
import Invoices from "./pages/staff/Invoices";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

function Router() {
  return (
    <Switch>
      {/* Public Route */}
      <Route path="/" component={QuoteRequestForm} />
      
      {/* Staff Routes */}
      <Route path="/staff" component={Dashboard} />
      <Route path="/staff/requests" component={QuoteRequests} />
      <Route path="/staff/requests/:id" component={QuoteRequestDetail} />
      <Route path="/staff/quotes" component={Quotes} />
      <Route path="/staff/quotes/new" component={QuoteBuilder} />
      <Route path="/staff/quotes/:id" component={QuoteBuilder} />
      <Route path="/staff/invoices" component={Invoices} />
      
      {/* 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
