'use client'

import { Trophy, RotateCcw } from 'lucide-react'
import { useGame } from '@/components/game-provider'
import { formatMoney } from '@/lib/game-data'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

export function GameOver() {
  const { gameOver, player, netWorth, resetGame } = useGame()

  const bankrupt = player.creditScore <= 320 || player.totalDebt > 120000
  const burnedOut = player.happiness <= 0
  const title = burnedOut
    ? 'Burned Out'
    : bankrupt
      ? 'Financial Ruin'
      : 'A Life Well Lived'
  const message = burnedOut
    ? 'You chased the money but ran your happiness into the ground. Wealth means little without wellbeing — time to reset and find balance.'
    : bankrupt
      ? 'Your debt spiraled and your credit collapsed. The game is over — but every simulation is a lesson.'
      : `You made it to age ${player.age} with a net worth of ${formatMoney(
          netWorth,
        )} and your happiness intact. Well played.`

  return (
    <Dialog open={gameOver}>
      <DialogContent showCloseButton={false} className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-2 flex size-14 items-center justify-center rounded-2xl bg-secondary">
            <Trophy className="size-7 text-accent" />
          </div>
          <DialogTitle className="text-center font-display text-2xl">
            {title}
          </DialogTitle>
          <DialogDescription className="text-center leading-relaxed">
            {message}
          </DialogDescription>
        </DialogHeader>

        <div className="my-2 grid grid-cols-2 gap-2 text-center">
          <Summary label="Net Worth" value={formatMoney(netWorth)} />
          <Summary label="Credit" value={String(player.creditScore)} />
          <Summary label="Happiness" value={String(player.happiness)} />
          <Summary label="Properties" value={String(player.propertiesOwned.length)} />
        </div>

        <Button onClick={resetGame} className="w-full">
          <RotateCcw className="size-4" />
          Play Again
        </Button>
      </DialogContent>
    </Dialog>
  )
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-secondary/60 p-3">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-mono text-sm font-semibold text-card-foreground">
        {value}
      </p>
    </div>
  )
}
