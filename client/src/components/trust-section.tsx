import { Shield, Percent, CalendarCheck, Lock, CreditCard, Building, Headphones } from "lucide-react";

export function TrustSection() {
  return (
    <section className="bg-white border-t border-flightpay-slate-200" data-testid="section-trust">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-flightpay-slate-900 mb-4" data-testid="title-why-choose">
            Why Choose FlightPay?
          </h2>
          <p className="text-flightpay-slate-600 max-w-2xl mx-auto" data-testid="text-trust-subtitle">
            Travel now, pay later with our secure and flexible payment plans. No interest, no hidden fees.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center" data-testid="feature-secure">
            <div className="w-16 h-16 bg-flightpay-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="text-flightpay-secondary text-2xl h-8 w-8" />
            </div>
            <h3 className="font-semibold text-flightpay-slate-900 mb-2">100% Secure</h3>
            <p className="text-flightpay-slate-600 text-sm">
              Your payment information is protected with bank-level security and encryption.
            </p>
          </div>

          <div className="text-center" data-testid="feature-no-interest">
            <div className="w-16 h-16 bg-flightpay-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Percent className="text-flightpay-primary text-2xl h-8 w-8" />
            </div>
            <h3 className="font-semibold text-flightpay-slate-900 mb-2">0% Interest</h3>
            <p className="text-flightpay-slate-600 text-sm">
              No interest charges or hidden fees. Pay exactly what you see with flexible installments.
            </p>
          </div>

          <div className="text-center" data-testid="feature-flexible">
            <div className="w-16 h-16 bg-flightpay-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CalendarCheck className="text-flightpay-accent text-2xl h-8 w-8" />
            </div>
            <h3 className="font-semibold text-flightpay-slate-900 mb-2">Flexible Plans</h3>
            <p className="text-flightpay-slate-600 text-sm">
              Choose payment plans that work for you, from 3 to 6 months with automatic reminders.
            </p>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap justify-center items-center gap-8 mt-12 pt-8 border-t border-flightpay-slate-200" data-testid="section-trust-badges">
          <div className="flex items-center gap-2 text-flightpay-slate-500" data-testid="badge-ssl">
            <Lock className="h-4 w-4" />
            <span className="text-sm">SSL Secured</span>
          </div>
          <div className="flex items-center gap-2 text-flightpay-slate-500" data-testid="badge-pci">
            <CreditCard className="h-4 w-4" />
            <span className="text-sm">PCI Compliant</span>
          </div>
          <div className="flex items-center gap-2 text-flightpay-slate-500" data-testid="badge-iata">
            <Building className="h-4 w-4" />
            <span className="text-sm">IATA Certified</span>
          </div>
          <div className="flex items-center gap-2 text-flightpay-slate-500" data-testid="badge-support">
            <Headphones className="h-4 w-4" />
            <span className="text-sm">24/7 Support</span>
          </div>
        </div>
      </div>
    </section>
  );
}
