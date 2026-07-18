// ============================================================================
// Ledger Life — Static Game Data
// All structural game data is modeled as static JSON array structures.
// ============================================================================

export type PlayerState = {
  age: number
  currentMonth: number // 1-12 within a year
  cash: number
  totalDebt: number
  creditScore: number
  happiness: number // 0-100 wellbeing meter
  isMarried: boolean
  hasPet: boolean
  currentCity: string
  currentJobId: string | null
  propertiesOwned: Property[]
  portfolio: InvestmentPortfolio
  ownedBusiness: OwnedBusiness | null
  activeInsurance: InsurancePolicy[] // Policies player is currently paying for
  insuranceDeclinedCount: Record<string, number> // Track policy declines to increase risk
}

export type PropertyCondition = 'excellent' | 'good' | 'fair' | 'poor'
export type PropertyType = 'residential' | 'commercial'
export type InsuranceType = 'portfolio' | 'business' | 'property_liability' | 'umbrella_liability' | 'tax_liability'

export type Property = {
  id: string
  city: string
  purchasePrice: number // Original purchase price (never changes)
  currentMarketValue: number // Appreciates/depreciates over time
  monthlyRent: number // Base monthly rent
  boughtOnMonth: number

  // Financing details
  mortgageRemaining: number // How much you still owe (0 = fully owned)
  mortgageRate: number // Annual interest rate (e.g., 0.05 = 5%)
  monthlyMortgagePayment: number // Fixed monthly payment (0 if no mortgage)

  // Maintenance & condition
  maintenanceReserve: number // Monthly budget for maintenance
  occupancyRate: number // 0-1, percentage of time rented out
  conditionDegradation: number // Tracks how much condition has degraded (0-100)

  // Metadata
  condition: PropertyCondition // Affects appreciation and maintenance
  propertyType: PropertyType // Different mechanics later
}

export type InvestmentPortfolio = {
  indexFunds: number // Dollar amount invested
  stocks: number // Dollar amount invested
  bonds: number // Dollar amount invested
  indexFundsValue: number // Current value
  stocksValue: number // Current value (volatile)
  bondsValue: number // Current value
}

export type BusinessType = 'coffee_shop' | 'property_management' | 'consulting'

export type OwnedBusiness = {
  id: string
  type: BusinessType
  boughtOnMonth: number
  purchasePrice: number
  
  // Monthly operations
  monthlyRevenue: number // Base revenue
  monthlyExpenses: number // Operating costs
  
  // State
  staffLevel: number // 1-5 (affects revenue & expenses)
  priceStrategy: 'low' | 'medium' | 'premium' // Affects occupancy/volume
  marketReputation: number // 0-100 (affects revenue)
  
  // Financials
  mortgageRemaining: number // If financed
  monthlyMortgagePayment: number
}

export type InsurancePolicy = {
  id: string
  type: InsuranceType
  label: string
  yearlyCost: number // Monthly = yearlyCost / 12
  coverageAmount: number // Max protection
  deductible: number // Out-of-pocket before insurance kicks in
  unlocksAtNetWorth: number // Net worth threshold to purchase
  description: string
}

export type Job = {
  id: string
  title: string
  salary: number
  hasHealthBenefits: boolean
  monthlyPremium: number
  blurb: string
}

export type City = {
  id: string
  name: string
  state: string
  tagline: string
  costOfLiving: number
  avgProperty: number
  avgRent: number
  vibe: string
  appreciationRate: number // Monthly appreciation (e.g., 0.003 = 3.6% annual)
  avgCommercialProperty?: number // For commercial properties
  avgCommercialRent?: number
}

export type EventChoice = {
  label: string
  description: string
  // Financial consequences
  cash?: number // added to cash (can be negative)
  debt?: number // added to totalDebt
  creditScore?: number // added directly to credit score
  happiness?: number // added to happiness meter (can be negative)
  // If true and the player cannot afford the cash cost out of pocket,
  // the shortfall is pushed to debt and credit score drops 40 points.
  canGoToDebt?: boolean
  // Portfolio impact (for market events)
  portfolioImpact?: number // Multiplier: 0.9 = 10% loss, 1.1 = 10% gain
}

export type LifeEvent = {
  id: string
  title: string
  emoji: string
  prompt: string
  choices: EventChoice[]
  minNetWorth?: number // Only triggers if player has this net worth
}

// ============================================================================
// Financing Options
// ============================================================================
export type FinancingOption = {
  id: string
  label: string
  downPaymentPercent: number
  mortgageRate: number
  description: string
}

export const FINANCING_OPTIONS: FinancingOption[] = [
  {
    id: 'cash',
    label: 'Pay in Cash',
    downPaymentPercent: 1.0,
    mortgageRate: 0,
    description: 'Full ownership, no monthly mortgage. Best for cash flow.',
  },
  {
    id: 'traditional',
    label: 'Traditional Mortgage (20% down)',
    downPaymentPercent: 0.2,
    mortgageRate: 0.05,
    description: 'Take a 30-year mortgage at 5%. More leverage, monthly payments.',
  },
  {
    id: 'minimal',
    label: 'Minimal Down (10%)',
    downPaymentPercent: 0.1,
    mortgageRate: 0.065,
    description: 'Save cash now, but higher rates and PMI. Risky.',
  },
]

// ============================================================================
// Insurance Policies
// ============================================================================
export const INSURANCE_POLICIES: InsurancePolicy[] = [
  {
    id: 'portfolio_insurance',
    type: 'portfolio',
    label: 'Portfolio Protection',
    yearlyCost: 2000,
    coverageAmount: 500000, // Covers fraud, embezzlement, scams
    deductible: 5000,
    unlocksAtNetWorth: 100000,
    description: 'Protects against investment fraud, Ponzi schemes, and advisor embezzlement. Coverage up to portfolio value.',
  },
  {
    id: 'business_insurance',
    type: 'business',
    label: 'Business Protection',
    yearlyCost: 1500,
    coverageAmount: 200000, // Covers partner embezzlement, key-person losses
    deductible: 3000,
    unlocksAtNetWorth: 200000,
    description: 'Covers partner embezzlement, key-person losses, and business interruption.',
  },
  {
    id: 'property_liability',
    type: 'property_liability',
    label: 'Property Liability',
    yearlyCost: 3500,
    coverageAmount: 400000, // Covers tenant lawsuits
    deductible: 5000,
    unlocksAtNetWorth: 50000,
    description: 'Protects against tenant lawsuits, negligence claims, and property damage litigation.',
  },
  {
    id: 'umbrella_liability',
    type: 'umbrella_liability',
    label: 'Umbrella Liability',
    yearlyCost: 5000,
    coverageAmount: 1000000, // Catch-all for lawsuits over $1M
    deductible: 10000,
    unlocksAtNetWorth: 500000,
    description: 'Protects against catastrophic lawsuits exceeding $1M. Last line of defense.',
  },
  {
    id: 'tax_liability',
    type: 'tax_liability',
    label: 'Tax Liability Protection',
    yearlyCost: 5000,
    coverageAmount: 400000, // Covers IRS audit penalties & back taxes
    deductible: 8000,
    unlocksAtNetWorth: 1000000,
    description: 'Covers IRS audit penalties, back taxes, and legal defense. Only for high-net-worth players.',
  },
]

// ============================================================================
// Complexity Unlock Tresholds
// ============================================================================
export const UNLOCK_THRESHOLDS = {
  COMMERCIAL_RE: 50000, // $50k net worth
  STOCK_MARKET: 100000, // $100k net worth
  BUSINESS: 200000, // $200k net worth
}

// ============================================================================
// Commercial Real Estate
// ============================================================================
export const COMMERCIAL_PROPERTIES = [
  {
    city: 'Austin',
    type: 'office' as const,
    price: 500000,
    baseRent: 5000,
    capRate: 0.08,
  },
  {
    city: 'Austin',
    type: 'retail' as const,
    price: 600000,
    baseRent: 6000,
    capRate: 0.085,
  },
  {
    city: 'New York',
    type: 'office' as const,
    price: 1500000,
    baseRent: 12000,
    capRate: 0.07,
  },
  {
    city: 'New York',
    type: 'retail' as const,
    price: 1800000,
    baseRent: 15000,
    capRate: 0.075,
  },
  {
    city: 'Seattle',
    type: 'office' as const,
    price: 800000,
    baseRent: 7000,
    capRate: 0.08,
  },
  {
    city: 'Seattle',
    type: 'retail' as const,
    price: 900000,
    baseRent: 8000,
    capRate: 0.085,
  },
]

// ============================================================================
// Stock Market Asset Classes
// ============================================================================
export const STOCK_MARKET_ASSETS = {
  indexFunds: {
    label: 'Index Funds (S&P 500)',
    description: 'Safe, ~7% annual return',
    volatility: 0.02, // Low volatility
    baseReturn: 0.07,
  },
  stocks: {
    label: 'Individual Stocks',
    description: 'Volatile, potential high return',
    volatility: 0.3, // High volatility
    baseReturn: 0.12,
  },
  bonds: {
    label: 'Bonds',
    description: 'Very safe, ~3% return',
    volatility: 0.01,
    baseReturn: 0.03,
  },
}

// ============================================================================
// Businesses
// ============================================================================
export const BUSINESS_TYPES: Record<BusinessType, { label: string; price: number; description: string }> = {
  coffee_shop: {
    label: 'Coffee Shop',
    price: 150000,
    description: 'High volume, low margin. Active management required.',
  },
  property_management: {
    label: 'Property Management Company',
    price: 200000,
    description: 'Manage rentals for others. More passive once established.',
  },
  consulting: {
    label: 'Consulting Firm',
    price: 100000,
    description: 'Service-based. Scales with your effort and reputation.',
  },
}

// ============================================================================
// Initial player state
// ============================================================================
export const INITIAL_PLAYER: PlayerState = {
  age: 22,
  currentMonth: 1,
  cash: 5000,
  totalDebt: 35000,
  creditScore: 700,
  happiness: 65,
  isMarried: false,
  hasPet: false,
  currentCity: 'Austin',
  currentJobId: null,
  propertiesOwned: [],
  portfolio: {
    indexFunds: 0,
    stocks: 0,
    bonds: 0,
    indexFundsValue: 0,
    stocksValue: 0,
    bondsValue: 0,
  },
  ownedBusiness: null,
  activeInsurance: [],
  insuranceDeclinedCount: {},
}

// ============================================================================
// Job registry — strategic utility tradeoffs
// ============================================================================
export const JOBS: Job[] = [
  {
    id: 'job_tech',
    title: 'Software Engineer',
    salary: 85000,
    hasHealthBenefits: true,
    monthlyPremium: 150,
    blurb: 'Stable W-2 role with full benefits and a safety net.',
  },
  {
    id: 'job_gig',
    title: 'Freelance Consultant',
    salary: 110000,
    hasHealthBenefits: false,
    monthlyPremium: 0,
    blurb: 'Higher base pay, but you carry all the risk yourself.',
  },
  {
    id: 'job_nurse',
    title: 'Registered Nurse',
    salary: 78000,
    hasHealthBenefits: true,
    monthlyPremium: 120,
    blurb: 'Recession-proof demand with strong employer benefits.',
  },
  {
    id: 'job_teacher',
    title: 'Public School Teacher',
    salary: 54000,
    hasHealthBenefits: true,
    monthlyPremium: 90,
    blurb: 'Lower pay, but a pension and excellent low-cost health plan.',
  },
]

// ============================================================================
// City / real-estate database — 4 disparate macro-economies
// ============================================================================
export const CITIES: City[] = [
  {
    id: 'austin',
    name: 'Austin',
    state: 'TX',
    tagline: 'Balanced growth',
    costOfLiving: 2500,
    avgProperty: 150000,
    avgRent: 1200,
    vibe: 'A steady middle path — affordable enough to build, hot enough to grow.',
    appreciationRate: 0.003, // 3.6% annually
    avgCommercialProperty: 500000,
    avgCommercialRent: 5000,
  },
  {
    id: 'newyork',
    name: 'New York',
    state: 'NY',
    tagline: 'Extreme high cost / high reward',
    costOfLiving: 4500,
    avgProperty: 450000,
    avgRent: 3500,
    vibe: 'Everything costs more here, but the rent checks are enormous.',
    appreciationRate: 0.0025, // 3% annually (mature market)
    avgCommercialProperty: 1500000,
    avgCommercialRent: 12000,
  },
  {
    id: 'indianapolis',
    name: 'Indianapolis',
    state: 'IN',
    tagline: 'Low barrier to entry',
    costOfLiving: 1800,
    avgProperty: 75000,
    avgRent: 700,
    vibe: 'Cheap to live and cheap to buy — the easiest first rung on the ladder.',
    appreciationRate: 0.002, // 2.4% annually
    avgCommercialProperty: 250000,
    avgCommercialRent: 2500,
  },
  {
    id: 'seattle',
    name: 'Seattle',
    state: 'WA',
    tagline: 'High tech hub',
    costOfLiving: 3800,
    avgProperty: 300000,
    avgRent: 2400,
    vibe: 'Premium tech-driven market with strong appreciation potential.',
    appreciationRate: 0.0035, // 4.2% annually
    avgCommercialProperty: 800000,
    avgCommercialRent: 7000,
  },
]

// ============================================================================
// Life events — random branching decisions
// ============================================================================
export const LIFE_EVENTS: LifeEvent[] = [
  {
    id: 'evt_car',
    title: 'Your Car Breaks Down',
    emoji: '🚗',
    prompt:
      'Your transmission just died on the highway. The mechanic quotes $3,200 for a full repair.',
    choices: [
      {
        label: 'Pay for the repair',
        description: 'Fix it now and keep your commute reliable.',
        cash: -3200,
        canGoToDebt: true,
      },
      {
        label: 'Skip it and take the bus',
        description: 'Save the money, but the long commute wears on you.',
        cash: 0,
        creditScore: 5,
        happiness: -6,
      },
    ],
  },
  {
    id: 'evt_medical',
    title: 'Unexpected Medical Bill',
    emoji: '🏥',
    prompt:
      'A trip to the ER lands you a bill. Insurance covers a chunk if you have it — otherwise you pay the full $6,000.',
    choices: [
      {
        label: 'Settle the bill in full',
        description: 'Insured players pay far less out of pocket.',
        cash: -6000,
        canGoToDebt: true,
        happiness: -10,
      },
      {
        label: 'Set up a payment plan',
        description: 'Add it to your debt and protect your cash.',
        debt: 6000,
        creditScore: -15,
        happiness: -8,
      },
    ],
  },
  {
    id: 'evt_bonus',
    title: 'Performance Bonus!',
    emoji: '🎉',
    prompt:
      'Your hard work paid off — leadership hands you a surprise year-end bonus.',
    choices: [
      {
        label: 'Bank the $4,000',
        description: 'Straight into your cash reserves.',
        cash: 4000,
        happiness: 6,
      },
      {
        label: 'Pay down debt with it',
        description: 'Knock $4,000 off your balance and boost your score.',
        debt: -4000,
        creditScore: 20,
        happiness: 4,
      },
    ],
  },
  {
    id: 'evt_wedding',
    title: 'A Proposal',
    emoji: '💍',
    prompt:
      'Your partner pops the question. A wedding is a big expense but changes your household finances.',
    choices: [
      {
        label: 'Say yes — big celebration',
        description: 'Get married and throw a $12,000 wedding.',
        cash: -12000,
        canGoToDebt: true,
        happiness: 18,
      },
      {
        label: 'Elope at the courthouse',
        description: 'Get married for almost nothing.',
        cash: -300,
        happiness: 12,
      },
      {
        label: 'Not yet',
        description: 'Stay single and keep your money.',
        happiness: -5,
      },
    ],
  },
  {
    id: 'evt_invest',
    title: 'A Hot Investment Tip',
    emoji: '📈',
    prompt:
      'A friend swears their startup stock is about to pop. You could put in $5,000.',
    choices: [
      {
        label: 'Invest $5,000',
        description: 'High risk — this could double or vanish.',
        cash: -5000,
      },
      {
        label: 'Pass on it',
        description: 'Keep your cash where it is safe.',
      },
    ],
  },
  {
    id: 'evt_raise',
    title: 'Cost of Living Raise',
    emoji: '💵',
    prompt: 'Your city announced rising rents, and your landlord gives notice.',
    choices: [
      {
        label: 'Negotiate a smaller increase',
        description: 'A little charm saves you money.',
        cash: 500,
        creditScore: 5,
      },
      {
        label: 'Just absorb the cost',
        description: 'Pay the higher rent this month.',
        cash: -900,
        canGoToDebt: true,
      },
    ],
  },
  {
    id: 'evt_pet',
    title: 'Adopt a Rescue Pet?',
    emoji: '🐶',
    prompt:
      'The shelter down the street has a dog that would love a home. Adoption and setup run $800.',
    choices: [
      {
        label: 'Adopt the pup',
        description: 'Worth every penny for the companionship.',
        cash: -800,
        canGoToDebt: true,
        happiness: 15,
      },
      {
        label: 'Maybe later',
        description: 'Not the right time financially.',
        happiness: -3,
      },
    ],
  },
  {
    id: 'evt_tax',
    title: 'Tax Refund Season',
    emoji: '🧾',
    prompt: 'You filed your taxes and the IRS owes you money back.',
    choices: [
      {
        label: 'Take the $2,200 refund',
        description: 'A nice boost to your cash.',
        cash: 2200,
      },
    ],
  },
  {
    id: 'evt_scam',
    title: 'Phishing Scam',
    emoji: '⚠️',
    prompt:
      'A convincing email tricks you into a fraudulent charge before your bank flags it.',
    choices: [
      {
        label: 'Dispute it with the bank',
        description: 'You recover most of the money, minus a $400 hit.',
        cash: -400,
        canGoToDebt: true,
        happiness: -5,
      },
      {
        label: 'Eat the full loss',
        description: 'Too tired to fight it — lose $1,500.',
        cash: -1500,
        canGoToDebt: true,
        creditScore: -10,
        happiness: -12,
      },
    ],
  },
  {
    id: 'evt_side',
    title: 'Weekend Side Hustle',
    emoji: '🛠️',
    prompt: 'A neighbor offers to pay you for a weekend of freelance work.',
    choices: [
      {
        label: 'Take the gig (+$1,500)',
        description: 'Trade your weekend for extra cash.',
        cash: 1500,
        happiness: -7,
      },
      {
        label: 'Rest instead',
        description: 'Recharge — no money, no stress.',
        creditScore: 3,
        happiness: 8,
      },
    ],
  },
  // ========== MARKET EVENTS (minNetWorth unlocks) ==========
  {
    id: 'evt_tech_crash',
    title: 'Tech Stocks Plummet',
    emoji: '📉',
    prompt:
      'Breaking news: Major tech selloff rocks the market. Your portfolio takes a hit.',
    minNetWorth: 100000,
    choices: [
      {
        label: 'Hold and weather the storm',
        description: 'Stay invested. Markets recover.',
        portfolioImpact: 0.85, // 15% loss
        happiness: -8,
      },
      {
        label: 'Panic sell everything',
        description: 'Lock in losses now and move to bonds.',
        portfolioImpact: 0.9, // 10% loss
        cash: 5000, // Move some to cash
        happiness: -12,
      },
    ],
  },
  {
    id: 'evt_market_surge',
    title: 'Bull Market Boom',
    emoji: '📈',
    prompt:
      'Prosperity strikes! Economic growth drives strong market performance.',
    minNetWorth: 100000,
    choices: [
      {
        label: 'Rebalance into growth stocks',
        description: 'Ride the wave with aggressive positioning.',
        portfolioImpact: 1.15, // 15% gain
        happiness: 8,
      },
      {
        label: 'Take profits and diversify',
        description: 'Lock in gains, move to bonds.',
        portfolioImpact: 1.08, // 8% gain
        cash: 10000,
        happiness: 6,
      },
    ],
  },
  {
    id: 'evt_tenant_trouble',
    title: 'Tenant Lawsuit',
    emoji: '⚖️',
    prompt:
      'A tenant is suing you for negligent maintenance. Your lawyer quotes $8,000 to settle.',
    minNetWorth: 50000,
    choices: [
      {
        label: 'Settle and improve maintenance',
        description: 'Pay now, avoid court. Your properties benefit.',
        cash: -8000,
        canGoToDebt: true,
        happiness: -5,
      },
      {
        label: 'Fight it in court',
        description: 'Risk losing more, or winning clean.',
        cash: -12000, // Assume worst case
        canGoToDebt: true,
        creditScore: -20,
        happiness: -15,
      },
    ],
  },
  {
    id: 'evt_commercial_downturn',
    title: 'Commercial Real Estate Downturn',
    emoji: '🏢',
    prompt:
      'Office vacancy rates are rising. Commercial property values are declining.',
    minNetWorth: 200000,
    choices: [
      {
        label: 'Hold and collect rent',
        description: 'Long term, markets recover. But rent declines.',
        cash: -3000, // Lower rent this month
        happiness: -5,
      },
      {
        label: 'Sell and reinvest residential',
        description: 'Cut losses, move capital to stronger market.',
        cash: 50000,
        happiness: 2,
      },
    ],
  },
  // ========== "MORE MONEY MORE PROBLEMS" EVENTS ==========
  {
    id: 'evt_ponzi_scheme',
    title: 'Investment Advisor Scandal',
    emoji: '💼',
    prompt:
      'Your investment advisor is exposed in a Ponzi scheme. Federal investigators freeze accounts.',
    minNetWorth: 100000,
    choices: [
      {
        label: 'Wait for SIPC recovery (insured)',
        description: 'If you have portfolio insurance, recover your funds. Otherwise, lose 40%.',
        cash: -100000, // Placeholder — replaced if insured
        portfolioImpact: 0.6, // Lose 40% without insurance
        creditScore: -25,
        happiness: -20,
      },
      {
        label: 'Liquidate and move on',
        description: 'Accept the loss and shift to safer investments.',
        portfolioImpact: 0.5, // Lose 50%
        happiness: -25,
        creditScore: -30,
      },
    ],
  },
  {
    id: 'evt_partner_embezzle',
    title: 'Partner Embezzlement',
    emoji: '😡',
    prompt:
      'Your business partner has been stealing from the company for months. You discover the theft.',
    minNetWorth: 200000,
    choices: [
      {
        label: 'Prosecute and recover (if insured)',
        description: 'Business insurance covers most losses. Without it, lose 30% of business value.',
        cash: -60000, // Placeholder — depends on insurance
        creditScore: -20,
        happiness: -15,
      },
      {
        label: 'Settle quietly to avoid scandal',
        description: 'Pay them off and move forward, but avoid reputation damage.',
        cash: -150000, // Direct settlement
        happiness: -10,
        creditScore: 10,
      },
    ],
  },
  {
    id: 'evt_catastrophic_lawsuit',
    title: 'Catastrophic Lawsuit',
    emoji: '⚠️',
    prompt:
      'Someone was injured on your property. They\'re suing for $800,000. Your lawyer thinks they might win.',
    minNetWorth: 500000,
    choices: [
      {
        label: 'Settle with insurance (if insured)',
        description: 'Umbrella liability covers most/all. Without it, you\'re ruined.',
        cash: -200000, // Deductible + uninsured portion
        creditScore: -40,
        happiness: -30,
      },
      {
        label: 'Fight in court',
        description: 'Could win, but legal fees alone could be $100k+.',
        cash: -250000,
        creditScore: -50,
        happiness: -35,
      },
    ],
  },
  {
    id: 'evt_tax_audit',
    title: 'IRS Audit — Major Penalties',
    emoji: '🧾',
    prompt:
      'The IRS audited your business. They claim you owe $250,000 in back taxes + penalties.',
    minNetWorth: 1000000,
    choices: [
      {
        label: 'Pay and move on (if insured)',
        description: 'Tax liability insurance covers most. Otherwise, liquidate assets at loss.',
        cash: -200000, // Liquidation + penalties (uninsured worse)
        creditScore: -35,
        happiness: -25,
      },
      {
        label: 'Hire accountant to fight it',
        description: 'Could reduce the bill, but costs $50k in legal fees upfront.',
        cash: -150000,
        creditScore: -20,
        happiness: -20,
      },
    ],
  },
  {
    id: 'evt_business_failure',
    title: 'Market Collapse — Business Fails',
    emoji: '📉',
    prompt:
      'Recession hits hard. Your business can\'t sustain operations. You must close.',
    minNetWorth: 500000,
    choices: [
      {
        label: 'Graceful exit (if insured)',
        description: 'Business interruption insurance recovers 50-75%. Without it, total loss.',
        cash: -300000, // Partial recovery if insured
        creditScore: -30,
        happiness: -20,
      },
      {
        label: 'Bankruptcy filing',
        description: 'Protect remaining assets, but credit score tanks.',
        creditScore: -100,
        happiness: -30,
      },
    ],
  },
]

// ============================================================================
// Real Estate Constants
// ============================================================================
export const RELOCATION_COST = 2000
export const DEBT_MONTHLY_RATE = 0.01 // 1% of remaining debt per month
export const CREDIT_PENALTY_ON_DEBT = 40

// Property-specific constants
export const PROPERTY_APPRECIATION_BASE = 0.003 // Base monthly appreciation
export const MAINTENANCE_COST_PERCENT = 0.01 // 1% of property value per year (0.083% monthly)
export const SELLING_COST_PERCENT = 0.06 // 6% in closing costs when selling
export const PROPERTY_CONDITION_THRESHOLD = 30 // Degradation level before condition worsens
export const OCCUPANCY_VARIANCE = 0.15 // Random variance on occupancy

// Mortgage calculation: 30-year fixed, monthly rate = annual / 12
export function calculateMortgagePayment(
  principal: number,
  annualRate: number,
  years: number = 30,
): number {
  const monthlyRate = annualRate / 12
  const numPayments = years * 12
  if (monthlyRate === 0) return principal / numPayments
  return (
    (principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments))) /
    (Math.pow(1 + monthlyRate, numPayments) - 1)
  )
}

// Property appreciation based on city + condition
export function calculateMonthlyAppreciation(
  property: Property,
  city: City,
): number {
  const conditionMultiplier =
    property.condition === 'excellent'
      ? 1.3
      : property.condition === 'good'
        ? 1.1
        : property.condition === 'fair'
          ? 0.9
          : 0.6

  const monthlyRate = city.appreciationRate * conditionMultiplier
  return property.currentMarketValue * monthlyRate
}

// Actual rent collected accounting for occupancy
export function calculateActualRent(property: Property): number {
  return Math.round(property.monthlyRent * property.occupancyRate)
}

// Equity in property = down payment + appreciation
export function calculatePropertyEquity(property: Property): number {
  const downPayment = property.purchasePrice * 0.2 // Always 20% of original purchase
  const appreciation = property.currentMarketValue - property.purchasePrice
  return downPayment + appreciation
}

// Selling proceeds = equity - selling costs - mortgage payoff
export function calculateSellProceeds(property: Property): number {
  const equity = calculatePropertyEquity(property)
  const sellingCosts = property.currentMarketValue * SELLING_COST_PERCENT
  const proceeds = equity - sellingCosts - property.mortgageRemaining
  return Math.round(Math.max(0, proceeds))
}

// Condition label
export function conditionLabel(condition: PropertyCondition): string {
  return condition.charAt(0).toUpperCase() + condition.slice(1)
}

// Maintenance reserve recommendation
export function recommendedMaintenanceReserve(property: Property): number {
  return Math.round((property.currentMarketValue * MAINTENANCE_COST_PERCENT) / 12)
}

// Calculate portfolio value with market returns
export function calculatePortfolioValue(portfolio: InvestmentPortfolio, marketMultiplier: number = 1.0): number {
  const indexValue = portfolio.indexFundsValue * marketMultiplier
  const stockValue = portfolio.stocksValue * marketMultiplier
  const bondValue = portfolio.bondsValue * marketMultiplier
  return indexValue + stockValue + bondValue
}

// ============================================================================
// Helpers
// ============================================================================
export function happinessLabel(h: number): string {
  if (h >= 80) return 'Thriving'
  if (h >= 60) return 'Content'
  if (h >= 40) return 'Stressed'
  if (h >= 20) return 'Struggling'
  return 'Burned Out'
}

export function getCity(name: string): City {
  return CITIES.find((c) => c.name === name) ?? CITIES[0]
}

export function getJob(id: string | null): Job | null {
  if (!id) return null
  return JOBS.find((j) => j.id === id) ?? null
}

export function formatMoney(n: number): string {
  const sign = n < 0 ? '-' : ''
  return `${sign}$${Math.abs(Math.round(n)).toLocaleString('en-US')}`
}

export const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]
