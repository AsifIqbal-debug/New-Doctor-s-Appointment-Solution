'use client'

interface CategoryFilterProps {
  categories: string[]
  selectedCategory: string
  onCategoryChange: (category: string) => void
}

export function CategoryFilter({ categories, selectedCategory, onCategoryChange }: CategoryFilterProps) {
  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Specialties
      </h3>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onCategoryChange('all')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            selectedCategory === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          All Specialties
        </button>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === category
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  )
}

// Specialty categories with emojis for better visual appeal
export const specialtyCategories = [
  { name: 'Internal Medicine', emoji: '🩺', description: 'General medicine and primary care' },
  { name: 'Cardiology', emoji: '❤️', description: 'Heart and cardiovascular health' },
  { name: 'Gynecology', emoji: '👩‍⚕️', description: 'Women\'s health and reproductive care' },
  { name: 'Orthopedics', emoji: '🦴', description: 'Bone, joint, and musculoskeletal care' },
  { name: 'Dentistry', emoji: '🦷', description: 'Dental and oral health care' },
  { name: 'Dermatology', emoji: '👨‍⚕️', description: 'Skin, hair, and nail conditions' },
]