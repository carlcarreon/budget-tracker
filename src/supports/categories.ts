import {
  Gamepad2,
  House,
  Laptop,
  Package,
  Shirt,
  Sparkles,
  Utensils,
} from "lucide-react"

export const orderCategories = [
  {
    value: "electronics",
    label: "Electronics",
    icon: Laptop,
  },
  {
    value: "clothing",
    label: "Clothing",
    icon: Shirt,
  },
  {
    value: "food",
    label: "Food",
    icon: Utensils,
  },
  {
    value: "home",
    label: "Home",
    icon: House,
  },
  {
    value: "gaming",
    label: "Gaming",
    icon: Gamepad2,
  },
  {
    value: "beauty",
    label: "Beauty",
    icon: Sparkles,
  },
  {
    value: "other",
    label: "Other",
    icon: Package,
  },
] as const

export type OrderCategory =
  (typeof orderCategories)[number]["value"]