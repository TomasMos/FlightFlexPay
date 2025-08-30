// Layout.tsx
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen">
      <Navbar />

      {/* main content, with bottom padding to avoid footer overlap */}
      <main className="lg:pb-[378px]"> 
        {children}
      </main>

      <Footer />
    </div>
  );
}
   