import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSwipeable } from "react-swipeable";
import { 
  ChevronLeft, 
  ChevronRight, 
  Lock,
  CreditCard,
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
import lockInPricesVideo from '../assets/Booked.mp4'
import flexiblePaymentsVideo from '../assets/Installments2.mp4'
import payInFullVideo from '../assets/Takeoff.mp4'

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
    quote: "I didn’t think instalment payments for flights were possible. Huge help!",
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

const videoFeatures = [
  {
    title: "Lock in Today's Prices",
    description: "Secure current flight prices and pay later with our flexible instalment plans. No price increases, guaranteed.",
    video: lockInPricesVideo
  },
  {
    title: "Flexible Payment Plans",
    description: "Choose from weekly or bi-weekly payment schedules that work with your budget and lifestyle.",
    video: flexiblePaymentsVideo
  },
  {
    title: "Fly with Lay-by",
    description: "Complete your payments before your departure date. No surprises, just peace of mind.",
    video: payInFullVideo
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
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const prev = () =>
    setCurrent((current - 1 + destinations.length) % destinations.length);
  const next = () => setCurrent((current + 1) % destinations.length);

  useEffect(() => {
    destinations.forEach(dest => {
      const img = new Image();
      img.src = dest.image; // preload each background image
    });
  }, []);

  // Handle video autoplay for iOS
  useEffect(() => {
    const playVideos = async () => {
      for (const video of videoRefs.current) {
        if (video) {
          try {
            await video.play();
          } catch (error) {
            // Autoplay was prevented, which is fine - user interaction will be needed
            console.log('Video autoplay prevented:', error);
          }
        }
      }
    };

    // Try to play videos after a short delay to ensure they're loaded
    const timer = setTimeout(playVideos, 100);

    // Also set up Intersection Observer to play videos when they're visible
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.target instanceof HTMLVideoElement) {
            entry.target.play().catch(() => {
              // Ignore play errors
            });
          }
        });
      },
      { threshold: 0.5 }
    );

    videoRefs.current.forEach((video) => {
      if (video) {
        observer.observe(video);
      }
    });

    return () => {
      clearTimeout(timer);
      videoRefs.current.forEach((video) => {
        if (video) {
          observer.unobserve(video);
        }
      });
    };
  }, []);

  const handlers = useSwipeable({
    onSwipedLeft: next,
    onSwipedRight: prev,
    preventScrollOnSwipe: true,
    trackMouse: true, // allows drag with mouse too
  });

  const airlineLogos = [
    { name: 'Qatar Airways', logo: '/airline-logos/qatar.png' },
    { name: 'Airlink', logo: '/airline-logos/Airlink.png' },
    { name: 'Lufthansa', logo: '/airline-logos/Lufthansa.png' },
    { name: 'FlySafair', logo: '/airline-logos/FlySafair.avif' },
    { name: 'SAA', logo: '/airline-logos/SAA.png' },
    { name: 'Emirates', logo: '/airline-logos/Emirates_logo.png' }, 
    { name: 'KLM', logo: '/airline-logos/KLM.png' },
    { name: 'United Airlines', logo: '/airline-logos/United.jpg' },
    { name: 'Virgin Atlantic', logo: '/airline-logos/Virgin.png' },
    { name: 'CemAir', logo: '/airline-logos/CemAir.png' },
    { name: 'Delta', logo: '/airline-logos/Delta.png' },
    { name: 'Etihad Airways', logo: '/airline-logos/Etihad.png' },
  ];

  // Calculate animation duration for constant speed
  // Each logo container: 200px width + 64px margin (mx-8) = 264px
  // Target speed: 50px per second
  // Duration = (number of logos * 264px) / 50px/s
  const logoWidth = 264; // 200px + 64px margin
  const speedPxPerSecond = 50;
  const animationDuration = (airlineLogos.length * logoWidth) / speedPxPerSecond;

  return (
    <>
      {/* Airline Logos Carousel */}
      <section className="py-12 bg-white border-b border-gray-200 w-full">
        <div className="w-full overflow-hidden">
          <div 
            className="flex animate-scroll"
            style={{ '--scroll-duration': `${animationDuration}s` } as React.CSSProperties}
          >
              {/* First set of logos */}
              {airlineLogos.map((airline, index) => (
                <div
                  key={`first-${index}`}
                  className="flex-shrink-0 mx-8 flex items-center justify-center"
                  style={{ width: '200px' }}
                >
                  <img
                    src={airline.logo}
                    alt={airline.name}
                    className="h-16 w-auto object-contain opacity-70 hover:opacity-100 transition-opacity"
                  />
                </div>
              ))}
              {/* Duplicate set for seamless loop */}
              {airlineLogos.map((airline, index) => (
                <div
                  key={`second-${index}`}
                  className="flex-shrink-0 mx-8 flex items-center justify-center"
                  style={{ width: '200px' }}
                >
                  <img
                    src={airline.logo}
                    alt={airline.name}
                    className="h-16 w-auto object-contain opacity-70 hover:opacity-100 transition-opacity"
                  />
                </div>
              ))}
            </div>
          </div>
      </section>

      {/* Video Features Section */}
      <section className="py-20 bg-white" data-testid="section-trust">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4" data-testid="title-main">
              Leave upfront costs behind
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto" data-testid="text-subtitle">
              Find flights for you (or your whole crew) and secure them with a small deposit.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-12 lg:gap-8 max-w-7xl mx-auto">
            {videoFeatures.map((feature, index) => (
              <div 
                key={index} 
                className="flex-1 flex flex-col items-center text-center group"
                data-testid={`video-feature-${index}`}
              >
                <div className="w-full max-w-lg mb-8 r">
                  <video 
                    ref={(el) => {
                      videoRefs.current[index] = el;
                    }}
                    autoPlay 
                    loop 
                    muted 
                    playsInline
                    preload="auto"
                    className="w-full h-auto object-cover"
                  >
                    <source src={feature.video} type="video/mp4" />
                  </video>
                </div>
                
                <h3 className="text-xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-lg">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center items-center gap-8 mt-16 pt-20 border-t border-gray-200" data-testid="section-trust-badges">
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
