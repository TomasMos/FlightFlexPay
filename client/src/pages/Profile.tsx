import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookingsTab } from "@/components/profile/BookingsTab";
import { BillingTab } from "@/components/profile/BillingTab";
import { SettingsTab } from "@/components/profile/SettingsTab";
import { SupportTab } from "@/components/profile/SupportTab";
import { AccountTab } from "@/components/profile/AccountTab";
import { ReferralsTab } from "@/components/profile/ReferralsTab";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";

export default function Profile() {
  const { currentUser } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("referrals");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get("tab");
    if (tab && ["referrals", "bookings", "billing", "account"].includes(tab)) {
      setActiveTab(tab);
    }
  }, []);

  if (!currentUser) {
    setLocation("/signin");
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <h1
          className="text-3xl font-bold mb-8"
          data-testid="text-profile-title"
        >
          Your Profile
        </h1>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="referrals" data-testid="tab-referrals">
              Referrals
            </TabsTrigger>
            <TabsTrigger value="bookings" data-testid="tab-bookings">
              Bookings
            </TabsTrigger>
            <TabsTrigger value="billing" data-testid="tab-billing">
              Billing
            </TabsTrigger>
            <TabsTrigger value="account" data-testid="tab-account">
              Account
            </TabsTrigger>
          </TabsList>

          <TabsContent value="referrals">
            <ReferralsTab />
          </TabsContent>

          <TabsContent value="bookings">
            <BookingsTab />
          </TabsContent>

          <TabsContent value="billing">
            <BillingTab />
          </TabsContent>

          <TabsContent value="settings">
            <SettingsTab />
          </TabsContent>

          <TabsContent value="support">
            <SupportTab />
          </TabsContent>

          <TabsContent value="account">
            <AccountTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
