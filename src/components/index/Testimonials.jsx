import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

const testimonials = [
  {
    name: "Sarah",
    country: "🇺🇸 USA",
    language: "Learning Spanish",
    quote: "I gained confidence in Spanish in just 3 days! The practice rooms with native speakers made all the difference.",
    avatar: "https://placehold.co/100/1A1F2C/FFFFFF/png?text=S"
  },
  {
    name: "Miguel",
    country: "🇲🇽 Mexico",
    language: "Learning English",
    quote: "The IELTS practice rooms helped me score 7.5 on my speaking test. Thank you for this amazing platform!",
    avatar: "https://placehold.co/100/1A1F2C/FFFFFF/png?text=M"
  },
  {
    name: "Aiko",
    country: "🇯🇵 Japan",
    language: "Learning German",
    quote: "I love the gamification aspect! Earning XP and leveling up keeps me motivated to practice every day.",
    avatar: "https://placehold.co/100/1A1F2C/FFFFFF/png?text=A"
  },
  {
    name: "Luca",
    country: "🇮🇹 Italy",
    language: "Learning French",
    quote: "The variety of topic-based rooms means I'm never bored. It feels like I'm just having fun with friends, not studying.",
    avatar: "https://placehold.co/100/1A1F2C/FFFFFF/png?text=L"
  }
];

const Testimonials = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const nextTestimonial = () => {
    setActiveIndex((prevIndex) => (prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1));
  };

  const prevTestimonial = () => {
    setActiveIndex((prevIndex) => (prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1));
  };

  return (
    <section id="testimonials" className="py-20 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 scroll-animate">
          <h2 className="text-gradient-purple mb-4">What Our Users Say</h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Join thousands of language learners who are transforming their speaking skills.
          </p>
        </div>

        {/* Mobile Carousel */}
        <div className="md:hidden relative scroll-animate">
          <div className="glass-morphism rounded-xl p-6 md:p-8 text-center relative overflow-hidden">
            {/* Decorative accent */}
            <div className="absolute top-0 right-0 w-32 h-32 rounded-bl-full bg-neon-purple/10"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 rounded-tr-full bg-neon-pink/10"></div>
            
            <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden glass-morphism p-1 glow-purple">
              <Avatar className="w-full h-full">
                <AvatarImage src={testimonials[activeIndex].avatar} alt={testimonials[activeIndex].name} />
                <AvatarFallback>{testimonials[activeIndex].name.charAt(0)}</AvatarFallback>
              </Avatar>
            </div>
            <p className="text-lg text-gray-200 italic mb-4">"{testimonials[activeIndex].quote}"</p>
            <div className="font-bold text-gradient-purple">{testimonials[activeIndex].name}</div>
            <div className="text-sm text-gray-400">{testimonials[activeIndex].country} • {testimonials[activeIndex].language}</div>
            
            <div className="flex justify-center mt-6 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === activeIndex ? 'bg-neon-purple glow-purple' : 'bg-gray-700'
                  }`}
                  onClick={() => setActiveIndex(index)}
                />
              ))}
            </div>
            
            <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between px-2">
              <button 
                onClick={prevTestimonial}
                className="w-10 h-10 rounded-full glass-morphism flex items-center justify-center text-gray-300 hover:text-white hover:glow-purple transition-all"
              >
                ←
              </button>
              <button 
                onClick={nextTestimonial}
                className="w-10 h-10 rounded-full glass-morphism flex items-center justify-center text-gray-300 hover:text-white hover:glow-purple transition-all"
              >
                →
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Grid */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-6 scroll-animate">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              className="glass-morphism rounded-xl p-6 transition-all duration-300 hover:scale-105 hover:glow-purple relative overflow-hidden group"
            >
              {/* Decorative accent */}
              <div className="absolute top-0 right-0 w-20 h-20 rounded-bl-full bg-neon-purple/10 group-hover:bg-neon-purple/20 transition-colors"></div>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-full overflow-hidden glass-morphism p-1 group-hover:glow-purple transition-all">
                  <Avatar className="w-full h-full">
                    <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                    <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </div>
                <div>
                  <div className="font-bold text-white group-hover:text-gradient-purple transition-all">{testimonial.name}</div>
                  <div className="text-sm text-gray-400">{testimonial.country}</div>
                </div>
              </div>
              <p className="text-gray-300 mb-2 text-sm italic">"{testimonial.quote}"</p>
              <div className="text-xs text-gray-500">{testimonial.language}</div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center scroll-animate">
          <div className="glass-morphism inline-block rounded-full px-6 py-3 text-neon-purple glow-text-purple">
            <span className="text-2xl font-bold">500+</span> five-star reviews from language learners
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
