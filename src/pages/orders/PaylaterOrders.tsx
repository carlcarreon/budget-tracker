import { useEffect, useMemo, useState } from "react"
import {
  CreditCard,
  MoreVertical,
  Plus,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/lib/auth"
import type { PayLaterRecord } from "@/lib/localDb"
import { supabase } from "@/utils/supabase"

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)

const mapPaylaterRow = (
  row: Record<string, unknown>,
): PayLaterRecord => ({
  id: Number(row.id),
  name: String(row.name ?? ""),
  months: Number(row.months ?? 0),
  monthlyPayment: Number(
    row.monthly_payment ?? 0,
  ),
  totalAmount: Number(
    row.total_amount ?? 0,
  ),
  imageUrl:
    row.image_url == null
      ? undefined
      : String(row.image_url),
})

function PaylaterOrders() {
  const { user } = useAuth()

  const [paylaters, setPaylaters] =
    useState<PayLaterRecord[]>([])

  const [isLoading, setIsLoading] =
    useState(true)

  const totalAmount = useMemo(
    () =>
      paylaters.reduce(
        (sum, paylater) =>
          sum + paylater.totalAmount,
        0,
      ),
    [paylaters],
  )

  const monthlyAmount = useMemo(
    () =>
      paylaters.reduce(
        (sum, paylater) =>
          sum + paylater.monthlyPayment,
        0,
      ),
    [paylaters],
  )

  useEffect(() => {
    let active = true

    const loadPaylaters = async () => {
      if (!user) {
        if (active) {
          setPaylaters([])
          setIsLoading(false)
        }

        return
      }

      setIsLoading(true)

      const { data, error } = await supabase
        .from("paylaters")
        .select("*")
        .eq("user_id", user.id)
        .order("id", { ascending: true })

      if (error) {
        console.error(
          "Failed to fetch PayLater:",
          error,
        )

        if (active) {
          setPaylaters([])
          setIsLoading(false)
        }

        return
      }

      if (active) {
        setPaylaters(
          (data ?? []).map((row) =>
            mapPaylaterRow(
              row as Record<string, unknown>,
            ),
          ),
        )

        setIsLoading(false)
      }
    }

    void loadPaylaters()

    return () => {
      active = false
    }
  }, [user])

  return (
    <div className="space-y-5">
      {/* SUMMARY */}
      <Card>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                PayLater Balance
              </p>

              <p className="text-2xl font-semibold tracking-tight text-slate-900">
                Loading...
              </p>
            </div>
          ) : (
            <div className="flex w-full items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  PayLater Balance
                </p>

                <p className="text-2xl font-semibold tracking-tight text-slate-900">
                  {formatCurrency(totalAmount)}
                </p>

                <p className="text-xs text-muted-foreground">
                  {paylaters.length > 0
                    ? `${formatCurrency(
                        monthlyAmount,
                      )} monthly · ${
                        paylaters.length
                      } ${
                        paylaters.length === 1
                          ? "plan"
                          : "plans"
                      }`
                    : "No active PayLater plans"}
                </p>
              </div>

              <div className="rounded-lg bg-rose-50 p-3 text-rose-500">
                <CreditCard className="h-5 w-5" />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* PAYLATER LIST */}
      <Card className="p-0">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="px-4 py-8 text-center">
              <p className="text-sm font-medium text-slate-900">
                Loading PayLater...
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Fetching your PayLater plans.
              </p>
            </div>
          ) : paylaters.length > 0 ? (
            paylaters.map(
              (paylater, index, items) => (
                <div
                  key={
                    paylater.id ??
                    `${paylater.name}-${index}`
                  }
                >
                  <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 p-4">
                    {/* IMAGE */}
                    <div className="size-17 shrink-0 overflow-hidden rounded-md border border-dashed border-rose-200 bg-rose-50">
                      {paylater.imageUrl ? (
                        <img
                          src={paylater.imageUrl}
                          alt={paylater.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-rose-400">
                          <CreditCard className="h-6 w-6" />
                        </div>
                      )}
                    </div>

                    {/* INFORMATION */}
                    <div className="min-w-0 space-y-1">
                      <p className="truncate text-xs font-semibold text-slate-900">
                        {paylater.name}
                      </p>

                      <p className="text-xl font-semibold tracking-tight text-slate-900">
                        {formatCurrency(
                          paylater.monthlyPayment,
                        )}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        per month ·{" "}
                        {paylater.months} months
                      </p>

                      <p className="text-xs text-muted-foreground">
                        Total{" "}
                        {formatCurrency(
                          paylater.totalAmount,
                        )}
                      </p>
                    </div>

                    <button
                      type="button"
                      className="shrink-0"
                      aria-label="More actions"
                    >
                      <MoreVertical className="h-3 w-3 text-muted-foreground" />
                    </button>
                  </div>

                  {index <
                  items.length - 1 ? (
                    <Separator className="bg-slate-200" />
                  ) : null}
                </div>
              ),
            )
          ) : (
            <div className="px-4 py-6 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
                <CreditCard className="h-5 w-5" />
              </div>

              <p className="text-sm font-medium text-slate-900">
                No PayLater plans
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Add a PayLater plan to start
                tracking installments.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ADD PAYLATER */}
      <Button
        type="button"
        variant="outline"
        className="h-auto w-full flex-col items-center justify-center gap-1 rounded-2xl border-dashed py-2 hover:bg-slate-50"
      >
        <span className="grid size-8 place-items-center rounded-full bg-slate-100 text-slate-700">
          <Plus className="h-4 w-4" />
        </span>

        <span className="text-sm font-semibold text-slate-900">
          Add PayLater
        </span>

        <span className="text-xs text-muted-foreground">
          Track an installment plan
        </span>
      </Button>
    </div>
  )
}

export default PaylaterOrders
