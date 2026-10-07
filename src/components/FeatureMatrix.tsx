import React from 'react';
import { CheckCircle2, Shield, Layers, Zap, Award, Target, Sparkles } from 'lucide-react';

export const FeatureMatrix: React.FC = () => {
  const featuresList = [
    {
      id: 1,
      title: '1. Select Which Products to Promote',
      description: 'Algorithmic ranking based on stock age, holding cost, margin headroom, and price elasticity.',
      status: 'Implemented',
      level: 'F1/F2/F3',
    },
    {
      id: 2,
      title: '2. Determine Promotion Mechanism',
      description: 'Dynamic selection among Percentage Off, BOGO, Tiered Bundle, Flash Sale, and Loyalty Exclusive.',
      status: 'Implemented',
      level: 'F1/F2/F3',
    },
    {
      id: 3,
      title: '3. Optimize Discount & Strategies',
      description: 'Non-linear price elasticity curve optimization targeting maximum profit subject to net margin floors.',
      status: 'Implemented',
      level: 'F1/F2/F3',
    },
    {
      id: 4,
      title: '4. Understand Cannibalization',
      description: 'Cross-elasticity matrix calculating diverted sales from substitute full-margin SKUs.',
      status: 'Implemented',
      level: 'F2/F3',
    },
    {
      id: 5,
      title: '5. Understand Product Relationships',
      description: 'Complementary affinity graph calculating accessory cross-sell revenue boosts (e.g. Headphones + Case).',
      status: 'Implemented',
      level: 'F2/F3',
    },
    {
      id: 6,
      title: '6. Consider Inventory Constraints',
      description: 'Safety stock buffer enforcement and inventory clearance acceleration targets.',
      status: 'Implemented',
      level: 'F2/F3',
    },
    {
      id: 7,
      title: '7. Geographically Customize Promotions',
      description: 'Store location clustering and regional demand multipliers aligned with local holiday calendars.',
      status: 'Implemented',
      level: 'F3',
    },
    {
      id: 8,
      title: '8. Competitor Awareness',
      description: 'Competitor price benchmarking, undercut ratio analysis, and dynamic floor matching safeguards.',
      status: 'Implemented',
      level: 'F3',
    },
    {
      id: 9,
      title: '9. Simulate Promotion Before Launching',
      description: 'Multi-day Monte Carlo scenario engine projecting revenue uplift, stock depletion, and competitor reactions.',
      status: 'Implemented',
      level: 'F3',
    },
  ];

  return (
    <div className="space-y-6">
      {/* 3x3 Blocker Grid Header */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-slate-100">
              3x3 Blocker Grid Position Self-Assessment
            </h2>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-md">
            Claimed Position: F3 / D3
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Grid Visualizer */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <p className="text-xs font-semibold text-slate-400 mb-3 text-center">
              Solution Features (F1 - F3) vs Solution Depth (D1 - D3)
            </p>
            <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
              {['D1', 'D2', 'D3'].map((depth) =>
                ['F1', 'F2', 'F3'].map((feat) => {
                  const isClaimed = feat === 'F3' && depth === 'D3';
                  return (
                    <div
                      key={`${feat}-${depth}`}
                      className={`p-3 rounded-lg border transition-all ${
                        isClaimed
                          ? 'bg-gradient-to-tr from-indigo-600 to-purple-600 border-indigo-400 text-white font-bold shadow-lg ring-2 ring-indigo-400/50'
                          : 'bg-slate-900 border-slate-800 text-slate-500'
                      }`}
                    >
                      <div className="text-[10px] font-sans opacity-75">{depth}</div>
                      <div>{feat}</div>
                      {isClaimed && <div className="text-[9px] mt-1 font-sans text-emerald-300 font-bold">🎯 OUR POSITION</div>}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Justification summary */}
          <div className="space-y-2 text-xs text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800">
            <p className="font-semibold text-indigo-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> Justification for F3 / D3 Target:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-slate-400">
              <li>
                <strong className="text-slate-200">F3 (All 9 Features Covered):</strong> Complete coverage of product selection, mechanisms, discount optimization, cannibalization, complementary cross-sales, inventory buffers, regional customization, competitor matching, and pre-launch simulation.
              </li>
              <li>
                <strong className="text-slate-200">D3 (Heterogeneous Multimodal Depth & High Reliability):</strong> Ingests complex multi-region inventory, competitor pricing feeds, customer segment profiles, and calendar events with deterministic constraint enforcement and agentic AI reasoning.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 9 Features Checklist */}
      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-100">
              Problem Statement 3: Core Desirable Features Coverage (9/9)
            </h3>
          </div>
          <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            100% Feature Complete
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {featuresList.map((feat) => (
            <div
              key={feat.id}
              className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-2 hover:border-indigo-500/40 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-bold text-slate-200">{feat.title}</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">{feat.description}</p>
              <div className="pt-2 flex items-center justify-between border-t border-slate-900 text-[10px]">
                <span className="text-indigo-400 font-mono font-semibold">{feat.level} Target</span>
                <span className="text-emerald-400 font-semibold">{feat.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
