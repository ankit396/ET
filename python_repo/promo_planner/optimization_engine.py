"""
Mathematical Constraint Optimization Engine.
Optimizes discount percentages and promo mechanisms subject to Parent Company constraints.
"""

from typing import List, Dict, Tuple
from .models import (
    InventoryItem,
    ParentConstraints,
    PromotionMechanism,
    PromotionDecision,
)
from .cannibalization_engine import CannibalizationEngine
from .competitor_tracker import CompetitorTracker

class OptimizationEngine:
    def __init__(
        self,
        inventory: List[InventoryItem],
        constraints: ParentConstraints,
        cannibalization_engine: CannibalizationEngine,
        competitor_tracker: CompetitorTracker,
    ):
        self.inventory = inventory
        self.constraints = constraints
        self.cannibalization = cannibalization_engine
        self.competitor = competitor_tracker

    def evaluate_sku_promotion(
        self,
        item: InventoryItem,
        discount_pct: float,
        mechanism: PromotionMechanism,
        duration_days: int = 7
    ) -> PromotionDecision:
        """
        Evaluates a single promotion candidate scenario for a given SKU.
        Calculates projected volume, revenue, profit, cannibalization loss, and margin floor compliance.
        """
        promo_price = item.list_price * (1.0 - discount_pct / 100.0)

        # Base daily velocity
        base_daily_units = max(5, int(item.current_stock * 0.02))

        # Elasticity effect Q = Q0 * (P / P0) ^ elasticity
        price_ratio = max(0.2, promo_price / item.list_price)
        elasticity_multiplier = (price_ratio) ** item.price_elasticity

        # Mechanism specific demand boost
        mechanism_boost = 1.0
        if mechanism == PromotionMechanism.BUY_ONE_GET_ONE:
            mechanism_boost = 1.4
        elif mechanism == PromotionMechanism.FLASH_SALE:
            mechanism_boost = 1.35
        elif mechanism == PromotionMechanism.TIERED_BUNDLE:
            mechanism_boost = 1.25

        projected_units = int(base_daily_units * duration_days * elasticity_multiplier * mechanism_boost)
        
        # Capped by current available inventory minus safety buffer
        max_sellable_stock = max(0, item.current_stock - item.min_safety_stock)
        projected_units = min(projected_units, max_sellable_stock)

        # Revenue & Profit calculation
        projected_revenue = round(projected_units * promo_price, 2)
        unit_cost = item.cost_price
        projected_profit = round(projected_units * (promo_price - unit_cost), 2)

        # Margin % = (Promo Price - Cost) / Promo Price * 100
        margin_pct = round(((promo_price - unit_cost) / promo_price) * 100.0, 1) if promo_price > 0 else 0.0

        # Cannibalization Loss & Complementary Boost
        cannibal_loss, _ = self.cannibalization.calculate_cannibalization_loss(item.sku, discount_pct, projected_units)
        comp_boost, _ = self.cannibalization.calculate_complementary_boost(item.sku, projected_units)

        net_profit = round(projected_profit - cannibal_loss + comp_boost, 2)

        # Stockout Risk Assessment
        remaining_stock_pct = ((item.current_stock - projected_units) / item.current_stock) * 100 if item.current_stock > 0 else 0
        if remaining_stock_pct < 15:
            stockout_risk = "High"
        elif remaining_stock_pct < 35:
            stockout_risk = "Medium"
        else:
            stockout_risk = "Low"

        # Reasoning synthesis
        reasoning = (
            f"Optimized {mechanism.value} with {discount_pct}% discount. "
            f"Generates ${projected_revenue:,.0f} revenue with {margin_pct}% net margin "
            f"(Min Constraint: {self.constraints.min_margin_pct}%). "
            f"Cannibalization loss estimated at ${cannibal_loss:,.0f}, offset by ${comp_boost:,.0f} in complementary sales."
        )

        return PromotionDecision(
            sku=item.sku,
            product_name=item.name,
            category=item.category,
            mechanism=mechanism,
            recommended_discount_pct=discount_pct,
            promo_price=round(promo_price, 2),
            duration_days=duration_days,
            target_segments=["Bargain Hunters", "Loyalty VIPs"] if discount_pct > 20 else ["Premium Buyers"],
            geo_regions=["North Metro", "East Tech Hub"],
            projected_sales_units=projected_units,
            projected_revenue=projected_revenue,
            projected_profit=net_profit,
            margin_pct=margin_pct,
            cannibalization_impact_usd=cannibal_loss,
            complementary_revenue_boost_usd=comp_boost,
            stockout_risk_level=stockout_risk,
            reasoning=reasoning
        )

    def optimize_all_promotions(self) -> List[PromotionDecision]:
        """
        Scans all SKUs and tests discount points [10%, 15%, 20%, 25%, 30%, 35%, 40%] across mechanisms.
        Selects the optimal strategy that maximizes total profit subject to margin floors & marketing budget caps.
        """
        recommended_decisions = []
        accumulated_marketing_cost = 0.0

        for item in self.inventory:
            best_candidate: PromotionDecision = None
            highest_score = -999999.0

            # Test discount points
            candidate_discounts = [10.0, 15.0, 20.0, 25.0, 30.0, 35.0, 40.0]
            for disc in candidate_discounts:
                for mechanism in [
                    PromotionMechanism.PERCENTAGE_OFF,
                    PromotionMechanism.BUY_ONE_GET_ONE,
                    PromotionMechanism.TIERED_BUNDLE,
                    PromotionMechanism.FLASH_SALE,
                ]:
                    decision = self.evaluate_sku_promotion(item, disc, mechanism)

                    # Hard Constraint 1: Minimum Margin Floor
                    if decision.margin_pct < self.constraints.min_margin_pct:
                        continue

                    # Marketing cost = discount value * projected volume
                    marketing_cost = (item.list_price - decision.promo_price) * decision.projected_sales_units
                    if accumulated_marketing_cost + marketing_cost > self.constraints.max_marketing_budget:
                        continue

                    # Score = Net Profit + Inventory Clearance Weight - Cannibalization Penalty
                    clearance_bonus = (decision.projected_sales_units / item.current_stock) * 1000.0
                    score = decision.projected_profit + clearance_bonus - (decision.cannibalization_impact_usd * 1.5)

                    if score > highest_score:
                        highest_score = score
                        best_candidate = decision

            if best_candidate and best_candidate.projected_profit > 0:
                mkt_cost = (item.list_price - best_candidate.promo_price) * best_candidate.projected_sales_units
                accumulated_marketing_cost += mkt_cost
                recommended_decisions.append(best_candidate)

        return recommended_decisions
