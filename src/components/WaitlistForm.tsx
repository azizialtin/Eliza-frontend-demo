import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api";

const WaitlistForm = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !name || !message) {
      toast({
        title: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.submitContact({ name, email, message });
      
      toast({
        title: "Message sent!",
        description: "We'll get back to you soon.",
      });
      
      setEmail("");
      setName("");
      setMessage("");
    } catch (error) {
      toast({
        title: "Failed to send message",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
      <Input
        type="text"
        placeholder="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        disabled={isSubmitting}
        className="bg-white border border-gray-300 text-gray-900 placeholder:text-gray-500 font-brand rounded-xl h-14 px-6 focus:border-eliza-orange focus-visible:ring-0 focus-visible:ring-offset-0"
      />
      <Input
        type="email"
        placeholder="Your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={isSubmitting}
        className="bg-white border border-gray-300 text-gray-900 placeholder:text-gray-500 font-brand rounded-xl h-14 px-6 focus:border-eliza-orange focus-visible:ring-0 focus-visible:ring-offset-0"
      />
      <Textarea
        placeholder="Your message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        disabled={isSubmitting}
        className="bg-white border border-gray-300 text-gray-900 placeholder:text-gray-500 font-brand rounded-xl min-h-[120px] px-6 py-4 focus:border-eliza-orange focus-visible:ring-0 focus-visible:ring-offset-0 resize-none"
      />
      <Button 
        type="submit" 
        disabled={isSubmitting}
        className="w-full bg-eliza-orange text-black hover:bg-eliza-orange/90 font-brand font-semibold text-[15px] rounded-xl h-14 disabled:opacity-50"
      >
        {isSubmitting ? "Sending..." : "Send Message"}
      </Button>
    </form>
  );
};

export default WaitlistForm;
