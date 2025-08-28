'use client'

import React, { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { DatePicker } from '@/components/ui/date-picker'
import { updateTransaction } from '@/lib/firebase-helpers'
import { Transaction, TransactionUpdate } from '@/lib/types'

interface EditTransactionModalProps {
  isOpen: boolean
  onClose: () => void
  transaction: Transaction
  onSuccess: () => void
}

export function EditTransactionModal({ 
  isOpen, 
  onClose, 
  transaction, 
  onSuccess 
}: EditTransactionModalProps) {
  const [formData, setFormData] = useState<TransactionUpdate>({
    type: transaction.type,
    amount: transaction.amount,
    description: transaction.description,
    date: transaction.date,
    isSettled: transaction.isSettled,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (transaction) {
      setFormData({
        type: transaction.type,
        amount: transaction.amount,
        description: transaction.description,
        date: transaction.date,
        isSettled: transaction.isSettled,
      })
    }
  }, [transaction])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await updateTransaction(transaction.id, formData)

      onSuccess()
      onClose()
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Transaction"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Transaction Type *
          </label>
          <div className="space-y-2">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="transactionType"
                value="lent"
                checked={formData.type === 'lent'}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'lent' | 'borrowed' })}
                className="w-4 h-4 text-primary bg-transparent border-gray-600 focus:ring-primary focus:ring-2 focus:ring-offset-0"
              />
              <span className="text-white">I lent money</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="transactionType"
                value="borrowed"
                checked={formData.type === 'borrowed'}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'lent' | 'borrowed' })}
                className="w-4 h-4 text-primary bg-transparent border-gray-600 focus:ring-primary focus:ring-2 focus:ring-offset-0"
              />
              <span className="text-white">I borrowed money</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Amount *
          </label>
          <Input
            type="number"
            step="0.01"
            min="0"
            value={formData.amount || ''}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value ? parseFloat(e.target.value) : undefined })}
            placeholder="0.00"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Description (Optional)
          </label>
          <Input
            type="text"
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="What was this for? (optional)"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Date *
          </label>
          <DatePicker
            value={formData.date || ''}
            onChange={(date) => setFormData({ ...formData, date })}
            placeholder="Select transaction date"
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isSettled"
            checked={formData.isSettled}
            onChange={(e) => setFormData({ ...formData, isSettled: e.target.checked })}
            className="rounded border-gray-300 text-primary focus:ring-primary"
          />
          <label htmlFor="isSettled" className="text-sm text-white">
            Mark as settled
          </label>
        </div>

        {error && (
          <div className="text-red-400 text-sm text-center bg-red-400/10 p-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1"
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Transaction'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
