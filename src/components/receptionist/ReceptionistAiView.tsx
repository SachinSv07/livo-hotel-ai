import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Bot, 
  Send, 
  User, 
  Sparkles, 
  MessageSquare, 
  Phone, 
  Mail, 
  Globe, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ArrowRight, 
  Terminal, 
  ShieldAlert, 
  Check, 
  Share2, 
  Zap, 
  Building2, 
  Tag,
  Star
} from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../../data/mockData';
import { conversationService, GuestConversation, GuestConversationMessage } from '../../services/conversationService';

type ChatMessage = {
  sender: 'guest' | 'ai';
  text: string;
  time: string;
  intent?: string;
  dept?: string;
  sla?: string;
};

const formatConversationTime = (seconds?: number) => {
  if (typeof seconds !== 'number') return 'Post-call';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = String(seconds % 60).padStart(2, '0');
  return `${minutes}:${remainingSeconds}`;
};

const toChatHistory = (transcript: GuestConversationMessage[]): ChatMessage[] => {
  return transcript
    .filter(message => Boolean(message.message?.trim()))
    .map(message => ({
      sender: message.role === 'user' ? 'guest' : 'ai',
      text: message.message!.trim(),
      time: formatConversationTime(message.time_in_call_secs)
    }));
};

export const ReceptionistAiView: React.FC = () => {
  const { 
    requests, 
    currentLanguage, 
    setCurrentLanguage, 
    setCurrentTab,
    updateRequestStatus
  } = useApp();

  const [conversations, setConversations] = useState<GuestConversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [conversationHistory, setConversationHistory] = useState<ChatMessage[]>([]);
  const [lastParsedIntent, setLastParsedIntent] = useState<any>({
    intentCategory: 'No conversation selected',
    department: '—',
    roomNumber: '—',
    priority: '—',
    confidence: 0,
    action: 'Waiting for an ElevenLabs conversation'
  });

  const selectedConversation = conversations.find(
    conversation => conversation.id === selectedConversationId
  ) || null;

  useEffect(() => {
    if (!conversationService.isConfigured) return;

    let isCancelled = false;

    void conversationService.fetchConversations()
      .then(loadedConversations => {
        if (isCancelled) return;
        setConversations(loadedConversations);
        setSelectedConversationId(loadedConversations[0]?.id || null);
      })
      .catch(error => {
        console.error('Unable to load ElevenLabs conversations.', error);
      });

    const channel = conversationService.subscribe(
      conversation => {
        setConversations(prev => [conversation, ...prev.filter(item => item.id !== conversation.id)]);
        setSelectedConversationId(conversation.id);
      },
      conversation => {
        setConversations(prev => prev.map(item => item.id === conversation.id ? conversation : item));
      }
    );

    return () => {
      isCancelled = true;
      conversationService.removeSubscription(channel);
    };
  }, []);

  useEffect(() => {
    if (!selectedConversation) {
      setConversationHistory([]);
      setLastParsedIntent({
        intentCategory: 'No conversation selected',
        department: '—',
        roomNumber: '—',
        priority: '—',
        confidence: 0,
        action: 'Waiting for an ElevenLabs conversation'
      });
      return;
    }

    const loadedHistory = toChatHistory(selectedConversation.transcript);
    setConversationHistory(loadedHistory);

    setLastParsedIntent(prev => ({
      ...prev,
      intentCategory: selectedConversation.request || 'Guest service conversation',
      department: selectedConversation.department || prev.department,
      priority: selectedConversation.priority || prev.priority,
      roomNumber: selectedConversation.roomNumber,
      confidence: null,
      action: selectedConversation.request
        ? `Request created: ${selectedConversation.request}`
        : 'Conversation completed'
    }));
  }, [selectedConversation]);

  const activeRoomNumber = selectedConversation?.roomNumber || '—';
  const guestRequests = selectedConversation
    ? requests.filter(r => r.roomNumber === activeRoomNumber)
    : [];

  const handleEscalateToManager = () => {
    if (guestRequests.length > 0) {
      updateRequestStatus(guestRequests[0].id, 'Escalated');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Module Title Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-teal-950 via-slate-900 to-slate-950 text-white border border-teal-800/40 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Receptionist AI Agent (24/7 Guest Service)</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/40">
              Active • 42ms
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Autonomous guest conversational agent with Opera PMS real-time verification and automated task dispatching.
          </p>
        </div>

      </div>

      {/* Main 3-Column Layout: Guests & PMS (Left), Interactive Chat (Center), AI Intent & PMS Sync (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Opera PMS & Guest Profile (3 Cols) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Oracle Opera PMS Record</h2>
              <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-bold">
                VERIFIED
              </span>
            </div>

            {/* Supabase Conversation Selector */}
            <div className="mb-4">
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Select Supabase conversation:</label>
              <select
                value={selectedConversationId || ''}
                onChange={e => setSelectedConversationId(e.target.value || null)}
                className="w-full text-xs font-semibold p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-teal-500"
                disabled={conversations.length === 0}
              >
                {conversations.length === 0 ? (
                  <option value="">No conversations available</option>
                ) : conversations.map(conversation => (
                  <option key={conversation.id} value={conversation.id}>
                    Room {conversation.roomNumber} - {conversation.request || 'Guest conversation'}
                  </option>
                ))}
              </select>
            </div>

            {/* Selected Conversation Details */}
            {selectedConversation ? (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">Room {selectedConversation.roomNumber}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {selectedConversation.status}
                  </span>
                </div>

                <div className="space-y-2 text-[11px] text-slate-600 pt-1">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">ElevenLabs conversation</span>
                    <span className="font-mono font-bold text-slate-900 break-all">{selectedConversation.elevenlabsConversationId}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Request</span>
                    <span className="font-semibold text-slate-800">{selectedConversation.request || 'No request extracted'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Department & priority</span>
                    <span className="font-semibold text-slate-800">{selectedConversation.department || '—'} · {selectedConversation.priority || '—'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Call duration</span>
                    <span className="font-mono font-semibold text-slate-800">{selectedConversation.callDurationSecs ?? 0}s</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-400">
                No ElevenLabs conversations have been received yet.
              </p>
            )}

            {/* Escalation Button */}
            <div className="mt-4 pt-3 border-t border-slate-100">
              <button
                onClick={handleEscalateToManager}
                className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Escalate to Duty Manager</span>
              </button>
            </div>
          </div>

          {/* Multilingual Selector */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-teal-600" />
              <span>Receptionist AI Multilingual</span>
            </h3>
            <p className="text-[11px] text-slate-500 mb-3">
              AI translates and understands guest messages in real time.
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              {SUPPORTED_LANGUAGES.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => setCurrentLanguage(lang.code)}
                  className={`p-1.5 rounded-lg text-xs text-center border transition-all ${
                    currentLanguage === lang.code
                      ? 'bg-teal-600 text-white font-bold border-teal-600'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className="block text-sm">{lang.flag}</span>
                  <span className="text-[10px] block truncate">{lang.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Center Column: Live Chat Interface (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col h-[650px] bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          {/* Chat Header */}
          <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-teal-500/20 text-teal-400 border border-teal-500/40 flex items-center justify-center font-bold text-xs">
                  AI
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-900"></span>
              </div>
              <div>
                <p className="text-xs font-bold leading-tight">Receptionist AI Agent</p>
                <p className="text-[10px] text-slate-400">Room {activeRoomNumber} · Supabase transcript</p>
              </div>
            </div>

            <span className="text-[10px] font-mono text-teal-300 bg-slate-800 px-2 py-0.5 rounded">
              24/7 Autonomous
            </span>
          </div>

          {/* Transcript source marker */}
          <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500">
            Post-call transcript from ElevenLabs · Read-only
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/40">
            {conversationHistory.length === 0 ? (
              <div className="h-full flex items-center justify-center text-center text-xs text-slate-400">
                Select a Supabase conversation to view its transcript.
              </div>
            ) : conversationHistory.map((msg, i) => (
              <div
                key={i}
                className={`flex flex-col ${msg.sender === 'guest' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                    msg.sender === 'guest'
                      ? 'bg-teal-600 text-white rounded-br-xs shadow-xs'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs shadow-2xs'
                  }`}
                >
                  <p>{msg.text}</p>

                  {msg.sender === 'ai' && msg.intent && (
                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5 text-[10px]">
                      <span className="px-1.5 py-0.5 rounded bg-teal-50 text-teal-800 font-bold border border-teal-200">
                        {msg.intent}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                        Dept: {msg.dept}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 font-semibold border border-amber-200">
                        SLA: {msg.sla}
                      </span>
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.time}</span>
              </div>
            ))}

          </div>

          <div className="p-3 bg-white border-t border-slate-200 text-[11px] text-slate-500">
            New guest conversations arrive here after the ElevenLabs post-call webhook is processed.
          </div>
        </div>

        {/* Right Column: AI Intent Extraction & Dispatch Status (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-teal-600" />
                <span>Live Intent Analysis</span>
              </h3>
              <span className="text-[10px] font-mono text-teal-700 bg-teal-50 px-2 py-0.5 rounded font-bold">
                {selectedConversation ? 'Recorded from Supabase' : 'No conversation'}
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Classified Category</span>
                <span className="font-bold text-slate-900">{lastParsedIntent.intentCategory}</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Assigned Dept</span>
                  <span className="font-bold text-teal-700">{lastParsedIntent.department}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Target Room</span>
                  <span className="font-bold text-slate-900">Room {lastParsedIntent.roomNumber}</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Autonomous Dispatch Action</span>
                <p className="font-semibold text-slate-800 text-[11px] leading-tight mt-0.5">
                  {lastParsedIntent.action}
                </p>
              </div>
            </div>

            {/* Jump to Livo Pad CTA */}
            <div className="mt-4 pt-3 border-t border-slate-100">
              <button
                onClick={() => setCurrentTab('lancepad')}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs"
              >
                <span>Track on Livo Pad Tablet</span>
                <ArrowRight className="w-3.5 h-3.5 text-teal-400" />
              </button>
            </div>
          </div>

          {/* Active Tasks for this Room */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              Dispatched Tasks for Room {activeRoomNumber}
            </h3>
            {guestRequests.length === 0 ? (
              <p className="text-xs text-slate-400 py-2">No active tasks for this room.</p>
            ) : (
              <div className="space-y-2">
                {guestRequests.slice(0, 2).map(r => (
                  <div key={r.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{r.request}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-100 text-teal-800">
                        {r.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">Assigned: {r.assignedStaffName || 'Auto-Routing'}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
