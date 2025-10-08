"use client"

import { useState } from 'react'

interface FrequencyInputProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export default function FrequencyInput({ value, onChange, disabled }: FrequencyInputProps) {
  const [morning, setMorning] = useState(() => {
    const parts = value.split('+')
    return parts[0] || '0'
  })
  const [afternoon, setAfternoon] = useState(() => {
    const parts = value.split('+')
    return parts[1] || '0'
  })
  const [night, setNight] = useState(() => {
    const parts = value.split('+')
    return parts[2] || '0'
  })

  const handleChange = (period: 'morning' | 'afternoon' | 'night', newValue: string) => {
    // Only allow numbers
    if (newValue && !/^\d+$/.test(newValue)) return
    
    let m = morning
    let a = afternoon
    let n = night
    
    if (period === 'morning') {
      m = newValue
      setMorning(newValue)
    } else if (period === 'afternoon') {
      a = newValue
      setAfternoon(newValue)
    } else {
      n = newValue
      setNight(newValue)
    }
    
    const frequencyString = `${m}+${a}+${n}`
    onChange(frequencyString)
  }

  const quickPresets = [
    { label: '1+0+1', value: '1+0+1', desc: 'Morning & Night' },
    { label: '1+1+1', value: '1+1+1', desc: 'Three times daily' },
    { label: '1+1+0', value: '1+1+0', desc: 'Morning & Afternoon' },
    { label: '0+0+1', value: '0+0+1', desc: 'Night only' },
    { label: '2+2+2', value: '2+2+2', desc: 'Six times daily' },
  ]

  const handlePresetClick = (presetValue: string) => {
    const parts = presetValue.split('+')
    setMorning(parts[0])
    setAfternoon(parts[1])
    setNight(parts[2])
    onChange(presetValue)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        {/* Morning */}
        <div className="flex-1">
          <label className="block text-xs font-medium mb-1 text-center" style={{color: 'var(--foreground-secondary)'}}>
            🌅 Morning
          </label>
          <input
            type="text"
            value={morning}
            onChange={(e) => handleChange('morning', e.target.value)}
            disabled={disabled}
            maxLength={2}
            className="w-full px-3 py-2 border rounded-lg text-center font-bold text-lg"
            style={{
              backgroundColor: 'var(--background)',
              borderColor: 'var(--border)',
              color: 'var(--foreground)'
            }}
            placeholder="0"
          />
        </div>

        <div className="text-2xl font-bold pt-6" style={{color: 'var(--foreground)'}}>+</div>

        {/* Afternoon */}
        <div className="flex-1">
          <label className="block text-xs font-medium mb-1 text-center" style={{color: 'var(--foreground-secondary)'}}>
            ☀️ Afternoon
          </label>
          <input
            type="text"
            value={afternoon}
            onChange={(e) => handleChange('afternoon', e.target.value)}
            disabled={disabled}
            maxLength={2}
            className="w-full px-3 py-2 border rounded-lg text-center font-bold text-lg"
            style={{
              backgroundColor: 'var(--background)',
              borderColor: 'var(--border)',
              color: 'var(--foreground)'
            }}
            placeholder="0"
          />
        </div>

        <div className="text-2xl font-bold pt-6" style={{color: 'var(--foreground)'}}>+</div>

        {/* Night */}
        <div className="flex-1">
          <label className="block text-xs font-medium mb-1 text-center" style={{color: 'var(--foreground-secondary)'}}>
            🌙 Night
          </label>
          <input
            type="text"
            value={night}
            onChange={(e) => handleChange('night', e.target.value)}
            disabled={disabled}
            maxLength={2}
            className="w-full px-3 py-2 border rounded-lg text-center font-bold text-lg"
            style={{
              backgroundColor: 'var(--background)',
              borderColor: 'var(--border)',
              color: 'var(--foreground)'
            }}
            placeholder="0"
          />
        </div>
      </div>

      {/* Quick Presets */}
      <div className="flex flex-wrap gap-2">
        {quickPresets.map((preset) => (
          <button
            key={preset.value}
            type="button"
            onClick={() => handlePresetClick(preset.value)}
            disabled={disabled}
            className="px-3 py-1 text-xs rounded-full border transition-colors hover:scale-105"
            style={{
              backgroundColor: value === preset.value ? 'var(--accent)' : 'var(--background)',
              borderColor: 'var(--border)',
              color: value === preset.value ? 'var(--accent-foreground)' : 'var(--foreground-secondary)'
            }}
            title={preset.desc}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Display result */}
      <div className="text-xs text-center p-2 rounded" style={{
        backgroundColor: 'var(--background-secondary)',
        color: 'var(--foreground-secondary)'
      }}>
        Frequency: <span className="font-bold" style={{color: 'var(--foreground)'}}>{value || '0+0+0'}</span>
      </div>
    </div>
  )
}