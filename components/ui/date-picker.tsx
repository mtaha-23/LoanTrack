'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from './button'

interface DatePickerProps {
  value: string
  onChange: (date: string) => void
  placeholder?: string
  className?: string
}

export function DatePicker({ value, onChange, placeholder = "Select date", className = "" }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(value ? new Date(value) : new Date())
  const [dropdownPosition, setDropdownPosition] = useState<'bottom' | 'top'>('bottom')
  const [dropdownAlignment, setDropdownAlignment] = useState<'left' | 'right'>('left')
  const datePickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (value) {
      setSelectedDate(new Date(value))
    }
  }, [value])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const calculateDropdownPosition = (): { vertical: 'bottom' | 'top'; horizontal: 'left' | 'right' } => {
    if (!datePickerRef.current) return { vertical: 'bottom', horizontal: 'left' }
    
    const rect = datePickerRef.current.getBoundingClientRect()
    const viewportHeight = window.innerHeight
    const viewportWidth = window.innerWidth
    const dropdownHeight = 320 // Approximate height of the calendar dropdown
    const dropdownWidth = 280 // Width of the calendar dropdown
    
    let vertical: 'bottom' | 'top' = 'bottom'
    let horizontal: 'left' | 'right' = 'left'
    
    // Check vertical position
    if (rect.bottom + dropdownHeight > viewportHeight && rect.top > dropdownHeight) {
      vertical = 'top'
    }
    
    // Check horizontal position
    if (rect.left + dropdownWidth > viewportWidth) {
      horizontal = 'right'
    }
    
    return { vertical, horizontal }
  }

  const handleToggle = () => {
    if (!isOpen) {
      const position = calculateDropdownPosition()
      setDropdownPosition(position.vertical)
      setDropdownAlignment(position.horizontal)
    }
    setIsOpen(!isOpen)
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDay = firstDay.getDay()
    
    return { daysInMonth, startingDay }
  }

  const getPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const getNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const handleDateSelect = (day: number) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    setSelectedDate(newDate)
    onChange(newDate.toISOString().split('T')[0])
    setIsOpen(false)
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const { daysInMonth, startingDay } = getDaysInMonth(currentMonth)
  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  const days = []
  for (let i = 0; i < startingDay; i++) {
    days.push(<div key={`empty-${i}`} className="w-8 h-8" />)
  }
  
  for (let day = 1; day <= daysInMonth; day++) {
    const isSelected = selectedDate && 
      selectedDate.getDate() === day && 
      selectedDate.getMonth() === currentMonth.getMonth() && 
      selectedDate.getFullYear() === currentMonth.getFullYear()
    
    const isToday = new Date().toDateString() === new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toDateString()
    
    days.push(
      <button
        key={day}
        onClick={() => handleDateSelect(day)}
        className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
          isSelected 
            ? 'bg-primary text-white' 
            : isToday 
              ? 'bg-primary/20 text-primary hover:bg-primary/30' 
              : 'text-white hover:bg-white/10'
        }`}
      >
        {day}
      </button>
    )
  }

  return (
    <div className={`relative ${className}`} ref={datePickerRef}>
      <Button
        type="button"
        variant="outline"
        onClick={handleToggle}
        className="w-full justify-between text-left font-normal"
      >
        <span className={value ? 'text-white' : 'text-gray-400'}>
          {value ? formatDate(new Date(value)) : placeholder}
        </span>
        <Calendar className="w-4 h-4 text-gray-400" />
      </Button>

             {isOpen && (
         <div className={`absolute z-50 bg-gray-900 border border-gray-700 rounded-lg shadow-xl p-4 min-w-[280px] max-w-[90vw] ${
           dropdownPosition === 'bottom' 
             ? `top-full mt-2 ${dropdownAlignment === 'left' ? 'left-0' : 'right-0'}`
             : `bottom-full mb-2 ${dropdownAlignment === 'left' ? 'left-0' : 'right-0'}`
         }`}>
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={getPreviousMonth}
              className="p-1 hover:bg-white/10"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <h3 className="text-white font-medium">{monthName}</h3>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={getNextMonth}
              className="p-1 hover:bg-white/10"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Days of week */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="w-8 h-8 flex items-center justify-center text-xs text-gray-400 font-medium">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {days}
          </div>

          {/* Today button */}
          <div className="mt-4 pt-4 border-t border-gray-700">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const today = new Date()
                setSelectedDate(today)
                onChange(today.toISOString().split('T')[0])
                setIsOpen(false)
              }}
              className="w-full"
            >
              Today
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
