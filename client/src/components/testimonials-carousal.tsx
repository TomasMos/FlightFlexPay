import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

type Testimonial = {
  id: string | number;
  name: string;
  location: string;
  route: string;
  savings: string;
  rating: number;
  quote: string;
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

  // Auto rotate every 6s
  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Heading */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            What Our Customers Say
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Real feedback from travelers who've used Splickets to make their dream trips possible
          </p>
        </div>

        {/* Carousel */}
        <div className="relative max-w-5xl  mx-auto ">
          <div className="overflow-hidden border-0 rounded-2xl shadow-2xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="bg-white border-0 rounded-2xl">
                  <CardContent className="p-8 sm:p-12">
                    <div className="text-center">
                      {/* Rating */}
                      <div className="flex justify-center items-center mb-6">
                        {Array.from({ length: testimonials[current].rating }).map((_, i) => (
                          <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>

                      {/* Quote */}
                      <blockquote className="text-lg sm:text-xl text-gray-700 mb-8 italic leading-relaxed">
                        “{testimonials[current].quote}”
                      </blockquote>

                      {/* Person */}
                      <div className="space-y-3">
                        <div className="font-bold text-xl text-gray-900">
                          {testimonials[current].name}
                        </div>
                        <div className="text-gray-600 text-lg">
                          {testimonials[current].location}
                        </div>
                        <div className="flex flex-wrap justify-center gap-3">
                          <Badge variant="outline" className="text-blue-600 border-blue-600 px-4 py-2">
                            {testimonials[current].route}
                          </Badge>
                          <Badge variant="outline" className="text-green-600 border-green-600 px-4 py-2">
                            Saved {testimonials[current].savings}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Arrows (desktop only) */}
          <Button
            variant="ghost"
            size="icon"
            className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 bg-splickets-slate-100 shadow-xl  w-12 h-12"
            onClick={prev}
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 bg-splickets-slate-100 shadow-xl w-12 h-12"
            onClick={next}
          >
            <ChevronRight className="w-6 h-6" />
          </Button>

          {/* Dots */}
          <div className="flex justify-center mt-8 space-x-3">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrent(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === current ? "bg-primary scale-125" : "bg-gray-300 hover:bg-gray-400"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialCarousel;
