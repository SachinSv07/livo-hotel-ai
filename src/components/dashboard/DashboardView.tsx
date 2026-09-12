import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ConciergeBell, 
  CheckSquare, 
  Bot, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  IndianRupee, 
  Users, 
  ArrowUpRight, 
  Sparkles, 
  AlertTriangle, 
  ChevronRight, 
  ArrowRight,
  ShieldAlert,
  PlayCircle,
  PlusCircle,
  Building2,
  Hotel
} from 'lucide-react';
import { hotelService } from '../../services/hotelService';
import { canAccessTab, requestsForRole, tasksForRole } from '../../config/roleAccess';

export const DashboardView: React.FC = () => {
  const { 
    requests, 
    tasks, 
    opportunities, 
    staff, 
    aiLogs, 
    setCurrentTab, 
    setIsAiModalOpen,
    setIsDemoTourOpen,
    acceptTask,
    completeTask,
    currentUserRole
  } = useApp();

  const pendingRequests = requests.filter(r => r.status === 'Pending' || r.status === 'In Progress');
  const visibleRequests = requestsForRole(requests, currentUserRole);
  const visiblePendingRequests = visibleRequests.filter(r => r.status === 'Pending' || r.status === 'In Progress');
  const visibleTasks = tasksForRole(tasks, currentUserRole);
  const pendingTasks = visibleTasks.filter(t => t.status !== 'COMPLETED');
  const isLeadership = currentUserRole === 'Admin' || currentUserRole === 'Manager';
  const isSalesRole = currentUserRole === 'Sales';
  const departmentWorkloads = hotelService
    .calculateDepartmentWorkload(visibleTasks, staff)
    .filter(workload => isLeadership || workload.activeTasks > 0 || workload.department === currentUserRole);

  const roleDashboard = {
    Admin: {
      title: 'Hotel Operations Cockpit',
      description: 'Property-wide oversight across guest service, staffing, AI activity, and revenue.',
      primaryLabel: 'Open Operations',
      primaryTab: 'lancepad' as const
    },
    Manager: {
      title: 'Manager Command Center',
      description: 'Monitor service levels, unresolved work, and department capacity across the property.',
      primaryLabel: 'Review Operations',
      primaryTab: 'lancepad' as const
    },
    Receptionist: {
      title: 'Front Desk Service Desk',
      description: 'Coordinate guest requests, dispatch service, and keep the front desk response moving.',
      primaryLabel: 'Open Guest Requests',
      primaryTab: 'requests' as const
    },
    Housekeeping: {
      title: 'Housekeeping Workboard',
      description: 'Your active room-service queue, SLA countdowns, and requests ready for completion.',
      primaryLabel: 'Open Lance Pad',
      primaryTab: 'lancepad' as const
    },
    Engineering: {
      title: 'Engineering Workboard',
      description: 'Track maintenance issues, priority repairs, and the next tasks requiring attention.',
      primaryLabel: 'Open Maintenance Queue',
      primaryTab: 'lancepad' as const
    },
    Sales: {
      title: 'Sales Performance Hub',
      description: 'Focus on qualified opportunities, pipeline movement, and high-value hotel inquiries.',
      primaryLabel: 'Open Sales Pipeline',
      primaryTab: 'pipeline' as const
    },
    Concierge: {
      title: 'Concierge Service Desk',
      description: 'Stay ahead of guest arrangements, open requests, and service follow-through.',
      primaryLabel: 'Open Guest Requests',
      primaryTab: 'requests' as const
    }
  }[currentUserRole];

  const roleRequests = visibleRequests.slice(0, 4);
  const roleLogs = currentUserRole === 'Admin' || currentUserRole === 'Manager'
    ? aiLogs
    : aiLogs.filter(log => visibleTasks.some(task => task.department === log.department));

  const kpis = [
    {
      title: 'Active Guest Requests',
      value: visiblePendingRequests.length,
      subtext: 'Visible active requests',
      change: `${visibleRequests.length} total`,
      icon: ConciergeBell,
      color: 'text-teal-600',
      bg: 'bg-teal-50 border-teal-200'
    },
    {
      title: 'Pending Staff Tasks',
      value: pendingTasks.length,
      subtext: 'Your visible queue',
      change: `${visibleTasks.filter(t => t.priority === 'High' || t.priority === 'Urgent').length} high priority`,
      icon: CheckSquare,
      color: 'text-amber-600',
      bg: 'bg-amber-50 border-amber-200'
    },
    {
      title: 'AI Conversations Today',
      value: aiLogs.length,
      subtext: 'Recorded AI activity',
      change: currentUserRole === 'Sales' ? 'Sales inquiries' : 'Current workspace',
      icon: Bot,
      color: 'text-blue-600',
      bg: 'bg-blue-50 border-blue-200'
    },
    {
      title: 'Sales Opportunities',
      value: opportunities.length,
      subtext: 'Active in Pipeline',
      change: `${opportunities.filter(o => o.stage === 'Proposal').length} proposals`,
      icon: TrendingUp,
      color: 'text-purple-600',
      bg: 'bg-purple-50 border-purple-200'
    },
    {
      title: 'Avg Response Time',
      value: visibleRequests.length ? `${Math.round(visibleRequests.reduce((total, request) => total + request.slaMinutes, 0) / visibleRequests.length)}m` : '—',
      subtext: 'Average request SLA',
      change: 'From request data',
      icon: Clock,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 border-emerald-200'
    },
    {
      title: 'Resolution Rate',
      value: visibleTasks.length ? `${Math.round((visibleTasks.filter(t => t.status === 'COMPLETED').length / visibleTasks.length) * 100)}%` : '—',
      subtext: 'Visible tasks completed',
      change: 'Current data',
      icon: CheckCircle2,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50 border-indigo-200'
    },
    {
      title: 'Revenue Opportunities',
      value: `₹${(opportunities.reduce((total, opportunity) => total + opportunity.estimatedValue, 0) / 100000).toFixed(1)}L`,
      subtext: 'Qualified Pipeline Deals',
      change: currentUserRole === 'Sales' ? 'Prioritize qualified leads' : 'Pipeline overview',
      icon: IndianRupee,
      color: 'text-teal-700',
      bg: 'bg-teal-50 border-teal-200'
    },
    {
      title: 'Staff Workload',
      value: `${staff.length ? Math.round((staff.filter(member => member.status === 'Available').length / staff.length) * 100) : 0}%`,
      subtext: 'Staff currently available',
      change: `${staff.length} staff records`,
      icon: Users,
      color: 'text-slate-700',
      bg: 'bg-slate-50 border-slate-200'
    }
  ];

  const visibleKpis = kpis.filter(kpi => {
    if (isLeadership) return true;
    if (isSalesRole) return ['AI Conversations Today', 'Sales Opportunities', 'Revenue Opportunities', 'Staff Workload'].includes(kpi.title);
    if (currentUserRole === 'Receptionist' || currentUserRole === 'Concierge') return ['Active Guest Requests', 'Pending Staff Tasks', 'AI Conversations Today', 'Avg Response Time', 'Resolution Rate'].includes(kpi.title);
    return ['Active Guest Requests', 'Pending Staff Tasks', 'Avg Response Time', 'Resolution Rate'].includes(kpi.title);
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner with Quick Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight">{roleDashboard.title}</h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/40">
              Live Real-Time Sync
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            {roleDashboard.description}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setCurrentTab(roleDashboard.primaryTab)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-teal-300 bg-teal-950/80 hover:bg-teal-900 border border-teal-500/40 rounded-xl transition-all shadow-xs"
          >
            <ArrowRight className="w-3.5 h-3.5 text-teal-400" />
            <span>{roleDashboard.primaryLabel}</span>
          </button>

          <button
            onClick={() => currentUserRole === 'Admin' || currentUserRole === 'Manager' ? setIsDemoTourOpen(true) : setCurrentTab(currentUserRole === 'Sales' ? 'sales' : 'receptionist')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 rounded-xl transition-all shadow-md active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{currentUserRole === 'Sales' ? 'Open Sales AI' : 'Open AI Assistant'}</span>
          </button>
        </div>
      </div>

      {/* KPI 8-Card Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {visibleKpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider line-clamp-1">
                  {kpi.title}
                </span>
                <div className={`p-1.5 rounded-lg ${kpi.bg}`}>
                  <Icon className={`w-4 h-4 ${kpi.color}`} />
                </div>
              </div>

              <div className="mt-3">
                <span className="text-2xl font-black text-slate-900 tracking-tight font-['Outfit',sans-serif]">
                  {kpi.value}
                </span>
                <div className="flex items-center justify-between text-[10px] mt-1">
                  <span className="text-slate-500 font-medium">{kpi.subtext}</span>
                  <span className="text-teal-700 font-semibold">{kpi.change}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Section Grid: Live Operations + AI Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Section A: Live Operations (2 Columns) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <h2 className="text-sm font-bold text-slate-900 tracking-tight">{isSalesRole ? 'Sales Pipeline Activity' : `${currentUserRole} Service Queue`}</h2>
              </div>
              <button
                onClick={() => setCurrentTab('requests')}
                className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1"
              >
                <span>{isSalesRole ? `View Pipeline (${opportunities.length})` : `View All (${visibleRequests.length})`}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {isSalesRole ? opportunities.slice(0, 4).map(opportunity => (
                <div key={opportunity.id} className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/30 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-slate-900">{opportunity.company}</p>
                    <p className="text-[11px] text-slate-600">{opportunity.eventType} • {opportunity.guestCount} guests • {opportunity.stage}</p>
                  </div>
                  <button onClick={() => setCurrentTab('pipeline')} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold">Open Lead</button>
                </div>
              )) : roleRequests.map(req => (
                <div
                  key={req.id}
                  className="p-3.5 rounded-xl border border-slate-200/70 hover:border-teal-300/80 bg-slate-50/50 hover:bg-teal-50/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-black text-xs flex flex-col items-center justify-center shrink-0">
                      <span className="text-[9px] text-slate-400 font-normal">ROOM</span>
                      <span>{req.roomNumber}</span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-900">{req.request}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          req.priority === 'High' 
                            ? 'bg-rose-50 text-rose-700 border-rose-200' 
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}>
                          {req.priority}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          req.status === 'Completed' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : req.status === 'Escalated'
                            ? 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse'
                            : req.status === 'In Progress'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {req.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                        <span><strong>Dept:</strong> {req.department}</span>
                        <span>•</span>
                        <span><strong>Assigned:</strong> {req.assignedStaffName || 'Auto-Routing...'}</span>
                        <span>•</span>
                        <span><strong>Channel:</strong> {req.channel}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setCurrentTab('lancepad')}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all"
                    >
                      Open on Lance Pad
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section D: Revenue Opportunities Spotlight */}
          {canAccessTab(currentUserRole, 'pipeline') && <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <h2 className="text-sm font-bold text-slate-900 tracking-tight">Section D: Sales Revenue Opportunities (AI Qualified)</h2>
              </div>
              <button
                onClick={() => setCurrentTab('pipeline')}
                className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1"
              >
                <span>Pipeline CRM ({opportunities.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {opportunities.slice(0, 2).map(opp => (
                <div
                  key={opp.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-blue-50/30 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded">
                        Stage: {opp.stage}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-700">
                        Score: {opp.leadScore}/100
                      </span>
                    </div>
                    <h3 className="text-xs font-bold text-slate-900 mt-1.5">{opp.company}</h3>
                    <p className="text-[11px] text-slate-600">{opp.eventType} • {opp.guestCount} Guests</p>
                    <p className="text-[10px] text-slate-500 mt-1">Dates: {opp.eventDates}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Est. Revenue</span>
                      <span className="text-base font-extrabold text-blue-700">
                        ₹{(opp.estimatedValue / 100000).toFixed(1)} Lakhs
                      </span>
                    </div>
                    <button
                      onClick={() => setCurrentTab('sales')}
                      className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors"
                    >
                      View AI Lead
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>}
        </div>

        {/* Right Column: Section B (AI Activity) + Section C (Department Workload) */}
        <div className="space-y-6">
          {/* Section B: AI Live Activity */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-600" />
                <h2 className="text-sm font-bold text-slate-900 tracking-tight">{isSalesRole ? 'Sales AI Activity' : `${currentUserRole} Activity`}</h2>
              </div>
              <span className="text-[10px] font-mono text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded font-bold">
                Automated
              </span>
            </div>

            <div className="space-y-3">
              {roleLogs.slice(0, 5).map(log => (
                <div key={log.id} className="text-xs p-2.5 rounded-lg bg-slate-50 border border-slate-200/60">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                    <span className="font-bold text-slate-700">{log.roomOrLead}</span>
                    <span>{log.timestamp}</span>
                  </div>
                  <p className="text-slate-700 font-medium leading-tight">
                    {log.description}
                  </p>
                  <div className="mt-1.5 flex items-center justify-between text-[10px]">
                    <span className="text-teal-700 font-semibold">{log.department}</span>
                    <span className="text-slate-400 font-mono">{log.latencyMs}ms</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section C: Department Workload */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-700" />
                <h2 className="text-sm font-bold text-slate-900 tracking-tight">{isLeadership ? 'Department Workload' : `${currentUserRole} Workload`}</h2>
              </div>
              <span className="text-[10px] text-slate-500 font-medium">{isLeadership ? 'All active teams' : 'Your team'}</span>
            </div>

            <div className="space-y-3.5">
              {departmentWorkloads.length === 0 ? (
                <p className="py-5 text-xs text-slate-400">No active work in your queue.</p>
              ) : departmentWorkloads.map(dept => (
                <div key={dept.department} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-800">{dept.department}</span>
                    <span className="text-slate-600 font-mono text-[11px]">
                      {dept.activeTasks} Tasks • {dept.loadPercentage}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${dept.color} transition-all duration-500`}
                      style={{ width: `${Math.max(8, dept.loadPercentage)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100">
              <button
                onClick={() => setCurrentTab('lancepad')}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <span>{isLeadership ? 'Manage Staff Shifts on Lance Pad' : 'Open My Lance Pad Queue'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
