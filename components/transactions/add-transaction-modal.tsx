'use client'

import React, { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { addTransaction } from '@/lib/firebase-helpers'
import { TransactionInsert } from '@/lib/types'

interface AddTransactionModalProps {
  isOpen: boolean
  onClose: () => void
  personId: string
  personName: string
  onSuccess: () => void
}

export function AddTransactionModal({ 
  isOpen, 
  onClose, 
  personId, 
  personName, 
  onSuccess 
}: AddTransactionModalProps) {
  const [formData, setFormData] = useState<TransactionInsert>({
    type: 'lent',
    amount: undefined,
    description: '',
    date: new Date().toISOString().split('T')[0],
    personId: personId,
    isSettled: false,
  })

  // Reset form when modal opens or personId changes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        type: 'lent',
        amount: undefined,
        description: '',
        date: new Date().toISOString().split('T')[0],
        personId: personId,
        isSettled: false,
      })
    }
  }, [isOpen, personId])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const transactionData = {
        ...formData,
        personId: personId,
        amount: formData.amount || 0, // Convert undefined to 0 for database
      }

      await addTransaction(transactionData)

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
      title={`Add Transaction - ${personName}`}
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
              <span className="text-white">I lent money to {personName}</span>
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
              <span className="text-white">I borrowed money from {personName}</span>
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
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="What was this for? (optional)"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Date *
          </label>
          <Input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />
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
            {loading ? 'Adding...' : 'Add Transaction'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
