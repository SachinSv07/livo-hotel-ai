import type { NavTab } from '../context/AppContext';
import { Department, GuestRequest, TaskItem, UserRole } from '../types';

export const ROLE_ACCESS: Record<UserRole, NavTab[]> = {
  Admin: [
    'dashboard', 'receptionist', 'sales', 'lancepad', 'requests', 'pipeline',
    'tasks', 'messages', 'analytics', 'knowledge', 'settings'
  ],
  Manager: [
    'dashboard', 'receptionist', 'sales', 'lancepad', 'requests', 'pipeline',
    'tasks', 'messages', 'analytics', 'knowledge'
  ],
  Receptionist: [
    'dashboard', 'receptionist', 'requests', 'tasks', 'messages', 'knowledge'
  ],
  Housekeeping: ['dashboard', 'lancepad', 'tasks', 'requests', 'messages'],
  Engineering: ['dashboard', 'lancepad', 'tasks', 'requests', 'messages'],
  Sales: ['dashboard', 'sales', 'pipeline', 'tasks', 'messages', 'analytics', 'knowledge'],
  Concierge: ['dashboard', 'receptionist', 'requests', 'tasks', 'messages', 'knowledge']
};

export const ROLE_HOME: Record<UserRole, NavTab> = {
  Admin: 'dashboard',
  Manager: 'dashboard',
  Receptionist: 'receptionist',
  Housekeeping: 'lancepad',
  Engineering: 'lancepad',
  Sales: 'sales',
  Concierge: 'receptionist'
};

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  Admin: 'Full property and system access',
  Manager: 'Operations oversight and approvals',
  Receptionist: 'Guest service and request coordination',
  Housekeeping: 'Housekeeping task execution',
  Engineering: 'Maintenance task execution',
  Sales: 'Lead qualification and pipeline management',
  Concierge: 'Guest arrangements and service requests'
};

export const ROLE_DEPARTMENT: Partial<Record<UserRole, Department>> = {
  Housekeeping: 'Housekeeping',
  Engineering: 'Engineering',
  Sales: 'Sales',
  Concierge: 'Concierge'
};

export const canAccessTab = (role: UserRole, tab: NavTab) => ROLE_ACCESS[role].includes(tab);

export const tasksForRole = (tasks: TaskItem[], role: UserRole) => {
  const department = ROLE_DEPARTMENT[role];
  return department ? tasks.filter(task => task.department === department) : tasks;
};

export const requestsForRole = (requests: GuestRequest[], role: UserRole) => {
  const department = ROLE_DEPARTMENT[role];
  return department ? requests.filter(request => request.department === department) : requests;
};
