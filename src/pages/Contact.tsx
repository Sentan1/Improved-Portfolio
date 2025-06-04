import { ArrowLeft, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const Contact = () => {
  const navigate = useNavigate();

  const handleBackToPortfolio = () => {
    navigate("/");
  };

  return (
    <div 
      className="min-h-screen relative overflow-hidden bg-slate-900"
      style={{
        backgroundImage: `url('/Image/Background.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="absolute inset-0 bg-slate-900/70"></div>

      {/* Back Button */}
      <nav className="absolute top-8 left-8 z-50">
        <button 
          onClick={handleBackToPortfolio}
          className="flex items-center gap-2 text-slate-200 hover:text-slate-100 transition-colors group bg-slate-800/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-slate-600/50"
        >
          <ArrowLeft className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Portfolio</span>
        </button>
      </nav>

      {/* Contact Form */}
      <div className="relative z-10 container mx-auto px-6 py-20">
        <div className="max-w-2xl mx-auto">
          <div className="bg-slate-800/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-slate-700/50">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-100 to-slate-200 bg-clip-text text-transparent mb-6">
              Get In Touch
            </h1>

            <p className="text-slate-300 mb-8 leading-relaxed">
              I'd love to hear from you. Send me a message and I'll respond as soon as possible.
            </p>

            <form 
              action="https://formsubmit.co/sentrooper@gmail.com" 
              method="POST"
              className="space-y-6"
            >
              {/* Hidden settings */}
              <input type="hidden" name="_captcha" value="false" />
              <input type="hidden" name="_template" value="table" />
              <input type="hidden" name="_subject" value="New message from your portfolio!" />

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-slate-200">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    required
                    placeholder="Your name"
                    className="bg-slate-700/50 border-slate-600 text-slate-100 placeholder:text-slate-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-200">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="your@email.com"
                    className="bg-slate-700/50 border-slate-600 text-slate-100 placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject" className="text-slate-200">Subject</Label>
                <Input
                  id="subject"
                  name="subject"
                  type="text"
                  required
                  placeholder="What's this about?"
                  className="bg-slate-700/50 border-slate-600 text-slate-100 placeholder:text-slate-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="text-slate-200">Message</Label>
                <Textarea
                  id="message"
                  name="message"
                  required
                  rows={6}
                  placeholder="Your message..."
                  className="bg-slate-700/50 border-slate-600 text-slate-100 placeholder:text-slate-400 resize-none"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-slate-100 font-medium py-3 rounded-lg transition-all duration-300"
              >
                <Send className="w-4 h-4 mr-2" />
                Send Message
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
