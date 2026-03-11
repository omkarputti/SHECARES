import { useState, useRef, useEffect, useCallback } from "react";
import { getUserLocation } from "../../utils/getUserLocation"
import Header from "../components/Header";
/* -----------------------
/* -----------------------
   API Service for Disease Prediction
   ----------------------- */

const apiService = {
  BASE_URL: "http://localhost:8003",
  
  async quickPredict(symptoms: string) {
    const url = `${this.BASE_URL}/disease/predict-quick`;
    const fd = new FormData();
    fd.append("symptoms", symptoms);

    const res = await fetch(url, {
      method: "POST",
      body: fd,
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`API Error: ${res.status} ${text}`);
    }

    return res.json();
  },

  async answerQuestion(sessionId: string, answer: string) {
    const url = `${this.BASE_URL}/disease/answer-question`;
    const fd = new FormData();
    fd.append("session_id", sessionId);
    fd.append("answer", answer);

    const res = await fetch(url, {
      method: "POST",
      body: fd,
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`API Error: ${res.status} ${text}`);
    }

    return res.json();
  },

  async detailedAnalysis(sessionId: string) {
    const url = `${this.BASE_URL}/disease/analyze-detailed`;
    const fd = new FormData();
    fd.append("session_id", sessionId);

    const res = await fetch(url, {
      method: "POST",
      body: fd,
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`API Error: ${res.status} ${text}`);
    }

    return res.json();
  },

  async chatAboutDisease(message: string, context: string) {
    const url = `${this.BASE_URL}/disease/chat`;
    const fd = new FormData();
    fd.append("message", message);
    fd.append("context", context);

    const res = await fetch(url, {
      method: "POST",
      body: fd,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`API Error: ${res.status} ${text}`);
    }

    return res.json();
  },
};
/* ---------- Icons ---------- */
const ActivityIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
    <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
  </svg>
);

const SendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
    <path d="m22 2-7 20-4-9-9-4Z"/>
    <path d="M22 2 11 13"/>
  </svg>
);

const LoaderIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 animate-spin text-gray-500">
    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
  </svg>
);

const AlertIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
    <path d="M12 9v4"/>
    <path d="M12 17h.01"/>
  </svg>
);

const BrainIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
    <path d="M12 5a3 3 0 1 0-5.993 1.002h.001a4 4 0 0 0-3.38 5.42A6 6 0 0 0 12 18a6 6 0 0 0 5.373-3.578A4 4 0 0 0 18.998 9a3 3 0 1 0-6.995-4.002h-.001Z"/>
  </svg>
);

const MessageCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>
  </svg>
);

const FlipIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
    <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
    <path d="M3 3v5h5"/>
    <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
    <path d="M16 16h5v5"/>
  </svg>
);

/* ---------- Typewriter hook ---------- */
const useTypewriter = (text: string, speed = 12) => {
  const [displayedText, setDisplayedText] = useState("");
  useEffect(() => {
    setDisplayedText("");
    if (!text) return;
    let i = 0;
    const id = setInterval(() => {
      if (i < text.length) {
        setDisplayedText((p) => p + text.charAt(i));
        i++;
      } else clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);
  return displayedText;
};

const TypewriterText = ({ text }: { text: string }) => {
  const displayed = useTypewriter(text);
  return <div className="whitespace-pre-wrap font-mono text-xs">{displayed}</div>;
};

/* ---------- Helper function to parse ML output ---------- */
const parseMLOutput = (mlText: string) => {
  // Extract primary, secondary, tertiary diagnoses
  const conditions = [];
  
  const primaryMatch = mlText.match(/1️⃣ PRIMARY DIAGNOSIS:[\s\S]*?Condition: (.*?)[\n\r][\s\S]*?Confidence: ([\d.]+)%[\s\S]*?Risk Level: (\w+)/i);
  if (primaryMatch) {
    conditions.push({
      rank: 1,
      name: primaryMatch[1].trim(),
      confidence: primaryMatch[2].trim(),
      risk: primaryMatch[3].trim()
    });
  }
  
  const secondaryMatch = mlText.match(/2️⃣ SECONDARY DIAGNOSIS:[\s\S]*?Condition: (.*?)[\n\r][\s\S]*?Confidence: ([\d.]+)%[\s\S]*?Risk Level: (\w+)/i);
  if (secondaryMatch) {
    conditions.push({
      rank: 2,
      name: secondaryMatch[1].trim(),
      confidence: secondaryMatch[2].trim(),
      risk: secondaryMatch[3].trim()
    });
  }
  
  const tertiaryMatch = mlText.match(/3️⃣ TERTIARY DIAGNOSIS:[\s\S]*?Condition: (.*?)[\n\r][\s\S]*?Confidence: ([\d.]+)%[\s\S]*?Risk Level: (\w+)/i);
  if (tertiaryMatch) {
    conditions.push({
      rank: 3,
      name: tertiaryMatch[1].trim(),
      confidence: tertiaryMatch[2].trim(),
      risk: tertiaryMatch[3].trim()
    });
  }
  
  // Extract recommendations
  const recommendationsMatch = mlText.match(/⚕️ MEDICAL RECOMMENDATIONS[\s\S]*?═{40,}([\s\S]*?)═{40,}/);
  const recommendations = recommendationsMatch 
    ? recommendationsMatch[1].trim().split('\n').filter(line => line.trim().startsWith('•')).map(line => line.replace('•', '').trim())
    : [];
  
  // Extract severity
  const severityMatch = mlText.match(/Overall Risk: (\w+)/i);
  const urgencyMatch = mlText.match(/Urgency: (\w+)/i);
  
  return {
    conditions,
    recommendations,
    severity: severityMatch ? severityMatch[1] : 'Unknown',
    urgency: urgencyMatch ? urgencyMatch[1] : 'Unknown'
  };
};

/* ---------- Convert medical terms to common names ---------- */
const getCommonName = (medicalName: string) => {
  const commonNames: Record<string, string> = {
    'PCOS (Polycystic Ovary Syndrome)': 'Ovarian Cysts (Hormonal)',
    'PCOS': 'Ovarian Cysts (Hormonal)',
    'Polycystic Ovary Syndrome': 'Ovarian Cysts (Hormonal)',
    'Endometriosis': 'Uterine Tissue Growth',
    'Dysmenorrhea': 'Painful Periods',
    'Amenorrhea': 'Absent Periods',
    'Menorrhagia': 'Heavy Periods',
    'Hypothyroidism': 'Low Thyroid Function',
    'Hyperthyroidism': 'High Thyroid Function',
    'Thyroid Disorder': 'Thyroid Issues',
    'UTI': 'Urinary Tract Infection',
    'Anemia': 'Low Iron / Blood Count',
    'Fibroid Tumors': 'Non-cancerous Uterine Growths',
    'Ovarian Cysts': 'Fluid-filled Ovarian Sacs',
    'Migraine': 'Severe Headache',
    'Anxiety': 'Excessive Worry',
    'Depression': 'Low Mood / Sadness'
  };
  
  // Check for exact match first
  if (commonNames[medicalName]) {
    return commonNames[medicalName];
  }
  
  // Check for partial matches
  for (const [medical, common] of Object.entries(commonNames)) {
    if (medicalName.toLowerCase().includes(medical.toLowerCase())) {
      return common;
    }
  }
  
  return medicalName; // Return original if no match
};

/* ---------- Types ---------- */
type ChatMessage = { sender: "user" | "bot"; text: string };
type Condition = { name: string; confidence: string; description: string };

/* ---------- Main Component ---------- */
const DiseasePredictor = () => {
  // Replace existing state declarations with:
const [symptoms, setSymptoms] = useState("");
const [sessionId, setSessionId] = useState<string | null>(null);
const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
const [questionNumber, setQuestionNumber] = useState(0);
const [totalQuestions, setTotalQuestions] = useState(0);
const [isAnswering, setIsAnswering] = useState(false);
const [isStartingDiagnosis, setIsStartingDiagnosis] = useState(false);
const [detailedAnalysis, setDetailedAnalysis] = useState<string | null>(null);
const [showChat, setShowChat] = useState(false);
const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
const [userInput, setUserInput] = useState("");
const [isChatLoading, setIsChatLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
const [isFlipped, setIsFlipped] = useState(false);
const chatContainerRef = useRef<HTMLDivElement | null>(null);
const [quickResults, setQuickResults] = useState<Condition[] | null>(null);
const [isLoadingDetailed, setIsLoadingDetailed] = useState(false);
const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const scrollToBottom = useCallback(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, []);
useEffect(() => {
    getUserLocation()
      .then(coords => {
        setCoordinates({
          lat: coords.latitude,
          lng: coords.longitude
        });
      })
      .catch(error => console.error('Location error:', error));
  }, []);
  const handleDoctor = () => {
    if (coordinates) {
      const url = `https://www.google.com/maps/search/obgyn+gynecologist/@${coordinates.lat},${coordinates.lng},14z/data=!3m1!4b1`;
      window.open(url, '_blank');
    } else {
      window.open('https://www.google.com/maps/search/obgyn+gynecologist', '_blank');
    }
  };
  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, scrollToBottom]);

 const handleQuickPredict = async () => {
  if (!symptoms.trim()) {
    setError("Please enter your symptoms");
    return;
  }

  setIsStartingDiagnosis(true);
  setError(null);
  setCurrentQuestion(null);
  setDetailedAnalysis(null);
  setShowChat(false);
  setSessionId(null);
  setQuickResults(null); // Add this line

  try {
    const result = await apiService.quickPredict(symptoms);
    
    // Show quick results first
    if (result.quick_conditions) { // Add this block
      setQuickResults(result.quick_conditions);
    }
    
    setSessionId(result.session_id);
    setCurrentQuestion(result.question);
    setQuestionNumber(result.current_question);
    setTotalQuestions(result.total_questions);
  } catch (err: any) {
    setError("Could not connect to the prediction service. Please try again.");
  } finally {
    setIsStartingDiagnosis(false);
  }
};
const handleAnswerQuestion = async (answer: string) => {
  if (!sessionId) return;
  
  setIsAnswering(true);
  setError(null);
  
  try {
    const result = await apiService.answerQuestion(sessionId, answer);
    
    if (result.status === "in_progress") {
      setCurrentQuestion(result.question);
      setQuestionNumber(result.current_question);
    } else if (result.status === "completed") {
      // All questions answered, generate diagnosis
      setCurrentQuestion(null);
      await handleDetailedAnalysis();
    }
  } catch (err: any) {
    setError("Error processing answer. Please try again.");
  } finally {
    setIsAnswering(false);
  }
};

const handleDetailedAnalysis = async () => {
  if (!sessionId) return;
  
  setIsLoadingDetailed(true); // Change from setIsAnswering to setIsLoadingDetailed
  setError(null); // Add this
  try {
    const result = await apiService.detailedAnalysis(sessionId);
    setDetailedAnalysis(result.detailed_analysis);
    setChatMessages([
      { sender: "bot", text: "✅ Detailed analysis complete! You can ask me:\n\n• 'What does this mean?'\n• 'How accurate is this?'\n• 'Should I be worried?'\n• Or provide additional symptoms for refined analysis" }
    ]);
    setShowChat(true);
  } catch (err: any) {
    setError("Could not perform detailed analysis. Please try again.");
  } finally {
    setIsLoadingDetailed(false); // Change from setIsAnswering
  }
};
  const handleSendMessage = async () => {
    if (!userInput.trim()) return;
    const text = userInput.trim();
    setChatMessages((p) => [...p, { sender: "user", text }]);
    setUserInput("");
    setIsChatLoading(true);

    try {
      const result = await apiService.chatAboutDisease(text, detailedAnalysis || "");
      const reply = result?.reply ?? "Sorry, no reply.";
      setChatMessages((p) => [...p, { sender: "bot", text: reply }]);
    } catch (err: any) {
      setChatMessages((p) => [...p, { sender: "bot", text: "I'm having trouble connecting right now. Please try again later." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const parsedData = detailedAnalysis ? parseMLOutput(detailedAnalysis) : null;

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#ffd6e6_0%,#ffeef6_40%,#fff7fb_100%)] text-gray-900 antialiased">
      <Header/>
      <header className="py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="space-y-1">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
              <span className="inline-block transform -skew-x-6">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-600 via-fuchsia-600 to-purple-700 text-5xl md:text-7xl">AI Disease</span>
              </span>
              <div className="mt-2">
                <span className="inline-block px-4 py-2 rounded-md bg-white/60 backdrop-blur-md shadow-lg text-4xl md:text-6xl font-extrabold text-pink-600">Predictor</span>
              </div>
            </h1>
            <p className="mt-4 text-gray-600 max-w-2xl mx-auto">ML-powered medical analysis with interactive follow-up support</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 pb-12">
        <div className="max-w-5xl mx-auto">
          
          {/* Symptom Input Card */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl border border-pink-50 p-6 mb-8 hover:shadow-[0_20px_50px_rgba(255,182,193,0.15)] transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-gradient-to-br from-pink-50 to-white shadow-inner">
                <ActivityIcon />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Describe Your Symptoms</h3>
                <p className="text-sm text-gray-500">Enter symptoms separated by commas or as a paragraph</p>
              </div>
            </div>
{/* Quick Prediction - 3 Blocks */}
{quickResults && !detailedAnalysis && (
  <div className="mb-8">
    <h3 className="text-2xl font-bold text-center mb-6 text-gray-800">Initial Predictions</h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {quickResults.map((condition, idx) => (
        <div
          key={idx}
          className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border-2 border-pink-100 p-5 hover:shadow-2xl hover:scale-105 transition-all"
        >
          <div className="text-center">
            <div className="text-4xl mb-3">
              {idx === 0 ? "🥇" : idx === 1 ? "🥈" : "🥉"}
            </div>
            <h4 className="text-lg font-bold text-gray-800 mb-2">{getCommonName(condition.name)}</h4>
            <div className="text-2xl font-bold text-pink-600 mb-2">{condition.confidence}</div>
            <p className="text-sm text-gray-600">{condition.description}</p>
          </div>
        </div>
      ))}
    </div>
    
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <p className="text-sm text-blue-800 text-center">
        💡 <strong>Continue with detailed questions</strong> for more accurate diagnosis
      </p>
    </div>
  </div>
)}
<textarea
  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-200 min-h-[120px] resize-y"
  placeholder="E.g., fever, headache, fatigue, nausea, irregular periods, abdominal pain, mood swings..."
  value={symptoms}
  onChange={(e) => setSymptoms(e.target.value)}
  disabled={isStartingDiagnosis || isAnswering}
/>
            {error && (
              <div className="mt-3 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm flex items-center gap-2">
                <AlertIcon />
                {error}
              </div>
            )}

<button
  onClick={handleQuickPredict}
  disabled={isStartingDiagnosis || isAnswering}
  className="mt-4 w-full py-3 rounded-lg bg-gradient-to-r from-pink-500 to-fuchsia-600 text-white font-semibold shadow-lg hover:scale-[1.02] active:scale-[0.99] transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
>
  {isStartingDiagnosis ? (
    <>
      <LoaderIcon />
      Starting Diagnosis...
    </>
  ) : (
    "🔬 Start Diagnosis"
  )}
</button>
          </div>

{/* Question Flow */}
{currentQuestion && !detailedAnalysis && (
  <div className="mb-8">
    {/* Add processing notification at the top */}
    {isAnswering && questionNumber === totalQuestions && (
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-4 mb-4 animate-pulse">
        <div className="flex items-center gap-3">
          <LoaderIcon />
          <div>
            <p className="font-semibold text-purple-800">🔬 Analyzing Your Responses...</p>
            <p className="text-sm text-purple-600">Our ML model is processing {totalQuestions} data points to generate your diagnosis</p>
          </div>
        </div>
      </div>
    )}
    
    <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-pink-50 p-6">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">
            Question {questionNumber} of {totalQuestions}
          </span>
          <span className="text-sm font-medium text-pink-600">
            {Math.round((questionNumber / totalQuestions) * 100)}% Complete
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-pink-500 to-fuchsia-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">{currentQuestion}</h3>
        <p className="text-sm text-gray-500">Please select the most accurate answer</p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {[
          { label: "Yes", value: "yes", color: "from-green-500 to-emerald-600", emoji: "✅" },
          { label: "Probably Yes", value: "probably_yes", color: "from-lime-500 to-green-600", emoji: "🟢" },
          { label: "Don't Know", value: "dont_know", color: "from-gray-400 to-gray-600", emoji: "❓" },
          { label: "Probably No", value: "probably_no", color: "from-orange-500 to-amber-600", emoji: "🟠" },
          { label: "No", value: "no", color: "from-red-500 to-rose-600", emoji: "❌" }
        ].map((option) => (
          <button
            key={option.value}
            onClick={() => handleAnswerQuestion(option.value)}
            disabled={isAnswering}
            className={`w-full py-3 px-4 rounded-lg bg-gradient-to-r ${option.color} text-white font-semibold shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-50 flex items-center justify-center gap-3`}
          >
            <span className="text-xl">{option.emoji}</span>
            {option.label}
          </button>
        ))}
      </div>
{isAnswering && (
  <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
    <div className="flex items-center justify-center gap-2 text-gray-700">
      <LoaderIcon />
      <div className="text-center">
        <p className="font-semibold">
          {questionNumber === totalQuestions 
            ? "🧠 Running ML Analysis..." 
            : "Processing your answer..."}
        </p>
        {questionNumber === totalQuestions && (
          <p className="text-xs text-gray-600 mt-1">
            Analyzing symptoms • Calculating probabilities • Generating diagnosis
          </p>
        )}
      </div>
    </div>
  </div>
)}
      {isAnswering && (
        <div className="mt-4 flex items-center justify-center gap-2 text-gray-600">
          <LoaderIcon />
          <span>
            {questionNumber === totalQuestions 
              ? "Generating final diagnosis..." 
              : "Processing your answer..."}
          </span>
        </div>
      )}
    </div>
  </div>
)}

          {/* Disclaimer */}
          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8">
            <div className="flex items-start gap-2 mb-3">
              <AlertIcon />
              <div className="text-sm">
                <p className="font-semibold text-amber-800 mb-1">⚠️ Medical Disclaimer</p>
                <p className="text-amber-700 text-xs">ML predictions are for informational purposes only. Accuracy: ~70-78%. Not a substitute for professional medical diagnosis.</p>
              </div>
            </div>
            <button 
              onClick={handleDoctor}
              className="w-full py-2 rounded-md bg-pink-600 text-white font-medium hover:bg-pink-700 transition"
            >
              📞 Contact a Professional
            </button>
          </div>

          {/* Detailed Analysis with Flip Animation */}
          {detailedAnalysis && parsedData && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Flippable Card */}
              <div className="relative h-[500px]" style={{ perspective: '1000px' }}>
                <div 
                  className="relative w-full h-full transition-transform duration-700 cursor-pointer"
                  style={{ 
                    transformStyle: 'preserve-3d',
                    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                  }}
                  onClick={() => setIsFlipped(!isFlipped)}
                >
                  {/* Front Side - User Friendly */}
                  <div 
                    className="absolute inset-0 bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-pink-50 p-6"
                    style={{ 
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden'
                    }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-pink-50 to-white shadow-inner">
                          <BrainIcon />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-pink-600">AI Analysis Results</h3>
                          <p className="text-xs text-gray-500">Based on your symptoms</p>
                        </div>
                      </div>
                      <button className="p-2 rounded-lg bg-pink-50 hover:bg-pink-100 transition">
                        <FlipIcon />
                      </button>
                    </div>

                    <div className="space-y-4 max-h-[380px] overflow-y-auto">
                      {/* Conditions */}
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-3">Top Predictions:</h4>
                        {parsedData.conditions.map((cond, idx) => (
                          <div key={idx} className="mb-3 p-3 rounded-lg bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-100">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-lg">{idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}</span>
                                  <h5 className="font-semibold text-gray-800">{getCommonName(cond.name)}</h5>
                                </div>
                                <p className="text-xs text-gray-600 ml-7">Risk Level: <span className={`font-medium ${cond.risk.toLowerCase() === 'high' || cond.risk.toLowerCase() === 'critical' ? 'text-red-600' : cond.risk.toLowerCase() === 'medium' ? 'text-amber-600' : 'text-green-600'}`}>{cond.risk}</span></p>
                              </div>
                              <div className="text-right">
                                <div className="text-xl font-bold text-pink-600">{cond.confidence}%</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Recommendations */}
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">Recommendations:</h4>
                        <ul className="space-y-2">
                          {parsedData.recommendations.slice(0, 4).map((rec, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                              <span className="text-pink-500 mt-0.5">•</span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Severity */}
                      <div className="p-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-700">Overall Risk:</span>
                          <span className={`font-semibold ${parsedData.severity.toLowerCase() === 'high' || parsedData.severity.toLowerCase() === 'critical' ? 'text-red-600' : parsedData.severity.toLowerCase() === 'moderate' ? 'text-amber-600' : 'text-green-600'}`}>
                            {parsedData.severity}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm mt-1">
                          <span className="text-gray-700">Urgency:</span>
                          <span className="font-semibold text-indigo-600">{parsedData.urgency}</span>
                        </div>
                      </div>

                      <p className="text-xs text-gray-500 text-center mt-4 italic">Tap card to view technical ML output</p>
                    </div>
                  </div>

                  {/* Back Side - ML Output */}
                  <div 
                    className="absolute inset-0 bg-gray-900 text-green-400 rounded-2xl shadow-2xl border border-gray-700 p-6"
                    style={{ 
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)'
                    }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-green-900/30">
                          <BrainIcon />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-green-400">ML Model Output</h3>
                          <p className="text-xs text-gray-400">Medical AI Classification System v2.0</p>
                        </div>
                      </div>
                      <button className="p-2 rounded-lg bg-green-900/30 hover:bg-green-900/50 transition">
                        <FlipIcon />
                      </button>
                    </div>

                    <div className="bg-black/40 border border-gray-700 rounded-lg p-4 max-h-[400px] overflow-y-auto">
                      <TypewriterText text={detailedAnalysis} />
                    </div>

                    <p className="text-xs text-gray-500 text-center mt-4 italic">Tap card to view user-friendly summary</p>
                  </div>
                </div>
              </div>

              {/* Interactive Chat */}
              {showChat && (
                <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl border border-pink-50 p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-blue-50 to-white">
                      <MessageCircleIcon />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Ask Questions</h3>
                      <p className="text-sm text-gray-500">Clarify or get more insights</p>
                    </div>
                  </div>

                  <div 
                    ref={chatContainerRef}
                    className="h-64 overflow-y-auto rounded-lg p-4 space-y-3 bg-gradient-to-b from-white to-pink-50 border border-pink-100 mb-4"
                  >
                    {chatMessages.map((m, i) => {
                      const isUser = m.sender === "user";
                      const bubbleBase = "rounded-xl px-4 py-2 shadow-sm max-w-[85%] break-words";
                      const isMLOutput = m.sender === "bot" && m.text.includes("═══");
                      
                      return (
                        <div key={i} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                          <div className={`${bubbleBase} ${
                            isUser 
                              ? "bg-pink-600 text-white" 
                              : isMLOutput 
                                ? "bg-gray-900 text-green-400 font-mono text-xs w-full max-w-full" 
                                : "bg-white border border-gray-200 text-gray-800"
                          }`}>
                            <p className={`${isMLOutput ? "text-xs leading-relaxed whitespace-pre-wrap" : "text-sm leading-relaxed"}`}>
                              {m.text}
                            </p>
                          </div>
                        </div>
                      );
                    })}

                    {isChatLoading && (
                      <div className="flex justify-start">
                        <div className="rounded-xl px-4 py-3 bg-white border shadow-sm">
                          <LoaderIcon />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 items-center">
                    <input
                      className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-200 disabled:bg-gray-100 text-sm"
                      placeholder="Ask a question..."
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !isChatLoading && handleSendMessage()}
                      disabled={isChatLoading}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={isChatLoading}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-fuchsia-600 text-white shadow hover:scale-[1.02] active:scale-[0.99] transition-transform disabled:opacity-50"
                    >
                      {isChatLoading ? <LoaderIcon /> : <SendIcon />}
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>
      </main>

      <footer className="py-6 text-center text-sm text-gray-600 border-t bg-white/60">
        © 2025 SheCares Inc. All rights reserved.
      </footer>
    </div>
  );
};

export default DiseasePredictor;