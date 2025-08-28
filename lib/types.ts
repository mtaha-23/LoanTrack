export interface Person {
  id: string
  userId: string
  name: string
  email: string | null
  phone: string | null
  notes: string | null
  createdAt: Date
  updatedAt: Date
}

export interface PersonInsert {
  name: string
  email?: string | null
  phone?: string | null
  notes?: string | null
}

export interface PersonUpdate {
  name?: string
  email?: string | null
  phone?: string | null
  notes?: string | null
}

export interface Transaction {
  id: string
  userId: string
  personId: string
  type: 'lent' | 'borrowed'
  amount: number
  description: string
  date: string
  isSettled: boolean
  settlementDate: string | null
  createdAt: Date
  updatedAt: Date
}

export interface TransactionInsert {
  type: 'lent' | 'borrowed'
  amount: number | undefined
  description: string
  date: string
  personId: string
  isSettled?: boolean
  settlementDate?: string | null
}

export interface TransactionUpdate {
  type?: 'lent' | 'borrowed'
  amount?: number | undefined
  description?: string
  date?: string
  isSettled?: boolean
  settlementDate?: string | null
}
