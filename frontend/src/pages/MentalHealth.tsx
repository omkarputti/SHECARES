import { Brain, Heart, Phone, MessageCircle, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navigation from "@/components/Navigation";

const MentalHealth = () => {
  const therapistResources = [
    {
      name: "National Suicide Prevention Lifeline",
      phone: "988",
      description: "24/7 crisis support in English and Spanish"
    },
    {
      name: "Crisis Text Line",
      phone: "Text HOME to 741741",
      description: "Free 24/7 support via text message"
    },
    {
      name: "SAMHSA Helpline",
      phone: "1-800-662-4357",
      description: "Mental health and substance abuse support"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12 space-y-4 animate-in fade-in slide-in-from-top">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary shadow-medium">
            <Brain className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold text-foreground">Mental Health Support</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Smart routing, professional support, and resources when you need them most
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {/* Smart Routing */}
          <Card className="shadow-soft border-2 animate-in fade-in slide-in-from-left">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary" />
                <CardTitle>Smart Health Routing</CardTitle>
              </div>
              <CardDescription>
                Get directed to the right support based on your needs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/30 rounded-xl p-6 space-y-4">
                <MessageCircle className="w-12 h-12 text-primary" />
                <h3 className="font-semibold text-foreground">Tell us what you're experiencing</h3>
                <p className="text-sm text-muted-foreground">
                  Our AI will help determine if your concerns are related to:
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span className="text-foreground">Period-related symptoms</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 rounded-full bg-accent" />
                    <span className="text-foreground">Pregnancy concerns</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 rounded-full bg-primary-light" />
                    <span className="text-foreground">General mental health</span>
                  </div>
                </div>
              </div>
              <Button variant="default" className="w-full">
                <MessageCircle className="w-4 h-4 mr-2" />
                Start Smart Assessment
              </Button>
            </CardContent>
          </Card>

          {/* Professional Support */}
          <Card className="shadow-soft border-2 animate-in fade-in slide-in-from-right">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-accent" />
                <CardTitle>Coping Strategies</CardTitle>
              </div>
              <CardDescription>
                Immediate techniques to help you feel better
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  "Deep breathing: Inhale for 4, hold for 4, exhale for 6",
                  "Ground yourself: Name 5 things you see, 4 you hear, 3 you touch",
                  "Progressive muscle relaxation starting from your toes",
                  "Write down three things you're grateful for today",
                  "Take a short walk outside or near a window",
                  "Listen to calming music or nature sounds"
                ].map((tip, index) => (
                  <div 
                    key={index} 
                    className="flex items-start gap-3 p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                  >
                    <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-accent text-xs font-bold">{index + 1}</span>
                    </div>
                    <p className="text-sm text-foreground">{tip}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Crisis Resources */}
          <Card className="shadow-soft border-2 lg:col-span-2 animate-in fade-in slide-in-from-bottom">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-primary" />
                <CardTitle>Professional Helplines</CardTitle>
              </div>
              <CardDescription>
                Free, confidential support available 24/7
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {therapistResources.map((resource, index) => (
                  <div 
                    key={index} 
                    className="bg-primary/5 rounded-xl p-6 border-2 border-primary/20 hover:border-primary/40 transition-colors space-y-3"
                  >
                    <Phone className="w-8 h-8 text-primary" />
                    <h3 className="font-semibold text-foreground">{resource.name}</h3>
                    <p className="text-2xl font-bold text-primary">{resource.phone}</p>
                    <p className="text-sm text-muted-foreground">{resource.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* When to Seek Help */}
          <Card className="shadow-soft border-2 lg:col-span-2 animate-in fade-in">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                <CardTitle>When to Seek Professional Help</CardTitle>
              </div>
              <CardDescription>
                It's important to reach out if you're experiencing any of these
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  "Persistent feelings of sadness or hopelessness lasting more than 2 weeks",
                  "Thoughts of self-harm or suicide",
                  "Severe anxiety that interferes with daily activities",
                  "Difficulty sleeping or sleeping too much for extended periods",
                  "Loss of interest in activities you once enjoyed",
                  "Significant changes in appetite or weight",
                  "Difficulty concentrating or making decisions",
                  "Feeling overwhelmed by daily responsibilities"
                ].map((sign, index) => (
                  <div 
                    key={index} 
                    className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg"
                  >
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <p className="text-sm text-foreground">{sign}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-6 bg-primary/10 rounded-xl border-2 border-primary">
                <p className="text-sm text-foreground text-center font-medium">
                  Remember: Seeking help is a sign of strength, not weakness. 
                  Your mental health matters, and support is always available.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MentalHealth;
