// components/passenger/AiAssistant.tsx - ENHANCED AI TRAVEL ASSISTANT WITH VOICE, RICH FORMATTING & DIRECT TAB NAVIGATION

import React, { useState, useRef, useEffect } from 'react';
import { getAiTravelResponse } from '../../services/aiService';
import UserIcon from '../icons/UserIcon';
import ChatIcon from '../icons/ChatIcon';
import MicrophoneIcon from '../icons/MicrophoneIcon';
import TrashIcon from '../icons/TrashIcon';
import SearchIcon from '../icons/SearchIcon';
import TicketIcon from '../icons/TicketIcon';
import MapPinIcon from '../icons/MapPinIcon';
import BusIcon from '../icons/BusIcon';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  actionTab?: 'finder' | 'tracker' | 'ticketing' | 'reports';
}

interface AiAssistantProps {
  onNavigateTab?: (tab: 'tracker' | 'ticketing' | 'finder' | 'reports') => void;
}

const AiAssistant: React.FC<AiAssistantProps> = ({ onNavigateTab }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      sender: 'ai',
      text: "Vanakkam! 🙏 I am your Chennai AI Travel Assistant.\n\nI can help you with:\n• Finding direct MTC Bus routes (#21G, #47D, #570, #54)\n• Buying tickets via unique bus sticker codes (e.g., MTC-21G-01)\n• Chennai Metro & MRTS local train schedules\n• Live bus arrival times & crowd updates",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actionTab: 'finder'
    }
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [autoSpeechEnabled, setAutoSpeechEnabled] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'all' | 'routes' | 'tickets' | 'metro' | 'emergency'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto scroll to bottom on message update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Speech-to-Text Setup
  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-IN';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert("Voice input is not supported in this browser. Please type your query.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        setIsListening(true);
        recognitionRef.current.start();
      } catch (err) {
        setIsListening(false);
      }
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      // Strip formatting symbols for clean voice synthesis
      const cleanText = text.replace(/[*#•🙏💻🚌🚆🚉🚨💡]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const sendQuery = async (queryText: string) => {
    if (!queryText.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: queryText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const aiResponseText = await getAiTravelResponse(queryText);

      // Determine suggested tab action based on context
      const lower = queryText.toLowerCase();
      let suggestedTab: 'finder' | 'tracker' | 'ticketing' | 'reports' | undefined = undefined;
      if (lower.includes('ticket') || lower.includes('fare') || lower.includes('buy') || lower.includes('upi') || lower.includes('sticker')) {
        suggestedTab = 'ticketing';
      } else if (lower.includes('track') || lower.includes('live') || lower.includes('location') || lower.includes('map')) {
        suggestedTab = 'tracker';
      } else if (lower.includes('crowd') || lower.includes('report') || lower.includes('first')) {
        suggestedTab = 'reports';
      } else if (lower.includes('route') || lower.includes('bus') || lower.includes('metro') || lower.includes('how to go')) {
        suggestedTab = 'finder';
      }

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: aiResponseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionTab: suggestedTab
      };

      setMessages(prev => [...prev, aiMessage]);

      if (autoSpeechEnabled) {
        speakText(aiResponseText);
      }
    } catch (error) {
      setMessages(prev => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'ai',
          text: 'Vanakkam! I hit a momentary connection snag. Please ask your travel question again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = () => sendQuery(input);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const clearChat = () => {
    if (window.confirm("Clear chat history?")) {
      setMessages([
        {
          id: 'welcome-reset',
          sender: 'ai',
          text: "Vanakkam! 🙏 Chat history cleared. How can I assist with your Chennai journey now?",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  };

  // Categorized Sample Prompts
  const categories = [
    { id: 'all', label: 'All Queries' },
    { id: 'routes', label: '🚌 Bus Routes' },
    { id: 'tickets', label: '🎟️ Tickets & UPI' },
    { id: 'metro', label: '🚆 Metro & Trains' },
    { id: 'emergency', label: '🚨 Helpline' },
  ];

  const samplePromptsMap = {
    routes: [
      "How to go from Porur to Chennai Central?",
      "Which MTC bus goes along OMR IT Corridor?",
      "Buses between Guindy & Anna Nagar (#47D)?",
      "Bus route from Koyambedu (CMBT) to Tambaram (#70V)?"
    ],
    tickets: [
      "How to buy ticket using unique bus sticker code?",
      "What is MTC bus & Metro fare breakdown?",
      "How does offline QR ticket validation work?"
    ],
    metro: [
      "Metro Blue Line vs Green Line stations?",
      "Airport (MAA) to Central Metro timings?",
      "MRTS Beach to Velachery train fares?"
    ],
    emergency: [
      "MTC Bus Helpline number?",
      "Chennai Transport emergency contacts?",
      "Women safety helpline & police numbers?"
    ]
  };

  const getFilteredPrompts = () => {
    if (activeCategory === 'all') {
      return [
        "How to go from Porur to Chennai Central?",
        "How to buy ticket using unique bus sticker code?",
        "Which bus goes along OMR IT Corridor?",
        "Metro Blue Line vs Green Line stations?",
        "Emergency transport helpline numbers?"
      ];
    }
    return samplePromptsMap[activeCategory] || [];
  };

  return (
    <div className="flex flex-col h-[75vh] min-h-[550px] max-h-[800px] bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden">
      {/* HEADER BAR */}
      <div className="px-5 py-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shrink-0">
            <ChatIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-100">
                Chennai AI Travel Assistant
              </h3>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Active
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Instant guidance for MTC Buses, Metro, MRTS & UPI Ticketing
            </p>
          </div>
        </div>

        {/* HEADER CONTROLS */}
        <div className="flex items-center gap-2">
          {/* Audio read-aloud toggle */}
          <button
            onClick={() => setAutoSpeechEnabled(!autoSpeechEnabled)}
            title={autoSpeechEnabled ? "Voice Output Enabled" : "Enable Auto Voice Readout"}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 border ${
              autoSpeechEnabled
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
            }`}
          >
            <span>{autoSpeechEnabled ? '🔊 Voice On' : '🔇 Voice Off'}</span>
          </button>

          {/* Clear chat button */}
          <button
            onClick={clearChat}
            title="Clear Chat History"
            className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* QUICK PROMPT CATEGORY FILTER BAR */}
      <div className="px-4 py-2 bg-slate-100/70 dark:bg-slate-900/40 border-b border-slate-200/80 dark:border-slate-700/80 flex items-center gap-1.5 overflow-x-auto shrink-0 text-xs">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
          Suggestions:
        </span>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id as any)}
            className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap transition-all ${
              activeCategory === cat.id
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* CHAT MESSAGES SCROLL AREA */}
      <div className="flex-grow p-4 overflow-y-auto space-y-4 bg-slate-50/50 dark:bg-slate-900/60">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}
          >
            {msg.sender === 'ai' && (
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow shrink-0 mt-0.5">
                <ChatIcon className="w-4 h-4" />
              </div>
            )}

            <div className={`max-w-[85%] sm:max-w-[75%] space-y-2`}>
              {/* MESSAGE BUBBLE */}
              <div
                className={`p-4 rounded-2xl shadow-sm text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white font-medium rounded-br-none'
                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-bl-none'
                }`}
              >
                {/* RENDER FORMATTED TEXT */}
                <div className="whitespace-pre-wrap font-sans space-y-1">
                  {msg.text}
                </div>

                {/* TIMESTAMP & QUICK ACTIONS FOR AI MESSAGES */}
                <div className={`flex items-center justify-between mt-2 pt-2 border-t text-[10px] ${
                  msg.sender === 'user' ? 'border-indigo-500/50 text-indigo-200' : 'border-slate-100 dark:border-slate-700 text-slate-400'
                }`}>
                  <span>{msg.timestamp}</span>

                  {msg.sender === 'ai' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => speakText(msg.text)}
                        className="hover:text-indigo-600 dark:hover:text-indigo-400 font-bold flex items-center gap-0.5"
                      >
                        🔊 Listen
                      </button>
                      <span>•</span>
                      <button
                        onClick={() => copyToClipboard(msg.text, msg.id)}
                        className="hover:text-indigo-600 dark:hover:text-indigo-400 font-bold"
                      >
                        {copiedId === msg.id ? '✓ Copied' : '📋 Copy'}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* DIRECT TAB NAVIGATION LINK IF AI SUGGESTS */}
              {msg.sender === 'ai' && msg.actionTab && onNavigateTab && (
                <div className="flex items-center gap-2 pt-0.5">
                  <span className="text-[11px] font-semibold text-slate-400">Action:</span>
                  {msg.actionTab === 'finder' && (
                    <button
                      onClick={() => onNavigateTab('finder')}
                      className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-xl text-xs font-bold flex items-center gap-1 shadow-2xs"
                    >
                      <SearchIcon className="w-3.5 h-3.5" />
                      <span>Open Route Finder</span>
                    </button>
                  )}

                  {msg.actionTab === 'ticketing' && (
                    <button
                      onClick={() => onNavigateTab('ticketing')}
                      className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-bold flex items-center gap-1 shadow-2xs"
                    >
                      <TicketIcon className="w-3.5 h-3.5" />
                      <span>Buy Ticket via Bus Code</span>
                    </button>
                  )}

                  {msg.actionTab === 'tracker' && (
                    <button
                      onClick={() => onNavigateTab('tracker')}
                      className="px-3 py-1 bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 rounded-xl text-xs font-bold flex items-center gap-1 shadow-2xs"
                    >
                      <MapPinIcon className="w-3.5 h-3.5" />
                      <span>Track Buses on Live Map</span>
                    </button>
                  )}

                  {msg.actionTab === 'reports' && (
                    <button
                      onClick={() => onNavigateTab('reports')}
                      className="px-3 py-1 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 rounded-xl text-xs font-bold flex items-center gap-1 shadow-2xs"
                    >
                      <BusIcon className="w-3.5 h-3.5" />
                      <span>View Crowd Reports</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {msg.sender === 'user' && (
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center shadow shrink-0 mt-0.5">
                <UserIcon className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {/* LOADING ANIMATION */}
        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow shrink-0">
              <ChatIcon className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold text-slate-400">Assistant is thinking...</span>
                <div className="flex space-x-1">
                  <span className="h-2 w-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="h-2 w-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="h-2 w-2 bg-indigo-500 rounded-full animate-bounce"></span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* QUICK SUGGESTION CHIPS BAR */}
      <div className="px-4 py-2 bg-slate-100/80 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-700 flex items-center gap-2 overflow-x-auto shrink-0">
        {getFilteredPrompts().map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => sendQuery(prompt)}
            disabled={isLoading}
            className="px-3 py-1.5 text-xs bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold rounded-xl hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-slate-700 dark:hover:text-indigo-300 border border-slate-200 dark:border-slate-700 shadow-2xs transition-all whitespace-nowrap shrink-0 disabled:opacity-50"
          >
            💬 {prompt}
          </button>
        ))}
      </div>

      {/* INPUT CONTAINER */}
      <div className="p-3 sm:p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 shrink-0">
        <div className="flex items-center gap-2">
          {/* VOICE MICROPHONE INPUT BUTTON */}
          <button
            onClick={toggleVoiceInput}
            title={isListening ? "Listening... Click to stop" : "Speak your query"}
            className={`p-3 rounded-xl transition-all shadow-sm ${
              isListening
                ? 'bg-red-600 text-white animate-pulse ring-4 ring-red-200 dark:ring-red-950'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-indigo-100 dark:hover:bg-slate-600'
            }`}
          >
            <MicrophoneIcon className="w-5 h-5" />
          </button>

          {/* INPUT FIELD */}
          <div className="relative flex-grow">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isListening ? "Listening to your voice..." : "Ask travel routes, ticket fares, metro lines..."}
              className="w-full pl-4 pr-9 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-sm font-semibold dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 shadow-inner"
              disabled={isLoading}
            />
            {input && (
              <button
                onClick={() => setInput('')}
                className="absolute right-3 top-3.5 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* SEND BUTTON */}
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl font-bold text-sm transition-colors shadow-md disabled:opacity-50 shrink-0"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiAssistant;
