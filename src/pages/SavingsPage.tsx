import { Fragment, useEffect, useMemo, useState } from "react"

import {
  BarChart3,
  BellRing,
  Camera,
  Eye,
  Laptop,
  MoreVertical,
  Plane,
  Plus,
  Target,
  TrendingUp,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/lib/auth"
import type {
  ContributionRecord,
  SavingGoalRecord,
} from "@/lib/localDb"
import { supabase } from "@/utils/supabase"

const goalMeta = {
  "Japan Trip": {
    icon: Plane,
    iconClassName: "bg-blue-50 text-blue-500",
    statusClassName: "bg-blue-50 text-blue-600",
    barClassName: "bg-blue-500",
  },
  "New Laptop": {
    icon: Laptop,
    iconClassName: "bg-emerald-50 text-emerald-500",
    statusClassName: "bg-emerald-50 text-emerald-600",
    barClassName: "bg-emerald-500",
  },
  Camera: {
    icon: Camera,
    iconClassName: "bg-violet-50 text-violet-500",
    statusClassName: "bg-violet-50 text-violet-600",
    barClassName: "bg-violet-500",
  },
  "Emergency Fund": {
    icon: BellRing,
    iconClassName: "bg-orange-50 text-orange-500",
    statusClassName: "bg-orange-50 text-orange-600",
    barClassName: "bg-orange-500",
  },
} as const

const contributionMeta = {
  "Japan Trip": {
    iconLabel: "↓",
    iconClassName: "bg-emerald-500 text-white",
  },
  "New Laptop": {
    iconLabel: "↓",
    iconClassName: "bg-blue-500 text-white",
  },
  Camera: {
    iconLabel: "↓",
    iconClassName: "bg-violet-500 text-white",
  },
} as const

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)

const mapSavingGoalRow = (
  row: Record<string, unknown>,
): SavingGoalRecord => ({
  id: Number(row.id),
  title: String(row.title ?? ""),
  target: Number(row.target ?? 0),
  saved: Number(row.saved ?? 0),
  progress: Number(row.progress ?? 0),
  status: String(row.status ?? ""),
})

const mapContributionRow = (
  row: Record<string, unknown>,
): ContributionRecord => ({
  id: Number(row.id),
  title: String(row.title ?? ""),
  amount: Number(row.amount ?? 0),
  date: String(row.date ?? ""),
})

function SavingsPage() {
  const { user } = useAuth()

  const [savingGoals, setSavingGoals] = useState<SavingGoalRecord[]>([])
  const [contributions, setContributions] = useState<ContributionRecord[]>([])

  useEffect(() => {
    let active = true

    if (!user) {
      return undefined
    }

    const loadSavings = async () => {
      const [goalResult, contributionResult] = await Promise.all([
        supabase
          .from("saving_goals")
          .select("*")
          .eq("user_id", user.id)
          .order("id", { ascending: true }),

        supabase
          .from("contributions")
          .select("*")
          .eq("user_id", user.id)
          .order("id", { ascending: false }),
      ])

      if (goalResult.error) {
        throw goalResult.error
      }

      if (contributionResult.error) {
        throw contributionResult.error
      }

      if (!active) {
        return
      }

      setSavingGoals(
        (goalResult.data ?? []).map((row) => mapSavingGoalRow(row)),
      )

      setContributions(
        (contributionResult.data ?? []).map((row) =>
          mapContributionRow(row),
        ),
      )
    }

    void loadSavings().catch(() => {
      if (!active) {
        return
      }

      setSavingGoals([])
      setContributions([])
    })

    return () => {
      active = false
    }
  }, [user])

  const totalSaved = useMemo(
    () => savingGoals.reduce((sum, goal) => sum + goal.saved, 0),
    [savingGoals],
  )

  const monthlySaved = useMemo(
    () => contributions.reduce((sum, item) => sum + item.amount, 0),
    [contributions],
  )

  const avgPerMonth = monthlySaved / 6

  return (
    <section
      className="page mx-auto w-full max-w-[430px] space-y-6"
      id="savings"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
            Savings
          </h2>

          <p className="max-w-md text-sm text-slate-500">
            Build your future, one saving at a time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-12 w-12 rounded-full border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50"
            aria-label="View savings analytics"
          >
            <BarChart3 className="h-5 w-5" />
          </Button>

          <Button
            type="button"
            size="icon"
            className="h-12 w-12 rounded-full bg-blue-500 text-white shadow-sm hover:bg-blue-600"
            aria-label="Add savings goal"
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden p-0">
        <CardContent className="p-0">
          <div className="grid gap-6 bg-gradient-to-br from-blue-50 via-white to-slate-50 p-4 lg:items-center">
            <div className="space-y-0">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                <span>Total Savings</span>
                <Eye className="h-4 w-4 text-blue-500" />
              </div>

              <div className="space-y-0">
                <div className="text-4xl font-semibold tracking-tight text-blue-600 sm:text-5xl">
                  {formatCurrency(totalSaved)}
                </div>

                <p className="text-2xs text-slate-500">
                  from {savingGoals.length} goals
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 p-2">
            {[
              {
                label: "Total Saved",
                value: formatCurrency(totalSaved),
                note: "All time",
                icon: TrendingUp,
                iconClassName: "bg-emerald-50 text-emerald-500",
                valueClassName: "text-emerald-600",
              },
              {
                label: "Monthly Saved",
                value: formatCurrency(monthlySaved),
                note: "This month",
                icon: Target,
                iconClassName: "bg-violet-50 text-violet-500",
                valueClassName: "text-slate-900",
              },
              {
                label: "Avg. per Month",
                value: formatCurrency(avgPerMonth),
                note: "Last 6 months",
                icon: BarChart3,
                iconClassName: "bg-orange-50 text-orange-500",
                valueClassName: "text-slate-900",
              },
            ].map((metric, index) => {
              const Icon = metric.icon

              return (
                <Fragment key={metric.label}>
                  <div className="flex items-start gap-2 text-left">
                    <div
                      className={`shrink-0 rounded-md p-1.5 ${metric.iconClassName}`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </div>

                    <div className="flex min-w-0 flex-col">
                      <p className="truncate text-[10px] font-medium text-slate-700">
                        {metric.label}
                      </p>

                      <p
                        className={`text-sm font-medium tracking-tight ${metric.valueClassName}`}
                      >
                        {metric.value}
                      </p>

                      <p className="truncate text-[10px] text-slate-500">
                        {metric.note}
                      </p>
                    </div>
                  </div>

                  {index < 2 ? (
                    <Separator
                      orientation="vertical"
                      className="h-8 self-center bg-slate-200"
                    />
                  ) : null}
                </Fragment>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between gap-4">
        <h3 className="text-lg font-semibold text-slate-900">
          Your Savings Goals
        </h3>

        <Button variant="link" className="px-0 text-base text-blue-600">
          View all
        </Button>
      </div>

      <Card className="overflow-hidden p-0">
        <CardContent className="p-0">
          {savingGoals.length > 0 ? (
            savingGoals.map((goal, index) => {
              const meta =
                goalMeta[goal.title as keyof typeof goalMeta]

              const GoalIcon = meta?.icon ?? BellRing

              return (
                <div key={goal.id ?? goal.title}>
                  <div className="grid grid-cols-[auto_minmax(0,1fr)_auto_auto] items-start gap-3 p-4">
                    <div
                      className={`flex h-[4.25rem] w-[4.25rem] shrink-0 items-center justify-center rounded-md border border-dashed border-slate-200 ${
                        meta?.iconClassName ??
                        "bg-slate-50 text-slate-500"
                      }`}
                    >
                      <GoalIcon className="h-7 w-7" />
                    </div>

                    <div className="min-w-0 space-y-2">
                      <div className="space-y-1">
                        <p className="text-xs font-semibold">
                          {goal.title}
                        </p>

                        <p className="text-2xs text-muted-foreground">
                          Target: {formatCurrency(goal.target)}
                        </p>
                      </div>

                      <div className="space-y-0">
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                            <div
                              className={`h-full rounded-full ${
                                meta?.barClassName ?? "bg-slate-400"
                              }`}
                              style={{
                                width: `${Math.min(
                                  100,
                                  Math.max(0, goal.progress),
                                )}%`,
                              }}
                            />
                          </div>

                          <span
                            className={`shrink-0 text-2xs font-semibold ${
                              meta?.barClassName?.replace(
                                "bg-",
                                "text-",
                              ) ?? "text-slate-500"
                            }`}
                          >
                            {goal.progress}%
                          </span>
                        </div>

                        <p className="text-2xs font-semibold text-muted-foreground">
                          {formatCurrency(goal.saved)} saved (
                          {goal.progress}%)
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1 text-right">
                      <p
                        className={`text-sm font-semibold ${
                          meta?.barClassName?.replace(
                            "bg-",
                            "text-",
                          ) ?? "text-slate-900"
                        }`}
                      >
                        {formatCurrency(goal.saved)}
                      </p>

                      <p className="text-2xs text-muted-foreground">
                        of {formatCurrency(goal.target)}
                      </p>

                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                          meta?.statusClassName ??
                          "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {goal.status}
                      </span>
                    </div>

                    <button
                      type="button"
                      className="shrink-0"
                      aria-label="More actions"
                    >
                      <MoreVertical className="h-3 w-3 text-muted-foreground" />
                    </button>
                  </div>

                  {index < savingGoals.length - 1 ? (
                    <Separator className="bg-slate-100" />
                  ) : null}
                </div>
              )
            })
          ) : (
            <div className="px-4 py-6 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-600">
                <BellRing className="h-5 w-5" />
              </div>

              <p className="text-sm font-medium text-slate-900">
                No savings goals yet
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Add a goal to start tracking progress.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between gap-4">
        <h3 className="text-lg font-semibold text-slate-900">
          Recent Contributions
        </h3>

        <Button variant="link" className="px-0 text-base text-blue-600">
          View all
        </Button>
      </div>

      <Card className="overflow-hidden p-0">
        <CardContent className="p-0">
          {contributions.length > 0 ? (
            contributions.map((item, index) => {
              const meta =
                contributionMeta[
                  item.title as keyof typeof contributionMeta
                ]

              return (
                <div key={item.id ?? `${item.title}-${index}`}>
                  <div className="grid grid-cols-[auto_minmax(0,1fr)_auto_auto] items-start gap-3 p-4">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-base font-semibold ${
                        meta?.iconClassName ??
                        "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {meta?.iconLabel ?? "↓"}
                    </div>

                    <div className="min-w-0">
                      <h4 className="text-xs font-semibold text-slate-900">
                        {item.title}
                      </h4>

                      <p className="text-2xs text-muted-foreground">
                        {item.date}
                      </p>
                    </div>

                    <div className="space-y-1 text-right">
                      <p className="text-xs font-semibold text-emerald-600">
                        +{formatCurrency(item.amount)}
                      </p>
                    </div>

                    <button
                      type="button"
                      className="shrink-0"
                      aria-label={`${item.title} actions`}
                    >
                      <MoreVertical className="h-3 w-3 text-muted-foreground" />
                    </button>
                  </div>

                  {index < contributions.length - 1 ? (
                    <Separator className="bg-slate-100" />
                  ) : null}
                </div>
              )
            })
          ) : (
            <div className="px-4 py-6 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
                <TrendingUp className="h-5 w-5" />
              </div>

              <p className="text-sm font-medium text-slate-900">
                No recent contributions
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Add a contribution to see it here.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  )
}

export default SavingsPage