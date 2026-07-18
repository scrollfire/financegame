'use client'

import { useGame } from '@/components/game-provider'
import { formatMoney, type EventChoice } from '@/lib/game-data'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

type Hint = { text: string; tone: string }

function choiceHints(choice: EventChoice): Hint[] {
  const hints: Hint[] = []
  const bits: string[] = []
  if (choice.cash) bits.push(`${choice.cash > 0 ? '+' : ''}${formatMoney(choice.cash)} cash`)
  if (choice.debt) bits.push(`${choice.debt > 0 ? '+' : ''}${formatMoney(choice.debt)} debt`)
  if (choice.creditScore)
    bits.push(`${choice.creditScore > 0 ? '+' : ''}${choice.creditScore} credit`)
  if (bits.length > 0) {
    const negative =
      (choice.cash ?? 0) < 0 || (choice.debt ?? 0) > 0 || (choice.creditScore ?? 0) < 0
    hints.push({ text: bits.join(' · '), tone: negative ? 'text-destructive' : 'text-primary' })
  }
  if (choice.happiness) {
    hints.push({
      text: `${choice.happiness > 0 ? '+' : ''}${choice.happiness} happiness`,
      tone:
        choice.happiness > 0
          ? 'text-[oklch(0.52_0.13_155)]'
          : 'text-[oklch(0.68_0.15_75)]',
    })
  }
  return hints
}

export function EventModal() {
  const { activeEvent, resolveEvent, player } = useGame()

  return (
    <Dialog open={!!activeEvent}>
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        {activeEvent && (
          <>
            <DialogHeader>
              <div className="mx-auto mb-2 flex size-14 items-center justify-center rounded-2xl bg-secondary text-3xl">
                <span aria-hidden>{activeEvent.emoji}</span>
              </div>
              <DialogTitle className="text-center font-display text-xl">
                {activeEvent.title}
              </DialogTitle>
              <DialogDescription className="text-center leading-relaxed">
                {activeEvent.prompt}
              </DialogDescription>
            </DialogHeader>

            <div className="mt-2 flex flex-col gap-2">
              {activeEvent.choices.map((choice) => {
                const hints = choiceHints(choice)
                return (
                  <button
                    key={choice.label}
                    onClick={() => resolveEvent(choice)}
                    className="group flex w-full flex-col rounded-xl border border-border bg-card p-3 text-left transition-colors hover:border-primary hover:bg-secondary/50"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-medium text-card-foreground">
                        {choice.label}
                      </span>
                      {hints.length > 0 && (
                        <span className="flex shrink-0 flex-col items-end gap-0.5">
                          {hints.map((h) => (
                            <span
                              key={h.text}
                              className={`font-mono text-xs ${h.tone}`}
                            >
                              {h.text}
                            </span>
                          ))}
                        </span>
                      )}
                    </div>
                    <span className="mt-0.5 text-xs text-muted-foreground">
                      {choice.description}
                    </span>
                  </button>
                )
              })}
            </div>

            <p className="mt-1 text-center text-[11px] text-muted-foreground">
              You have {formatMoney(player.cash)} in cash. Costs you can&apos;t
              cover become debt and cost you 40 credit points.
            </p>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
