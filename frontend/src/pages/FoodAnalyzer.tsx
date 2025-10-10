import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Apple, Camera, Search, Leaf, AlertTriangle, CheckCircle, TrendingUp } from "lucide-react";
import { useState } from "react";

const FoodAnalyzer = () => {
  const [analysis] = useState({
    food: "Grilled Chicken Salad",
    calories: 350,
    protein: 32,
    carbs: 18,
    fats: 14,
    fiber: 6,
    pregnant_safe: true,
    period_friendly: true,
    recommendations: [
      "Rich in protein - great for pregnancy",
      "Low in iron - consider adding spinach",
      "Good hydration from vegetables",
    ]
  });

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">Food Analyzer</h1>
          <p className="text-muted-foreground">Track nutrition and get personalized recommendations</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Section */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Apple className="h-5 w-5" />
                Analyze Food
              </CardTitle>
              <CardDescription>Enter food details or upload a photo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="food-name">Food Name</Label>
                <Input id="food-name" placeholder="e.g., Grilled Chicken Salad" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea 
                  id="description" 
                  placeholder="Add ingredients or preparation details"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Upload Photo</Label>
                <Button variant="outline" className="w-full">
                  <Camera className="mr-2 h-4 w-4" />
                  Take or Upload Photo
                </Button>
              </div>

              <Button className="w-full">
                <Search className="mr-2 h-4 w-4" />
                Analyze Food
              </Button>
            </CardContent>
          </Card>

          {/* Analysis Results */}
          <div className="lg:col-span-2 space-y-6">
            {/* Nutritional Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>{analysis.food}</CardTitle>
                <CardDescription>Nutritional breakdown per serving</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="text-center p-4 bg-secondary/30 rounded-lg">
                    <div className="text-2xl font-bold text-accent">{analysis.calories}</div>
                    <div className="text-xs text-muted-foreground">Calories</div>
                  </div>
                  <div className="text-center p-4 bg-secondary/30 rounded-lg">
                    <div className="text-2xl font-bold text-accent">{analysis.protein}g</div>
                    <div className="text-xs text-muted-foreground">Protein</div>
                  </div>
                  <div className="text-center p-4 bg-secondary/30 rounded-lg">
                    <div className="text-2xl font-bold text-accent">{analysis.carbs}g</div>
                    <div className="text-xs text-muted-foreground">Carbs</div>
                  </div>
                  <div className="text-center p-4 bg-secondary/30 rounded-lg">
                    <div className="text-2xl font-bold text-accent">{analysis.fats}g</div>
                    <div className="text-xs text-muted-foreground">Fats</div>
                  </div>
                  <div className="text-center p-4 bg-secondary/30 rounded-lg">
                    <div className="text-2xl font-bold text-accent">{analysis.fiber}g</div>
                    <div className="text-xs text-muted-foreground">Fiber</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Safety Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className={analysis.pregnant_safe ? "border-green-500 bg-green-50/50" : "border-red-500 bg-red-50/50"}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    {analysis.pregnant_safe ? (
                      <CheckCircle className="h-8 w-8 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-8 w-8 text-red-500" />
                    )}
                    <div>
                      <h3 className="font-semibold">Pregnancy Safe</h3>
                      <p className="text-sm text-muted-foreground">
                        {analysis.pregnant_safe ? "Safe to consume" : "Not recommended"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className={analysis.period_friendly ? "border-green-500 bg-green-50/50" : "border-yellow-500 bg-yellow-50/50"}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <Leaf className="h-8 w-8 text-green-500" />
                    <div>
                      <h3 className="font-semibold">Period Friendly</h3>
                      <p className="text-sm text-muted-foreground">
                        {analysis.period_friendly ? "May help with symptoms" : "May affect symptoms"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Personalized Recommendations
                </CardTitle>
                <CardDescription>Based on your health profile</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {analysis.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-3 p-3 bg-secondary/30 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Recent Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Analyses</CardTitle>
                <CardDescription>Your food history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {["Oatmeal with Berries", "Greek Yogurt", "Brown Rice Bowl"].map((food, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <Apple className="h-4 w-4 text-accent" />
                        <span className="text-sm">{food}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">2 hours ago</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FoodAnalyzer;
