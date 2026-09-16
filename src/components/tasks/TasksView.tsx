import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  CheckSquare, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  User, 
  Tablet, 
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { TaskItem, Department, TaskStatus } from '../../types';
import { ROLE_DEPARTMENT } from '../../config/roleAccess';
import { canPerform } from '../../config/permissions';

export const TasksView: React.FC = () => {
  const { 
    tasks, 
    staff, 
    acceptTask, 
    completeTask, 
    escalateTask, 
    setCurrentTab,
    currentUserRole
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'All'>('All');
  const [deptFilter, setDeptFilter] = useState<Department | 'All'>('All');

  const roleDepartment = ROLE_DEPARTMENT[currentUserRole];
  const visibleTasks = roleDepartment ? tasks.filter(task => task.department === roleDepartment) : tasks;

  const filteredTasks = visibleTasks.filter(task => {
    const matchesSearch = 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.roomNumber.includes(searchQuery) ||
      task.assignedToStaffName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'All' || task.status === statusFilter;
    const matchesDept = deptFilter === 'All' || task.department === deptFilter;

    return matchesSearch && matchesStatus && matchesDept;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Banner */}
      <div className="p-5 rounded-xl bg-white border border-stone-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#F0F5F1] text-[#395C3E] border border-[#B9D3BC] flex items-center justify-center">
              <CheckSquare className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-bold text-stone-900 tracking-tight font-['Outfit',sans-serif]">Staff Operations Task Central</h1>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#F0F5F1] text-[#2C4930] border border-[#B9D3BC]">
              {visibleTasks.length} Tasks
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Departmental task queues with countdown SLAs and staff performance auditing.
          </p>
        </div>

        <button
          onClick={() => setCurrentTab('lancepad')}
          className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-xs"
        >
          <Tablet className="w-4 h-4 text-[#CC9A4C]" />
          <span>Switch to Livo Pad Tablet View</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search tasks by room, title, or assigned staff..."
              className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#4B7350] font-medium"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="text-xs font-semibold p-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-700"
            >
              <option value="All">All Statuses</option>
              <option value="NEW">NEW</option>
              <option value="IN PROGRESS">IN PROGRESS</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="ESCALATED">ESCALATED</option>
            </select>

            <select
              value={deptFilter}
              onChange={e => setDeptFilter(e.target.value as any)}
              className="text-xs font-semibold p-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-700"
            >
              <option value="All">All Departments</option>
              <option value="Housekeeping">Housekeeping</option>
              <option value="Engineering">Engineering</option>
              <option value="Front Desk">Front Desk</option>
              <option value="Concierge">Concierge</option>
              <option value="Food & Beverage">Food & Beverage</option>
            </select>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-2xs overflow-hidden">
        <div className="divide-y divide-stone-100">
          {filteredTasks.length === 0 ? (
            <div className="py-12 text-center text-stone-400">
              <CheckCircle2 className="w-8 h-8 mx-auto text-stone-300 mb-2" />
              <p className="text-sm font-semibold text-stone-700">No tasks matching criteria</p>
            </div>
          ) : (
            filteredTasks.map(task => (
              <div
                key={task.id}
                className="p-4 hover:bg-stone-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-stone-900 text-white font-black text-xs flex flex-col items-center justify-center shrink-0">
                    <span className="text-[8px] text-stone-400 font-normal uppercase">Room</span>
                    <span className="text-sm">{task.roomNumber}</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-bold text-stone-600 bg-stone-100 px-1.5 py-0.5 rounded">
                        {task.id}
                      </span>
                      <h4 className="text-xs font-bold text-stone-900">{task.title}</h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        task.status === 'COMPLETED'
                          ? 'bg-[#F0F5F1] text-[#2C4930] border-[#B9D3BC]'
                          : task.status === 'IN PROGRESS'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : task.status === 'ESCALATED'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {task.status}
                      </span>
                    </div>

                    <p className="text-[11px] text-stone-500 mt-1">
                      {task.description} • Assigned to <strong className="text-stone-700">{task.assignedToStaffName}</strong> ({task.department})
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-mono text-stone-600 font-bold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-stone-400" />
                    SLA: {task.slaMinutes}m
                  </span>

                  {task.status === 'NEW' && canPerform(currentUserRole, 'tasks.accept') && (
                    <button
                      onClick={() => acceptTask(task.id)}
                      className="px-3 py-1.5 bg-[#395C3E] hover:bg-[#2C4930] text-white rounded-lg text-xs font-bold transition-all"
                    >
                      Accept
                    </button>
                  )}

                  {task.status === 'IN PROGRESS' && canPerform(currentUserRole, 'tasks.complete') && (
                    <button
                      onClick={() => completeTask(task.id, {
                        reason: 'Task executed',
                        guestNotified: true,
                        completedTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        notes: 'Task marked complete from operations hub'
                      })}
                      className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-bold transition-all"
                    >
                      Complete
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
