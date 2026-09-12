import type { UserRole } from '../types';

export type Permission =
  | 'dashboard.view'
  | 'requests.view'
  | 'requests.create'
  | 'requests.update_status'
  | 'requests.assign'
  | 'requests.delete'
  | 'tasks.view'
  | 'tasks.accept'
  | 'tasks.complete'
  | 'tasks.escalate'
  | 'tasks.reassign'
  | 'messages.view'
  | 'messages.send'
  | 'sales.view'
  | 'sales.edit'
  | 'analytics.view'
  | 'knowledge.view'
  | 'knowledge.edit'
  | 'settings.view'
  | 'settings.edit'
  | 'staff.manage';

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  Admin: [
    'dashboard.view',
    'requests.view',
    'requests.create',
    'requests.update_status',
    'requests.assign',
    'requests.delete',
    'tasks.view',
    'tasks.accept',
    'tasks.complete',
    'tasks.escalate',
    'tasks.reassign',
    'messages.view',
    'messages.send',
    'sales.view',
    'sales.edit',
    'analytics.view',
    'knowledge.view',
    'knowledge.edit',
    'settings.view',
    'settings.edit',
    'staff.manage'
  ],
  Manager: [
    'dashboard.view',
    'requests.view',
    'requests.create',
    'requests.update_status',
    'requests.assign',
    'tasks.view',
    'tasks.accept',
    'tasks.complete',
    'tasks.escalate',
    'tasks.reassign',
    'messages.view',
    'messages.send',
    'sales.view',
    'sales.edit',
    'analytics.view',
    'knowledge.view',
    'knowledge.edit'
  ],
  Receptionist: [
    'dashboard.view',
    'requests.view',
    'requests.create',
    'requests.update_status',
    'requests.assign',
    'tasks.view',
    'tasks.escalate',
    'messages.view',
    'messages.send',
    'knowledge.view'
  ],
  Housekeeping: [
    'dashboard.view',
    'requests.view',
    'requests.create',
    'requests.update_status',
    'tasks.view',
    'tasks.accept',
    'tasks.complete',
    'tasks.escalate',
    'messages.view',
    'messages.send'
  ],
  Engineering: [
    'dashboard.view',
    'requests.view',
    'requests.create',
    'requests.update_status',
    'tasks.view',
    'tasks.accept',
    'tasks.complete',
    'tasks.escalate',
    'messages.view',
    'messages.send'
  ],
  Sales: [
    'dashboard.view',
    'tasks.view',
    'messages.view',
    'messages.send',
    'sales.view',
    'sales.edit',
    'analytics.view',
    'knowledge.view'
  ],
  Concierge: [
    'dashboard.view',
    'requests.view',
    'requests.create',
    'requests.update_status',
    'tasks.view',
    'tasks.accept',
    'tasks.complete',
    'tasks.escalate',
    'messages.view',
    'messages.send',
    'knowledge.view'
  ]
};

export const canPerform = (role: UserRole, permission: Permission): boolean =>
  ROLE_PERMISSIONS[role].includes(permission);
