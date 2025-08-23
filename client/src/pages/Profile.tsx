import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Navbar } from '@/components/navbar';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { BookingsTab } from '@/components/profile/BookingsTab';
import { BillingTab } from '@/components/profile/BillingTab';
import { SettingsTab } from '@/components/profile/SettingsTab';
import { SupportTab } from '@/components/profile/SupportTab';
import { AccountTab } from '@/components/profile/AccountTab';
import { useLocation } from 'wouter';

export default function Profile() {
  const { currentUser } = useAuth();
  const [, setLocation] = useLocation();

  if (!currentUser) {
    setLocation('/signin');
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-3xl font-bold mb-8" data-testid="text-profile-title">Your Profile</h1>
        
        <Tabs defaultValue="bookings" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="bookings" data-testid="tab-bookings">Bookings</TabsTrigger>
            <TabsTrigger value="billing" data-testid="tab-billing">Billing</TabsTrigger>
            <TabsTrigger value="settings" data-testid="tab-settings">Settings</TabsTrigger>
            <TabsTrigger value="support" data-testid="tab-support">Support</TabsTrigger>
            <TabsTrigger value="account" data-testid="tab-account">Account</TabsTrigger>
          </TabsList>

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
      <Footer />
    </div>
  );
}