import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  MessageCircle,
  Search,
  Book,
  Video,
  FileText,
  Users,
  Zap,
  Shield,
  Upload,
  Download,
  Heart,
  Send
} from "lucide-react";
import Header from "@/components/Header";

const Help = () => {
  const [chatMessages, setChatMessages] = useState([
    { id: 1, text: "Hi there! I'm your SheCares assistant 🌸 How can I help you today?", sender: "bot" },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const chatEndRef = useRef(null);
  const firstRender = useRef(true);

  // Scroll to bottom only after user or bot adds new messages (not on first render)
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Send message to Flask chatbot
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const userMessage = newMessage;
    setChatMessages([...chatMessages, { id: Date.now(), text: userMessage, sender: "user" }]);
    setNewMessage("");

    try {
      const res = await fetch("https://simhealth-5qym.onrender.com/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });
      const data = await res.json();
      const botReply = data.reply || "Hmm... I couldn’t find that. Could you try rephrasing? 💬";

      setChatMessages((prev) => [...prev, { id: Date.now() + 1, text: botReply, sender: "bot" }]);
    } catch (error) {
      setChatMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, text: "Connection issue 🌧️ Please try again later.", sender: "bot" },
      ]);
    }
  };

  const quickActions = [
    { icon: Upload, title: "Upload Health Data", description: "Easily upload your reports, scans, and daily wellness logs." },
    { icon: Download, title: "Download Reports", description: "Access your personalized health summaries anytime." },
    { icon: Users, title: "Connect with Experts", description: "Reach certified professionals and wellness advisors." },
    { icon: Shield, title: "Privacy & Safety", description: "Your data is fully protected under SheCares privacy standards." },
  ];

  const faqItems = [
    {
      question: "How can I upload my wellness data?",
      answer:
        "Go to your dashboard and tap ‘Upload New Data’. You can share scans, reports, or photos of test results — formats like JPG, PNG, and PDF are supported.",
    },
    {
      question: "Is my data safe with SheCares?",
      answer:
        "Absolutely. SheCares uses encrypted storage and secure transmission to ensure your information remains private and protected.",
    },
    {
      question: "Can I chat with a health expert directly?",
      answer:
        "Yes! Through the Connect feature, you can book 1:1 virtual sessions with certified health coaches and professionals.",
    },
    {
      question: "How does the AI assistant provide guidance?",
      answer:
        "Our AI assistant is trained to support your health journey with empathy and information — not to replace a professional consultation.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-white">
      <Header />
      <br></br>
      <br></br>
      <div className="container mx-auto px-4 py-10 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 text-transparent bg-clip-text">
            Help & Support
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find gentle guidance, instant answers, and personalized support from the SheCares team 💖
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column: Chat & Search */}
          <div className="lg:col-span-2 space-y-8">
            {/* Search Card */}
            <Card className="bg-white/70 backdrop-blur-md border border-pink-200 shadow-lg shadow-pink-100">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-pink-600">
                  <Search className="h-5 w-5" />
                  <span>Search Help Topics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Type to search wellness guides or app features..."
                    className="pl-10 border-pink-200 focus:border-pink-400 focus:ring-pink-300"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Live Chat Card */}
            <Card className="bg-white/70 backdrop-blur-md border border-pink-200 shadow-lg shadow-pink-100">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-pink-600">
                  <MessageCircle className="h-5 w-5" />
                  <span>Live Wellness Chat</span>
                </CardTitle>
                <CardDescription>
                  Chat with SheCares support or your digital health companion
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Chat Messages */}
                  <div className="h-64 border border-pink-100 rounded-lg p-4 overflow-y-auto bg-pink-50/40">
                    <div className="space-y-3">
                      {chatMessages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-xs px-3 py-2 rounded-2xl text-sm ${
                              message.sender === "user"
                                ? "bg-gradient-to-r from-pink-400 to-purple-400 text-white shadow-md"
                                : "bg-white border border-pink-100 text-gray-700 shadow-sm"
                            }`}
                          >
                            {message.text}
                          </div>
                        </div>
                      ))}
                      <div ref={chatEndRef}></div>
                    </div>
                  </div>

                  {/* Chat Input */}
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Write a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                      className="border-pink-200 focus:ring-pink-300"
                    />
                    <Button
                      onClick={handleSendMessage}
                      className="bg-gradient-to-r from-pink-400 to-purple-400 text-white shadow-md hover:opacity-90"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* FAQ Card */}
            <Card className="bg-white/70 backdrop-blur-md border border-pink-200 shadow-lg shadow-pink-100">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-pink-600">
                  <Book className="h-5 w-5" />
                  <span>Frequently Asked Questions</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {faqItems.map((item, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="text-left font-semibold text-gray-700">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-gray-600">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Quick Actions & Resources */}
          <div className="space-y-6">
            {/* Quick Actions Card */}
            <Card className="bg-white/70 backdrop-blur-md border border-pink-200 shadow-lg shadow-pink-100">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-pink-600">
                  <Zap className="h-5 w-5" />
                  <span>Quick Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {quickActions.map((action, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="w-full h-auto p-3 flex items-start space-x-3 rounded-xl border-pink-200 hover:bg-pink-50"
                    >
                      <action.icon className="h-5 w-5 mt-1 text-pink-500" />
                      <div className="text-left">
                        <p className="font-semibold text-gray-800">{action.title}</p>
                        <p className="text-xs text-gray-500">{action.description}</p>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Help Resources Card */}
            <Card className="bg-white/70 backdrop-blur-md border border-pink-200 shadow-lg shadow-pink-100">
              <CardHeader>
                <CardTitle className="text-pink-600">Helpful Resources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start rounded-xl border-pink-200 hover:bg-pink-50">
                  <Video className="h-4 w-4 mr-2 text-pink-500" />
                  Guided Video Tutorials
                </Button>
                <Button variant="outline" className="w-full justify-start rounded-xl border-pink-200 hover:bg-pink-50">
                  <FileText className="h-4 w-4 mr-2 text-pink-500" />
                  Wellness Guidebook (PDF)
                </Button>
                <Button variant="outline" className="w-full justify-start rounded-xl border-pink-200 hover:bg-pink-50">
                  <Book className="h-4 w-4 mr-2 text-pink-500" />
                  SheCares Knowledge Base
                </Button>
                <Button variant="outline" className="w-full justify-start rounded-xl border-pink-200 hover:bg-pink-50">
                  <MessageCircle className="h-4 w-4 mr-2 text-pink-500" />
                  Community Support Forum
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;
