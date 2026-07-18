'use client'

import { MapPin, Home, Coins, Plane, CheckCircle2 } from 'lucide-react'
import { CITIES, FINANCING_OPTIONS, useGame } from '@/components/game-provider'
import {
  formatMoney,
  type City,
} from '@/lib/game-data'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useState } from 'react'

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
            onBuy={buyProperty}
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
  onBuy: (cityName: string, financingOptionId: string) => void
}) {
  const [showFinancingOptions, setShowFinancingOptions] = useState(false)

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

      <p className="mt-2 text-xs text-muted-foreground">
        Growth: +{(city.appreciationRate * 12 * 100).toFixed(1)}%/year
      </p>

      <div className="mt-5 flex-1" />

      {isHere ? (
        <div>
          {!showFinancingOptions ? (
            <Button
              className="w-full"
              onClick={() => setShowFinancingOptions(true)}
              disabled={!FINANCING_OPTIONS.some(
                (f) => cash >= city.avgProperty * f.downPaymentPercent,
              )}
            >
              <Coins className="size-4" />
              Buy Rental Property
            </Button>
          ) : (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                Choose financing:
              </p>
              {FINANCING_OPTIONS.map((option) => {
                const downPayment = Math.round(
                  city.avgProperty * option.downPaymentPercent,
                )
                const canAfford = cash >= downPayment
                return (
                  <button
                    key={option.id}
                    onClick={() => {
                      onBuy(city.name, option.id)
                      setShowFinancingOptions(false)
                    }}
                    disabled={!canAfford}
                    className={`w-full rounded-lg border p-2 text-left text-xs transition-colors ${
                      canAfford
                        ? 'border-border bg-secondary/60 hover:bg-secondary'
                        : 'border-border/50 bg-muted/50 opacity-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{option.label}</span>
                      <span className="font-mono text-primary">
                        {formatMoney(downPayment)} down
                      </span>
                    </div>
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      {option.description}
                    </p>
                  </button>
                )
              })}
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                onClick={() => setShowFinancingOptions(false)}
              >
                Cancel
              </Button>
            </div>
          )}
          {!showFinancingOptions &&
            !FINANCING_OPTIONS.some(
              (f) => cash >= city.avgProperty * f.downPaymentPercent,
            ) && (
              <p className="mt-2 text-center text-xs text-destructive">
                Not enough cash for any down payment option.
              </p>
            )}
        </div>
      ) : (
        <div>
          <Button
            variant="outline"
            className="w-full"
            onClick={onRelocate}
            disabled={cash < 2000}
          >
            <Plane className="size-4" />
            Relocate (Costs {formatMoney(2000)})
          </Button>
          {cash < 2000 && (
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
