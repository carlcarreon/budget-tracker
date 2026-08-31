import { useEffect, useMemo, useState } from "react"

import {
  ChevronRight,
  ClipboardList,
  CreditCard,
  HandPlatter,
  PiggyBank,
  ShoppingBag,
  Wallet,
  WalletCards,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

import { useAuth } from "@/lib/auth"

import type {
  ExpenseRecord,
  IncomeRecord,
  OrderRecord,
  PayLaterRecord,
  SavingGoalRecord,
} from "@/lib/localDb"

import { supabase } from "@/utils/supabase"

import {
  formatCurrency,
  formatSignedCurrency,
  formatTransactionAmount,
  formatTransactionDate,
  isSameDay,
} from "@/utils/formatters"

import { EmptyStateCard } from "./components/EmptyStateCard"
import { QuickActions } from "./components/QuickActions"

import {
  mapExpenseRow,
  mapIncomeRow,
  mapOrderRow,
  mapPaylaterRow,
  mapSavingGoalRow,
} from "@/supports/home/mappings"

/*
 * PAGE
 */

export function HomePage() {
  const { user } = useAuth()

  /*
   * DATA
   */

  const [orders, setOrders] =
    useState<OrderRecord[]>([])

  const [expenses, setExpenses] =
    useState<ExpenseRecord[]>([])

  const [savingGoals, setSavingGoals] =
    useState<SavingGoalRecord[]>([])

  const [paylaters, setPaylaters] =
    useState<PayLaterRecord[]>([])

  const [incomes, setIncomes] =
    useState<IncomeRecord[]>([])

  /*
   * LOAD HOME DATA
   */

  useEffect(() => {
    let active = true

    const loadHome = async () => {
      if (!user) {
        return
      }

      const [
        orderResult,
        expenseResult,
        goalResult,
        paylaterResult,
        incomeResult,
      ] = await Promise.all([
        supabase
          .from("orders")
          .select("*")
          .eq("user_id", user.id)
          .order("id", { ascending: true }),

        supabase
          .from("expenses")
          .select("*")
          .eq("user_id", user.id)
          .order("id", { ascending: true }),

        supabase
          .from("saving_goals")
          .select("*")
          .eq("user_id", user.id)
          .order("id", { ascending: true }),

        supabase
          .from("paylaters")
          .select("*")
          .eq("user_id", user.id)
          .order("id", { ascending: true }),

        supabase
          .from("incomes")
          .select("*")
          .eq("user_id", user.id)
          .order("id", { ascending: true }),
      ])

      if (!active) {
        return
      }

      if (orderResult.error) {
        console.error(
          "Failed to load orders:",
          orderResult.error,
        )
      }

      if (expenseResult.error) {
        console.error(
          "Failed to load expenses:",
          expenseResult.error,
        )
      }

      if (goalResult.error) {
        console.error(
          "Failed to load savings:",
          goalResult.error,
        )
      }

      if (paylaterResult.error) {
        console.error(
          "Failed to load paylater:",
          paylaterResult.error,
        )
      }

      if (incomeResult.error) {
        console.error(
          "Failed to load income:",
          incomeResult.error,
        )
      }

      setOrders(
        (orderResult.data ?? []).map(
          mapOrderRow,
        ),
      )

      setExpenses(
        (expenseResult.data ?? []).map(
          mapExpenseRow,
        ),
      )

      setSavingGoals(
        (goalResult.data ?? []).map(
          mapSavingGoalRow,
        ),
      )

      setPaylaters(
        (paylaterResult.data ?? []).map(
          mapPaylaterRow,
        ),
      )

      setIncomes(
        (incomeResult.data ?? []).map(
          mapIncomeRow,
        ),
      )
    }

    void loadHome()

    return () => {
      active = false
    }
  }, [user])

  /*
   * TOTALS
   */

  const incomeTotal = useMemo(
    () =>
      incomes.reduce(
        (sum, income) =>
          sum + income.amount,
        0,
      ),
    [incomes],
  )

  const expenseTotal = useMemo(
    () =>
      expenses.reduce(
        (sum, expense) =>
          sum + expense.amount,
        0,
      ),
    [expenses],
  )

  const totalBalance = useMemo(
    () =>
      incomeTotal -
      expenseTotal,
    [incomeTotal, expenseTotal],
  )

  /*
   * COUNTS
   */

  const orderCount = orders.length

  const paylaterCount =
    paylaters.length

  /*
   * SAVINGS
   */

  const savings = useMemo(
    () =>
      savingGoals.reduce(
        (sum, goal) =>
          sum + goal.saved,
        0,
      ),
    [savingGoals],
  )

  /*
   * TODAY
   */

  const todayIncome = useMemo(() => {
    const today = new Date()

    return incomes.reduce(
      (sum, income) =>
        isSameDay(
          income.createdAt,
          today,
        )
          ? sum + income.amount
          : sum,
      0,
    )
  }, [incomes])

  const todayExpenses = useMemo(() => {
    const today = new Date()

    return expenses.reduce(
      (sum, expense) =>
        isSameDay(
          expense.time,
          today,
        )
          ? sum + expense.amount
          : sum,
      0,
    )
  }, [expenses])

  const todayNet = useMemo(
    () =>
      todayIncome -
      todayExpenses,
    [todayIncome, todayExpenses],
  )

  /*
   * RECENT TRANSACTIONS
   */

  const recentTransactions = useMemo(() => {
  const expenseTransactions = expenses.map((expense) => ({
    id: `expense-${expense.id}`,
    name: expense.name,
    category: expense.category,
    amount: Math.abs(Number(expense.amount)),
    time: expense.time,
    type: "expense" as const,
    date: new Date(expense.time).getTime(),
  }))

  const incomeTransactions = incomes.map((income) => ({
    id: `income-${income.id}`,
    name: income.source,
    category: "Income",
    amount: Math.abs(Number(income.amount)),
    time: income.createdAt,
    type: "income" as const,
    date: new Date(income.createdAt).getTime(),
  }))

  return [
    ...expenseTransactions,
    ...incomeTransactions,
  ]
    .filter((transaction) =>
      Number.isFinite(transaction.date),
    )
    .sort((a, b) => b.date - a.date)
    .slice(0, 3)
}, [expenses, incomes])

  /*
   * ADD BALANCE / INCOME
   */

  const handleBalanceSubmit =
    async (payload: {
      amount: number
    }) => {
      if (!user) {
        return
      }

      const createdAt =
        new Date().toISOString()

      const { data, error } =
        await supabase
          .from("incomes")
          .insert({
            source: "Income",
            amount: payload.amount,
            created_at: createdAt,
            user_id: user.id,
          })
          .select()
          .single()

      if (error || !data) {
        console.error(
          "Failed to add balance:",
          error,
        )
        return
      }

      setIncomes((current) => [
        ...current,
        mapIncomeRow(data),
      ])
    }

  /*
   * ADD EXPENSE
   */

  const handleExpenseSubmit =
    async (payload: {
      name: string
      amount: number
      category: string
    }) => {
      if (!user) {
        return
      }

      const time =
        new Date().toISOString()

      const { data, error } =
        await supabase
          .from("expenses")
          .insert({
            name: payload.name,
            amount: payload.amount,
            category: payload.category,
            time,
            user_id: user.id,
          })
          .select()
          .single()

      if (error || !data) {
        console.error(
          "Failed to add expense:",
          error,
        )
        return
      }

      setExpenses((current) => [
        ...current,
        mapExpenseRow(data),
      ])
    }

  /*
   * ADD ORDER
   */

  const handleOrderSubmit =
    async (payload: {
      name: string
      amount: number
    }) => {
      if (!user) {
        return
      }

      const { data, error } =
        await supabase
          .from("orders")
          .insert({
            name: payload.name,
            target: payload.amount,
            saved: 0,
            progress: 0,
            due: "N/A",
            amount: payload.amount,
            user_id: user.id,
          })
          .select()
          .single()

      if (error || !data) {
        console.error(
          "Failed to add order:",
          error,
        )
        return
      }

      setOrders((current) => [
        ...current,
        mapOrderRow(data),
      ])
    }

  /*
   * ADD PAYLATER
   */

  const handlePaylaterSubmit =
    async (payload: {
      name: string
      months: number
      monthlyPayment: number
      imageUrl?: string
    }) => {
      if (!user) {
        return
      }

      const totalAmount =
        payload.months *
        payload.monthlyPayment

      const { data, error } =
        await supabase
          .from("paylaters")
          .insert({
            name: payload.name,
            months: payload.months,
            monthly_payment:
              payload.monthlyPayment,
            total_amount:
              totalAmount,
            image_url:
              payload.imageUrl ??
              null,
            user_id: user.id,
          })
          .select()
          .single()

      if (error || !data) {
        console.error(
          "Failed to add paylater:",
          error,
        )
        return
      }

      setPaylaters((current) => [
        ...current,
        mapPaylaterRow(data),
      ])
    }

  /*
   * UI
   */

  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-bold text-slate-900">
        Dashboard
      </h1>

      {/* TOTAL BALANCE */}

      <Card className="overflow-hidden border-slate-200 bg-white py-4 shadow-sm">
        <CardContent className="space-y-2">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="text-xs font-medium text-muted-foreground">
                Total Balance
              </div>

              <p
                className={`text-4xl font-bold tracking-tight ${totalBalance > 0
                    ? "text-emerald-600"
                    : totalBalance < 0
                      ? "text-rose-500"
                      : "text-slate-900"
                  }`}
              >
                {formatSignedCurrency(
                  totalBalance,
                )}
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              className="flex items-center gap-2 rounded-full"
            >
              Details
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <Separator className="bg-slate-200" />

          <div className="flex items-stretch gap-0 text-center">

            {/* BALANCE */}

            <div className="flex min-w-0 flex-1 flex-col items-center gap-1">
              <div className="rounded-2xl bg-slate-100 p-2">
                <Wallet className="h-5 w-5 text-slate-400" />
              </div>

              <span className="text-2xs font-medium leading-none whitespace-nowrap text-muted-foreground">
                Balance
              </span>

              <span
                className={`text-sm font-medium tracking-tight ${totalBalance > 0
                    ? "text-emerald-600"
                    : totalBalance < 0
                      ? "text-rose-500"
                      : "text-slate-900"
                  }`}
              >
                {formatSignedCurrency(
                  totalBalance,
                )}
              </span>
            </div>

            <Separator
              orientation="vertical"
              className="mx-1 h-20 self-center bg-slate-200"
            />

            {/* ORDERS */}

            <div className="flex min-w-0 flex-1 flex-col items-center gap-1">
              <div className="rounded-2xl bg-slate-100 p-2">
                <ShoppingBag className="h-5 w-5 text-amber-400" />
              </div>

              <span className="text-2xs font-medium leading-none whitespace-nowrap text-muted-foreground">
                Orders
              </span>

              <span className="text-sm font-medium tracking-tight text-slate-900">
                {orderCount}
              </span>
            </div>

            <Separator
              orientation="vertical"
              className="mx-1 h-20 self-center bg-slate-200"
            />

            {/* SAVINGS */}

            <div className="flex min-w-0 flex-1 flex-col items-center gap-1">
              <div className="rounded-2xl bg-slate-100 p-2">
                <PiggyBank className="h-5 w-5 text-violet-400" />
              </div>

              <span className="text-2xs font-medium leading-none whitespace-nowrap text-muted-foreground">
                Savings
              </span>

              <span className="text-sm font-medium tracking-tight text-slate-900">
                {formatCurrency(savings)}
              </span>
            </div>

            <Separator
              orientation="vertical"
              className="mx-1 h-20 self-center bg-slate-200"
            />

            {/* PAYLATER */}

            <div className="flex min-w-0 flex-1 flex-col items-center gap-1">
              <div className="rounded-2xl bg-slate-100 p-2">
                <WalletCards className="h-5 w-5 text-rose-400" />
              </div>

              <span className="text-2xs font-medium leading-none whitespace-nowrap text-muted-foreground">
                PayLater
              </span>

              <span className="text-sm font-medium tracking-tight text-slate-900">
                {paylaterCount}
              </span>
            </div>

          </div>
        </CardContent>
      </Card>

      {/* QUICK ACTIONS */}

      <QuickActions
        onBalanceSubmit={
          handleBalanceSubmit
        }
        onExpenseSubmit={
          handleExpenseSubmit
        }
        onOrderSubmit={
          handleOrderSubmit
        }
        onPaylaterSubmit={
          handlePaylaterSubmit
        }
      />

      {/* MY TRACKERS */}

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">
            My Trackers
          </h2>

          <Button
            type="button"
            variant="ghost"
            className="h-auto px-0 text-xs font-medium text-blue-600 hover:bg-transparent hover:text-blue-700"
          >
            View All
          </Button>
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

              <div className="flex min-h-[70px] items-center justify-center text-center">
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

              <div className="flex min-h-[70px] items-center justify-center text-center">
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

              <div className="flex min-h-[70px] items-center justify-center text-center">
                <p
                  className={`text-3xl font-bold tracking-tight ${todayNet > 0
                      ? "text-emerald-600"
                      : todayNet < 0
                        ? "text-rose-500"
                        : "text-slate-900"
                    }`}
                >
                  {formatSignedCurrency(
                    todayNet,
                  )}
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

              <div className="flex min-h-[70px] items-center justify-center text-center">
                <p className="text-3xl font-bold tracking-tight text-violet-600">
                  {formatCurrency(
                    savings,
                  )}
                </p>
              </div>
            </CardContent>
          </Card>

        </div>
      </section>

      {/* RECENT TRANSACTIONS */}

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">
            Recent Transactions
          </h2>

          <Button
            type="button"
            variant="ghost"
            className="h-auto px-0 text-xs font-medium text-blue-600 hover:bg-transparent hover:text-blue-700"
          >
            View All
          </Button>
        </div>

        <Card className="py-0">
          <CardContent className="p-0">

            {recentTransactions.length > 0 ? (
              recentTransactions.map(
                (
                  transaction,
                  index,
                ) => {
                  const isIncome =
                    transaction.type ===
                    "income"

                  return (
                    <div
                      key={
                        transaction.id
                      }
                    >
                      <div className="flex items-center gap-3 px-4 py-4">

                        {/* ICON */}

                        <div
                          className={
                            isIncome
                              ? "rounded-full bg-emerald-500/10 p-3 text-emerald-600"
                              : "rounded-full bg-rose-500/10 p-3 text-rose-500"
                          }
                        >
                          {isIncome ? (
                            <Wallet className="h-5 w-5" />
                          ) : (
                            <HandPlatter className="h-5 w-5" />
                          )}
                        </div>

                        {/* INFORMATION */}

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-slate-900">
                            {
                              transaction.name
                            }
                          </p>

                          <p className="text-xs font-medium text-muted-foreground">
                            {
                              transaction.category
                            }
                          </p>
                        </div>

                        {/* AMOUNT */}

                        <div className="text-right">
                          <p
                            className={
                              isIncome
                                ? "text-sm font-bold tracking-tight text-emerald-600"
                                : "text-sm font-bold tracking-tight text-rose-500"
                            }
                          >
                            {formatTransactionAmount(
                              transaction.amount,
                              transaction.type,
                            )}
                          </p>

                          <p className="text-xs font-medium text-muted-foreground">
                            {formatTransactionDate(
                              transaction.time,
                            )}
                          </p>
                        </div>

                      </div>

                      {index <
                        recentTransactions.length -
                        1 ? (
                        <Separator className="bg-slate-200" />
                      ) : null}
                    </div>
                  )
                },
              )
            ) : (
              <div className="px-4 py-6">
                <EmptyStateCard
                  icon={HandPlatter}
                  iconClassName="bg-rose-500/10 text-rose-500"
                  title="No transactions yet"
                  description="Add your first expense or income."
                />
              </div>
            )}

          </CardContent>
        </Card>
      </section>
    </div>
  )
}