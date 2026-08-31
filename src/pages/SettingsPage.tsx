import { useEffect, useState } from "react"
import {
  Bell,
  ChevronRight,
  CircleHelp,
  Crown,
  FileText,
  LockKeyhole,
  LogOut,
  MessagesSquare,
  Palette,
  ShieldCheck,
  Trash2,
  User,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/lib/auth"
import {
  db,
  type SettingsRecord,
} from "@/lib/localDb"

import { supabase } from "@/utils/supabase"

const accountItems = [
  {
    label: "Profile",
    description: "View and edit your personal information",
    icon: User,
    iconClassName: "bg-blue-50 text-blue-600",
  },
  {
    label: "Security",
    description: "Password, biometrics, and account security",
    icon: LockKeyhole,
    iconClassName: "bg-emerald-50 text-emerald-600",
  },
  {
    label: "Backup & Restore",
    description: "Backup your data or restore from backup",
    icon: ShieldCheck,
    iconClassName: "bg-violet-50 text-violet-600",
  },
  {
    label: "Clear Data",
    description: "Remove saved local data from this device",
    icon: Trash2,
    iconClassName: "bg-red-50 text-red-500",
    labelClassName: "text-red-500",
  },
]

const preferenceItems = [
  {
    label: "Appearance",
    description: "Choose theme and customize colors",
    icon: Palette,
    iconClassName: "bg-blue-50 text-blue-600",
    valueKey: "theme",
  },
  {
    label: "Notifications",
    description: "Manage your notifications and reminders",
    icon: Bell,
    iconClassName: "bg-emerald-50 text-emerald-600",
  },
  {
    label: "Currency",
    description: "Set your preferred currency",
    icon: Crown,
    iconClassName: "bg-violet-50 text-violet-600",
    valueKey: "currency",
  },
  {
    label: "Date Format",
    description: "Choose your preferred date format",
    icon: FileText,
    iconClassName: "bg-orange-50 text-orange-500",
    valueKey: "dateFormat",
  },
]

const otherItems = [
  {
    label: "Help & Support",
    description: "Get help and view frequently asked questions",
    icon: CircleHelp,
    iconClassName: "bg-slate-100 text-slate-500",
  },
  {
    label: "Send Feedback",
    description: "Help us improve Budget Track",
    icon: MessagesSquare,
    iconClassName: "bg-blue-50 text-blue-600",
  },
  {
    label: "About Budget Track",
    description: "Version 1.0.0",
    icon: LockKeyhole,
    iconClassName: "bg-slate-100 text-slate-500",
  },
]

function SettingsPage() {
  const [settings, setSettings] = useState<SettingsRecord | null>(null)
  const [isClearing, setIsClearing] = useState(false)
  const { user, signOut } = useAuth()

  useEffect(() => {
    let active = true

    const loadSettings = async () => {
      const item = await db.settings.orderBy("id").first()

      if (active) {
        setSettings(item ?? null)
      }
    }

    void loadSettings()

    return () => {
      active = false
    }
  }, [])

  const handleSignOut = async () => {
    await signOut()
  }

  const handleClearData = async () => {
    if (!user) {
      return
    }

    const confirmed = window.confirm(
      "Delete all your Budget Track data? This cannot be undone.",
    )

    if (!confirmed) {
      return
    }

    setIsClearing(true)

    try {
      const tables = [
        "expenses",
        "incomes",
        "orders",
        "paylaters",
        "saving_goals",
      ] as const

      for (const table of tables) {
        const { error } = await supabase
          .from(table)
          .delete()
          .eq("user_id", user.id)

        if (error) {
          console.error(
            `Failed to delete ${table}:`,
            error,
          )

          throw error
        }
      }

      setSettings(null)

      window.location.reload()
    } catch (error) {
      console.error(
        "Failed to clear Supabase data:",
        error,
      )

      window.alert(
        "Failed to delete your data. Please try again.",
      )
    } finally {
      setIsClearing(false)
    }
  }

  return (
    <section className="page mx-auto w-full max-w-[430px] space-y-6" id="settings">
      <div className="space-y-1">
        <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
          Settings
        </h2>
        <p className="text-sm text-slate-500">
          Manage your account and preferences.
        </p>
      </div>

      <Card className="overflow-hidden p-0">
        <CardContent className="p-0">
          <button
            type="button"
            className="grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 p-5 text-left"
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-300 text-3xl font-semibold tracking-tight text-white">
              {settings?.profileName
                .split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 2) || "CJ"}
            </div>

            <div className="min-w-0 space-y-1">
              <p className="text-lg font-semibold text-slate-900">
                {settings?.profileName ?? "CJ Bautista"}
              </p>
              <p className="text-sm text-slate-500">
                {settings?.email ?? "cj.bautista@example.com"}
              </p>
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                <Crown className="h-3.5 w-3.5" />
                {settings?.isPremium ? "Premium" : "Free"}
              </span>
            </div>

            <ChevronRight className="h-5 w-5 text-slate-400" />
          </button>
        </CardContent>
      </Card>

      <section className="space-y-3">
        <p className="text-xs font-semibold tracking-wide text-slate-500">
          ACCOUNT
        </p>

        <Card className="overflow-hidden p-0">
          <CardContent className="p-0">
            {accountItems.map((item, index) => {
              const Icon = item.icon

              return (
                <div key={item.label}>
                  <button
                    type="button"
                    onClick={item.label === "Clear Data" ? handleClearData : undefined}
                    disabled={item.label === "Clear Data" ? isClearing : undefined}
                    className="grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 p-4 text-left"
                  >
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl ${item.iconClassName}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    <div className="min-w-0">
                      <p
                        className={`text-sm font-semibold ${item.labelClassName ?? "text-slate-900"
                          }`}
                      >
                        {item.label}
                      </p>
                      <p className="text-xs text-slate-500">{item.description}</p>
                    </div>

                    <ChevronRight className="h-5 w-5 text-slate-400" />
                  </button>

                  {index < accountItems.length - 1 ? (
                    <Separator className="bg-slate-200" />
                  ) : null}
                </div>
              )
            })}
          </CardContent>
        </Card>
      </section>

      <section className="space-y-3">
        <p className="text-xs font-semibold tracking-wide text-slate-500">
          PREFERENCES
        </p>

        <Card className="overflow-hidden p-0">
          <CardContent className="p-0">
            {preferenceItems.map((item, index) => {
              const Icon = item.icon
              const rawValue = item.valueKey ? settings?.[item.valueKey as keyof SettingsRecord] : null

              return (
                <div key={item.label}>
                  <button
                    type="button"
                    className="grid w-full grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-4 p-4 text-left"
                  >
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl ${item.iconClassName}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900">
                        {item.label}
                      </p>
                      <p className="text-xs text-slate-500">{item.description}</p>
                    </div>

                    {rawValue ? (
                      <span className="text-sm font-medium text-blue-600">
                        {String(rawValue)}
                      </span>
                    ) : (
                      <span />
                    )}

                    <ChevronRight className="h-5 w-5 text-slate-400" />
                  </button>

                  {index < preferenceItems.length - 1 ? (
                    <Separator className="bg-slate-200" />
                  ) : null}
                </div>
              )
            })}
          </CardContent>
        </Card>
      </section>

      <section className="space-y-3">
        <p className="text-xs font-semibold tracking-wide text-slate-500">
          OTHER
        </p>

        <Card className="overflow-hidden p-0">
          <CardContent className="p-0">
            {otherItems.map((item, index) => {
              const Icon = item.icon

              return (
                <div key={item.label}>
                  <button
                    type="button"
                    className="grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 p-4 text-left"
                  >
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl ${item.iconClassName}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900">
                        {item.label}
                      </p>
                      <p className="text-xs text-slate-500">{item.description}</p>
                    </div>

                    <ChevronRight className="h-5 w-5 text-slate-400" />
                  </button>

                  {index < otherItems.length - 1 ? (
                    <Separator className="bg-slate-200" />
                  ) : null}
                </div>
              )
            })}

            <div className="border-t border-slate-200 p-4">
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start gap-3 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={() => void handleSignOut()}
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <Button
        type="button"
        variant="outline"
        className="h-auto w-full justify-start rounded-2xl border-red-100 bg-red-50 px-4 py-4 text-red-500 hover:bg-red-100 hover:text-red-600"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/70">
          <LogOut className="h-5 w-5" />
        </span>
        <span className="ml-4 text-sm font-semibold">Log Out</span>
      </Button>
    </section>
  )
}

export default SettingsPage
