// MentalWellness.tsx
import { useState, useRef, useEffect, useCallback } from "react";
import Header from "../components/Header";
import { getUserLocation } from "../../utils/getUserLocation";
/* -----------------------
   Simple apiService that posts FormData to FastAPI
   Endpoint: POST http://localhost:8003/chat/text
   The server expects a Form field named "message".
   Change BASE_URL if your chat API runs elsewhere.
   ----------------------- */
const apiService = {
  BASE_URL: import.meta.env.VITE_CHAT_API_URL || "http://localhost:8003",
  async chatWithText(message: string) {
    const url = `${this.BASE_URL}/chat/text`;
    const fd = new FormData();
    fd.append("message", message);

    const res = await fetch(url, {
      method: "POST",
      body: fd,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`API Error: ${res.status} ${text}`);
    }

    return res.json(); // expected { reply: "..." }
  },
};

/* ---------- Icons ---------- */
const BrainIcon = () => (/* same svg as before */ <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M12 5a3 3 0 1 0-5.993 1.002h.001a4 4 0 0 0-3.38 5.42A6 6 0 0 0 12 18a6 6 0 0 0 5.373-3.578A4 4 0 0 0 18.998 9a3 3 0 1 0-6.995-4.002h-.001Z"/><path d="M12 18a6 6 0 0 1-5.373-3.578m10.746 0A6 6 0 0 0 12 18"/><path d="M12 5.002a3 3 0 0 1 5.993 1H12v6h6"/><path d="M6.007 6.002A3 3 0 0 0 12 5.002V11H6.002Z"/></svg>);
const MessageCircleIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>);
const BookOpenIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>);
const SendIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>);
const LoaderIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 animate-spin text-gray-500"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>);
const Volume2Icon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>);
const VolumeXIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="22" x2="16" y1="9" y2="15"/><line x1="16" x2="22" y1="9" y2="15"/></svg>);
const PlayIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3"><polygon points="5 3 19 12 5 21 5 3"/></svg>);
const PauseIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3"><rect width="4" height="16" x="6" y="4"/><rect width="4" height="16" x="14" y="4"/></svg>);

/* ---------- Typewriter hook & BotMessage ---------- */
const useTypewriter = (text: string, speed = 18) => {
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

const BotMessage = ({ text, onUpdate }: { text: string; onUpdate: () => void }) => {
  const displayed = useTypewriter(text);
  useEffect(() => onUpdate(), [displayed, onUpdate]);
  return <p className="text-sm leading-relaxed">{displayed}</p>;
};

/* ---------- Types ---------- */
type ChatMessage = { sender: "user" | "bot"; text: string; audioData?: string };

/* ---------- Main Component ---------- */
const MentalWellness = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { sender: "bot", text: "Hello! How are you feeling today? I'm here to listen and offer support." },
  ]);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [playingMessageIndex, setPlayingMessageIndex] = useState<number | null>(null);
  const [audioLoading, setAudioLoading] = useState<number | null>(null);
  
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  
  const scrollToBottom = useCallback(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

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
  
  const handleTherapist = () => {
    if (coordinates) {
      const url = `https://www.google.com/maps/search/mental+health+therapist/@${coordinates.lat},${coordinates.lng},14z/data=!3m1!4b1`;
      window.open(url, '_blank');
    } else {
      window.open('https://www.google.com/maps/search/mental+health+therapist', '_blank');
    }
  };

  const convertTextToSpeech = async (text: string): Promise<string | null> => {
    try {
      const formData = new FormData();
      const cleanText = text
        .replace(/[#*_~`]/g, "")
        .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1")
        .trim();
      
      formData.append("text", cleanText);

      const response = await fetch("http://localhost:8003/chat/text-to-speech", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("TTS conversion failed");

      const result = await response.json();
      return result.audio_data;
    } catch (err) {
      console.error("TTS Error:", err);
      return null;
    }
  };

  const playAudio = async (audioData: string, messageIndex: number) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const audio = new Audio(`data:audio/mp3;base64,${audioData}`);
    audioRef.current = audio;

    audio.onended = () => {
      setPlayingMessageIndex(null);
      audioRef.current = null;
    };
    
    audio.onerror = () => {
      console.error("Audio playback error");
      setPlayingMessageIndex(null);
      audioRef.current = null;
    };

    await audio.play();
    setPlayingMessageIndex(messageIndex);
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setPlayingMessageIndex(null);
  };

  const handlePlayMessage = async (message: ChatMessage, index: number) => {
    if (playingMessageIndex === index) {
      stopAudio();
      return;
    }

    if (message.audioData) {
      await playAudio(message.audioData, index);
    } else {
      setAudioLoading(index);
      const audioData = await convertTextToSpeech(message.text);
      setAudioLoading(null);

      if (audioData) {
        setMessages((prev) =>
          prev.map((msg, idx) => (idx === index ? { ...msg, audioData } : msg))
        );
        await playAudio(audioData, index);
      }
    }
  };

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;
    const text = userInput.trim();
    setMessages((p) => [...p, { sender: "user", text }]);
    setUserInput("");
    setIsLoading(true);
    setError(null);

    try {
      const result = await apiService.chatWithText(text);
      const reply = result?.reply ?? "Sorry, no reply.";
      const newMessage: ChatMessage = { sender: "bot", text: reply };
      setMessages((p) => [...p, newMessage]);

      // Auto-generate TTS in background if enabled
      if (ttsEnabled) {
        const messageIndex = messages.length + 1;
        convertTextToSpeech(reply).then((audioData) => {
          if (audioData) {
            setMessages((prev) => {
              const updated = [...prev];
              const lastMsg = updated[updated.length - 1];
              if (lastMsg && lastMsg.sender === "bot") {
                lastMsg.audioData = audioData;
              }
              return updated;
            });
            // Auto-play the audio
            setTimeout(() => playAudio(audioData, messageIndex), 300);
          }
        });
      }
    } catch (err: any) {
      setError("Could not connect to the chat service. Make sure it's running.");
      setMessages((p) => [...p, { sender: "bot", text: "I'm having trouble connecting to the chat service right now. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#ffd6e6_0%,#ffeef6_40%,#fff7fb_100%)] text-gray-900 antialiased">
      <Header />
      <br></br>
      
      <header className="py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="space-y-1">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
              <span className="inline-block transform -skew-x-6">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-600 via-fuchsia-600 to-purple-700 text-5xl md:text-7xl">Your Complete</span>
              </span>
              <div className="mt-2">
                <span className="inline-block px-4 py-2 rounded-md bg-white/60 backdrop-blur-md shadow-lg text-4xl md:text-6xl font-extrabold text-pink-600">Wellness Companion</span>
              </div>
            </h1>
            <p className="mt-4 text-gray-600 max-w-2xl mx-auto">Comprehensive support for pregnancy, periods, mental health, and real-time emergency assistance.</p>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 pb-12">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Chat Card */}
          <div className="relative">
            {/* 3D card wrapper */}
            <div className="transform-gpu perspective-1000 hover:perspective-[1200px]">
              <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl border border-pink-50 p-6 hover:shadow-[0_20px_50px_rgba(255,182,193,0.15)] transition-transform duration-300 ease-out transform hover:-translate-y-2 hover:rotate-0">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-pink-50 to-white shadow-inner">
                      <MessageCircleIcon />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">AI Chat Assistant</h3>
                      <p className="text-sm text-gray-500">Talk about your feelings in a safe, chat-like space.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setTtsEnabled(!ttsEnabled)}
                    className={`p-2 rounded-lg transition-colors ${
                      ttsEnabled ? "bg-pink-100 text-pink-600" : "bg-gray-100 text-gray-400"
                    }`}
                    title={ttsEnabled ? "Text-to-speech enabled" : "Text-to-speech disabled"}
                  >
                    {ttsEnabled ? <Volume2Icon /> : <VolumeXIcon />}
                  </button>
                </div>

                <div ref={chatContainerRef} className="h-80 overflow-y-auto rounded-lg p-4 space-y-3 bg-gradient-to-b from-white to-pink-50 border border-pink-100">
                  {messages.map((m, i) => {
                    const isUser = m.sender === "user";
                    const bubbleBase = "rounded-xl px-4 py-2 shadow-sm max-w-[85%] break-words";
                    return (
                      <div key={i}>
                        <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                          <div className={`${bubbleBase} ${isUser ? "bg-pink-600 text-white" : "bg-white border border-gray-200 text-gray-800"}`}>
                            {m.sender === "bot" && i === messages.length - 1 && !isLoading ? (
                              <BotMessage text={m.text} onUpdate={scrollToBottom} />
                            ) : (
                              <p className="text-sm leading-relaxed">{m.text}</p>
                            )}
                          </div>
                        </div>
                        {m.sender === "bot" && (
                          <div className="flex justify-start mt-1">
                            <button
                              onClick={() => handlePlayMessage(m, i)}
                              disabled={audioLoading === i}
                              className="text-xs px-3 py-1 rounded-lg bg-gray-100 hover:bg-pink-100 text-gray-600 hover:text-pink-600 transition-colors flex items-center gap-1"
                            >
                              {audioLoading === i ? (
                                <>
                                  <LoaderIcon />
                                  Loading...
                                </>
                              ) : playingMessageIndex === i ? (
                                <>
                                  <PauseIcon />
                                  Pause
                                </>
                              ) : (
                                <>
                                  <PlayIcon />
                                  Listen
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="rounded-xl px-4 py-3 bg-white border shadow-sm">
                        <LoaderIcon />
                      </div>
                    </div>
                  )}
                </div>

                {error && (
                  <div className="mt-3 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm">
                    {error}
                  </div>
                )}

                <div className="mt-4 flex gap-3 items-center">
                  <input
                    className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-200 disabled:bg-gray-100"
                    placeholder="Type your message..."
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !isLoading && handleSendMessage()}
                    disabled={isLoading}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={isLoading}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-fuchsia-600 text-white shadow hover:scale-[1.02] active:scale-[0.99] transition-transform disabled:opacity-50"
                    aria-label="Send message"
                  >
                    {isLoading ? <LoaderIcon /> : <SendIcon />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right column: cards for professionals & resources */}
          <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-pink-50 shadow-lg transform hover:-translate-y-2 transition">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-purple-50 to-white">
                  <BrainIcon />
                </div>
                <div>
                  <h4 className="text-lg font-semibold">Professional Support</h4>
                  <p className="text-sm text-gray-500">Connect with licensed therapists and doctors.</p>
                </div>
              </div>
              <div className="mt-2">
                <button onClick={handleTherapist} className="w-full py-2 rounded-md bg-gray-900 text-white font-medium hover:opacity-95 transition">Connect with a Therapist</button>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-pink-50 shadow-lg transform hover:-translate-y-2 transition">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-50 to-white">
                  <BookOpenIcon />
                </div>
                <div>
                  <h4 className="text-lg font-semibold">Wellness Resources</h4>
                  <p className="text-sm text-gray-500">Guided meditations, articles and tools for mental wellbeing.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-4">
                 <a
      href="https://www.uclahealth.org/uclamindful/guided-meditations"
      target="_blank"
      rel="noopener noreferrer"
    >
      <button className="px-3 py-2 rounded-md border text-sm border-gray-200 w-full">
        Meditation
      </button>
    </a>

    <a
      href="https://www.nhs.uk/mental-health/self-help/guides-tools-and-activities/breathing-exercises-for-stress/"
      target="_blank"
      rel="noopener noreferrer"
    >
      <button className="px-3 py-2 rounded-md border text-sm border-gray-200 w-full">
        Breathing
      </button>
    </a>

    <a
      href="https://positivepsychology.com/mindfulness-worksheets/"
      target="_blank"
      rel="noopener noreferrer"
    >
      <button className="px-3 py-2 rounded-md border text-sm border-gray-200 w-full">
        Journaling
      </button>
    </a>

    <a
      href="https://www.helpguide.org/mental-health/stress/stress-management"
      target="_blank"
      rel="noopener noreferrer"
    >
      <button className="px-3 py-2 rounded-md border text-sm border-gray-200 w-full">
        Articles
      </button>
    </a>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-pink-50 shadow-lg">
              <h4 className="text-lg font-semibold mb-2">Need Urgent Help?</h4>
              <p className="text-sm text-gray-600">If a life is in danger or someone is at immediate risk, call your local emergency number now.</p>
            </div>
          </div>

        </div>
      </main>

      <footer className="py-6 text-center text-sm text-gray-600 border-t bg-white/60">© 2025 SheCares Inc. All rights reserved.</footer>

      {/* Minimal custom styles injected here for subtle animations */}
      <style>{`
        .perspective-1000 { perspective: 1000px; transform-style: preserve-3d; }
        .animate-bounce-slow { animation: bounce 2.4s infinite; }
        @keyframes bounce {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  );
};

export default MentalWellness;