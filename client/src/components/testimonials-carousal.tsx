import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import TrustpilotStar from "@/assets/Trustpilot.svg";

type Testimonial = {
  id: string | number;
  name: string;
  location: string;
  route: string;
  savings: string;
  rating: number;
  quote: string;
  photo?: string;
};

interface TestimonialCarouselProps {
  testimonials: Testimonial[];
}

const TestimonialCarousel: React.FC<TestimonialCarouselProps> = ({ testimonials }) => {
  const [current, setCurrent] = useState(0);

  const prev = () =>
    setCurrent((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  const next = () =>
    setCurrent((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));

  // Auto rotate every 5s
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
    }, 7000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <section className="py-20 bg-white" data-testid="section-testimonials">
      <div className="container mx-auto px-4">
        {/* Heading */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4" data-testid="title-testimonials">
            What Our Customers Say
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto" data-testid="text-subtitle-testimonials">
            Real feedback from travelers who've used Splickets to make their dream trips possible
          </p>
        </div>

        {/* Carousel */}
        <div className="relative max-w-4xl mx-auto">
          <div className="overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <div className="bg-white rounded-2xl p-8 md:p-12 text-center">
                  {/* Customer Photo */}
                  <div className="flex justify-center mb-8">
                    <Avatar className="w-50 h-60 md:w-36 md:h-36 border-4 border-gray-100">
                      <AvatarImage 
                        src={testimonials[current].photo} 
                        alt={testimonials[current].name}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-primary text-white text-2xl md:text-3xl font-semibold">
                        {getInitials(testimonials[current].name)}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  {/* Rating */}
                  <div className="flex justify-center items-center mb-6 gap-1">
                    {Array.from({ length: testimonials[current].rating }).map((_, i) => (
                      <img 
                        key={i} 
                        src={TrustpilotStar} 
                        alt="Trustpilot star" 
                        className="w-8 h-8 md:w-10 md:h-10"
                      />
                    ))}
                  </div>

                  {/* Quote */}
                  <blockquote className="text-xl md:text-2xl text-gray-900 mb-8 leading-relaxed font-medium max-w-3xl mx-auto">
                    "{testimonials[current].quote}"
                  </blockquote>

                  {/* Customer Info */}
                  <div className="space-y-2">
                    <div className="font-bold text-lg text-gray-900">
                      {testimonials[current].name}
                    </div>
                    <div className="text-gray-600 text-base mb-4">
                      {testimonials[current].location}
                    </div>
                    <div className="flex flex-wrap justify-center gap-4 text-sm">
                      <div className="text-gray-700">
                        <span className="font-semibold">Route:</span> {testimonials[current].route}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Dots */}
          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrent(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  index === current 
                    ? "bg-primary w-8 scale-100" 
                    : "bg-gray-300 hover:bg-gray-400"
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialCarousel;
