import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plane, 
  Heart, 
  Users, 
  Globe, 
  Target, 
  MapPin, 
  Briefcase, 
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Building2,
  Rocket,
  Shield
} from 'lucide-react';

const countries = [
  { name: "United Kingdom", flag: "🇬🇧", status: "Live" },
  { name: "Australia", flag: "🇦🇺", status: "Live" },
  { name: "South Africa", flag: "🇿🇦", status: "Live" },
  { name: "Canada", flag: "🇨🇦", status: "Live" },
  { name: "New Zealand", flag: "🇳🇿", status: "Live" },
  { name: "United States", flag: "🇺🇸", status: "Coming Soon" },
  { name: "Germany", flag: "🇩🇪", status: "Coming Soon" },
  { name: "France", flag: "🇫🇷", status: "Coming Soon" }
];

const values = [
  {
    icon: Heart,
    title: "Customer First",
    description: "Every decision we make starts with how it impacts our travelers"
  },
  {
    icon: Shield,
    title: "Transparency",
    description: "No hidden fees, no surprises - just honest, upfront pricing"
  },
  {
    icon: Users,
    title: "Accessibility",
    description: "Making travel accessible to everyone, regardless of financial situation"
  },
  {
    icon: Target,
    title: "Innovation",
    description: "Continuously improving how people book and pay for travel"
  }
];

const milestones = [
  {
    year: "2022",
    title: "Founded",
    description: "Splickets was born from a simple idea: travel shouldn't be limited by upfront costs"
  },
  {
    year: "2023",
    title: "First Million",
    description: "Helped our first million pounds worth of travelers book their dream trips"
  },
  {
    year: "2024",
    title: "Global Expansion",
    description: "Launched in 5 countries, serving travelers across multiple continents"
  },
  {
    year: "2025",
    title: "The Future",
    description: "Expanding to 8+ countries and launching innovative travel financing products"
  }
];

export default function About() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6" data-testid="text-about-title">
              Making Travel Dreams Reality
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
              We believe everyone deserves to explore the world. That's why we created Splickets - 
              to break down financial barriers and make travel accessible to all.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Badge variant="outline" className="text-lg px-4 py-2">
                <Globe className="w-5 h-5 mr-2" />
                Live in 5 Countries
              </Badge>
              <Badge variant="outline" className="text-lg px-4 py-2">
                <Users className="w-5 h-5 mr-2" />
                50,000+ Happy Travelers
              </Badge>
              <Badge variant="outline" className="text-lg px-4 py-2">
                <Heart className="w-5 h-5 mr-2" />
                £12M+ in Bookings
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* The Splickets Story */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                The Splickets Story
              </h2>
              <p className="text-xl text-gray-600">
                Born from personal experience, built for global impact
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-6">
                  It Started with a Problem
                </h3>
                <div className="space-y-4 text-gray-600 leading-relaxed">
                  <p>
                    Like many travelers, our founders faced a common dilemma: finding amazing flight deals 
                    but not having the full amount upfront. Traditional travel booking required paying 
                    thousands immediately, while credit cards meant accumulating debt with high interest rates.
                  </p>
                  <p>
                    We realized there had to be a better way. What if you could secure today's prices 
                    but pay gradually, without the stress of debt or credit checks?
                  </p>
                  <p>
                    That's how Splickets was born - from a personal need that we discovered millions 
                    of other travelers shared.
                  </p>
                </div>
              </div>
              <div className="relative">
                <div className="aspect-square bg-gradient-to-br from-blue-100 to-indigo-200 rounded-2xl flex items-center justify-center">
                  <div className="text-center">
                    <Plane className="w-24 h-24 text-blue-600 mx-auto mb-4" />
                    <p className="text-blue-800 font-medium">The spark of an idea</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Mission & Values */}
            <div className="mb-16">
              <div className="text-center mb-12">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  Our Mission & Values
                </h3>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  We're not just a travel booking platform - we're on a mission to democratize travel 
                  and make the world more accessible to everyone.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {values.map((value, index) => (
                  <Card key={index} className="p-6 border-2 hover:shadow-lg transition-shadow" data-testid={`value-card-${index}`}>
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
                ))}
              </div>
            </div>

            {/* Timeline */}
            <div className="mb-16">
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
            </div>
          </div>
        </div>
      </section>

      {/* Global Presence & Future Plans */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Global Presence & Future Plans
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                We're already helping travelers across 5 countries, with ambitious plans to expand our reach
              </p>
            </div>

            {/* Current Presence */}
            <div className="mb-16">
              <h3 className="text-2xl font-semibold text-gray-900 mb-8 text-center">
                Where We Are Today
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                {countries.map((country, index) => (
                  <Card key={index} className={`text-center p-4 ${country.status === 'Live' ? 'border-green-200 bg-green-50' : 'border-gray-200'}`} data-testid={`country-card-${index}`}>
                    <CardContent className="pt-4">
                      <div className="text-3xl mb-2">{country.flag}</div>
                      <div className="text-sm font-medium text-gray-900 mb-1">
                        {country.name}
                      </div>
                      <Badge 
                        variant={country.status === 'Live' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {country.status}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Future Vision */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-6">
                  Our Vision for the Future
                </h3>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Global Expansion</h4>
                      <p className="text-gray-600">
                        Launching in the United States, Germany, and France by 2025, 
                        bringing our flexible payment solutions to even more travelers.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Product Innovation</h4>
                      <p className="text-gray-600">
                        Developing new travel financing products including hotels, 
                        car rentals, and complete vacation packages.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Technology Leadership</h4>
                      <p className="text-gray-600">
                        Building the most advanced travel payment platform with AI-powered 
                        personalization and seamless user experiences.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <div className="aspect-square bg-gradient-to-br from-purple-100 to-blue-200 rounded-2xl flex items-center justify-center">
                  <div className="text-center">
                    <Rocket className="w-24 h-24 text-purple-600 mx-auto mb-4" />
                    <p className="text-purple-800 font-medium">The future is bright</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Join Our Team */}
      <section className="py-16 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-8">
              <Building2 className="w-16 h-16 mx-auto mb-6 text-blue-200" />
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Join the Splickets Team
              </h2>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
                Be part of revolutionizing travel. We're looking for passionate individuals 
                who want to make travel accessible to everyone.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="text-center">
                <TrendingUp className="w-12 h-12 mx-auto mb-4 text-blue-200" />
                <h3 className="text-lg font-semibold mb-2">Fast Growth</h3>
                <p className="text-blue-100">
                  Join a rapidly scaling company with unlimited potential
                </p>
              </div>
              
              <div className="text-center">
                <Heart className="w-12 h-12 mx-auto mb-4 text-blue-200" />
                <h3 className="text-lg font-semibold mb-2">Meaningful Impact</h3>
                <p className="text-blue-100">
                  Your work directly helps people achieve their travel dreams
                </p>
              </div>
              
              <div className="text-center">
                <Users className="w-12 h-12 mx-auto mb-4 text-blue-200" />
                <h3 className="text-lg font-semibold mb-2">Amazing Team</h3>
                <p className="text-blue-100">
                  Work with talented, passionate people from around the world
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-lg text-blue-100">
                We're hiring across engineering, product, marketing, and customer success.
              </p>
              <Button 
                size="lg" 
                className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-8 py-3"
                data-testid="button-explore-roles"
              >
                <Briefcase className="w-5 h-5 mr-2" />
                Explore Open Roles
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <p className="text-sm text-blue-200">
                Or send us your CV at careers@splickets.com
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}