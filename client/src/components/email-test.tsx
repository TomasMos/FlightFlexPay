import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export function EmailTest() {
  const [email, setEmail] = useState("");
  const [emailType, setEmailType] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSendTestEmail = async () => {
    if (!email || !emailType) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/test-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type: emailType, email }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Email sent!",
          description: `${emailType} email sent successfully to ${email}`,
        });
      } else {
        toast({
          title: "Email not sent",
          description:
            "Email system is configured but sender verification may be needed in MailerSend. Check console for details.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error sending test email:", error);
      toast({
        title: "Error",
        description: "Failed to send test email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Only show in development environment
  // if (import.meta.env.PROD) {
  //   return null;
  // }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Email Testing</CardTitle>
        <CardDescription>
          Test MailerSend email functionality (development only)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="test-email">Email Address</Label>
          <Input
            id="test-email"
            type="email"
            placeholder="test@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            data-testid="input-test-email"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email-type">Email Type</Label>
          <Select value={emailType} onValueChange={setEmailType}>
            <SelectTrigger data-testid="select-email-type">
              <SelectValue placeholder="Select email type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="welcome">Welcome Email</SelectItem>
              <SelectItem value="booking">Booking Confirmation</SelectItem>
              <SelectItem value="reminder">Payment Reminder</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={handleSendTestEmail}
          disabled={isLoading}
          className="w-full"
          data-testid="button-send-test-email"
        >
          {isLoading ? "Sending..." : "Send Test Email"}
        </Button>
      </CardContent>
    </Card>
  );
}
