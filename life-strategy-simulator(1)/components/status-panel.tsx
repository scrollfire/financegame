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
} from 'lucide-react'
import { useGame } from '@/components/game-provider'
import { formatMoney, getJob, happinessLabel, MONTH_NAMES } from '@/lib/game-data'
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

export function StatusPanel() {
  const {
    player,
    netWorth,
    monthlyIncome,
    monthlyRentIncome,
    monthlyExpenses,
    monthlyNet,
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
            value={-(monthlyExpenses - premium - debtService)}
          />
          {premium > 0 && <Row label="Health premium" value={-premium} />}
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
        </div>
        {player.propertiesOwned.length === 0 ? (
          <p className="mt-2 text-xs text-muted-foreground">
            No properties yet. Buy a rental from the map to build passive income.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {player.propertiesOwned.map((p) => {
              const payout = Math.round(p.purchasePrice * 0.2 * 1.05)
              return (
                <li
                  key={p.id}
                  className="rounded-lg bg-secondary px-3 py-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-secondary-foreground">
                      {p.city}
                    </span>
                    <span className="font-mono text-primary">
                      +{formatMoney(p.monthlyRent)}/mo
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 h-7 w-full text-xs"
                    onClick={() => sellProperty(p.id)}
                  >
                    Sell for {formatMoney(payout)}
                  </Button>
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
