// src/pages/PregnancyCare.tsx
import { useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Calendar,
  Utensils,
  Loader2,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Info,
  Shield,
  Ban,
  Camera,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/config/firebase";
import EmergencySafety from "@/components/EmergencySafety";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface DueDateResult {
  estimated_due_date: string;
}

interface FoodAnalysisResult {
  analysis_text: string;
  safety_status: "safe" | "unsafe" | "caution" | "not_food" | "unknown";
  detected_food?: boolean;
}

const fadeIn = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.45 } };

const PregnancyCare = () => {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();

  const [lmpDate, setLmpDate] = useState("");
  const [dueDate, setDueDate] = useState<DueDateResult | null>(null);
  const [dueDateLoading, setDueDateLoading] = useState(false);
  const [dueDateError, setDueDateError] = useState<string | null>(null);

  const [foodImage, setFoodImage] = useState<File | null>(null);
  const [foodAnalysisResult, setFoodAnalysisResult] = useState<FoodAnalysisResult | null>(null);
  const [foodLoading, setFoodLoading] = useState(false);
  const [foodError, setFoodError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // keep original redirect behaviour
  if (!user) {
    navigate("/auth");
    return null;
  }

  const handleDueDateCalculate = async () => {
    if (!lmpDate) {
      setDueDateError("Please select a date.");
      return;
    }
    setDueDateLoading(true);
    setDueDateError(null);
    setDueDate(null);
    try {
      const response = await fetch("http://localhost:8002/calculate-due-date", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lmp_date: lmpDate }),
      });
      if (!response.ok) throw new Error("Failed to calculate due date.");
      const result: DueDateResult = await response.json();
      setDueDate(result);
    } catch (err: any) {
      setDueDateError(err.message);
    } finally {
      setDueDateLoading(false);
    }
  };

  const handleFoodAnalyze = async () => {
    if (!foodImage) {
      setFoodError("Please select an image file.");
      return;
    }

    setFoodLoading(true);
    setFoodError(null);
    setFoodAnalysisResult(null);

    const formData = new FormData();
    formData.append("file", foodImage);

    try {
      const response = await fetch("http://localhost:8002/food/analyse", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to analyze food image");
      }

      const result = await response.json();
      const analysisText = result.analysis_text.toLowerCase();

      // IMPROVED SAFETY DETECTION LOGIC (unchanged behaviour)
      let safetyStatus: FoodAnalysisResult["safety_status"] = "unknown";
      let detectedFood = true;
      const notFoodIndicators = [
        "not food",
        "not a food",
        "cannot identify",
        "no food",
        "doesn't contain food",
        "logo",
        "document",
        "text",
        "paper",
        "screen",
        "phone",
        "computer",
        "electronic",
        "object",
        "item",
        "thing",
        "brand",
        "company",
        "organization",
        "university",
        "developer group",
        "gdg",
        "google developer",
        "vtu",
        "visvesvaraya",
      ];

      const isNotFood = notFoodIndicators.some((indicator) => analysisText.includes(indicator));

      if (isNotFood) {
        safetyStatus = "not_food";
        detectedFood = false;
      } else if (
        analysisText.includes("unsafe") ||
        analysisText.includes("dangerous") ||
        analysisText.includes("avoid") ||
        analysisText.includes("harmful") ||
        analysisText.includes("toxic") ||
        (analysisText.includes("risk") && analysisText.includes("high risk"))
      ) {
        safetyStatus = "unsafe";
      } else if (analysisText.includes("safe") && !analysisText.includes("not safe") && !analysisText.includes("unsafe")) {
        safetyStatus = "safe";
      } else if (
        analysisText.includes("caution") ||
        analysisText.includes("moderation") ||
        analysisText.includes("limit") ||
        analysisText.includes("consult")
      ) {
        safetyStatus = "caution";
      } else {
        safetyStatus = "unknown";
      }

      setFoodAnalysisResult({
        analysis_text: result.analysis_text,
        safety_status: safetyStatus,
        detected_food: detectedFood,
      });
    } catch (err: any) {
      setFoodError(err.message);
    } finally {
      setFoodLoading(false);
    }
  };

  // Styling mapping (keeps same keys you used)
  const getSafetyStyles = (status: string) => {
    switch (status) {
      case "safe":
        return {
          background: "from-emerald-50 to-emerald-25",
          border: "border-emerald-200",
          icon: CheckCircle,
          iconColor: "text-emerald-600",
          titleColor: "text-emerald-700",
          badge: "bg-emerald-100 text-emerald-800 border-emerald-200",
          badgeText: "Safe to Eat",
          description:
            "This food appears to be generally safe for pregnancy. Always ensure proper preparation and consult your healthcare provider for personalized advice.",
        };
      case "unsafe":
        return {
          background: "from-rose-50 to-rose-25",
          border: "border-rose-200",
          icon: XCircle,
          iconColor: "text-rose-600",
          titleColor: "text-rose-700",
          badge: "bg-rose-100 text-rose-800 border-rose-200",
          badgeText: "Not Safe - Avoid",
          description:
            "This food may pose risks during pregnancy. Avoid consumption and consult your healthcare provider for safe alternatives.",
        };
      case "not_food":
        return {
          background: "from-orange-50 to-orange-25",
          border: "border-orange-200",
          icon: Ban,
          iconColor: "text-orange-600",
          titleColor: "text-orange-700",
          badge: "bg-orange-100 text-orange-800 border-orange-200",
          badgeText: "Not a Food Item",
          description:
            "The uploaded image does not contain recognizable food. Please upload a clear image of actual food items for safety analysis.",
        };
      case "caution":
        return {
          background: "from-amber-50 to-amber-25",
          border: "border-amber-200",
          icon: AlertTriangle,
          iconColor: "text-amber-600",
          titleColor: "text-amber-700",
          badge: "bg-amber-100 text-amber-800 border-amber-200",
          badgeText: "Use Caution",
          description:
            "This food requires careful consideration. Consume in moderation and ensure proper preparation methods.",
        };
      case "unknown":
      default:
        return {
          background: "from-slate-50 to-slate-25",
          border: "border-slate-200",
          icon: Info,
          iconColor: "text-slate-600",
          titleColor: "text-slate-700",
          badge: "bg-slate-100 text-slate-800 border-slate-200",
          badgeText: "Analysis Needed",
          description: "Unable to determine safety status. Please consult your healthcare provider for guidance.",
        };
    }
  };

  // Light markdown components (unchanged)
  const MarkdownComponents = {
    h1: ({ node, ...props }: any) => <h1 className="text-lg font-bold text-slate-900 mt-4 mb-2 first:mt-0" {...props} />,
    h2: ({ node, ...props }: any) => <h2 className="text-md font-semibold text-slate-800 mt-3 mb-2" {...props} />,
    h3: ({ node, ...props }: any) => <h3 className="text-sm font-semibold text-slate-700 mt-2 mb-1" {...props} />,
    p: ({ node, ...props }: any) => <p className="text-sm text-slate-700 mb-3 leading-relaxed" {...props} />,
    ul: ({ node, ...props }: any) => <ul className="list-disc list-inside space-y-1 mb-3 text-sm text-slate-700" {...props} />,
    ol: ({ node, ...props }: any) => <ol className="list-decimal list-inside space-y-1 mb-3 text-sm text-slate-700" {...props} />,
    li: ({ node, ...props }: any) => <li className="text-sm text-slate-700 mb-1" {...props} />,
    strong: ({ node, ...props }: any) => <strong className="font-semibold text-slate-900" {...props} />,
    em: ({ node, ...props }: any) => <em className="italic text-slate-800" {...props} />,
  };

  const renderEnhancedAnalysis = (analysisText: string, safetyStatus: string) => {
    const styles = getSafetyStyles(safetyStatus);
    const IconComponent = styles.icon as any;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
        className={`bg-gradient-to-br ${styles.background} rounded-2xl p-5 border ${styles.border} shadow-2xl/5 hover:shadow-2xl transform-gpu transition-all duration-300`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/10 border border-white/6 shadow-inner">
              <IconComponent className={`h-6 w-6 ${styles.iconColor}`} />
            </div>
            <h3 className={`text-lg font-semibold ${styles.titleColor}`}>
              {safetyStatus === "not_food" ? "Image Analysis Result" : "Food Analysis Result"}
            </h3>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles.badge}`}>{styles.badgeText}</span>
        </div>

        <div className="prose prose-sm max-w-none text-slate-800 mb-4">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownComponents}>
            {analysisText}
          </ReactMarkdown>
        </div>

        <div className="mt-4 p-3 rounded-lg bg-white/60 border border-white/10 backdrop-blur-sm">
          <div className="flex items-start gap-2">
            <Shield className="h-4 w-4 text-indigo-500 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-slate-600">
              <p>{styles.description}</p>
              {safetyStatus === "not_food" && (
                <div className="mt-2 flex items-center gap-2 text-orange-600">
                  <Camera className="h-3 w-3" />
                  <span className="font-medium">Tip: Upload clear photos of actual food items</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8f6ff] via-[#fffaf7] to-[#f7fbff] text-slate-900 antialiased font-sans">
      {/* Decorative blobs for AI-ish look (pure CSS + SVG shapes) */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <svg className="absolute -left-56 -top-40 w-[640px] opacity-40" viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="g1" x1="0%" x2="100%">
              <stop offset="0%" stopColor="#f0abfc" />
              <stop offset="100%" stopColor="#60a5fa" />
            </linearGradient>
          </defs>
          <g transform="translate(300,300)">
            <path d="M120,-150C161,-114,186,-62,189,-6C192,50,173,102,133,148C93,194,33,234,-31,241C-95,248,-179,222,-214,170C-249,118,-235,40,-208,-24C-181,-88,-142,-124,-98,-157C-54,-190,-27,-220,16,-238C59,-256,118,-186,120,-150Z" fill="url(#g1)" opacity="0.14"/>
          </g>
        </svg>

        <svg className="absolute -right-56 -bottom-40 w-[520px] opacity-30" viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="g2" x1="0%" x2="100%">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#60a5fa" />
            </linearGradient>
          </defs>
          <g transform="translate(300,300)">
            <path d="M120,-150C161,-114,186,-62,189,-6C192,50,173,102,133,148C93,194,33,234,-31,241C-95,248,-179,222,-214,170C-249,118,-235,40,-208,-24C-181,-88,-142,-124,-98,-157C-54,-190,-27,-220,16,-238C59,-256,118,-186,120,-150Z" fill="url(#g2)" opacity="0.12"/>
          </g>
        </svg>
      </div>

      <Header />

      <main className="container mx-auto px-4 py-10 mt-24">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fadeIn} className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-3 tracking-tight">
              <span role="img" aria-label="baby">👶</span>{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#7c3aed] via-[#ec4899] to-[#06b6d4]">Pregnancy Care</span>
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Complete pregnancy tracking with personalized care — prettier, clearer, and easier to use.
            </p>
          </motion.div>

          <EmergencySafety />

          <div className="grid md:grid-cols-2 gap-6 mt-8">
            {/* Due Date Calculator */}
            <motion.div whileHover={{ y: -6 }} transition={{ type: "spring", stiffness: 300 }} className="transform-gpu">
              <Card className="rounded-2xl overflow-hidden shadow-2xl">
                <CardHeader className="bg-white/60 border-b border-white/10">
                  <div className="flex items-center justify-between w-full">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <span className="p-2 rounded-lg bg-gradient-to-br from-[#f0f] to-[#60a5fa] text-white shadow"> <Calendar className="h-4 w-4" /> </span>
                        Due Date Calculator
                      </CardTitle>
                      <CardDescription>Enter your last menstrual period to estimate your due date.</CardDescription>
                    </div>
                    <div className="hidden md:block -mr-3">
                      {/* small AI-photo-like placeholder */}
                      <div className="w-20 h-12 rounded-lg bg-gradient-to-br from-[#fff] to-[#f3f4f6] border border-white/20 shadow-inner flex items-center justify-center text-xs text-slate-500">
                        AI • preview
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6 bg-white/60 backdrop-blur-sm">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="lmp-date">Last Menstrual Period</Label>
                      <Input
                        id="lmp-date"
                        type="date"
                        value={lmpDate}
                        onChange={(e) => setLmpDate(e.target.value)}
                        className="shadow-sm rounded-lg"
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      <Button onClick={handleDueDateCalculate} disabled={dueDateLoading} className="w-full rounded-xl shadow-md transform-gpu hover:-translate-y-1 transition-all">
                        {dueDateLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Calculate Due Date
                      </Button>

                      {dueDateError && (
                        <Alert variant="destructive">
                          <AlertDescription>{dueDateError}</AlertDescription>
                        </Alert>
                      )}

                      {dueDate && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white/80 p-4 rounded-lg text-center border border-white/10 shadow-sm">
                          <p className="text-sm text-slate-600 mb-1">Estimated Due Date</p>
                          <p className="text-lg font-semibold text-slate-800">
                            {new Date(dueDate.estimated_due_date).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Food Analyzer */}
            <motion.div whileHover={{ y: -6 }} transition={{ type: "spring", stiffness: 300 }} className="transform-gpu">
              <Card className="rounded-2xl overflow-hidden shadow-2xl">
                <CardHeader className="bg-white/60 border-b border-white/10">
                  <div className="flex items-center justify-between w-full">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <span className="p-2 rounded-lg bg-gradient-to-br from-[#10b981] to-[#06b6d4] text-white shadow"><Utensils className="h-4 w-4" /></span>
                        Food Analyzer
                      </CardTitle>
                      <CardDescription>Upload a clear image of food items for pregnancy-safe analysis and nutritional insights.</CardDescription>
                    </div>
                    <div className="hidden md:block -mr-3">
                      <div className="w-20 h-12 rounded-lg bg-gradient-to-br from-[#fff] to-[#f3f4f6] border border-white/20 shadow-inner flex items-center justify-center text-xs text-slate-500">
                        AI • food
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6 bg-white/60 backdrop-blur-sm">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="food-image">Food Image</Label>
                      <Input
                        id="food-image"
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={(e) => setFoodImage(e.target.files ? e.target.files[0] : null)}
                        className="hidden"
                      />
                      <div className="flex gap-2">
                        <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="flex-1 rounded-lg">
                          {foodImage ? foodImage.name : "Select Food Image"}
                        </Button>
                        {foodImage && (
                          <Button variant="ghost" onClick={() => setFoodImage(null)} className="text-rose-500 hover:text-rose-700">
                            Clear
                          </Button>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <Camera className="h-3 w-3" />
                        Upload clear photos of actual food items (not logos, documents, or objects)
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      <Button onClick={handleFoodAnalyze} disabled={foodLoading || !foodImage} className="w-full rounded-xl shadow-md transform-gpu hover:-translate-y-1 transition-all">
                        {foodLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Analyze Food Safety
                      </Button>

                      {foodError && (
                        <Alert variant="destructive">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>{foodError}</AlertDescription>
                        </Alert>
                      )}

                      {foodAnalysisResult && renderEnhancedAnalysis(foodAnalysisResult.analysis_text, foodAnalysisResult.safety_status)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>

      
    </div>
  );
};

export default PregnancyCare;
