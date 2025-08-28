'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Edit, Trash2, CheckCircle, Circle } from 'lucide-react'
import { updateTransaction, deleteTransaction } from '@/lib/firebase-helpers'
import { Transaction } from '@/lib/types'
import { EditTransactionModal } from './edit-transaction-modal'

interface TransactionListProps {
  transactions: Transaction[]
  personId: string
  onUpdate: () => void
}

export function TransactionList({ transactions, personId, onUpdate }: TransactionListProps) {
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null)
  const [deleting, setDeleting] = useState(false)

  const handleSettle = async (transaction: Transaction) => {
    try {
      await updateTransaction(transaction.id, {
        isSettled: !transaction.isSettled,
        settlementDate: !transaction.isSettled ? new Date().toISOString() : null
      })
      onUpdate()
    } catch (error) {
      console.error('Error settling transaction:', error)
    }
  }

  const handleDelete = async (transaction: Transaction) => {
    setDeleting(true)
    try {
      await deleteTransaction(transaction.id)
      onUpdate()
      setDeletingTransaction(null)
    } catch (error: any) {
      alert(`Error deleting transaction: ${error.message}`)
    } finally {
      setDeleting(false)
    }
  }

  const sortedTransactions = [...transactions].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  if (sortedTransactions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <p>No transactions yet. Add your first transaction above!</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {sortedTransactions.map((transaction) => (
        <div
          key={transaction.id}
          className={`glass-card rounded-lg p-4 transition-all duration-200 ${
            transaction.isSettled ? 'opacity-60' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  transaction.type === 'lent' 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {transaction.type === 'lent' ? 'Lent' : 'Borrowed'}
                </div>
                <span className={`font-semibold ${
                  transaction.type === 'lent' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {formatCurrency(transaction.amount)}
                </span>
                {transaction.isSettled && (
                  <div className="flex items-center space-x-1 text-green-400">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-xs">Settled</span>
                  </div>
                )}
              </div>
              
              <p className="text-white text-sm mb-1">{transaction.description}</p>
              <p className="text-gray-400 text-xs">
                {formatDate(transaction.date)}
                {transaction.settlementDate && (
                  <span className="ml-2 text-green-400">
                    • Settled {formatDate(transaction.settlementDate)}
                  </span>
                )}
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSettle(transaction)}
                className="text-gray-400 hover:text-white"
                title={transaction.isSettled ? 'Mark as unsettled' : 'Mark as settled'}
              >
                {transaction.isSettled ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <Circle className="w-4 h-4" />
                )}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingTransaction(transaction)}
                className="text-gray-400 hover:text-white"
                title="Edit transaction"
              >
                <Edit className="w-4 h-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDeletingTransaction(transaction)}
                className="text-red-400 hover:text-red-300"
                title="Delete transaction"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}

      {/* Edit Transaction Modal */}
      {editingTransaction && (
        <EditTransactionModal
          isOpen={!!editingTransaction}
          onClose={() => setEditingTransaction(null)}
          transaction={editingTransaction}
          onSuccess={() => {
            onUpdate()
            setEditingTransaction(null)
          }}
        />
      )}

      {/* Delete Transaction Confirmation Modal */}
      {deletingTransaction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-card rounded-xl p-6 max-w-md mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Delete Transaction?
              </h3>
              <p className="text-gray-300 mb-6">
                This will permanently delete the transaction for {formatCurrency(deletingTransaction.amount)} 
                ({deletingTransaction.type === 'lent' ? 'lent to' : 'borrowed from'} the person) on {formatDate(deletingTransaction.date)}.
                {deletingTransaction.description && (
                  <span className="block mt-2 text-sm">
                    Description: "{deletingTransaction.description}"
                  </span>
                )}
                This action cannot be undone.
              </p>
              
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setDeletingTransaction(null)}
                  disabled={deleting}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(deletingTransaction)}
                  disabled={deleting}
                  className="flex-1"
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
