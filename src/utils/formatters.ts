export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(value))

export const formatSignedCurrency = (value: number) => {
  if (value > 0) {
    return `+${formatCurrency(value)}`
  }

  if (value < 0) {
    return `-${formatCurrency(value)}`
  }

  return formatCurrency(0)
}

export const formatTransactionAmount = (
  amount: number,
  type: "income" | "expense",
) => {
  const value =
    type === "expense"
      ? -Math.abs(amount)
      : Math.abs(amount)

  return formatSignedCurrency(value)
}

export const isValidDate = (value: string) => {
  const date = new Date(value)

  return !Number.isNaN(date.getTime())
}

export const isSameDay = (
  dateString: string,
  comparisonDate: Date,
) => {
  if (!isValidDate(dateString)) {
    return false
  }

  const date = new Date(dateString)

  return (
    date.toDateString() ===
    comparisonDate.toDateString()
  )
}

export const formatTransactionDate = (
  dateString: string,
) => {
  if (!isValidDate(dateString)) {
    return dateString
  }

  const date = new Date(dateString)
  const now = new Date()

  const yesterday = new Date()
  yesterday.setDate(now.getDate() - 1)

  const time = date.toLocaleTimeString("en-PH", {
    hour: "numeric",
    minute: "2-digit",
  })

  if (
    date.toDateString() ===
    now.toDateString()
  ) {
    return `Today, ${time}`
  }

  if (
    date.toDateString() ===
    yesterday.toDateString()
  ) {
    return `Yesterday, ${time}`
  }

  return date.toLocaleString("en-PH", {
    month: "short",
    day: "numeric",
    year:
      date.getFullYear() !==
      now.getFullYear()
        ? "numeric"
        : undefined,
    hour: "numeric",
    minute: "2-digit",
  })
}