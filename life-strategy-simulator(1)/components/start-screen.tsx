'use client'

import { useState } from 'react'
import { LineChart, ShieldCheck, ShieldOff, Check } from 'lucide-react'
import { useGame } from '@/components/game-provider'
import { JOBS, formatMoney } from '@/lib/game-data'
import { Button } from '@/components/ui/button'

export function StartScreen() {
  const { startGame } = useGame()
  const [selected, setSelected] = useState<string | null>(null)

  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-4 py-10">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
        <LineChart className="size-7" />
      </div>
      <h1 className="mt-4 text-balance text-center font-display text-4xl font-bold tracking-tight text-foreground">
        Ledger Life
      </h1>
      <p className="mt-3 max-w-md text-pretty text-center leading-relaxed text-muted-foreground">
        You&apos;re 22 with {formatMoney(5000)} in the bank and{' '}
        {formatMoney(35000)} in student debt. Pick a career, move between cities,
        buy rentals, and survive whatever life throws at you. Every choice hits
        your ledger.
      </p>

      <div className="mt-8 w-full">
        <h2 className="mb-3 text-center font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Choose your starting career
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {JOBS.map((job) => {
            const isSelected = selected === job.id
            return (
              <button
                key={job.id}
                onClick={() => setSelected(job.id)}
                className={`relative flex flex-col rounded-2xl border bg-card p-4 text-left transition-colors ${
                  isSelected
                    ? 'border-primary ring-1 ring-primary/40'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                {isSelected && (
                  <span className="absolute right-3 top-3 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="size-3" />
                  </span>
                )}
                <span className="font-display text-base font-semibold text-card-foreground">
                  {job.title}
                </span>
                <span className="mt-0.5 font-mono text-sm text-primary">
                  {formatMoney(job.salary)}/yr
                </span>
                <span className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {job.blurb}
                </span>
                <span className="mt-3 flex items-center gap-1.5 text-xs">
                  {job.hasHealthBenefits ? (
                    <>
                      <ShieldCheck className="size-3.5 text-primary" />
                      <span className="text-muted-foreground">
                        Health benefits · {formatMoney(job.monthlyPremium)}/mo
                        premium
                      </span>
                    </>
                  ) : (
                    <>
                      <ShieldOff className="size-3.5 text-destructive" />
                      <span className="text-muted-foreground">
                        No safety net — you cover your own risk
                      </span>
                    </>
                  )}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <Button
        size="lg"
        className="mt-8"
        disabled={!selected}
        onClick={() => selected && startGame(selected)}
      >
        Start Your Life
      </Button>
    </div>
  )
}
