import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ChevronLeft, ChevronRight, Star, Shield, Calendar, CreditCard, Heart, CheckCircle, Play, ArrowRight } from 'lucide-react';
import { Navbar } from '@/components/navbar';
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

const destinations = [
  {
    name: "Paris, France",
    image: "🗼",
    description: "City of Love and Lights"
  },
  {
    name: "Tokyo, Japan",
    image: "🏯",
    description: "Modern meets Traditional"
  },
  {
    name: "New York, USA",
    image: "🗽",
    description: "The City That Never Sleeps"
  },
  {
    name: "Sydney, Australia",
    image: "🏙️",
    description: "Harbor City Beauty"
  },
  {
    name: "London, England",
    image: "🏰",
    description: "Royal History and Culture"
  },
  {
    name: "Dubai, UAE",
    image: "🏜️",
    description: "Luxury in the Desert"
  }
];

const whyChooseReasons = [
  {
    icon: Shield,
    title: "Lock in Today's Prices",
    description: "Secure current flight prices and pay later with our flexible installment plans. No price increases, guaranteed.",
    color: "text-blue-600",
    bgColor: "bg-blue-50"
  },
  {
    icon: Calendar,
    title: "Flexible Payment Terms",
    description: "Choose from weekly or bi-weekly payment schedules that work with your budget and lifestyle.",
    color: "text-green-600",
    bgColor: "bg-green-50"
  },
  {
    icon: CreditCard,
    title: "No Debt or Credit Checks",
    description: "No credit score requirements, no debt accumulation, and no hidden fees. Just transparent payment plans.",
    color: "text-purple-600",
    bgColor: "bg-purple-50"
  },
  {
    icon: Heart,
    title: "Customer-First Support",
    description: "Our dedicated team is here to help you every step of the way, from booking to boarding.",
    color: "text-red-600",
    bgColor: "bg-red-50"
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
  }
];

export default function TestimonialsRevamped() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [currentDestination, setCurrentDestination] = useState(0);

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const nextDestination = () => {
    setCurrentDestination((prev) => (prev + 1) % destinations.length);
  };

  const prevDestination = () => {
    setCurrentDestination((prev) => (prev - 1 + destinations.length) % destinations.length);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6" data-testid="text-testimonials-title">
              Real Stories from Real Travelers
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
              Discover how Splickets has helped thousands of travelers book their dream trips with flexible payment plans
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Badge variant="outline" className="text-lg px-4 py-2 bg-white">
                <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                50,000+ Happy Travelers
              </Badge>
              <Badge variant="outline" className="text-lg px-4 py-2 bg-white">
                <CheckCircle className="w-5 h-5 mr-2 text-blue-600" />
                £12M+ in Bookings
              </Badge>
              <Badge variant="outline" className="text-lg px-4 py-2 bg-white">
                <CheckCircle className="w-5 h-5 mr-2 text-purple-600" />
                98% Satisfaction
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Splickets */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Splickets?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We're revolutionizing travel by making flights accessible to everyone with transparent, flexible payment solutions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {whyChooseReasons.map((reason, index) => (
              <Card key={index} className="p-8 border-2 hover:shadow-xl transition-all duration-300 group" data-testid={`why-choose-card-${index}`}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-6">
                    <div className={`w-16 h-16 rounded-2xl ${reason.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <reason.icon className={`w-8 h-8 ${reason.color}`} />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">
                        {reason.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {reason.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Stats Section */}
          <div className="mt-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-12 text-white">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold mb-2">50,000+</div>
                <div className="text-blue-100">Happy Travelers</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">£12M+</div>
                <div className="text-blue-100">Total Savings</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">98%</div>
                <div className="text-blue-100">Customer Satisfaction</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">150+</div>
                <div className="text-blue-100">Destinations</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Customers Say
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Real feedback from travelers who've used Splickets to make their dream trips possible
            </p>
          </div>

          {/* Testimonial Carousel */}
          <div className="relative max-w-5xl mx-auto">
            <Card className="bg-white shadow-2xl border-0" data-testid={`testimonial-card-${testimonials[currentTestimonial].id}`}>
              <CardContent className="p-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  {/* Content */}
                  <div>
                    <div className="flex items-center mb-6">
                      {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                        <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    
                    <blockquote className="text-xl text-gray-700 mb-8 italic leading-relaxed">
                      "{testimonials[currentTestimonial].quote}"
                    </blockquote>
                    
                    <div className="space-y-3">
                      <div className="font-bold text-xl text-gray-900">
                        {testimonials[currentTestimonial].name}
                      </div>
                      <div className="text-gray-600 text-lg">
                        {testimonials[currentTestimonial].location}
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant="outline" className="text-blue-600 border-blue-600 px-4 py-2">
                          {testimonials[currentTestimonial].route}
                        </Badge>
                        <Badge variant="outline" className="text-green-600 border-green-600 px-4 py-2">
                          Saved {testimonials[currentTestimonial].savings}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Video/Image Placeholder */}
                  <div className="relative">
                    <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center shadow-lg">
                      {testimonials[currentTestimonial].hasVideo ? (
                        <div className="text-center">
                          <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mb-4 mx-auto shadow-lg hover:scale-105 transition-transform">
                            <Play className="w-10 h-10 text-white ml-1" />
                          </div>
                          <p className="text-gray-600 font-medium">Watch {testimonials[currentTestimonial].name}'s story</p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Heart className="w-20 h-20 text-gray-400 mb-4 mx-auto" />
                          <p className="text-gray-600 font-medium">Customer Photo</p>
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
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white shadow-xl border-2 w-12 h-12"
              onClick={prevTestimonial}
              data-testid="button-prev-testimonial"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white shadow-xl border-2 w-12 h-12"
              onClick={nextTestimonial}
              data-testid="button-next-testimonial"
            >
              <ChevronRight className="w-6 h-6" />
            </Button>

            {/* Carousel Indicators */}
            <div className="flex justify-center mt-8 space-x-3">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  className={`w-4 h-4 rounded-full transition-all duration-300 ${
                    index === currentTestimonial ? 'bg-blue-600 scale-125' : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  onClick={() => setCurrentTestimonial(index)}
                  data-testid={`button-testimonial-indicator-${index}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Dream Destinations Carousel */}
      <section className="py-20 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Dream Destinations Await
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Explore the world's most beautiful destinations with Splickets' flexible payment plans
            </p>
          </div>

          {/* Destination Carousel */}
          <div className="relative max-w-4xl mx-auto">
            <Card className="bg-white shadow-2xl border-0 overflow-hidden">
              <CardContent className="p-0">
                <div className="relative h-96 bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="text-8xl mb-4">
                      {destinations[currentDestination].image}
                    </div>
                    <h3 className="text-3xl font-bold mb-2">
                      {destinations[currentDestination].name}
                    </h3>
                    <p className="text-xl text-blue-100">
                      {destinations[currentDestination].description}
                    </p>
                  </div>
                </div>
                <div className="p-8 text-center">
                  <p className="text-gray-600 mb-6">
                    Book your flight to {destinations[currentDestination].name} today and pay over time
                  </p>
                  <Button size="lg" data-testid="button-book-destination">
                    Book Flight to {destinations[currentDestination].name.split(',')[0]}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Destination Navigation */}
            <Button
              variant="outline"
              size="icon"
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white shadow-xl border-2 w-12 h-12"
              onClick={prevDestination}
              data-testid="button-prev-destination"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white shadow-xl border-2 w-12 h-12"
              onClick={nextDestination}
              data-testid="button-next-destination"
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          </div>

          {/* Destination Grid */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mt-12 max-w-4xl mx-auto">
            {destinations.map((dest, index) => (
              <button
                key={index}
                className={`p-4 rounded-lg text-center transition-all duration-300 ${
                  index === currentDestination 
                    ? 'bg-white shadow-lg scale-105 border-2 border-blue-600' 
                    : 'bg-white/70 hover:bg-white hover:shadow-md'
                }`}
                onClick={() => setCurrentDestination(index)}
                data-testid={`destination-${index}`}
              >
                <div className="text-2xl mb-1">{dest.image}</div>
                <div className="text-xs font-medium text-gray-700">{dest.name.split(',')[0]}</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
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
                <AccordionItem key={index} value={`item-${index}`} className="bg-gray-50 rounded-xl border-2">
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
          <div className="text-center mt-16">
            <p className="text-lg text-gray-600 mb-6">
              Ready to start your next adventure?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" data-testid="button-start-booking">
                Start Booking
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button variant="outline" size="lg" data-testid="button-contact-support">
                Contact Support
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}