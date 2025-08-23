import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Mail, Shield, Globe, Phone, LogOut, Check, Send } from 'lucide-react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';

const SUPPORTED_CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'AED' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
];

export function AccountTab() {
  const { currentUser, logout } = useAuth();
  const { currency, setCurrency } = useCurrency();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '', 
    phoneNumber: '',
    diallingCode: '+1',
  });

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Signed out",
        description: "You've been signed out successfully",
      });
      setLocation('/');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  const handleSendVerificationEmail = async () => {
    try {
      // TODO: Implement email verification
      toast({
        title: "Verification email sent",
        description: "Please check your inbox and click the verification link.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send verification email",
        variant: "destructive",
      });
    }
  };

  const handleCurrencyChange = (newCurrency: string) => {
    setCurrency(newCurrency as any);
    toast({
      title: "Currency updated",
      description: `Your preferred currency has been changed to ${newCurrency}`,
    });
  };

  const getInitials = (email: string) => {
    return email.split('@')[0].slice(0, 2).toUpperCase();
  };

  const getProviderInfo = () => {
    if (!currentUser) return { hasPassword: false, hasGoogle: false };
    const providers = currentUser.providerData;
    const hasPassword = providers.some(p => p.providerId === 'password');
    const hasGoogle = providers.some(p => p.providerId === 'google.com');
    
    return { hasPassword, hasGoogle };
  };

  const { hasPassword, hasGoogle } = getProviderInfo();

  if (!currentUser) return null;

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <Avatar className="w-20 h-20">
              <AvatarImage src={currentUser.photoURL || ''} />
              <AvatarFallback className="text-lg">
                {currentUser.displayName 
                  ? currentUser.displayName.split(' ').map(n => n[0]).join('').toUpperCase()
                  : getInitials(currentUser.email || '')
                }
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-bold" data-testid="text-user-name">
                {currentUser.displayName || 'Splickets User'}
              </h2>
              <p className="text-gray-600" data-testid="text-user-email">
                {currentUser.email}
              </p>
              <div className="flex gap-2 mt-2">
                {hasPassword && (
                  <Badge variant="outline" data-testid="badge-auth-password">
                    <Shield className="w-3 h-3 mr-1" />
                    Email & Password
                  </Badge>
                )}
                {hasGoogle && (
                  <Badge variant="outline" data-testid="badge-auth-google">
                    <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Google
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Account Information
          </CardTitle>
          <CardDescription>
            Manage your personal information and account settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={currentUser.displayName?.split(' ')[0] || ''}
                disabled={!isEditing}
                data-testid="input-first-name"
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={currentUser.displayName?.split(' ').slice(1).join(' ') || ''}
                disabled={!isEditing}
                data-testid="input-last-name"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email">Email</Label>
            <div className="flex items-center gap-2">
              <Input
                id="email"
                value={currentUser.email || ''}
                disabled
                data-testid="input-email"
              />
              <Badge 
                variant={currentUser.emailVerified ? "default" : "secondary"}
                data-testid="badge-email-verified"
              >
                {currentUser.emailVerified ? (
                  <><Check className="w-3 h-3 mr-1" />Verified</>
                ) : (
                  "Not Verified"
                )}
              </Badge>
              {!currentUser.emailVerified && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleSendVerificationEmail}
                  data-testid="button-verify-email"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Verify
                </Button>
              )}
            </div>
          </div>

          {/* Authentication Method */}
          <div>
            <Label>Authentication Method</Label>
            <div className="flex gap-2 mt-2">
              {hasPassword && (
                <Badge variant="outline">
                  <Shield className="w-3 h-3 mr-1" />
                  Email & Password
                </Badge>
              )}
              {hasGoogle && (
                <Badge variant="outline">
                  <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google
                </Badge>
              )}
            </div>
          </div>

          {/* Preferred Currency */}
          <div>
            <Label htmlFor="currency">Preferred Currency</Label>
            <Select value={currency} onValueChange={handleCurrencyChange}>
              <SelectTrigger data-testid="select-currency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_CURRENCIES.map((curr) => (
                  <SelectItem key={curr.code} value={curr.code}>
                    {curr.symbol} {curr.code} - {curr.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Phone Number */}
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <div className="flex gap-2">
              <Select defaultValue="+1" disabled={!isEditing}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="+1">+1 (US)</SelectItem>
                  <SelectItem value="+44">+44 (UK)</SelectItem>
                  <SelectItem value="+27">+27 (ZA)</SelectItem>
                  <SelectItem value="+61">+61 (AU)</SelectItem>
                </SelectContent>
              </Select>
              <Input
                id="phone"
                placeholder="Enter phone number"
                disabled={!isEditing}
                data-testid="input-phone"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sign Out */}
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-lg">Sign Out</h3>
              <p className="text-sm text-gray-600">
                Sign out of your Splickets account on this device
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              data-testid="button-sign-out"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}