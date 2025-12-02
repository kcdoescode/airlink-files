"use client";

import { use, useEffect, useState, useRef } from "react";
import { useWebRTC, ChatMessage } from "@/hooks/useWebRTC";
import { useHistory } from "@/hooks/useHistory";
import { QRCodeSVG } from "qrcode.react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Copy, Check, Smartphone, FileUp, Send, MessageSquare,
  Menu, X, Shield, Zap, AlertTriangle, Info, ChevronLeft,
  QrCode, Link as LinkIcon, History, ArrowUpRight, ArrowDownLeft, Trash2
} from "lucide-react";

//Sub component

const MenuButton = ({
  icon: Icon, label, desc, onClick, active, alert
}: {
  icon: any, label: string, desc: string, onClick: () => void, active?: boolean, alert?: boolean
}) => (
  <button
    onClick={onClick}
    className={`w-full p-4 rounded-xl border text-left transition-all duration-200 group relative overflow-hidden ${active
        ? "bg-blue-600 border-blue-500 shadow-lg shadow-blue-900/20"
        : "bg-gray-800/50 border-gray-700 hover:border-gray-600 hover:bg-gray-800"
      } ${alert ? "border-orange-500/50" : ""}`}
  >
    <div className="flex items-start gap-4 relative z-10">
      <div className={`p-3 rounded-lg ${active ? "bg-white/20" : "bg-black/30 text-gray-400 group-hover:text-white"}`}>
        <Icon className={`w-6 h-6 ${alert ? "text-orange-400" : ""}`} />
      </div>
      <div>
        <h3 className={`font-bold ${active ? "text-white" : "text-gray-200"} ${alert ? "text-orange-200" : ""}`}>{label}</h3>
        <p className={`text-xs mt-1 ${active ? "text-blue-100" : "text-gray-500"}`}>{desc}</p>
      </div>
    </div>
  </button>
);

const BackHeader = ({ title, onBack }: { title: string, onBack: () => void }) => (
  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-800">
    <button onClick={onBack} className="p-2 hover:bg-gray-800 rounded-full transition-colors">
      <ChevronLeft className="w-5 h-5 text-gray-400" />
    </button>
    <h2 className="font-bold text-lg text-white">{title}</h2>
  </div>
);

//Main page

export default function RoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const { status, progress, sendFile, sendMessage, messages } = useWebRTC(resolvedParams.id);
  const { history, clearHistory, formatBytes } = useHistory();

  // UI States
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [inputText, setInputText] = useState("");
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [activeView, setActiveView] = useState("menu");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUrl(window.location.href);
  }, []);

  useEffect(() => {
    if (activeView === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, activeView]);

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) sendFile(e.target.files[0]);
  };

  const handleSendChat = () => {
    if (!inputText.trim()) return;
    sendMessage(inputText);
    setInputText("");
  };

  const renderSidebarContent = () => {
    switch (activeView) {
      case "chat":
        return (
          <div className="flex flex-col h-full animate-in slide-in-from-right duration-200">
            <BackHeader title="Whisper Chat" onBack={() => setActiveView("menu")} />

            <div className="flex-1 overflow-y-auto space-y-3 scrollbar-hide bg-black/20 rounded-xl mb-4 p-4">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 opacity-50 space-y-2">
                  <MessageSquare className="w-8 h-8" />
                  <p className="text-xs">Encrypted P2P Chat</p>
                </div>
              )}
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-3 py-2 rounded-xl text-sm shadow-sm ${msg.sender === 'me'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-gray-800 text-gray-200 rounded-bl-none'
                    }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="relative">
              <input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                placeholder="Type a message..."
                autoFocus
                className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-4 pr-10 py-3 text-sm text-white focus:border-blue-500 outline-none"
              />
              <button
                onClick={handleSendChat}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-blue-600 rounded-lg hover:bg-blue-500"
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        );

      case "history":
        return (
          <div className="flex flex-col h-full animate-in slide-in-from-right duration-200">
            <BackHeader title="Transfer History" onBack={() => setActiveView("menu")} />

            <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-hide">
              {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-gray-500 opacity-50 space-y-2 mt-10">
                  <History className="w-8 h-8" />
                  <p className="text-xs">No transfers yet</p>
                </div>
              ) : (
                history.map((item) => (
                  <div key={item.id} className="bg-gray-800/40 border border-gray-700/50 p-3 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className={`p-2 rounded-lg ${item.type === 'sent' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'}`}>
                        {item.type === 'sent' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-200 truncate">{item.fileName}</p>
                        <p className="text-xs text-gray-500">{formatBytes(item.fileSize)} • {new Date(item.timestamp).toLocaleTimeString()}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {history.length > 0 && (
              <button
                onClick={clearHistory}
                className="mt-4 w-full py-3 bg-red-900/20 border border-red-900/50 text-red-400 rounded-xl text-sm font-medium flex items-center justify-center gap-2 hover:bg-red-900/30 transition-colors"
              >
                <Trash2 className="w-4 h-4" /> Clear History
              </button>
            )}
          </div>
        );

      case "qr":
        return (
          <div className="flex flex-col h-full animate-in slide-in-from-right duration-200">
            <BackHeader title="Mobile Connect" onBack={() => setActiveView("menu")} />
            <div className="flex-1 flex flex-col items-center justify-center p-4">
              <div className="bg-white p-4 rounded-xl aspect-square w-full max-w-[200px] mb-6 shadow-xl">
                {url && <QRCodeSVG value={url} width="100%" height="100%" />}
              </div>
              <div className="w-full bg-black/50 p-3 rounded-xl border border-gray-800 flex gap-2">
                <p className="flex-1 text-xs text-gray-500 truncate font-mono">{url}</p>
                <button onClick={handleCopy}>
                  {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-gray-400" />}
                </button>
              </div>
            </div>
          </div>
        );

      case "manual":
        return (
          <div className="flex flex-col h-full animate-in slide-in-from-right duration-200">
            <BackHeader title="Usage Guide" onBack={() => setActiveView("menu")} />
            <div className="space-y-6">
              <div className="bg-blue-900/20 p-4 rounded-xl border border-blue-500/20">
                <h3 className="font-bold text-blue-400 flex items-center gap-2 mb-2 text-sm">
                  <Zap className="w-4 h-4" /> Instant Stream
                </h3>
                <p className="text-xs text-blue-200/70">
                  Files stream directly. The moment you drop a file, your friend starts downloading. Do not close the tab!
                </p>
              </div>
              <div className="bg-orange-900/20 p-4 rounded-xl border border-orange-500/20">
                <h3 className="font-bold text-orange-400 flex items-center gap-2 mb-2 text-sm">
                  <AlertTriangle className="w-4 h-4" /> Important
                </h3>
                <p className="text-xs text-orange-200/70">
                  Closing the tab or minimizing browser on mobile will cut the connection. Stay active! Refreshing the page will delete your old chat logs.
                </p>
              </div>
              <div className="bg-green-900/20 p-4 rounded-xl border border-green-500/20">
                <h3 className="font-bold text-green-400 flex items-center gap-2 mb-2 text-sm">
                  <Shield className="w-4 h-4" /> Privacy First
                </h3>
                <p className="text-xs text-green-200/70">
                  Data goes Peer-to-Peer. We never see your files. No logs. No chat history.
                </p>
              </div>
            </div>
          </div>
        );

      default: //menu
        return (
          <div className="flex flex-col gap-4 animate-in slide-in-from-left duration-200">
            <h2 className="text-xl font-bold text-white mb-2 px-2">Tools</h2>
            <MenuButton icon={MessageSquare} label="Whisper Chat" desc="Encrypted messages" onClick={() => setActiveView("chat")} />
            <MenuButton icon={History} label="History" desc="Recent transfers" onClick={() => setActiveView("history")} />
            <MenuButton icon={QrCode} label="Connect Mobile" desc="Show QR Code" onClick={() => setActiveView("qr")} />
            <MenuButton icon={Info} label="How to Use" desc="Important instructions" onClick={() => setActiveView("manual")} alert={true} />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-blue-500/30">

      <div className="fixed top-0 left-0 right-0 h-16 bg-gray-900/90 backdrop-blur-lg border-b border-gray-800 flex items-center justify-between px-4 z-50 md:hidden">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${status.includes("Connected") ? "bg-green-500" : "bg-yellow-500 animate-pulse"}`} />
          <span className="font-mono text-xs font-bold text-gray-200">{status}</span>
        </div>
        <button onClick={() => setShowMobileMenu(true)} className="p-2 bg-gray-800 rounded-full border border-gray-700 text-white active:scale-95 transition-transform">
          <Menu className="w-5 h-5" />
        </button>
      </div>

      <div className="hidden md:flex fixed top-0 left-0 bottom-0 w-[380px] bg-gray-900/30 border-r border-gray-800 flex-col z-40">
        <div className="p-6 border-b border-gray-800 h-20 flex items-center">
          <h1 className="font-bold text-xl flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" /> AirLink
          </h1>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {renderSidebarContent()}
        </div>
      </div>

      <div className="md:ml-[380px] min-h-screen flex flex-col relative bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-900 via-black to-black">

        <div className="hidden md:flex absolute top-6 right-6 z-30">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full border bg-black/50 backdrop-blur-md ${status.includes("Connected") ? "border-green-500/30 text-green-400" : "border-yellow-500/30 text-yellow-400"
            }`}>
            <div className={`w-2 h-2 rounded-full ${status.includes("Connected") ? "bg-green-500" : "bg-yellow-500 animate-pulse"}`} />
            <span className="text-xs font-bold uppercase">{status}</span>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-6 pt-24 md:p-12 md:pt-12">
          {progress > 0 && progress < 100 ? (
            <div className="text-center w-full max-w-md z-10">
              <div className="text-7xl font-black text-blue-500 mb-6">{progress}%</div>
              <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 transition-all duration-200" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-gray-400 mt-6 font-mono text-sm uppercase tracking-widest animate-pulse">Transferring...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-8 w-full max-w-xl z-10 animate-in fade-in slide-in-from-bottom-8 duration-500">

              <label className="group relative w-full aspect-square md:aspect-[16/9] cursor-pointer flex flex-col items-center justify-center border-2 border-dashed border-gray-800 hover:border-blue-500/50 rounded-[2rem] transition-all duration-300 hover:bg-blue-500/5 bg-gray-900/20">
                <input type="file" className="hidden" onChange={handleFileChange} />
                <div className="w-20 h-20 bg-gray-800/80 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-blue-500 transition-all duration-300 shadow-xl">
                  <FileUp className="w-8 h-8 text-gray-400 group-hover:text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-200">Send File</h3>
                <p className="text-gray-500 mt-2 text-sm">Tap to browse • Unlimited</p>
              </label>

              <div className="w-full bg-gray-900/40 border border-gray-800/50 p-4 rounded-2xl flex flex-col items-center gap-3 backdrop-blur-sm">
                <p className="text-gray-400 text-xs flex items-center gap-2">
                  <LinkIcon className="w-3 h-3 text-blue-400" />
                  Share this link to pair instantly ✨
                </p>
                <div className="w-full flex gap-2">
                  <div className="flex-1 bg-black/40 border border-gray-800 rounded-xl px-3 py-2 flex items-center overflow-hidden">
                    <p className="text-xs text-blue-400/80 font-mono truncate">{url}</p>
                  </div>
                  <button
                    onClick={handleCopy}
                    className="p-2 bg-blue-600 hover:bg-blue-500 rounded-xl transition-colors shadow-lg shadow-blue-900/20 active:scale-95"
                  >
                    {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4 text-white" />}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showMobileMenu && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowMobileMenu(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60] md:hidden"
            />
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-[85%] max-w-sm bg-gray-900 border-l border-gray-800 z-[70] flex flex-col shadow-2xl md:hidden"
            >
              <div className="h-16 border-b border-gray-800 flex justify-between items-center px-4 bg-gray-900">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  Menu
                </h2>
                <button onClick={() => setShowMobileMenu(false)} className="p-2 bg-gray-800 rounded-full border border-gray-700">
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 bg-gray-900">
                {renderSidebarContent()}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}