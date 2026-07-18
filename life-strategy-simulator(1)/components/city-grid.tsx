'use client'

import { MapPin, Home, Coins, Plane, CheckCircle2 } from 'lucide-react'
import { CITIES, useGame } from '@/components/game-provider'
import {
  DOWN_PAYMENT_RATE,
  RELOCATION_COST,
  formatMoney,
  type City,
} from '@/lib/game-data'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function CityGrid() {
  const { player, relocate, buyProperty } = useGame()

  return (
    <section>
      <div className="mb-4 flex items-center gap-2">
        <MapPin className="size-5 text-primary" />
        <h2 className="font-display text-xl font-semibold text-foreground">
          The Map — Choose Your Market
        </h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {CITIES.map((city) => (
          <CityCard
            key={city.id}
            city={city}
            isHere={player.currentCity === city.name}
            cash={player.cash}
            ownedCount={
              player.propertiesOwned.filter((p) => p.city === city.name).length
            }
            onRelocate={() => relocate(city.name)}
            onBuy={() => buyProperty(city.name)}
          />
        ))}
      </div>
    </section>
  )
}

function CityCard({
  city,
  isHere,
  cash,
  ownedCount,
  onRelocate,
  onBuy,
}: {
  city: City
  isHere: boolean
  cash: number
  ownedCount: number
  onRelocate: () => void
  onBuy: () => void
}) {
  const downPayment = Math.round(city.avgProperty * DOWN_PAYMENT_RATE)
  const canRelocate = cash >= RELOCATION_COST
  const canBuy = cash >= downPayment

  return (
    <div
      className={`relative flex flex-col rounded-2xl border bg-card p-5 shadow-sm transition-colors ${
        isHere ? 'border-primary ring-1 ring-primary/40' : 'border-border'
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-display text-lg font-semibold text-card-foreground">
            {city.name}, {city.state}
          </h3>
          <p className="text-xs font-medium text-primary">{city.tagline}</p>
        </div>
        {isHere ? (
          <Badge className="gap-1 bg-primary text-primary-foreground">
            <CheckCircle2 className="size-3" /> You live here
          </Badge>
        ) : (
          ownedCount > 0 && (
            <Badge variant="secondary" className="gap-1">
              <Home className="size-3" /> {ownedCount}
            </Badge>
          )
        )}
      </div>

      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {city.vibe}
      </p>

      <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
        <EconStat label="Cost/mo" value={formatMoney(city.costOfLiving)} />
        <EconStat label="Home price" value={formatMoney(city.avgProperty)} />
        <EconStat label="Rent/mo" value={formatMoney(city.avgRent)} accent />
      </dl>

      <div className="mt-5 flex-1" />

      {isHere ? (
        <div>
          <Button
            className="w-full"
            onClick={onBuy}
            disabled={!canBuy}
          >
            <Coins className="size-4" />
            Buy Rental — {formatMoney(downPayment)} down
          </Button>
          {!canBuy && (
            <p className="mt-2 text-center text-xs text-destructive">
              Need {formatMoney(downPayment)} cash for the 20% down payment.
            </p>
          )}
        </div>
      ) : (
        <div>
          <Button
            variant="outline"
            className="w-full"
            onClick={onRelocate}
            disabled={!canRelocate}
          >
            <Plane className="size-4" />
            Relocate (Costs {formatMoney(RELOCATION_COST)})
          </Button>
          {!canRelocate && (
            <p className="mt-2 text-center text-xs text-destructive">
              Not enough cash to relocate.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

function EconStat({
  label,
  value,
  accent = false,
}: {
  label: string
  value: string
  accent?: boolean
}) {
  return (
    <div className="rounded-lg bg-secondary/60 px-2 py-2">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p
        className={`mt-0.5 font-mono text-sm font-semibold ${
          accent ? 'text-primary' : 'text-card-foreground'
        }`}
      >
        {value}
      </p>
    </div>
  )
}
