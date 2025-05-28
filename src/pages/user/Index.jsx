import React, { useEffect } from 'react';
import Header from '../../components/index/Header';
import Hero from '../../components/index/Hero';
import Features from '../../components/index/Features';
import Comparison from '../../components/index/Comparison';
import Testimonials from '../../components/index/Testimonials';
import Premium from '../../components/index/Premium';
import Footer from '../../components/index/Footer';

const Index = () => {
  useEffect(() => {
    // Set title
    document.title = "SpeakLink - Connect Globally, Speak Fluently";
    
    // Initial animations
    const animateOnScroll = () => {
      const elements = document.querySelectorAll('.scroll-animate');
      
      elements.forEach((element) => {
        const rect = element.getBoundingClientRect();
        const isVisible = (rect.top <= window.innerHeight * 0.8);
        
        if (isVisible) {
          element.classList.add('animate-fade-in');
        }
      });
    };
    
    // Run once on load
    animateOnScroll();
    
    // Add scroll listener
    window.addEventListener('scroll', animateOnScroll);
    
    return () => {
      window.removeEventListener('scroll', animateOnScroll);
    };
  }, []);
  
  return (
    <div className="min-h-screen overflow-x-hidden">
      <Header />
      <main>
        <Hero />
        <Features />
        <Comparison />
        <Testimonials />
        <Premium />
      </main>
      <Footer />
    </div>
  );
};

export default Index;