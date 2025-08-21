import { Navbar } from "@/components/navbar";
import { EmailTest } from "@/components/email-test";

export default function EmailTestPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="py-8">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <h1 className="text-3xl font-bold text-center mb-8">
                Email Testing
              </h1>
              <div className="flex justify-center">
                <EmailTest />
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}