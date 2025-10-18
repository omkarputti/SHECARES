import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Apple, Camera, Search, Leaf, AlertTriangle, CheckCircle, TrendingUp } from "lucide-react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import Header from "@/components/Header";

// --- Types ---
type Analysis = {
  food_name: string;
  calories: string | number;
  protein: string | number;
  carbs: string | number;
  fats: string | number;
  fiber: string | number;
  pregnancy_safe: boolean;
  period_friendly: boolean;
  recommendations: string | string[];
  suggested_foods?: string[];
};

const initialBlankAnalysis: Analysis = {
  food_name: "",
  calories: "",
  protein: "",
  carbs: "",
  fats: "",
  fiber: "",
  pregnancy_safe: false,
  period_friendly: false,
  recommendations: [],
  suggested_foods: [],
};

// Works for both Vite and CRA
const API_URL = import.meta.env.VITE_FOOD_ANALYSIS_URL || "http://localhost:8002/analyse";
const BACKEND_FOOD_URL = import.meta.env.VITE_FOOD_ANALYSIS_URL || "http://localhost:8002/analyse";

export default function FoodAnalyser() {
  // dynamic state: null means blank UI (no analysis yet)
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [analysisText, setAnalysisText] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Motion values for fancy 3D tilt
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateY = useTransform(mouseX, [-200, 200], [15, -15]);
  const rotateX = useTransform(mouseY, [-200, 200], [-12, 12]);

  useEffect(() => {
    // clear preview when file removed
    if (!selectedFile) setPreviewSrc(null);
  }, [selectedFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files && e.target.files[0];
    if (f) {
      setSelectedFile(f);
      const url = URL.createObjectURL(f);
      setPreviewSrc(url);
    }
  };

  const handleUploadClick = () => fileInputRef.current?.click();

  const resetUI = () => {
    setAnalysis(null);
    setAnalysisText(null);
    setSelectedFile(null);
    setPreviewSrc(null);
    setError(null);
  };

  // fancy hover handler to update motion values
  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setAnalysisText(null);
    setError(null);

    try {
      const form = new FormData();
      if (selectedFile) {
        form.append("file", selectedFile, selectedFile.name);
      } else {
        const name = (document.getElementById("food-name") as HTMLInputElement)?.value || "";
        const desc = (document.getElementById("description") as HTMLTextAreaElement)?.value || "";
        form.append("food_name", name);
        form.append("description", desc);
      }

      const resp = await fetch(BACKEND_FOOD_URL, {
        method: "POST",
        body: form,
      });

      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        throw new Error(data.detail || `Server returned ${resp.status}`);
      }

      const data = await resp.json();

      // backend returns { success: true, source: 'Gemini', report: { ... } }
      const report = data?.report;
      if (!report) throw new Error("Invalid response from server");

      // normalize values (ensure numbers or strings)
      const parsed: Analysis = {
        food_name: report.food_name || report.food || "Unknown Food",
        calories: report.calories || "N/A",
        protein: report.protein || report.protein_g || "N/A",
        carbs: report.carbs || report.carbs_g || "N/A",
        fats: report.fats || report.fats_g || "N/A",
        fiber: report.fiber || report.fiber_g || "N/A",
        pregnancy_safe: Boolean(report.pregnancy_safe),
        period_friendly: Boolean(report.period_friendly),
        recommendations: report.recommendations || report.recommendation || "",
        suggested_foods: report.suggested_foods || [],
      };

      setAnalysis(parsed);

      // set textual recommendations to display in the big card
      if (typeof parsed.recommendations === "string") setAnalysisText(parsed.recommendations);
      else setAnalysisText(parsed.recommendations.join("\n– "));

      // scroll to results smoothly
      setTimeout(() => {
        document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Analysis failed");
      setAnalysis(null);
      setAnalysisText(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-100 via-pink-50 to-purple-100 relative overflow-hidden">
      <div className="absolute top-20 left-10 w-64 h-64 bg-pink-300 rounded-full opacity-20 blur-3xl" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-purple-300 rounded-full opacity-25 blur-3xl" />
      <Header />
        <br></br>
      <main className="container mx-auto px-6 py-12 relative z-10">
        <div className="mb-10 text-center">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 text-transparent bg-clip-text mb-3">
            Food Analyzer
          </h1>
          <p className="text-purple-700/80 text-lg">Track nutrition and get personalized wellness recommendations</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ rotateX, rotateY }}
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="lg:col-span-1"
          >
            <Card className="shadow-lg shadow-pink-200/50 bg-white/80 backdrop-blur-xl border-none rounded-2xl transform-preserve-3d">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-700">
                  <Apple className="h-5 w-5 text-pink-500" /> Analyze Food
                </CardTitle>
                <CardDescription>Enter food details or upload a photo</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="food-name" className="text-purple-800">
                    Food Name
                  </Label>
                  <Input id="food-name" placeholder="e.g., Grilled Chicken Salad" className="rounded-xl" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-purple-800">
                    Description (Optional)
                  </Label>
                  <Textarea id="description" placeholder="Add ingredients or preparation details" rows={3} className="rounded-xl" />
                </div>

                <div className="space-y-2">
                  <Label className="text-purple-800">Upload Photo</Label>
                  <input ref={fileInputRef} id="food-photo" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={handleUploadClick}
                      className="flex-1 rounded-xl border-pink-300 text-purple-700 hover:bg-pink-50 transition-all"
                    >
                      <Camera className="mr-2 h-4 w-4 text-pink-500" />
                      {selectedFile ? selectedFile.name : "Take or Upload Photo"}
                    </Button>

                    <Button
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewSrc(null);
                      }}
                      variant="ghost"
                      className="rounded-xl"
                    >
                      Clear
                    </Button>
                  </div>

                  {previewSrc && (
                    <div className="mt-3">
                      <img src={previewSrc} alt="preview" className="w-full h-40 object-cover rounded-xl shadow-inner" />
                    </div>
                  )}
                </div>

                <Button
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="w-full rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-60"
                >
                  <Search className="mr-2 h-4 w-4" />
                  {loading ? "Analyzing..." : "Analyze Food"}
                </Button>

                <div className="flex gap-2 mt-2">
                  <Button onClick={resetUI} variant="secondary" className="w-full rounded-xl">
                    Reset
                  </Button>
                </div>

                {error && <div className="text-sm text-red-600">Error: {error}</div>}
              </CardContent>
            </Card>
          </motion.div>

          <div id="results" className="lg:col-span-2 space-y-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="shadow-xl bg-white/80 backdrop-blur-lg border-none rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-purple-700">{analysis?.food_name || ""}</CardTitle>
                  <CardDescription className="text-purple-500">Nutritional breakdown per serving</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {[
                      { label: "Calories", value: analysis ? analysis.calories : "--" },
                      { label: "Protein", value: analysis ? `${analysis.protein}g` : "--" },
                      { label: "Carbs", value: analysis ? `${analysis.carbs}g` : "--" },
                      { label: "Fats", value: analysis ? `${analysis.fats}g` : "--" },
                      { label: "Fiber", value: analysis ? `${analysis.fiber}g` : "--" },
                    ].map((item, i) => (
                      <motion.div
                        key={i}
                        whileHover={{ scale: analysis ? 1.06 : 1.0, y: analysis ? -6 : 0 }}
                        transition={{ type: "spring", stiffness: 250, damping: 18 }}
                        className={`text-center p-4 rounded-xl shadow-sm ${analysis ? "bg-gradient-to-tr from-pink-100 to-purple-100" : "bg-gray-50"}`}
                      >
                        <div className="text-2xl font-bold text-purple-700">{item.value}</div>
                        <div className="text-xs text-purple-500">{item.label}</div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div whileHover={{ scale: 1.02 }}>
                <Card
                  className={`rounded-2xl shadow-md p-4 ${
                    analysis?.pregnancy_safe ? "bg-gradient-to-r from-green-50 to-pink-50 border-green-300" : "bg-red-50 border-red-300"
                  }`}
                >
                  <CardContent className="pt-2">
                    <div className="flex items-center gap-3">
                      {analysis?.pregnancy_safe ? <CheckCircle className="h-8 w-8 text-green-500" /> : <AlertTriangle className="h-8 w-8 text-red-500" />}
                      <div>
                        <h3 className="font-semibold text-purple-700">Pregnancy Safe</h3>
                        <p className="text-sm text-purple-600">{analysis ? (analysis.pregnancy_safe ? "Safe to consume" : "Not recommended") : "No data"}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }}>
                <Card className={`rounded-2xl shadow-md p-4 ${analysis?.period_friendly ? "bg-gradient-to-r from-pink-50 to-purple-50 border-pink-300" : "bg-yellow-50 border-yellow-300"}`}>
                  <CardContent className="pt-2">
                    <div className="flex items-center gap-3">
                      <Leaf className="h-8 w-8 text-pink-500" />
                      <div>
                        <h3 className="font-semibold text-purple-700">Period Friendly</h3>
                        <p className="text-sm text-purple-600">{analysis ? (analysis.period_friendly ? "May help with symptoms" : "May affect symptoms") : "No data"}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card className="rounded-2xl shadow-lg bg-white/80 backdrop-blur-lg border-none">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-purple-700">
                    <TrendingUp className="h-5 w-5 text-pink-500" /> Personalized Recommendations
                  </CardTitle>
                  <CardDescription className="text-purple-500">Based on the analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  {analysisText ? (
                    <div className="prose text-sm text-purple-700 whitespace-pre-wrap">{analysisText}</div>
                  ) : analysis ? (
                    <ul className="space-y-3">
                      {(Array.isArray(analysis.recommendations) ? analysis.recommendations : [analysis.recommendations]).map((rec, idx) => (
                        <motion.li key={idx} whileHover={{ x: 6 }} className="flex items-start gap-3 p-4 bg-gradient-to-r from-pink-100 to-purple-100 rounded-xl shadow-sm">
                          <CheckCircle className="h-5 w-5 text-pink-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-purple-700">{rec}</span>
                        </motion.li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-center text-sm text-purple-500">No analysis yet. Upload a photo or enter a food name to get started.</div>
                  )}

                  {analysis?.suggested_foods && analysis.suggested_foods.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-purple-700 mb-2">More options for pregnancy-friendly cravings</h4>
                      <div className="flex gap-3 flex-wrap">
                        {analysis.suggested_foods.map((f, i) => (
                          <motion.span key={i} whileHover={{ scale: 1.05 }} className="px-3 py-1 rounded-full bg-white/70 border text-xs text-purple-700 shadow-sm">
                            {f}
                          </motion.span>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
