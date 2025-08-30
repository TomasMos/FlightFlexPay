import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  Search, 
  CreditCard, 
  Calendar, 
  Plane, 
  Shield, 
  Users, 
  CheckCircle, 
  DollarSign,
  Clock,
  TrendingUp,
  Award,
  Star,
  Lock,
  Zap,
  Heart
} from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';

const steps = [
  {
    number: "01",
    icon: Search,
    title: "Search for Flights",
    description: "Find your perfect flight using our search engine. Compare prices from major airlines and choose the option that works best for you.",
    color: "bg-blue-500"
  },
  {
    number: "02",
    icon: CreditCard,
    title: "Choose Your Payment Plan",
    description: "Select your deposit amount (20-50%) and payment schedule. We'll show you exactly when each payment is due with no hidden fees.",
    color: "bg-green-500"
  },
  {
    number: "03",
    icon: Calendar,
    title: "Pay Over Time",
    description: "Make your deposit to secure the flight, then pay the balance in weekly or bi-weekly installments. All payments complete 2 weeks before departure.",
    color: "bg-purple-500"
  },
  {
    number: "04",
    icon: Plane,
    title: "Enjoy Your Trip",
    description: "Your flight is confirmed and paid for! Receive your tickets and travel documents, then enjoy your well-deserved vacation.",
    color: "bg-orange-500"
  }
];

const benefits = [
  {
    icon: Shield,
    title: "No Credit Checks",
    description: "Our payment plans don't require credit checks or affect your credit score"
  },
  {
    icon: DollarSign,
    title: "No Interest Charges",
    description: "Pay exactly the flight price - no additional interest or hidden fees"
  },
  {
    icon: Lock,
    title: "Price Protection",
    description: "Lock in today's prices even if flight costs increase later"
  },
  {
    icon: Clock,
    title: "Flexible Scheduling",
    description: "Choose weekly or bi-weekly payments that fit your budget"
  }
];

const credibilityStats = [
  {
    icon: Users,
    number: "50,000+",
    label: "Happy Travelers",
    color: "text-blue-600"
  },
  {
    icon: DollarSign,
    number: "£12M+",
    label: "Total Bookings",
    color: "text-green-600"
  },
  {
    icon: Star,
    number: "4.8/5",
    label: "Customer Rating",
    color: "text-yellow-600"
  },
  {
    icon: Award,
    number: "98%",
    label: "Satisfaction Rate",
    color: "text-purple-600"
  }
];

const faqs = [
  {
    question: "How does Splickets' payment plan work?",
    answer: "You pay a deposit of 20-50% when booking your flight, then spread the remaining balance over weekly or bi-weekly installments. All payments must be completed 2 weeks before your departure date. There are no interest charges or hidden fees."
  },
  {
    question: "When do I receive my flight tickets?",
    answer: "Your flight is confirmed immediately after your deposit payment. You'll receive your e-tickets and booking confirmation within 24 hours. Your flight is guaranteed even while you're still making installment payments."
  },
  {
    question: "What happens if I miss a payment?",
    answer: "We'll send you friendly reminders before any payment is due. If you miss a payment, we'll contact you to reschedule. Our goal is to work with you, not against you. We want you to travel!"
  },
  {
    question: "Can I change my payment schedule?",
    answer: "Yes! Contact our customer support team and we'll help adjust your payment plan to better fit your circumstances. We understand that life happens and we're here to help."
  },
  {
    question: "Are there any additional fees?",
    answer: "No hidden fees, ever. You pay exactly the flight price shown at booking. The only additional costs would be standard airline fees (like baggage or seat selection) which are clearly disclosed upfront."
  },
  {
    question: "Is my payment information secure?",
    answer: "Absolutely. We use bank-level encryption and partner with Stripe, a leading payment processor trusted by millions of businesses worldwide. Your financial information is completely protected."
  },
  {
    question: "What airlines do you work with?",
    answer: "We partner with major airlines worldwide including British Airways, Emirates, Air France, Lufthansa, American Airlines, Delta, and many more. You'll have access to the same flights available everywhere else."
  },
  {
    question: "Can I book for multiple passengers?",
    answer: "Yes! You can book for up to 6 passengers on a single payment plan. All passengers will be included in your installment schedule, making group travel more affordable."
  }
];

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Header />
      
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6" data-testid="text-how-it-works-title">
              How Splickets Works
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
              Book your dream flight today, pay gradually over time. No credit checks, 
              no interest charges, just flexible payment plans that work for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Badge variant="outline" className="text-lg px-4 py-2 bg-white">
                <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                No Credit Checks
              </Badge>
              <Badge variant="outline" className="text-lg px-4 py-2 bg-white">
                <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                No Interest Charges
              </Badge>
              <Badge variant="outline" className="text-lg px-4 py-2 bg-white">
                <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                Price Protection
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Process */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Process
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Getting your dream trip has never been easier. Follow these simple steps to book and pay for your flight.
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map((step, index) => (
                <div key={index} className="relative" data-testid={`step-card-${index}`}>
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gray-200 z-0" 
                         style={{ width: 'calc(100% - 2rem)' }} />
                  )}
                  
                  <Card className="relative z-10 text-center p-6 border-2 hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <div className={`w-16 h-16 mx-auto mb-6 rounded-full ${step.color} flex items-center justify-center`}>
                        <step.icon className="w-8 h-8 text-white" />
                      </div>
                      
                      <div className="text-sm font-bold text-gray-400 mb-2">
                        STEP {step.number}
                      </div>
                      
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">
                        {step.title}
                      </h3>
                      
                      <p className="text-gray-600 leading-relaxed">
                        {step.description}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          {/* Benefits Grid */}
          <div className="mt-20">
            <h3 className="text-2xl font-semibold text-gray-900 mb-8 text-center">
              Why Choose Splickets?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="text-center" data-testid={`benefit-${index}`}>
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-50 rounded-full flex items-center justify-center">
                    <benefit.icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    {benefit.title}
                  </h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Credibility Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Trusted by Thousands
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join the growing community of smart travelers who book with confidence using Splickets
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            {credibilityStats.map((stat, index) => (
              <div key={index} className="text-center" data-testid={`stat-${index}`}>
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-white shadow-lg flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="w-8 h-8" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Trust Indicators */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <Shield className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Bank-Level Security</h3>
                <p className="text-gray-600">Your payment information is protected with the same security used by major banks</p>
              </div>
              
              <div>
                <Zap className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Instant Confirmation</h3>
                <p className="text-gray-600">Your flight is confirmed immediately - no waiting or uncertainty</p>
              </div>
              
              <div>
                <Heart className="w-12 h-12 text-red-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Customer Success</h3>
                <p className="text-gray-600">Our dedicated team is here to help you every step of the way</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to know about how Splickets works
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="bg-gray-50 rounded-lg border">
                  <AccordionTrigger 
                    className="px-6 py-4 text-left font-semibold hover:no-underline"
                    data-testid={`faq-trigger-${index}`}
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      {faq.question}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4 text-gray-600 leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          {/* CTA */}
          <div className="text-center mt-12">
            <p className="text-gray-600 mb-6">
              Ready to start your journey?
            </p>
            <Button size="lg" data-testid="button-start-searching">
              Start Searching Flights
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}