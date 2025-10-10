import { useState } from "react";
import { Calendar, Heart, MessageCircle, Phone, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navigation from "@/components/Navigation";
import { toast } from "sonner";

const Periods = () => {
  const [lastPeriodDate, setLastPeriodDate] = useState("");
  const [cycleLength, setCycleLength] = useState("28");
  const [nextPeriod, setNextPeriod] = useState<Date | null>(null);

  const predictNextPeriod = () => {
    if (!lastPeriodDate) {
      toast.error("Please enter your last period date");
      return;
    }

    const lastDate = new Date(lastPeriodDate);
    const next = new Date(lastDate);
    next.setDate(next.getDate() + parseInt(cycleLength));
    
    setNextPeriod(next);
    toast.success("Next period predicted!");
  };

  const hygieneTips = [
    "Change pads/tampons every 4-6 hours to prevent infections",
    "Wash the genital area with warm water only, avoid harsh soaps",
    "Choose breathable cotton underwear during your period",
    "Stay hydrated to help reduce bloating and cramps",
    "Track your flow patterns to understand what's normal for you",
    "Dispose of sanitary products properly, never flush them"
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12 space-y-4 animate-in fade-in slide-in-from-top">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-accent shadow-medium">
            <Calendar className="w-8 h-8 text-accent-foreground" />
          </div>
          <h1 className="text-4xl font-bold text-foreground">Period Tracking</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Track your cycle, get health tips, and find support when you need it
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {/* Cycle Predictor */}
          <Card className="shadow-soft border-2 animate-in fade-in slide-in-from-left">
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-accent" />
                <CardTitle>Cycle Predictor</CardTitle>
              </div>
              <CardDescription>
                Predict your next period based on your cycle history
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="last-period">Last Period Start Date</Label>
                <Input
                  id="last-period"
                  type="date"
                  value={lastPeriodDate}
                  onChange={(e) => setLastPeriodDate(e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cycle-length">Average Cycle Length (days)</Label>
                <Input
                  id="cycle-length"
                  type="number"
                  value={cycleLength}
                  onChange={(e) => setCycleLength(e.target.value)}
                  min="21"
                  max="35"
                  className="w-full"
                />
              </div>

              <Button onClick={predictNextPeriod} className="w-full" variant="accent">
                <Calendar className="w-4 h-4 mr-2" />
                Predict Next Period
              </Button>

              {nextPeriod && (
                <div className="p-6 bg-accent/10 rounded-xl border-2 border-accent space-y-3 animate-in fade-in">
                  <p className="text-sm text-muted-foreground">Your next period is expected:</p>
                  <p className="text-3xl font-bold text-accent">
                    {nextPeriod.toLocaleDateString('en-US', { 
                      month: 'long', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    We'll send you a reminder 2 days before
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Hygiene Tips */}
          <Card className="shadow-soft border-2 animate-in fade-in slide-in-from-right">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-primary" />
                <CardTitle>Hygiene & Health Tips</CardTitle>
              </div>
              <CardDescription>
                Essential care practices during your period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {hygieneTips.map((tip, index) => (
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

          {/* Mood Support Chatbot */}
          <Card className="shadow-soft border-2 animate-in fade-in slide-in-from-left">
            <CardHeader>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-primary" />
                <CardTitle>Mood Support Assistant</CardTitle>
              </div>
              <CardDescription>
                Get emotional support and coping strategies during mood swings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/30 rounded-xl p-8 text-center space-y-4">
                <MessageCircle className="w-16 h-16 mx-auto text-primary" />
                <p className="text-foreground font-medium">
                  AI mood support coming soon
                </p>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Chat with our AI assistant for coping strategies, relaxation techniques, 
                  and supportive guidance during difficult days.
                </p>
                <Button variant="default" disabled>
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Start Chat (Coming Soon)
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Doctor Connect */}
          <Card className="shadow-soft border-2 animate-in fade-in slide-in-from-right">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-primary" />
                <CardTitle>Doctor Connect</CardTitle>
              </div>
              <CardDescription>
                Quick access to medical professionals via telemedicine
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-primary/10 rounded-xl p-6 space-y-3">
                <Phone className="w-12 h-12 text-primary" />
                <h3 className="font-semibold text-foreground">Need Medical Advice?</h3>
                <p className="text-sm text-muted-foreground">
                  Connect with licensed healthcare providers for concerns about irregular cycles, 
                  severe pain, or unusual symptoms.
                </p>
              </div>
              <Button variant="default" className="w-full">
                <Phone className="w-4 h-4 mr-2" />
                Connect with Doctor
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Available 24/7 for urgent consultations
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Periods;
