'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { PersonCard } from '@/components/people/person-card'
import { AddPersonModal } from '@/components/people/add-person-modal'
import { getPeople, getTransactions } from '@/lib/firebase-helpers'
import { auth } from '@/lib/firebase'
import { Person, Transaction } from '@/lib/types'
import { LogOut, Plus, DollarSign, TrendingUp, TrendingDown } from 'lucide-react'
import { signOut } from 'firebase/auth'

export function Dashboard() {
  const [people, setPeople] = useState<Person[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddPerson, setShowAddPerson] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    checkUser()
  }, [])

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  const checkUser = () => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user)
      if (user) {
        fetchData()
      }
    })

    return () => unsubscribe()
  }

  const fetchData = async () => {
    try {
      if (!auth.currentUser) return

     

      // Fetch people and transactions
      const [peopleData, transactionsData] = await Promise.all([
        getPeople(),
        getTransactions()
      ])

      

      setPeople(peopleData)
      setTransactions(transactionsData)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshData = () => {

    fetchData()
  }

  const handleSignOut = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const getTransactionsForPerson = (personId: string) => {
    return transactions.filter(t => t.personId === personId)
  }

  const getTotalBalance = () => {
    return transactions.reduce((total, transaction) => {
      if (transaction.type === 'lent') {
        return total + transaction.amount
      } else {
        return total - transaction.amount
      }
    }, 0)
  }

  const getTotalLent = () => {
    return transactions
      .filter(t => t.type === 'lent')
      .reduce((total, t) => total + t.amount, 0)
  }

  const getTotalBorrowed = () => {
    return transactions
      .filter(t => t.type === 'borrowed')
      .reduce((total, t) => total + t.amount, 0)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading your finances...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Personal Finance Tracker
            </h1>
            <p className="text-gray-300 text-lg">
              Track money lent to and borrowed from friends and family
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={handleSignOut}
              className="text-gray-300 hover:text-white"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total Balance</p>
                <p className={`text-2xl font-bold ${
                  getTotalBalance() > 0 ? 'text-green-400' : 
                  getTotalBalance() < 0 ? 'text-red-400' : 
                  'text-white'
                }`}>
                  ${Math.abs(getTotalBalance()).toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total Lent</p>
                <p className="text-2xl font-bold text-green-400">
                  ${getTotalLent().toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total Borrowed</p>
                <p className="text-2xl font-bold text-red-400">
                  ${getTotalBorrowed().toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Add Person Button */}
        <div className="flex justify-center mb-8">
          <Button
            onClick={() => setShowAddPerson(true)}
            size="lg"
            className="h-14 px-8 text-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add New Person
          </Button>
        </div>
      </div>

      {/* People Grid */}
      <div className="max-w-7xl mx-auto">
        {people.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Plus className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-2">
              No people added yet
            </h3>
            <p className="text-gray-400 mb-6">
              Start by adding your first person to track finances with
            </p>
            <Button
              onClick={() => setShowAddPerson(true)}
              size="lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Person
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {people.map((person) => (
              <PersonCard
                key={person.id}
                person={person}
                transactions={getTransactionsForPerson(person.id)}
                onPersonUpdate={refreshData}
                onTransactionUpdate={refreshData}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add Person Modal */}
      <AddPersonModal
        isOpen={showAddPerson}
        onClose={() => setShowAddPerson(false)}
        onSuccess={refreshData}
      />
    </div>
  )
}
