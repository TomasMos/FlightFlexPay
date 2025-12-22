import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plane,
  Heart,
  Users,
  Globe,
  Target,
  MapPin,
  Briefcase,
  TrendingUp,
  ArrowRight,
  Building2,
  Shield,
} from "lucide-react";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useEffect } from "react";

import about1 from "../assets/About-1.jpg";
import about2 from "../assets/About-2.jpg";
import about3 from "../assets/About-3.jpg";
import logo from "../../logo.svg";
import frame2 from "../assets/Frame (2).png";
import frame3 from "../assets/Frame (3).png";
import paris from "../assets/paris.avif";
import canada from "../assets/canada.avif";
import newZealand from "../assets/newZealand.avif";
import germany from "../assets/germany.avif";
import london from "../assets/london.avif";
import capeTown from "../assets/capeTown.avif";
import sydney from "../assets/sydney.avif";
import newYork from "../assets/newYork.avif";

const countries = [
  { name: "United Kingdom", flag: london, status: "Live" },
  { name: "Australia", flag: sydney, status: "Live" },
  { name: "South Africa", flag: capeTown, status: "Live" },
  { name: "Canada", flag: canada, status: "Live" },
  { name: "New Zealand", flag: newZealand, status: "Live" },
  { name: "United States", flag: newYork, status: "Coming Soon" },
  { name: "Germany", flag: germany, status: "Coming Soon" },
  { name: "France", flag: paris, status: "Coming Soon" },
];

const values = [
  {
    icon: Heart,
    title: "Customer First",
    description:
      "Every decision is guided by what delivers the best outcome for our travellers",
  },
  {
    icon: Shield,
    title: "Transparency",
    description:
      "Clear pricing, no hidden fees, and full visibility into how payments work",
  },
  {
    icon: Users,
    title: "Accessibility",
    description:
      "Flexible payment options designed to fit real-world financial situations for every traveller",
  },
  {
    icon: Target,
    title: "Innovation",
    description:
      "Continuously improving how people discover, book, and pay for travel",
  },
];

const milestones = [
  {
    year: "2022",
    title: "Founded",
    description:
      "Splickets was born from a simple idea: travel shouldn't be limited by upfront costs",
  },
  {
    year: "2023",
    title: "First Million",
    description:
      "Helped our first million pounds worth of travelers book their dream trips",
  },
  {
    year: "2024",
    title: "Global Expansion",
    description:
      "Launched in 5 countries, serving travelers across multiple continents",
  },
  {
    year: "2025",
    title: "The Future",
    description:
      "Expanding to 8+ countries and launching innovative travel financing products",
  },
];

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const fadeInLeft = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const fadeInRight = {
  hidden: { opacity: 0, x: 30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

// Scroll animation wrapper component
function ScrollAnimation({
  children,
  variant = fadeInUp,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  variant?: any;
  delay?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variant}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Watermark logo component that slides in from the side
function WatermarkLogo({
  sectionRef,
}: {
  sectionRef: React.RefObject<HTMLElement>;
}) {
  const isInView = useInView(sectionRef, {
    once: true,
    margin: "0px",
    amount: 0.1,
  });

  const slideInFromLeft = {
    hidden: { opacity: 0, x: -500, rotate: -15 },
    visible: {
      opacity: 0.35,
      x: 0,
      rotate: -15,
      transition: { duration: 1.2, ease: "easeOut" },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={slideInFromLeft}
      className="absolute top-1/2 right-0 md:right-0 -right-8 md:-right-16 -translate-y-1/2 pointer-events-none z-0"
    >
      <img
        src={logo}
        alt="Splickets Logo"
        className="w-48 h-48 md:w-64 md:h-64 lg:w-96 lg:h-96"
      />
    </motion.div>
  );
}

// Generic watermark component for images
function WatermarkImage({
  src,
  alt,
  rotate = -15,
  opacity = 0.35,
  sectionRef,
}: {
  src: string;
  alt: string;
  rotate?: number;
  opacity?: number;
  sectionRef: React.RefObject<HTMLElement>;
}) {
  const isInView = useInView(sectionRef, {
    once: true,
    margin: "0px",
    amount: 0.1,
  });

  const slideInFromLeft = {
    hidden: { opacity: 0, x: -500, rotate },
    visible: {
      opacity,
      x: 0,
      rotate,
      transition: { duration: 1.2, ease: "easeOut" },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={slideInFromLeft}
      className="absolute top-1/2 right-0 md:right-0 -right-8 md:-right-16 -translate-y-1/2 pointer-events-none z-0"
    >
      <img
        src={src}
        alt={alt}
        className="w-48 h-48 md:w-64 md:h-64 lg:w-96 lg:h-96"
      />
    </motion.div>
  );
}

// Watermark component that slides from right to left (for left-side positioning)
function WatermarkImageLeft({
  src,
  alt,
  rotate = -15,
  opacity = 0.35,
  sectionRef,
}: {
  src: string;
  alt: string;
  rotate?: number;
  opacity?: number;
  sectionRef: React.RefObject<HTMLElement>;
}) {
  const isInView = useInView(sectionRef, {
    once: true,
    margin: "0px",
    amount: 0.1,
  });

  const slideInFromRight = {
    hidden: { opacity: 0, x: 500, rotate },
    visible: {
      opacity,
      x: 0,
      rotate,
      transition: { duration: 1.2, ease: "easeOut" },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={slideInFromRight}
      className="absolute top-1/2 left-0 md:left-0 -left-8 md:-left-16 -translate-y-1/2 pointer-events-none z-0"
    >
      <img
        src={src}
        alt={alt}
        className="w-48 h-48 md:w-64 md:h-64 lg:w-96 lg:h-96"
      />
    </motion.div>
  );
}

export default function About() {
  const storySectionRef = useRef<HTMLElement>(null);
  const globalSectionRef = useRef<HTMLElement>(null);
  const visionSectionRef = useRef<HTMLElement>(null);

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1
              className="text-5xl md:text-6xl font-bold text-gray-900 mb-6"
              data-testid="text-about-title"
            >
              Making Travel More Accessible
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
              Splickets is a flight booking platform that lets travellers spread
              the cost of flights over time, without debt, credit cards, or
              hidden fees.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Badge variant="outline" className="text-lg px-4 py-2">
                <Globe className="w-5 h-5 mr-2" />
                Live in 5 Countries
              </Badge>
              <Badge variant="outline" className="text-lg px-4 py-2">
                <Users className="w-5 h-5 mr-2" />
                50,000+ Destinations
              </Badge>
              <Badge variant="outline" className="text-lg px-4 py-2">
                <Heart className="w-5 h-5 mr-2" />
                $300 Average Savings
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* The Splickets Story */}
      <section
        ref={storySectionRef}
        className="py-16 bg-white relative overflow-hidden"
      >
        <WatermarkLogo sectionRef={storySectionRef} />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            <ScrollAnimation variant={fadeInUp}>
              <div className="text-left md:text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  The Splickets Story
                </h2>
                <p className="text-xl text-gray-600">
                  Solving a real problem in global travel
                </p>
              </div>
            </ScrollAnimation>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
              <ScrollAnimation variant={fadeInLeft} delay={0.2}>
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-6">
                    Designed for Real-World Travel
                  </h3>
                  <div className="space-y-4 text-gray-600 leading-relaxed">
                    <p>
                      International travel often requires large upfront
                      payments, making flights inaccessible for many travellers
                      — even when they can comfortably afford the trip over
                      time.
                    </p>
                    <p>
                      Splickets was created to address this gap. Our platform
                      allows travellers to secure their flights and pay in
                      manageable instalments before departure.
                    </p>
                    <p>
                      There is no interest, no revolving credit, and no
                      long-term debt — just a simple, transparent way to plan
                      and pay for travel with confidence.
                    </p>
                  </div>
                </div>
              </ScrollAnimation>
              <ScrollAnimation variant={fadeInRight} delay={0.3}>
                <div className="relative">
                  <div
                    className="aspect-square bg-cover bg-no-repeat bg-center rounded-2xl"
                    style={{ backgroundImage: `url(${about1})` }}
                  ></div>
                </div>
              </ScrollAnimation>
            </div>

            {/* Mission & Values */}
            <div className="mb-16">
              <ScrollAnimation variant={fadeInUp}>
                <div className="text-left md:text-center mb-12">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                    Our Mission & Values
                  </h3>
                  <p className="text-lg text-gray-600 max-w-2xl md:mx-auto">
                    Our mission is to make international travel more accessible
                    by removing the burden of upfront flight costs, while
                    maintaining transparency, simplicity, and trust.
                  </p>
                </div>
              </ScrollAnimation>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {values.map((value, index) => (
                  <ScrollAnimation
                    key={index}
                    variant={scaleIn}
                    delay={index * 0.1}
                  >
                    <Card
                      className="p-6 border-2 hover:shadow-lg transition-shadow"
                      data-testid={`value-card-${index}`}
                    >
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                            <value.icon className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900 mb-2">
                              {value.title}
                            </h4>
                            <p className="text-gray-600 leading-relaxed">
                              {value.description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </ScrollAnimation>
                ))}
              </div>
            </div>

            {/* Timeline */}
            {/* <div className="mb-16">
              <div className="text-center mb-12">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  Our Journey
                </h3>
                <p className="text-lg text-gray-600">
                  From startup to global platform
                </p>
              </div>

              <div className="space-y-8">
                {milestones.map((milestone, index) => (
                  <div key={index} className="flex items-start gap-6" data-testid={`milestone-${index}`}>
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {milestone.year.slice(-2)}
                      </div>
                    </div>
                    <div className="pt-2">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">
                        {milestone.year} - {milestone.title}
                      </h4>
                      <p className="text-gray-600 leading-relaxed">
                        {milestone.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div> */}
          </div>
        </div>
      </section>

      {/* Global Presence */}
      <section
        ref={globalSectionRef}
        className="py-16 bg-gray-50 relative overflow-hidden"
      >
        <WatermarkImage
          src={frame2}
          alt="Travel icon"
          rotate={15}
          opacity={0.35}
          sectionRef={globalSectionRef}
        />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
              <ScrollAnimation variant={fadeInLeft} delay={0.2}>
                <div className="relative">
                  <div
                    className="aspect-square bg-cover bg-no-repeat bg-center rounded-2xl"
                    style={{ backgroundImage: `url(${about2})` }}
                  ></div>
                </div>
              </ScrollAnimation>
              <ScrollAnimation variant={fadeInRight} delay={0.3}>
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                    A World of Possibilities for Splicketeers
                  </h2>
                  <div className="space-y-4 text-gray-600 leading-relaxed text-lg">
                    <p>
                      We're already helping Splicketeers across five countries
                      unlock the travel experiences they've always dreamed of.
                      Whether it's reuniting with family across continents,
                      exploring new cultures, or simply taking that trip you've
                      been putting off — we're here to make it happen.
                    </p>
                    <p>
                      Our presence in the United Kingdom, Australia, South
                      Africa, Canada, and New Zealand means more Splicketeers
                      can book flights in their local currency, with payment
                      plans that fit their lives.
                    </p>
                  </div>
                </div>
              </ScrollAnimation>
            </div>

            {/* Countries Grid */}
          </div>
        </div>
      </section>

      {/* Vision for the Future */}
      <section
        ref={visionSectionRef}
        className="py-16 bg-white relative overflow-hidden"
      >
        <WatermarkImageLeft
          src={frame3}
          alt="Travel icon"
          rotate={-15}
          opacity={0.35}
          sectionRef={visionSectionRef}
        />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <ScrollAnimation variant={fadeInLeft} delay={0.2}>
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                    Living the Life You've Always Wanted
                  </h2>
                  <div className="space-y-6 text-gray-600 leading-relaxed">
                    <p className="text-lg">
                      At Splickets, we believe travel shouldn't be a luxury
                      reserved for those who can pay everything upfront. We want
                      every Splicketeer to live the life they've always wanted —
                      filled with adventures, connections, and experiences that
                      shape who you are.
                    </p>
                    <p className="text-lg">
                      That's why we're expanding to new countries, bringing our
                      flexible payment solutions to even more travelers. Soon,
                      Splicketeers in the United States, Germany, and France
                      will be able to book their dream trips and pay over time,
                      just like travelers in our current markets.
                    </p>
                    <p className="text-lg">
                      Our vision is simple: remove the financial barriers that
                      stand between you and the experiences that matter most.
                      Whether that's visiting family, exploring new
                      destinations, or finally taking that bucket-list trip —
                      we're here to help you make it happen, on your terms.
                    </p>
                  </div>
                </div>
              </ScrollAnimation>

              <ScrollAnimation variant={fadeInRight} delay={0.3}>
                <div className="relative">
                  <div
                    className="aspect-square bg-cover bg-no-repeat bg-center rounded-2xl"
                    style={{ backgroundImage: `url(${about3})` }}
                  ></div>
                </div>
              </ScrollAnimation>
            </div>
          </div>
        </div>
      </section>

      {/* Join Our Team */}
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <ScrollAnimation variant={fadeInUp}>
              <div className="mb-8">
                <Building2 className="w-16 h-16 mx-auto mb-6 text-blue-200" />
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Join the Splickets Team
                </h2>
                <p className="text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
                  Be part of revolutionizing travel. We're looking for
                  passionate individuals who want to make travel accessible to
                  everyone.
                </p>
              </div>
            </ScrollAnimation>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <ScrollAnimation variant={scaleIn} delay={0.1}>
                <div className="text-center">
                  <TrendingUp className="w-12 h-12 mx-auto mb-4 text-blue-200" />
                  <h3 className="text-lg font-semibold mb-2">Fast Growth</h3>
                  <p className="text-blue-100">
                    Join a rapidly scaling company with unlimited potential
                  </p>
                </div>
              </ScrollAnimation>

              <ScrollAnimation variant={scaleIn} delay={0.2}>
                <div className="text-center">
                  <Heart className="w-12 h-12 mx-auto mb-4 text-blue-200" />
                  <h3 className="text-lg font-semibold mb-2">
                    Meaningful Impact
                  </h3>
                  <p className="text-blue-100">
                    Your work directly helps people achieve their travel dreams
                  </p>
                </div>
              </ScrollAnimation>

              <ScrollAnimation variant={scaleIn} delay={0.3}>
                <div className="text-center">
                  <Users className="w-12 h-12 mx-auto mb-4 text-blue-200" />
                  <h3 className="text-lg font-semibold mb-2">Amazing Team</h3>
                  <p className="text-blue-100">
                    Work with talented, passionate people from around the world
                  </p>
                </div>
              </ScrollAnimation>
            </div>

            <div className="space-y-4 text-center">
              <p className="text-lg text-blue-100">
                We're hiring across engineering, product, marketing, and
                customer success.
              </p>
              <div className="flex justify-center">
                <Button
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-8 py-3"
                  data-testid="button-explore-roles"
                  asChild
                >
                  <a
                    href="https://www.notion.so/Join-Our-Team-at-Splickets-28fc8bbc8fbf81a6bd56f35acb900eb1?source=copy_link"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Briefcase className="w-5 h-5 mr-2" />
                    Explore Open Roles
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </a>
                </Button>
              </div>
              <p className="text-sm text-blue-200">
                Or send us your CV at careers@splickets.app
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
