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
  const [, setLocation] = useLocation();
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
                <TicketsPlane className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Splickets</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/">
              <Button variant="ghost" data-testid="nav-link-home">
                Home
              </Button>
            </Link>
    

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
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="fixed inset-x-0 top-16 bottom-0 z-50 overflow-y-auto border-t border-gray-200 bg-splickets-slate-50 md:hidden"
              data-testid="mobile-menu"
            >
              <div className="flex flex-col space-y-2 px-10 text-right">
                <Link href="/">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start"
                    onClick={() => setIsMobileMenuOpen(false)}
                    data-testid="mobile-nav-home"
                  >
                    Home
                  </Button>
                </Link>

                {/* Auth section */}
                {currentUser ? (
                  <>
                    <div className="border-t border-gray-200 pt-2 mt-2">
                      <div className="flex items-center space-x-3 px-3 py-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={currentUser.photoURL || ''} alt={currentUser.displayName || 'User'} />
                          <AvatarFallback>
                            {currentUser.displayName 
                              ? currentUser.displayName.split(' ').map(n => n[0]).join('').toUpperCase()
                              : getInitials(currentUser.email || '')
                            }
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          {currentUser.displayName && (
                            <p className="text-sm font-medium">{currentUser.displayName}</p>
                          )}
                          <p className="text-xs text-gray-500 truncate max-w-[200px]">
                            {currentUser.email}
                          </p>
                        </div>
                      </div>
                    </div>
                    <Link href="/profile">
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start"
                        onClick={() => setIsMobileMenuOpen(false)}
                        data-testid="mobile-nav-profile"
                      >
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        handleSignOut();
                      }}
                      data-testid="mobile-nav-signout"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <Link href="/signin">
                    <Button 
                      className="w-100"
                      onClick={() => setIsMobileMenuOpen(false)}
                      data-testid="mobile-nav-signin"
                    >
                      Sign In
                    </Button>
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        
      </div>
    </nav>
  );
}