import type { LucideIcon } from "lucide-react"

type EmptyStateCardProps = {
  icon: LucideIcon
  title: string
  description: string
  iconClassName: string
}

export function EmptyStateCard({
  icon: Icon,
  title,
  description,
  iconClassName,
}: EmptyStateCardProps) {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-4 text-center">
      <div
        className={`mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-2xl ${iconClassName}`}
      >
        <Icon className="h-4 w-4" />
      </div>

      <p className="text-xs font-medium text-slate-900">
        {title}
      </p>

      <p className="mt-1 text-2xs text-slate-500">
        {description}
      </p>
    </div>
  )
}