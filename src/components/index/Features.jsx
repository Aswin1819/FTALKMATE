import React, { useEffect } from 'react';
import { Video, Users, Award, Shield } from "lucide-react";
import { Card, CardContent } from '../ui/card'

const featureCards = [
  {
    title: "Live Audio/Video Chat",
    description: "Just click and speak with native speakers and fellow learners. No downloads needed.",
    icon: Video,
    color: "neon-blue",
    glowClass: "glow-blue"
  },
  {
    title: "Goal-Based Rooms",
    description: "Find rooms tailored to your goals: IELTS, debates, casual conversation, topic-based chats.",
    icon: Users,
    color: "neon-purple",
    glowClass: "glow-purple"
  },
  {
    title: "Gamified Progress",
    description: "Track your improvement with XP, streaks, and levels. Stay motivated while learning.",
    icon: Award,
    color: "neon-pink",
    glowClass: "glow-pink"
  },
  {
    title: "AI Moderation",
    description: "Enjoy a safe, friendly community with our advanced AI moderation system.",
    icon: Shield,
    color: "neon-blue",
    glowClass: "glow-blue"
  }
];

const Features = () => {
  useEffect(() => {
    const handleScroll = () => {
      const elements = document.querySelectorAll('.feature-card');
      
      elements.forEach((el, index) => {
        const rect = el.getBoundingClientRect();
        const isVisible = rect.top <= window.innerHeight * 0.85;
        
        if (isVisible) {
          setTimeout(() => {
            el.classList.add('animate-fade-in');
            el.classList.add('opacity-100');
          }, index * 150);
        }
      });
    };
    
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <section id="features" className="py-20 relative">
      <div className="absolute top-0 left-0 w-full h-20 bg-background rounded-b-[50%]"></div>
      
      <div className="container mx-auto px-4 pt-10">
        <div className="text-center mb-16 scroll-animate">
          <h2 className="text-gradient-purple mb-4 text-4xl md:text-5xl font-bold">Features That Make Learning Fun</h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Our platform combines technology and community to create the most effective language practice experience.
          </p>
        </div>

        <div className="flex flex-col max-w-3xl mx-auto space-y-12">
          {featureCards.map((feature, index) => (
            <Card 
              key={index}
              className={`feature-card glass-morphism opacity-0 transform transition-all duration-700 ${index % 2 === 0 ? 'translate-x-8' : '-translate-x-8'} hover:translate-y-0 hover:translate-x-0`}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-6">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full glass-morphism shrink-0 ${feature.glowClass}`}>
                    <feature.icon className={`h-8 w-8 text-${feature.color}`} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2 text-gradient-purple">{feature.title}</h3>
                    <p className="text-gray-300">{feature.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-20 glass-morphism rounded-xl p-8 max-w-4xl mx-auto opacity-0 transform translate-y-12 transition-all duration-700 feature-card">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-4 text-gradient-purple">How It Works</h3>
              <ol className="space-y-6">
                <li className="flex gap-4 items-start">
                  <span className="bg-neon-purple text-white w-8 h-8 rounded-full flex items-center justify-center shrink-0 glow-purple">1</span>
                  <p className="text-gray-300">Create a free account in seconds</p>
                </li>
                <li className="flex gap-4 items-start">
                  <span className="bg-neon-pink text-white w-8 h-8 rounded-full flex items-center justify-center shrink-0 glow-pink">2</span>
                  <p className="text-gray-300">Choose languages you speak and want to practice</p>
                </li>
                <li className="flex gap-4 items-start">
                  <span className="bg-neon-blue text-white w-8 h-8 rounded-full flex items-center justify-center shrink-0 glow-blue">3</span>
                  <p className="text-gray-300">Join topic-based rooms or create your own</p>
                </li>
                <li className="flex gap-4 items-start">
                  <span className="bg-neon-purple text-white w-8 h-8 rounded-full flex items-center justify-center shrink-0 glow-purple">4</span>
                  <p className="text-gray-300">Start speaking with people from around the world</p>
                </li>
              </ol>
            </div>
            <div className="rounded-lg overflow-hidden hover-scale">
              <img 
                src="https://placehold.co/600x400/1A1F2C/FFFFFF/png?text=How+It+Works" 
                alt="Platform demonstration" 
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
