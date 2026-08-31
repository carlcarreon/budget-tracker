import { useMemo, useState } from "react"
import { WalletCards } from "lucide-react"

import { QuickAction } from "@/pages/home/QuickAction"

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

type AddPaylaterProps = {
  onSubmit: (payload: {
    name: string
    months: number
    monthlyPayment: number
    imageUrl?: string
  }) => void
}

export function AddPaylater({
  onSubmit,
}: AddPaylaterProps) {
  const [open, setOpen] = useState(false)

  const [name, setName] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [months, setMonths] = useState("")
  const [monthlyPayment, setMonthlyPayment] =
    useState("")

  const parsedMonths = useMemo(
    () =>
      Number(
        months.replace(/[^0-9]/g, ""),
      ),
    [months],
  )

  const parsedMonthlyPayment = useMemo(
    () =>
      Number(
        monthlyPayment.replace(/[^0-9.]/g, ""),
      ),
    [monthlyPayment],
  )

  const totalAmount = useMemo(
    () =>
      parsedMonths * parsedMonthlyPayment,
    [parsedMonths, parsedMonthlyPayment],
  )

  const resetForm = () => {
    setName("")
    setImageUrl("")
    setMonths("")
    setMonthlyPayment("")
  }

  const handleOpenChange = (value: boolean) => {
    setOpen(value)

    if (!value) {
      resetForm()
    }
  }

  const handleSubmit = () => {
    if (
      !name.trim() ||
      !Number.isFinite(parsedMonths) ||
      parsedMonths <= 0 ||
      !Number.isFinite(parsedMonthlyPayment) ||
      parsedMonthlyPayment <= 0
    ) {
      return
    }

    onSubmit({
      name: name.trim(),
      months: parsedMonths,
      monthlyPayment: parsedMonthlyPayment,
      imageUrl: imageUrl.trim() || undefined,
    })

    resetForm()
    setOpen(false)
  }

  return (
    <>
      {/* QUICK ACTION */}
      <QuickAction
        icon={<WalletCards className="h-4 w-4" />}
        iconClassName="bg-violet-500/10 text-violet-600"
        title="Add PayLater"
        description="Track payments"
        onClick={() => setOpen(true)}
      />

      {/* DIALOG */}
      <Dialog
        open={open}
        onOpenChange={handleOpenChange}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Add PayLater
            </DialogTitle>

            <DialogDescription>
              Enter the item and payment details.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            {/* ITEM NAME */}
            <div className="space-y-2">
              <label
                className="text-xs font-medium text-slate-700"
                htmlFor="paylater-name"
              >
                Item name
              </label>

              <Input
                id="paylater-name"
                placeholder="Shopee order"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
              />
            </div>

            {/* IMAGE URL */}
            <div className="space-y-2">
              <label
                className="text-xs font-medium text-slate-700"
                htmlFor="paylater-image"
              >
                Image URL
              </label>

              <Input
                id="paylater-image"
                placeholder="https://..."
                value={imageUrl}
                onChange={(event) =>
                  setImageUrl(event.target.value)
                }
              />
            </div>

            {/* MONTHS */}
            <div className="space-y-2">
              <label
                className="text-xs font-medium text-slate-700"
                htmlFor="paylater-months"
              >
                How many months
              </label>

              <Input
                id="paylater-months"
                inputMode="numeric"
                placeholder="6"
                value={months}
                onChange={(event) =>
                  setMonths(event.target.value)
                }
              />
            </div>

            {/* MONTHLY PAYMENT */}
            <div className="space-y-2">
              <label
                className="text-xs font-medium text-slate-700"
                htmlFor="paylater-monthly"
              >
                Monthly payment
              </label>

              <Input
                id="paylater-monthly"
                inputMode="decimal"
                placeholder="₱0.00"
                value={monthlyPayment}
                onChange={(event) =>
                  setMonthlyPayment(event.target.value)
                }
              />
            </div>

            {/* TOTAL */}
            {parsedMonths > 0 &&
            parsedMonthlyPayment > 0 ? (
              <div className="rounded-xl bg-violet-50 px-3 py-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-violet-700">
                    Total PayLater
                  </span>

                  <span className="text-sm font-bold text-violet-700">
                    ₱
                    {totalAmount.toLocaleString(
                      "en-PH",
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      },
                    )}
                  </span>
                </div>
              </div>
            ) : null}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>

            <Button
              type="button"
              onClick={handleSubmit}
            >
              Save PayLater
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}