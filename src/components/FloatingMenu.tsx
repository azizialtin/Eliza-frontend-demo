import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const FloatingMenu = () => {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
      
      const scrollPosition = window.scrollY + window.innerHeight / 2;
      const sections = document.querySelectorAll('section[data-section]');
      
      sections.forEach((section, index) => {
        const top = (section as HTMLElement).offsetTop;
        const height = (section as HTMLElement).offsetHeight;
        
        if (scrollPosition >= top && scrollPosition < top + height) {
          setActiveSection(index);
        }
      });
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const sectionColors = [
    "#fc4242", // red
    "#efff3c", // yellow
    "#8f8efe", // purple
    "#baff7b", // green
    "#2a47d8", // blue
    "#fe9f1f", // orange
  ];

  const isDarkBg = [0, 2, 4].includes(activeSection); // red, purple, blue

  const handleNavClick = (sectionIndex: number) => {
    const sections = document.querySelectorAll('section[data-section]');
    sections[sectionIndex]?.scrollIntoView({ behavior: 'smooth' });
    setOpen(false);
  };

  return (
    <>
      {/* Floating Menu Button */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button
            className={`fixed top-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg hover:scale-110 ${
              scrolled 
                ? isDarkBg 
                  ? "bg-white text-gray-900" 
                  : "bg-gray-900 text-white"
                : "bg-white/90 backdrop-blur-sm text-gray-900"
            }`}
            style={{
              ...(scrolled && {
                boxShadow: `0 4px 20px ${sectionColors[activeSection]}40`
              })
            }}
          >
            <Menu className="w-6 h-6" />
          </button>
        </SheetTrigger>

        {/* Overlay Sidebar */}
        <SheetContent 
          side="right" 
          className="w-80 bg-white p-0"
        >
          <div className="flex flex-col h-full">
            {/* Navigation Links */}
            <div className="flex-1 p-8 pt-12 space-y-2">
              <button
                onClick={() => handleNavClick(0)}
                className="w-full text-left px-6 py-4 rounded-xl font-brand text-lg text-gray-900 hover:bg-eliza-red/10 transition-all duration-200 border-2 border-transparent group"
              >
                <span className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-eliza-red group-hover:scale-150 transition-transform"></span>
                  Home
                </span>
              </button>

              <button
                onClick={() => handleNavClick(1)}
                className="w-full text-left px-6 py-4 rounded-xl font-brand text-lg text-gray-900 hover:bg-eliza-yellow/10 transition-all duration-200 border-2 border-transparent group"
              >
                <span className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-eliza-yellow group-hover:scale-150 transition-transform"></span>
                  What is ELIZA
                </span>
              </button>

              <button
                onClick={() => handleNavClick(2)}
                className="w-full text-left px-6 py-4 rounded-xl font-brand text-lg text-gray-900 hover:bg-eliza-purple/10 transition-all duration-200 border-2 border-transparent group"
              >
                <span className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-eliza-purple group-hover:scale-150 transition-transform"></span>
                  Features
                </span>
              </button>

              <button
                onClick={() => handleNavClick(3)}
                className="w-full text-left px-6 py-4 rounded-xl font-brand text-lg text-gray-900 hover:bg-eliza-green/10 transition-all duration-200 border-2 border-transparent group"
              >
                <span className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-eliza-green group-hover:scale-150 transition-transform"></span>
                  Built For Everyone
                </span>
              </button>

              <button
                onClick={() => handleNavClick(4)}
                className="w-full text-left px-6 py-4 rounded-xl font-brand text-lg text-gray-900 hover:bg-eliza-blue/10 transition-all duration-200 border-2 border-transparent group"
              >
                <span className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-eliza-blue group-hover:scale-150 transition-transform"></span>
                  How It Works
                </span>
              </button>

              <button
                onClick={() => handleNavClick(5)}
                className="w-full text-left px-6 py-4 rounded-xl font-brand text-lg text-gray-900 hover:bg-eliza-orange/10 transition-all duration-200 border-2 border-transparent group"
              >
                <span className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-eliza-orange group-hover:scale-150 transition-transform"></span>
                  Get Started
                </span>
              </button>
            </div>

            {/* Footer CTA */}
            <div className="p-8 border-t border-gray-200">
              <Button 
                onClick={() => handleNavClick(5)}
                className="w-full bg-eliza-red text-white hover:bg-eliza-red/90 font-brand font-semibold text-lg py-6 rounded-xl transition-all duration-200"
              >
                Join Waitlist
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default FloatingMenu;
