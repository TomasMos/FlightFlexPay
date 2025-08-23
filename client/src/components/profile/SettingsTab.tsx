import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Bell, Mail, MessageCircle, Shield, Smartphone, Plane, CreditCard, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function SettingsTab() {
  const { toast } = useToast();
  
  // Email notification preferences
  const [emailNotifications, setEmailNotifications] = useState({
    paymentReminders: true,
    flightReminders: true,
    checkinReminders: true,
    flightDelays: true,
    marketingEmails: true,
  });

  // SMS notification preferences  
  const [smsNotifications, setSmsNotifications] = useState({
    paymentReminders: true,
    flightReminders: true,
    checkinReminders: true,
    flightDelays: true,
  });

  // Security settings
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const handleEmailToggle = (key: string, value: boolean) => {
    setEmailNotifications(prev => ({ ...prev, [key]: value }));
    toast({
      title: "Preference updated",
      description: "Your email notification preference has been saved.",
    });
  };

  const handleSmsToggle = (key: string, value: boolean) => {
    setSmsNotifications(prev => ({ ...prev, [key]: value }));
    toast({
      title: "Preference updated", 
      description: "Your SMS notification preference has been saved.",
    });
  };

  return (
    <div className="space-y-8">
      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notification Preferences
          </CardTitle>
          <CardDescription>
            Choose how you'd like to be notified about your flights and payments.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Email Notifications */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Mail className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold">Email Notifications</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between" data-testid="setting-email-payment-reminders">
                <div className="space-y-0.5">
                  <Label htmlFor="email-payment-reminders" className="text-base">
                    Payment Reminders
                  </Label>
                  <div className="text-sm text-gray-500">
                    Get notified about upcoming payment due dates
                  </div>
                </div>
                <Switch
                  id="email-payment-reminders"
                  checked={emailNotifications.paymentReminders}
                  onCheckedChange={(checked) => handleEmailToggle('paymentReminders', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between" data-testid="setting-email-flight-reminders">
                <div className="space-y-0.5">
                  <Label htmlFor="email-flight-reminders" className="text-base">
                    Flight Reminders
                  </Label>
                  <div className="text-sm text-gray-500">
                    Reminders about upcoming flights
                  </div>
                </div>
                <Switch
                  id="email-flight-reminders"
                  checked={emailNotifications.flightReminders}
                  onCheckedChange={(checked) => handleEmailToggle('flightReminders', checked)}
                />
              </div>

              <div className="flex items-center justify-between" data-testid="setting-email-checkin-reminders">
                <div className="space-y-0.5">
                  <Label htmlFor="email-checkin-reminders" className="text-base">
                    Check-in Reminders
                  </Label>
                  <div className="text-sm text-gray-500">
                    Reminders to check in for your flights
                  </div>
                </div>
                <Switch
                  id="email-checkin-reminders"
                  checked={emailNotifications.checkinReminders}
                  onCheckedChange={(checked) => handleEmailToggle('checkinReminders', checked)}
                />
              </div>

              <div className="flex items-center justify-between" data-testid="setting-email-flight-delays">
                <div className="space-y-0.5">
                  <Label htmlFor="email-flight-delays" className="text-base">
                    Flight Delays
                  </Label>
                  <div className="text-sm text-gray-500">
                    Notifications about flight delays and changes
                  </div>
                </div>
                <Switch
                  id="email-flight-delays"
                  checked={emailNotifications.flightDelays}
                  onCheckedChange={(checked) => handleEmailToggle('flightDelays', checked)}
                />
              </div>

              <div className="flex items-center justify-between" data-testid="setting-email-marketing">
                <div className="space-y-0.5">
                  <Label htmlFor="email-marketing" className="text-base">
                    Marketing Emails
                  </Label>
                  <div className="text-sm text-gray-500">
                    Promotional offers and travel deals
                  </div>
                </div>
                <Switch
                  id="email-marketing"
                  checked={emailNotifications.marketingEmails}
                  onCheckedChange={(checked) => handleEmailToggle('marketingEmails', checked)}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* SMS Notifications */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Smartphone className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold">SMS Notifications</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between" data-testid="setting-sms-payment-reminders">
                <div className="space-y-0.5">
                  <Label htmlFor="sms-payment-reminders" className="text-base">
                    Payment Reminders
                  </Label>
                  <div className="text-sm text-gray-500">
                    SMS alerts for payment due dates
                  </div>
                </div>
                <Switch
                  id="sms-payment-reminders"
                  checked={smsNotifications.paymentReminders}
                  onCheckedChange={(checked) => handleSmsToggle('paymentReminders', checked)}
                />
              </div>

              <div className="flex items-center justify-between" data-testid="setting-sms-flight-reminders">
                <div className="space-y-0.5">
                  <Label htmlFor="sms-flight-reminders" className="text-base">
                    Flight Reminders
                  </Label>
                  <div className="text-sm text-gray-500">
                    SMS reminders about upcoming flights
                  </div>
                </div>
                <Switch
                  id="sms-flight-reminders"
                  checked={smsNotifications.flightReminders}
                  onCheckedChange={(checked) => handleSmsToggle('flightReminders', checked)}
                />
              </div>

              <div className="flex items-center justify-between" data-testid="setting-sms-checkin-reminders">
                <div className="space-y-0.5">
                  <Label htmlFor="sms-checkin-reminders" className="text-base">
                    Check-in Reminders
                  </Label>
                  <div className="text-sm text-gray-500">
                    SMS reminders to check in
                  </div>
                </div>
                <Switch
                  id="sms-checkin-reminders"
                  checked={smsNotifications.checkinReminders}
                  onCheckedChange={(checked) => handleSmsToggle('checkinReminders', checked)}
                />
              </div>

              <div className="flex items-center justify-between" data-testid="setting-sms-flight-delays">
                <div className="space-y-0.5">
                  <Label htmlFor="sms-flight-delays" className="text-base">
                    Flight Delays
                  </Label>
                  <div className="text-sm text-gray-500">
                    SMS alerts for flight delays
                  </div>
                </div>
                <Switch
                  id="sms-flight-delays"
                  checked={smsNotifications.flightDelays}
                  onCheckedChange={(checked) => handleSmsToggle('flightDelays', checked)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Security Settings
          </CardTitle>
          <CardDescription>
            Manage your account security and authentication preferences.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between" data-testid="setting-2fa">
            <div className="space-y-0.5">
              <Label htmlFor="two-factor" className="text-base">
                Enable 2FA
              </Label>
              <div className="text-sm text-gray-500">
                Add an extra layer of security to your account
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="two-factor"
                checked={twoFactorEnabled}
                onCheckedChange={setTwoFactorEnabled}
                disabled
              />
              <Button variant="outline" size="sm" disabled>
                Setup
              </Button>
            </div>
          </div>
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 text-blue-800 text-sm">
              <AlertTriangle className="w-4 h-4" />
              Two-factor authentication setup is coming soon.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}