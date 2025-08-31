import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Menu, X, User, LogOut, TicketsPlane } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from "framer-motion";


export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [Location, setLocation] = useLocation();
  const { currentUser, logout } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
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

  const navLinks = [
    { href: "/", label: "Search", testId: "nav-link-home" },
    { href: "/about", label: "About", testId: "nav-link-about" },
    { href: "/how-it-works", label: "How it Works", testId: "nav-link-how-it-works" },
    { href: "/referral-program", label: "Referrals", testId: "nav-link-referral" },
    // { href: "/testimonials", label: "Testimonials", testId: "nav-link-testimonials" },
  ];

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
  }, [isMobileMenuOpen]);

  const getInitials = (email: string) => {
    return email.split('@')[0].slice(0, 2).toUpperCase();
  };

  return (
      <nav className="bg-white shadow-sm border-b border-gray-200 md:sticky md:top-0 z-40">
        
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center space-x-2 cursor-pointer" data-testid="navbar-logo">
              <div className="w-10 h-10 bg-splickets-primary rounded-lg flex items-center justify-center">
                <TicketsPlane className="w-8 h-8 text-white stroke-2" />
              </div>
              <span className="text-xl font-bold text-gray-900">Splickets</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              {navLinks.map(link => (
                <Link href={link.href} key={link.href}>
                  <Button
                    variant="ghost"
                    data-testid={link.testId}
                    className={Location === link.href ? "text-splickets-accent" : ""}
                  >
                    {link.label}
                  </Button>
                </Link>
              ))}
            
            
    

            {/* Auth section */}
            {currentUser ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full" data-testid="profile-menu-trigger">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={currentUser.photoURL || ''} alt={currentUser.displayName || 'User'} />
                      <AvatarFallback>
                        {currentUser.displayName 
                          ? currentUser.displayName.split(' ').map(n => n[0]).join('').toUpperCase()
                          : getInitials(currentUser.email || '')
                        }
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      {currentUser.displayName && (
                        <p className="font-medium">{currentUser.displayName}</p>
                      )}
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {currentUser.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setLocation('/profile')} data-testid="dropdown-profile">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} data-testid="dropdown-signout">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/signin">
                <Button data-testid="nav-link-signin" className='h-10'>
                  Sign In
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden w-10 h-10 flex items-center justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              data-testid="mobile-menu-button"
              className="w-full h-full p-0 flex items-center justify-center"
            >
              {isMobileMenuOpen ? (
                <X className="!h-6 !w-6" />
              ) : (
                <Menu className="!h-6 !w-6" />
              )}
            </Button>
          </div>

        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              key="mobile-menu"
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-y-0 right-0 top-16 z-50 w-full overflow-y-auto border-l border-gray-200 bg-white md:w-1/2"
              data-testid="mobile-menu"
            >
              <div className="flex flex-col border-b border-gray-200 px-6 py-4 text-right md:hidden">
                {currentUser ? (
                  <div className="flex items-center justify-end space-x-3">
                    <div className="flex flex-col items-end">
                      {currentUser.displayName && (
                        <p className="text-sm font-medium">{currentUser.displayName}</p>
                      )}
                      <p className="max-w-[200px] truncate text-xs text-gray-500">
                        {currentUser.email}
                      </p>
                    </div>
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={currentUser.photoURL || ''} alt={currentUser.displayName || 'User'} />
                      <AvatarFallback>
                        {currentUser.displayName
                          ? currentUser.displayName.split(' ').map((n) => n[0]).join('').toUpperCase()
                          : getInitials(currentUser.email || '')}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                ) : (
                  <Link href="/signin">
                    <Button onClick={() => setIsMobileMenuOpen(false)} data-testid="mobile-nav-signin">
                      Sign In
                    </Button>
                  </Link>
                )}
              </div>
              
              <div className="flex flex-col space-y-2 py-4 text-right">
              {navLinks.map(link => (
                <Link href={link.href} key={link.href} className="flex items-center justify-end border-b border-gray-200 py-4 pr-6 pl-10" onClick={() => setIsMobileMenuOpen(false)} data-testid={`mobile-nav-${link.label}`}>
                  
                  <span className={Location === link.href ? "text-xl font-medium text-splickets-accent" : "text-xl font-medium text-gray-700"}>{link.label}</span>
                </Link>
              ))}

                {currentUser && (
                  <>
                    <Link href="/profile" className="flex items-center justify-end border-b border-gray-200 py-4 pr-6 pl-10" onClick={() => setIsMobileMenuOpen(false)} data-testid="mobile-nav-profile">
                      <span className={Location === '/profile' ? "text-xl font-medium text-splickets-accent" : "text-xl font-medium text-gray-700"}>Profile</span>
                      <User className="ml-2 h-5 w-5 text-gray-700" />
                    </Link>
                    <Button
                      variant="ghost"
                      className="flex w-full items-center justify-end py-4 pr-6 pl-10 text-right"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        handleSignOut();
                      }}
                      data-testid="mobile-nav-signout"
                    >
                      <span className="text-xl font-medium text-gray-700">Sign Out</span>
                      <LogOut className="ml-2 h-5 w-5 text-gray-700" />
                    </Button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        
      </div>
    </nav>
  );
}