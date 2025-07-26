import { Plane, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-flightpay-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <Plane className="text-flightpay-primary text-2xl" data-testid="logo-icon" />
            <span className="font-bold text-xl text-flightpay-slate-900" data-testid="brand-name">Splickets</span>
            <span className="bg-flightpay-secondary text-white text-xs px-2 py-1 rounded-full" data-testid="brand-tagline">
              Pay Later
            </span>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-flightpay-slate-600 hover:text-flightpay-primary transition-colors" data-testid="link-howto">
              How it works
            </a>
            <a href="#" className="text-flightpay-slate-600 hover:text-flightpay-primary transition-colors" data-testid="link-support">
              Support
            </a>
            <Button className="bg-flightpay-primary text-white hover:bg-blue-700" data-testid="button-signin">
              Sign In
            </Button>
          </nav>
          <button className="md:hidden" data-testid="button-mobile-menu">
            <svg className="w-6 h-6 text-flightpay-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
