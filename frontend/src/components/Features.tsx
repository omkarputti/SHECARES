import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Features = () => {
  const features = [
    {
      icon: "👶",
      title: "Pregnancy Care",
      description: "Complete pregnancy tracking with due date calculator, trimester tips, and PregBot AI assistant.",
      items: ["Due Date Calculator", "Pregnancy Tips", "PregBot Chatbot", "Emergency Alerts"],
      link: "/pregnancy-care"
    },
    {
      icon: "🩸",
      title: "Period Tracking",
      description: "Smart cycle prediction, mood support, and hygiene tips tailored to your cycle.",
      items: ["Cycle Predictor", "Mood Support", "Health Tips", "Doctor Connect"],
      link: "/period-tracking"
    },
    {
      icon: "🧠",
      title: "Mental Wellness",
      description: "Comprehensive mental health support with smart routing and professional connections.",
      items: ["Smart Routing", "Therapist Support", "Mood Tracking", "Wellness Resources"],
      link: "/mental-wellness"
    },
    {
      icon: "🆘",
      title: "Emergency Safety",
      description: "Advanced safety features with SOS alerts and nearby help location services.",
      items: ["SOS Button", "Live Location", "Nearby Help", "Emergency Contacts"],
      link: "#emergency"
    }
  ];

  return (
    <section id="features" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Everything You Need for
            <span className="bg-gradient-primary bg-clip-text text-transparent"> Complete Care</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            From pregnancy to periods, mental health to emergency safety - 
            we've got every aspect of your wellness journey covered.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="border-border hover:shadow-soft transition-all duration-300 hover:-translate-y-2 animate-slide-up group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader className="text-center pb-4">
                <div className="text-4xl mb-4 group-hover:animate-bounce">
                  {feature.icon}
                </div>
                <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
                <CardDescription className="text-muted-foreground">
                  {feature.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-4">
                  {feature.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                      {item}
                    </li>
                  ))}
                </ul>
                {feature.link !== "#emergency" ? (
                  <Button asChild className="w-full">
                    <Link to={feature.link}>Explore {feature.title}</Link>
                  </Button>
                ) : (
                  <Button variant="outline" className="w-full">
                    Available on Home Page
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;