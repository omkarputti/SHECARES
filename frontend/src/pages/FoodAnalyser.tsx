
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Apple, Camera, Search, Leaf, AlertTriangle, CheckCircle, TrendingUp, Import } from "lucide-react";
import { motion } from "framer-motion";
import Header from "@/components/Header";

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
    ],
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-100 via-pink-50 to-purple-100 relative overflow-hidden">
      {/* Background soft blur circles */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-pink-300 rounded-full opacity-20 blur-3xl"></div>
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-purple-300 rounded-full opacity-25 blur-3xl"></div>
      <Header />
      <br></br>
      <br></br>

      <main className="container mx-auto px-6 py-12 relative z-10">
        <div className="mb-10 text-center">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 text-transparent bg-clip-text mb-3">
            Food Analyzer
          </h1>
          <p className="text-purple-700/80 text-lg">
            Track your nutrition and get personalized wellness recommendations
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Section */}
          <motion.div
            whileHover={{ scale: 1.03 }}
            transition={{ type: "spring", stiffness: 200, damping: 10 }}
          >
            <Card className="lg:col-span-1 shadow-lg shadow-pink-200/50 bg-white/80 backdrop-blur-xl border-none rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-700">
                  <Apple className="h-5 w-5 text-pink-500" />
                  Analyze Food
                </CardTitle>
                <CardDescription>Enter food details or upload a photo</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="food-name" className="text-purple-800">
                    Food Name
                  </Label>
                  <Input
                    id="food-name"
                    placeholder="e.g., Grilled Chicken Salad"
                    className="rounded-xl border-purple-200 focus:border-pink-400 focus:ring-pink-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-purple-800">
                    Description (Optional)
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Add ingredients or preparation details"
                    rows={3}
                    className="rounded-xl border-purple-200 focus:border-pink-400 focus:ring-pink-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-purple-800">Upload Photo</Label>
                  <Button
                    variant="outline"
                    className="w-full rounded-xl border-pink-300 text-purple-700 hover:bg-pink-50 transition-all"
                  >
                    <Camera className="mr-2 h-4 w-4 text-pink-500" />
                    Take or Upload Photo
                  </Button>
                </div>

                <Button className="w-full rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold shadow-md hover:shadow-lg hover:from-pink-400 hover:to-purple-400 transition-all">
                  <Search className="mr-2 h-4 w-4" />
                  Analyze Food
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Analysis Results */}
          <div className="lg:col-span-2 space-y-8">
            {/* Nutritional Breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
            >
              <Card className="shadow-xl bg-white/80 backdrop-blur-lg border-none rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-purple-700">{analysis.food}</CardTitle>
                  <CardDescription className="text-purple-500">
                    Nutritional breakdown per serving
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {[
                      { label: "Calories", value: analysis.calories },
                      { label: "Protein", value: `${analysis.protein}g` },
                      { label: "Carbs", value: `${analysis.carbs}g` },
                      { label: "Fats", value: `${analysis.fats}g` },
                      { label: "Fiber", value: `${analysis.fiber}g` },
                    ].map((item, i) => (
                      <motion.div
                        key={i}
                        whileHover={{ scale: 1.05 }}
                        className="text-center p-4 bg-gradient-to-tr from-pink-100 to-purple-100 rounded-xl shadow-sm"
                      >
                        <div className="text-2xl font-bold text-purple-700">{item.value}</div>
                        <div className="text-xs text-purple-500">{item.label}</div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Safety Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div whileHover={{ scale: 1.02 }}>
                <Card
                  className={`rounded-2xl shadow-md ${
                    analysis.pregnant_safe
                      ? "bg-gradient-to-r from-green-50 to-pink-50 border-green-300"
                      : "bg-red-50 border-red-300"
                  }`}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      {analysis.pregnant_safe ? (
                        <CheckCircle className="h-8 w-8 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-8 w-8 text-red-500" />
                      )}
                      <div>
                        <h3 className="font-semibold text-purple-700">Pregnancy Safe</h3>
                        <p className="text-sm text-purple-600">
                          {analysis.pregnant_safe ? "Safe to consume" : "Not recommended"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }}>
                <Card
                  className={`rounded-2xl shadow-md ${
                    analysis.period_friendly
                      ? "bg-gradient-to-r from-pink-50 to-purple-50 border-pink-300"
                      : "bg-yellow-50 border-yellow-300"
                  }`}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <Leaf className="h-8 w-8 text-pink-500" />
                      <div>
                        <h3 className="font-semibold text-purple-700">Period Friendly</h3>
                        <p className="text-sm text-purple-600">
                          {analysis.period_friendly
                            ? "May help with symptoms"
                            : "May affect symptoms"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Recommendations */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <Card className="rounded-2xl shadow-lg bg-white/80 backdrop-blur-lg border-none">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-purple-700">
                    <TrendingUp className="h-5 w-5 text-pink-500" />
                    Personalized Recommendations
                  </CardTitle>
                  <CardDescription className="text-purple-500">
                    Based on your health profile
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {analysis.recommendations.map((rec, index) => (
                      <motion.li
                        key={index}
                        whileHover={{ scale: 1.02 }}
                        className="flex items-start gap-3 p-4 bg-gradient-to-r from-pink-100 to-purple-100 rounded-xl shadow-sm"
                      >
                        <CheckCircle className="h-5 w-5 text-pink-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-purple-700">{rec}</span>
                      </motion.li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FoodAnalyzer;
