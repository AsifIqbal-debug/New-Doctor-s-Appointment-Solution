"use client"

interface FrequencyDisplayProps {
  frequency: string
  className?: string
}

export default function FrequencyDisplay({ frequency, className = '' }: FrequencyDisplayProps) {
  // Parse the frequency format (e.g., "1+1+1" or "1+0+1")
  const parts = frequency.split('+')
  
  if (parts.length !== 3) {
    // If it's not in the new format, display as-is
    return <span className={className}>{frequency}</span>
  }

  const morning = parts[0] || '0'
  const afternoon = parts[1] || '0'
  const night = parts[2] || '0'

  const total = parseInt(morning) + parseInt(afternoon) + parseInt(night)

  return (
    <div className={`inline-flex flex-col gap-1 ${className}`}>
      {/* Main frequency in 1+1+1 format */}
      <div className="inline-flex items-center gap-1">
        <span className="text-sm font-medium" style={{color: 'var(--foreground-secondary)'}}>Frequency:</span>
        <span 
          className="px-3 py-1 rounded-lg font-bold text-base"
          style={{
            backgroundColor: 'var(--accent)',
            color: 'var(--accent-foreground)'
          }}
        >
          {morning}+{afternoon}+{night}
        </span>
        <span className="text-xs" style={{color: 'var(--foreground-secondary)'}}>
          ({total} {total === 1 ? 'time' : 'times'}/day)
        </span>
      </div>
      
      {/* Visual breakdown with emojis */}
      <div className="inline-flex items-center gap-2 text-xs" style={{color: 'var(--foreground-secondary)'}}>
        <span className="flex items-center gap-1">
          <span>🌅</span>
          <span>Morning: {morning}</span>
        </span>
        <span>•</span>
        <span className="flex items-center gap-1">
          <span>☀️</span>
          <span>Afternoon: {afternoon}</span>
        </span>
        <span>•</span>
        <span className="flex items-center gap-1">
          <span>🌙</span>
          <span>Night: {night}</span>
        </span>
      </div>
    </div>
  )
}