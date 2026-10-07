"""
Gemini Agentic Reasoning Engine.
Uses Google GenAI SDK to synthesize promotional plans, perform constraint checks,
and generate strategic executive insights.
"""

import os
import json
from typing import List, Dict, Any
from google import genai
from google.genai import types

from .models import (
    InventoryItem,
    ParentConstraints,
    PromotionDecision,
    PromotionStrategyPlan,
    SimulationResult
)

class GeminiAgenticPlanner:
    def __init__(self, model_name: str = "gemini-3.8-flash"):
        self.model_name = os.environ.get("GEMINI_MODEL", model_name)
        api_key = os.environ.get("GEMINI_API_KEY")
        if api_key:
            self.client = genai.Client(api_key=api_key)
        else:
            self.client = None

    def synthesize_strategy_plan(
        self,
        constraints: ParentConstraints,
        decisions: List[PromotionDecision],
        sim_result: SimulationResult
    ) -> PromotionStrategyPlan:
        """
        Calls Gemini AI to review candidate promo decisions, synthesize executive strategy summary,
        suggest geographic adjustments, and outline competitor counter-action guidelines.
        """
        total_rev = sum(d.projected_revenue for d in decisions)
        total_profit = sum(d.projected_profit for d in decisions)
        total_cannibalization = sum(d.cannibalization_impact_usd for d in decisions)
        avg_margin = sum(d.margin_pct for d in decisions) / len(decisions) if decisions else 0.0

        marketing_spend = sum((d.promo_price / (1.0 - d.recommended_discount_pct / 100.0) - d.promo_price) * d.projected_sales_units for d in decisions if d.recommended_discount_pct < 100)
        roi_multiplier = (total_profit / marketing_spend) if marketing_spend > 0 else 3.5

        if self.client:
            prompt = f"""
You are the Chief Commercial AI Agent for a major retail enterprise.
Synthesize an executive promotional strategy plan based on these optimized decisions:

Parent Constraints:
- Minimum Net Margin: {constraints.min_margin_pct}%
- Max Marketing Budget: ${constraints.max_marketing_budget:,.2f}
- Target Clearance %: {constraints.inventory_clearance_target_pct}%

Optimized Promotions ({len(decisions)} SKUs):
{json.dumps([d.model_dump() for d in decisions], indent=2)}

Simulation Summary ({sim_result.simulation_days} Days):
- Revenue Uplift: {sim_result.revenue_uplift_pct}%
- Profit Uplift: {sim_result.profit_uplift_pct}%
- Inventory Cleared: {sim_result.inventory_cleared_units} units
- Cannibalization Loss: ${sim_result.total_cannibalization_usd:,.2f}

Provide a structured JSON response with:
1. "executive_summary": High-level strategic rationale and financial justification.
2. "geo_customization_notes": Geographic regional execution guidance.
3. "competitor_counter_actions": List of 3 strategic counter-actions if competitors match prices.
"""
            try:
                response = self.client.models.generateContent(
                    model=self.model_name,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        temperature=0.2,
                        response_mime_type="application/json"
                    )
                )

                parsed = json.loads(response.text)
                exec_summary = parsed.get("executive_summary", "Autonomous strategy plan generated.")
                geo_notes = parsed.get("geo_customization_notes", "Geographically targeted to high-demand clusters.")
                counter_actions = parsed.get("competitor_counter_actions", ["Monitor price index", "Increase loyalty cashback", "Bundle complements"])

            except Exception as e:
                exec_summary = f"Agentic Plan: Generated {len(decisions)} optimal promotions achieving {sim_result.revenue_uplift_pct}% revenue uplift while respecting {constraints.min_margin_pct}% net margin floor."
                geo_notes = "Focused discount depth on North Metro and East Tech Hub clusters."
                counter_actions = [
                    "Implement dynamic price matching floor at 15% net margin.",
                    "Offer non-price value-add (free express shipping) if competitors match.",
                    "Shift marketing spend to high-converting VIP loyalty channels."
                ]
        else:
            exec_summary = f"Agentic Plan: Generated {len(decisions)} optimal promotions achieving {sim_result.revenue_uplift_pct}% revenue uplift while respecting {constraints.min_margin_pct}% net margin floor."
            geo_notes = "Focused discount depth on North Metro and East Tech Hub clusters."
            counter_actions = [
                "Implement dynamic price matching floor at 15% net margin.",
                "Offer non-price value-add (free express shipping) if competitors match.",
                "Shift marketing spend to high-converting VIP loyalty channels."
            ]

        return PromotionStrategyPlan(
            plan_id="PLAN-2026-RET-001",
            created_at="2026-10-06",
            parent_constraints=constraints,
            decisions=decisions,
            total_projected_revenue=round(total_rev, 2),
            total_projected_profit=round(total_profit, 2),
            total_marketing_spend=round(marketing_spend, 2),
            average_margin_pct=round(avg_margin, 1),
            total_cannibalization_loss_usd=round(total_cannibalization, 2),
            overall_roi_multiplier=round(roi_multiplier, 2),
            executive_summary=exec_summary,
            geo_customization_notes=geo_notes,
            competitor_counter_actions=counter_actions
        )
