import { Plane } from "lucide-react";
import { SiX, SiFacebook, SiInstagram } from "react-icons/si";

export function Footer() {
  return (
    <footer className="bg-splickets-slate-900 text-white" data-testid="footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div data-testid="footer-brand">
            <div className="flex items-center space-x-2 mb-4">
              <Plane className="text-splickets-secondary text-xl h-5 w-5" />
              <span className="font-bold text-lg">Splickets</span>
            </div>
            <p className="text-slate-300 text-sm mb-4">
              Making travel accessible with flexible payment plans. Book now, pay later.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-slate-400 hover:text-white" data-testid="link-twitter">
                <SiX className="h-5 w-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-white" data-testid="link-facebook">
                <SiFacebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-white" data-testid="link-instagram">
                <SiInstagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div data-testid="footer-company">
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li><a href="#" className="hover:text-white" data-testid="link-about">About Us</a></li>
              <li><a href="#" className="hover:text-white" data-testid="link-how-works">How It Works</a></li>
              <li><a href="#" className="hover:text-white" data-testid="link-careers">Careers</a></li>
              <li><a href="#" className="hover:text-white" data-testid="link-press">Press</a></li>
            </ul>
          </div>

          <div data-testid="footer-support">
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li><a href="#" className="hover:text-white" data-testid="link-help">Help Center</a></li>
              <li><a href="#" className="hover:text-white" data-testid="link-contact">Contact Us</a></li>
              <li><a href="#" className="hover:text-white" data-testid="link-payment-plans">Payment Plans</a></li>
              <li><a href="#" className="hover:text-white" data-testid="link-booking-help">Booking Help</a></li>
            </ul>
          </div>

          <div data-testid="footer-legal">
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li><a href="#" className="hover:text-white" data-testid="link-terms">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white" data-testid="link-privacy">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white" data-testid="link-cookies">Cookie Policy</a></li>
              <li><a href="#" className="hover:text-white" data-testid="link-disclaimer">Disclaimer</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-700 mt-8 pt-8 text-center" data-testid="footer-copyright">
          <p className="text-slate-400 text-sm">
            &copy; 2024 Splickets. All rights reserved. | Powered by Amadeus API
          </p>
        </div>
      </div>
    </footer>
  );
}
