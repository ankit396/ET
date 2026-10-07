import React, { useState } from 'react';
import { SimulationResult } from '../types/retail';
import { Play, TrendingUp, DollarSign, Box, ShieldAlert } from 'lucide-react';

interface SimulationVisualizerProps {
  simResult: SimulationResult | null;
  onRunSimulation: (days: number) => void;
  isSimulating: boolean;
}

export const SimulationVisualizer: React.FC<SimulationVisualizerProps> = ({
  simResult,
  onRunSimulation,
  isSimulating,
}) => {
  const [days, setDays] = useState(14);

  return (
    <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-6">
      {/* Simulation Control Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Play className="w-4 h-4 text-emerald-400 fill-emerald-400" />
            Pre-Launch Scenario Simulator (Feature #9)
          </h3>
          <p className="text-xs text-slate-400">
            Simulates daily demand, stock depletion, cannibalization, and competitor price matches
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
            <span>Duration:</span>
            {[7, 14, 30].map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  days === d ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {d} Days
              </button>
            ))}
          </div>

          <button
            onClick={() => onRunSimulation(days)}
            disabled={isSimulating}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isSimulating ? 'Running Monte Carlo...' : 'Run Simulation'}
          </button>
        </div>
      </div>

      {/* Simulation Results Grid */}
      {simResult && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400">Promoted Revenue</span>
              <p className="text-xl font-bold text-emerald-400 mt-1">
                ${simResult.promoted_revenue.toLocaleString()}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Baseline: ${simResult.baseline_revenue.toLocaleString()}
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400">Revenue Uplift</span>
              <p className="text-xl font-bold text-indigo-400 mt-1">
                +{simResult.revenue_uplift_pct}%
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">Over non-promoted baseline</p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400">Inventory Cleared</span>
              <p className="text-xl font-bold text-cyan-400 mt-1">
                {simResult.inventory_cleared_units} units
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">High velocity clearance</p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400">Cannibalization Loss</span>
              <p className="text-xl font-bold text-amber-400 mt-1">
                ${simResult.total_cannibalization_usd.toLocaleString()}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">Substitutes diverted</p>
            </div>
          </div>

          {/* Daily Performance Log Visualizer */}
          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Daily Monte Carlo Trajectory Log (First 7 Days Sample)
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="text-slate-500 border-b border-slate-800 text-[10px] uppercase">
                  <tr>
                    <th className="py-2 px-3">Day</th>
                    <th className="py-2 px-3">SKU</th>
                    <th className="py-2 px-3 text-right">Units Sold</th>
                    <th className="py-2 px-3 text-right">Daily Revenue</th>
                    <th className="py-2 px-3 text-right">Remaining Stock</th>
                    <th className="py-2 px-3 text-center">Competitor Match</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {simResult.daily_breakdown.slice(0, 10).map((log, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/60">
                      <td className="py-2 px-3 font-mono text-indigo-400">Day {log.day}</td>
                      <td className="py-2 px-3 font-mono text-slate-300">{log.sku}</td>
                      <td className="py-2 px-3 text-right font-bold text-slate-200">{log.units_sold}</td>
                      <td className="py-2 px-3 text-right font-mono text-emerald-400">${log.revenue}</td>
                      <td className="py-2 px-3 text-right text-slate-400">{log.remaining_stock}</td>
                      <td className="py-2 px-3 text-center">
                        {log.competitor_price_match ? (
                          <span className="px-2 py-0.5 text-[10px] rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            Triggered
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-600">Standard</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
