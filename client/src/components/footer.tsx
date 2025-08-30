import { Plane, TicketsPlane } from "lucide-react";
import { SiX, SiFacebook, SiInstagram } from "react-icons/si";
import { Link } from "wouter";

export function Footer() {
  return (
          <footer className="lg:fixed bottom-0 left-0 w-full bg-gradient-to-br from-orange-500 to-orange-600 text-white z-[-1]" data-testid="footer">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 text-center lg:text-left">
          {/* Brand Section */}
          <div className="md:col-span-2" data-testid="footer-brand">
            <div className="flex items-center justify-center md:justify-start space-x-3 mb-6">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center ">
                <TicketsPlane className="text-orange-500 h-8 w-8 stroke-2" />
              </div>
              <div>
                <span className="font-bold text-2xl">Splickets</span>
                <p className="text-orange-100 text-sm">Fly now, pay later</p>
              </div>
            </div>
            <p className="text-orange-100 text-sm mb-6 leading-relaxed">
              Making travel accessible with flexible payment plans. Lock in today's prices, 
              pay over time with no credit checks or hidden fees.
            </p>
            <div className="flex space-x-4 justify-center md:justify-start ">
              <a href="#" className="text-orange-200 hover:text-white transition-colors" data-testid="link-twitter">
                <SiX className="h-6 w-6" />
              </a>
              <a href="#" className="text-orange-200 hover:text-white transition-colors" data-testid="link-facebook">
                <SiFacebook className="h-6 w-6" />
              </a>
              <a href="#" className="text-orange-200 hover:text-white transition-colors" data-testid="link-instagram">
                <SiInstagram className="h-6 w-6" />
              </a>
            </div>
          </div>

          {/* Company Links */}
          <div data-testid="footer-company" >
            <h4 className="font-bold mb-4 text-lg">Company</h4>
            <ul className="space-y-3 text-sm text-orange-100">
              <li>
                <Link href="/about" className="hover:text-white transition-colors" data-testid="link-about">About Us</Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-white transition-colors" data-testid="link-how-works">How It Works</Link>
              </li>
              <li>
                <Link href="/testimonials" className="hover:text-white transition-colors" data-testid="link-testimonials">Testimonials</Link>
              </li>
              <li>
                <Link href="/referral-program" className="hover:text-white transition-colors" data-testid="link-referrals">Referral Program</Link>
              </li>
            </ul>
          </div>

          {/* Support Links */}
          <div data-testid="footer-support">
            <h4 className="font-bold mb-4 text-lg">Support</h4>
            <ul className="space-y-3 text-sm text-orange-100">
              <li>
                <Link href="/contact" className="hover:text-white transition-colors" data-testid="link-contact">Contact Us</Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-white transition-colors" data-testid="link-help">Help Center</Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-white transition-colors" data-testid="link-payment-plans">Payment Plans</Link>
              </li>
              <li>
                <Link href="/profile" className="hover:text-white transition-colors" data-testid="link-my-bookings">My Bookings</Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div data-testid="footer-legal">
            <h4 className="font-bold mb-4 text-lg">Legal</h4>
            <ul className="space-y-3 text-sm text-orange-100">
              <li><a href="#" className="hover:text-white transition-colors" data-testid="link-terms">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors" data-testid="link-privacy">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors" data-testid="link-cookies">Cookie Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors" data-testid="link-disclaimer">Disclaimer</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-orange-400 mt-10 pt-8" data-testid="footer-copyright">
          <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left">
            <div className="mb-4 md:mb-0">
              <p className="text-orange-100 text-sm">
                &copy; 2024 <strong>Splickets</strong>. All rights reserved.
              </p>
              <p className="text-orange-200 text-xs mt-1">
                Powered by Amadeus API | Secure payments by Stripe
              </p>
            </div>
            <div className="flex items-center space-x-4 text-orange-200 text-xs">
              <span>🇬🇧 United Kingdom</span>
              <span>🇦🇺 Australia</span>
              <span>🇿🇦 South Africa</span>
              <span>🇨🇦 Canada</span>
              <span>🇳🇿 New Zealand</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
