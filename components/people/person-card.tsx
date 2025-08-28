'use client'

import React, { useState } from 'react'
import { User, Plus, ChevronDown, ChevronRight, Phone, Mail, FileText, Trash2, Edit } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatCurrency, calculateBalance } from '@/lib/utils'
import { TransactionList } from '@/components/transactions/transaction-list'
import { AddTransactionModal } from '@/components/transactions/add-transaction-modal'
import { AddPersonModal } from '@/components/people/add-person-modal'
import { deletePerson } from '@/lib/firebase-helpers'
import { Person as PersonType, Transaction } from '@/lib/types'

interface PersonCardProps {
  person: PersonType
  transactions: Transaction[]
  onPersonUpdate: () => void
  onTransactionUpdate: () => void
}

export function PersonCard({ person, transactions, onPersonUpdate, onTransactionUpdate }: PersonCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showAddTransaction, setShowAddTransaction] = useState(false)
  const [showEditPerson, setShowEditPerson] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const balance = calculateBalance(transactions)
  const isPositive = balance > 0
  const isNegative = balance < 0

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deletePerson(person.id)
      onPersonUpdate()
      setShowDeleteConfirm(false)
    } catch (error: any) {
      alert(`Error deleting person: ${error.message}`)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <div className="glass-card rounded-xl p-4 sm:p-6 hover:shadow-2xl transition-all duration-300">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-6 h-6 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-xl font-semibold text-white truncate">{person.name}</h3>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-300">
                {person.email && (
                  <div className="flex items-center space-x-1">
                    <Mail className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{person.email}</span>
                  </div>
                )}
                {person.phone && (
                  <div className="flex items-center space-x-1">
                    <Phone className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{person.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="hidden sm:flex items-center justify-end space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEditPerson(true)}
              className="p-2 h-9 w-9"
              title="Edit person"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 h-9 w-9"
              title="Delete person"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 h-9 w-9"
              title={isExpanded ? "Collapse" : "Expand"}
            >
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Balance Display with Action Buttons */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className={`text-2xl font-bold ${
                isPositive ? 'text-green-400' : 
                isNegative ? 'text-red-400' : 
                'text-gray-300'
              }`}>
                {formatCurrency(Math.abs(balance))}
              </div>
              <div className="text-sm text-gray-400">
                {isPositive ? 'They owe you' : 
                 isNegative ? 'You owe them' : 
                 'All settled up'}
              </div>
            </div>
            
            {/* Action Buttons - Show on small screens next to balance */}
            <div className="flex items-center space-x-1 sm:hidden">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowEditPerson(true)}
                className="p-2 h-8 w-8"
                title="Edit person"
              >
                <Edit className="w-3 h-3" />
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2 h-8 w-8"
                title="Delete person"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2 h-8 w-8"
                title={isExpanded ? "Collapse" : "Expand"}
              >
                {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center space-x-2 mb-4">
          <Button
            onClick={() => setShowAddTransaction(true)}
            className="flex-1 sm:flex-none sm:w-auto"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Add Transaction</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>

        {/* Notes */}
        {person.notes && (
          <div className="mb-4 p-3 bg-white/5 rounded-lg">
            <div className="flex items-start space-x-2">
              <FileText className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-300 break-words">{person.notes}</p>
            </div>
          </div>
        )}

        {/* Expandable Transaction History */}
        {isExpanded && (
          <div className="mt-6 pt-6 border-t border-white/10">
            <h4 className="text-lg font-semibold text-white mb-4">Transaction History</h4>
            <TransactionList
              transactions={transactions}
              personId={person.id}
              onUpdate={onTransactionUpdate}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      <AddTransactionModal
        isOpen={showAddTransaction}
        onClose={() => setShowAddTransaction(false)}
        personId={person.id}
        personName={person.name}
        onSuccess={onTransactionUpdate}
      />

      <AddPersonModal
        isOpen={showEditPerson}
        onClose={() => setShowEditPerson(false)}
        person={person}
        onSuccess={onPersonUpdate}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-card rounded-xl p-6 max-w-md mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Delete {person.name}?
              </h3>
              <p className="text-gray-300 mb-6">
                This will permanently delete {person.name} and all their transaction history. 
                This action cannot be undone.
              </p>
              
              {transactions.length > 0 && (
                <div className="mb-6 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <p className="text-yellow-400 text-sm">
                    ⚠️ Warning: {person.name} has {transactions.length} transaction{transactions.length === 1 ? '' : 's'} that will also be deleted.
                  </p>
                </div>
              )}
              
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
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
    </>
  )
}
