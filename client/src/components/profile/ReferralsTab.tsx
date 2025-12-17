import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Copy, Check, Gift, Users, TrendingUp } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface ReferralData {
  code: string;
  timesUsed: number;
  discountPercent: string;
  discountAmount: string;
  bookings?: Array<{
    id: number;
    createdAt: string;
    totalPrice: string;
    currency: string;
  }>;
}

export function ReferralsTab() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const { data: referralData, isLoading } = useQuery<ReferralData>({
    queryKey: ['/api/user/referral', currentUser?.email],
    queryFn: async () => {
      const res = await fetch(`/api/user/referral?email=${encodeURIComponent(currentUser?.email || '')}`);
      if (!res.ok) throw new Error('Failed to fetch referral data');
      return res.json();
    },
    enabled: !!currentUser?.email,
  });

  const handleCopyCode = async () => {
    if (!referralData?.code) return;
    
    try {
      await navigator.clipboard.writeText(referralData.code);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Your referral code has been copied to clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please copy the code manually.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#0a1628]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card data-testid="card-referral-code">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-[#0a1628]" />
            Your Referral Code
          </CardTitle>
          <CardDescription>
            Share your code with friends and family. When they book a flight, they'll get a discount!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Input
              value={referralData?.code || ''}
              readOnly
              className="font-mono text-lg font-semibold tracking-wide"
              data-testid="input-referral-code"
            />
            <Button
              onClick={handleCopyCode}
              variant="outline"
              className="shrink-0"
              data-testid="button-copy-code"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-sm text-gray-500 mt-3">
            Friends who use your code will receive either 10% off or $25 USD (whichever is lower) on their booking.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card data-testid="card-referral-stats">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Times Used</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-[#0a1628]" />
              <span className="text-3xl font-bold" data-testid="text-times-used">
                {referralData?.timesUsed || 0}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Discount Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[#0a1628]" />
              <span className="text-3xl font-bold">
                10% <span className="text-base font-normal text-gray-500">or $25</span>
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {referralData?.bookings && referralData.bookings.length > 0 && (
        <Card data-testid="card-referral-history">
          <CardHeader>
            <CardTitle>Referral History</CardTitle>
            <CardDescription>
              Bookings made using your referral code
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {referralData.bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  data-testid={`referral-booking-${booking.id}`}
                >
                  <div>
                    <p className="font-medium">Booking #{booking.id}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(booking.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {booking.currency} {parseFloat(booking.totalPrice).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-gradient-to-r from-[#0a1628] to-[#1a2d4a] text-white">
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-2">How it works</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-200">
            <li>Share your unique referral code with friends and family</li>
            <li>They enter your code during checkout</li>
            <li>They receive a discount on their booking (minimum of 10% or $25 USD)</li>
            <li>We track how many times your code has been used</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
