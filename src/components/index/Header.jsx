import React, { useState, useEffect } from 'react';
import { Button } from "../ui/button";
import { Globe, Moon, Menu, X } from "lucide-react";
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'glass-morphism py-3 glow-purple' : 'py-5'
      }`}
    >
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-neon-blue via-neon-purple to-neon-pink glow-purple"></div>
          <span className="font-bold text-xl text-gradient-purple">TalkMate</span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#features" className="text-sm text-gray-300 hover:text-neon-purple transition-colors">Features</a>
          <a href="#comparison" className="text-sm text-gray-300 hover:text-neon-purple transition-colors">Comparison</a>
          <a href="#testimonials" className="text-sm text-gray-300 hover:text-neon-purple transition-colors">Testimonials</a>
          <a href="#premium" className="text-sm text-gray-300 hover:text-neon-purple transition-colors">Premium</a>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center space-x-3">
          <Button variant="ghost" size="icon" className="rounded-full glass-morphism hover:glow-blue transition-all">
            <Globe className="h-5 w-5 text-neon-blue" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full glass-morphism hover:glow-purple transition-all">
            <Moon className="h-5 w-5 text-neon-purple" />
          </Button>
          <Button onClick={() => navigate('/auth')} className="bg-neon-purple hover:bg-neon-purple/90 text-white hover:glow-purple transition-all">
            Sign In
          </Button>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-gray-300 hover:text-white"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden glass-morphism mt-3 py-4 px-6 animate-fade-in">
          <nav className="flex flex-col space-y-4">
            {['features', 'comparison', 'testimonials', 'premium'].map((section) => (
              <a
                key={section}
                href={`#${section}`}
                className="text-gray-300 hover:text-neon-purple transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {section.charAt(0).toUpperCase() + section.slice(1)}
              </a>
            ))}
            <div className="flex items-center space-x-3 pt-2">
              <Button variant="ghost" size="icon" className="rounded-full glass-morphism hover:glow-blue transition-all">
                <Globe className="h-5 w-5 text-neon-blue" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full glass-morphism hover:glow-purple transition-all">
                <Moon className="h-5 w-5 text-neon-purple" />
              </Button>
              <Button className="bg-neon-purple hover:bg-neon-purple/90 text-white hover:glow-purple transition-all">
                Sign In
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
