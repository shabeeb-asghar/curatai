import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Wedding Photographer",
    content: "CuratAI has revolutionized my workflow. What used to take me 6 hours of culling now takes 15 minutes. My clients get their galleries faster, and I can focus on what I love - shooting.",
    rating: 5,
    avatar: "SC"
  },
  {
    name: "Marcus Rodriguez",
    role: "Travel Blogger",
    content: "I shoot thousands of photos during my trips. CuratAI helps me quickly identify the best shots for my blog and social media. The face clustering feature is incredible for organizing group shots.",
    rating: 5,
    avatar: "MR"
  },
  {
    name: "Emma Thompson",
    role: "Event Coordinator",
    content: "Managing photos from large corporate events was a nightmare until I found CuratAI. Now I can deliver curated albums to clients within hours of the event ending.",
    rating: 5,
    avatar: "ET"
  }
];

export const TestimonialsSection = () => {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            Trusted by <span className="text-gradient">Photographers</span> Worldwide
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            See what professionals are saying about CuratAI
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="card-elegant p-8 group hover:scale-105 transition-transform duration-300">
              {/* Stars */}
              <div className="flex space-x-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              
              {/* Quote */}
              <blockquote className="text-muted-foreground leading-relaxed mb-6">
                "{testimonial.content}"
              </blockquote>
              
              {/* Author */}
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-hero-gradient rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">{testimonial.avatar}</span>
                </div>
                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 pt-16 border-t border-border">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">50K+</div>
            <div className="text-sm text-muted-foreground">Photos Processed Daily</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">2,500+</div>
            <div className="text-sm text-muted-foreground">Happy Photographers</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">95%</div>
            <div className="text-sm text-muted-foreground">Time Saved</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">4.9/5</div>
            <div className="text-sm text-muted-foreground">User Rating</div>
          </div>
        </div>
      </div>
    </section>
  );
};