import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import yellowCharacter from "@/assets/yellow-character-colored.png";
import elizaText from "@/assets/eliza-text.png";

export default function Onboarding() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { toast } = useToast();
    const [age, setAge] = useState("");
    const [language, setLanguage] = useState("en");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!age) {
            toast({
                title: "Age required",
                description: "Please enter your age to continue.",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);

        // Simulate API call / Persistence
        setTimeout(() => {
            localStorage.setItem("aula_onboarding_completed", "true");
            localStorage.setItem("aula_user_age", age);
            localStorage.setItem("aula_user_language", language);

            toast({
                title: "All set!",
                description: "Your personalized learning journey begins now.",
            });

            setIsLoading(false);
            navigate("/app", { replace: true });
        }, 800);
    };

    return (
        <div className="min-h-screen bg-eliza-yellow flex items-center justify-center p-4 relative overflow-hidden">
            {/* Character decorations */}
            <div className="absolute bottom-0 left-8 hidden lg:block animate-fade-in">
                <img
                    src={yellowCharacter}
                    alt="Yellow Character"
                    className="w-48 h-48 object-contain"
                />
            </div>

            <div className="absolute top-12 right-12 hidden lg:block animate-fade-in">
                <img
                    src={yellowCharacter}
                    alt="Yellow Character"
                    className="w-32 h-32 object-contain opacity-60"
                />
            </div>

            <div className="w-full max-w-md relative z-10 animate-scale-in">
                <div className="text-center mb-8">
                    <img
                        src={elizaText}
                        alt="ELIZA"
                        className="w-48 mx-auto mb-4"
                    />
                    <h1 className="font-brand text-2xl md:text-3xl font-bold text-black">
                        Welcome, {user?.first_name || "Friend"}!
                    </h1>
                    <p className="text-gray-800 font-brand mt-2">
                        Let's get to know you better.
                    </p>
                </div>

                <div className="bg-white rounded-3xl p-8 shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="font-brand font-semibold text-gray-700">How old are you?</label>
                            <Input
                                type="number"
                                placeholder="Enter your age"
                                value={age}
                                onChange={(e) => setAge(e.target.value)}
                                min="5"
                                max="100"
                                className="bg-white border border-gray-300 text-gray-900 font-brand rounded-xl h-14 px-6 focus:border-eliza-yellow focus-visible:ring-0 focus-visible:ring-offset-0"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="font-brand font-semibold text-gray-700">Preferred Language</label>
                            <Select value={language} onValueChange={setLanguage}>
                                <SelectTrigger className="w-full h-14 rounded-xl border-gray-300 font-brand focus:ring-0 focus:ring-offset-0 focus:border-eliza-yellow">
                                    <SelectValue placeholder="Select a language" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="en">English</SelectItem>
                                    <SelectItem value="es">Spanish</SelectItem>
                                    <SelectItem value="fr">French</SelectItem>
                                    <SelectItem value="de">German</SelectItem>
                                    <SelectItem value="it">Italian</SelectItem>
                                    <SelectItem value="sq">Albanian</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-eliza-yellow text-black hover:bg-eliza-yellow/90 font-brand font-bold text-[15px] rounded-xl h-14 transition-all hover:scale-105 disabled:opacity-50 mt-4"
                        >
                            {isLoading ? "Setting up..." : "Continue to Dashboard"}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
