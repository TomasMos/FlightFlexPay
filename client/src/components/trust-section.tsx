import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSwipeable } from "react-swipeable";
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
import TestimonialCarousel from '@/components/testimonials-carousal';

import paris from '../assets/paris.avif'
import tokyo from '../assets/tokyo.avif'
import london from '../assets/london.avif'
import capeTown from '../assets/capeTown.avif'
import sydney from '../assets/sydney.avif'
import newYork from '../assets/newYork.avif'

const testimonials = [
  {
    id: 1,
    name: "Marzanne Dijkstra",
    location: "London, England",
    route: "LHR → CPT",
    savings: "£320",
    rating: 5,
    quote: "Splickets is easy, reliable, and saves money - it's a no brainer!",
  },
  {
    id: 2,
    name: "Alex des Tombe",
    location: "Durban, South Africa",
    route: "DBN → CPT",
    savings: "R875",
    rating: 5,
    quote: "I didn’t think installment payments for flights were possible. Huge help!",
  },
  {
    id: 3,
    name: "Sarah Williams",
    location: "New York, USA",
    route: "NYC → BJS",
    savings: "$560",
    rating: 5,
    quote: "Super smooth process. I’ll be using this again for my next holiday.",
  },
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

const destinations = [
  {
    name: "Paris, France",
    image: paris,
    description: "City of Love and Lights"
  },
  {
    name: "Tokyo, Japan",
    image: tokyo, 
    description: "Modern meets Traditional"
  },
  {
    name: "New York, USA",
    image: newYork,
    description: "The City That Never Sleeps"
  },
  {
    name: "Sydney, Australia", 
    image: sydney,
    description: "Harbor City Beauty"
  },
  {
    name: "London, England",
    image: london,
    description: "Royal History and Culture"
  },
  {
    name: "Cape Town, South Africa",
    image: capeTown,
    description: "Timeout's 2025 Best City"
  }
];

export function TrustSection() {
  const [current, setCurrent] = useState(0);

  const prev = () =>
    setCurrent((current - 1 + destinations.length) % destinations.length);
  const next = () => setCurrent((current + 1) % destinations.length);

  useEffect(() => {
    destinations.forEach(dest => {
      const img = new Image();
      img.src = dest.image; // preload each background image
    });
  }, []);

  const handlers = useSwipeable({
    onSwipedLeft: next,
    onSwipedRight: prev,
    preventScrollOnSwipe: true,
    trackMouse: true, // allows drag with mouse too
  });

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
            {/* <div className="flex items-center gap-3 text-gray-600" data-testid="badge-iata">
              <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center">
                <Building className="h-5 w-5 text-purple-600" />
              </div>
              <span className="font-medium">IATA Certified</span>
            </div> */}
            <div className="flex items-center gap-3 text-gray-600" data-testid="badge-support">
              <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center">
                <Headphones className="h-5 w-5 text-orange-600" />
              </div>
              <span className="font-medium">24/7 Support</span>
            </div>
          </div>
        </div>
      </section>

      <TestimonialCarousel testimonials={testimonials} />


      {/* Dream Destinations Carousel */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          {/* Heading */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Dream Destinations Await
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Explore the world's most beautiful destinations with Splickets' flexible payment plans
            </p>
          </div>

          {/* Destination Carousel */}
          <div
            {...handlers} // 👈 swipe handlers applied here
            className="relative max-w-5xl  mx-auto touch-pan-y"
          >
            <Card className="bg-white shadow-2xl border-0 overflow-hidden">
              <CardContent className="p-0">
                {/* Top section with background image */}
                <div
                  className="relative h-[700px] flex items-center justify-center bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${destinations[current].image})`,
                  }}
                >
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 " />

                  {/* Text content */}
                  <div className="relative text-center text-white px-6 backdrop-blur-md rounded-3xl p-4">
                    <h3 className="text-3xl font-bold mb-2 drop-shadow-md">
                      {destinations[current].name}
                    </h3>
                    <p className="text-xl text-blue-100 drop-shadow-md">
                      {destinations[current].description}
                    </p>
                  </div>
                </div>

                {/* Bottom section */}
                <div className="p-8 text-center">
                  <p className="text-gray-600 mb-6">
                    Book your flight to {destinations[current].name} today and pay over time
                  </p>
                  <Button   onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
 size="lg" data-testid="button-book-destination"   className="w-72 justify-between">
                    Book Flight to {destinations[current].name.split(",")[0]}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>


            {/* Navigation Buttons */}
            <Button
              variant="outline"
              size="icon"
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white shadow-xl border-2 w-12 h-12"
              onClick={prev}
              data-testid="button-prev-destination"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white shadow-xl border-2 w-12 h-12"
              onClick={next}
              data-testid="button-next-destination"
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </section>

    </>
  );
}
