import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import Home from "@/pages/home";
import PassengerDetails from "@/pages/PassengerDetails";
import FlightBooking from "@/pages/FlightBooking";
import EmailTestPage from "@/pages/EmailTest";
import SignIn from "@/pages/SignIn";
import Profile from "@/pages/Profile";
import Testimonials from "@/pages/Testimonials";
import About from "@/pages/About";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home}/>
      <Route path="/flight-search/passenger-details/:flightId" component={PassengerDetails}/>
      <Route path="/flight-search/book" component={FlightBooking}/>
      <Route path="/signin" component={SignIn}/>
      <Route path="/profile" component={Profile}/>
      <Route path="/testimonials" component={Testimonials}/>
      <Route path="/about" component={About}/>
      <Route path="/email-test" component={EmailTestPage}/>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CurrencyProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </CurrencyProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
