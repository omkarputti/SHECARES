import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Heart, Thermometer, Stethoscope, Loader2 } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/config/firebase';
import EmergencySafety from "@/components/EmergencySafety";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PredictionResult {
  predicted_cycle_length_days: number;
  next_period_predicted_date: string;
  approximate_ovulation_date: string;
  fertile_window_start: string;
  fertile_window_end: string;
}

const PeriodTracking = () => {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();

  const [lastPeriodDate, setLastPeriodDate] = useState('');
  const [age, setAge] = useState(25);
  const [bmi, setBmi] = useState(22.0);
  const [stressLevel, setStressLevel] = useState(3);
  const [sleepHours, setSleepHours] = useState(7.5);
  const [periodLength, setPeriodLength] = useState(5);
  const [exerciseFreq, setExerciseFreq] = useState('Moderate');
  const [diet, setDiet] = useState('Balanced');
  const [symptoms, setSymptoms] = useState('Cramps');

  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) {
    navigate('/auth');
    return null;
  }

  const handlePrediction = async () => {
    setIsLoading(true);
    setError(null);
    setPrediction(null);

    if (!lastPeriodDate) {
      setError("Please enter your last period date.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/predict-ovulation/advanced', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          last_period_date: lastPeriodDate,
          age: age,
          bmi: bmi,
          stress_level: stressLevel,
          sleep_hours: sleepHours,
          period_length: periodLength,
          exercise_freq: exerciseFreq,
          diet: diet,
          symptoms: symptoms,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Something went wrong');
      }

      const result: PredictionResult = await response.json();
      setPrediction(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="container mx-auto px-4 py-8 mt-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">
              🩸 <span className="bg-gradient-primary bg-clip-text text-transparent">Period Tracking</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Smart cycle prediction and personalized health insights
            </p>
          </div>

          <EmergencySafety />

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Advanced Cycle Predictor
                </CardTitle>
                <CardDescription>
                  Fill in your details to get a personalized prediction of your next cycle.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="last-period-date">Last Period Date</Label>
                    <Input id="last-period-date" type="date" value={lastPeriodDate} onChange={(e) => setLastPeriodDate(e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="age">Age</Label>
                    <Input id="age" type="number" value={age} onChange={(e) => setAge(parseInt(e.target.value))} />
                  </div>
                  <div>
                    <Label htmlFor="bmi">BMI</Label>
                    <Input id="bmi" type="number" step="0.1" value={bmi} onChange={(e) => setBmi(parseFloat(e.target.value))} />
                  </div>
                   <div>
                    <Label htmlFor="stress-level">Stress Level (1-5)</Label>
                    <Input id="stress-level" type="number" min="1" max="5" value={stressLevel} onChange={(e) => setStressLevel(parseInt(e.target.value))} />
                  </div>
                   <div>
                    <Label htmlFor="sleep-hours">Sleep Hours</Label>
                    <Input id="sleep-hours" type="number" step="0.5" value={sleepHours} onChange={(e) => setSleepHours(parseFloat(e.target.value))} />
                  </div>
                  <div>
                    <Label htmlFor="period-length">Period Length (days)</Label>
                    <Input id="period-length" type="number" value={periodLength} onChange={(e) => setPeriodLength(parseInt(e.target.value))} />
                  </div>
                  <div className="md:col-span-1">
                     <Label htmlFor="exercise-freq">Exercise Frequency</Label>
                     <Select value={exerciseFreq} onValueChange={setExerciseFreq}>
                       <SelectTrigger id="exercise-freq">
                         <SelectValue placeholder="Select frequency" />
                       </SelectTrigger>
                       <SelectContent>
                         <SelectItem value="Low">Low</SelectItem>
                         <SelectItem value="Moderate">Moderate</SelectItem>
                         <SelectItem value="High">High</SelectItem>
                       </SelectContent>
                     </Select>
                   </div>
                   <div className="md:col-span-1">
                     <Label htmlFor="diet">Primary Diet</Label>
                     <Select value={diet} onValueChange={setDiet}>
                       <SelectTrigger id="diet">
                         <SelectValue placeholder="Select diet" />
                       </SelectTrigger>
                       <SelectContent>
                         <SelectItem value="Balanced">Balanced</SelectItem>
                         <SelectItem value="Vegetarian">Vegetarian</SelectItem>
                         <SelectItem value="High Sugar">High Sugar</SelectItem>
                         <SelectItem value="Low Carb">Low Carb</SelectItem>
                       </SelectContent>
                     </Select>
                   </div>
                   <div className="md:col-span-2">
                     <Label htmlFor="symptoms">Common Symptom</Label>
                     <Select value={symptoms} onValueChange={setSymptoms}>
                       <SelectTrigger id="symptoms">
                         <SelectValue placeholder="Select a symptom" />
                       </SelectTrigger>
                       <SelectContent>
                         <SelectItem value="Cramps">Cramps</SelectItem>
                         <SelectItem value="Mood Swings">Mood Swings</SelectItem>
                         <SelectItem value="Fatigue">Fatigue</SelectItem>
                         <SelectItem value="Headache">Headache</SelectItem>
                         <SelectItem value="Bloating">Bloating</SelectItem>
                       </SelectContent>
                     </Select>
                   </div>
                </div>
                <div className="mt-6">
                  <Button onClick={handlePrediction} disabled={isLoading} className="w-full">
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {isLoading ? 'Predicting...' : 'Predict My Cycle'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {error && (
              <Alert variant="destructive" className="md:col-span-2">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {prediction && (
               <Card className="md:col-span-2 bg-gradient-to-r from-pink-100 to-purple-100">
                <CardHeader>
                  <CardTitle>Prediction Result</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
                  <div className="bg-white/50 p-3 rounded-lg">
                    <p className="text-sm font-semibold text-muted-foreground">Next Period</p>
                    <p className="text-lg font-bold">{new Date(prediction.next_period_predicted_date).toLocaleDateString()}</p>
                  </div>
                   <div className="bg-white/50 p-3 rounded-lg">
                    <p className="text-sm font-semibold text-muted-foreground">Ovulation</p>
                    <p className="text-lg font-bold">{new Date(prediction.approximate_ovulation_date).toLocaleDateString()}</p>
                  </div>
                  <div className="bg-white/50 p-3 rounded-lg col-span-2 md:col-span-1">
                    <p className="text-sm font-semibold text-muted-foreground">Fertile Window</p>
                    <p className="text-lg font-bold">{new Date(prediction.fertile_window_start).toLocaleDateString()} - {new Date(prediction.fertile_window_end).toLocaleDateString()}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PeriodTracking;