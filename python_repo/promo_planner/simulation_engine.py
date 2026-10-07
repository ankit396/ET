"""
Pre-Launch Simulation Engine.
Simulates promotional performance over N days comparing Baseline vs. Promoted scenarios.
Accounts for stock depletion, competitor reactions, and daily demand variance.
"""

import random
from typing import List
from .models import (
    InventoryItem,
    PromotionDecision,
    DailySimState,
    SimulationResult
)

class SimulationEngine:
    def __init__(self, inventory: List[InventoryItem], decisions: List[PromotionDecision]):
        self.inventory_map = {item.sku: item for item in inventory}
        self.decisions = decisions

    def run_simulation(self, days: int = 14, seed: int = 42) -> SimulationResult:
        """
        Executes a day-by-day simulation across specified duration.
        Generates daily breakdown logs and aggregates financial uplifts.
        """
        random.seed(seed)
        daily_breakdown: List[DailySimState] = []

        baseline_total_rev = 0.0
        baseline_total_profit = 0.0
        promoted_total_rev = 0.0
        promoted_total_profit = 0.0
        total_cannibalization = 0.0
        total_units_cleared = 0

        # Track stock levels
        stock_track = {sku: item.current_stock for sku, item in self.inventory_map.items()}

        for day in range(1, days + 1):
            # Competitor price match reaction trigger on Day 5
            competitor_matches = (day >= 5)

            for dec in self.decisions:
                sku = dec.sku
                item = self.inventory_map.get(sku)
                if not item:
                    continue

                curr_stock = stock_track[sku]
                if curr_stock <= item.min_safety_stock:
                    continue  # Stockout reached

                # Baseline daily sales (no promo)
                base_daily = max(2, int(item.current_stock * 0.015))
                baseline_units = min(curr_stock, base_daily)
                baseline_rev = baseline_units * item.list_price
                baseline_prof = baseline_units * (item.list_price - item.cost_price)

                baseline_total_rev += baseline_rev
                baseline_total_profit += baseline_prof

                # Promoted daily sales with stochastic variation (+/- 10%)
                daily_target_units = max(1, int(dec.projected_sales_units / max(1, dec.duration_days)))
                random_factor = random.uniform(0.9, 1.1)

                # Competitor match dampening
                if competitor_matches:
                    random_factor *= 0.85

                actual_units = min(curr_stock, max(1, int(daily_target_units * random_factor)))
                stock_track[sku] -= actual_units
                total_units_cleared += actual_units

                daily_rev = actual_units * dec.promo_price
                daily_prof = actual_units * (dec.promo_price - item.cost_price)

                promoted_total_rev += daily_rev
                promoted_total_profit += daily_prof
                total_cannibalization += (dec.cannibalization_impact_usd / dec.duration_days)

                daily_breakdown.append(DailySimState(
                    day=day,
                    sku=sku,
                    units_sold=actual_units,
                    revenue=round(daily_rev, 2),
                    profit=round(daily_prof, 2),
                    remaining_stock=stock_track[sku],
                    competitor_price_match=competitor_matches
                ))

        rev_uplift_pct = ((promoted_total_rev - baseline_total_rev) / baseline_total_rev) * 100 if baseline_total_rev > 0 else 0
        profit_uplift_pct = ((promoted_total_profit - baseline_total_profit) / baseline_total_profit) * 100 if baseline_total_profit > 0 else 0

        return SimulationResult(
            scenario_name=f"Autonomous Promo Plan Pre-Launch ({days} Days)",
            simulation_days=days,
            baseline_revenue=round(baseline_total_rev, 2),
            promoted_revenue=round(promoted_total_rev, 2),
            revenue_uplift_pct=round(rev_uplift_pct, 1),
            baseline_profit=round(baseline_total_profit, 2),
            promoted_profit=round(promoted_total_profit, 2),
            profit_uplift_pct=round(profit_uplift_pct, 1),
            inventory_cleared_units=total_units_cleared,
            total_cannibalization_usd=round(total_cannibalization, 2),
            daily_breakdown=daily_breakdown
        )
