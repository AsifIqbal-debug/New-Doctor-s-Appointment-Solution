'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ImageUpload from '@/components/ImageUpload';

interface BoardCard {
  id: string;
  type: 'BRANDING' | 'NOTICE' | 'DOCTOR_SPOTLIGHT';
  title: string;
  content: string;
  imageUrl?: string | null;
  icon?: string | null;
  link?: string | null;
  color?: string | null;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

const CARD_TYPES = [
  { value: 'BRANDING', label: '🏥 Branding Card', description: 'Welcome messages and clinic branding' },
  { value: 'NOTICE', label: '📅 Notice Card', description: 'Important announcements and notices' },
  { value: 'DOCTOR_SPOTLIGHT', label: '👨‍⚕️ Doctor Spotlight', description: 'Featured doctor profiles' }
];

const COLOR_OPTIONS = [
  { value: '#14B8A6', label: 'Teal (Default)', preview: '#14B8A6' },
  { value: '#3B82F6', label: 'Blue', preview: '#3B82F6' },
  { value: '#8B5CF6', label: 'Purple', preview: '#8B5CF6' },
  { value: '#EC4899', label: 'Pink', preview: '#EC4899' },
  { value: '#F59E0B', label: 'Orange', preview: '#F59E0B' },
  { value: '#10B981', label: 'Green', preview: '#10B981' },
  { value: '#EF4444', label: 'Red', preview: '#EF4444' }
];

export default function BoardCardsAdminPage() {
  const router = useRouter();
  const [cards, setCards] = useState<BoardCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState<BoardCard | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    type: 'BRANDING' as 'BRANDING' | 'NOTICE' | 'DOCTOR_SPOTLIGHT',
    title: '',
    content: '',
    imageUrl: '',
    icon: '',
    link: '',
    color: '#14B8A6',
    isActive: true,
    order: 0
  });

  // Fetch cards
  const fetchCards = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/board-cards');
      if (!response.ok) throw new Error('Failed to fetch cards');
      const data = await response.json();
      setCards(data.cards || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load cards');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  // Reset form
  const resetForm = () => {
    setFormData({
      type: 'BRANDING',
      title: '',
      content: '',
      imageUrl: '',
      icon: '',
      link: '',
      color: '#14B8A6',
      isActive: true,
      order: cards.length
    });
  };

  // Handle Add
  const handleAdd = () => {
    resetForm();
    setFormData(prev => ({ ...prev, order: cards.length }));
    setShowAddModal(true);
  };

  // Handle Edit
  const handleEdit = (card: BoardCard) => {
    setSelectedCard(card);
    setFormData({
      type: card.type,
      title: card.title,
      content: card.content,
      imageUrl: card.imageUrl || '',
      icon: card.icon || '',
      link: card.link || '',
      color: card.color || '#14B8A6',
      isActive: card.isActive,
      order: card.order
    });
    setShowEditModal(true);
  };

  // Handle Delete
  const handleDelete = (card: BoardCard) => {
    setSelectedCard(card);
    setShowDeleteModal(true);
  };

  // Submit Add
  const submitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/board-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create card');
      }

      setSuccessMessage('Board card created successfully!');
      setShowAddModal(false);
      resetForm();
      fetchCards();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create card');
      setTimeout(() => setError(''), 5000);
    }
  };

  // Submit Edit
  const submitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCard) return;

    try {
      const response = await fetch(`/api/admin/board-cards/${selectedCard.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update card');
      }

      setSuccessMessage('Board card updated successfully!');
      setShowEditModal(false);
      setSelectedCard(null);
      resetForm();
      fetchCards();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update card');
      setTimeout(() => setError(''), 5000);
    }
  };

  // Submit Delete
  const submitDelete = async () => {
    if (!selectedCard) return;

    try {
      const response = await fetch(`/api/admin/board-cards/${selectedCard.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete card');
      }

      setSuccessMessage('Board card deleted successfully!');
      setShowDeleteModal(false);
      setSelectedCard(null);
      fetchCards();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete card');
      setTimeout(() => setError(''), 5000);
    }
  };

  // Toggle Active Status
  const toggleActive = async (card: BoardCard) => {
    try {
      const response = await fetch(`/api/admin/board-cards/${card.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !card.isActive })
      });

      if (!response.ok) throw new Error('Failed to toggle status');
      
      setSuccessMessage(`Card ${!card.isActive ? 'activated' : 'deactivated'} successfully!`);
      fetchCards();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle status');
      setTimeout(() => setError(''), 5000);
    }
  };

  // Render Form Fields
  const renderFormFields = () => (
    <>
      {/* Type Selection */}
      <div>
        <label className="block text-base font-semibold mb-3" style={{color: 'var(--foreground)'}}>
          Card Type *
        </label>
        <div className="space-y-3">
          {CARD_TYPES.map(type => (
            <label
              key={type.value}
              className="flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all hover:scale-[1.02]"
              style={{
                borderColor: formData.type === type.value ? 'var(--accent)' : 'var(--border)',
                backgroundColor: formData.type === type.value ? 'var(--accent-light)' : 'var(--background)',
                boxShadow: formData.type === type.value ? '0 4px 12px rgba(20, 184, 166, 0.2)' : 'none'
              }}
            >
              <input
                type="radio"
                name="type"
                value={type.value}
                checked={formData.type === type.value}
                onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                className="mt-1 w-5 h-5"
                style={{accentColor: 'var(--accent)'}}
              />
              <div className="flex-1">
                <div className="font-semibold text-lg mb-1" style={{color: 'var(--foreground)'}}>{type.label}</div>
                <div className="text-sm" style={{color: 'var(--foreground-secondary)'}}>{type.description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Title */}
      <div>
        <label className="block text-base font-semibold mb-3" style={{color: 'var(--foreground)'}}>
          Title *
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
          required
          placeholder="e.g., Welcome to DentCare"
          className="w-full px-5 py-3.5 rounded-xl border-2 text-base transition-all focus:scale-[1.01]"
          style={{
            backgroundColor: 'var(--background)',
            borderColor: 'var(--border)',
            color: 'var(--foreground)'
          }}
        />
      </div>

      {/* Content */}
      <div>
        <label className="block text-base font-semibold mb-3" style={{color: 'var(--foreground)'}}>
          Content *
        </label>
        <textarea
          value={formData.content}
          onChange={(e) => setFormData({...formData, content: e.target.value})}
          required
          rows={5}
          placeholder="Describe your card content here..."
          className="w-full px-5 py-3.5 rounded-xl border-2 text-base transition-all focus:scale-[1.01]"
          style={{
            backgroundColor: 'var(--background)',
            borderColor: 'var(--border)',
            color: 'var(--foreground)'
          }}
        />
      </div>

      {/* Image Upload */}
      <div>
        <ImageUpload
          label="Card Image (Optional)"
          value={formData.imageUrl}
          onChange={(url) => setFormData({...formData, imageUrl: url})}
        />
      </div>

      {/* Icon */}
      <div>
        <label className="block text-base font-semibold mb-3" style={{color: 'var(--foreground)'}}>
          Icon (Optional)
        </label>
        <input
          type="text"
          value={formData.icon}
          onChange={(e) => setFormData({...formData, icon: e.target.value})}
          placeholder="e.g., 🏥 or emoji/icon name"
          className="w-full px-5 py-3.5 rounded-xl border-2 text-base"
          style={{
            backgroundColor: 'var(--background)',
            borderColor: 'var(--border)',
            color: 'var(--foreground)'
          }}
        />
        <p className="text-sm mt-2 flex items-center gap-2" style={{color: 'var(--foreground-secondary)'}}>
          💡 Tip: Enter an emoji (🏥 📅 👨‍⚕️) or icon identifier
        </p>
      </div>

      {/* Link */}
      <div>
        <label className="block text-base font-semibold mb-3" style={{color: 'var(--foreground)'}}>
          Link (Optional)
        </label>
        <input
          type="url"
          value={formData.link}
          onChange={(e) => setFormData({...formData, link: e.target.value})}
          placeholder="https://example.com/learn-more"
          className="w-full px-5 py-3.5 rounded-xl border-2 text-base"
          style={{
            backgroundColor: 'var(--background)',
            borderColor: 'var(--border)',
            color: 'var(--foreground)'
          }}
        />
      </div>

      {/* Color */}
      <div>
        <label className="block text-base font-semibold mb-3" style={{color: 'var(--foreground)'}}>
          Accent Color
        </label>
        <div className="grid grid-cols-2 gap-3">
          {COLOR_OPTIONS.map(color => (
            <label
              key={color.value}
              className="flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all hover:scale-105"
              style={{
                borderColor: formData.color === color.value ? color.preview : 'var(--border)',
                borderWidth: formData.color === color.value ? '3px' : '2px',
                backgroundColor: formData.color === color.value ? `${color.preview}10` : 'var(--background)'
              }}
            >
              <input
                type="radio"
                name="color"
                value={color.value}
                checked={formData.color === color.value}
                onChange={(e) => setFormData({...formData, color: e.target.value})}
                className="hidden"
              />
              <div
                className="w-8 h-8 rounded-lg shadow-md"
                style={{backgroundColor: color.preview}}
              />
              <span className="text-base font-medium" style={{color: 'var(--foreground)'}}>{color.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Order */}
      <div>
        <label className="block text-base font-semibold mb-3" style={{color: 'var(--foreground)'}}>
          Display Order
        </label>
        <input
          type="number"
          value={formData.order}
          onChange={(e) => setFormData({...formData, order: parseInt(e.target.value) || 0})}
          min="0"
          className="w-full px-5 py-3.5 rounded-xl border-2 text-base"
          style={{
            backgroundColor: 'var(--background)',
            borderColor: 'var(--border)',
            color: 'var(--foreground)'
          }}
        />
        <p className="text-sm mt-2 flex items-center gap-2" style={{color: 'var(--foreground-secondary)'}}>
          📊 Lower numbers appear first in the carousel
        </p>
      </div>

      {/* Active Status */}
      <div className="p-4 rounded-xl border-2" style={{borderColor: 'var(--border)', backgroundColor: 'var(--background)'}}>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.isActive}
            onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
            className="w-5 h-5"
            style={{accentColor: 'var(--accent)'}}
          />
          <div>
            <span className="text-base font-semibold block" style={{color: 'var(--foreground)'}}>
              Active (visible on home page)
            </span>
            <span className="text-sm" style={{color: 'var(--foreground-secondary)'}}>
              Uncheck to save as draft
            </span>
          </div>
        </label>
      </div>
    </>
  );

  return (
    <div className="min-h-screen p-4 md:p-8" style={{backgroundColor: 'var(--background)'}}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{color: 'var(--foreground)'}}>
              🎨 Board Cards Management
            </h1>
            <p className="text-base" style={{color: 'var(--foreground-secondary)'}}>
              Create and manage carousel cards for your home page
            </p>
          </div>
          <button
            onClick={handleAdd}
            className="px-8 py-4 rounded-xl font-semibold transition-all hover:scale-105 hover:shadow-lg flex items-center gap-2 whitespace-nowrap"
            style={{backgroundColor: 'var(--accent)', color: 'var(--accent-foreground)'}}
          >
            <span className="text-2xl">+</span>
            <span>Add New Card</span>
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-5 rounded-xl bg-red-50 dark:bg-red-900/20 border-2 border-red-500 animate-shake">
            <div className="flex items-center gap-3">
              <span className="text-3xl">⚠️</span>
              <p className="text-red-700 dark:text-red-400 font-medium">{error}</p>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-5 rounded-xl bg-green-50 dark:bg-green-900/20 border-2 border-green-500 animate-slide-down">
            <div className="flex items-center gap-3">
              <span className="text-3xl">✅</span>
              <p className="text-green-700 dark:text-green-400 font-medium">{successMessage}</p>
            </div>
          </div>
        )}

        {/* Cards List */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-t-transparent mb-4"
                 style={{borderColor: 'var(--accent)', borderTopColor: 'transparent'}} />
            <p className="text-lg font-medium" style={{color: 'var(--foreground-secondary)'}}>Loading cards...</p>
          </div>
        ) : cards.length === 0 ? (
          <div className="text-center py-20 px-6 rounded-2xl border-2 border-dashed"
               style={{borderColor: 'var(--border)', backgroundColor: 'var(--card)'}}>
            <div className="text-8xl mb-6 animate-bounce">🎴</div>
            <p className="text-2xl font-bold mb-3" style={{color: 'var(--foreground)'}}>
              No board cards yet
            </p>
            <p className="text-lg mb-8 max-w-md mx-auto" style={{color: 'var(--foreground-secondary)'}}>
              Create your first card to display on the home page carousel and engage your visitors
            </p>
            <button
              onClick={handleAdd}
              className="px-8 py-4 rounded-xl font-semibold text-lg hover:scale-105 transition-transform"
              style={{backgroundColor: 'var(--accent)', color: 'var(--accent-foreground)'}}
            >
              🚀 Create First Card
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {cards.map(card => (
              <div
                key={card.id}
                className="p-6 rounded-2xl border-2 transition-all hover:shadow-xl"
                style={{
                  backgroundColor: 'var(--card)',
                  borderColor: card.isActive ? 'var(--accent)' : 'var(--border)',
                  boxShadow: card.isActive ? '0 4px 20px rgba(20, 184, 166, 0.1)' : 'none'
                }}
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Card Preview */}
                  <div className="flex-shrink-0">
                    {card.imageUrl ? (
                      <img
                        src={card.imageUrl}
                        alt={card.title}
                        className="w-40 h-40 object-cover rounded-xl border-4 shadow-lg"
                        style={{borderColor: 'var(--accent)'}}
                      />
                    ) : (
                      <div
                        className="w-40 h-40 rounded-xl flex items-center justify-center text-5xl shadow-lg"
                        style={{backgroundColor: card.color || '#14B8A6', color: 'white'}}
                      >
                        {card.icon || '📋'}
                      </div>
                    )}
                  </div>

                  {/* Card Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="text-sm font-semibold px-3 py-1.5 rounded-lg" style={{
                            backgroundColor: card.type === 'BRANDING' ? '#3B82F6' : 
                                           card.type === 'NOTICE' ? '#F59E0B' : '#8B5CF6',
                            color: 'white'
                          }}>
                            {card.type === 'BRANDING' ? '🏥 Branding' : 
                             card.type === 'NOTICE' ? '📅 Notice' : '👨‍⚕️ Doctor'}
                          </span>
                          <span className="text-sm font-semibold px-3 py-1.5 rounded-lg" style={{
                            backgroundColor: card.isActive ? '#10B981' : '#6B7280',
                            color: 'white'
                          }}>
                            {card.isActive ? '✓ Active' : '○ Inactive'}
                          </span>
                          <span className="text-sm font-medium px-3 py-1.5 rounded-lg bg-gray-200 dark:bg-gray-700"
                                style={{color: 'var(--foreground)'}}>
                            📊 Order: {card.order}
                          </span>
                        </div>
                        <h3 className="text-2xl font-bold mb-1" style={{color: 'var(--foreground)'}}>
                          {card.title}
                        </h3>
                      </div>
                    </div>
                    
                    <p className="mb-4 text-base leading-relaxed line-clamp-3" style={{color: 'var(--foreground-secondary)'}}>
                      {card.content}
                    </p>

                    {card.link && (
                      <a
                        href={card.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium hover:underline mb-4 inline-flex items-center gap-1"
                        style={{color: 'var(--accent)'}}
                      >
                        🔗 {card.link.length > 50 ? card.link.substring(0, 50) + '...' : card.link}
                      </a>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3 mt-6">
                      <button
                        onClick={() => toggleActive(card)}
                        className="px-5 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all hover:scale-105"
                        style={{
                          borderColor: card.isActive ? '#6B7280' : 'var(--accent)',
                          color: card.isActive ? '#6B7280' : 'var(--accent)',
                          backgroundColor: 'var(--background)'
                        }}
                      >
                        {card.isActive ? '○ Deactivate' : '✓ Activate'}
                      </button>
                      <button
                        onClick={() => handleEdit(card)}
                        className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105"
                        style={{
                          backgroundColor: 'var(--accent)',
                          color: 'var(--accent-foreground)'
                        }}
                      >
                        ✏️ Edit Card
                      </button>
                      <button
                        onClick={() => handleDelete(card)}
                        className="px-5 py-2.5 rounded-xl text-sm font-semibold border-2 border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all hover:scale-105"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="rounded-2xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-slide-up"
                 style={{backgroundColor: 'var(--card)'}}>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold flex items-center gap-3" style={{color: 'var(--foreground)'}}>
                  <span className="text-4xl">➕</span>
                  <span>Add New Board Card</span>
                </h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-3xl hover:opacity-70 transition-all hover:rotate-90 w-10 h-10 flex items-center justify-center rounded-full"
                  style={{color: 'var(--foreground)', backgroundColor: 'var(--background)'}}
                >
                  ×
                </button>
              </div>

              <form onSubmit={submitAdd} className="space-y-6">
                {renderFormFields()}

                <div className="flex gap-4 pt-6 border-t-2" style={{borderColor: 'var(--border)'}}>
                  <button
                    type="submit"
                    className="flex-1 py-4 rounded-xl font-bold text-lg hover:scale-105 transition-transform"
                    style={{backgroundColor: 'var(--accent)', color: 'var(--accent-foreground)'}}
                  >
                    ✓ Create Card
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-8 py-4 rounded-xl border-2 font-semibold hover:scale-105 transition-transform"
                    style={{borderColor: 'var(--border)', color: 'var(--foreground)'}}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && selectedCard && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="rounded-2xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-slide-up"
                 style={{backgroundColor: 'var(--card)'}}>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold flex items-center gap-3" style={{color: 'var(--foreground)'}}>
                  <span className="text-4xl">✏️</span>
                  <span>Edit Board Card</span>
                </h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-3xl hover:opacity-70 transition-all hover:rotate-90 w-10 h-10 flex items-center justify-center rounded-full"
                  style={{color: 'var(--foreground)', backgroundColor: 'var(--background)'}}
                >
                  ×
                </button>
              </div>

              <form onSubmit={submitEdit} className="space-y-6">
                {renderFormFields()}

                <div className="flex gap-4 pt-6 border-t-2" style={{borderColor: 'var(--border)'}}>
                  <button
                    type="submit"
                    className="flex-1 py-4 rounded-xl font-bold text-lg hover:scale-105 transition-transform"
                    style={{backgroundColor: 'var(--accent)', color: 'var(--accent-foreground)'}}
                  >
                    ✓ Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-8 py-4 rounded-xl border-2 font-semibold hover:scale-105 transition-transform"
                    style={{borderColor: 'var(--border)', color: 'var(--foreground)'}}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {showDeleteModal && selectedCard && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="rounded-2xl p-8 max-w-md w-full shadow-2xl animate-slide-up"
                 style={{backgroundColor: 'var(--card)'}}>
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">⚠️</div>
                <h2 className="text-2xl font-bold mb-3" style={{color: 'var(--foreground)'}}>
                  Delete Board Card?
                </h2>
                <p className="text-lg mb-2" style={{color: 'var(--foreground-secondary)'}}>
                  Are you sure you want to delete
                </p>
                <p className="text-xl font-bold mb-4" style={{color: 'var(--foreground)'}}>
                  "{selectedCard.title}"
                </p>
                <p className="text-sm" style={{color: 'var(--foreground-secondary)'}}>
                  This action cannot be undone.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={submitDelete}
                  className="flex-1 py-4 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 hover:scale-105 transition-all"
                >
                  🗑️ Delete Card
                </button>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-6 py-4 rounded-xl border-2 font-semibold hover:scale-105 transition-all"
                  style={{borderColor: 'var(--border)', color: 'var(--foreground)'}}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
