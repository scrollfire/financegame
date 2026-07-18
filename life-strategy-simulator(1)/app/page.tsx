'use client'

import { GameProvider, useGame } from '@/components/game-provider'
import { StartScreen } from '@/components/start-screen'
import { TopBar } from '@/components/top-bar'
import { StatusPanel } from '@/components/status-panel'
import { CityGrid } from '@/components/city-grid'
import { ActivityLog } from '@/components/activity-log'
import { EventModal } from '@/components/event-modal'
import { GameOver } from '@/components/game-over'

function GameShell() {
  const { started } = useGame()

  if (!started) {
    return <StartScreen />
  }

  return (
    <div className="min-h-screen">
      <TopBar />
      <main className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <StatusPanel />
          <div className="flex flex-col gap-6">
            <CityGrid />
            <ActivityLog />
          </div>
        </div>
      </main>
      <EventModal />
      <GameOver />
    </div>
  )
}

export default function Page() {
  return (
    <GameProvider>
      <GameShell />
    </GameProvider>
  )
}
