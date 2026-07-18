'use client'

import {
  Heart,
  Wallet,
  Gauge,
  CalendarClock,
  TrendingUp,
  TrendingDown,
  Building2,
  Smile,
  Home,
  Zap,
} from 'lucide-react'
import { useGame } from '@/components/game-provider'
import {
  formatMoney,
  getJob,
  happinessLabel,
  MONTH_NAMES,
  calculatePropertyEquity,
  calculateSellProceeds,
  recommendedMaintenanceReserve,
  conditionLabel,
} from '@/lib/game-data'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

function scoreColor(score: number) {
  if (score >= 750) return 'text-[oklch(0.52_0.13_155)]'
  if (score >= 650) return 'text-[oklch(0.68_0.15_75)]'
  return 'text-destructive'
}

function scoreLabel(score: number) {
  if (score >= 750) return 'Excellent'
  if (score >= 650) return 'Fair'
  return 'Poor'
}

function happinessColor(h: number) {
  if (h >= 60) return 'text-[oklch(0.52_0.13_155)]'
  if (h >= 30) return 'text-[oklch(0.68_0.15_75)]'
  return 'text-destructive'
}

function happinessBar(h: number) {
  if (h >= 60) return '[&>div]:bg-[oklch(0.52_0.13_155)]'
  if (h >= 30) return '[&>div]:bg-[oklch(0.68_0.15_75)]'
  return '[&>div]:bg-destructive'
}

function conditionColor(condition: string) {
  switch (condition) {
    case 'excellent':
      return 'text-[oklch(0.52_0.13_155)]'
    case 'good':
      return 'text-[oklch(0.68_0.15_75)]'
    case 'fair':
      return 'text-[oklch(0.65_0.15_50)]'
    case 'poor':
      return 'text-destructive'
    default:
      return 'text-card-foreground'
  }
}

export function StatusPanel() {
  const {
    player,
    netWorth,
    monthlyIncome,
    monthlyRentIncome,
    monthlyExpenses,
    monthlyNet,
    monthlyMortgagePayment,
    monthlyMaintenanceExpense,
    sellProperty,
  } = useGame()

  const job = getJob(player.currentJobId)
  const premium = job && job.hasHealthBenefits ? job.monthlyPremium : 0
  const debtService = player.totalDebt * 0.01
  const grossIncome = monthlyIncome + monthlyRentIncome

  return (
    <aside className="flex flex-col gap-4">
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-card-foreground">
            Financial Ledger
          </h2>
          <Badge variant="secondary" className="font-mono text-xs">
            {MONTH_NAMES[player.currentMonth - 1]} · Age {player.age}
          </Badge>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <Stat
            icon={<Wallet className="size-4" />}
            label="Cash"
            value={formatMoney(player.cash)}
            valueClass={player.cash < 0 ? 'text-destructive' : ''}
          />
          <Stat
            icon={<Gauge className="size-4" />}
            label="Credit Score"
            value={String(player.creditScore)}
            valueClass={scoreColor(player.creditScore)}
            sub={scoreLabel(player.creditScore)}
          />
          <Stat
            icon={<CalendarClock className="size-4" />}
            label="Age"
            value={String(player.age)}
          />
          <Stat
            icon={<Heart className="size-4" />}
            label="Status"
            value={player.isMarried ? 'Married' : 'Single'}
            sub={player.hasPet ? 'Has a pet' : undefined}
          />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <Stat
            icon={<TrendingDown className="size-4" />}
            label="Total Debt"
            value={formatMoney(player.totalDebt)}
            valueClass="text-destructive"
          />
          <Stat
            icon={<TrendingUp className="size-4" />}
            label="Net Worth"
            value={formatMoney(netWorth)}
            valueClass={netWorth < 0 ? 'text-destructive' : 'text-primary'}
          />
        </div>

        {/* Happiness / wellbeing meter */}
        <div className="mt-4 rounded-xl bg-secondary/60 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Smile className="size-4" />
              <span className="text-xs">Happiness</span>
            </div>
            <span
              className={`font-mono text-sm font-semibold ${happinessColor(
                player.happiness,
              )}`}
            >
              {player.happiness}
              <span className="ml-1 text-[10px] font-normal text-muted-foreground">
                {happinessLabel(player.happiness)}
              </span>
            </span>
          </div>
          <Progress
            value={player.happiness}
            className={`mt-2 h-2 ${happinessBar(player.happiness)}`}
          />
          <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">
            Marriage and pets lift it; medical bills, scams and debt drag it
            down. Hit zero and you burn out.
          </p>
        </div>
      </div>

      {/* Expense breakdown */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h3 className="font-display text-sm font-semibold text-card-foreground">
          Monthly Cash Flow
        </h3>
        <dl className="mt-3 space-y-2 text-sm">
          <Row label={`Salary (${job?.title ?? 'No job'})`} value={monthlyIncome} positive />
          {monthlyRentIncome > 0 && (
            <Row label="Rental income" value={monthlyRentIncome} positive />
          )}
          <div className="my-2 border-t border-dashed border-border" />
          <Row
            label="Cost of living"
            value={-(monthlyExpenses - premium - debtService - monthlyMortgagePayment - monthlyMaintenanceExpense)}
          />
          {premium > 0 && <Row label="Health premium" value={-premium} />}
          {monthlyMortgagePayment > 0 && (
            <Row label="Mortgage payments" value={-monthlyMortgagePayment} />
          )}
          {monthlyMaintenanceExpense > 0 && (
            <Row label="Property maintenance" value={-monthlyMaintenanceExpense} />
          )}
          <Row label="Debt service (1%)" value={-debtService} />
          <div className="my-2 border-t border-border" />
          <div className="flex items-center justify-between">
            <dt className="font-medium text-card-foreground">Net / month</dt>
            <dd
              className={`font-mono font-semibold ${
                monthlyNet >= 0 ? 'text-primary' : 'text-destructive'
              }`}
            >
              {monthlyNet >= 0 ? '+' : ''}
              {formatMoney(monthlyNet)}
            </dd>
          </div>
        </dl>
        <p className="mt-3 text-xs text-muted-foreground">
          Gross income {formatMoney(grossIncome)}/mo
        </p>
      </div>

      {/* Portfolio */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <Building2 className="size-4 text-primary" />
          <h3 className="font-display text-sm font-semibold text-card-foreground">
            Property Portfolio
          </h3>
          {player.propertiesOwned.length > 0 && (
            <Badge variant="secondary" className="ml-auto text-xs">
              {player.propertiesOwned.length}
            </Badge>
          )}
        </div>
        {player.propertiesOwned.length === 0 ? (
          <p className="mt-2 text-xs text-muted-foreground">
            No properties yet. Buy a rental from the map to build passive income.
          </p>
        ) : (
          <ul className="mt-3 space-y-3">
            {player.propertiesOwned.map((p) => {
              const equity = calculatePropertyEquity(p)
              const proceeds = calculateSellProceeds(p)
              const gain = proceeds - (p.purchasePrice * 0.2)
              const recommended = recommendedMaintenanceReserve(p)

              return (
                <li
                  key={p.id}
                  className="rounded-lg border border-border/50 bg-secondary/40 p-3 text-xs"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-secondary-foreground">
                          {p.city}
                        </span>
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${conditionColor(p.condition)}`}
                        >
                          {conditionLabel(p.condition)}
                        </Badge>
                      </div>
                      <div className="mt-2 space-y-1 text-[10px] text-muted-foreground">
                        <div className="flex items-center justify-between">
                          <span>Value:</span>
                          <span className="font-mono text-secondary-foreground">
                            {formatMoney(p.currentMarketValue)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Equity:</span>
                          <span className="font-mono text-primary">
                            {formatMoney(equity)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Occupancy:</span>
                          <span className="font-mono">
                            {(p.occupancyRate * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Actual rent:</span>
                          <span className="font-mono text-primary">
                            +{formatMoney(p.monthlyRent * p.occupancyRate)}/mo
                          </span>
                        </div>
                        {p.mortgageRemaining > 0 && (
                          <>
                            <div className="my-1 border-t border-border/30" />
                            <div className="flex items-center justify-between">
                              <span>Mortgage remaining:</span>
                              <span className="font-mono text-destructive">
                                {formatMoney(p.mortgageRemaining)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Monthly payment:</span>
                              <span className="font-mono">
                                {formatMoney(p.monthlyMortgagePayment)}/mo
                              </span>
                            </div>
                          </>
                        )}
                        {p.maintenanceReserve > 0 && (
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1">
                              <Zap className="size-3" /> Maintenance:
                            </span>
                            <span
                              className={`font-mono ${
                                p.maintenanceReserve >= recommended
                                  ? 'text-primary'
                                  : 'text-destructive'
                              }`}
                            >
                              {formatMoney(p.maintenanceReserve)}/mo
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={() => sellProperty(p.id)}
                    >
                      Sell {proceeds > 0 && `for ${formatMoney(proceeds)}`}
                    </Button>
                    {gain > 0 && (
                      <div className="flex items-center justify-center rounded bg-primary/10 px-2 py-1 text-[10px] font-medium text-primary">
                        +{formatMoney(gain)}
                      </div>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </aside>
  )
}

function Stat({
  icon,
  label,
  value,
  valueClass = '',
  sub,
}: {
  icon: React.ReactNode
  label: string
  value: string
  valueClass?: string
  sub?: string
}) {
  return (
    <div className="rounded-xl bg-secondary/60 p-3">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className={`mt-1 font-mono text-lg font-semibold leading-none ${valueClass}`}>
        {value}
      </p>
      {sub && <p className="mt-1 text-[10px] text-muted-foreground">{sub}</p>}
    </div>
  )
}

function Row({
  label,
  value,
  positive = false,
  hidden = false,
}: {
  label: string
  value: number
  positive?: boolean
  hidden?: boolean
}) {
  if (hidden) return null
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd
        className={`font-mono ${
          positive ? 'text-primary' : value < 0 ? 'text-destructive' : 'text-card-foreground'
        }`}
      >
        {positive ? '+' : ''}
        {formatMoney(value)}
      </dd>
    </div>
  )
}
