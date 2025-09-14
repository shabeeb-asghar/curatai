import { Navigation } from "@/components/ui/navigation";
import { HeroSection } from "@/components/landing/hero-section";
import { ProcessSection } from "@/components/landing/process-section";
import { TestimonialsSection } from "@/components/landing/testimonials-section";
import { Footer } from "@/components/landing/footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <HeroSection />
      <ProcessSection />
      <TestimonialsSection />
      <Footer />
    </div>
  );
};

export default Index;
