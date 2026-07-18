'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import {
  CITIES,
  CREDIT_PENALTY_ON_DEBT,
  DEBT_MONTHLY_RATE,
  FINANCING_OPTIONS,
  INITIAL_PLAYER,
  LIFE_EVENTS,
  MAINTENANCE_COST_PERCENT,
  OCCUPANCY_VARIANCE,
  PROPERTY_CONDITION_THRESHOLD,
  RELOCATION_COST,
  UNLOCK_THRESHOLDS,
  calculateActualRent,
  calculateMonthlyAppreciation,
  calculateMortgagePayment,
  calculatePortfolioValue,
  calculateSellProceeds,
  getCity,
  getJob,
  type EventChoice,
  type FinancingOption,
  type LifeEvent,
  type PlayerState,
  type Property,
  type PropertyCondition,
} from '@/lib/game-data'

export type LogEntry = {
  id: number
  month: number
  age: number
  text: string
  tone: 'positive' | 'negative' | 'neutral'
}

type GameContextValue = {
  player: PlayerState
  netWorth: number
  monthlyIncome: number
  monthlyRentIncome: number
  monthlyExpenses: number
  monthlyNet: number
  monthlyMortgagePayment: number
  monthlyMaintenanceExpense: number
  monthlyBusinessIncome: number
  monthlyInvestmentIncome: number
  portfolioValue: number
  unlockedCommercial: boolean
  unlockedStockMarket: boolean
  unlockedBusiness: boolean
  activeEvent: LifeEvent | null
  gameOver: boolean
  log: LogEntry[]
  started: boolean
  monthsElapsed: number
  startGame: (jobId: string) => void
  advanceMonth: () => void
  resolveEvent: (choice: EventChoice) => void
  relocate: (cityName: string) => void
  buyProperty: (cityName: string, financingOptionId: string) => void
  sellProperty: (propertyId: string) => void
  resetGame: () => void
}

const GameContext = createContext<GameContextValue | null>(null)

function clampScore(n: number) {
  return Math.max(300, Math.min(850, Math.round(n)))
}

function clampHappiness(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)))
}

function updatePropertyCondition(property: Property): PropertyCondition {
  if (property.conditionDegradation < 20) return 'excellent'
  if (property.conditionDegradation < 40) return 'good'
  if (property.conditionDegradation < 70) return 'fair'
  return 'poor'
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [player, setPlayer] = useState<PlayerState>(INITIAL_PLAYER)
  const [activeEvent, setActiveEvent] = useState<LifeEvent | null>(null)
  const [gameOver, setGameOver] = useState(false)
  const [started, setStarted] = useState(false)
  const [log, setLog] = useState<LogEntry[]>([])
  const logIdRef = useRef(1)
  const [monthsElapsed, setMonthsElapsed] = useState(0)

  const addLog = useCallback(
    (
      text: string,
      tone: LogEntry['tone'],
      snapshot: { month: number; age: number },
    ) => {
      const id = logIdRef.current++
      setLog((prev) => [
        {
          id,
          month: snapshot.month,
          age: snapshot.age,
          text,
          tone,
        },
        ...prev,
      ])
    },
    [],
  )

  // Derived financial figures ------------------------------------------------
  const job = getJob(player.currentJobId)
  const city = getCity(player.currentCity)

  const monthlyIncome = job ? job.salary / 12 : 0
  const monthlyRentIncome = player.propertiesOwned.reduce(
    (sum, p) => sum + calculateActualRent(p),
    0,
  )
  const monthlyMortgagePayment = player.propertiesOwned.reduce(
    (sum, p) => sum + p.monthlyMortgagePayment,
    0,
  )
  const monthlyMaintenanceExpense = player.propertiesOwned.reduce(
    (sum, p) => sum + p.maintenanceReserve,
    0,
  )
  const monthlyBusinessIncome = player.ownedBusiness
    ? Math.max(0, player.ownedBusiness.monthlyRevenue - player.ownedBusiness.monthlyExpenses - player.ownedBusiness.monthlyMortgagePayment)
    : 0
  const portfolioValue = calculatePortfolioValue(player.portfolio)
  const monthlyInvestmentIncome = portfolioValue * 0.07 / 12 // Assume ~7% annual return on average
  
  const premium = job && job.hasHealthBenefits ? job.monthlyPremium : 0
  const debtService = player.totalDebt * DEBT_MONTHLY_RATE
  const monthlyExpenses =
    city.costOfLiving +
    premium +
    debtService +
    monthlyMortgagePayment +
    monthlyMaintenanceExpense
  const monthlyNet = monthlyIncome + monthlyRentIncome + monthlyBusinessIncome + monthlyInvestmentIncome - monthlyExpenses

  // Net worth = cash + equity in all properties + portfolio + business value - unsecured debt
  const propertyEquity = player.propertiesOwned.reduce((sum, p) => {
    const downPayment = p.purchasePrice * 0.2
    const appreciation = p.currentMarketValue - p.purchasePrice
    return sum + downPayment + appreciation - p.mortgageRemaining
  }, 0)
  const businessEquity = player.ownedBusiness
    ? player.ownedBusiness.purchasePrice - player.ownedBusiness.mortgageRemaining
    : 0
  const netWorth = player.cash + propertyEquity + portfolioValue + businessEquity - player.totalDebt

  // Unlock system
  const unlockedCommercial = netWorth >= UNLOCK_THRESHOLDS.COMMERCIAL_RE
  const unlockedStockMarket = netWorth >= UNLOCK_THRESHOLDS.STOCK_MARKET
  const unlockedBusiness = netWorth >= UNLOCK_THRESHOLDS.BUSINESS

  // Actions ------------------------------------------------------------------
  const startGame = useCallback(
    (jobId: string) => {
      const j = getJob(jobId)
      setPlayer({ ...INITIAL_PLAYER, currentJobId: jobId })
      setStarted(true)
      setGameOver(false)
      setMonthsElapsed(0)
      logIdRef.current = 1
      setTimeout(() => {
        setLog([
          {
            id: 0,
            month: 1,
            age: 22,
            text: `You start your career as a ${j?.title ?? 'professional'} in Austin, TX.`,
            tone: 'neutral',
          },
        ])
      }, 0)
    },
    [],
  )

  const advanceMonth = useCallback(() => {
    if (activeEvent || gameOver) return

    setPlayer((prev) => {
      const j = getJob(prev.currentJobId)
      const c = getCity(prev.currentCity)

      // Calculate income & expenses
      const income = j ? j.salary / 12 : 0
      const rentIncome = prev.propertiesOwned.reduce(
        (s, p) => s + calculateActualRent(p),
        0,
      )
      const prem = j && j.hasHealthBenefits ? j.monthlyPremium : 0
      const debtPay = prev.totalDebt * DEBT_MONTHLY_RATE
      const mortgagePayment = prev.propertiesOwned.reduce(
        (s, p) => s + p.monthlyMortgagePayment,
        0,
      )
      const maintenanceExpense = prev.propertiesOwned.reduce(
        (s, p) => s + p.maintenanceReserve,
        0,
      )
      
      // Business income
      let businessIncome = 0
      let updatedBusiness = prev.ownedBusiness
      if (prev.ownedBusiness) {
        const monthlyProfit = Math.max(
          0,
          prev.ownedBusiness.monthlyRevenue -
            prev.ownedBusiness.monthlyExpenses -
            prev.ownedBusiness.monthlyMortgagePayment
        )
        businessIncome = monthlyProfit
        
        // Apply slight random variance to reputation (affects next month's revenue)
        const reputationChange = (Math.random() - 0.5) * 5
        updatedBusiness = {
          ...prev.ownedBusiness,
          marketReputation: Math.max(0, Math.min(100, prev.ownedBusiness.marketReputation + reputationChange)),
        }
      }
      
      // Portfolio appreciation
      let updatedPortfolio = prev.portfolio
      const portfolioReturn = (Math.random() - 0.5) * 0.1 + 0.07 // ~7% base with variance
      updatedPortfolio = {
        indexFunds: prev.portfolio.indexFunds,
        stocks: prev.portfolio.stocks,
        bonds: prev.portfolio.bonds,
        indexFundsValue: Math.round(prev.portfolio.indexFundsValue * (1 + portfolioReturn * 0.01)),
        stocksValue: Math.round(prev.portfolio.stocksValue * (1 + portfolioReturn * 0.05)), // More volatile
        bondsValue: Math.round(prev.portfolio.bondsValue * (1 + portfolioReturn * 0.003)), // Less volatile
      }
      
      const investmentIncome = (updatedPortfolio.indexFundsValue + updatedPortfolio.stocksValue + updatedPortfolio.bondsValue) * 0.07 / 12

      const net =
        income +
        rentIncome +
        businessIncome +
        investmentIncome -
        c.costOfLiving -
        prem -
        debtPay -
        mortgagePayment -
        maintenanceExpense

      // Update properties: appreciate, degrade condition, update occupancy
      const updatedProperties = prev.propertiesOwned.map((p) => {
        // Appreciate based on city + condition
        const appreciation = calculateMonthlyAppreciation(p, c)
        const newMarketValue = p.currentMarketValue + appreciation

        // Random occupancy variance (0.85 - 1.0)
        const variance = 0.85 + Math.random() * OCCUPANCY_VARIANCE
        const newOccupancy = Math.min(1, Math.max(0.5, variance))

        // Degrade condition if not maintaining
        let newDegradation = p.conditionDegradation
        if (p.maintenanceReserve === 0) {
          newDegradation += 2 // Decay without maintenance
        }

        // Update mortgage (only if remaining)
        let newMortgageRemaining = p.mortgageRemaining
        if (p.mortgageRemaining > 0) {
          // Apply interest
          const monthlyRate = p.mortgageRate / 12
          const interest = newMortgageRemaining * monthlyRate
          const principal = p.monthlyMortgagePayment - interest
          newMortgageRemaining = Math.max(0, newMortgageRemaining - principal)
        }

        const newCondition = updatePropertyCondition({
          ...p,
          conditionDegradation: newDegradation,
        })

        return {
          ...p,
          currentMarketValue: newMarketValue,
          occupancyRate: newOccupancy,
          conditionDegradation: newDegradation,
          condition: newCondition,
          mortgageRemaining: newMortgageRemaining,
        }
      })

      const newCash = prev.cash + net
      const newDebt = Math.max(0, prev.totalDebt - debtPay * 0.5)

      let newMonth = prev.currentMonth + 1
      let newAge = prev.age
      if (newMonth > 12) {
        newMonth = 1
        newAge = prev.age + 1
      }

      const next: PlayerState = {
        ...prev,
        cash: newCash,
        totalDebt: newDebt,
        currentMonth: newMonth,
        age: newAge,
        propertiesOwned: updatedProperties,
        portfolio: updatedPortfolio,
        ownedBusiness: updatedBusiness,
      }
      return next
    })

    setMonthsElapsed((m) => m + 1)

    // Log the ledger result
    addLog(
      `Monthly ledger settled. Net cash flow of ${
        monthlyNet >= 0 ? '+' : ''
      }${Math.round(monthlyNet).toLocaleString('en-US')}.`,
      monthlyNet >= 0 ? 'positive' : 'negative',
      { month: player.currentMonth, age: player.age },
    )

    // Trigger a random life event after settling the ledger
    // Filter events by net worth unlock
    const eligibleEvents = LIFE_EVENTS.filter((evt) => {
      if (!evt.minNetWorth) return true // Always eligible
      return netWorth >= evt.minNetWorth
    })
    
    if (eligibleEvents.length > 0) {
      const evt = eligibleEvents[Math.floor(Math.random() * eligibleEvents.length)]
      setActiveEvent(evt)
    }
  }, [activeEvent, gameOver, addLog, monthlyNet, player.currentMonth, player.age, netWorth])

  const resolveEvent = useCallback(
    (choice: EventChoice) => {
      setPlayer((prev) => {
        let cash = prev.cash
        let debt = prev.totalDebt
        let score = prev.creditScore
        let happiness = prev.happiness
        let hitDebt = false
        let portfolio = prev.portfolio

        // Direct debt adjustments (e.g. payment plan, paying down debt).
        if (choice.debt) {
          debt = Math.max(0, debt + choice.debt)
        }
        if (choice.creditScore) {
          score += choice.creditScore
        }
        if (choice.happiness) {
          happiness += choice.happiness
        }

        // Portfolio impact (for market events)
        if (choice.portfolioImpact) {
          portfolio = {
            ...prev.portfolio,
            indexFundsValue: Math.round(prev.portfolio.indexFundsValue * choice.portfolioImpact),
            stocksValue: Math.round(prev.portfolio.stocksValue * choice.portfolioImpact),
            bondsValue: Math.round(prev.portfolio.bondsValue * choice.portfolioImpact),
          }
        }

        // Cash adjustments. If a cost can't be afforded out of pocket and the
        // choice allows it, push the shortfall to debt and penalize credit.
        if (choice.cash) {
          const proposed = cash + choice.cash
          if (proposed < 0 && choice.canGoToDebt) {
            const shortfall = Math.abs(proposed)
            cash = 0
            debt += shortfall
            score -= CREDIT_PENALTY_ON_DEBT
            happiness -= 8 // falling into debt is stressful
            hitDebt = true
          } else {
            cash = proposed
          }
        }

        // Marriage flag for the proposal event.
        const isMarried =
          choice.label.toLowerCase().includes('yes') ||
          choice.label.toLowerCase().includes('elope')
            ? true
            : prev.isMarried

        // Pet flag for the adoption event.
        const hasPet = choice.label.toLowerCase().includes('adopt the pup')
          ? true
          : prev.hasPet

        const snapshot = { month: prev.currentMonth, age: prev.age }
        // Build a readable log line.
        const parts: string[] = [choice.label]
        if (hitDebt) {
          parts.push(
            `— couldn't cover it in cash, so the shortfall was added to debt and your credit score dropped ${CREDIT_PENALTY_ON_DEBT} points.`,
          )
        }
        if (choice.portfolioImpact) {
          const impactPercent = Math.round((choice.portfolioImpact - 1) * 100)
          parts.push(
            `— your portfolio ${impactPercent >= 0 ? 'gained' : 'lost'} ${Math.abs(impactPercent)}%.`,
          )
        }
        setTimeout(
          () =>
            addLog(
              parts.join(' '),
              hitDebt || (choice.cash ?? 0) < 0 ? 'negative' : choice.portfolioImpact && choice.portfolioImpact < 1 ? 'negative' : 'positive',
              snapshot,
            ),
          0,
        )

        return {
          ...prev,
          cash,
          totalDebt: debt,
          creditScore: clampScore(score),
          happiness: clampHappiness(happiness),
          isMarried,
          hasPet,
          portfolio,
        }
      })

      setActiveEvent(null)

      // Check for game over conditions after resolving.
      setPlayer((p) => {
        if (
          p.creditScore <= 320 ||
          p.totalDebt > 120000 ||
          p.happiness <= 0
        ) {
          setGameOver(true)
        }
        if (p.age >= 65) {
          setGameOver(true)
        }
        return p
      })
    },
    [addLog],
  )

  const relocate = useCallback(
    (cityName: string) => {
      setPlayer((prev) => {
        if (prev.currentCity === cityName) return prev
        if (prev.cash < RELOCATION_COST) return prev
        const snapshot = { month: prev.currentMonth, age: prev.age }
        setTimeout(
          () =>
            addLog(
              `Relocated to ${cityName} for a ${RELOCATION_COST.toLocaleString(
                'en-US',
              )} moving cost.`,
              'neutral',
              snapshot,
            ),
          0,
        )
        return {
          ...prev,
          currentCity: cityName,
          cash: prev.cash - RELOCATION_COST,
        }
      })
    },
    [addLog],
  )

  const buyProperty = useCallback(
    (cityName: string, financingOptionId: string) => {
      setPlayer((prev) => {
        const c = getCity(cityName)
        const financing = FINANCING_OPTIONS.find((f) => f.id === financingOptionId)
        if (!financing) return prev

        const downPayment = Math.round(c.avgProperty * financing.downPaymentPercent)
        if (prev.cash < downPayment) return prev

        // Calculate mortgage if not paying cash
        const mortgageAmount = c.avgProperty - downPayment
        const monthlyMortgagePayment =
          mortgageAmount > 0
            ? calculateMortgagePayment(mortgageAmount, financing.mortgageRate)
            : 0

        const property: Property = {
          id: `prop_${cityName}_${prev.propertiesOwned.length + 1}_${Date.now()}`,
          city: cityName,
          purchasePrice: c.avgProperty,
          currentMarketValue: c.avgProperty,
          monthlyRent: c.avgRent,
          boughtOnMonth: prev.currentMonth,
          mortgageRemaining: mortgageAmount,
          mortgageRate: financing.mortgageRate,
          monthlyMortgagePayment,
          maintenanceReserve: Math.round(
            (c.avgProperty * MAINTENANCE_COST_PERCENT) / 12,
          ),
          occupancyRate: 0.95,
          conditionDegradation: 0,
          condition: 'excellent',
          propertyType: 'residential',
        }

        const snapshot = { month: prev.currentMonth, age: prev.age }
        const financingLabel =
          financing.id === 'cash'
            ? 'cash'
            : financing.id === 'traditional'
              ? `${financing.downPaymentPercent * 100}% down mortgage`
              : `${financing.downPaymentPercent * 100}% down mortgage`

        setTimeout(
          () =>
            addLog(
              `Bought a rental in ${cityName} with ${financingLabel} (${downPayment.toLocaleString(
                'en-US',
              )} down). It generates ${c.avgRent.toLocaleString(
                'en-US',
              )}/mo in rent (before maintenance).`,
              'positive',
              snapshot,
            ),
          0,
        )

        return {
          ...prev,
          cash: prev.cash - downPayment,
          propertiesOwned: [...prev.propertiesOwned, property],
        }
      })
    },
    [addLog],
  )

  const sellProperty = useCallback(
    (propertyId: string) => {
      setPlayer((prev) => {
        const property = prev.propertiesOwned.find((p) => p.id === propertyId)
        if (!property) return prev

        const proceeds = calculateSellProceeds(property)
        const snapshot = { month: prev.currentMonth, age: prev.age }

        // Calculate gain/loss
        const originalDownPayment = property.purchasePrice * 0.2
        const gain = proceeds - originalDownPayment

        setTimeout(
          () =>
            addLog(
              `Sold your ${property.city} rental for ${proceeds.toLocaleString(
                'en-US',
              )} (gain: ${gain >= 0 ? '+' : ''}${gain.toLocaleString(
                'en-US',
              )}). Lost ${property.monthlyRent.toLocaleString(
                'en-US',
              )}/mo rental income.`,
              gain >= 0 ? 'positive' : 'negative',
              snapshot,
            ),
          0,
        )

        return {
          ...prev,
          cash: prev.cash + proceeds,
          propertiesOwned: prev.propertiesOwned.filter(
            (p) => p.id !== propertyId,
          ),
        }
      })
    },
    [addLog],
  )

  const resetGame = useCallback(() => {
    setPlayer(INITIAL_PLAYER)
    setStarted(false)
    setGameOver(false)
    setActiveEvent(null)
    setLog([])
    logIdRef.current = 1
    setMonthsElapsed(0)
  }, [])

  const value = useMemo<GameContextValue>(
    () => ({
      player,
      netWorth,
      monthlyIncome,
      monthlyRentIncome,
      monthlyExpenses,
      monthlyNet,
      monthlyMortgagePayment,
      monthlyMaintenanceExpense,
      monthlyBusinessIncome,
      monthlyInvestmentIncome,
      portfolioValue,
      unlockedCommercial,
      unlockedStockMarket,
      unlockedBusiness,
      activeEvent,
      gameOver,
      log,
      started,
      monthsElapsed,
      startGame,
      advanceMonth,
      resolveEvent,
      relocate,
      buyProperty,
      sellProperty,
      resetGame,
    }),
    [
      player,
      netWorth,
      monthlyIncome,
      monthlyRentIncome,
      monthlyExpenses,
      monthlyNet,
      monthlyMortgagePayment,
      monthlyMaintenanceExpense,
      monthlyBusinessIncome,
      monthlyInvestmentIncome,
      portfolioValue,
      unlockedCommercial,
      unlockedStockMarket,
      unlockedBusiness,
      activeEvent,
      gameOver,
      log,
      started,
      monthsElapsed,
      startGame,
      advanceMonth,
      resolveEvent,
      relocate,
      buyProperty,
      sellProperty,
      resetGame,
    ],
  )

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

export function useGame() {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be used within a GameProvider')
  return ctx
}

export { CITIES }
