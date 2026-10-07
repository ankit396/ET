"""
Autonomous Retail Promotion Planner - CLI Main Entry Point.
Usage:
    python -m promo_planner.main --config examples/sample_retail_data.json --simulate --days 14
"""

import sys
import json
import argparse
from typing import Dict, Any

from .models import (
    InventoryItem,
    CompetitorPrice,
    HolidayEvent,
    CustomerSegment,
    ParentConstraints
)
from .cannibalization_engine import CannibalizationEngine
from .competitor_tracker import CompetitorTracker
from .geo_adapter import GeoAdapter
from .optimization_engine import OptimizationEngine
from .simulation_engine import SimulationEngine
from .gemini_agent import GeminiAgenticPlanner

def load_retail_config(filepath: str) -> Dict[str, Any]:
    with open(filepath, "r", encoding="utf-8") as f:
        return json.load(f)

def run_planner_pipeline(data: Dict[str, Any], simulate_days: int = 14) -> Dict[str, Any]:
    # 1. Ingest Data
    inventory = [InventoryItem(**item) for item in data.get("inventory", [])]
    competitor_prices = [CompetitorPrice(**cp) for cp in data.get("competitor_prices", [])]
    holidays = [HolidayEvent(**h) for h in data.get("holidays", [])]
    constraints = ParentConstraints(**data.get("constraints", {}))

    # 2. Initialize Core Engines
    cannibalization_engine = CannibalizationEngine(inventory)
    competitor_tracker = CompetitorTracker(competitor_prices)
    geo_adapter = GeoAdapter(holidays)

    # 3. Optimize Promotion Strategy
    optimizer = OptimizationEngine(
        inventory=inventory,
        constraints=constraints,
        cannibalization_engine=cannibalization_engine,
        competitor_tracker=competitor_tracker
    )
    decisions = optimizer.optimize_all_promotions()

    # 4. Run Pre-Launch Simulation
    simulator = SimulationEngine(inventory, decisions)
    sim_result = simulator.run_simulation(days=simulate_days)

    # 5. Agentic Plan Synthesis
    gemini_agent = GeminiAgenticPlanner()
    strategy_plan = gemini_agent.synthesize_strategy_plan(constraints, decisions, sim_result)

    return {
        "strategy_plan": strategy_plan.model_dump(),
        "simulation_result": sim_result.model_dump()
    }

def cli_main():
    parser = argparse.ArgumentParser(description="Autonomous Promotion Planner AI (ET AI Hackathon Problem 3)")
    parser.add_argument("--config", type=str, required=True, help="Path to input retail dataset (JSON)")
    parser.add_argument("--simulate", action="store_true", help="Run multi-day pre-launch scenario simulation")
    parser.add_argument("--days", type=int, default=14, help="Simulation duration in days")
    parser.add_argument("--output", type=str, default=None, help="Save JSON output result to file")

    args = parser.parse_args()

    print(f"🚀 Initializing Autonomous Promotion Planner AI...")
    print(f"📂 Loading retail dataset: {args.config}")
    data = load_retail_config(args.config)

    result = run_planner_pipeline(data, simulate_days=args.days)
    plan = result["strategy_plan"]

    print("\n" + "="*60)
    print("🎯 AUTONOMOUS PROMOTION STRATEGY RESULT")
    print("="*60)
    print(f"Plan ID: {plan['plan_id']}")
    print(f"Executive Summary: {plan['executive_summary']}")
    print(f"Promoted SKUs Count: {len(plan['decisions'])}")
    print(f"Projected Revenue: ${plan['total_projected_revenue']:,.2f}")
    print(f"Projected Profit: ${plan['total_projected_profit']:,.2f}")
    print(f"Marketing Spend: ${plan['total_marketing_spend']:,.2f}")
    print(f"Average Net Margin: {plan['average_margin_pct']}%")
    print(f"Cannibalization Loss: ${plan['total_cannibalization_loss_usd']:,.2f}")
    print(f"ROI Multiplier: {plan['overall_roi_multiplier']}x")
    print("="*60)

    if args.output:
        with open(args.output, "w", encoding="utf-8") as f:
            json.dump(result, f, indent=2)
        print(f"✅ Full strategy & simulation saved to: {args.output}")

if __name__ == "__main__":
    cli_main()
