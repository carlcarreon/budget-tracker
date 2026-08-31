import { useEffect, useMemo, useState } from "react"
import {
  CreditCard,
  MoreVertical,
  Plus,
  ShoppingBag,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/lib/auth"
import type {
  OrderRecord,
  PayLaterRecord,
} from "@/lib/localDb"
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

function OrdersPage() {
  const { user } = useAuth()

  const [orders, setOrders] = useState<OrderRecord[]>([])
  const [paylaters, setPaylaters] = useState<
    PayLaterRecord[]
  >([])

  const [activeTab, setActiveTab] = useState<
    "orders" | "paylater"
  >("orders")

  const [isLoading, setIsLoading] =
    useState(true)

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

  const totalPaylater = useMemo(
    () =>
      paylaters.reduce(
        (sum, paylater) =>
          sum + paylater.totalAmount,
        0,
      ),
    [paylaters],
  )

  const totalMonthlyPaylater = useMemo(
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

    const loadData = async () => {
      if (!user) {
        if (active) {
          setOrders([])
          setPaylaters([])
          setIsLoading(false)
        }

        return
      }

      setIsLoading(true)

      const [
        ordersResult,
        paylaterResult,
      ] = await Promise.all([
        supabase
          .from("orders")
          .select("*")
          .eq("user_id", user.id)
          .order("id", {
            ascending: true,
          }),

        supabase
          .from("paylaters")
          .select("*")
          .eq("user_id", user.id)
          .order("id", {
            ascending: true,
          }),
      ])

      if (ordersResult.error) {
        console.error(
          "Failed to fetch orders:",
          ordersResult.error,
        )
      }

      if (paylaterResult.error) {
        console.error(
          "Failed to fetch paylater:",
          paylaterResult.error,
        )
      }

      if (!active) {
        return
      }

      setOrders(
        (ordersResult.data ?? []).map((row) =>
          mapOrderRow(
            row as Record<string, unknown>,
          ),
        ),
      )

      setPaylaters(
        (paylaterResult.data ?? []).map(
          (row) =>
            mapPaylaterRow(
              row as Record<string, unknown>,
            ),
        ),
      )

      setIsLoading(false)
    }

    void loadData()

    return () => {
      active = false
    }
  }, [user])

  return (
    <section
      className="page space-y-5"
      id="orders"
    >
      {/* HEADER */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
            Orders
          </h2>

          <p className="max-w-md text-xs text-muted-foreground">
            Track and save for the things you want.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="icon"
          className="rounded-full border-slate-200 bg-white shadow-sm"
          aria-label={
            activeTab === "orders"
              ? "Add order"
              : "Add PayLater"
          }
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* MAIN TABS */}
      <div className="grid grid-cols-2 rounded-xl bg-slate-100 p-1">
        <Button
          type="button"
          variant="ghost"
          onClick={() =>
            setActiveTab("orders")
          }
          className={`h-9 rounded-lg text-xs font-semibold ${
            activeTab === "orders"
              ? "bg-white text-slate-900 shadow-sm hover:bg-white"
              : "text-slate-500 hover:bg-transparent hover:text-slate-900"
          }`}
        >
          <ShoppingBag className="mr-2 h-4 w-4" />
          Orders
        </Button>

        <Button
          type="button"
          variant="ghost"
          onClick={() =>
            setActiveTab("paylater")
          }
          className={`h-9 rounded-lg text-xs font-semibold ${
            activeTab === "paylater"
              ? "bg-white text-slate-900 shadow-sm hover:bg-white"
              : "text-slate-500 hover:bg-transparent hover:text-slate-900"
          }`}
        >
          <CreditCard className="mr-2 h-4 w-4" />
          PayLater
        </Button>
      </div>

      {/* ORDERS TAB */}
      {activeTab === "orders" ? (
        <>
          {/* ORDER SUMMARY */}
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
                ) : orders.length > 0 ? (
                  <>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">
                        Total Order Amount
                      </p>

                      <p className="text-2xl font-semibold tracking-tight text-slate-900">
                        {formatCurrency(
                          totalReserved,
                        )}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        From {orders.length} active{" "}
                        {orders.length === 1
                          ? "order"
                          : "orders"}
                      </p>
                    </div>

                    <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
                      <ShoppingBag className="h-5 w-5" />
                    </div>
                  </>
                ) : (
                  <div className="flex w-full items-center justify-between gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">
                        Total Order Amount
                      </p>

                      <p className="text-2xl font-semibold tracking-tight text-slate-900">
                        {formatCurrency(0)}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        No active orders yet
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

          {/* ORDER FILTERS */}
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
        </>
      ) : (
        /* PAYLATER TAB */
        <>
          {/* PAYLATER SUMMARY */}
          <Card>
            <CardContent className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                {isLoading ? (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      PayLater Balance
                    </p>

                    <p className="text-2xl font-semibold tracking-tight text-slate-900">
                      Loading...
                    </p>
                  </div>
                ) : paylaters.length > 0 ? (
                  <>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">
                        PayLater Balance
                      </p>

                      <p className="text-2xl font-semibold tracking-tight text-slate-900">
                        {formatCurrency(
                          totalPaylater,
                        )}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(
                          totalMonthlyPaylater,
                        )}{" "}
                        monthly ·{" "}
                        {paylaters.length}{" "}
                        {paylaters.length === 1
                          ? "plan"
                          : "plans"}
                      </p>
                    </div>

                    <div className="rounded-lg bg-rose-50 p-3 text-rose-500">
                      <CreditCard className="h-5 w-5" />
                    </div>
                  </>
                ) : (
                  <div className="flex w-full items-center justify-between gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">
                        PayLater Balance
                      </p>

                      <p className="text-2xl font-semibold tracking-tight text-slate-900">
                        {formatCurrency(0)}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        No active PayLater plans
                      </p>
                    </div>

                    <div className="rounded-lg bg-rose-50 p-3 text-rose-500">
                      <CreditCard className="h-5 w-5" />
                    </div>
                  </div>
                )}
              </div>
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
                              src={
                                paylater.imageUrl
                              }
                              alt={
                                paylater.name
                              }
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
                            {paylater.months}{" "}
                            months
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
        </>
      )}
    </section>
  )
}

export default OrdersPage