import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ConstraintsPanel } from './components/ConstraintsPanel';
import { StrategyDashboard } from './components/StrategyDashboard';
import { SimulationVisualizer } from './components/SimulationVisualizer';
import { FeatureMatrix } from './components/FeatureMatrix';
import { PythonRepoBrowser } from './components/PythonRepoBrowser';
import { EvaluationMatrix } from './components/EvaluationMatrix';
import {
  defaultConstraints,
  defaultInventory,
  defaultCompetitorPrices,
  defaultHolidays,
  defaultCustomerSegments,
} from './data/defaultRetailData';
import { ParentConstraints, PromotionStrategyPlan, SimulationResult, RepoFile } from './types/retail';

export default function App() {
  const [activeTab, setActiveTab] = useState<'planner' | 'matrix' | 'code' | 'evaluation'>('planner');
  const [constraints, setConstraints] = useState<ParentConstraints>(defaultConstraints);
  const [plan, setPlan] = useState<PromotionStrategyPlan | null>(null);
  const [simResult, setSimResult] = useState<SimulationResult | null>(null);
  const [repoFiles, setRepoFiles] = useState<RepoFile[]>([]);
  const [isPlanning, setIsPlanning] = useState<boolean>(false);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Fetch Python repo files
  const fetchRepoFiles = async () => {
    try {
      const res = await fetch('/api/python-repo');
      const data = await res.json();
      if (data.files) {
        setRepoFiles(data.files);
      }
    } catch (err) {
      console.error('Failed to load python repo files:', err);
    }
  };

  // Run Agentic Planner API
  const handleRunPlanner = async (updatedConstraints = constraints) => {
    setIsPlanning(true);
    try {
      const res = await fetch('/api/plan-promotions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inventory: defaultInventory,
          competitor_prices: defaultCompetitorPrices,
          holidays: defaultHolidays,
          constraints: updatedConstraints,
        }),
      });
      const data = await res.json();
      if (data.plan) {
        setPlan(data.plan);
        // Automatically trigger simulation
        handleRunSimulation(14, data.plan.decisions);
      }
    } catch (err) {
      console.error('Failed to plan promotions:', err);
    } finally {
      setIsPlanning(false);
    }
  };

  // Run Pre-Launch Simulation API
  const handleRunSimulation = async (days = 14, decisions = plan?.decisions) => {
    setIsSimulating(true);
    try {
      const res = await fetch('/api/simulate-promotion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decisions, days }),
      });
      const data = await res.json();
      if (data.scenario_name) {
        setSimResult(data);
      }
    } catch (err) {
      console.error('Failed to run simulation:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  useEffect(() => {
    fetchRepoFiles();
    handleRunPlanner(defaultConstraints);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onRunPlanner={() => handleRunPlanner(constraints)}
        isPlanning={isPlanning}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {activeTab === 'planner' && (
          <div className="space-y-8">
            {/* Constraints Control Panel */}
            <ConstraintsPanel
              constraints={constraints}
              onChangeConstraints={(newC) => {
                setConstraints(newC);
                handleRunPlanner(newC);
              }}
              onReset={() => {
                setConstraints(defaultConstraints);
                handleRunPlanner(defaultConstraints);
              }}
            />

            {/* Strategy Dashboard Output */}
            {plan ? (
              <StrategyDashboard plan={plan} />
            ) : (
              <div className="p-12 text-center bg-slate-900 rounded-2xl border border-slate-800 text-slate-400">
                Optimizing promotion plan...
              </div>
            )}

            {/* Pre-launch Simulation Visualizer */}
            <SimulationVisualizer
              simResult={simResult}
              onRunSimulation={(d) => handleRunSimulation(d, plan?.decisions)}
              isSimulating={isSimulating}
            />
          </div>
        )}

        {activeTab === 'matrix' && <FeatureMatrix />}

        {activeTab === 'code' && <PythonRepoBrowser files={repoFiles} />}

        {activeTab === 'evaluation' && <EvaluationMatrix />}
      </main>
    </div>
  );
}
