import React from 'react';
import { ParentConstraints } from '../types/retail';
import { Sliders, DollarSign, Percent, TrendingDown, RefreshCw } from 'lucide-react';

interface ConstraintsPanelProps {
  constraints: ParentConstraints;
  onChangeConstraints: (updated: ParentConstraints) => void;
  onReset: () => void;
}

export const ConstraintsPanel: React.FC<ConstraintsPanelProps> = ({
  constraints,
  onChangeConstraints,
  onReset,
}) => {
  return (
    <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-xl space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-indigo-400" />
          <h2 className="text-sm font-semibold text-slate-200">Parent Company Constraints</h2>
        </div>
        <button
          onClick={onReset}
          className="text-xs text-slate-400 hover:text-indigo-400 flex items-center gap-1 transition-colors"
        >
          <RefreshCw className="w-3 h-3" />
          Reset Defaults
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Min Margin Floor */}
        <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <Percent className="w-3.5 h-3.5 text-emerald-400" />
              Min Net Margin Floor
            </span>
            <span className="text-xs font-bold text-emerald-400">{constraints.min_margin_pct}%</span>
          </div>
          <input
            type="range"
            min="5"
            max="40"
            step="1"
            value={constraints.min_margin_pct}
            onChange={(e) =>
              onChangeConstraints({ ...constraints, min_margin_pct: Number(e.target.value) })
            }
            className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
          <p className="text-[10px] text-slate-500">Hard margin safeguard for all promoted SKUs</p>
        </div>

        {/* Max Marketing Budget */}
        <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-purple-400" />
              Max Promo Budget
            </span>
            <span className="text-xs font-bold text-purple-400">
              ${constraints.max_marketing_budget.toLocaleString()}
            </span>
          </div>
          <input
            type="range"
            min="10000"
            max="150000"
            step="5000"
            value={constraints.max_marketing_budget}
            onChange={(e) =>
              onChangeConstraints({ ...constraints, max_marketing_budget: Number(e.target.value) })
            }
            className="w-full accent-purple-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
          <p className="text-[10px] text-slate-500">Maximum expenditure cap across campaign</p>
        </div>

        {/* Inventory Clearance Goal */}
        <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <TrendingDown className="w-3.5 h-3.5 text-cyan-400" />
              Clearance Target
            </span>
            <span className="text-xs font-bold text-cyan-400">
              {constraints.inventory_clearance_target_pct}%
            </span>
          </div>
          <input
            type="range"
            min="10"
            max="70"
            step="5"
            value={constraints.inventory_clearance_target_pct}
            onChange={(e) =>
              onChangeConstraints({
                ...constraints,
                inventory_clearance_target_pct: Number(e.target.value),
              })
            }
            className="w-full accent-cyan-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
          <p className="text-[10px] text-slate-500">Stock reduction goal for overstock items</p>
        </div>

        {/* Max Cannibalization Threshold */}
        <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <Percent className="w-3.5 h-3.5 text-amber-400" />
              Max Cannibalization
            </span>
            <span className="text-xs font-bold text-amber-400">
              {constraints.max_cannibalization_threshold_pct}%
            </span>
          </div>
          <input
            type="range"
            min="2"
            max="25"
            step="1"
            value={constraints.max_cannibalization_threshold_pct}
            onChange={(e) =>
              onChangeConstraints({
                ...constraints,
                max_cannibalization_threshold_pct: Number(e.target.value),
              })
            }
            className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
          <p className="text-[10px] text-slate-500">Cap on diverted full-margin sales</p>
        </div>
      </div>
    </div>
  );
};
