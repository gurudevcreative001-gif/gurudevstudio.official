import React, { useState } from 'react';
import { X, Check, Download, AlertCircle } from 'lucide-react';
import { Order } from '../../types';

interface DeliverVideoModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onDeliver: (orderId: string, data: { title: string; url: string; fileSize?: string }) => Promise<void>;
}

export const DeliverVideoModal: React.FC<DeliverVideoModalProps> = ({
  order,
  isOpen,
  onClose,
  onDeliver,
}) => {
  const [title, setTitle] = useState('Final Video Master Export (Full HD / 4K)');
  const [url, setUrl] = useState('');
  const [fileSize, setFileSize] = useState('Full HD 1080p (60fps)');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !order) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Please provide a title for the video file');
      return;
    }

    if (!url.trim()) {
      setError('Please provide the video download URL (Google Drive / Cloud link)');
      return;
    }

    setSubmitting(true);
    try {
      await onDeliver(order.id, {
        title: title.trim(),
        url: url.trim(),
        fileSize: fileSize.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to deliver video');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-purple-100 relative text-left">
        <div className="flex items-center justify-between pb-3 border-b border-purple-100">
          <div>
            <h3 className="text-base font-extrabold text-gray-900">
              Deliver Completed Video
            </h3>
            <p className="text-xs text-gray-500 font-mono">
              Order: {order.id} · {order.customerName}
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

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              File Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-purple-50/30 border border-purple-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/40 focus:bg-white text-gray-900 font-medium"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Download Link / Cloud URL <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              required
              placeholder="https://drive.google.com/file/d/... or video CDN URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-3 py-2 bg-purple-50/30 border border-purple-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/40 focus:bg-white text-gray-900 font-mono"
            />
            <span className="text-[10px] text-gray-500 mt-1 block">
              Ensure Google Drive link sharing is set to &quot;Anyone with the link can view/download&quot;.
            </span>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Resolution / Format
            </label>
            <input
              type="text"
              placeholder="e.g. 4K 60FPS (350 MB) or Instagram Reel 1080x1920"
              value={fileSize}
              onChange={(e) => setFileSize(e.target.value)}
              className="w-full px-3 py-2 bg-purple-50/30 border border-purple-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/40 focus:bg-white text-gray-900"
            />
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
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white font-bold shadow-xs flex items-center gap-1.5 disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Delivering...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Attach & Mark Completed</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
