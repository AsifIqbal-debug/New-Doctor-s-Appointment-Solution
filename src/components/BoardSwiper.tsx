"use client"

import { useState, useEffect } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination, Navigation, EffectCoverflow } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'
import 'swiper/css/effect-coverflow'

interface BoardCard {
  id: string
  type: 'BRANDING' | 'NOTICE' | 'DOCTOR_SPOTLIGHT'
  title: string
  content: string
  imageUrl?: string | null
  icon?: string | null
  link?: string | null
  color?: string | null
  isActive: boolean
  order: number
}

// Color mapping for card types
const getColorGradient = (color?: string | null, type?: string) => {
  if (color) {
    // Convert hex to gradient
    return `bg-gradient-to-br from-[${color}] to-[${color}]/80`
  }
  
  // Default colors based on type
  switch (type) {
    case 'BRANDING':
      return 'from-teal-500 to-cyan-600'
    case 'NOTICE':
      return 'from-blue-500 to-indigo-600'
    case 'DOCTOR_SPOTLIGHT':
      return 'from-purple-500 to-pink-600'
    default:
      return 'from-teal-500 to-cyan-600'
  }
}

export default function BoardSwiper() {
  const [cards, setCards] = useState<BoardCard[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCards()
  }, [])

  const fetchCards = async () => {
    try {
      // Try to fetch from API (public endpoint)
      const response = await fetch('/api/board-cards')
      
      if (response.ok) {
        const data = await response.json()
        setCards(data.cards || [])
      } else {
        // If API fails, use fallback data
        console.warn('Failed to fetch board cards, using fallback')
        setCards([])
      }
    } catch (error) {
      console.error('Error fetching board cards:', error)
      setCards([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="w-full py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-t-transparent"
                 style={{borderColor: 'var(--accent)', borderTopColor: 'transparent'}} />
            <p className="mt-4 text-foreground-secondary">Loading updates...</p>
          </div>
        </div>
      </div>
    )
  }

  if (cards.length === 0) {
    return null // Don't show anything if no cards
  }
  return (
    <div className="w-full py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8 text-foreground">
          Latest Updates & Information
        </h2>
        
        <Swiper
          modules={[Autoplay, Pagination, Navigation, EffectCoverflow]}
          effect="coverflow"
          grabCursor={true}
          centeredSlides={true}
          slidesPerView="auto"
          coverflowEffect={{
            rotate: 50,
            stretch: 0,
            depth: 100,
            modifier: 1,
            slideShadows: true,
          }}
          autoplay={{
            delay: 3500,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          pagination={{
            clickable: true,
            dynamicBullets: true,
          }}
          navigation={true}
          loop={true}
          className="board-swiper"
          breakpoints={{
            320: {
              slidesPerView: 1,
              spaceBetween: 20
            },
            640: {
              slidesPerView: 1.5,
              spaceBetween: 30
            },
            1024: {
              slidesPerView: 2,
              spaceBetween: 40
            },
            1280: {
              slidesPerView: 3,
              spaceBetween: 50
            }
          }}
        >
          {cards.map((card) => (
            <SwiperSlide key={card.id} className="pb-12">
              <div 
                className={`
                  relative h-80 rounded-2xl overflow-hidden shadow-2xl
                  bg-gradient-to-br ${getColorGradient(card.color, card.type)}
                  transform transition-all duration-300 hover:scale-105
                  cursor-pointer
                `}
                style={card.color ? {
                  background: `linear-gradient(to bottom right, ${card.color}, ${card.color}dd)`
                } : undefined}
              >
                {/* Background Image if provided */}
                {card.imageUrl && (
                  <div className="absolute inset-0">
                    <img 
                      src={card.imageUrl} 
                      alt={card.title}
                      className="w-full h-full object-cover opacity-30"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-black/40 to-black/60" />
                  </div>
                )}

                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0" style={{
                    backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                    backgroundSize: '20px 20px'
                  }} />
                </div>

                {/* Content */}
                <div className="relative h-full p-8 flex flex-col justify-between text-white">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-5xl">{card.icon || '📋'}</span>
                      <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
                        {card.type === 'BRANDING' ? 'Branding' : 
                         card.type === 'NOTICE' ? 'Notice' : 
                         'Doctor Spotlight'}
                      </div>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold leading-tight">
                      {card.title}
                    </h3>
                    <p className="text-white/90 text-base leading-relaxed line-clamp-3">
                      {card.content}
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between">
                    {card.link ? (
                      <a 
                        href={card.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-6 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105"
                      >
                        Learn More →
                      </a>
                    ) : (
                      <div className="bg-white/20 backdrop-blur-sm px-6 py-2 rounded-lg font-medium">
                        {card.type === 'BRANDING' ? '🏥 Branding' : 
                         card.type === 'NOTICE' ? '📢 Notice' : 
                         '👨‍⚕️ Featured'}
                      </div>
                    )}
                    <div className="w-12 h-1 bg-white/40 rounded-full" />
                  </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12" />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <style jsx global>{`
        .board-swiper {
          padding: 20px 0 60px;
        }
        
        .board-swiper .swiper-slide {
          width: 100%;
          max-width: 400px;
        }
        
        .board-swiper .swiper-pagination {
          bottom: 0;
        }
        
        .board-swiper .swiper-pagination-bullet {
          width: 12px;
          height: 12px;
          background: var(--accent);
          opacity: 0.5;
        }
        
        .board-swiper .swiper-pagination-bullet-active {
          opacity: 1;
          width: 32px;
          border-radius: 6px;
        }
        
        .board-swiper .swiper-button-next,
        .board-swiper .swiper-button-prev {
          color: var(--accent);
          background: var(--card);
          width: 48px;
          height: 48px;
          border-radius: 50%;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        .board-swiper .swiper-button-next:after,
        .board-swiper .swiper-button-prev:after {
          font-size: 20px;
          font-weight: bold;
        }
        
        .board-swiper .swiper-button-next:hover,
        .board-swiper .swiper-button-prev:hover {
          background: var(--accent);
          color: white;
        }
        
        @media (max-width: 768px) {
          .board-swiper .swiper-button-next,
          .board-swiper .swiper-button-prev {
            display: none;
          }
        }
      `}</style>
    </div>
  )
}