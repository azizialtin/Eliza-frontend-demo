import FloatingMenu from "@/components/FloatingMenu";
import WaitlistForm from "@/components/WaitlistForm";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { FlaskConical, GraduationCap, Video, Smartphone } from "lucide-react";
import elizaText from "@/assets/eliza-text.png";
import redCharacter from "@/assets/red-character.png";
import yellowCharacter from "@/assets/yellow-character-colored.png";
import purpleCharacter from "@/assets/purple-character.png";
import greenCharacter from "@/assets/green-character.png";
import blueCharacter from "@/assets/blue-character.png";
import orangeCharacter from "@/assets/orange-character.png";

const Index = () => {
  return (
    <div className="relative h-screen overflow-y-scroll snap-y snap-mandatory scroll-smooth">
      <FloatingMenu />
      
      {/* Section 1: Hero - Red (40/60 split) */}
      <section 
        data-section="0"
        className="h-screen flex flex-col snap-start"
      >
        {/* Top colored section - 40% on mobile */}
        <div className="h-[40vh] md:h-[55vh] lg:h-[60vh] bg-eliza-red flex items-center justify-center relative overflow-hidden">
          <div className="w-full max-w-[95%] md:max-w-[90%] lg:max-w-[80%] xl:max-w-[70%] mx-auto px-4 md:px-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-2 md:gap-0">
              <div className="flex-1 text-center md:text-left">
                <img 
                  src={elizaText} 
                  alt="ELIZA" 
                  className="w-32 sm:w-40 md:w-64 lg:w-80 mb-1 md:mb-3 mx-auto md:mx-0"
                />
                <p className="font-brand text-[12px] sm:text-[13px] md:text-[15px] text-black">
                  Learning platform powered by AI
                </p>
              </div>
              <div className="flex-shrink-0">
                <img 
                  src={redCharacter} 
                  alt="Red Character" 
                  className="w-24 h-24 sm:w-32 sm:h-32 md:w-48 md:h-48 lg:w-64 lg:h-64 object-contain"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom white section - 60% on mobile */}
        <div className="h-[60vh] md:h-[45vh] lg:h-[40vh] bg-white flex items-start md:items-center justify-center pt-8 md:pt-0">
          <div className="w-full max-w-[90%] md:max-w-[90%] lg:max-w-[80%] xl:max-w-[70%] mx-auto px-2 md:px-6">
            <h1 className="font-brand text-[18px] sm:text-[22px] md:text-[28px] lg:text-[30px] font-bold text-gray-900 mb-4 md:mb-6">
              ELIZA - Learning platform powered by AI
            </h1>
            <p className="font-brand text-[13px] sm:text-[14px] md:text-[15px] text-gray-800 leading-relaxed mb-6 md:mb-8">
              Eliza is a learning platform powered by AI, designed to make education smarter, more visual, and deeply engaging. It helps students not only find answers, but truly understand them. Whether it's solving a math equation, exploring science concepts, or visualizing creative ideas, Eliza transforms complex knowledge into interactive, animated learning experiences.
            </p>
            <Link to="/auth">
              <Button 
                size="lg" 
                className="bg-eliza-red text-white hover:bg-eliza-red/90 font-brand font-semibold text-[14px] md:text-[15px] px-6 md:px-8 py-4 md:py-6 w-full sm:w-auto"
              >
                Start Learning Today
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Section 2: What is Eliza - Yellow */}
      <section 
        data-section="1"
        className="h-screen flex flex-col snap-start"
      >
        {/* Top colored section - 40% on mobile */}
        <div className="h-[40vh] md:h-[55vh] lg:h-[60vh] bg-eliza-yellow flex items-center justify-center relative overflow-hidden">
          <div className="w-full max-w-[95%] md:max-w-[90%] lg:max-w-[80%] xl:max-w-[70%] mx-auto px-4 md:px-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-2 md:gap-0">
              <div className="flex-1 text-center md:text-left">
                <h2 className="font-brand text-[32px] sm:text-[42px] md:text-[60px] lg:text-[80px] font-bold text-black leading-none">
                  What is ELIZA?
                </h2>
              </div>
              <div className="flex-shrink-0">
                <img 
                  src={yellowCharacter} 
                  alt="Yellow Character" 
                  className="w-24 h-24 sm:w-32 sm:h-32 md:w-48 md:h-48 lg:w-56 lg:h-56 object-contain"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom white section - 60% on mobile */}
        <div className="h-[60vh] md:h-[45vh] lg:h-[40vh] bg-white flex items-start md:items-center justify-center pt-8 md:pt-0">
          <div className="w-full max-w-[90%] md:max-w-[90%] lg:max-w-[80%] xl:max-w-[70%] mx-auto px-2 md:px-6">
            <p className="font-brand text-[13px] sm:text-[14px] md:text-[15px] text-gray-800 leading-relaxed">
              ELIZA makes education <span className="font-bold">smarter, more visual, and deeply engaging</span>. 
              We transform how students learn by combining AI-powered explanations with interactive visual content. 
              No more passive reading—experience education that comes alive through personalized guidance and 
              dynamic animations that help you truly understand complex concepts.
            </p>
          </div>
        </div>
      </section>

      {/* Section 3: Innovation - Purple */}
      <section 
        data-section="2"
        className="h-screen flex flex-col snap-start"
      >
        {/* Top colored section - 40% on mobile */}
        <div className="h-[40vh] md:h-[55vh] lg:h-[60vh] bg-eliza-purple flex items-center justify-center relative overflow-hidden">
          <div className="w-full max-w-[95%] md:max-w-[90%] lg:max-w-[80%] xl:max-w-[70%] mx-auto px-4 md:px-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-2 md:gap-0">
              <div className="flex-1 text-center md:text-left">
                <h2 className="font-brand text-[28px] sm:text-[38px] md:text-[60px] lg:text-[80px] font-bold text-black leading-none">
                  How We&apos;re Different
                </h2>
              </div>
              <div className="flex-shrink-0">
                <img 
                  src={purpleCharacter} 
                  alt="Purple Character" 
                  className="w-24 h-24 sm:w-32 sm:h-32 md:w-48 md:h-48 lg:w-56 lg:h-56 object-contain"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom white section - 60% on mobile */}
        <div className="h-[60vh] md:h-[45vh] lg:h-[40vh] bg-white flex items-start md:items-center justify-center overflow-y-auto pt-6 md:pt-0">
          <div className="w-full max-w-[90%] md:max-w-[90%] lg:max-w-[80%] xl:max-w-[70%] mx-auto px-2 md:px-6 py-6 md:py-0">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
              <div className="bg-[#fafafa] rounded-lg p-3 md:p-6 transition-colors duration-300 hover:bg-[hsl(var(--eliza-purple)/0.15)] cursor-pointer">
                <div className="flex items-center gap-2 md:gap-4 mb-1 md:mb-3">
                  <FlaskConical className="w-4 h-4 md:w-6 md:h-6 text-eliza-purple flex-shrink-0" />
                  <h3 className="font-brand text-[14px] md:text-[18px] lg:text-[20px] font-semibold text-gray-900">
                    Test & Exercise Generation
                  </h3>
                </div>
                <p className="font-brand text-[12px] sm:text-[13px] md:text-[15px] text-gray-800 ml-6 md:ml-10">
                  AI creates personalized exercises and practice tests tailored to your learning pace and style.
                </p>
              </div>
              
              <div className="bg-[#fafafa] rounded-lg p-3 md:p-6 transition-colors duration-300 hover:bg-[hsl(var(--eliza-blue)/0.15)] cursor-pointer">
                <div className="flex items-center gap-2 md:gap-4 mb-1 md:mb-3">
                  <GraduationCap className="w-4 h-4 md:w-6 md:h-6 text-eliza-blue flex-shrink-0" />
                  <h3 className="font-brand text-[14px] md:text-[18px] lg:text-[20px] font-semibold text-gray-900">
                    AI Teacher Guidance
                  </h3>
                </div>
                <p className="font-brand text-[12px] sm:text-[13px] md:text-[15px] text-gray-800 ml-6 md:ml-10">
                  Get instant corrections, explanations, and step-by-step guidance from your AI teacher.
                </p>
              </div>
              
              <div className="bg-[#fafafa] rounded-lg p-3 md:p-6 transition-colors duration-300 hover:bg-[hsl(var(--eliza-red)/0.15)] cursor-pointer">
                <div className="flex items-center gap-2 md:gap-4 mb-1 md:mb-3">
                  <Video className="w-4 h-4 md:w-6 md:h-6 text-eliza-red flex-shrink-0" />
                  <h3 className="font-brand text-[14px] md:text-[18px] lg:text-[20px] font-semibold text-gray-900">
                    Video Explanations
                  </h3>
                </div>
                <p className="font-brand text-[12px] sm:text-[13px] md:text-[15px] text-gray-800 ml-6 md:ml-10">
                  Complex concepts come alive with AI-generated visual explanations and animations.
                </p>
              </div>
              
              <div className="bg-[#fafafa] rounded-lg p-3 md:p-6 transition-colors duration-300 hover:bg-[hsl(var(--eliza-green)/0.15)] cursor-pointer">
                <div className="flex items-center gap-2 md:gap-4 mb-1 md:mb-3">
                  <Smartphone className="w-4 h-4 md:w-6 md:h-6 text-eliza-green flex-shrink-0" />
                  <h3 className="font-brand text-[14px] md:text-[18px] lg:text-[20px] font-semibold text-gray-900">
                    Offline Learning
                  </h3>
                </div>
                <p className="font-brand text-[12px] sm:text-[13px] md:text-[15px] text-gray-800 ml-6 md:ml-10">
                  Access quality education anywhere, even in remote areas without internet connection.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: For Students & Schools - Green */}
      <section 
        data-section="3"
        className="h-screen flex flex-col snap-start"
      >
        {/* Top colored section - 40% on mobile */}
        <div className="h-[40vh] md:h-[55vh] lg:h-[60vh] bg-eliza-green flex items-center justify-center relative overflow-hidden">
          <div className="w-full max-w-[95%] md:max-w-[90%] lg:max-w-[80%] xl:max-w-[70%] mx-auto px-4 md:px-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-2 md:gap-0">
              <div className="flex-1 text-center md:text-left">
                <h2 className="font-brand text-[28px] sm:text-[38px] md:text-[60px] lg:text-[80px] font-bold text-black leading-none">
                  Built For Everyone
                </h2>
              </div>
              <div className="flex-shrink-0">
                <img 
                  src={greenCharacter} 
                  alt="Green Character" 
                  className="w-24 h-24 sm:w-32 sm:h-32 md:w-48 md:h-48 lg:w-56 lg:h-56 object-contain"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom white section - 60% on mobile */}
        <div className="h-[60vh] md:h-[45vh] lg:h-[40vh] bg-white flex items-start md:items-center justify-center overflow-y-auto pt-6 md:pt-0">
          <div className="w-full max-w-[90%] md:max-w-[90%] lg:max-w-[80%] xl:max-w-[70%] mx-auto px-2 md:px-6 py-6 md:py-0">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-8">
              <div className="bg-[#fafafa] rounded-lg p-3 md:p-8">
                <h3 className="font-brand text-[16px] md:text-[20px] font-semibold text-gray-900 mb-2 md:mb-4">
                  For Students
                </h3>
                <p className="font-brand text-[12px] sm:text-[13px] md:text-[15px] text-gray-800 mb-2 md:mb-6">
                  Upload your own materials, learn at your own pace, and get personalized AI guidance.
                </p>
                <ul className="font-brand text-[12px] sm:text-[13px] md:text-[15px] text-gray-800 space-y-1.5 md:space-y-2">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-eliza-green flex-shrink-0"></span>
                    Upload any learning material
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-eliza-green flex-shrink-0"></span>
                    Track your progress
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-eliza-green flex-shrink-0"></span>
                    Get instant help 24/7
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-eliza-green flex-shrink-0"></span>
                    Visual explanations
                  </li>
                </ul>
              </div>
              
              <div className="bg-[#fafafa] rounded-lg p-3 md:p-8">
                <h3 className="font-brand text-[16px] md:text-[20px] font-semibold text-gray-900 mb-2 md:mb-4">
                  For Schools
                </h3>
                <p className="font-brand text-[12px] sm:text-[13px] md:text-[15px] text-gray-800 mb-2 md:mb-6">
                  Register your institution, manage classes, and empower your students with AI.
                </p>
                <ul className="font-brand text-[12px] sm:text-[13px] md:text-[15px] text-gray-800 space-y-1.5 md:space-y-2">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-eliza-green flex-shrink-0"></span>
                    Class management
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-eliza-green flex-shrink-0"></span>
                    Student progress tracking
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-eliza-green flex-shrink-0"></span>
                    Curriculum integration
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-eliza-green flex-shrink-0"></span>
                    Multi-language support
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: How It Works - Blue */}
      <section 
        data-section="4"
        className="h-screen flex flex-col snap-start"
      >
        {/* Top colored section - 40% on mobile */}
        <div className="h-[40vh] md:h-[55vh] lg:h-[60vh] bg-eliza-blue flex items-center justify-center relative overflow-hidden">
          <div className="w-full max-w-[95%] md:max-w-[90%] lg:max-w-[80%] xl:max-w-[70%] mx-auto px-4 md:px-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-2 md:gap-0">
              <div className="flex-1 text-center md:text-left">
                <h2 className="font-brand text-[32px] sm:text-[42px] md:text-[60px] lg:text-[80px] font-bold text-white leading-none">
                  How It Works
                </h2>
              </div>
              <div className="flex-shrink-0">
                <img 
                  src={blueCharacter} 
                  alt="Blue Character" 
                  className="w-24 h-24 sm:w-32 sm:h-32 md:w-48 md:h-48 lg:w-56 lg:h-56 object-contain"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom white section - 60% on mobile */}
        <div className="h-[60vh] md:h-[45vh] lg:h-[40vh] bg-white flex items-start md:items-center justify-center pt-8 md:pt-0">
          <div className="w-full max-w-[90%] md:max-w-[90%] lg:max-w-[80%] xl:max-w-[70%] mx-auto px-2 md:px-6">
            
            <div className="space-y-3 md:space-y-6 lg:space-y-8">
              <div className="flex items-start gap-2 md:gap-4 lg:gap-6">
                <div className="font-brand text-2xl sm:text-3xl md:text-5xl font-bold text-eliza-blue flex-shrink-0">1</div>
                <div>
                  <h3 className="font-brand text-[14px] sm:text-[16px] md:text-[20px] font-semibold text-gray-900 mb-1 md:mb-2">Upload Your Material</h3>
                  <p className="font-brand text-[12px] sm:text-[13px] md:text-[15px] text-gray-800">
                    Upload textbooks, notes, or any learning content in your preferred language.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-2 md:gap-4 lg:gap-6">
                <div className="font-brand text-2xl sm:text-3xl md:text-5xl font-bold text-eliza-blue flex-shrink-0">2</div>
                <div>
                  <h3 className="font-brand text-[14px] sm:text-[16px] md:text-[20px] font-semibold text-gray-900 mb-1 md:mb-2">AI Generates Content</h3>
                  <p className="font-brand text-[12px] sm:text-[13px] md:text-[15px] text-gray-800">
                    Our AI creates summaries, exercises, tests, and visual explanations tailored to you.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-2 md:gap-4 lg:gap-6">
                <div className="font-brand text-2xl sm:text-3xl md:text-5xl font-bold text-eliza-blue flex-shrink-0">3</div>
                <div>
                  <h3 className="font-brand text-[14px] sm:text-[16px] md:text-[20px] font-semibold text-gray-900 mb-1 md:mb-2">Learn & Progress</h3>
                  <p className="font-brand text-[12px] sm:text-[13px] md:text-[15px] text-gray-800">
                    Practice, get feedback, watch explanations, and track your progress—all in one place.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 6: CTA - Orange */}
      <section 
        data-section="5"
        className="h-screen flex flex-col snap-start"
      >
        {/* Top colored section - 40% on mobile */}
        <div className="h-[40vh] md:h-[55vh] lg:h-[60vh] bg-eliza-orange flex items-center justify-center relative overflow-hidden">
          <div className="w-full max-w-[95%] md:max-w-[90%] lg:max-w-[80%] xl:max-w-[70%] mx-auto px-4 md:px-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-2 md:gap-0">
              <div className="flex-1 text-center md:text-left">
                <h2 className="font-brand text-[32px] sm:text-[42px] md:text-[60px] lg:text-[80px] font-bold text-black leading-none">
                  Get Started
                </h2>
              </div>
              <div className="flex-shrink-0">
                <img 
                  src={orangeCharacter} 
                  alt="Orange Character" 
                  className="w-24 h-24 sm:w-32 sm:h-32 md:w-48 md:h-48 lg:w-56 lg:h-56 object-contain"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom white section - 60% on mobile */}
        <div className="h-[60vh] md:h-[45vh] lg:h-[40vh] bg-white flex items-start justify-center pt-6 md:pt-8 overflow-y-auto">
          <div className="w-full max-w-[90%] md:max-w-[90%] lg:max-w-[80%] xl:max-w-[70%] mx-auto px-2 md:px-6 pb-8">
            <p className="font-brand text-[13px] sm:text-[14px] md:text-[15px] text-gray-800 mb-4 md:mb-6 text-center md:text-left">
              Join our waitlist and be the first to experience the future of education.
            </p>
            
            <WaitlistForm />
            
            <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-3 sm:gap-4 mt-4 md:mt-6">
              <p className="font-brand text-[12px] sm:text-[13px] md:text-[14px] text-gray-800 text-center md:text-left">
                Questions? <a href="#contact" className="underline font-semibold hover:text-eliza-orange transition-colors">Get in touch</a>
              </p>
              <span className="hidden sm:inline text-gray-400">|</span>
              <a 
                href="/auth" 
                className="font-brand text-[12px] sm:text-[13px] md:text-[14px] text-eliza-orange font-semibold hover:underline transition-colors"
              >
                Already have access? Login →
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
