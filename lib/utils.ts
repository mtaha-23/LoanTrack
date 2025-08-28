import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function calculateBalance(transactions: Array<{ type: 'lent' | 'borrowed', amount: number }>): number {
  return transactions.reduce((balance, transaction) => {
    if (transaction.type === 'lent') {
      return balance + transaction.amount
    } else {
      return balance - transaction.amount
    }
  }, 0)
}
