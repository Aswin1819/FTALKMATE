import React from 'react';
import { Button } from "../ui/button";
import { Globe, Moon, Twitter, Linkedin, ExternalLink } from "lucide-react";

const Footer = () => {
  return (
    <footer className="py-12 relative">
      <div className="container mx-auto px-4">
        {/* Main footer */}
        <div className="glass-morphism rounded-xl p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-neon-blue via-neon-purple to-neon-pink glow-purple"></div>
                <span className="font-bold text-xl text-gradient-purple">SpeakLink</span>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                Connect globally, speak fluently. Practice languages with real people from around the world.
              </p>
              <div className="flex space-x-3">
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-neon-purple/20 hover:text-neon-purple transition-all">
                  <Twitter className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-neon-blue/20 hover:text-neon-blue transition-all">
                  <Linkedin className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-neon-pink/20 hover:text-neon-pink transition-all">
                  <ExternalLink className="h-5 w-5" />
                </Button>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold text-white mb-4 text-gradient-purple">Platform</h4>
              <ul className="space-y-2">
                <li><a href="#features" className="text-gray-400 hover:text-neon-purple transition-colors">Features</a></li>
                <li><a href="#comparison" className="text-gray-400 hover:text-neon-purple transition-colors">How it works</a></li>
                <li><a href="#premium" className="text-gray-400 hover:text-neon-purple transition-colors">Pricing</a></li>
                <li><a href="#" className="text-gray-400 hover:text-neon-purple transition-colors">FAQ</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-white mb-4 text-gradient-purple">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-neon-purple transition-colors">About</a></li>
                <li><a href="#" className="text-gray-400 hover:text-neon-purple transition-colors">Careers</a></li>
                <li><a href="#" className="text-gray-400 hover:text-neon-purple transition-colors">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-neon-purple transition-colors">Press kit</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-white mb-4 text-gradient-purple">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-neon-purple transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-neon-purple transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-gray-400 hover:text-neon-purple transition-colors">Cookie Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-neon-purple transition-colors">GDPR</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/10 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-500 mb-4 md:mb-0">© {new Date().getFullYear()} SpeakLink. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="rounded-full glass-morphism hover:glow-blue transition-all">
                <Globe className="h-5 w-5 text-neon-blue" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full glass-morphism hover:glow-purple transition-all">
                <Moon className="h-5 w-5 text-neon-purple" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* CTA banner */}
        <div className="mt-16 glass-morphism rounded-xl p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-neon-purple/20 via-neon-pink/20 to-neon-blue/20"></div>
          
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-bold text-gradient-purple mb-2">Ready to start your language journey?</h3>
              <p className="text-gray-300">Join thousands of language learners around the world.</p>
            </div>
            <Button className="bg-neon-purple hover:bg-neon-purple/90 text-white glow-purple hover:glow-pink hover:scale-105 transition-all duration-300 whitespace-nowrap px-8 py-6 text-lg">
              Get Started — Free
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
