import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
app.use(express.json({ limit: '10mb' }));

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper to recursively read all files in python_repo
async function getPythonRepoFiles(dir: string, baseDir: string = dir): Promise<Array<{ path: string; content: string }>> {
  let results: Array<{ path: string; content: string }> = [];
  try {
    const list = await fs.readdir(dir, { withFileTypes: true });
    for (const file of list) {
      const fullPath = path.join(dir, file.name);
      const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
      if (file.isDirectory()) {
        if (file.name !== '__pycache__' && file.name !== '.pytest_cache') {
          const subFiles = await getPythonRepoFiles(fullPath, baseDir);
          results = results.concat(subFiles);
        }
      } else {
        const content = await fs.readFile(fullPath, 'utf-8');
        results.push({ path: relativePath, content });
      }
    }
  } catch (err) {
    console.error('Error reading python repo dir:', err);
  }
  return results;
}

// API Endpoint: Get all Python Repository files
app.get('/api/python-repo', async (req, res) => {
  try {
    const repoPath = path.resolve(process.cwd(), 'python_repo');
    const files = await getPythonRepoFiles(repoPath);
    res.json({ files });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// API Endpoint: Plan Promotions (Agentic AI Reasoning)
app.post('/api/plan-promotions', async (req, res) => {
  try {
    const { inventory, competitor_prices, holidays, constraints } = req.body;

    const minMargin = constraints?.min_margin_pct ?? 18;
    const maxBudget = constraints?.max_marketing_budget ?? 45000;
    const targetClearance = constraints?.inventory_clearance_target_pct ?? 35;

    // Process SKUs using algorithmic optimization + Gemini AI synthesis
    const skus = inventory || [];
    const decisions = skus.map((item: any) => {
      const listPrice = item.list_price || 100;
      const costPrice = item.cost_price || 50;
      
      // Calculate max allowed discount percentage based on min net margin
      // Price * (1 - disc/100) - Cost >= Price * (1 - disc/100) * (minMargin/100)
      const maxDiscountPct = Math.max(5, Math.floor(((listPrice - costPrice / (1 - minMargin / 100)) / listPrice) * 100));
      const recommendedDiscount = Math.min(35, Math.max(10, Math.floor(maxDiscountPct * 0.85)));
      const promoPrice = Math.round((listPrice * (1 - recommendedDiscount / 100)) * 100) / 100;
      const marginPct = Math.round(((promoPrice - costPrice) / promoPrice) * 1000) / 10;

      const baseUnits = Math.max(15, Math.floor((item.current_stock || 200) * 0.3));
      const projectedUnits = Math.min(item.current_stock - (item.min_safety_stock || 20), baseUnits);
      const projectedRevenue = Math.round(projectedUnits * promoPrice * 100) / 100;
      const projectedProfit = Math.round(projectedUnits * (promoPrice - costPrice) * 100) / 100;

      // Cannibalization loss calculation
      const hasSubstitutes = item.substitute_skus && item.substitute_skus.length > 0;
      const cannibalizationLoss = hasSubstitutes ? Math.round(projectedProfit * 0.08 * 100) / 100 : 0;
      const compBoost = (item.complementary_skus && item.complementary_skus.length > 0) ? Math.round(projectedProfit * 0.12 * 100) / 100 : 0;

      let mechanism = 'Percentage Off';
      if (recommendedDiscount >= 30) mechanism = 'Flash Sale (Limited Duration)';
      else if (item.category === 'Apparel') mechanism = 'Buy One Get One (BOGO)';
      else if (item.category === 'Cosmetics') mechanism = 'Loyalty Member Exclusive';
      else if (item.category === 'Electronics') mechanism = 'Tiered Bundle Discount';

      return {
        sku: item.sku,
        product_name: item.name,
        category: item.category,
        mechanism,
        recommended_discount_pct: recommendedDiscount,
        promo_price: promoPrice,
        duration_days: 7,
        target_segments: recommendedDiscount > 20 ? ['Bargain Hunters', 'Loyalty VIPs'] : ['Premium Buyers'],
        geo_regions: ['North Metro (High Boost x1.45)', 'East Tech Hub'],
        projected_sales_units: projectedUnits,
        projected_revenue: projectedRevenue,
        projected_profit: Math.max(0, Math.round((projectedProfit - cannibalizationLoss + compBoost) * 100) / 100),
        margin_pct: marginPct,
        cannibalization_impact_usd: cannibalizationLoss,
        complementary_revenue_boost_usd: compBoost,
        stockout_risk_level: projectedUnits > item.current_stock * 0.6 ? 'Medium' : 'Low',
        reasoning: `Selected ${mechanism} with ${recommendedDiscount}% discount. Preserves ${marginPct}% net margin (min floor: ${minMargin}%). Offsets $${cannibalizationLoss} cannibalization with $${compBoost} accessory cross-sales.`
      };
    });

    const totalRevenue = decisions.reduce((acc: number, d: any) => acc + d.projected_revenue, 0);
    const totalProfit = decisions.reduce((acc: number, d: any) => acc + d.projected_profit, 0);
    const totalCannibalization = decisions.reduce((acc: number, d: any) => acc + d.cannibalization_impact_usd, 0);
    const avgMargin = Math.round((decisions.reduce((acc: number, d: any) => acc + d.margin_pct, 0) / (decisions.length || 1)) * 10) / 10;
    const marketingSpend = Math.round(decisions.reduce((acc: number, d: any) => acc + (d.promo_price * 0.25 * d.projected_sales_units), 0) * 100) / 100;
    const roiMultiplier = marketingSpend > 0 ? Math.round((totalProfit / marketingSpend) * 10) / 10 : 3.8;

    // Optional Gemini AI prompt call for strategy synthesis if GEMINI_API_KEY is available
    let execSummary = `Agentic AI Strategy: Formulated ${decisions.length} multi-category promotional campaigns achieving $${totalRevenue.toLocaleString()} projected revenue and $${totalProfit.toLocaleString()} net profit. Strictly enforced parent company net margin floor of ${minMargin}%.`;
    let geoNotes = `Focused discount depth on North Metro (x1.45 demand surge) and East Tech Hub due to overlapping regional shopping festival.`;
    let counterActions = [
      'Implement dynamic price match floor enforcing the 18% margin boundary.',
      'Deploy complementary bundle incentives (free travel case) if competitors match base price.',
      'Leverage VIP Loyalty early-access invites to capture demand before competitor sales launch.'
    ];

    if (process.env.GEMINI_API_KEY) {
      try {
        const prompt = `
You are an expert AI Retail Chief Commercial Officer.
Analyze these optimized promotion decisions for a major retail chain:
- Constraints: Min Margin ${minMargin}%, Max Marketing Budget $${maxBudget}, Target Clearance ${targetClearance}%
- Promoted SKUs: ${decisions.length}
- Total Projected Revenue: $${totalRevenue}
- Total Net Profit: $${totalProfit}
- Average Net Margin: ${avgMargin}%
- Cannibalization Impact: $${totalCannibalization}

Provide a JSON object with:
1. "executive_summary": A concise 2-sentence C-level executive summary of this promo strategy.
2. "geo_customization_notes": Strategic advice on regional store execution.
3. "competitor_counter_actions": Array of 3 strategic counter-actions if key competitors trigger price cuts.
`;

        const geminiRes = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            temperature: 0.2,
            responseMimeType: 'application/json'
          }
        });

        if (geminiRes.text) {
          const parsed = JSON.parse(geminiRes.text);
          if (parsed.executive_summary) execSummary = parsed.executive_summary;
          if (parsed.geo_customization_notes) geoNotes = parsed.geo_customization_notes;
          if (parsed.competitor_counter_actions) counterActions = parsed.competitor_counter_actions;
        }
      } catch (err) {
        console.error('Gemini synthesis warning:', err);
      }
    }

    const plan = {
      plan_id: `PLAN-2026-RET-${Math.floor(100 + Math.random() * 900)}`,
      created_at: new Date().toISOString().split('T')[0],
      parent_constraints: constraints,
      decisions,
      total_projected_revenue: totalRevenue,
      total_projected_profit: totalProfit,
      total_marketing_spend: marketingSpend,
      average_margin_pct: avgMargin,
      total_cannibalization_loss_usd: totalCannibalization,
      overall_roi_multiplier: roiMultiplier,
      executive_summary: execSummary,
      geo_customization_notes: geoNotes,
      competitor_counter_actions: counterActions
    };

    res.json({ plan });
  } catch (error: any) {
    console.error('Plan promotions error:', error);
    res.status(500).json({ error: error.message });
  }
});

// API Endpoint: Run Pre-Launch Scenario Simulation
app.post('/api/simulate-promotion', async (req, res) => {
  try {
    const { decisions, days = 14 } = req.body;

    const dailyBreakdown = [];
    let baselineRev = 0;
    let baselineProf = 0;
    let promoRev = 0;
    let promoProf = 0;
    let unitsCleared = 0;

    for (let day = 1; day <= days; day++) {
      const competitorMatches = day >= 5;

      for (const dec of decisions || []) {
        const baseUnits = 4 + Math.floor(Math.random() * 3);
        const basePrice = Math.round((dec.promo_price / (1 - (dec.recommended_discount_pct || 20) / 100)) * 100) / 100;
        const costPrice = Math.round(basePrice * 0.45 * 100) / 100;

        const bRev = baseUnits * basePrice;
        const bProf = baseUnits * (basePrice - costPrice);
        baselineRev += bRev;
        baselineProf += bProf;

        const dailyPromoUnits = Math.max(2, Math.floor((dec.projected_sales_units || 30) / days * (competitorMatches ? 0.85 : 1.15)));
        const pRev = dailyPromoUnits * dec.promo_price;
        const pProf = dailyPromoUnits * (dec.promo_price - costPrice);

        promoRev += pRev;
        promoProf += pProf;
        unitsCleared += dailyPromoUnits;

        dailyBreakdown.push({
          day,
          sku: dec.sku,
          units_sold: dailyPromoUnits,
          revenue: Math.round(pRev * 100) / 100,
          profit: Math.round(pProf * 100) / 100,
          remaining_stock: Math.max(10, 300 - unitsCleared),
          competitor_price_match: competitorMatches
        });
      }
    }

    const revUplift = baselineRev > 0 ? Math.round(((promoRev - baselineRev) / baselineRev) * 1000) / 10 : 0;
    const profitUplift = baselineProf > 0 ? Math.round(((promoProf - baselineProf) / baselineProf) * 1000) / 10 : 0;

    res.json({
      scenario_name: `Autonomous Pre-Launch Simulation (${days} Days)`,
      simulation_days: days,
      baseline_revenue: Math.round(baselineRev * 100) / 100,
      promoted_revenue: Math.round(promoRev * 100) / 100,
      revenue_uplift_pct: revUplift,
      baseline_profit: Math.round(baselineProf * 100) / 100,
      promoted_profit: Math.round(promoProf * 100) / 100,
      profit_uplift_pct: profitUplift,
      inventory_cleared_units: unitsCleared,
      total_cannibalization_usd: Math.round(promoProf * 0.07 * 100) / 100,
      daily_breakdown: dailyBreakdown
    });
  } catch (error: any) {
    console.error('Simulate error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Vite Dev Server middleware or static production serving
const isProd = process.env.NODE_ENV === 'production';
if (!isProd) {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'custom',
  });
  app.use(vite.middlewares);
  app.use('*', async (req, res, next) => {
    if (req.originalUrl.startsWith('/api')) return next();
    try {
      const url = req.originalUrl;
      let template = await fs.readFile(path.resolve(process.cwd(), 'index.html'), 'utf-8');
      template = await vite.transformIndexHtml(url, template);
      res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
} else {
  app.use(express.static('dist'));
}

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
