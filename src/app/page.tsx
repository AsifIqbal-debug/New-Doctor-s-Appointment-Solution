"use client"

import { useState, useMemo } from 'react'
import { useDoctors } from '@/hooks/useDoctors'
import DoctorCard from '@/components/DoctorCard'
import { CategoryFilter, specialtyCategories } from '@/components/category-filter'
import BoardSwiper from '@/components/BoardSwiper'

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const { data: doctors, isLoading, error } = useDoctors(searchQuery)

  // Filter doctors by category
  const filteredDoctors = useMemo(() => {
    if (!doctors || !Array.isArray(doctors)) return []
    if (selectedCategory === 'all') return doctors
    return doctors.filter((doctor: any) => doctor.specialty === selectedCategory)
  }, [doctors, selectedCategory])

  // Get unique specialties from doctors
  const availableSpecialties = useMemo(() => {
    if (!doctors || !Array.isArray(doctors)) return []
    const specialties = Array.from(new Set(doctors.map((doctor: any) => doctor.specialty).filter(Boolean)))
    return specialties.filter((spec): spec is string => typeof spec === 'string').sort()
  }, [doctors])

  return (
    <div className="min-h-screen" style={{backgroundColor: 'var(--background)', color: 'var(--foreground)'}}>
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4 py-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Find the Right Doctor for You
          </h1>
          <p className="text-xl text-gray-700 dark:text-gray-200 max-w-2xl mx-auto">
            Book appointments with experienced doctors and manage your healthcare online.
            Quality care is just a click away.
          </p>
        </div>

        {/* Board Swiper Section */}
        <BoardSwiper />

      {/* Search Section */}
      <div className="max-w-md mx-auto">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by doctor name or specialty..."
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 dark:focus:placeholder-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Category Filter */}
      {availableSpecialties.length > 0 && (
        <CategoryFilter
          categories={availableSpecialties}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
      )}

      {/* Doctors Grid */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-600 dark:text-red-400 mb-2">Failed to load doctors</div>
            <button
              onClick={() => window.location.reload()}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline"
            >
              Try again
            </button>
          </div>
        ) : filteredDoctors && Array.isArray(filteredDoctors) && filteredDoctors.length > 0 ? (
          <>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              {searchQuery
                ? `Search Results (${filteredDoctors.length})`
                : selectedCategory === 'all'
                  ? `Available Doctors (${filteredDoctors.length})`
                  : `${selectedCategory} Specialists (${filteredDoctors.length})`
              }
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDoctors.map((doctor: any) => (
                <DoctorCard key={doctor.id} doctor={doctor} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-500 dark:text-gray-400 mb-2">
              {searchQuery
                ? 'No doctors found matching your search'
                : selectedCategory === 'all'
                  ? 'No doctors available'
                  : `No ${selectedCategory} specialists available`
              }
            </div>
            {(searchQuery || selectedCategory !== 'all') && (
              <div className="space-x-4">
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline"
                  >
                    Clear search
                  </button>
                )}
                {selectedCategory !== 'all' && (
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline"
                  >
                    Show all doctors
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Features Section */}
      {!searchQuery && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-200 dark:border-gray-700 mt-12">
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
            Why Choose Our Platform?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Easy Scheduling</h4>
              <p className="text-gray-600 dark:text-gray-300">Book appointments in just a few clicks with real-time availability</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Verified Doctors</h4>
              <p className="text-gray-600 dark:text-gray-300">All our doctors are verified professionals with proven expertise</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Digital Records</h4>
              <p className="text-gray-600 dark:text-gray-300">Access your prescriptions and test results anytime, anywhere</p>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}