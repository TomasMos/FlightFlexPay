import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ChevronLeft, ChevronRight, Star, Shield, Calendar, CreditCard, Heart, CheckCircle, Play } from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';

const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    location: "London, UK",
    route: "London → Sydney",
    quote: "Splickets made my dream trip to Australia possible! The flexible payment plan meant I could book early and secure great prices without breaking the bank.",
    savings: "£450",
    rating: 5,
    hasVideo: true
  },
  {
    id: 2,
    name: "Michael Chen",
    location: "Toronto, Canada",
    route: "Toronto → Tokyo",
    quote: "I was amazed by how simple the booking process was. Paying 30% upfront and spreading the rest over 3 months made the £1,200 flight so much more manageable.",
    savings: "£280",
    rating: 5,
    hasVideo: false
  },
  {
    id: 3,
    name: "Emma Rodriguez",
    location: "Madrid, Spain",
    route: "Madrid → New York",
    quote: "The customer service was exceptional. When my travel dates changed, they helped me adjust my payment plan without any hassle. Highly recommend!",
    savings: "€320",
    rating: 5,
    hasVideo: true
  },
  {
    id: 4,
    name: "David Kim",
    location: "Seoul, South Korea",
    route: "Seoul → Los Angeles",
    quote: "Booking with Splickets was a game-changer. I locked in prices during a sale and paid gradually. No credit checks, no stress!",
    savings: "₩380,000",
    rating: 5,
    hasVideo: false
  }
];

const benefits = [
  {
    icon: Shield,
    title: "Lock in Prices",
    description: "Secure today's flight prices and pay later with flexible installments",
    color: "text-blue-600"
  },
  {
    icon: Calendar,
    title: "Flexible Payment Terms",
    description: "Choose from weekly or bi-weekly payment plans that work for your budget",
    color: "text-green-600"
  },
  {
    icon: CreditCard,
    title: "No Debt or Credit",
    description: "No credit checks, no interest charges, just transparent payment plans",
    color: "text-purple-600"
  }
];

const faqs = [
  {
    question: "How does the payment plan work?",
    answer: "You pay a deposit of 20-50% when booking, then spread the remaining amount over weekly or bi-weekly installments until 2 weeks before departure. No interest or hidden fees."
  },
  {
    question: "Do you check my credit score?",
    answer: "No, we don't perform credit checks. Our payment plans are designed to be accessible to everyone, regardless of credit history."
  },
  {
    question: "What happens if I miss a payment?",
    answer: "We'll send you friendly reminders and work with you to reschedule payments. Our goal is to help you travel, not create financial stress."
  },
  {
    question: "Can I change my payment schedule?",
    answer: "Yes! Contact our support team and we'll help adjust your payment plan to better fit your circumstances."
  },
  {
    question: "Are the flight prices guaranteed?",
    answer: "Absolutely! Once you book with your deposit, your flight price is locked in - even if prices increase later."
  },
  {
    question: "What airlines do you work with?",
    answer: "We partner with major airlines worldwide including British Airways, Emirates, Air France, Lufthansa, and many more to offer you the best routes and prices."
  },
  {
    question: "How far in advance can I book?",
    answer: "You can book flights up to 11 months in advance, giving you plenty of time to plan and pay gradually."
  },
  {
    question: "Is my payment information secure?",
    answer: "Yes, we use industry-standard encryption and partner with Stripe for secure payment processing. Your financial information is completely protected."
  }
];

export default function Testimonials() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />      
      {/* Hero Section with Testimonial Carousel */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4" data-testid="text-testimonials-title">
              Real Stories from Real Travelers
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover how Splickets has helped thousands of travelers book their dream trips with flexible payment plans
            </p>
          </div>

          {/* Testimonial Carousel */}
          <div className="relative max-w-4xl mx-auto">
            <Card className="bg-white shadow-xl" data-testid={`testimonial-card-${testimonials[currentTestimonial].id}`}>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                  {/* Content */}
                  <div>
                    <div className="flex items-center mb-4">
                      {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    
                    <blockquote className="text-lg text-gray-700 mb-6 italic">
                      "{testimonials[currentTestimonial].quote}"
                    </blockquote>
                    
                    <div className="space-y-2">
                      <div className="font-semibold text-gray-900">
                        {testimonials[currentTestimonial].name}
                      </div>
                      <div className="text-gray-600">
                        {testimonials[currentTestimonial].location}
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant="outline" className="text-blue-600 border-blue-600">
                          {testimonials[currentTestimonial].route}
                        </Badge>
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          Saved {testimonials[currentTestimonial].savings}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Video/Image Placeholder */}
                  <div className="relative">
                    <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                      {testimonials[currentTestimonial].hasVideo ? (
                        <div className="text-center">
                          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                            <Play className="w-8 h-8 text-white ml-1" />
                          </div>
                          <p className="text-gray-600">Watch {testimonials[currentTestimonial].name}'s story</p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Heart className="w-16 h-16 text-gray-400 mb-4 mx-auto" />
                          <p className="text-gray-600">Customer Photo</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Carousel Navigation */}
            <Button
              variant="outline"
              size="icon"
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white shadow-lg"
              onClick={prevTestimonial}
              data-testid="button-prev-testimonial"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white shadow-lg"
              onClick={nextTestimonial}
              data-testid="button-next-testimonial"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>

            {/* Carousel Indicators */}
            <div className="flex justify-center mt-6 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentTestimonial ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                  onClick={() => setCurrentTestimonial(index)}
                  data-testid={`button-testimonial-indicator-${index}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trustpilot Section */}
      <section className="py-16 bg-green-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Trusted by Thousands of Travelers
          </h2>
          
          <div className="max-w-2xl mx-auto">
            <div className="bg-white p-8 rounded-lg shadow-lg border border-green-200">
              <div className="flex items-center justify-center mb-4">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-6 h-6 fill-green-500 text-green-500" />
                  ))}
                </div>
                <span className="ml-2 text-2xl font-bold text-gray-900">4.8</span>
              </div>
              
              <p className="text-gray-600 mb-6">
                Based on 2,847 reviews on Trustpilot
              </p>
              
              <div className="bg-gray-100 p-6 rounded-lg">
                <p className="text-gray-600 mb-4">
                  Trustpilot integration coming soon. We'll display our verified customer reviews here.
                </p>
                <Button variant="outline" disabled data-testid="button-trustpilot-placeholder">
                  View Trustpilot Reviews
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Customers Love Splickets */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Customers Love Splickets
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We're revolutionizing travel by making flights accessible to everyone
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {benefits.map((benefit, index) => (
              <Card key={index} className="text-center p-6 border-2 hover:shadow-lg transition-shadow" data-testid={`benefit-card-${index}`}>
                <CardContent className="pt-6">
                  <div className={`w-16 h-16 mx-auto mb-6 rounded-full bg-gray-50 flex items-center justify-center ${benefit.color}`}>
                    <benefit.icon className="w-8 h-8" />
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    {benefit.title}
                  </h3>
                  
                  <p className="text-gray-600 leading-relaxed">
                    {benefit.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Stats Section */}
          <div className="mt-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold mb-2">50,000+</div>
                <div className="text-blue-100">Happy Travelers</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">£12M+</div>
                <div className="text-blue-100">Total Savings</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">98%</div>
                <div className="text-blue-100">Customer Satisfaction</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">150+</div>
                <div className="text-blue-100">Destinations</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to know about booking with Splickets
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="bg-white rounded-lg border">
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
              Still have questions? Our support team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" data-testid="button-contact-support">
                Contact Support
              </Button>
              <Button variant="outline" size="lg" data-testid="button-start-booking">
                Start Booking
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}