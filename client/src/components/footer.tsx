import { Plane, TicketsPlane, MapPin } from "lucide-react";
import { SiInstagram } from "react-icons/si";
import { Link } from "wouter";

export function Footer() {
  return (
          <footer className="lg:fixed bottom-0 left-0 w-full bg-gradient-to-b from-primary to-accent text-white z-[-1]" data-testid="footer">
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
                <p className="text-orange-100 text-sm">Book Now, Pay Later</p>
              </div>
            </div>

            <p className="text-orange-100 text-sm mb-6 leading-relaxed">
              For booking emergencies, use the contact details within the profile section or the chat widget in the bottom right. For non-urgent enquiries, send us an email at <a href="mailto:support@splickets.app" className="underline hover:text-white transition-colors">support@splickets.app</a>.
            </p>
          </div>

          {/* Company Links */}
          <div data-testid="footer-company" >
            <h4 className="font-bold mb-4 text-lg">Company</h4>
            <ul className="space-y-3 text-sm text-orange-100">
              <li>
                <Link href="/about" onClick={() => window.scrollTo(0, 0)} className="hover:text-white transition-colors" data-testid="link-about">About Us</Link>
              </li>
              <li>
                <a href="https://www.notion.so/Join-Our-Team-at-Splickets-28fc8bbc8fbf81a6bd56f35acb900eb1?source=copy_link" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" data-testid="link-careers">Careers</a>
              </li>
              <li>
                <Link href="/about" onClick={() => window.scrollTo(0, 0)} className="hover:text-white transition-colors" data-testid="link-testimonials">Testimonials</Link>
              </li>
              <li>
                <Link href="/referral-program" onClick={() => window.scrollTo(0, 0)} className="hover:text-white transition-colors" data-testid="link-referrals">Referral Program</Link>
              </li>
            </ul>
          </div>

          {/* Support Links */}
          <div data-testid="footer-support">
            <h4 className="font-bold mb-4 text-lg">Support</h4>
            <ul className="space-y-3 text-sm text-orange-100">
              <li>
                <Link href="/contact" onClick={() => window.scrollTo(0, 0)} className="hover:text-white transition-colors" data-testid="link-contact">Contact Us</Link>
              </li>
              <li>
                <Link href="/profile?tab=account" onClick={() => window.scrollTo(0, 0)} className="hover:text-white transition-colors" data-testid="link-help">Help Center</Link>
              </li>
              <li>
                <Link href="/profile?tab=bookings" onClick={() => window.scrollTo(0, 0)} className="hover:text-white transition-colors" data-testid="link-payment-plans">Payment Plans</Link>
              </li>
              <li>
                <Link href="/profile?tab=bookings" onClick={() => window.scrollTo(0, 0)} className="hover:text-white transition-colors" data-testid="link-my-bookings">My Bookings</Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div data-testid="footer-legal">
            <h4 className="font-bold mb-4 text-lg">Legal</h4>
            <ul className="space-y-3 text-sm text-orange-100">
              <li>
                <Link href="/terms-of-service" onClick={() => window.scrollTo(0, 0)} className="hover:text-white transition-colors" data-testid="link-terms">Terms of Service</Link>
              </li>
              <li>
                <Link href="/privacy-policy" onClick={() => window.scrollTo(0, 0)} className="hover:text-white transition-colors" data-testid="link-privacy">Privacy Policy</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Location and Instagram */}
        <div className="flex flex-col md:flex-row items-center md:items-center justify-center md:justify-between gap-4 md:gap-0 mt-8 pt-8 border-t border-orange-400 text-orange-100 text-xs">
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span>7 Bell Yard, London, W2CA 2JR</span>
          </div>
          <div className="flex items-center space-x-2">
            <p className="text-orange-100 text-xs">Follow us on Instagram</p>
            <a href="https://www.instagram.com/splickets/" target="_blank" rel="noopener noreferrer" className="text-orange-200 hover:text-white transition-colors" data-testid="link-instagram">
              <SiInstagram className="h-6 w-6" />
            </a>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-orange-400 mt-10 pt-8" data-testid="footer-copyright">
          <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left">
            <div className="mb-4 md:mb-0">
              <p className="text-orange-100 text-sm">
                &copy; 2025 <strong>Splickets</strong>. All rights reserved.
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
