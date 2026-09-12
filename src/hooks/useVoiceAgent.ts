import { useCallback, useEffect, useRef, useState } from 'react';
import { Conversation } from '@elevenlabs/client';

export type VoiceAgentStatus = 'idle' | 'connecting' | 'listening' | 'thinking' | 'speaking' | 'error';

interface UseVoiceAgentOptions {
  roomNumber: string;
}

export interface VoiceAgent {
  startConversation: (initialRequest?: string) => void;
  sendTextMessage: (message: string) => Promise<void>;
  endConversation: () => void;
  messages: Array<{ role: 'user' | 'agent'; message: string }>;
  status: VoiceAgentStatus;
  isListening: boolean;
  isSpeaking: boolean;
  error: string | null;
}

export const useVoiceAgent = ({ roomNumber }: UseVoiceAgentOptions): VoiceAgent => {
  const [status, setStatus] = useState<VoiceAgentStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'agent'; message: string }>>([]);
  const conversation = useRef<Conversation | null>(null);
  const waitingForAgent = useRef(false);

  const endConversation = useCallback(() => {
    void conversation.current?.endSession();
    conversation.current = null;
    waitingForAgent.current = false;
    setStatus('idle');
    setError(null);
  }, []);

  const startConversation = useCallback(async (initialRequest?: string) => {
    const agentId = import.meta.env.VITE_ELEVENLABS_AGENT_ID;

    if (!agentId || agentId === 'YOUR_ELEVENLABS_AGENT_ID') {
      setError('Unable to connect to the AI Concierge.');
      setStatus('error');
      return;
    }

    setError(null);
    setStatus('connecting');

    try {
      conversation.current = await Conversation.startSession({
        agentId,
        dynamicVariables: { room_number: roomNumber },
        onConnect: () => setStatus('listening'),
        onDisconnect: () => {
          conversation.current = null;
          waitingForAgent.current = false;
          setStatus('idle');
        },
        onError: () => {
          conversation.current = null;
          waitingForAgent.current = false;
          setError('Unable to connect to the AI Concierge.');
          setStatus('error');
        },
        onModeChange: ({ mode }) => {
          if (mode === 'speaking') {
            setStatus('speaking');
          } else if (!waitingForAgent.current) {
            setStatus('listening');
          }
        },
        onMessage: ({ source, role, message }) => {
          const messageRole = role === 'user' || source === 'user' ? 'user' : 'agent';
          setMessages((currentMessages) => [...currentMessages, { role: messageRole, message }]);
          if (messageRole === 'user') {
            waitingForAgent.current = true;
            setStatus('thinking');
          } else {
            waitingForAgent.current = false;
            setStatus('speaking');
          }
        }
      });

      if (initialRequest) {
        conversation.current.sendUserMessage(initialRequest);
      }
    } catch {
      conversation.current = null;
      setError('Microphone access is required to talk to the AI Concierge.');
      setStatus('error');
    }
  }, [roomNumber]);

  const sendTextMessage = useCallback(async (message: string) => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;

    if (conversation.current) {
      waitingForAgent.current = true;
      setStatus('thinking');
      conversation.current.sendUserMessage(trimmedMessage);
      return;
    }

    await startConversation(trimmedMessage);
  }, [startConversation]);

  useEffect(() => () => {
    void conversation.current?.endSession();
  }, []);

  return {
    startConversation,
    sendTextMessage,
    endConversation,
    messages,
    status,
    isListening: status === 'listening',
    isSpeaking: status === 'speaking',
    error
  };
};