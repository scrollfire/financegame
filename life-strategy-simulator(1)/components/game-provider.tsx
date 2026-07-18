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
  DOWN_PAYMENT_RATE,
  INITIAL_PLAYER,
  LIFE_EVENTS,
  RELOCATION_COST,
  SALE_PAYOUT_RATE,
  getCity,
  getJob,
  type EventChoice,
  type LifeEvent,
  type PlayerState,
  type Property,
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
  activeEvent: LifeEvent | null
  gameOver: boolean
  log: LogEntry[]
  started: boolean
  monthsElapsed: number
  startGame: (jobId: string) => void
  advanceMonth: () => void
  resolveEvent: (choice: EventChoice) => void
  relocate: (cityName: string) => void
  buyProperty: (cityName: string) => void
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
    (sum, p) => sum + p.monthlyRent,
    0,
  )
  const premium = job && job.hasHealthBenefits ? job.monthlyPremium : 0
  const debtService = player.totalDebt * DEBT_MONTHLY_RATE
  const monthlyExpenses = city.costOfLiving + premium + debtService
  const monthlyNet =
    monthlyIncome + monthlyRentIncome - monthlyExpenses
  // Net worth counts the equity you hold in each property (your down payment),
  // not the full sticker price, so buying and selling stay coherent.
  const netWorth =
    player.cash +
    player.propertiesOwned.reduce(
      (s, p) => s + p.purchasePrice * DOWN_PAYMENT_RATE,
      0,
    ) -
    player.totalDebt

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
      const income = j ? j.salary / 12 : 0
      const rent = prev.propertiesOwned.reduce((s, p) => s + p.monthlyRent, 0)
      const prem = j && j.hasHealthBenefits ? j.monthlyPremium : 0
      const debtPay = prev.totalDebt * DEBT_MONTHLY_RATE
      const net = income + rent - c.costOfLiving - prem - debtPay

      const newCash = prev.cash + net
      // Debt shrinks slightly by the portion of the 1% payment beyond interest.
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
      }
      return next
    })

    setMonthsElapsed((m) => m + 1)

    // Log the ledger result using the freshly computed net.
    addLog(
      `Monthly ledger settled. Net cash flow of ${
        monthlyNet >= 0 ? '+' : ''
      }${Math.round(monthlyNet).toLocaleString('en-US')}.`,
      monthlyNet >= 0 ? 'positive' : 'negative',
      { month: player.currentMonth, age: player.age },
    )

    // Trigger a random life event after settling the ledger.
    const evt = LIFE_EVENTS[Math.floor(Math.random() * LIFE_EVENTS.length)]
    setActiveEvent(evt)
  }, [activeEvent, gameOver, addLog, monthlyNet, player.currentMonth, player.age])

  const resolveEvent = useCallback(
    (choice: EventChoice) => {
      setPlayer((prev) => {
        let cash = prev.cash
        let debt = prev.totalDebt
        let score = prev.creditScore
        let happiness = prev.happiness
        let hitDebt = false

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
        setTimeout(
          () =>
            addLog(
              parts.join(' '),
              hitDebt || (choice.cash ?? 0) < 0 ? 'negative' : 'positive',
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
    (cityName: string) => {
      setPlayer((prev) => {
        const c = getCity(cityName)
        const downPayment = Math.round(c.avgProperty * DOWN_PAYMENT_RATE)
        if (prev.cash < downPayment) return prev
        const property: Property = {
          id: `prop_${cityName}_${prev.propertiesOwned.length + 1}_${Date.now()}`,
          city: cityName,
          purchasePrice: c.avgProperty,
          monthlyRent: c.avgRent,
          boughtOnMonth: prev.currentMonth,
        }
        const snapshot = { month: prev.currentMonth, age: prev.age }
        setTimeout(
          () =>
            addLog(
              `Bought a rental in ${cityName} with a ${downPayment.toLocaleString(
                'en-US',
              )} down payment. It now pays ${c.avgRent.toLocaleString(
                'en-US',
              )}/mo in rent.`,
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
        const equity = property.purchasePrice * DOWN_PAYMENT_RATE
        const payout = Math.round(equity * SALE_PAYOUT_RATE)
        const snapshot = { month: prev.currentMonth, age: prev.age }
        setTimeout(
          () =>
            addLog(
              `Sold your ${property.city} rental for a ${payout.toLocaleString(
                'en-US',
              )} payout. That's ${property.monthlyRent.toLocaleString(
                'en-US',
              )}/mo of rent gone.`,
              'neutral',
              snapshot,
            ),
          0,
        )
        return {
          ...prev,
          cash: prev.cash + payout,
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
