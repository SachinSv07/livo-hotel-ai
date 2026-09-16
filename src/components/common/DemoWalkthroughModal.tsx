import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  PlayCircle, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  Bot, 
  Tablet, 
  TrendingUp, 
  Sparkles, 
  Check, 
  LayoutDashboard,
  MessageSquare,
  FileText
} from 'lucide-react';

export const DemoWalkthroughModal: React.FC = () => {
  const { 
    isDemoTourOpen, 
    setIsDemoTourOpen, 
    demoStep, 
    setDemoStep, 
    executeDemoWorkflow 
  } = useApp();

  if (!isDemoTourOpen) return null;

  const demoSteps = [
    {
      step: 1,
      title: '1. Inbound Guest Request (WhatsApp)',
      module: 'Receptionist AI',
      icon: MessageSquare,
      description: 'Guest Rahul Krishnan (Room 402, Platinum VIP) sends a WhatsApp request: "I need two extra towels and a bathrobe in Room 402."',
      highlight: 'Receptionist AI receives the raw text, detects language, and performs entity recognition in < 300ms.',
      buttonLabel: 'Simulate Guest Message',
      tabHint: 'receptionist'
    },
    {
      step: 2,
      title: '2. AI Intent & Legacy PMS Verification',
      module: 'Receptionist AI + Legacy PMS',
      icon: Bot,
      description: 'Receptionist AI queries Oracle Opera PMS, validates Room 402 occupied status, and determines department is Housekeeping with Normal priority.',
      highlight: 'AI replies to guest on WhatsApp confirming an 8-minute delivery window.',
      buttonLabel: 'View AI Receptionist Panel',
      tabHint: 'receptionist'
    },
    {
      step: 3,
      title: '3. Instant Dispatch to Livo Pad Hub',
      module: 'Livo Pad (Tablet)',
      icon: Tablet,
      description: 'Task TASK-501 is created autonomously on Livo Pad. Assigned to on-duty housekeeper Priya Sharma with 10-minute countdown SLA.',
      highlight: 'Zero manual front desk phone calls. Zero staff interruptions.',
      buttonLabel: 'Open Livo Pad Hub',
      tabHint: 'lancepad'
    },
    {
      step: 4,
      title: '4. Staff Accepts & Starts Task',
      module: 'Livo Pad Staff Operations',
      icon: Tablet,
      description: 'Priya Sharma taps "Accept Task" on her tablet from the 4th floor linen pantry. Task state shifts to "IN PROGRESS".',
      highlight: 'Team communication channel #housekeeping auto-logs staff acceptance.',
      buttonLabel: 'Accept Task on Livo Pad',
      tabHint: 'lancepad'
    },
    {
      step: 5,
      title: '5. Staff Completes Task & Resolution',
      module: 'Livo Pad Staff Operations',
      icon: CheckCircle2,
      description: 'Staff delivers linens to Room 402 and taps "Complete". Enters quick resolution note and verifies guest handoff.',
      highlight: 'Opera PMS room log updated, staff performance rating updated.',
      buttonLabel: 'Complete Task & Trigger Confetti',
      tabHint: 'lancepad'
    },
    {
      step: 6,
      title: '6. Guest Receives Automated Confirmation',
      module: 'Receptionist AI',
      icon: Bot,
      description: 'Guest receives instant WhatsApp ping: "Your extra towels have been delivered. Let us know if you need anything else!"',
      highlight: 'Closed loop guest satisfaction with 100% digital audit trail.',
      buttonLabel: 'Check Guest Experience',
      tabHint: 'messages'
    },
    {
      step: 7,
      title: '7. Inbound Corporate RFP Arrives',
      module: 'Sales AI Agent',
      icon: TrendingUp,
      description: 'TechNova Global submits email inquiry for 180 delegates APAC Leadership Conference in October.',
      highlight: 'Inquiries after hours or during peak front desk rush are never missed.',
      buttonLabel: 'Simulate Sales Inbound',
      tabHint: 'sales'
    },
    {
      step: 8,
      title: '8. Sales AI Qualifies Lead & Score (94/100)',
      module: 'Sales Pipeline (CRM)',
      icon: Sparkles,
      description: 'Sales AI extracts 180 attendees, 80 room blocks, calculates ₹8.5 Lakhs package value, and generates a formatted corporate proposal.',
      highlight: 'Lead OPP-301 auto-assigned to Sales Director Sneha Patel.',
      buttonLabel: 'View Sales Pipeline & Proposal',
      tabHint: 'pipeline'
    },
    {
      step: 9,
      title: '9. Executive Dashboard Synchronized',
      module: 'Operations Analytics',
      icon: LayoutDashboard,
      description: 'Executive dashboard reflects ₹8.5L in new pipeline revenue, 94% request resolution rate, and 42-second average response time.',
      highlight: 'Complete 360° hotel operations lifecycle demonstrated!',
      buttonLabel: 'View Final Executive Dashboard',
      tabHint: 'dashboard'
    }
  ];

  const currentStepData = demoSteps.find(s => s.step === demoStep) || demoSteps[0];

  const handleNext = () => {
    if (demoStep < demoSteps.length) {
      executeDemoWorkflow(demoStep + 1);
    } else {
      setIsDemoTourOpen(false);
    }
  };

  const handlePrev = () => {
    if (demoStep > 1) {
      executeDemoWorkflow(demoStep - 1);
    }
  };

  const handleJumpToStep = (stepNumber: number) => {
    executeDemoWorkflow(stepNumber);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-12 flex items-center justify-center">
      <div 
        onClick={() => setIsDemoTourOpen(false)}
        className="fixed inset-0 bg-stone-950/70 backdrop-blur-xs transition-opacity" 
      />

      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-stone-200 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-stone-900 text-white flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#B8853A]/20 text-[#CC9A4C] border border-[#B8853A]/30 flex items-center justify-center">
              <PlayCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Interactive 3–5 Min Operations Demo</h3>
              <p className="text-xs text-stone-400">Step-by-step end-to-end hotel AI lifecycle tour</p>
            </div>
          </div>
          <button
            onClick={() => setIsDemoTourOpen(false)}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="px-6 py-3 bg-stone-50 border-b border-stone-200 flex items-center justify-between gap-1">
          {demoSteps.map(s => (
            <button
              key={s.step}
              onClick={() => handleJumpToStep(s.step)}
              className={`flex-1 h-2 rounded-full transition-all ${
                s.step === demoStep 
                  ? 'bg-[#9C6F2F] ring-2 ring-[#9C6F2F]/30' 
                  : s.step < demoStep 
                  ? 'bg-[#CC9A4C]' 
                  : 'bg-stone-200'
              }`}
              title={`Step ${s.step}: ${s.title}`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#7D5825] bg-[#FAF6EC] border border-[#E6CD9C] px-2.5 py-1 rounded-full">
              {currentStepData.module}
            </span>
            <span className="text-xs font-mono font-bold text-stone-400">
              Step {demoStep} of {demoSteps.length}
            </span>
          </div>

          <div>
            <h2 className="text-lg font-bold text-stone-900 tracking-tight">
              {currentStepData.title}
            </h2>
            <p className="text-sm text-stone-600 mt-2 leading-relaxed">
              {currentStepData.description}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#FAF6EC]/50 border border-[#E6CD9C]/80 text-xs text-stone-800 space-y-1">
            <span className="font-bold text-[#5E421B] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#9C6F2F]" />
              Key Platform Innovation:
            </span>
            <p className="text-stone-600 leading-relaxed pl-5">
              {currentStepData.highlight}
            </p>
          </div>

          {/* Action Button for Current Step */}
          <div className="pt-2">
            <button
              onClick={() => {
                executeDemoWorkflow(demoStep);
                handleNext();
              }}
              className="w-full py-3 bg-[#9C6F2F] hover:bg-[#7D5825] text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all"
            >
              <span>{currentStepData.buttonLabel}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Footer Controls */}
        <div className="px-6 py-3.5 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-xs font-semibold">
          <button
            onClick={handlePrev}
            disabled={demoStep === 1}
            className="flex items-center gap-1 text-stone-600 hover:text-stone-900 disabled:opacity-40 disabled:hover:text-stone-600 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous Step</span>
          </button>

          <button
            onClick={() => {
              executeDemoWorkflow(1);
            }}
            className="text-stone-500 hover:text-stone-800"
          >
            Restart Flow
          </button>

          <button
            onClick={handleNext}
            className="flex items-center gap-1 text-[#7D5825] hover:text-[#402D13] transition-colors"
          >
            <span>{demoStep === demoSteps.length ? 'Finish Demo' : 'Next Step'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
