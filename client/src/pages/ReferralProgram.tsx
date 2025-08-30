import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Link } from "wouter";
import {
  Gift,
  Users,
  DollarSign,
  Share,
  CheckCircle,
  Copy,
  UserPlus,
  Plane,
  ArrowRight,
  Heart,
  Star,
  Zap,
  Target,
} from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Share,
    title: "Share Your Link",
    description:
      "Get your unique referral link from your Splickets profile and share it with friends and family who love to travel.",
    color: "bg-blue-500",
  },
  {
    number: "02",
    icon: UserPlus,
    title: "Friend Books Flight",
    description:
      "When someone uses your link to make their first booking with Splickets, they'll save money and you'll earn rewards.",
    color: "bg-green-500",
  },
  {
    number: "03",
    icon: Gift,
    title: "Both Get $25",
    description:
      "You both receive $25 credit! Your friend gets $25 off their first booking, and you get $25 credit for future trips.",
    color: "bg-purple-500",
  },
];

const benefits = [
  {
    icon: DollarSign,
    title: "$25 for Both",
    description:
      "You and your friend both receive $25 - it's a win-win situation",
  },
  {
    icon: Users,
    title: "Unlimited Referrals",
    description:
      "No limit on how many friends you can refer or how much you can earn",
  },
  {
    icon: Zap,
    title: "Instant Credit",
    description:
      "Credits are applied immediately after your friend completes their booking",
  },
  {
    icon: Heart,
    title: "Help Friends Save",
    description:
      "Give your friends access to flexible payment plans and great flight deals",
  },
];

const faqs = [
  {
    question: "How much do we both get when someone uses my referral?",
    answer:
      "Both you and your friend receive $25! Your friend gets $25 off their first Splickets booking, and you receive $25 in credit that can be used for future bookings.",
  },
  {
    question: "Is there a limit to how many people I can refer?",
    answer:
      "No! You can refer as many friends as you'd like. There's no cap on the number of referrals or the total amount you can earn through the program.",
  },
  {
    question: "When do I receive my referral credit?",
    answer:
      "You'll receive your $25 credit immediately after your friend completes their first booking and payment with Splickets. The credit will appear in your account within 24 hours.",
  },
  {
    question: "How do I share my referral link?",
    answer:
      "You can find your unique referral link in your Splickets profile under the 'Referrals' section. Share it via email, text, social media, or any way you prefer!",
  },
  {
    question: "Can my friend use the referral credit with a payment plan?",
    answer:
      "Absolutely! The $25 credit can be applied to any booking, including those with payment plans. It will reduce the total amount owed and lower their installment payments.",
  },
  {
    question: "Does my friend need to be a new customer?",
    answer:
      "Yes, the referral program is designed for new customers who haven't previously booked with Splickets. This helps us grow our community of happy travelers!",
  },
  {
    question: "How can I track my referrals and earnings?",
    answer:
      "Your Splickets profile includes a referral dashboard where you can see how many people have used your link, successful bookings, and your total earnings.",
  },
  {
    question: "Do referral credits expire?",
    answer:
      "No, your referral credits never expire! Use them whenever you're ready to book your next adventure with Splickets.",
  },
  {
    question: "Can I refer someone who lives in a different country?",
    answer:
      "Yes! As long as Splickets operates in their country, your referral link will work. We currently serve customers in the UK, Australia, South Africa, Canada, and New Zealand.",
  },
];

export default function ReferralProgram() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block bg-green-100 rounded-full p-4 mb-6">
              <Gift className="w-16 h-16 text-green-600" />
            </div>

            <h1
              className="text-5xl md:text-6xl font-bold text-gray-900 mb-6"
              data-testid="text-referral-title"
            >
              Share the Love, Earn Together
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
              Refer friends to Splickets and you both get $25! Help your friends
              discover flexible flight payments while earning credits for your
              own future trips.
            </p>

            <div className="bg-white rounded-2xl p-8 shadow-xl border-4 border-green-200 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="text-center">
                  <div className="text-6xl font-bold text-green-600 mb-2">
                    $25
                  </div>
                  <div className="text-lg text-gray-600">For You</div>
                  <div className="text-sm text-gray-500">
                    Credit for future bookings
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-6xl font-bold text-blue-600 mb-2">
                    $25
                  </div>
                  <div className="text-lg text-gray-600">For Your Friend</div>
                  <div className="text-sm text-gray-500">
                    Off their first booking
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Badge variant="outline" className="text-lg px-4 py-2 bg-white">
                <Users className="w-5 h-5 mr-2 text-green-600" />
                Unlimited Referrals
              </Badge>
              <Badge variant="outline" className="text-lg px-4 py-2 bg-white">
                <Zap className="w-5 h-5 mr-2 text-blue-600" />
                Instant Credits
              </Badge>
              <Badge variant="outline" className="text-lg px-4 py-2 bg-white">
                <Heart className="w-5 h-5 mr-2 text-red-600" />
                Everyone Wins
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How the Referral Program Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Three simple steps to start earning and helping your friends save
              on travel
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className="relative"
                  data-testid={`referral-step-${index}`}
                >
                  {index < steps.length - 1 && (
                    <div
                      className="hidden md:block absolute top-16 left-full w-full h-0.5 bg-gray-200 z-0"
                      style={{ width: "calc(100% - 2rem)" }}
                    />
                  )}

                  <Card className="relative z-10 text-center p-6 border-2 hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <div
                        className={`w-16 h-16 mx-auto mb-6 rounded-full ${step.color} flex items-center justify-center`}
                      >
                        <step.icon className="w-8 h-8 text-white" />
                      </div>

                      <div className="text-sm font-bold text-gray-400 mb-2">
                        STEP {step.number}
                      </div>

                      <h3 className="text-xl font-semibold text-gray-900 mb-4">
                        {step.title}
                      </h3>

                      <p className="text-gray-600 leading-relaxed">
                        {step.description}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          {/* Benefits */}
          <div className="mt-20">
            <h3 className="text-2xl font-semibold text-gray-900 mb-8 text-center">
              Program Benefits
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="text-center"
                  data-testid={`referral-benefit-${index}`}
                >
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-50 rounded-full flex items-center justify-center">
                    <benefit.icon className="w-8 h-8 text-green-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    {benefit.title}
                  </h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Sample Referral Link */}
          <div className="mt-16 bg-gray-50 rounded-2xl p-8">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Your Referral Link Will Look Like This:
              </h3>
              <p className="text-gray-600">
                Share this unique link to start earning rewards
              </p>
            </div>

            <div className="bg-white rounded-lg p-4 border-2 border-dashed border-gray-300 max-w-2xl mx-auto">
              <div className="flex items-center justify-between">
                <code className="text-blue-600 text-sm md:text-base font-mono">
                  https://splickets.com/ref/YOURNAME123
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  data-testid="button-copy-sample"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-blue-600 to-purple-700 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Plane className="w-16 h-16 mx-auto mb-6 text-blue-200" />

            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Start Earning?
            </h2>

            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto leading-relaxed">
              Share Splickets with your friends and start earning credits for
              your next adventure. The more you share, the more you save!
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <Link href="/">
                <Button
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-8 py-3"
                  data-testid="button-search-flights"
                >
                  <Target className="w-5 h-5 mr-2" />
                  Search Flights
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>

              <Button
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3"
                data-testid="button-learn-more-referral"
              >
                Learn More About Referrals
              </Button>
            </div>

            <p className="text-sm text-blue-200">
              Sign up for an account to get your unique referral link
            </p>
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Referral Program FAQs
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to know about earning and sharing with friends
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="bg-gray-50 rounded-lg border"
                >
                  <AccordionTrigger
                    className="px-6 py-4 text-left font-semibold hover:no-underline"
                    data-testid={`referral-faq-trigger-${index}`}
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

          {/* Final CTA */}
          <div className="text-center mt-12">
            <p className="text-gray-600 mb-6">
              Still have questions about our referral program?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="outline"
                size="lg"
                data-testid="button-contact-support-referral"
              >
                Contact Support
              </Button>
              <Link href="/">
                <Button size="lg" data-testid="button-start-referring">
                  Start Referring Friends
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
