import { useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar, Utensils, Loader2, CheckCircle, AlertTriangle, Info } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/config/firebase';
import EmergencySafety from "@/components/EmergencySafety";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface DueDateResult {
  estimated_due_date: string;
}

const PregnancyCare = () => {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();

  const [lmpDate, setLmpDate] = useState('');
  const [dueDate, setDueDate] = useState<DueDateResult | null>(null);
  const [dueDateLoading, setDueDateLoading] = useState(false);
  const [dueDateError, setDueDateError] = useState<string | null>(null);

  const [foodImage, setFoodImage] = useState<File | null>(null);
  const [foodAnalysisText, setFoodAnalysisText] = useState<string | null>(null);
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
    setFoodAnalysisText(null);

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
      setFoodAnalysisText(result.analysis_text);
    } catch (err: any) {
      setFoodError(err.message);
    } finally {
      setFoodLoading(false);
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
                  Upload a food image to get pregnancy-safe analysis and nutritional insights.
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
                      <AlertDescription>{foodError}</AlertDescription>
                    </Alert>
                  )}

                  {foodAnalysisText && (
                    <div className="bg-gradient-to-br from-green-50 to-white rounded-2xl p-5 border border-green-200 shadow-md hover:shadow-lg transition-all duration-300 animate-fade-in">
                      <div className="flex items-center gap-2 mb-4 text-green-700">
                        <CheckCircle className="h-5 w-5" />
                        <h3 className="text-lg font-semibold">Food Analysis Result</h3>
                      </div>
                      <div className="prose prose-sm max-w-none text-gray-800">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={MarkdownComponents}
                        >
                          {foodAnalysisText}
                        </ReactMarkdown>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PregnancyCare;