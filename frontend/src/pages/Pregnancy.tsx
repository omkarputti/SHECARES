import { useState } from "react";
import { Calendar as CalendarIcon, Heart, MessageCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navigation from "@/components/Navigation";
import { toast } from "sonner";

const Pregnancy = () => {
  const [lmpDate, setLmpDate] = useState("");
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [trimester, setTrimester] = useState<number | null>(null);

  const calculateDueDate = () => {
    if (!lmpDate) {
      toast.error("Please enter your last menstrual period date");
      return;
    }

    const lmp = new Date(lmpDate);
    const due = new Date(lmp);
    due.setDate(due.getDate() + 280); // Add 40 weeks
    
    setDueDate(due);

    // Calculate trimester
    const today = new Date();
    const weeksPassed = Math.floor((today.getTime() - lmp.getTime()) / (7 * 24 * 60 * 60 * 1000));
    
    if (weeksPassed <= 13) setTrimester(1);
    else if (weeksPassed <= 26) setTrimester(2);
    else setTrimester(3);

    toast.success("Due date calculated!");
  };

  const getTrimesterTips = () => {
    const tips = {
      1: [
        "Take prenatal vitamins with folic acid daily",
        "Stay hydrated - aim for 8-10 glasses of water",
        "Gentle walks and light stretching are great",
        "Avoid raw fish, unpasteurized dairy, and deli meats",
        "Get plenty of rest - fatigue is normal"
      ],
      2: [
        "Continue prenatal vitamins and balanced nutrition",
        "Practice pelvic floor exercises (Kegels)",
        "Swimming and prenatal yoga are excellent",
        "Monitor baby movements - should feel kicks now",
        "Start planning your nursery and baby essentials"
      ],
      3: [
        "Eat smaller, frequent meals to ease discomfort",
        "Practice breathing techniques for labor",
        "Pack your hospital bag by week 35",
        "Stay active but listen to your body",
        "Attend childbirth classes with your partner"
      ]
    };

    return tips[trimester as keyof typeof tips] || [];
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12 space-y-4 animate-in fade-in slide-in-from-top">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-primary shadow-medium">
            <Heart className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold text-foreground">Pregnancy Care</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Track your journey, get personalized tips, and chat with PregBot anytime
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {/* Due Date Calculator */}
          <Card className="shadow-soft border-2 animate-in fade-in slide-in-from-left">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-primary" />
                <CardTitle>Due Date Calculator</CardTitle>
              </div>
              <CardDescription>
                Calculate your estimated delivery date based on your last menstrual period (LMP)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="lmp-date">Last Menstrual Period Date</Label>
                <Input
                  id="lmp-date"
                  type="date"
                  value={lmpDate}
                  onChange={(e) => setLmpDate(e.target.value)}
                  className="w-full"
                />
              </div>

              <Button onClick={calculateDueDate} className="w-full" variant="default">
                <CalendarIcon className="w-4 h-4 mr-2" />
                Calculate Due Date
              </Button>

              {dueDate && (
                <div className="p-6 bg-primary/10 rounded-xl border-2 border-primary space-y-3 animate-in fade-in">
                  <p className="text-sm text-muted-foreground">Your estimated due date:</p>
                  <p className="text-3xl font-bold text-primary">
                    {dueDate.toLocaleDateString('en-US', { 
                      month: 'long', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </p>
                  {trimester && (
                    <p className="text-sm text-foreground">
                      You're in your <span className="font-bold text-primary">Trimester {trimester}</span>
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pregnancy Tips */}
          <Card className="shadow-soft border-2 animate-in fade-in slide-in-from-right">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-accent" />
                <CardTitle>Trimester Tips</CardTitle>
              </div>
              <CardDescription>
                {trimester 
                  ? `Safe practices for your trimester ${trimester}`
                  : "Calculate your due date to see personalized tips"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {trimester ? (
                <div className="space-y-3">
                  {getTrimesterTips().map((tip, index) => (
                    <div 
                      key={index} 
                      className="flex items-start gap-3 p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                    >
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-primary text-xs font-bold">{index + 1}</span>
                      </div>
                      <p className="text-sm text-foreground">{tip}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Heart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Enter your LMP date to get personalized tips</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* PregBot Assistant */}
          <Card className="shadow-soft border-2 lg:col-span-2 animate-in fade-in slide-in-from-bottom">
            <CardHeader>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-primary" />
                <CardTitle>PregBot - Your Pregnancy Assistant</CardTitle>
              </div>
              <CardDescription>
                Get instant answers to your pregnancy questions (AI-powered chatbot coming soon)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/30 rounded-xl p-8 text-center space-y-4">
                <MessageCircle className="w-16 h-16 mx-auto text-primary" />
                <p className="text-foreground font-medium">
                  AI-powered pregnancy assistant coming soon
                </p>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  PregBot will answer your questions about symptoms, nutrition, exercise, 
                  and baby development throughout your pregnancy journey.
                </p>
                <Button variant="default" disabled>
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Start Chat (Coming Soon)
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Emergency Alert */}
          <Card className="shadow-soft border-2 border-destructive/50 lg:col-span-2 animate-in fade-in">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-destructive" />
                <CardTitle className="text-destructive">Emergency Support</CardTitle>
              </div>
              <CardDescription>
                In case of emergency, quickly alert your guardians with your location
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="emergency" className="flex-1">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Send Emergency Alert
                </Button>
                <Button variant="outline" className="flex-1">
                  Configure Emergency Contacts
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Pregnancy;
