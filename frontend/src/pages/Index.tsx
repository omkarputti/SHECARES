import { Link } from "react-router-dom";
import { Heart, Calendar, Brain, Shield, Bot, MapPin, Watch, Apple, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navigation from "@/components/Navigation";

const Index = () => {
  const features = [
    {
      icon: Heart,
      title: "Pregnancy Care",
      description: "Due date calculator, trimester tips, and AI pregnancy assistant",
      link: "/dashboard",
      color: "bg-primary",
    },
    {
      icon: Calendar,
      title: "Period Tracking",
      description: "Cycle prediction, mood support, and health recommendations",
      link: "/dashboard",
      color: "bg-accent",
    },
    {
      icon: Brain,
      title: "Mental Wellness",
      description: "Smart routing, therapist support, and coping strategies",
      link: "/dashboard",
      color: "bg-primary-light",
    },
    {
      icon: Shield,
      title: "Emergency Safety",
      description: "SOS alerts, location sharing, and nearby help finder",
      link: "#emergency",
      color: "bg-destructive",
    },
    {
      icon: Users,
      title: "Caretaker",
      description: "SOS alerts, location sharing, and nearby help finder",
      link: "/dashboard",
      color: "bg-destructive",
    },
    {
      icon: Apple,
      title: "Food Analyzer",
      description: "SOS alerts, location sharing, and nearby help finder",
      link: "/dashboard",
      color: "bg-destructive",
    },
    {
      icon: Watch,
      title: "Wearable IOT",
      description: "SOS alerts, location sharing, and nearby help finder",
      link: "/dashboard",
      color: "bg-destructive",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navigation />
      
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom duration-700">
          <div className="inline-block">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-primary flex items-center justify-center shadow-strong mb-6">
              <Heart className="w-10 h-10 text-primary-foreground" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-foreground leading-tight">
            Your Complete
            <span className="block text-primary">Wellness Companion</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Comprehensive support for pregnancy, periods, and mental health—all in one safe, 
            supportive space with 24/7 emergency assistance.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link to="/dashboard">
              <Button variant="hero" size="lg" className="gap-2 min-w-48">
                <Heart className="w-5 h-5" />
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Link key={index} to={feature.link}>
                <Card className="group hover:shadow-strong transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary cursor-pointer h-full">
                  <CardHeader>
                    <div className={`w-14 h-14 rounded-xl ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-soft`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <CardTitle className="text-2xl text-foreground">
                      {feature.title}
                    </CardTitle>
                    <CardDescription className="text-base text-muted-foreground">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="ghost" className="gap-2 group-hover:gap-4 transition-all">
                      Explore
                      <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Trust Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto bg-card rounded-2xl p-8 md:p-12 shadow-medium border border-border">
          <div className="text-center space-y-6">
            <div className="flex justify-center gap-8 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                <span className="text-sm">Privacy Protected</span>
              </div>
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-primary" />
                <span className="text-sm">AI-Powered</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                <span className="text-sm">24/7 Emergency</span>
              </div>
            </div>
            
            <h2 className="text-3xl font-bold text-foreground">
              Safe, Private, Always There for You
            </h2>
            
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Your health data is encrypted and secure. Our AI assistants provide personalized support 
              while emergency features ensure you're never alone in a crisis.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-16 border-t border-border">
        <div className="text-center text-muted-foreground text-sm">
          <p>© 2025 SheHelps. Your health, your privacy, our priority.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
