'use client'

import { ScrollText } from 'lucide-react'
import { useGame } from '@/components/game-provider'
import { MONTH_NAMES } from '@/lib/game-data'

export function ActivityLog() {
  const { log } = useGame()

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <ScrollText className="size-4 text-primary" />
        <h3 className="font-display text-sm font-semibold text-card-foreground">
          Life Journal
        </h3>
      </div>
      {log.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          Your story starts here. Advance a month to begin writing history.
        </p>
      ) : (
        <ul className="max-h-64 space-y-2 overflow-y-auto pr-1">
          {log.map((entry) => (
            <li key={entry.id} className="flex gap-3 text-xs">
              <span className="shrink-0 font-mono text-muted-foreground">
                {MONTH_NAMES[entry.month - 1]} · {entry.age}
              </span>
              <span
                className={
                  entry.tone === 'positive'
                    ? 'text-primary'
                    : entry.tone === 'negative'
                      ? 'text-destructive'
                      : 'text-card-foreground'
                }
              >
                {entry.text}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
