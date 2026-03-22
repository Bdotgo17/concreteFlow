import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  FileText, 
  ClipboardList, 
  Receipt,
  Menu,
  X,
  HardHat
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function StaffLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { name: "Dashboard", href: "/staff", icon: LayoutDashboard },
    { name: "Quote Requests", href: "/staff/requests", icon: ClipboardList },
    { name: "Quotes", href: "/staff/quotes", icon: FileText },
    { name: "Invoices", href: "/staff/invoices", icon: Receipt },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile sidebar backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-secondary text-secondary-foreground transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 flex flex-col",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 flex items-center gap-3 border-b border-white/10">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <HardHat className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold leading-none">Apex Concrete</h1>
            <p className="text-xs text-secondary-foreground/60 uppercase tracking-widest font-semibold">Staff Portal</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navigation.map((item) => {
            const isActive = location === item.href || (item.href !== "/staff" && location.startsWith(item.href));
            return (
              <Link 
                key={item.name} 
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                    : "text-secondary-foreground/70 hover:bg-white/5 hover:text-white"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-white/10">
          <Link 
            href="/"
            className="flex items-center justify-center w-full px-4 py-3 rounded-xl text-sm font-semibold text-secondary-foreground/60 hover:text-white hover:bg-white/5 transition-colors"
          >
            View Public Site
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-card border-b flex items-center px-4 sm:px-8 lg:hidden">
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 -ml-2 rounded-lg text-muted-foreground hover:bg-muted"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="ml-2 font-display text-xl font-bold uppercase tracking-wide">Apex Concrete</span>
        </header>

        <main className="flex-1 overflow-auto p-4 sm:p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
