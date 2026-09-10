import React, { useState } from 'react';
import {
  ArrowRight,
  ChevronDown,
  Clock3,
  Coffee,
  Dumbbell,
  Globe2,
  Hotel,
  Info,
  KeyRound,
  MessageCircle,
  Mic,
  Send,
  Sparkles,
  Utensils,
  Waves,
  Wifi,
  Wrench,
  X,
  type LucideIcon
} from 'lucide-react';
import { useVoiceAgent, type VoiceAgentStatus } from '../../hooks/useVoiceAgent';
import './GuestConcierge.css';

interface GuestConciergeProps {
  roomToken: string | null;
}

interface QuickAction {
  label: string;
  description: string;
  icon: LucideIcon;
}

const quickActions: QuickAction[] = [
  { label: 'Housekeeping', description: 'Extra towels, pillows & more', icon: Sparkles },
  { label: 'Maintenance', description: 'Report an issue', icon: Wrench },
  { label: 'Room service', description: 'Food & beverages', icon: Utensils },
  { label: 'Hotel information', description: 'Facilities, timings & policies', icon: Info }
];

const popularRequests = ['Extra towels', 'Room cleaning', 'Wi-Fi password', 'Late checkout', 'Room service', 'Maintenance'];

const statusCopy: Record<VoiceAgentStatus, string> = {
  idle: 'Talk to AI',
  connecting: 'Connecting...',
  listening: 'Listening...',
  thinking: 'Thinking...',
  speaking: 'AI Concierge is speaking...',
  error: 'Try again'
};

const isValidRoomToken = (roomToken: string | null): roomToken is string => Boolean(roomToken && /^[a-z0-9-]{1,24}$/i.test(roomToken));

export const GuestConcierge: React.FC<GuestConciergeProps> = ({ roomToken }) => {
  const validRoom = isValidRoomToken(roomToken);
  const roomNumber = validRoom ? roomToken : '';
  const [language, setLanguage] = useState('EN');
  const [languageOpen, setLanguageOpen] = useState(false);
  const [confirmation, setConfirmation] = useState<string | null>(null);
  const [textMessage, setTextMessage] = useState('');
  const { startConversation, sendTextMessage, endConversation, status, messages } = useVoiceAgent({ roomNumber });

  const handleRequest = (request: string) => {
    setConfirmation(`${request} is ready to send to our team.`);
    startConversation(request);
    window.setTimeout(() => setConfirmation(null), 4200);
  };

  const handleTextSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const message = textMessage.trim();
    if (!message) return;
    setTextMessage('');
    await sendTextMessage(message);
  };

  if (!validRoom) {
    return (
      <main className="guest-shell guest-error-shell">
        <div className="guest-error-card">
          <div className="guest-brand-mark"><Hotel size={20} /></div>
          <p className="guest-eyebrow">Lance Grand Hotel</p>
          <h1>Sorry, we couldn&apos;t identify this room.</h1>
          <p>Please scan the QR code again or contact reception.</p>
          <a href="tel:0" className="guest-secondary-button">Contact reception <ArrowRight size={16} /></a>
        </div>
      </main>
    );
  }

  const isActive = status !== 'idle';

  return (
    <main className="guest-shell">
      <div className="guest-page">
        <header className="guest-header guest-reveal guest-delay-1">
          <div className="guest-brand"><span className="guest-brand-mark"><Hotel size={18} /></span><span>Lance Grand</span></div>
          <div className="guest-header-actions">
            <div className="guest-language-wrap">
              <button className="guest-language-button" onClick={() => setLanguageOpen(!languageOpen)} aria-expanded={languageOpen} aria-label="Select language">
                <Globe2 size={15} /> {language} <ChevronDown size={13} />
              </button>
              {languageOpen && (
                <div className="guest-language-menu" role="menu">
                  {['EN', 'HI', 'TA'].map((option) => <button key={option} role="menuitem" onClick={() => { setLanguage(option); setLanguageOpen(false); }}>{option}</button>)}
                </div>
              )}
            </div>
          </div>
        </header>

        <section className="guest-welcome guest-reveal guest-delay-2">
          <p className="guest-eyebrow">Your stay, made simple</p>
          <h1>Welcome to<br /><em>Lance Grand</em></h1>
          <p className="guest-welcome-copy">How can we make your stay better?</p>
          <div className="guest-room-tag"><KeyRound size={14} /> Room {roomNumber}</div>
        </section>

        <section className={`guest-ai-card guest-reveal guest-delay-3 ${isActive ? 'is-active' : ''}`} aria-live="polite">
          <div className="guest-ai-card-top"><span className="guest-ai-kicker"><Sparkles size={15} /> Concierge at your service</span><span className="guest-online-dot">Available 24/7</span></div>
          <div className="guest-orb-wrap"><div className="guest-orb-ring guest-ring-one" /><div className="guest-orb-ring guest-ring-two" /><div className="guest-orb"><Sparkles size={27} /></div></div>
          <h2>Your AI Concierge</h2>
          <p>{isActive ? 'I’m here. Tell me what you need during your stay.' : 'I’m here to help with anything during your stay.'}</p>
          <button className="guest-talk-button" onClick={() => isActive ? endConversation() : startConversation()} aria-label={isActive ? 'End AI concierge conversation' : 'Talk to AI concierge'}>
            {isActive ? <X size={18} /> : <Mic size={18} />} {statusCopy[status]}
          </button>
          <div className="guest-text-divider"><span>or chat by text</span></div>
          <div className="guest-chat-panel" aria-live="polite">
            {messages.length === 0 ? <p className="guest-chat-empty">Ask about your room, hotel services, or anything you need during your stay.</p> : messages.map((message, index) => <div className={`guest-chat-message ${message.role === 'user' ? 'is-user' : 'is-agent'}`} key={`${message.role}-${index}`}><span>{message.message}</span></div>)}
            {status === 'thinking' && <div className="guest-chat-typing" aria-label="AI Concierge is typing"><span /><span /><span /></div>}
          </div>
          <form className="guest-text-form" onSubmit={handleTextSubmit}>
            <MessageCircle size={17} aria-hidden="true" />
            <input value={textMessage} onChange={(event) => setTextMessage(event.target.value)} placeholder="How can I help you?" aria-label="Type a request for the AI Concierge" />
            <button type="submit" aria-label="Send text request" disabled={!textMessage.trim()}><Send size={16} /></button>
          </form>
          {isActive && <div className="guest-waveform" aria-label={statusCopy[status]}>{[1, 2, 3, 4, 5, 6, 7].map((bar) => <span key={bar} />)}</div>}
        </section>

        <section className="guest-section guest-reveal guest-delay-4">
          <div className="guest-section-heading"><div><p className="guest-eyebrow">At a tap</p><h2>Quick requests</h2></div><span className="guest-section-rule" /></div>
          <div className="guest-quick-grid">{quickActions.map(({ label, description, icon: Icon }) => <button className="guest-quick-action" key={label} onClick={() => handleRequest(label)}><span className="guest-action-icon"><Icon size={19} /></span><span><strong>{label}</strong><small>{description}</small></span><ArrowRight size={16} className="guest-action-arrow" /></button>)}</div>
        </section>

        <section className="guest-section guest-reveal guest-delay-5">
          <div className="guest-section-heading"><div><p className="guest-eyebrow">Commonly requested</p><h2>Popular requests</h2></div></div>
          <div className="guest-request-pills">{popularRequests.map((request) => <button key={request} onClick={() => handleRequest(request)}>{request}</button>)}</div>
        </section>

        <section className="guest-info-section guest-reveal guest-delay-5">
          <div className="guest-section-heading"><div><p className="guest-eyebrow">For your comfort</p><h2>Good to know</h2></div></div>
          <div className="guest-info-grid"><span><Wifi size={17} /><strong>Wi-Fi</strong><small>Lance Guest</small></span><span><Coffee size={17} /><strong>Breakfast</strong><small>7:00 - 10:30</small></span><span><Waves size={17} /><strong>Pool</strong><small>6:00 - 21:00</small></span><span><Dumbbell size={17} /><strong>Gym</strong><small>Open 24 hours</small></span><span><Clock3 size={17} /><strong>Check-out</strong><small>By 12:00</small></span><span><Info size={17} /><strong>Reception</strong><small>Dial 0</small></span></div>
        </section>

        <footer className="guest-footer">Need anything else? Just ask your AI Concierge.<span>Always here for you, day or night.</span></footer>
      </div>
      {confirmation && <div className="guest-toast" role="status"><span className="guest-toast-check">✓</span><span><strong>Request noted</strong><small>{confirmation}</small></span><button onClick={() => setConfirmation(null)} aria-label="Dismiss confirmation"><X size={15} /></button></div>}
    </main>
  );
};