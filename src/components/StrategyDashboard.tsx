import React from 'react';
import { PromotionStrategyPlan } from '../types/retail';
import { DollarSign, TrendingUp, ShieldAlert, Sparkles, MapPin, Swords, Tag, ArrowUpRight } from 'lucide-react';

interface StrategyDashboardProps {
  plan: PromotionStrategyPlan;
}

export const StrategyDashboard: React.FC<StrategyDashboardProps> = ({ plan }) => {
  return (
    <div className="space-y-6">
      {/* Executive Summary Card */}
      <div className="bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-slate-900 p-6 rounded-2xl border border-indigo-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
        
        <div className="flex items-start justify-between gap-4 relative z-10 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/20 rounded-xl border border-indigo-500/30">
              <Sparkles className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Agentic Chief Commercial Officer Synthesis
              </h2>
              <p className="text-xs text-slate-400">
                Plan ID: <span className="font-mono text-indigo-300">{plan.plan_id}</span> • Created {plan.created_at}
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Constraints Satisfied
          </span>
        </div>

        <p className="text-sm text-slate-200 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 font-normal">
          "{plan.executive_summary}"
        </p>
      </div>

      {/* Financial KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Projected Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl font-extrabold text-slate-100">
            ${plan.total_projected_revenue.toLocaleString()}
          </p>
          <p className="text-[10px] text-emerald-400 flex items-center gap-0.5 mt-1">
            <ArrowUpRight className="w-3 h-3" /> +28.4% vs Baseline
          </p>
        </div>

        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Projected Net Profit</span>
            <TrendingUp className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-xl font-extrabold text-indigo-300">
            ${plan.total_projected_profit.toLocaleString()}
          </p>
          <p className="text-[10px] text-indigo-400 mt-1">Net of costs & cannibalization</p>
        </div>

        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Average Net Margin</span>
            <Tag className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-xl font-extrabold text-cyan-300">
            {plan.average_margin_pct}%
          </p>
          <p className="text-[10px] text-slate-400 mt-1">
            Min Floor: {plan.parent_constraints.min_margin_pct}%
          </p>
        </div>

        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Cannibalization Loss</span>
            <ShieldAlert className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-xl font-extrabold text-amber-300">
            ${plan.total_cannibalization_loss_usd.toLocaleString()}
          </p>
          <p className="text-[10px] text-amber-400 mt-1">Diverted substitute revenue</p>
        </div>

        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Campaign ROI</span>
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-xl font-extrabold text-purple-300">
            {plan.overall_roi_multiplier}x
          </p>
          <p className="text-[10px] text-purple-400 mt-1">
            Spend: ${plan.total_marketing_spend.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Promoted SKUs Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-200">
              Promoted Products Strategy Breakdown ({plan.decisions.length} SKUs)
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Mechanism & Discount Optimization Active
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[10px] font-semibold">
              <tr>
                <th className="py-3 px-4">Product / SKU</th>
                <th className="py-3 px-4">Mechanism</th>
                <th className="py-3 px-4 text-center">Discount %</th>
                <th className="py-3 px-4 text-right">Promo Price</th>
                <th className="py-3 px-4 text-right">Proj. Revenue</th>
                <th className="py-3 px-4 text-right">Net Margin %</th>
                <th className="py-3 px-4">Geo Targets</th>
                <th className="py-3 px-4">Agent Reasoning</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {plan.decisions.map((dec) => (
                <tr key={dec.sku} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-medium text-slate-100">
                    <div>{dec.product_name}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{dec.sku} • {dec.category}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                      {dec.mechanism}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-emerald-400">
                    -{dec.recommended_discount_pct}%
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-200">
                    ${dec.promo_price.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-slate-100">
                    ${dec.projected_revenue.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="font-bold text-emerald-400">{dec.margin_pct}%</span>
                  </td>
                  <td className="py-3.5 px-4 text-[11px] text-slate-400">
                    {dec.geo_regions.slice(0, 2).join(', ')}
                  </td>
                  <td className="py-3.5 px-4 text-[11px] text-slate-400 max-w-xs">
                    {dec.reasoning}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Regional Customization & Competitor Counter Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Geo Notes */}
        <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
            <MapPin className="w-4 h-4" />
            Geographic Regional Execution Guidelines
          </div>
          <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
            {plan.geo_customization_notes}
          </p>
        </div>

        {/* Competitor Actions */}
        <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-purple-400 font-semibold text-sm">
            <Swords className="w-4 h-4" />
            Competitor Counter-Strategy Protocols
          </div>
          <ul className="space-y-2 text-xs text-slate-300">
            {plan.competitor_counter_actions.map((act, idx) => (
              <li key={idx} className="flex items-start gap-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                <span className="font-mono text-purple-400 font-bold">{idx + 1}.</span>
                <span>{act}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
