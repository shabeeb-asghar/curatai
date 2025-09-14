import { Upload, Brain, Download } from "lucide-react";

const steps = [
  {
    icon: Upload,
    title: "Upload Your Photos",
    description: "Drag and drop thousands of photos from your camera or phone. We support all major formats including RAW files.",
    step: "01"
  },
  {
    icon: Brain,
    title: "AI Analysis",
    description: "Our intelligent algorithms analyze focus, exposure, composition, and detect duplicates to rank your best shots.",
    step: "02"
  },
  {
    icon: Download,
    title: "Get Curated Results",
    description: "Download your professionally curated selection, organized by quality, faces, and events. Ready to edit or share.",
    step: "03"
  }
];

export const ProcessSection = () => {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            How <span className="text-gradient">CuratAI</span> Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Three simple steps to transform your photo chaos into organized perfection
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative group">
              {/* Connecting line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-primary/20 to-transparent z-0"></div>
              )}
              
              <div className="card-feature text-center relative z-10 group-hover:scale-105 transition-transform duration-300">
                <div className="w-16 h-16 bg-hero-gradient rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <step.icon className="w-8 h-8 text-white" />
                </div>
                
                <div className="text-sm font-medium text-primary/60 mb-2">STEP {step.step}</div>
                <h3 className="text-xl font-semibold mb-4">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <div className="inline-flex items-center space-x-2 bg-white rounded-full px-6 py-3 shadow-card border border-border">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-muted-foreground">Process typically completes in under 5 minutes</span>
          </div>
        </div>
      </div>
    </section>
  );
};