import React, { useState, useRef, useEffect } from 'react';
import { vehicles } from '../../data';
import { Vehicle } from '../../types';
import SearchIcon from '../icons/SearchIcon';
import PhoneIcon from '../icons/PhoneIcon';
import UserIcon from '../icons/UserIcon';
import PaperClipIcon from '../icons/PaperClipIcon';
import FaceSmileIcon from '../icons/FaceSmileIcon';
import MicrophoneIcon from '../icons/MicrophoneIcon';

interface Message {
  id: number;
  text: string;
  sender: 'authority' | 'driver';
  timestamp: string;
}

type ChatHistory = {
  [driverId: string]: Message[];
};

const initialMessages: ChatHistory = {
  [vehicles[0].id]: [
    { id: 1, text: 'Engine issue at Bandra Reclamation, need immediate assistance.', sender: 'driver', timestamp: '4:15 PM' },
    { id: 2, text: 'Copy that. A maintenance team has been dispatched. ETA 25 minutes. Please confirm passenger safety.', sender: 'authority', timestamp: '4:16 PM' },
    { id: 3, text: 'All passengers are safe and have been debarked.', sender: 'driver', timestamp: '4:18 PM' },
  ],
  [vehicles[1].id]: [
     { id: 1, text: 'Reporting heavy traffic near Koyambedu market, expect delays.', sender: 'driver', timestamp: '2:30 PM' },
  ]
};

const ChatView: React.FC = () => {
  const [selectedDriverId, setSelectedDriverId] = useState<string>(vehicles[0].id);
  const [messages, setMessages] = useState<ChatHistory>(initialMessages);
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const selectedDriver = vehicles.find(v => v.id === selectedDriverId);
  const activeChat = messages[selectedDriverId] || [];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat]);

  const handleSendMessage = () => {
    if (!inputText.trim() || !selectedDriverId) return;
    const newMessage: Message = {
      id: Date.now(),
      text: inputText,
      sender: 'authority',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    
    setMessages(prev => ({
      ...prev,
      [selectedDriverId]: [...(prev[selectedDriverId] || []), newMessage],
    }));
    setInputText('');
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-1 h-full overflow-hidden">
      {/* Driver List Sidebar */}
      <div className="w-80 border-r dark:border-slate-700 flex flex-col bg-white dark:bg-slate-800">
        <div className="p-4 border-b dark:border-slate-700">
          <h2 className="text-xl font-bold">Driver Chats</h2>
        </div>
        <ul className="overflow-y-auto flex-1">
          {vehicles.map(vehicle => (
            <li key={vehicle.id}>
              <button 
                onClick={() => setSelectedDriverId(vehicle.id)}
                className={`w-full text-left p-4 flex items-center space-x-3 transition-colors ${selectedDriverId === vehicle.id ? 'bg-indigo-100 dark:bg-indigo-500/10' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
              >
                <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 dark:bg-slate-700 dark:text-slate-400 shrink-0">
                  <UserIcon className="w-8 h-8" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="font-semibold text-slate-800 dark:text-slate-100 truncate">{vehicle.driver.name}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{messages[vehicle.id]?.slice(-1)[0]?.text || 'No recent messages'}</p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Main Chat Window */}
      {selectedDriver && (
        <div className="flex-1 flex flex-col">
          <div className="flex-shrink-0 p-4 border-b flex justify-between items-center bg-white dark:bg-slate-800 dark:border-slate-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 dark:bg-slate-700 dark:text-slate-400">
                  <UserIcon className="w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-100">{selectedDriver.driver.name}</p>
                <p className="text-xs text-green-500">Online</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 rounded-full hover:bg-slate-100 text-slate-500 dark:hover:bg-slate-700 dark:text-slate-400"><PhoneIcon className="w-5 h-5"/></button>
              <button className="p-2 rounded-full hover:bg-slate-100 text-slate-500 dark:hover:bg-slate-700 dark:text-slate-400"><SearchIcon className="w-5 h-5"/></button>
            </div>
          </div>
          
          <div className="flex-grow p-6 overflow-y-auto bg-slate-50 dark:bg-slate-900">
            <div className="space-y-4">
              {activeChat.map(msg => (
                <div key={msg.id} className={`flex items-start gap-3 ${msg.sender === 'authority' ? 'justify-end' : ''}`}>
                  {msg.sender === 'driver' && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center dark:bg-slate-600"><UserIcon className="w-5 h-5 text-slate-600 dark:text-slate-300"/></div>}
                  <div className={`max-w-md p-3 rounded-xl ${msg.sender === 'authority' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700 border dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200'}`}>
                    <p className="text-sm">{msg.text}</p>
                    <p className={`text-xs mt-1 text-right ${msg.sender === 'authority' ? 'text-indigo-200' : 'text-slate-400'}`}>{msg.timestamp}</p>
                  </div>
                   {msg.sender === 'authority' && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center"><UserIcon className="w-5 h-5"/></div>}
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
          </div>

          <div className="flex-shrink-0 p-4 bg-white border-t dark:bg-slate-800 dark:border-slate-700">
            <div className="flex items-center space-x-2">
              <button className="p-2 text-slate-500 hover:text-slate-700 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"><PaperClipIcon className="w-5 h-5"/></button>
              <input 
                type="text" 
                placeholder="Type a message..." 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 px-4 py-2 border rounded-full bg-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
              />
              <button className="p-2 text-slate-500 hover:text-slate-700 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"><FaceSmileIcon className="w-5 h-5"/></button>
              <button className="p-2 text-slate-500 hover:text-slate-700 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"><MicrophoneIcon className="w-5 h-5"/></button>
              <button onClick={handleSendMessage} className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-full hover:bg-indigo-700 disabled:bg-indigo-400" disabled={!inputText.trim()}>Send</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatView;