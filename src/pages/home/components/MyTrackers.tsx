import {
  ClipboardList,
  CreditCard,
  PiggyBank,
  ShoppingBag,
} from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"

type MyTrackersProps = {
  orderCount: number
  paylaterCount: number
  todayNet: number
  savings: number
  formatCurrency: (value: number) => string
  formatSignedCurrency: (value: number) => string
}

export function MyTrackers({
  orderCount,
  paylaterCount,
  todayNet,
  savings,
  formatCurrency,
  formatSignedCurrency,
}: MyTrackersProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-900">
          My Trackers
        </h2>

        <button
          type="button"
          className="text-xs font-medium text-blue-600 hover:text-blue-700"
        >
          View All
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* ORDERS */}
        <Card className="border-slate-200 bg-white py-2 shadow-sm">
          <CardContent className="space-y-2 px-2">
            <div className="flex items-center gap-2">
              <div className="rounded-2xl bg-blue-500/10 p-2 text-blue-600">
                <ShoppingBag className="h-4 w-4" />
              </div>

              <p className="text-md font-semibold text-slate-900">
                Orders
              </p>
            </div>

            <div className="flex min-h-[70px] items-center justify-center">
              <p className="text-3xl font-bold tracking-tight text-blue-600">
                {orderCount}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* PAYLATER */}
        <Card className="border-slate-200 bg-white py-2 shadow-sm">
          <CardContent className="space-y-2 px-2">
            <div className="flex items-center gap-2">
              <div className="rounded-2xl bg-rose-500/10 p-2 text-rose-500">
                <CreditCard className="h-4 w-4" />
              </div>

              <p className="text-md font-semibold text-slate-900">
                PayLater
              </p>
            </div>

            <div className="flex min-h-[70px] items-center justify-center">
              <p className="text-3xl font-bold tracking-tight text-rose-500">
                {paylaterCount}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* TODAY */}
        <Card className="border-slate-200 bg-white py-2 shadow-sm">
          <CardContent className="space-y-2 px-2">
            <div className="flex items-center gap-2">
              <div className="rounded-2xl bg-emerald-500/10 p-2 text-emerald-600">
                <ClipboardList className="h-4 w-4" />
              </div>

              <p className="text-md font-semibold text-slate-900">
                Today
              </p>
            </div>

            <div className="flex min-h-[70px] items-center justify-center">
              <p
                className={`text-3xl font-bold tracking-tight ${
                  todayNet > 0
                    ? "text-emerald-600"
                    : todayNet < 0
                      ? "text-rose-500"
                      : "text-slate-900"
                }`}
              >
                {formatSignedCurrency(todayNet)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* SAVINGS */}
        <Card className="border-slate-200 bg-white py-2 shadow-sm">
          <CardContent className="space-y-2 px-2">
            <div className="flex items-center gap-2">
              <div className="rounded-2xl bg-violet-500/10 p-2 text-violet-600">
                <PiggyBank className="h-4 w-4" />
              </div>

              <p className="text-md font-semibold text-slate-900">
                Savings
              </p>
            </div>

            <div className="flex min-h-[70px] items-center justify-center">
              <p className="text-3xl font-bold tracking-tight text-violet-600">
                {formatCurrency(savings)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}