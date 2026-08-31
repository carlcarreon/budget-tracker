import { useEffect, useMemo, useState } from "react"
import {
  MoreVertical,
  Plus,
  ShoppingBag,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/lib/auth"
import type { OrderRecord } from "@/lib/localDb"
import { supabase } from "@/utils/supabase"

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)

const mapOrderRow = (
  row: Record<string, unknown>,
): OrderRecord => ({
  id: Number(row.id),
  name: String(row.name ?? ""),
  target: Number(row.target ?? 0),
  saved: Number(row.saved ?? 0),
  progress: Number(row.progress ?? 0),
  due: String(row.due ?? "N/A"),
  reserved:
    row.reserved == null
      ? undefined
      : Number(row.reserved),
  amount:
    row.amount == null
      ? undefined
      : Number(row.amount),
})

function Orders() {
  const { user } = useAuth()

  const [orders, setOrders] = useState<OrderRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const totalReserved = useMemo(
    () =>
      orders.reduce(
        (sum, order) =>
          sum +
          (order.amount ??
            order.reserved ??
            order.saved),
        0,
      ),
    [orders],
  )

  useEffect(() => {
    let active = true

    const loadOrders = async () => {
      if (!user) {
        if (active) {
          setOrders([])
          setIsLoading(false)
        }

        return
      }

      setIsLoading(true)

      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("id", { ascending: true })

      if (error) {
        console.error(
          "Failed to fetch orders:",
          error,
        )

        if (active) {
          setOrders([])
          setIsLoading(false)
        }

        return
      }

      if (active) {
        setOrders(
          (data ?? []).map((row) =>
            mapOrderRow(
              row as Record<string, unknown>,
            ),
          ),
        )

        setIsLoading(false)
      }
    }

    void loadOrders()

    return () => {
      active = false
    }
  }, [user])

  return (
    <div className="space-y-5">
      {/* SUMMARY */}
      <Card>
        <CardContent className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            {isLoading ? (
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Total Order Amount
                </p>

                <p className="text-2xl font-semibold tracking-tight text-slate-900">
                  Loading...
                </p>
              </div>
            ) : (
              <div className="flex w-full items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Order Amount
                  </p>

                  <p className="text-2xl font-semibold tracking-tight text-slate-900">
                    {formatCurrency(totalReserved)}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    {orders.length > 0
                      ? `From ${orders.length} active ${
                          orders.length === 1
                            ? "order"
                            : "orders"
                        }`
                      : "No active orders yet"}
                  </p>
                </div>

                <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
                  <ShoppingBag className="h-5 w-5" />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* FILTERS */}
      <div className="flex flex-nowrap justify-between gap-2 overflow-x-auto pb-1 text-xs">
        <Button
          type="button"
          variant="outline"
          size="xs"
          className="shrink-0 rounded-full border-slate-200 bg-white px-4 py-2 font-medium text-2xs text-slate-900 shadow-sm"
        >
          All Orders
        </Button>

        <Button
          type="button"
          variant="outline"
          size="xs"
          className="shrink-0 rounded-full border-slate-200 bg-white px-4 py-2 font-medium text-2xs text-slate-600"
        >
          Savings
        </Button>

        <Button
          type="button"
          variant="outline"
          size="xs"
          className="shrink-0 rounded-full border-slate-200 bg-white px-4 py-2 font-medium text-2xs text-slate-600"
        >
          Almost There
        </Button>

        <Button
          type="button"
          variant="outline"
          size="xs"
          className="shrink-0 rounded-full border-slate-200 bg-white px-4 py-2 font-medium text-2xs text-slate-600"
        >
          Completed
        </Button>
      </div>

      {/* ORDER LIST */}
      <Card className="p-0">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="px-4 py-8 text-center">
              <p className="text-sm font-medium text-slate-900">
                Loading orders...
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Fetching your orders.
              </p>
            </div>
          ) : orders.length > 0 ? (
            orders.map(
              (order, index, items) => (
                <div
                  key={
                    order.id ??
                    `${order.name}-${index}`
                  }
                >
                  <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3 p-4">
                    <div className="size-17 shrink-0 rounded-md border border-dashed border-blue-200 bg-blue-50" />

                    <div className="min-w-0 space-y-2">
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-slate-900">
                          {order.name}
                        </p>

                        <p className="text-xl font-semibold tracking-tight text-slate-900">
                          {formatCurrency(
                            order.amount ??
                              order.reserved ??
                              order.saved,
                          )}
                        </p>
                      </div>
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
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <ShoppingBag className="h-5 w-5" />
              </div>

              <p className="text-sm font-medium text-slate-900">
                No active orders
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Add a new order to start
                tracking progress.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ADD ORDER */}
      <Button
        type="button"
        variant="outline"
        className="h-auto w-full flex-col items-center justify-center gap-1 rounded-2xl border-dashed py-2 hover:bg-slate-50"
      >
        <span className="grid size-8 place-items-center rounded-full bg-slate-100 text-slate-700">
          <Plus className="h-4 w-4" />
        </span>

        <span className="text-sm font-semibold text-slate-900">
          Add New Order
        </span>

        <span className="text-xs text-muted-foreground">
          Save for something you want
        </span>
      </Button>
    </div>
  )
}

export default Orders
