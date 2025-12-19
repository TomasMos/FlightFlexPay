import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Users, 
  UserCheck, 
  Plane, 
  CreditCard, 
  Eye, 
  Mail, 
  Phone, 
  Calendar,
  Loader2,
  ShieldAlert,
  Send,
  Plus,
  Copy,
  Check
} from "lucide-react";
import { format } from "date-fns";
import type { User, Lead, Booking } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";

interface AdminBooking {
  booking: Booking;
  user: User | null;
  flight: any;
  paymentPlan: any;
}

interface LeadAttempt {
  attempt: any;
  search: any;
}

export default function AdminPanel() {
  const { currentUser, getIdToken } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<AdminBooking | null>(null);
  const [userDetailOpen, setUserDetailOpen] = useState(false);
  const [leadDetailOpen, setLeadDetailOpen] = useState(false);
  const [bookingDetailOpen, setBookingDetailOpen] = useState(false);
  
  // Create User Modal State
  const [createUserOpen, setCreateUserOpen] = useState(false);
  const [createdUserResult, setCreatedUserResult] = useState<{ user: User; temporaryPassword: string } | null>(null);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    email: "",
    firstName: "",
    lastName: "",
    title: "",
    diallingCode: "",
    phoneNumber: "",
    preferredCurrency: "USD",
  });

  const resendConfirmationMutation = useMutation({
    mutationFn: async (bookingId: number) => {
      const token = await getIdToken();
      const res = await fetch(`/api/admin/bookings/${bookingId}/resend-confirmation`, {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to resend confirmation');
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Email Sent",
        description: "Booking confirmation email has been resent successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Send",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async (userData: typeof newUserForm) => {
      const token = await getIdToken();
      const res = await fetch('/api/admin/users/create', {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to create user');
      }
      return res.json();
    },
    onSuccess: (data) => {
      setCreatedUserResult({ user: data.user, temporaryPassword: data.temporaryPassword });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "User Created",
        description: "New user account created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Create User",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCreateUser = () => {
    if (!newUserForm.email || !newUserForm.firstName || !newUserForm.lastName) {
      toast({
        title: "Missing Fields",
        description: "Email, first name, and last name are required.",
        variant: "destructive",
      });
      return;
    }
    createUserMutation.mutate(newUserForm);
  };

  const resetCreateUserForm = () => {
    setNewUserForm({
      email: "",
      firstName: "",
      lastName: "",
      title: "",
      diallingCode: "",
      phoneNumber: "",
      preferredCurrency: "USD",
    });
    setCreatedUserResult(null);
    setCopiedPassword(false);
  };

  const copyPasswordToClipboard = async () => {
    if (createdUserResult?.temporaryPassword) {
      await navigator.clipboard.writeText(createdUserResult.temporaryPassword);
      setCopiedPassword(true);
      setTimeout(() => setCopiedPassword(false), 2000);
    }
  };

  const { data: adminCheck, isLoading: checkingAdmin } = useQuery({
    queryKey: ['/api/admin/check'],
    queryFn: async () => {
      const token = await getIdToken();
      const res = await fetch('/api/admin/check', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.json();
    },
    enabled: !!currentUser
  });

  const { data: usersData, isLoading: loadingUsers } = useQuery({
    queryKey: ['/api/admin/users'],
    queryFn: async () => {
      const token = await getIdToken();
      const res = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch users');
      return res.json();
    },
    enabled: adminCheck?.isAdmin
  });

  const { data: leadsData, isLoading: loadingLeads } = useQuery({
    queryKey: ['/api/admin/leads'],
    queryFn: async () => {
      const token = await getIdToken();
      const res = await fetch('/api/admin/leads', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch leads');
      return res.json();
    },
    enabled: adminCheck?.isAdmin
  });

  const { data: bookingsData, isLoading: loadingBookings } = useQuery({
    queryKey: ['/api/admin/bookings'],
    queryFn: async () => {
      const token = await getIdToken();
      const res = await fetch('/api/admin/bookings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch bookings');
      return res.json();
    },
    enabled: adminCheck?.isAdmin
  });

  const { data: userDetail } = useQuery({
    queryKey: ['/api/admin/users', selectedUser?.id],
    queryFn: async () => {
      const token = await getIdToken();
      const res = await fetch(`/api/admin/users/${selectedUser?.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch user details');
      return res.json();
    },
    enabled: !!selectedUser && userDetailOpen
  });

  const { data: leadDetail } = useQuery({
    queryKey: ['/api/admin/leads', selectedLead?.id],
    queryFn: async () => {
      const token = await getIdToken();
      const res = await fetch(`/api/admin/leads/${selectedLead?.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch lead details');
      return res.json();
    },
    enabled: !!selectedLead && leadDetailOpen
  });

  const { data: bookingDetail } = useQuery({
    queryKey: ['/api/admin/bookings', selectedBooking?.booking.id],
    queryFn: async () => {
      const token = await getIdToken();
      const res = await fetch(`/api/admin/bookings/${selectedBooking?.booking.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch booking details');
      return res.json();
    },
    enabled: !!selectedBooking && bookingDetailOpen
  });

  if (checkingAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-splickets-primary" />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ShieldAlert className="h-16 w-16 mx-auto text-gray-400 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-gray-600 mb-4">Please sign in to access the admin panel.</p>
        <Button onClick={() => setLocation('/signin')} data-testid="signin-button">
          Sign In
        </Button>
      </div>
    );
  }

  if (!adminCheck?.isAdmin) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ShieldAlert className="h-16 w-16 mx-auto text-red-400 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Admin Access Required</h1>
        <p className="text-gray-600 mb-4">You don't have permission to access this page.</p>
        <Button onClick={() => setLocation('/')} data-testid="go-home-button">
          Go Home
        </Button>
      </div>
    );
  }

  const formatDate = (date: string | Date | null) => {
    if (!date) return '-';
    return format(new Date(date), 'MMM d, yyyy');
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      'paid': 'default',
      'converted': 'default',
      'payment_pending': 'secondary',
      'in_progress': 'secondary',
      'cancelled': 'destructive',
      'abandoned': 'destructive',
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  const getRoleBadge = (role: string) => {
    return role === 'admin' 
      ? <Badge variant="default" className="bg-purple-600">Admin</Badge>
      : <Badge variant="outline">User</Badge>;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight" data-testid="admin-title">Admin Panel</h1>
        <p className="text-gray-600 mt-1">Manage users, leads, and bookings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card data-testid="stat-users">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Users</p>
                <p className="text-4xl font-bold mt-1">{usersData?.users?.length || 0}</p>
              </div>
              <Users className="h-12 w-12 text-splickets-primary opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card data-testid="stat-leads">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Leads</p>
                <p className="text-4xl font-bold mt-1">{leadsData?.leads?.length || 0}</p>
              </div>
              <UserCheck className="h-12 w-12 text-splickets-primary opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card data-testid="stat-bookings">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Bookings</p>
                <p className="text-4xl font-bold mt-1">{bookingsData?.bookings?.length || 0}</p>
              </div>
              <Plane className="h-12 w-12 text-splickets-primary opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="users" data-testid="tab-users">
            <Users className="h-4 w-4 mr-2" />
            Users
          </TabsTrigger>
          <TabsTrigger value="leads" data-testid="tab-leads">
            <UserCheck className="h-4 w-4 mr-2" />
            Leads
          </TabsTrigger>
          <TabsTrigger value="bookings" data-testid="tab-bookings">
            <Plane className="h-4 w-4 mr-2" />
            Bookings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>All Users</CardTitle>
              <Button 
                onClick={() => { resetCreateUserForm(); setCreateUserOpen(true); }}
                data-testid="button-create-user"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create User
              </Button>
            </CardHeader>
            <CardContent>
              {loadingUsers ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usersData?.users?.map((user: User) => (
                      <TableRow key={user.id} data-testid={`user-row-${user.id}`}>
                        <TableCell className="font-mono text-sm">{user.id}</TableCell>
                        <TableCell>{user.firstName} {user.lastName}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                        <TableCell>{formatDate(user.createdAt)}</TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user);
                              setUserDetailOpen(true);
                            }}
                            data-testid={`view-user-${user.id}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leads">
          <Card>
            <CardHeader>
              <CardTitle>All Leads</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingLeads ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leadsData?.leads?.map((lead: Lead) => (
                      <TableRow key={lead.id} data-testid={`lead-row-${lead.id}`}>
                        <TableCell className="font-mono text-sm">{lead.id}</TableCell>
                        <TableCell>{lead.firstName} {lead.lastName}</TableCell>
                        <TableCell>{lead.email}</TableCell>
                        <TableCell>{lead.diallingCode} {lead.phoneNumber}</TableCell>
                        <TableCell>{getStatusBadge(lead.status || 'in_progress')}</TableCell>
                        <TableCell>{formatDate(lead.createdAt)}</TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setSelectedLead(lead);
                              setLeadDetailOpen(true);
                            }}
                            data-testid={`view-lead-${lead.id}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bookings">
          <Card>
            <CardHeader>
              <CardTitle>All Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingBookings ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Route</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookingsData?.bookings?.map((item: AdminBooking) => (
                      <TableRow key={item.booking.id} data-testid={`booking-row-${item.booking.id}`}>
                        <TableCell className="font-mono text-sm">{item.booking.id}</TableCell>
                        <TableCell>
                          {item.user ? `${item.user.firstName} ${item.user.lastName}` : 'Unknown'}
                        </TableCell>
                        <TableCell>
                          {item.flight?.originIata} → {item.flight?.destinationIata}
                        </TableCell>
                        <TableCell>
                          {item.booking.currency} {item.booking.totalPrice}
                        </TableCell>
                        <TableCell>
                          {item.paymentPlan?.type === 'full' ? 'Full' : 'Installments'}
                        </TableCell>
                        <TableCell>{getStatusBadge(item.booking.status || 'payment_pending')}</TableCell>
                        <TableCell>{formatDate(item.booking.createdAt)}</TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setSelectedBooking(item);
                              setBookingDetailOpen(true);
                            }}
                            data-testid={`view-booking-${item.booking.id}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={userDetailOpen} onOpenChange={setUserDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{selectedUser.title} {selectedUser.firstName} {selectedUser.lastName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium flex items-center gap-2">
                    <Mail className="h-4 w-4" /> {selectedUser.email}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium flex items-center gap-2">
                    <Phone className="h-4 w-4" /> {selectedUser.diallingCode} {selectedUser.phoneNumber || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Role</p>
                  {getRoleBadge(selectedUser.role)}
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date of Birth</p>
                  <p className="font-medium">{formatDate(selectedUser.dob)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Passport Country</p>
                  <p className="font-medium">{selectedUser.passportCountry || '-'}</p>
                </div>
              </div>

              {userDetail?.bookings && userDetail.bookings.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-3">Bookings ({userDetail.bookings.length})</h3>
                    <div className="space-y-2">
                      {userDetail.bookings.map((booking: Booking) => (
                        <div key={booking.id} className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                          <div>
                            <p className="font-medium">Booking #{booking.id}</p>
                            <p className="text-sm text-gray-600">{booking.currency} {booking.totalPrice}</p>
                          </div>
                          {getStatusBadge(booking.status || 'payment_pending')}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={leadDetailOpen} onOpenChange={setLeadDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Lead Details</DialogTitle>
          </DialogHeader>
          {selectedLead && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{selectedLead.title} {selectedLead.firstName} {selectedLead.lastName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium flex items-center gap-2">
                    <Mail className="h-4 w-4" /> {selectedLead.email}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium flex items-center gap-2">
                    <Phone className="h-4 w-4" /> {selectedLead.diallingCode} {selectedLead.phoneNumber || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  {getStatusBadge(selectedLead.status || 'in_progress')}
                </div>
                <div>
                  <p className="text-sm text-gray-500">Created</p>
                  <p className="font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" /> {formatDate(selectedLead.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Passport Country</p>
                  <p className="font-medium">{selectedLead.passportCountry || '-'}</p>
                </div>
              </div>

              {leadDetail?.attempts && leadDetail.attempts.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-3">Flight Search Attempts ({leadDetail.attempts.length})</h3>
                    <div className="space-y-2">
                      {leadDetail.attempts.map((item: LeadAttempt, idx: number) => (
                        <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">
                                {item.search?.originIata} → {item.search?.destinationIata}
                              </p>
                              <p className="text-sm text-gray-600">
                                {formatDate(item.search?.departureDate)} 
                                {item.search?.returnDate && ` - ${formatDate(item.search.returnDate)}`}
                              </p>
                              <p className="text-sm text-gray-500">
                                {item.search?.passengerCount} passenger(s), {item.search?.tripType}
                              </p>
                            </div>
                            <p className="text-xs text-gray-400">
                              {formatDate(item.attempt?.attemptedAt)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={bookingDetailOpen} onOpenChange={setBookingDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Booking Details</DialogTitle>
              {selectedBooking && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => resendConfirmationMutation.mutate(selectedBooking.booking.id)}
                  disabled={resendConfirmationMutation.isPending}
                  data-testid="resend-confirmation-button"
                >
                  {resendConfirmationMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Resend Confirmation
                </Button>
              )}
            </div>
          </DialogHeader>
          {selectedBooking && bookingDetail && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Booking ID</p>
                  <p className="font-mono font-medium">#{bookingDetail.booking.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  {getStatusBadge(bookingDetail.booking.status || 'payment_pending')}
                </div>
                <div>
                  <p className="text-sm text-gray-500">Customer</p>
                  <p className="font-medium">
                    {bookingDetail.user?.firstName} {bookingDetail.user?.lastName}
                  </p>
                  <p className="text-sm text-gray-600">{bookingDetail.user?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className="font-medium text-lg">
                    {bookingDetail.booking.currency} {bookingDetail.booking.totalPrice}
                  </p>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Plane className="h-4 w-4" /> Flight Details
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Route</p>
                      <p className="font-medium">
                        {bookingDetail.flight?.originIata} → {bookingDetail.flight?.destinationIata}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Trip Type</p>
                      <p className="font-medium capitalize">{bookingDetail.flight?.tripType}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Departure</p>
                      <p className="font-medium">{formatDate(bookingDetail.flight?.departureDate)}</p>
                    </div>
                    {bookingDetail.flight?.returnDate && (
                      <div>
                        <p className="text-sm text-gray-500">Return</p>
                        <p className="font-medium">{formatDate(bookingDetail.flight.returnDate)}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-500">Passengers</p>
                      <p className="font-medium">{bookingDetail.flight?.passengerCount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Cabin</p>
                      <p className="font-medium">{bookingDetail.flight?.cabin}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <CreditCard className="h-4 w-4" /> Payment Plan
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Type</p>
                      <p className="font-medium capitalize">{bookingDetail.paymentPlan?.type}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Amount</p>
                      <p className="font-medium">
                        {bookingDetail.paymentPlan?.currency} {bookingDetail.paymentPlan?.totalAmount}
                      </p>
                    </div>
                    {bookingDetail.paymentPlan?.depositAmount && (
                      <>
                        <div>
                          <p className="text-sm text-gray-500">Deposit</p>
                          <p className="font-medium">
                            {bookingDetail.paymentPlan.currency} {bookingDetail.paymentPlan.depositAmount}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Installments</p>
                          <p className="font-medium">
                            {bookingDetail.paymentPlan.installmentCount}x {bookingDetail.paymentPlan.installmentFrequency}
                          </p>
                        </div>
                      </>
                    )}
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      {getStatusBadge(bookingDetail.paymentPlan?.status || 'in_process')}
                    </div>
                  </div>
                </div>
              </div>

              {bookingDetail.installments && bookingDetail.installments.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Installment Schedule</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Paid At</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bookingDetail.installments.map((inst: any, idx: number) => (
                        <TableRow key={inst.id}>
                          <TableCell>{idx + 1}</TableCell>
                          <TableCell>{formatDate(inst.dueDate)}</TableCell>
                          <TableCell>{inst.currency} {inst.amount}</TableCell>
                          <TableCell>{getStatusBadge(inst.status)}</TableCell>
                          <TableCell>{inst.paidAt ? formatDate(inst.paidAt) : '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {bookingDetail.booking.passengers && (
                <div>
                  <h3 className="font-semibold mb-3">Passengers</h3>
                  <div className="grid gap-2">
                    {(Array.isArray(bookingDetail.booking.passengers) 
                      ? bookingDetail.booking.passengers 
                      : [bookingDetail.booking.passengers]
                    ).map((passenger: any, idx: number) => (
                      <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                        <p className="font-medium">
                          {passenger.title} {passenger.firstName} {passenger.lastName}
                        </p>
                        <p className="text-sm text-gray-600">
                          DOB: {passenger.dob || '-'} | Passport: {passenger.passportCountry || '-'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create User Modal */}
      <Dialog open={createUserOpen} onOpenChange={(open) => {
        setCreateUserOpen(open);
        if (!open) resetCreateUserForm();
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {createdUserResult ? "User Created Successfully" : "Create New User"}
            </DialogTitle>
            <DialogDescription>
              {createdUserResult 
                ? "Share the temporary password with the user. They can sign in and change it later."
                : "Create a new user account with a temporary password."
              }
            </DialogDescription>
          </DialogHeader>

          {createdUserResult ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Check className="h-5 w-5 text-green-600" />
                  <span className="font-semibold text-green-800">Account Created</span>
                </div>
                <p className="text-sm text-green-700">
                  {createdUserResult.user.firstName} {createdUserResult.user.lastName} ({createdUserResult.user.email})
                </p>
              </div>

              <div className="space-y-2">
                <Label>Temporary Password</Label>
                <div className="flex gap-2">
                  <Input 
                    value={createdUserResult.temporaryPassword} 
                    readOnly 
                    className="font-mono"
                    data-testid="input-temp-password"
                  />
                  <Button 
                    variant="outline" 
                    onClick={copyPasswordToClipboard}
                    data-testid="button-copy-password"
                  >
                    {copiedPassword ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  The user should change this password after signing in.
                </p>
              </div>

              <DialogFooter>
                <Button onClick={() => { setCreateUserOpen(false); resetCreateUserForm(); }} data-testid="button-done">
                  Done
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={newUserForm.firstName}
                    onChange={(e) => setNewUserForm({ ...newUserForm, firstName: e.target.value })}
                    placeholder="John"
                    data-testid="input-first-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={newUserForm.lastName}
                    onChange={(e) => setNewUserForm({ ...newUserForm, lastName: e.target.value })}
                    placeholder="Doe"
                    data-testid="input-last-name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                  placeholder="john@example.com"
                  data-testid="input-email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Select
                  value={newUserForm.title}
                  onValueChange={(value) => setNewUserForm({ ...newUserForm, title: value })}
                >
                  <SelectTrigger data-testid="select-title">
                    <SelectValue placeholder="Select title" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mr">Mr</SelectItem>
                    <SelectItem value="Mrs">Mrs</SelectItem>
                    <SelectItem value="Ms">Ms</SelectItem>
                    <SelectItem value="Dr">Dr</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="diallingCode">Dialling Code</Label>
                  <Input
                    id="diallingCode"
                    value={newUserForm.diallingCode}
                    onChange={(e) => setNewUserForm({ ...newUserForm, diallingCode: e.target.value })}
                    placeholder="+1"
                    data-testid="input-dialling-code"
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    value={newUserForm.phoneNumber}
                    onChange={(e) => setNewUserForm({ ...newUserForm, phoneNumber: e.target.value })}
                    placeholder="555-1234"
                    data-testid="input-phone-number"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Preferred Currency</Label>
                <Select
                  value={newUserForm.preferredCurrency}
                  onValueChange={(value) => setNewUserForm({ ...newUserForm, preferredCurrency: value })}
                >
                  <SelectTrigger data-testid="select-currency">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                    <SelectItem value="GBP">GBP - British Pound</SelectItem>
                    <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                    <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setCreateUserOpen(false)}
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateUser}
                  disabled={createUserMutation.isPending}
                  data-testid="button-create"
                >
                  {createUserMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create User"
                  )}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
