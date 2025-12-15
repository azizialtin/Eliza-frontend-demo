import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import purpleCharacter from "@/assets/purple-character.png";
import elizaText from "@/assets/eliza-text.png";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"STUDENT" | "PARENT">("STUDENT");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { login, register, isAuthenticated, user } = useAuth(); // Destructure user
  const { toast } = useToast();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === "ADMIN") {
        navigate("/app/admin/dashboard", { replace: true });
        return;
      }
      if (user.role === "TEACHER") {
        navigate("/app/teacher/dashboard", { replace: true });
        return;
      }
      if (user.role === "PARENT") {
        navigate("/app/parent/dashboard", { replace: true });
        return;
      }

      // Default Student/User logic
      const hasOnboarded = localStorage.getItem("aula_onboarding_completed");
      if (hasOnboarded) {
        if (isLogin) {
          // If logging in, check if they have onboarded before
          const hasOnboarded = localStorage.getItem("aula_onboarding_completed");
          if (hasOnboarded) {
            navigate("/app", { replace: true });
          } else {
            navigate("/onboarding", { replace: true });
          }
        } else {
          // If registering, always go to onboarding
          navigate("/onboarding", { replace: true });
        }
      } else {
        navigate("/onboarding", { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate, isLogin]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast({
        title: "Missing Information",
        description: "Please enter both email and password",
        variant: "destructive",
      });
      return;
    }

    if (!isLogin && !name) {
      toast({
        title: "Missing Information",
        description: "Please enter your name",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
        toast({
          title: "Welcome back!",
          description: "Successfully logged in",
        });
      } else {
        await register(email, password, name, role);
        toast({
          title: "Welcome!",
          description: "Account created successfully",
        });
      }
      // Navigation is now handled by the useEffect based on isAuthenticated and user role
    } catch (error) {
      toast({
        title: isLogin ? "Login Failed" : "Registration Failed",
        description: error instanceof Error ? error.message : "Authentication failed",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-eliza-purple flex items-center justify-center p-4 relative overflow-hidden">
      {/* Purple character decoration */}
      <div className="absolute bottom-0 left-8 hidden lg:block animate-fade-in">
        <img
          src={purpleCharacter}
          alt="Purple Character"
          className="w-48 h-48 object-contain"
        />
      </div>

      {/* Right side character for balance */}
      <div className="absolute top-12 right-12 hidden lg:block animate-fade-in">
        <img
          src={purpleCharacter}
          alt="Purple Character"
          className="w-32 h-32 object-contain opacity-60"
        />
      </div>

      <div className="w-full max-w-md relative z-10 animate-scale-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <img
            src={elizaText}
            alt="ELIZA"
            className="w-48 mx-auto mb-4"
          />
          <h1 className="font-brand text-2xl md:text-3xl font-bold text-black">
            {isLogin ? "Welcome back!" : "Join Learning!"}
          </h1>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl p-8 shadow-2xl">
          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <div className="space-y-4 animate-in slide-in-from-top-4 fade-in duration-300">
                <Input
                  type="text"
                  placeholder="Your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-white border border-gray-300 text-gray-900 placeholder:text-gray-500 font-brand rounded-xl h-14 px-6 focus:border-eliza-purple focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setRole("STUDENT")}
                    className={`flex-1 h-12 rounded-xl border font-brand font-medium transition-all ${role === "STUDENT" ? "bg-eliza-purple text-white border-eliza-purple" : "bg-white text-gray-600 border-gray-300 hover:border-eliza-purple"}`}
                  >
                    Student
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("PARENT")}
                    className={`flex-1 h-12 rounded-xl border font-brand font-medium transition-all ${role === "PARENT" ? "bg-eliza-purple text-white border-eliza-purple" : "bg-white text-gray-600 border-gray-300 hover:border-eliza-purple"}`}
                  >
                    Parent
                  </button>
                </div>
              </div>
            )}

            <Input
              type="email"
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white border border-gray-300 text-gray-900 placeholder:text-gray-500 font-brand rounded-xl h-14 px-6 focus:border-eliza-purple focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <Input
              type="password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-white border border-gray-300 text-gray-900 placeholder:text-gray-500 font-brand rounded-xl h-14 px-6 focus:border-eliza-purple focus-visible:ring-0 focus-visible:ring-offset-0"
            />

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-eliza-purple text-white hover:bg-eliza-purple/90 font-brand font-semibold text-[15px] rounded-xl h-14 transition-all hover:scale-105 disabled:opacity-50 mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isLogin ? "Logging in..." : "Creating Account..."}
                </>
              ) : (
                isLogin ? "Start Learning!" : "Create Account"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setEmail("");
                setPassword("");
                setName("");
              }}
              className="text-gray-500 hover:text-eliza-purple font-brand text-sm transition-colors"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
