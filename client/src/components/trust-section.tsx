import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Calendar, 
  CreditCard, 
  Heart, 
  Star, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle,
  Lock,
  Building,
  Headphones,
  ArrowRight
} from "lucide-react";

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

const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    location: "London, UK",
    route: "London → Sydney",
    quote: "Splickets made my dream trip to Australia possible! The flexible payment plan meant I could book early and secure great prices.",
    savings: "£450",
    rating: 5
  },
  {
    id: 2,
    name: "Michael Chen",
    location: "Toronto, Canada",
    route: "Toronto → Tokyo",
    quote: "I was amazed by how simple the booking process was. Paying 30% upfront and spreading the rest over 3 months made it so manageable.",
    savings: "£280",
    rating: 5
  },
  {
    id: 3,
    name: "Emma Rodriguez",
    location: "Madrid, Spain",
    route: "Madrid → New York",
    quote: "The customer service was exceptional. When my travel dates changed, they helped me adjust my payment plan without any hassle.",
    savings: "€320",
    rating: 5
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

export function TrustSection() {
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
    <>
      {/* Why Choose Splickets */}
      <section className="py-20 bg-white" data-testid="section-trust">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4" data-testid="title-why-choose">
              Why Choose Splickets?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto" data-testid="text-trust-subtitle">
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

          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center items-center gap-8 mt-16 pt-8 border-t border-gray-200" data-testid="section-trust-badges">
            <div className="flex items-center gap-3 text-gray-600" data-testid="badge-ssl">
              <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center">
                <Lock className="h-5 w-5 text-green-600" />
              </div>
              <span className="font-medium">SSL Secured</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600" data-testid="badge-pci">
              <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-blue-600" />
              </div>
              <span className="font-medium">PCI Compliant</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600" data-testid="badge-iata">
              <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center">
                <Building className="h-5 w-5 text-purple-600" />
              </div>
              <span className="font-medium">IATA Certified</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600" data-testid="badge-support">
              <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center">
                <Headphones className="h-5 w-5 text-orange-600" />
              </div>
              <span className="font-medium">24/7 Support</span>
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
          <div className="relative max-w-4xl mx-auto">
            <Card className="bg-white shadow-2xl border-0" data-testid={`testimonial-card-${testimonials[currentTestimonial].id}`}>
              <CardContent className="p-12">
                <div className="text-center">
                  <div className="flex justify-center items-center mb-6">
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
                    <div className="flex justify-center items-center gap-4">
                      <Badge variant="outline" className="text-blue-600 border-blue-600 px-4 py-2">
                        {testimonials[currentTestimonial].route}
                      </Badge>
                      <Badge variant="outline" className="text-green-600 border-green-600 px-4 py-2">
                        Saved {testimonials[currentTestimonial].savings}
                      </Badge>
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
                <div className="relative h-80 bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center">
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
    </>
  );
}
