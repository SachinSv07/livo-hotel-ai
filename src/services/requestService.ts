import { GuestRequest, Priority, RequestStatus } from '../types';
import { isSupabaseConfigured, supabase } from './supabaseClient';

type RequestRow = {
  id: string;
  room_number: string;
  request: string | null;
  department: string | null;
  priority: string | null;
  status: string | null;
  created_at: string | null;
  acknowledged_at: string | null;
  completed_at: string | null;
};

const departments: GuestRequest['department'][] = [
  'Front Desk',
  'Housekeeping',
  'Engineering',
  'Concierge',
  'Food & Beverage',
  'Sales',
  'Security',
  'Spa & Wellness'
];

const priorities: Priority[] = ['Low', 'Normal', 'High', 'Urgent'];
const statuses: RequestStatus[] = ['Pending', 'In Progress', 'Escalated', 'Completed', 'Cancelled'];

const normalizeValue = (value: string | null | undefined) => {
  return (value || '')
    .replace(/\u00a0/g, ' ')
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ');
};

const toDepartment = (value: string | null) => {
  const normalized = normalizeValue(value);
  const departmentAliases: Record<string, GuestRequest['department']> = {
    food: 'Food & Beverage',
    'food and beverage': 'Food & Beverage',
    'food & beverage': 'Food & Beverage',
    housekeeping: 'Housekeeping',
    'front desk': 'Front Desk',
    engineering: 'Engineering',
    concierge: 'Concierge',
    sales: 'Sales',
    security: 'Security',
    'spa wellness': 'Spa & Wellness',
    'spa & wellness': 'Spa & Wellness'
  };
  const department = departmentAliases[normalized] || 'Housekeeping';
  return departments.includes(department) ? department : 'Housekeeping';
};

const toPriority = (value: string | null): Priority => {
  const priority = normalizeValue(value) as Priority;
  return priorities.includes(priority) ? priority : 'Normal';
};

const toStatus = (value: string | null): RequestStatus => {
  const statusAliases: Record<string, RequestStatus> = {
    pending: 'Pending',
    new: 'Pending',
    acknowledged: 'In Progress',
    accepted: 'In Progress',
    'in progress': 'In Progress',
    escalated: 'Escalated',
    completed: 'Completed',
    complete: 'Completed',
    resolved: 'Completed',
    done: 'Completed',
    cancelled: 'Cancelled',
    canceled: 'Cancelled'
  };
  const status = statusAliases[normalizeValue(value)] || 'Pending';
  return statuses.includes(status) ? status : 'Pending';
};

const toGuestRequest = (row: RequestRow): GuestRequest => ({
  id: row.id,
  guestId: 'guest-1',
  guestName: 'In-House Guest',
  roomNumber: row.room_number,
  request: row.request || 'Guest service request',
  department: toDepartment(row.department),
  priority: toPriority(row.priority),
  status: toStatus(row.status),
  channel: 'WhatsApp',
  createdAt: row.created_at || new Date().toISOString(),
  updatedAt: row.acknowledged_at || row.created_at || new Date().toISOString(),
  completedAt: row.completed_at || undefined,
  isAiHandled: false,
  pmsSyncStatus: 'synced',
  slaMinutes: 20
});

const toRequestRow = (request: GuestRequest) => ({
  id: request.id,
  room_number: request.roomNumber,
  request: request.request,
  department: request.department,
  priority: request.priority,
  status: request.status,
  created_at: new Date().toISOString(),
  acknowledged_at: request.status === 'Pending' ? null : new Date().toISOString(),
  completed_at: request.status === 'Completed' ? new Date().toISOString() : null
});

export const requestService = {
  isConfigured: isSupabaseConfigured,

  async fetchRequests(): Promise<GuestRequest[]> {
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('requests')
      .select('id, room_number, request, department, priority, status, created_at, acknowledged_at, completed_at')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data as RequestRow[]).map(toGuestRequest);
  },

  async insertRequest(request: GuestRequest): Promise<GuestRequest> {
    if (!supabase) return request;

    const { data, error } = await supabase
      .from('requests')
      .insert(toRequestRow(request))
      .select('id, room_number, request, department, priority, status, created_at, acknowledged_at, completed_at')
      .single();

    if (error) throw error;
    return toGuestRequest(data as RequestRow);
  },

  async updateRequestStatus(
    requestId: string,
    status: RequestStatus,
    priority?: Priority
  ): Promise<void> {
    if (!supabase) return;

    const updates: Record<string, string | null> = {
      status,
      acknowledged_at: status === 'Pending' ? null : new Date().toISOString()
    };

    if (status === 'Completed') updates.completed_at = new Date().toISOString();
    if (priority) updates.priority = priority;

    const { error } = await supabase
      .from('requests')
      .update(updates)
      .eq('id', requestId);

    if (error) throw error;
  },

  subscribe(
    onInsert: (request: GuestRequest) => void,
    onUpdate: (request: GuestRequest) => void,
    onDelete: (requestId: string) => void
  ) {
    if (!supabase) return null;

    return supabase
      .channel('requests-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'requests' },
        payload => onInsert(toGuestRequest(payload.new as RequestRow))
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'requests' },
        payload => onUpdate(toGuestRequest(payload.new as RequestRow))
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'requests' },
        payload => onDelete((payload.old as RequestRow).id)
      )
      .subscribe();
  },

  removeSubscription(channel: ReturnType<NonNullable<typeof supabase>['channel']> | null) {
    if (channel && supabase) void supabase.removeChannel(channel);
  }
};
