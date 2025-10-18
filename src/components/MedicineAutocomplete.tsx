'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, Loader2 } from 'lucide-react'

interface Medicine {
  id: string
  name: string
  genericName: string
  strength: string
  form: string
  manufacturer: string
  price: number | null
}

interface MedicineAutocompleteProps {
  onSelect: (medicine: Medicine) => void
  placeholder?: string
  defaultValue?: string
}

export default function MedicineAutocomplete({
  onSelect,
  placeholder = 'Search medicines (e.g., Napa, Ace, Seclo)...',
  defaultValue = ''
}: MedicineAutocompleteProps) {
  const [query, setQuery] = useState(defaultValue)
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  // Search medicines with debouncing
  useEffect(() => {
    if (query.trim().length === 0) {
      setMedicines([])
      setIsOpen(false)
      return
    }

    // Clear previous timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    // Set new timeout
    debounceRef.current = setTimeout(async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/medicines/search?q=${encodeURIComponent(query)}`)
        if (response.ok) {
          const data = await response.json()
          setMedicines(data)
          setIsOpen(data.length > 0)
          setSelectedIndex(-1)
        }
      } catch (error) {
        console.error('Failed to search medicines:', error)
        setMedicines([])
      } finally {
        setIsLoading(false)
      }
    }, 300)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [query])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || medicines.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => (prev < medicines.length - 1 ? prev + 1 : 0))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : medicines.length - 1))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0) {
          handleSelect(medicines[selectedIndex])
        }
        break
      case 'Escape':
        e.preventDefault()
        setIsOpen(false)
        break
    }
  }

  const handleSelect = (medicine: Medicine) => {
    onSelect(medicine)
    setQuery('')
    setMedicines([])
    setIsOpen(false)
    setSelectedIndex(-1)
    inputRef.current?.focus()
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Search Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (medicines.length > 0) setIsOpen(true)
          }}
          placeholder={placeholder}
          className="w-full px-4 py-2.5 pl-10 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 text-teal-500 w-5 h-5 animate-spin" />
        )}
      </div>

      {/* Dropdown Results */}
      {isOpen && medicines.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-96 overflow-y-auto">
          <div className="py-2">
            {medicines.map((medicine, index) => (
              <button
                key={medicine.id}
                onClick={() => handleSelect(medicine)}
                className={`w-full px-4 py-3 text-left transition-colors ${
                  index === selectedIndex
                    ? 'bg-teal-50 dark:bg-teal-900/20'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                      {medicine.name} <span className="text-teal-600 dark:text-teal-400">{medicine.strength}</span>
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {medicine.genericName} • {medicine.form}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 truncate mt-0.5">
                      {medicine.manufacturer}
                    </p>
                  </div>
                  {medicine.price && (
                    <div className="flex-shrink-0 text-right">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        ৳{medicine.price.toFixed(2)}
                      </p>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {isOpen && !isLoading && query.trim().length > 0 && medicines.length === 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-4 text-center">
          <p className="text-gray-500 dark:text-gray-400">No medicines found for "{query}"</p>
        </div>
      )}
    </div>
  )
}
