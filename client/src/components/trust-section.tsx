import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Lock,
  CreditCard,
  Headphones, 
  ArrowRight,
  MapPin
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
    photo: "https://i.pravatar.cc/150?img=1",
  },
  {
    id: 2,
    name: "Alex des Tombe",
    location: "Durban, South Africa",
    route: "DBN → CPT",
    savings: "R875",
    rating: 5,
    quote: "I didn't think instalment payments for flights were possible. Huge help!",
    photo: "https://i.pravatar.cc/150?img=12",
  },
  {
    id: 3,
    name: "Sarah Williams",
    location: "New York, USA",
    route: "NYC → BJS",
    savings: "$560",
    rating: 5,
    quote: "Super smooth process. I'll be using this again for my next holiday.",
    photo: "https://i.pravatar.cc/150?img=5",
  },
  {
    id: 4,
    name: "Michael Chen",
    location: "Sydney, Australia",
    route: "SYD → LHR",
    savings: "A$890",
    rating: 5,
    quote: "Finally, a way to travel without breaking the bank upfront. Game changer!",
    photo: "https://i.pravatar.cc/150?img=33",
  },
];

const videoFeatures = [
  {
    title: ["Lock in Today's", "Prices"],
    description: "Secure current flight prices with a small deposit. No price increases, guaranteed.",
    video: lockInPricesVideo
  },
  {
    title: ["Flexible Payment", "Plans"],
    description: "Choose from weekly or bi-weekly payment schedules that work with your budget and lifestyle.",
    video: flexiblePaymentsVideo
  },
  {
    title: ["Fly with", "Lay-By"],
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
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Position carousel between New York and Sydney on mobile load
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || window.innerWidth >= 768) return;

    // Wait for layout to calculate proper scroll position
    const timer = setTimeout(() => {
      // New York is index 2, Sydney is index 3
      // We want to position between them - calculate based on card width and gap
      const viewportWidth = window.innerWidth;
      const cardWidth = viewportWidth * 0.85; // 85vw
      const gap = 24; // gap-6 = 1.5rem = 24px
      const cardWithGap = cardWidth + gap;
      
      // Position to show Sydney centered (index 3)
      // Sydney starts at: 3 * cardWithGap
      // To center it: scroll to Sydney's start - half viewport + half card
      const sydneyStart = 3 * cardWithGap;
      const scrollPosition = sydneyStart - (viewportWidth / 2) + (cardWidth / 2);
      
      container.scrollLeft = Math.max(0, scrollPosition);
    }, 150);
    
    return () => clearTimeout(timer);
  }, []);

  // Handle video autoplay for iOS - use Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.target instanceof HTMLVideoElement) {
            const video = entry.target;
            // Ensure video is ready and play it
            if (video.readyState >= 2) {
              video.play().catch((error) => {
                // Silently handle play errors (autoplay may be blocked)
                console.log('Video autoplay prevented:', error);
              });
            } else {
              // Wait for video to be ready
              video.addEventListener('loadeddata', () => {
                video.play().catch(() => {
                  // Ignore play errors
                });
              }, { once: true });
            }
          } else if (entry.target instanceof HTMLVideoElement) {
            // Pause when out of view to save resources
            entry.target.pause();
          }
        });
      },
      { 
        threshold: 0.5, // Play when 50% visible
        rootMargin: '0px'
      }
    );

    // Observe all video elements
    videoRefs.current.forEach((video) => {
      if (video) {
        observer.observe(video);
      }
    });

    // Also try to play videos after initial load (for non-iOS or after user interaction)
    const attemptPlay = async () => {
      for (const video of videoRefs.current) {
        if (video && video.readyState >= 2) {
          try {
            await video.play();
          } catch (error) {
            // Autoplay was prevented, Intersection Observer will handle it
          }
        }
      }
    };

    // Try after a short delay to ensure videos are loaded
    const timer = setTimeout(attemptPlay, 500);

    // Enable autoplay after first user interaction (required for iOS)
    const enableAutoplay = async () => {
      await attemptPlay();
      // Remove listeners after first interaction
      document.removeEventListener('touchstart', enableAutoplay);
      document.removeEventListener('click', enableAutoplay);
    };

    // Listen for first user interaction to enable autoplay on iOS
    document.addEventListener('touchstart', enableAutoplay, { once: true, passive: true });
    document.addEventListener('click', enableAutoplay, { once: true, passive: true });

    return () => {
      clearTimeout(timer);
      document.removeEventListener('touchstart', enableAutoplay);
      document.removeEventListener('click', enableAutoplay);
      videoRefs.current.forEach((video) => {
        if (video) {
          observer.unobserve(video);
        }
      });
    };
  }, []);

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
                    className="h-16 w-auto object-contain"
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
                    className="h-16 w-auto object-contain"
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
              Leave Upfront Costs Behind
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
                  {Array.isArray(feature.title) ? (
                    <>
                      {feature.title[0]}
                      <span className="lg:hidden"> </span>
                      <br className="hidden lg:block" />
                      {feature.title[1]}
                    </>
                  ) : (
                    feature.title
                  )}
                </h3>
                <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-lg">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

         
          {/* <div className="flex flex-wrap justify-center items-center gap-8 mt-16 pt-20 border-t border-gray-200" data-testid="section-trust-badges">
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
          </div> */}
        </div>
      </section>

      <TestimonialCarousel testimonials={testimonials} />


      {/* Dream Destinations Grid */}
      <section className="py-20 bg-gradient-to-b from-white via-gray-50 to-white">
        <div className="container mx-auto px-4">
          {/* Heading */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Explore Dream Destinations
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover the world's most beautiful places. Book now and pay over time with flexible plans.
            </p>
          </div>

          {/* Destinations Grid - Horizontal scroll on mobile, grid on desktop */}
          <div 
            ref={scrollContainerRef}
            className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto overflow-x-auto md:overflow-x-visible scrollbar-hide pb-4 md:pb-0"
            style={{
              scrollBehavior: 'smooth',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {/* Destinations */}
            {destinations.map((destination, index) => (
              <Card
                key={`${destination.name}-${index}`}
                className="group relative overflow-hidden rounded-2xl border-0 shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer bg-white flex-shrink-0 w-[85vw] md:w-auto"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              >
                <div className="relative h-[400px] overflow-hidden">
                  {/* Image */}
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                    style={{
                      backgroundImage: `url(${destination.image})`,
                    }}
                  >
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />
                    
                    {/* Content */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-5 h-5 text-white/90" />
                        <span className="text-sm font-medium text-white/90 uppercase tracking-wide">
                          {destination.name.split(',')[1]?.trim() || destination.name.split(',')[0]}
                        </span>
                      </div>
                      <h3 className="text-2xl md:text-3xl font-bold mb-2 leading-tight">
                        {destination.name.split(',')[0]}
                      </h3>
                      <p className="text-white/90 text-base font-medium">
                        {destination.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Bar */}
                <div className="p-5 bg-white border-t border-gray-100">
                  <Button
                    variant="ghost"
                    className="w-full justify-between group-hover:bg-gray-50 transition-colors duration-300"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  >
                    <span className="font-semibold text-gray-900">Book Flight</span>
                    <ArrowRight className="w-5 h-5 text-gray-600 group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

    </>
  );
}
