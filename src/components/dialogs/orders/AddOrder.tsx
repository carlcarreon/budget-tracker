import { useMemo, useState } from "react"
import { ShoppingBag } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

import { QuickAction } from "@/pages/home/QuickAction"
import {
  orderCategories,
  type OrderCategory,
} from "@/supports/categories"

type AddOrderProps = {
  onSubmit: (payload: {
    name: string
    amount: number
    category: OrderCategory
  }) => void
}

export function AddOrder({
  onSubmit,
}: AddOrderProps) {
  const [open, setOpen] = useState(false)

  const [name, setName] = useState("")
  const [amount, setAmount] = useState("")
  const [category, setCategory] =
    useState<OrderCategory>("electronics")

  const amountValue = useMemo(
    () =>
      Number(
        amount.replace(/[^0-9.]/g, ""),
      ),
    [amount],
  )

  const resetForm = () => {
    setName("")
    setAmount("")
    setCategory("electronics")
  }

  const handleOpenChange = (
    value: boolean,
  ) => {
    setOpen(value)

    if (!value) {
      resetForm()
    }
  }

  const handleSubmit = () => {
    if (
      !name.trim() ||
      !Number.isFinite(amountValue) ||
      amountValue <= 0
    ) {
      return
    }

    onSubmit({
      name: name.trim(),
      amount: amountValue,
      category,
    })

    resetForm()
    setOpen(false)
  }

  return (
    <>
      <QuickAction
        icon={
          <ShoppingBag className="h-4 w-4" />
        }
        iconClassName="bg-amber-500/10 text-amber-600"
        title="Add Order"
        description="Track something"
        onClick={() => setOpen(true)}
      />

      <Dialog
        open={open}
        onOpenChange={handleOpenChange}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Add Order
            </DialogTitle>

            <DialogDescription>
              Add something you want to purchase
              and track its amount.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            {/* NAME */}
            <div className="space-y-2">
              <label
                className="text-xs font-medium text-slate-700"
                htmlFor="order-name"
              >
                Order name
              </label>

              <Input
                id="order-name"
                placeholder="New headphones"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
              />
            </div>

            {/* CATEGORY */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-700">
                Category
              </label>

              <div className="grid grid-cols-4 gap-2">
                {orderCategories.map(
                  (item) => {
                    const Icon = item.icon

                    const selected =
                      category === item.value

                    return (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() =>
                          setCategory(
                            item.value,
                          )
                        }
                        className={`
                          flex min-h-[72px]
                          flex-col items-center
                          justify-center gap-2
                          rounded-lg border
                          px-2 py-3
                          text-xs font-medium
                          transition-colors
                          ${
                            selected
                              ? "border-primary bg-primary/5 text-primary"
                              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                          }
                        `}
                      >
                        <Icon className="h-5 w-5" />

                        <span>
                          {item.label}
                        </span>
                      </button>
                    )
                  },
                )}
              </div>
            </div>

            {/* AMOUNT */}
            <div className="space-y-2">
              <label
                className="text-xs font-medium text-slate-700"
                htmlFor="order-amount"
              >
                Amount
              </label>

              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">
                  ₱
                </span>

                <Input
                  id="order-amount"
                  inputMode="decimal"
                  placeholder="0.00"
                  className="pl-7"
                  value={amount}
                  onChange={(event) =>
                    setAmount(
                      event.target.value,
                    )
                  }
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setOpen(false)
              }
            >
              Cancel
            </Button>

            <Button
              type="button"
              disabled={
                !name.trim() ||
                !Number.isFinite(
                  amountValue,
                ) ||
                amountValue <= 0
              }
              onClick={handleSubmit}
            >
              Save Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}