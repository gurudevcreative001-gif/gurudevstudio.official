import React, { useState, useEffect } from 'react';
import { X, Check, AlertCircle } from 'lucide-react';
import { Service, ServiceCategory } from '../../types';

interface ServiceModalProps {
  service: Service | null; // null = add new, Service = edit
  isOpen: boolean;
  onClose: () => void;
  onSave: (serviceData: {
    name: string;
    gujaratiName?: string;
    category: ServiceCategory;
    description: string;
    price: number;
    isStartingPrice: boolean;
    imageUrl?: string;
    badge?: string;
  }) => Promise<void>;
}

const CATEGORY_OPTIONS: { id: ServiceCategory; label: string }[] = [
  { id: 'reels', label: 'Reels & Shorts' },
  { id: 'celebration', label: 'Weddings & Birthdays' },
  { id: 'long_form', label: 'YouTube & Long Videos' },
  { id: 'business', label: 'Business & Devotional' },
  { id: 'graphic_design', label: 'Graphic Design' },
];

export const ServiceModal: React.FC<ServiceModalProps> = ({
  service,
  isOpen,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [gujaratiName, setGujaratiName] = useState('');
  const [category, setCategory] = useState<ServiceCategory>('reels');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<string>('150');
  const [isStartingPrice, setIsStartingPrice] = useState(true);
  const [badge, setBadge] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (service) {
      setName(service.name);
      setGujaratiName(service.gujaratiName || '');
      setCategory(service.category);
      setDescription(service.description);
      setPrice(service.price.toString());
      setIsStartingPrice(service.isStartingPrice);
      setBadge(service.badge || '');
      setImageUrl(service.imageUrl || '');
    } else {
      setName('');
      setGujaratiName('');
      setCategory('reels');
      setDescription('');
      setPrice('150');
      setIsStartingPrice(true);
      setBadge('');
      setImageUrl('');
    }
    setError(null);
  }, [service, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Service name is required');
      return;
    }

    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice < 0) {
      setError('Price must be a valid non-negative number (0 for discussion/on quote)');
      return;
    }

    setSaving(true);
    try {
      await onSave({
        name: name.trim(),
        gujaratiName: gujaratiName.trim() || undefined,
        category,
        description: description.trim(),
        price: numPrice,
        isStartingPrice,
        badge: badge.trim() || undefined,
        imageUrl: imageUrl.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save service');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-purple-100 relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-purple-100">
          <div>
            <h3 className="text-base font-extrabold text-gray-900">
              {service ? 'Edit Service' : 'Add New Service'}
            </h3>
            <p className="text-xs text-gray-500">
              Changes will update live on customer Create Order screen
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs text-left">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Service Name (English) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Cinematic Travel Reel Editing"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-purple-50/30 border border-purple-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/40 focus:bg-white text-gray-900"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Gujarati Service Name / Tagline (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. ટ્રાવેલ રીલ એડિટિંગ — ₹150 થી"
              value={gujaratiName}
              onChange={(e) => setGujaratiName(e.target.value)}
              className="w-full px-3 py-2 bg-purple-50/30 border border-purple-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/40 focus:bg-white text-gray-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ServiceCategory)}
                className="w-full px-3 py-2 bg-purple-50/30 border border-purple-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/40 focus:bg-white text-gray-900 font-medium"
              >
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Price in INR (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="1"
                required
                placeholder="e.g. 150"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3 py-2 bg-purple-50/30 border border-purple-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/40 focus:bg-white text-gray-900 font-mono font-bold"
              />
              <span className="text-[10px] text-gray-500">Set 0 for &quot;ભાવ ચર્ચાથી&quot; (Quote)</span>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="is-starting-price"
              checked={isStartingPrice}
              onChange={(e) => setIsStartingPrice(e.target.checked)}
              className="rounded text-[#6D28D9] focus:ring-[#6D28D9] w-4 h-4"
            />
            <label htmlFor="is-starting-price" className="text-gray-700 cursor-pointer">
              Show as starting price (e.g. &quot;₹{price || '150'} થી&quot;)
            </label>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Detailed description of deliverables, editing style, and software used..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-purple-50/30 border border-purple-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/40 focus:bg-white text-gray-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Badge / Tag (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Popular, Trending, New"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                className="w-full px-3 py-2 bg-purple-50/30 border border-purple-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/40 focus:bg-white text-gray-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Image / Icon URL (Optional)
              </label>
              <input
                type="text"
                placeholder="https://..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full px-3 py-2 bg-purple-50/30 border border-purple-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/40 focus:bg-white text-gray-900"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-purple-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-bold shadow-xs flex items-center gap-1.5 disabled:opacity-60"
            >
              {saving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>{service ? 'Update Service' : 'Add Service'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
