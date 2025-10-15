import { useState, useRef, useEffect, useCallback } from "react";
import { apiService } from "../services/api";
import Header from "../components/Header";

const BrainIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M12 5a3 3 0 1 0-5.993 1.002h.001a4 4 0 0 0-3.38 5.42A6 6 0 0 0 12 18a6 6 0 0 0 5.373-3.578A4 4 0 0 0 18.998 9a3 3 0 1 0-6.995-4.002h-.001Z"/><path d="M12 18a6 6 0 0 1-5.373-3.578m10.746 0A6 6 0 0 0 12 18"/><path d="M12 5.002a3 3 0 0 1 5.993 1H12v6h6"/><path d="M6.007 6.002A3 3 0 0 0 12 5.002V11H6.002Z"/></svg>
);
const MessageCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>
);
const BookOpenIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
);
const SendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
);
const LoaderIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 animate-spin text-gray-500"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
);

const useTypewriter = (text: string, speed = 20) => {
  const [displayedText, setDisplayedText] = useState("");
  useEffect(() => {
    setDisplayedText("");
    if (text) {
      let i = 0;
      const intervalId = setInterval(() => {
        if (i < text.length) {
          setDisplayedText((prev) => prev + text.charAt(i));
          i++;
        } else {
          clearInterval(intervalId);
        }
      }, speed);
      return () => clearInterval(intervalId);
    }
  }, [text, speed]);
  return displayedText;
};

const BotMessage = ({ text, onUpdate }: { text: string; onUpdate: () => void; }) => {
  const displayedText = useTypewriter(text);
  useEffect(() => {
    onUpdate();
  }, [displayedText, onUpdate]);
  return <p className="text-sm">{displayedText}</p>;
};

interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
}

const MentalWellness = () => {
  
  const [messages, setMessages] = useState<ChatMessage[]>([
    { sender: 'bot', text: "Hello! How are you feeling today? I'm here to listen and offer support." }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    const newMessages: ChatMessage[] = [...messages, { sender: 'user', text: userInput }];
    setMessages(newMessages);
    const currentInput = userInput;
    setUserInput('');
    setIsLoading(true);
    setError(null);

    try {
        const result = await apiService.chatWithText(currentInput);
        
        setMessages(prev => [...prev, { sender: 'bot', text: result.reply }]);

    } catch (err: any) {
        setError("Could not connect to the chat service. Please make sure it's running and try again.");
        setMessages(prev => [...prev, { sender: 'bot', text: "I'm having a little trouble right now. Please try again later." }]);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      <Header />
      <header className="py-4 text-center text-2xl font-bold shadow-sm bg-white">Mental Wellness Support</header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
              <span role="img" aria-label="brain">🧠</span>
              <span className="bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">Mental Wellness</span>
            </h1>
            <p className="text-xl text-gray-600">
              Comprehensive mental health support and professional connections
            </p>
          </div>

          {/* Placeholder for EmergencySafety */}
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-8" role="alert">
            <p className="font-bold">Immediate Help</p>
            <p>If you are in a crisis or any other person may be in danger, please don't use this site. Contact a local emergency number immediately.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Card Component Re-created with Tailwind */}
            <div className="md:col-span-2 bg-white rounded-lg shadow-md border border-gray-200">
              <div className="p-6">
                <h3 className="flex items-center gap-2 font-bold text-lg">
                  <MessageCircleIcon />
                  AI Chat Assistant
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Talk about your feelings in a safe and supportive space.
                </p>
              </div>
              <div className="p-6 border-t border-gray-200">
                <div className="h-80 bg-gray-100/70 rounded-lg p-4 flex flex-col space-y-4 overflow-y-auto" ref={chatContainerRef}>
                  {messages.map((msg, index) => {
                    const isBot = msg.sender === 'bot';
                    const isLastMessage = index === messages.length - 1;

                    return (
                      <div key={index} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`rounded-lg px-4 py-2 max-w-xs lg:max-w-md shadow-sm ${msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-white border'}`}>
                          {isBot && isLastMessage && !isLoading ? (
                            <BotMessage text={msg.text} onUpdate={scrollToBottom} />
                          ) : (
                            <p className="text-sm">{msg.text}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {isLoading && (
                    <div className="flex items-end gap-2 justify-start">
                        <div className="rounded-lg px-4 py-2 bg-white border shadow-sm">
                            <LoaderIcon />
                        </div>
                    </div>
                  )}
                </div>
                {error && 
                  <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative" role="alert">
                    <span className="block sm:inline">{error}</span>
                  </div>
                }
                <div className="mt-4 flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="Type your message..."
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
                    disabled={isLoading}
                    className="flex-grow w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  />
                  <button onClick={handleSendMessage} disabled={isLoading} className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed">
                    <SendIcon />
                  </button>
                </div>
              </div>
            </div>

            {/* Other Cards Re-created */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200">
               <div className="p-6">
                <h3 className="flex items-center gap-2 font-bold text-lg">
                  <BrainIcon />
                  Professional Support
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Connect with licensed therapists and doctors.
                </p>
              </div>
              <div className="p-6 border-t border-gray-200">
                <button className="w-full text-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-700">Connect with a Professional</button>
              </div>
            </div>

             <div className="bg-white rounded-lg shadow-md border border-gray-200">
               <div className="p-6">
                <h3 className="flex items-center gap-2 font-bold text-lg">
                  <BookOpenIcon />
                  Wellness Resources
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Access guided meditations, articles, and tools.
                </p>
              </div>
              <div className="p-6 border-t border-gray-200 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <button className="text-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50">Meditation</button>
                  <button className="text-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50">Breathing</button>
                  <button className="text-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50">Journaling</button>
                  <button className="text-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50">Articles</button>
                </div>
                <button className="w-full text-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-700">Explore All Resources</button>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Placeholder for Footer */}
      <footer className="py-4 text-center text-sm text-gray-500 border-t bg-white">
        &copy; 2025 SheCares Inc. All rights reserved.
      </footer>
    </div>
  );
};

export default MentalWellness;

