import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plane, Clock, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { formatTime, formatDuration, formatDate } from '@/utils/formatters';
import { BookingDetailsModal } from './BookingDetailsModal';

interface Booking {
  id: number;
  userId: number;
  flightId: number;
  paymentPlanId: number;
  passengers: any;
  status: string;
  totalPrice: string;
  currency: string;
  createdAt: string;
  updatedAt: string;
  flight: {
    id: number;
    searchId: number;
    flightData: any;
    createdAt: string;
  };
  paymentPlan: {
    id: number;
    type: string;
    depositAmount: string;
    installmentCount: number;
    installmentFrequency: string;
    totalAmount: string;
    currency: string;
    status: string;
    createdAt: string;
  };
}

export function BookingsTab() {
  const { currentUser } = useAuth();
  const { currencySymbol } = useCurrency();
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['/api/bookings/user', currentUser?.email],
    queryFn: async () => {
      const response = await fetch(`/api/bookings/user?email=${encodeURIComponent(currentUser?.email || '')}`);
      if (!response.ok) throw new Error('Failed to fetch bookings');
      return response.json();
    },
    enabled: !!currentUser?.email,
  });

  console.log(`isLoading`, isLoading)

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingBookings = (bookings as Booking[]).filter((booking: Booking) => {
    const departureDate = new Date(booking.flight.departureDate);
    return departureDate >= today;
  });

  const pastBookings = (bookings as Booking[]).filter((booking: Booking) => {
    const departureDate = new Date(booking.flight.departureDate);
    return departureDate < today;
  });

  const BookingCard = ({ booking }: { booking: Booking }) => {
    const flightData = booking.flight.flightOffer;
    const firstItinerary = flightData.itineraries[0];
    const firstSegment = firstItinerary.segments[0];
    const lastSegment = firstItinerary.segments[firstItinerary.segments.length - 1];
    
    const airlines = Array.from(new Set(flightData.itineraries.flatMap((itinerary: any) => 
      itinerary.segments.map((segment: any) => segment.airline)
    )));
    
    const airlineDisplay = airlines.length === 1 ? airlines[0] : 'Multiple Airlines';

    return (
      <Card className="mb-4" data-testid={`card-booking-${booking.id}`}>
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="font-bold text-lg" data-testid={`text-booking-number-${booking.id}`}>
                Booking #{booking.id}
              </div>
              <div className="text-sm text-gray-500">{airlineDisplay}</div>
            </div>
            <div className="text-right">
              <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'} data-testid={`badge-status-${booking.id}`}>
                {booking.status}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Departure */}
            <div className="flex items-center gap-2">
              <Plane className="w-4 h-4 text-gray-500" />
              <div>
                <div className="font-medium">{firstSegment.departure.iataCode}</div>
                <div className="text-sm text-gray-500">
                  {formatTime(firstSegment.departure.at)}
                </div>
                <div className="text-sm text-gray-500">
                  {formatDate(firstSegment.departure.at)}
                </div>
              </div>
            </div>

            {/* Duration */}
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <div>
                <div className="font-medium">{formatDuration(firstItinerary.duration)}</div>
                <div className="text-sm text-gray-500">
                  {firstItinerary.segments.length - 1 === 0 
                    ? 'Nonstop' 
                    : `${firstItinerary.segments.length - 1} stop${firstItinerary.segments.length - 1 > 1 ? 's' : ''}`
                  }
                </div>
              </div>
            </div>

            {/* Arrival */}
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <div>
                <div className="font-medium">{lastSegment.arrival.iataCode}</div>
                <div className="text-sm text-gray-500">
                  {formatTime(lastSegment.arrival.at)}
                </div>
                <div className="text-sm text-gray-500">
                  {formatDate(lastSegment.arrival.at)}
                </div>
              </div>
            </div>
          </div>

          {/* Return flight info if exists */}
          {flightData.itineraries.length > 1 && (
            <div className="border-t pt-4 mb-4">
              <div className="text-sm font-medium mb-2">Return Flight</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <Plane className="w-4 h-4 text-gray-500" />
                  <div>
                    <div className="font-medium">{flightData.itineraries[1].segments[0].departure.iataCode}</div>
                    <div className="text-sm text-gray-500">
                      {formatTime(flightData.itineraries[1].segments[0].departure.at)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <div>
                    <div className="font-medium">{formatDuration(flightData.itineraries[1].duration)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <div>
                    <div className="font-medium">
                      {flightData.itineraries[1].segments[flightData.itineraries[1].segments.length - 1].arrival.iataCode}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatTime(flightData.itineraries[1].segments[flightData.itineraries[1].segments.length - 1].arrival.at)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Booked on {formatDate(booking.createdAt)}
            </div>
            <Button 
              variant="outline" 
              onClick={() => setSelectedBooking(booking)}
              data-testid={`button-details-${booking.id}`}
            >
              Details
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div>
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="upcoming" data-testid="tab-upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past" data-testid="tab-past">Past</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          <div className="space-y-4">
            {upcomingBookings.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Plane className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <CardTitle className="mb-2">No upcoming flights</CardTitle>
                  <CardDescription>
                    When you book your next flight, it will appear here.
                  </CardDescription>
                </CardContent>
              </Card>
            ) : (
              upcomingBookings.map((booking: Booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="past">
          <div className="space-y-4">
            {pastBookings.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <CardTitle className="mb-2">No past flights</CardTitle>
                  <CardDescription>
                    Your completed flights will appear here.
                  </CardDescription>
                </CardContent>
              </Card>
            ) : (
              pastBookings.map((booking: Booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {selectedBooking && (
        <BookingDetailsModal
          booking={selectedBooking}
          isOpen={!!selectedBooking}
          onClose={() => setSelectedBooking(null)}
        />
      )}
    </div>
  );
}