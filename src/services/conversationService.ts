import { supabase, isSupabaseConfigured } from './supabaseClient';

export interface GuestConversationMessage {
  role: 'user' | 'agent' | string;
  message?: string | null;
  time_in_call_secs?: number;
  tool_calls?: Array<{
    tool_name?: string;
    params_as_json?: string;
  }>;
}

export interface GuestConversation {
  id: string;
  elevenlabsConversationId: string;
  agentName: string;
  roomNumber: string;
  requestId: string | null;
  request: string | null;
  department: string | null;
  priority: string | null;
  status: string;
  transcript: GuestConversationMessage[];
  transcriptSummary: string | null;
  callDurationSecs: number | null;
  startedAt: string | null;
  endedAt: string | null;
  createdAt: string;
}

type ConversationRow = {
  id: string;
  elevenlabs_conversation_id: string;
  agent_name: string | null;
  room_number: string | null;
  request_id: string | null;
  request: string | null;
  department: string | null;
  priority: string | null;
  status: string | null;
  transcript: unknown;
  transcript_summary: string | null;
  call_duration_secs: number | null;
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
};

const toConversation = (row: ConversationRow): GuestConversation => ({
  id: row.id,
  elevenlabsConversationId: row.elevenlabs_conversation_id,
  agentName: row.agent_name || 'Receptionist AI',
  roomNumber: row.room_number || 'Unknown',
  requestId: row.request_id,
  request: row.request,
  department: row.department,
  priority: row.priority,
  status: row.status || 'completed',
  transcript: Array.isArray(row.transcript) ? row.transcript as GuestConversationMessage[] : [],
  transcriptSummary: row.transcript_summary,
  callDurationSecs: row.call_duration_secs,
  startedAt: row.started_at,
  endedAt: row.ended_at,
  createdAt: row.created_at
});

const conversationColumns = 'id, elevenlabs_conversation_id, agent_name, room_number, request_id, request, department, priority, status, transcript, transcript_summary, call_duration_secs, started_at, ended_at, created_at';

export const conversationService = {
  isConfigured: isSupabaseConfigured,

  async fetchConversations(): Promise<GuestConversation[]> {
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('guest_conversations')
      .select(conversationColumns)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data as ConversationRow[]).map(toConversation);
  },

  subscribe(
    onInsert: (conversation: GuestConversation) => void,
    onUpdate: (conversation: GuestConversation) => void
  ) {
    if (!supabase) return null;

    return supabase
      .channel('guest-conversations-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'guest_conversations' },
        payload => onInsert(toConversation(payload.new as ConversationRow))
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'guest_conversations' },
        payload => onUpdate(toConversation(payload.new as ConversationRow))
      )
      .subscribe();
  },

  removeSubscription(channel: ReturnType<NonNullable<typeof supabase>['channel']> | null) {
    if (channel && supabase) void supabase.removeChannel(channel);
  }
};
