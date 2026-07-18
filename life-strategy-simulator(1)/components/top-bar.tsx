'use client'

import { ChevronRight, LineChart, RotateCcw } from 'lucide-react'
import { useGame } from '@/components/game-provider'
import { getJob, MONTH_NAMES } from '@/lib/game-data'
import { Button } from '@/components/ui/button'

export function TopBar() {
  const { player, advanceMonth, resetGame, activeEvent, gameOver, monthsElapsed } =
    useGame()
  const job = getJob(player.currentJobId)

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-6">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <LineChart className="size-5" />
          </div>
          <div>
            <h1 className="font-display text-lg font-bold leading-none text-foreground">
              Ledger Life
            </h1>
            <p className="text-xs text-muted-foreground">
              {job?.title} · {player.currentCity}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden rounded-lg bg-secondary px-3 py-1.5 text-xs sm:block">
            <span className="text-muted-foreground">Turn </span>
            <span className="font-mono font-semibold text-secondary-foreground">
              {monthsElapsed}
            </span>
            <span className="text-muted-foreground">
              {' '}
              · {MONTH_NAMES[player.currentMonth - 1]} @ age {player.age}
            </span>
          </div>
          <Button variant="ghost" size="sm" onClick={resetGame} aria-label="Restart game">
            <RotateCcw className="size-4" />
          </Button>
          <Button
            onClick={advanceMonth}
            disabled={!!activeEvent || gameOver}
            className="gap-1"
          >
            Next Month
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}
