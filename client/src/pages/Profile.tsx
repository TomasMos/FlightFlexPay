import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, Mail, LogOut } from 'lucide-react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';

export default function Profile() {
  const { currentUser, logout } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

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

  if (!currentUser) {
    setLocation('/signin');
    return null;
  }

  const getInitials = (email: string) => {
    return email.split('@')[0].slice(0, 2).toUpperCase();
  };

  const getProviderInfo = () => {
    const providers = currentUser.providerData;
    const hasPassword = providers.some(p => p.providerId === 'password');
    const hasGoogle = providers.some(p => p.providerId === 'google.com');
    
    return { hasPassword, hasGoogle };
  };

  const { hasPassword, hasGoogle } = getProviderInfo();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-8">Your Profile</h1>
        
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Avatar className="w-20 h-20">
                <AvatarImage src={currentUser.photoURL || ''} />
                <AvatarFallback className="text-lg">
                  {currentUser.displayName 
                    ? currentUser.displayName.split(' ').map(n => n[0]).join('').toUpperCase()
                    : getInitials(currentUser.email || '')
                  }
                </AvatarFallback>
              </Avatar>
            </div>
            <CardTitle>{currentUser.displayName || 'Splickets User'}</CardTitle>
            <CardDescription>{currentUser.email}</CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Account Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <User className="w-5 h-5 mr-2" />
                Account Information
              </h3>
              
              <div className="grid gap-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-2 text-gray-500" />
                    <span>Email</span>
                  </div>
                  <span className="text-sm text-gray-600">{currentUser.email}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <span>Email Verified</span>
                  </div>
                  <Badge variant={currentUser.emailVerified ? "default" : "secondary"}>
                    {currentUser.emailVerified ? "Verified" : "Not Verified"}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <span>Sign-in Methods</span>
                  </div>
                  <div className="flex gap-2">
                    {hasPassword && <Badge variant="outline">Email & Password</Badge>}
                    {hasGoogle && <Badge variant="outline">Google</Badge>}
                  </div>
                </div>
              </div>
            </div>

            {/* Coming Soon */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Coming Soon</h3>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800 text-sm">
                  More profile features are coming soon, including:
                </p>
                <ul className="list-disc list-inside text-blue-700 text-sm mt-2 space-y-1">
                  <li>Booking history</li>
                  <li>Payment schedule management</li>
                  <li>Travel preferences</li>
                  <li>Account settings</li>
                </ul>
              </div>
            </div>

            {/* Sign Out */}
            <div className="pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={handleLogout}
                className="w-full"
                data-testid="button-logout"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Button 
            variant="link" 
            onClick={() => setLocation('/')}
            data-testid="button-back-home"
          >
            ← Back to Splickets
          </Button>
        </div>
      </div>
    </div>
  );
}