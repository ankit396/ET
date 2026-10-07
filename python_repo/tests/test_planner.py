"""
Pytest Automated Test Suite for Autonomous Promotion Planner AI.
Validates margin floor constraints, cannibalization engine, competitor matching, and simulation output.
"""

import pytest
from promo_planner.models import (
    InventoryItem,
    ParentConstraints,
    PromotionMechanism,
    CompetitorPrice
)
from promo_planner.cannibalization_engine import CannibalizationEngine
from promo_planner.competitor_tracker import CompetitorTracker
from promo_planner.optimization_engine import OptimizationEngine
from promo_planner.simulation_engine import SimulationEngine

@pytest.fixture
def sample_inventory():
    return [
        InventoryItem(
            sku="TEST-SKU-01",
            name="Test Headphones",
            category="Electronics",
            cost_price=100.0,
            list_price=200.0,
            current_stock=200,
            min_safety_stock=20,
            substitute_skus=["TEST-SKU-02"],
            complementary_skus=["TEST-SKU-03"],
            price_elasticity=-2.0
        ),
        InventoryItem(
            sku="TEST-SKU-02",
            name="Test Budget Earbuds",
            category="Electronics",
            cost_price=30.0,
            list_price=70.0,
            current_stock=100,
            min_safety_stock=10,
            substitute_skus=["TEST-SKU-01"],
            price_elasticity=-1.5
        ),
        InventoryItem(
            sku="TEST-SKU-03",
            name="Test Carrying Case",
            category="Electronics",
            cost_price=5.0,
            list_price=20.0,
            current_stock=300,
            min_safety_stock=30,
            price_elasticity=-1.0
        )
    ]

@pytest.fixture
def sample_constraints():
    return ParentConstraints(
        min_margin_pct=20.0,
        max_marketing_budget=10000.0,
        inventory_clearance_target_pct=30.0
    )

def test_cannibalization_loss_calculation(sample_inventory):
    engine = CannibalizationEngine(sample_inventory)
    loss, breakdown = engine.calculate_cannibalization_loss(
        promoted_sku="TEST-SKU-01",
        discount_pct=25.0,
        expected_promo_units=50
    )
    assert loss >= 0.0
    assert isinstance(breakdown, list)

def test_competitor_price_matching(sample_inventory):
    comp_prices = [
        CompetitorPrice(
            sku="TEST-SKU-01",
            competitor_name="RivalCorp",
            competitor_price=175.0,
            is_promoted=True
        )
    ]
    tracker = CompetitorTracker(comp_prices)
    recommended = tracker.RecommendPriceMatch(sample_inventory[0], min_margin_pct=20.0)
    assert recommended is not None
    # Min allowed price given cost 100 and min margin 20% is 100 / (1 - 0.2) = 125
    assert recommended >= 125.0

def test_margin_floor_constraint_enforcement(sample_inventory, sample_constraints):
    cannibal = CannibalizationEngine(sample_inventory)
    tracker = CompetitorTracker([])
    optimizer = OptimizationEngine(sample_inventory, sample_constraints, cannibal, tracker)

    decisions = optimizer.optimize_all_promotions()
    for dec in decisions:
        assert dec.margin_pct >= sample_constraints.min_margin_pct

def test_simulation_engine_execution(sample_inventory, sample_constraints):
    cannibal = CannibalizationEngine(sample_inventory)
    tracker = CompetitorTracker([])
    optimizer = OptimizationEngine(sample_inventory, sample_constraints, cannibal, tracker)
    decisions = optimizer.optimize_all_promotions()

    simulator = SimulationEngine(sample_inventory, decisions)
    result = simulator.run_simulation(days=7)

    assert result.promoted_revenue > 0
    assert len(result.daily_breakdown) > 0
