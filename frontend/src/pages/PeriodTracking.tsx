import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";

type PredictionResult = {
  predicted_cycle_length_days: number;
  next_period_predicted_date: string;
  approximate_ovulation_date: string;
  fertile_window_start: string;
  fertile_window_end: string;
};

type PredictResponse = {
  session_id: string;
  model_results: PredictionResult;
  first_question: string;
};

type ChatResponse = {
  session_id: string;
  reply: string;
};

const backendBase = import.meta.env?.VITE_BACKEND_URL || "http://0.0.0.0:8001";


const PeriodTracking = () => {
  const [lastPeriodDate, setLastPeriodDate] = useState("");
  const [age, setAge] = useState(25);
  const [bmi, setBmi] = useState(22.0);
  const [stressLevel, setStressLevel] = useState(3);
  const [sleepHours, setSleepHours] = useState(7.5);
  const [periodLength, setPeriodLength] = useState(5);
  const [exerciseFreq, setExerciseFreq] = useState("Moderate");
  const [diet, setDiet] = useState("Balanced");
  const [symptoms, setSymptoms] = useState("Cramps");

  const [isLoading, setIsLoading] = useState(false);
  const [predictError, setPredictError] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [modelResult, setModelResult] = useState(null);

  const [chat, setChat] = useState([]);
  const [message, setMessage] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [finalAnalysis, setFinalAnalysis] = useState(null);
  const [accuracyPercent, setAccuracyPercent] = useState(null);

  const messageRef = useRef(null);

  useEffect(() => {
    if (messageRef.current) {
      messageRef.current.scrollTop = messageRef.current.scrollHeight;
    }
  }, [chat]);

  const handlePrediction = async () => {
    setPredictError(null);
    setIsLoading(true);
    setModelResult(null);
    setSessionId(null);
    setChat([]);
    setFinalAnalysis(null);
    setAccuracyPercent(null);

    if (!lastPeriodDate) {
      setPredictError("Please enter your last period date.");
      setIsLoading(false);
      return;
    }

    try {
      const payload = {
        age: Number(age),
        bmi: Number(bmi),
        stress_level: Number(stressLevel),
        exercise_freq: typeof exerciseFreq === 'string' ? (exerciseFreq === 'Low' ? 1 : exerciseFreq === 'Moderate' ? 3 : 5) : Number(exerciseFreq),
        sleep_hours: Number(sleepHours),
        diet: String(diet),
        period_length: Number(periodLength),
        symptoms: String(symptoms),
        last_period_date: lastPeriodDate, // input type date returns YYYY-MM-DD
      };

      const res = await fetch(`${backendBase}/predict-ovulation/advanced`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const eData = await res.json().catch(() => ({}));
        throw new Error(eData.detail || "Prediction failed.");
      }

      const data = await res.json();
      setSessionId(data.session_id);
      setModelResult(data.model_results);

      setChat((c) => [
        ...c,
        {
          who: "assistant",
          text: `Model result: Next period ${new Date(
            data.model_results.next_period_predicted_date
          ).toLocaleDateString()}, Ovulation ${new Date(
            data.model_results.approximate_ovulation_date
          ).toLocaleDateString()}.`,
        },
      ]);

      setChat((c) => [...c, { who: "assistant", text: data.first_question }]);
    } catch (err) {
      setPredictError(err.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!sessionId) return;
    if (!message.trim()) return;

    const userText = message.trim();
    setChat((c) => [...c, { who: "user", text: userText }]);
    setMessage("");
    setChatLoading(true);

    try {
      const res = await fetch(`${backendBase}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, user_message: userText }),
      });

      if (!res.ok) {
        const eData = await res.json().catch(() => ({}));
        throw new Error(eData.detail || "Chat failed.");
      }

      const data = await res.json();
      const reply = data.reply;
      setChat((c) => [...c, { who: "assistant", text: reply }]);

      const accuracyMatch = reply.match(/(\d{1,3})\s*%/);
      const containsAccuracyWord = /accuracy|estimated accuracy|estimated|accuracy percentage/i.test(reply);

      if (accuracyMatch) {
        const pct = parseInt(accuracyMatch[1], 10);
        setAccuracyPercent(isNaN(pct) ? null : pct);
        setFinalAnalysis(reply);
      } else if (containsAccuracyWord && /\d/.test(reply)) {
        const num = reply.match(/(\d{1,3})/);
        if (num) setAccuracyPercent(parseInt(num[1], 10));
        setFinalAnalysis(reply);
      }
    } catch (err) {
      setChat((c) => [...c, { who: "assistant", text: `Error: ${err.message}` }]);
    } finally {
      setChatLoading(false);
    }
  };

  const fmt = (iso) => (iso ? new Date(iso).toLocaleDateString() : "--");

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-pink-100">
      <Header />
       <br></br>
       <br></br>

      <main className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-pink-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            🌸 Period Predictor
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Advanced AI-powered cycle prediction with personalized health insights
          </p>
        </motion.div>

        <div className="max-w-7xl mx-auto flex flex-col items-center gap-8">
          {/* Centered larger main card */}
          <motion.div
            initial={{ y: 30, opacity: 0, rotateX: -15 }}
            animate={{ y: 0, opacity: 1, rotateX: 0 }}
            transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
            whileHover={{ scale: 1.02, rotateY: 2 }}
            className="rounded-3xl shadow-2xl p-12 bg-white/80 backdrop-blur-xl border-2 border-pink-200/50 mx-auto w-full max-w-4xl"
            style={{
              transformStyle: "preserve-3d",
              boxShadow: "0 30px 80px rgba(236, 72, 153, 0.18)"
            }}
          >
            

            <CardContent className="space-y-5">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Label className="text-sm font-semibold text-gray-700">Last Period Date</Label>
                <Input 
                  type="date" 
                  value={lastPeriodDate} 
                  onChange={(e) => setLastPeriodDate(e.target.value)}
                  className="mt-1 border-pink-200 focus:border-pink-400 focus:ring-pink-400 transition-all duration-300"
                />
              </motion.div>

              <motion.div 
                className="grid grid-cols-2 gap-3"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Age</Label>
                  <Input 
                    type="number" 
                    min={12} 
                    max={60} 
                    value={age} 
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="mt-1 border-pink-200 focus:border-pink-400 focus:ring-pink-400 transition-all"
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-700">BMI</Label>
                  <Input 
                    type="number" 
                    step="0.1" 
                    value={bmi} 
                    onChange={(e) => setBmi(Number(e.target.value))}
                    className="mt-1 border-pink-200 focus:border-pink-400 focus:ring-pink-400 transition-all"
                  />
                </div>
              </motion.div>

              <motion.div 
                className="grid grid-cols-2 gap-3"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Stress (1-5)</Label>
                  <Input 
                    type="number" 
                    min={1} 
                    max={5} 
                    value={stressLevel} 
                    onChange={(e) => setStressLevel(Number(e.target.value))}
                    className="mt-1 border-pink-200 focus:border-pink-400 focus:ring-pink-400 transition-all"
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Sleep Hours</Label>
                  <Input 
                    type="number" 
                    step="0.5" 
                    value={sleepHours} 
                    onChange={(e) => setSleepHours(Number(e.target.value))}
                    className="mt-1 border-pink-200 focus:border-pink-400 focus:ring-pink-400 transition-all"
                  />
                </div>
              </motion.div>

              <motion.div 
                className="grid grid-cols-2 gap-3"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Period Length (days)</Label>
                  <Input 
                    type="number" 
                    min={1} 
                    max={15} 
                    value={periodLength} 
                    onChange={(e) => setPeriodLength(Number(e.target.value))}
                    className="mt-1 border-pink-200 focus:border-pink-400 focus:ring-pink-400 transition-all"
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Exercise</Label>
                  <Select value={exerciseFreq} onValueChange={(v) => setExerciseFreq(v)}>
                    <SelectTrigger className="mt-1 border-pink-200 focus:border-pink-400 focus:ring-pink-400">
                      <SelectValue placeholder="Exercise frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Moderate">Moderate</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </motion.div>

              <motion.div 
                className="grid grid-cols-2 gap-3"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Diet</Label>
                  <Select value={diet} onValueChange={(v) => setDiet(v)}>
                    <SelectTrigger className="mt-1 border-pink-200 focus:border-pink-400 focus:ring-pink-400">
                      <SelectValue placeholder="Diet" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Balanced">Balanced</SelectItem>
                      <SelectItem value="Vegetarian">Vegetarian</SelectItem>
                      <SelectItem value="High Sugar">High Sugar</SelectItem>
                      <SelectItem value="Low Carb">Low Carb</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Symptoms</Label>
                  <Select value={symptoms} onValueChange={(v) => setSymptoms(v)}>
                    <SelectTrigger className="mt-1 border-pink-200 focus:border-pink-400 focus:ring-pink-400">
                      <SelectValue placeholder="Symptom" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cramps">Cramps</SelectItem>
                      <SelectItem value="Mood Swings">Mood Swings</SelectItem>
                      <SelectItem value="Fatigue">Fatigue</SelectItem>
                      <SelectItem value="Bloating">Bloating</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </motion.div>

              {predictError && (
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200"
                >
                  {predictError}
                </motion.div>
              )}

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  onClick={handlePrediction} 
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Analyzing Your Data...
                    </>
                  ) : (
                    <span className="text-lg">✨ Predict & Start Chat</span>
                  )}
                </Button>
              </motion.div>
            </CardContent>
          </motion.div>

          <div className="lg:col-span-2 space-y-6">
            <AnimatePresence>
              {modelResult && (
                <motion.div
                  initial={{ y: 20, opacity: 0, scale: 0.9 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.5, type: "spring", stiffness: 120 }}
                  className="w-full"
                >
                  <Card className="p-6 bg-gradient-to-br from-pink-50 via-purple-50 to-pink-50 rounded-3xl shadow-2xl border-2 border-pink-200/30 overflow-hidden relative">
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-pink-400/5 to-purple-400/5"
                      animate={{
                        backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                      }}
                      transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                      style={{ backgroundSize: "200% 200%" }}
                    />
                    
                    <div className="relative z-10">
                      <div className="flex items-start justify-between gap-4">
                        <motion.div
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.2 }}
                        >
                          <h3 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-purple-600 to-pink-600">
                            ✨ Quick ML Output
                          </h3>
                          <p className="text-sm text-muted-foreground mt-2">AI-generated predictions based on your health data</p>
                        </motion.div>
                        <motion.div 
                          className="text-right"
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                        >
                          <div className="text-xs text-muted-foreground mb-2">Cycle Length</div>
                          <motion.div 
                            className="text-4xl font-extrabold bg-gradient-to-br from-pink-600 to-purple-600 bg-clip-text text-transparent"
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            {modelResult.predicted_cycle_length_days} days
                          </motion.div>
                        </motion.div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                        {[
                          { label: "Next Period", value: fmt(modelResult.next_period_predicted_date), icon: "📅", delay: 0.4 },
                          { label: "Ovulation", value: fmt(modelResult.approximate_ovulation_date), icon: "🌸", delay: 0.5 },
                          { label: "Fertile Window", value: `${fmt(modelResult.fertile_window_start)} - ${fmt(modelResult.fertile_window_end)}`, icon: "💫", delay: 0.6 }
                        ].map((item, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ y: 30, opacity: 0, rotateX: -15 }}
                            animate={{ y: 0, opacity: 1, rotateX: 0 }}
                            transition={{ delay: item.delay, type: "spring" }}
                            whileHover={{ 
                              y: -8, 
                              scale: 1.05,
                              boxShadow: "0 20px 40px rgba(236, 72, 153, 0.2)",
                              transition: { duration: 0.2 }
                            }}
                            className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-pink-100 cursor-pointer"
                            style={{ transformStyle: "preserve-3d" }}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-2xl">{item.icon}</span>
                              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{item.label}</div>
                            </div>
                            <div className="font-bold text-lg text-gray-800">{item.value}</div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {sessionId && (
              <motion.div 
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
                className="mx-auto rounded-3xl shadow-2xl p-6 bg-white/80 backdrop-blur-xl border-2 border-purple-200/50"
                style={{ boxShadow: "0 20px 60px rgba(168, 85, 247, 0.15)" }}
              >
                <div className="flex items-center justify-between mb-4">
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <h4 className="font-bold text-xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      💬 Chat with Health Assistant
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">Answer questions to refine your prediction</p>
                  </motion.div>
                  <motion.div 
                    className="text-sm text-muted-foreground bg-purple-100 px-3 py-1 rounded-full"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: "spring" }}
                  >
                    Session: <span className="font-mono text-xs font-semibold">{sessionId.slice(-8)}</span>
                  </motion.div>
                </div>

                <motion.div
                  ref={messageRef}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="h-64 overflow-y-auto rounded-2xl p-4 space-y-3 bg-gradient-to-b from-purple-50/50 to-pink-50/50 backdrop-blur-sm border border-purple-100"
                >
                  <AnimatePresence>
                    {chat.map((m, idx) => (
                      <motion.div 
                        key={idx} 
                        initial={{ y: 10, opacity: 0, scale: 0.9 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ y: -10, opacity: 0, scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 200, damping: 20 }}
                        className={`max-w-[85%] ${m.who === "assistant" ? "ml-0" : "ml-auto"}`}
                      >
                        <motion.div
                          whileHover={{ scale: 1.02, y: -2 }}
                          className={`px-4 py-3 rounded-2xl break-words shadow-md ${
                            m.who === "assistant" 
                              ? "bg-gradient-to-br from-white to-purple-50 border border-purple-100" 
                              : "bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-lg"
                          }`}
                          style={{ transformStyle: "preserve-3d" }}
                        >
                          <div className="text-sm font-medium">{m.text}</div>
                        </motion.div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>

                <motion.form 
                  onSubmit={handleSendMessage} 
                  className="mt-4 flex gap-3"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                    placeholder={chatLoading ? "Waiting for assistant..." : "Type your answer..."}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="flex-1 px-5 py-3 rounded-full border-2 border-purple-200 focus:border-purple-400 focus:outline-none focus:ring-4 focus:ring-purple-100 transition-all bg-white/90 backdrop-blur-sm shadow-inner"
                    disabled={chatLoading || !!finalAnalysis}
                  />
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Button 
                      type="submit" 
                      disabled={chatLoading || !!finalAnalysis}
                      className="px-6 py-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold shadow-lg hover:shadow-xl transition-all"
                    >
                      {chatLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Send 💫"}
                    </Button>
                  </motion.div>
                </motion.form>

                {finalAnalysis && (
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="mt-4 text-sm text-center text-purple-600 bg-purple-50 p-3 rounded-xl border border-purple-200"
                  >
                    ✨ Final analysis received. Scroll below to view detailed result.
                  </motion.div>
                )}
              </motion.div>
            )}

            <AnimatePresence>
              {finalAnalysis && (
                <motion.div
                  initial={{ y: 20, opacity: 0, scale: 0.95 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, type: "spring" }}
                  className="rounded-3xl p-8 bg-white/90 shadow-2xl border-2 border-pink-200/50"
                >
                                      <div className="flex items-start gap-6">
                    <div className="flex-1">
                      <h3 className="text-3xl font-extrabold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                        🎯 Enhanced Analysis
                      </h3>
                      <p className="text-sm text-muted-foreground mt-2">Final summary with confidence score</p>
                    </div>

                    <motion.div 
                      className="flex flex-col items-center"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 150 }}
                    >
                      <div className="text-xs text-muted-foreground mb-2">Confidence</div>
                      <motion.div 
                        className="w-28 h-28 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white text-2xl font-extrabold shadow-2xl"
                        animate={{ 
                          boxShadow: [
                            "0 10px 30px rgba(236, 72, 153, 0.4)",
                            "0 15px 40px rgba(168, 85, 247, 0.5)",
                            "0 10px 30px rgba(236, 72, 153, 0.4)"
                          ]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        {accuracyPercent !== null ? `${accuracyPercent}%` : "—"}
                      </motion.div>
                    </motion.div>
                  </div>

                  <div className="mt-6 grid md:grid-cols-2 gap-6">
                    <motion.div 
                      className="bg-gradient-to-br from-pink-50 to-white p-6 rounded-2xl border border-pink-200 shadow-lg"
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      whileHover={{ scale: 1.03, y: -5 }}
                    >
                      <div className="text-sm font-bold text-pink-600 uppercase tracking-wide mb-3">Model Summary</div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Cycle Length:</span>
                          <span className="font-bold text-lg">{modelResult?.predicted_cycle_length_days ?? "—"} days</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Next Period:</span>
                          <span className="font-semibold">{fmt(modelResult?.next_period_predicted_date)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Ovulation:</span>
                          <span className="font-semibold">{fmt(modelResult?.approximate_ovulation_date)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Fertile Window:</span>
                          <span className="font-semibold text-xs">{fmt(modelResult?.fertile_window_start)} — {fmt(modelResult?.fertile_window_end)}</span>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div 
                      className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-2xl border border-purple-200 shadow-lg"
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      whileHover={{ scale: 1.03, y: -5 }}
                    >
                      <div className="text-sm font-bold text-purple-600 uppercase tracking-wide mb-3">Assistant Summary</div>
                      <div className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{finalAnalysis}</div>
                    </motion.div>
                  </div>

                  <motion.div 
                    className="mt-6 flex gap-4 items-center justify-between"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button 
                        onClick={() => {
                          setSessionId(null);
                          setModelResult(null);
                          setChat([]);
                          setFinalAnalysis(null);
                          setAccuracyPercent(null);
                        }} 
                        className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-3 rounded-full font-bold shadow-lg"
                      >
                        🔄 Start New Prediction
                      </Button>
                    </motion.div>
                    <motion.a
                      whileHover={{ scale: 1.1 }}
                      className="text-sm text-purple-600 font-semibold underline cursor-pointer flex items-center gap-2"
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        window.print();
                      }}
                    >
                      🖨️ Print / Save
                    </motion.a>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      <footer className="bg-gradient-to-r from-pink-100 to-purple-100 mt-20 py-8 border-t-2 border-pink-200">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold">
                SH
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                SHECARES
              </span>
            </div>
            <p className="text-gray-600 text-sm max-w-2xl mx-auto mb-4">
              Empowering women with AI-powered health insights. Your data is secure and private.
            </p>
            <div className="flex justify-center gap-6 text-sm text-gray-600">
              <a href="#" className="hover:text-pink-600 transition">Privacy Policy</a>
              <a href="#" className="hover:text-pink-600 transition">Terms of Service</a>
              <a href="#" className="hover:text-pink-600 transition">Contact Us</a>
            </div>
            <p className="text-xs text-gray-500 mt-4">© 2024 SheCares. All rights reserved.</p>
          </motion.div>
        </div>
      </footer>
    </div>
  );
};

export default PeriodTracking;