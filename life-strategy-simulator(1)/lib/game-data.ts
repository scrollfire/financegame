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
}

export type PropertyCondition = 'excellent' | 'good' | 'fair' | 'poor'
export type PropertyType = 'residential' | 'commercial'

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
}

export type LifeEvent = {
  id: string
  title: string
  emoji: string
  prompt: string
  choices: EventChoice[]
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

// ----------------------------------------------------------------------------
// Initial player state
// ----------------------------------------------------------------------------
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
}

// ----------------------------------------------------------------------------
// Job registry — strategic utility tradeoffs
// ----------------------------------------------------------------------------
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

// ----------------------------------------------------------------------------
// City / real-estate database — 4 disparate macro-economies
// ----------------------------------------------------------------------------
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
  },
]

// ----------------------------------------------------------------------------
// Life events — random branching decisions
// ----------------------------------------------------------------------------
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
]

// ----------------------------------------------------------------------------
// Real Estate Constants
// ----------------------------------------------------------------------------
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
