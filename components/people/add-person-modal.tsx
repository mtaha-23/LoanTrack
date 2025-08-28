'use client'

import React, { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { addPerson, updatePerson } from '@/lib/firebase-helpers'
import { Person, PersonInsert } from '@/lib/types'

interface AddPersonModalProps {
  isOpen: boolean
  onClose: () => void
  person?: Person
  onSuccess: () => void
}

export function AddPersonModal({ isOpen, onClose, person, onSuccess }: AddPersonModalProps) {
  const [formData, setFormData] = useState<PersonInsert>({
    name: '',
    email: '',
    phone: '',
    notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isEditing = !!person

  useEffect(() => {
    if (person) {
      setFormData({
        name: person.name,
        email: person.email,
        phone: person.phone,
        notes: person.notes,
      })
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        notes: '',
      })
    }
  }, [person])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isEditing && person) {
        await updatePerson(person.id, formData)
      } else {
        await addPerson(formData)
      }

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
      title={isEditing ? 'Edit Person' : 'Add New Person'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Name *
          </label>
          <Input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter full name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Email
          </label>
          <Input
            type="email"
            value={formData.email || ''}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="Enter email address"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Phone
          </label>
          <Input
            type="tel"
            value={formData.phone || ''}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="Enter phone number"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Notes
          </label>
          <Textarea
            value={formData.notes || ''}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Add any notes about this person"
            rows={3}
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
            {loading ? 'Saving...' : (isEditing ? 'Update' : 'Add Person')}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
