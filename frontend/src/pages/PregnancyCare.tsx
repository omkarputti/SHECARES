import { useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar, Utensils, Loader2, CheckCircle, AlertTriangle, XCircle, Info, Shield, Ban, Camera } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/config/firebase';
import EmergencySafety from "@/components/EmergencySafety";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface DueDateResult {
  estimated_due_date: string;
}

interface FoodAnalysisResult {
  analysis_text: string;
  safety_status: 'safe' | 'unsafe' | 'caution' | 'not_food' | 'unknown';
  detected_food?: boolean;
}

const PregnancyCare = () => {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();

  const [lmpDate, setLmpDate] = useState('');
  const [dueDate, setDueDate] = useState<DueDateResult | null>(null);
  const [dueDateLoading, setDueDateLoading] = useState(false);
  const [dueDateError, setDueDateError] = useState<string | null>(null);

  const [foodImage, setFoodImage] = useState<File | null>(null);
  const [foodAnalysisResult, setFoodAnalysisResult] = useState<FoodAnalysisResult | null>(null);
  const [foodLoading, setFoodLoading] = useState(false);
  const [foodError, setFoodError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) {
    navigate('/auth');
    return null;
  }

  const handleDueDateCalculate = async () => {
    if (!lmpDate) {
      setDueDateError('Please select a date.');
      return;
    }
    setDueDateLoading(true);
    setDueDateError(null);
    setDueDate(null);
    try {
      const response = await fetch('http://localhost:8000/calculate-due-date', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lmp_date: lmpDate })
      });
      if (!response.ok) throw new Error('Failed to calculate due date.');
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
      setFoodError('Please select an image file.');
      return;
    }

    setFoodLoading(true);
    setFoodError(null);
    setFoodAnalysisResult(null);

    const formData = new FormData();
    formData.append('file', foodImage);

    try {
      const response = await fetch('http://localhost:8000/food/analyse', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to analyze food image');
      }

      const result = await response.json();
      const analysisText = result.analysis_text.toLowerCase();
      
      // IMPROVED SAFETY DETECTION LOGIC
      let safetyStatus: 'safe' | 'unsafe' | 'caution' | 'not_food' | 'unknown' = 'unknown';
      let detectedFood = true;

      // First check if it's NOT food
      const notFoodIndicators = [
        'not food', 'not a food', 'cannot identify', 'no food', "doesn't contain food",
        'logo', 'document', 'text', 'paper', 'screen', 'phone', 'computer', 'electronic',
        'object', 'item', 'thing', 'brand', 'company', 'organization', 'university',
        'developer group', 'gdg', 'google developer', 'vtu', 'visvesvaraya'
      ];

      const isNotFood = notFoodIndicators.some(indicator => analysisText.includes(indicator));
      
      if (isNotFood) {
        safetyStatus = 'not_food';
        detectedFood = false;
      } 
      // Then check safety levels for actual food
      else if (analysisText.includes('unsafe') || analysisText.includes('dangerous') || 
               analysisText.includes('avoid') || analysisText.includes('harmful') ||
               analysisText.includes('toxic') || analysisText.includes('risk') && 
               analysisText.includes('high risk')) {
        safetyStatus = 'unsafe';
      } else if (analysisText.includes('safe') && !analysisText.includes('not safe') && 
                 !analysisText.includes('unsafe')) {
        safetyStatus = 'safe';
      } else if (analysisText.includes('caution') || analysisText.includes('moderation') || 
                 analysisText.includes('limit') || analysisText.includes('consult')) {
        safetyStatus = 'caution';
      } else {
        safetyStatus = 'unknown';
      }

      setFoodAnalysisResult({
        analysis_text: result.analysis_text,
        safety_status: safetyStatus,
        detected_food: detectedFood
      });
    } catch (err: any) {
      setFoodError(err.message);
    } finally {
      setFoodLoading(false);
    }
  };

  // Get safety status styling based on status
  const getSafetyStyles = (status: string) => {
    switch (status) {
      case 'safe':
        return {
          background: 'from-green-50 to-green-25',
          border: 'border-green-200',
          icon: CheckCircle,
          iconColor: 'text-green-600',
          titleColor: 'text-green-700',
          badge: 'bg-green-100 text-green-800 border-green-200',
          badgeText: 'Safe to Eat',
          description: 'This food appears to be generally safe for pregnancy. Always ensure proper preparation and consult your healthcare provider for personalized advice.'
        };
      case 'unsafe':
        return {
          background: 'from-red-50 to-red-25',
          border: 'border-red-200',
          icon: XCircle,
          iconColor: 'text-red-600',
          titleColor: 'text-red-700',
          badge: 'bg-red-100 text-red-800 border-red-200',
          badgeText: 'Not Safe - Avoid',
          description: 'This food may pose risks during pregnancy. Avoid consumption and consult your healthcare provider for safe alternatives.'
        };
      case 'not_food':
        return {
          background: 'from-orange-50 to-orange-25',
          border: 'border-orange-200',
          icon: Ban,
          iconColor: 'text-orange-600',
          titleColor: 'text-orange-700',
          badge: 'bg-orange-100 text-orange-800 border-orange-200',
          badgeText: 'Not a Food Item',
          description: 'The uploaded image does not contain recognizable food. Please upload a clear image of actual food items for safety analysis.'
        };
      case 'caution':
        return {
          background: 'from-amber-50 to-amber-25',
          border: 'border-amber-200',
          icon: AlertTriangle,
          iconColor: 'text-amber-600',
          titleColor: 'text-amber-700',
          badge: 'bg-amber-100 text-amber-800 border-amber-200',
          badgeText: 'Use Caution',
          description: 'This food requires careful consideration. Consume in moderation and ensure proper preparation methods.'
        };
      case 'unknown':
      default:
        return {
          background: 'from-gray-50 to-gray-25',
          border: 'border-gray-200',
          icon: Info,
          iconColor: 'text-gray-600',
          titleColor: 'text-gray-700',
          badge: 'bg-gray-100 text-gray-800 border-gray-200',
          badgeText: 'Analysis Needed',
          description: 'Unable to determine safety status. Please consult your healthcare provider for guidance.'
        };
    }
  };

  // Custom components for ReactMarkdown with better styling
  const MarkdownComponents = {
    h1: ({node, ...props}: any) => <h1 className="text-lg font-bold text-gray-900 mt-4 mb-2 first:mt-0" {...props} />,
    h2: ({node, ...props}: any) => <h2 className="text-md font-semibold text-gray-800 mt-3 mb-2" {...props} />,
    h3: ({node, ...props}: any) => <h3 className="text-sm font-semibold text-gray-700 mt-2 mb-1" {...props} />,
    p: ({node, ...props}: any) => <p className="text-sm text-gray-700 mb-3 leading-relaxed" {...props} />,
    ul: ({node, ...props}: any) => <ul className="list-disc list-inside space-y-1 mb-3 text-sm text-gray-700" {...props} />,
    ol: ({node, ...props}: any) => <ol className="list-decimal list-inside space-y-1 mb-3 text-sm text-gray-700" {...props} />,
    li: ({node, ...props}: any) => <li className="text-sm text-gray-700 mb-1" {...props} />,
    strong: ({node, ...props}: any) => <strong className="font-semibold text-gray-900" {...props} />,
    em: ({node, ...props}: any) => <em className="italic text-gray-800" {...props} />,
  };

  // Enhanced analysis display with categorized sections
  const renderEnhancedAnalysis = (analysisText: string, safetyStatus: string) => {
    const styles = getSafetyStyles(safetyStatus);
    const IconComponent = styles.icon;

    return (
      <div className={`bg-gradient-to-br ${styles.background} rounded-2xl p-5 border ${styles.border} shadow-md hover:shadow-lg transition-all duration-300 animate-fade-in`}>
        {/* Header with safety status */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <IconComponent className={`h-6 w-6 ${styles.iconColor}`} />
            <h3 className={`text-lg font-semibold ${styles.titleColor}`}>
              {safetyStatus === 'not_food' ? 'Image Analysis Result' : 'Food Analysis Result'}
            </h3>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles.badge}`}>
            {styles.badgeText}
          </span>
        </div>

        {/* Analysis Content */}
        <div className="prose prose-sm max-w-none text-gray-800 mb-4">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={MarkdownComponents}
          >
            {analysisText}
          </ReactMarkdown>
        </div>

        {/* Additional Safety Notes */}
        <div className="mt-4 p-3 rounded-lg bg-white border border-gray-200">
          <div className="flex items-start gap-2">
            <Shield className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-gray-600">
              <p>{styles.description}</p>
              {safetyStatus === 'not_food' && (
                <div className="mt-2 flex items-center gap-2 text-orange-600">
                  <Camera className="h-3 w-3" />
                  <span className="font-medium">Tip: Upload clear photos of actual food items</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8 mt-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">
              👶 <span className="bg-gradient-primary bg-clip-text text-transparent">Pregnancy Care</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Complete pregnancy tracking with personalized care and support
            </p>
          </div>

          <EmergencySafety />

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Due Date Calculator */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Due Date Calculator
                </CardTitle>
                <CardDescription>
                  Enter your last menstrual period to estimate your due date.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="lmp-date">Last Menstrual Period Date</Label>
                    <Input 
                      id="lmp-date" 
                      type="date" 
                      value={lmpDate} 
                      onChange={(e) => setLmpDate(e.target.value)} 
                    />
                  </div>
                  <Button onClick={handleDueDateCalculate} disabled={dueDateLoading} className="w-full">
                    {dueDateLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} 
                    Calculate Due Date
                  </Button>
                  
                  {dueDateError && (
                    <Alert variant="destructive">
                      <AlertDescription>{dueDateError}</AlertDescription>
                    </Alert>
                  )}
                  
                  {dueDate && (
                    <div className="bg-primary/10 p-4 rounded-lg text-center border border-primary/20">
                      <p className="text-sm text-muted-foreground mb-1">Estimated Due Date</p>
                      <p className="text-lg font-semibold text-primary">
                        {new Date(dueDate.estimated_due_date).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Food Analyzer */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Utensils className="h-5 w-5" />
                  Food Analyzer
                </CardTitle>
                <CardDescription>
                  Upload a clear image of food items for pregnancy-safe analysis and nutritional insights.
                </CardDescription>
              </CardHeader>
              <CardContent>
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
                      <Button 
                        onClick={() => fileInputRef.current?.click()} 
                        variant="outline" 
                        className="flex-1"
                      >
                        {foodImage ? foodImage.name : 'Select Food Image'}
                      </Button>
                      {foodImage && (
                        <Button 
                          variant="ghost" 
                          onClick={() => setFoodImage(null)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Clear
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Camera className="h-3 w-3" />
                      Upload clear photos of actual food items (not logos, documents, or objects)
                    </p>
                  </div>
                  
                  <Button 
                    onClick={handleFoodAnalyze} 
                    disabled={foodLoading || !foodImage}
                    className="w-full"
                  >
                    {foodLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} 
                    Analyze Food Safety
                  </Button>

                  {foodError && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>{foodError}</AlertDescription>
                    </Alert>
                  )}

                  {foodAnalysisResult && renderEnhancedAnalysis(
                    foodAnalysisResult.analysis_text, 
                    foodAnalysisResult.safety_status
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer/>
    </div>
  );
};

export default PregnancyCare;