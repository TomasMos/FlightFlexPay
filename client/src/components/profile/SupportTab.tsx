import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  Mail, 
  Phone, 
  ExternalLink, 
  HelpCircle, 
  Plane, 
  CreditCard, 
  Map, 
  AlertTriangle,
  Clock
} from 'lucide-react';

export function SupportTab() {
  const faqCategories = [
    {
      title: "Bookings",
      icon: Plane,
      items: [
        "How to make a booking",
        "Changing or canceling flights", 
        "Seat selection and upgrades",
        "Special assistance requests"
      ]
    },
    {
      title: "Payments",
      icon: CreditCard,
      items: [
        "Payment methods accepted",
        "Installment plans",
        "Refund policies", 
        "Payment troubleshooting"
      ]
    },
    {
      title: "Travel Information", 
      icon: Map,
      items: [
        "Check-in procedures",
        "Baggage allowances",
        "Travel documents required",
        "Airport information"
      ]
    }
  ];

  return (
    <div className="space-y-8">
      {/* Contact Support */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5" />
            Contact Support
          </CardTitle>
          <CardDescription>
            All responses within 24 hours
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Live Chat */}
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-6 text-center">
                <MessageCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Live Chat</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Get instant help from our support team
                </p>
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700" 
                  onClick={() => window.open('https://wa.me/yourwhatsappnumber', '_blank')}
                  data-testid="button-start-chat"
                >
                  Start Chat
                </Button>
              </CardContent>
            </Card>

            {/* Email Support */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-6 text-center">
                <Mail className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Email Support</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Send us a detailed message about your issue
                </p>
                <Button 
                  variant="outline" 
                  className="w-full border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                  onClick={() => window.open('mailto:support@splickets.com', '_blank')}
                  data-testid="button-send-email"
                >
                  Send Email
                </Button>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Quick answers to common questions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {faqCategories.map((category, index) => (
              <Card key={index} className="bg-gray-50" data-testid={`faq-category-${category.title.toLowerCase()}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <category.icon className="w-5 h-5 text-gray-600" />
                      <CardTitle className="text-lg">{category.title}</CardTitle>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-gray-500 hover:text-gray-700"
                      data-testid={`button-view-all-${category.title.toLowerCase()}`}
                    >
                      <span className="mr-1">View All</span>
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-2">
                    {category.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="text-sm text-gray-600 hover:text-gray-800 cursor-pointer">
                        • {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Emergency Travel Support */}
      <Card className="bg-red-50 border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-800">
            <AlertTriangle className="w-5 h-5" />
            Emergency Travel Support
          </CardTitle>
          <CardDescription className="text-red-700">
            For urgent travel-related emergencies, flight disruptions, or immediate assistance while traveling.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Emergency Phone */}
            <Card className="bg-white border-red-200">
              <CardContent className="p-6 text-center">
                <Phone className="w-12 h-12 text-red-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-red-800 mb-2">Emergency Line</h3>
                <p className="text-sm text-red-700 mb-4">
                  24/7 emergency assistance
                </p>
                <Button 
                  variant="destructive" 
                  className="w-full"
                  onClick={() => window.open('tel:+1234567890', '_self')}
                  data-testid="button-emergency-call"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Call Emergency Line
                </Button>
                <p className="text-xs text-red-600 mt-2">+1 (234) 567-890</p>
              </CardContent>
            </Card>

            {/* Emergency Chat */}
            <Card className="bg-white border-red-200">
              <CardContent className="p-6 text-center">
                <MessageCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-red-800 mb-2">Emergency Chat</h3>
                <p className="text-sm text-red-700 mb-4">
                  Instant emergency support via WhatsApp
                </p>
                <Button 
                  variant="destructive" 
                  className="w-full"
                  onClick={() => window.open('https://wa.me/youremergencywhatsapp', '_blank')}
                  data-testid="button-emergency-chat"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Emergency Chat
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="bg-white p-4 rounded-lg border border-red-200">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-800 mb-1">When to use emergency support:</h4>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• Flight cancellations or major delays</li>
                  <li>• Lost or stolen travel documents</li>
                  <li>• Medical emergencies while traveling</li>
                  <li>• Urgent rebooking requirements</li>
                  <li>• Airport assistance needed immediately</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}