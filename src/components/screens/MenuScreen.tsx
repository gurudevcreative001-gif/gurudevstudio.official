import React, { useState, useEffect } from 'react';
import {
  Menu,
  MessageCircle,
  Phone,
  CreditCard,
  Shield,
  Info,
  Film,
  Sparkles,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Lock,
  CheckCircle2,
  QrCode,
  Copy,
  Check,
  Upload,
  Save,
  AlertCircle,
  X,
  Smartphone,
  RefreshCw,
} from 'lucide-react';
import { Service } from '../../types';
import { apiClient } from '../../api/client';

interface MenuScreenProps {
  services: Service[];
  isAdminLoggedIn?: boolean;
  onOpenAdmin: () => void;
  onSelectServiceToOrder: (serviceId: string) => void;
}

export const MenuScreen: React.FC<MenuScreenProps> = ({
  services,
  isAdminLoggedIn = false,
  onOpenAdmin,
  onSelectServiceToOrder,
}) => {
  const [activeSection, setActiveSection] = useState<string | null>('prices');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [isPaymentSettingsOpen, setIsPaymentSettingsOpen] = useState(false);

  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? null : section);
  };

  return (
    <div className="pb-24 pt-4 px-4 max-w-2xl mx-auto space-y-4">
      {/* Studio Header Card */}
      <div className="bg-white rounded-3xl p-5 shadow-ios border border-purple-100 flex items-center gap-3.5">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#5B21B6] to-[#7C3AED] flex items-center justify-center text-white shadow-sm shrink-0">
          <Film className="w-6 h-6" />
        </div>
        <div className="min-w-0">
          <h2 className="text-base font-extrabold text-gray-900 tracking-tight truncate">
            gurudevstudio.official
          </h2>
          <p className="text-xs font-semibold text-purple-700">
            Video Editing Studio · Gujarat, India
          </p>
          <p className="text-[11px] text-gray-500 mt-0.5">
            Crafting viral reels, wedding films, and brand visuals
          </p>
        </div>
      </div>

      {/* ADMIN-ONLY PAYMENT SETTINGS CARD (Visible only to authorized admins) */}
      {isAdminLoggedIn && (
        <div className="bg-gradient-to-r from-purple-900 to-[#6D28D9] rounded-3xl p-5 shadow-ios text-white space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/10 text-white flex items-center justify-center">
                <QrCode className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-extrabold tracking-tight">Payment Settings (Admin Only)</h3>
                <p className="text-[10px] text-purple-200">Manage UPI ID, payee name, and payment QR code</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsPaymentSettingsOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-white text-[#6D28D9] hover:bg-purple-50 text-xs font-extrabold shadow-sm transition-colors"
            >
              Manage
            </button>
          </div>
        </div>
      )}

      {/* WHATSAPP SUPPORT CARDS (High Priority) */}
      <div className="bg-gradient-to-br from-emerald-50 via-white to-purple-50 rounded-3xl p-5 shadow-ios border border-emerald-200/80">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <MessageCircle className="w-4 h-4 fill-emerald-600/20" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-gray-900">Official WhatsApp Support</h3>
            <p className="text-[11px] text-gray-500">Instant response for quotes, edits, & deliveries</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
          {/* WhatsApp 1: 9909404141 */}
          <a
            href="https://wa.me/919909404141?text=Hello%20gurudevstudio.official,%20I%20want%20to%20discuss%20a%20video%20editing%20project"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3.5 bg-white rounded-2xl border border-emerald-200 hover:border-emerald-300 shadow-xs transition-all hover:shadow-sm group"
          >
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-emerald-700 block uppercase tracking-wider">
                Support & Senior Editor
              </span>
              <span className="text-sm font-extrabold text-gray-900 font-mono block mt-0.5">
                +91 99094 04141
              </span>
              <span className="text-[10px] text-gray-500">Tap to open WhatsApp chat</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-emerald-100 group-hover:bg-emerald-600 group-hover:text-white text-emerald-700 flex items-center justify-center transition-colors shrink-0">
              <MessageCircle className="w-4 h-4" />
            </div>
          </a>

          {/* WhatsApp 2: 6353894486 */}
          <a
            href="https://wa.me/916353894486?text=Hello%20gurudevstudio.official,%20I%20want%20to%20inquire%20about%20video%20editing%20services"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3.5 bg-white rounded-2xl border border-emerald-200 hover:border-emerald-300 shadow-xs transition-all hover:shadow-sm group"
          >
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-emerald-700 block uppercase tracking-wider">
                Order Booking Desk
              </span>
              <span className="text-sm font-extrabold text-gray-900 font-mono block mt-0.5">
                +91 63538 94486
              </span>
              <span className="text-[10px] text-gray-500">Tap to open WhatsApp chat</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-emerald-100 group-hover:bg-emerald-600 group-hover:text-white text-emerald-700 flex items-center justify-center transition-colors shrink-0">
              <MessageCircle className="w-4 h-4" />
            </div>
          </a>
        </div>

        {/* Direct Call Button */}
        <div className="mt-3 pt-3 border-t border-emerald-100/80 flex items-center justify-between text-xs">
          <span className="text-gray-600 text-[11px]">Need urgent phone consultation?</span>
          <a
            href="tel:+919909404141"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 text-[#6D28D9] font-bold text-xs hover:bg-purple-100 transition-colors"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Call +91 99094 04141</span>
          </a>
        </div>
      </div>

      {/* ACCORDION 1: ALL SERVICES & LIVE PRICE LIST */}
      <div className="bg-white rounded-3xl shadow-ios border border-purple-100/80 overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('prices')}
          className="w-full p-5 text-left flex items-center justify-between gap-3 hover:bg-purple-50/20 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-[#6D28D9] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Services & Live Price List</h3>
              <p className="text-[11px] text-gray-500">Complete catalog with starting rates in INR</p>
            </div>
          </div>
          {activeSection === 'prices' ? (
            <ChevronUp className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          )}
        </button>

        {activeSection === 'prices' && (
          <div className="px-5 pb-5 pt-1 border-t border-purple-50 space-y-2.5">
            {services.map((service) => (
              <div
                key={service.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-purple-50/40 hover:bg-purple-50/80 transition-colors border border-purple-100/60"
              >
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-gray-900 truncate">{service.name}</span>
                    {service.badge && (
                      <span className="text-[9px] font-bold bg-purple-200 text-[#6D28D9] px-2 py-0.5 rounded-md">
                        {service.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-500 truncate mt-0.5">{service.description}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span className="text-xs font-extrabold text-[#6D28D9] block">
                      {service.isStartingPrice ? `₹${service.price} થી` : service.price > 0 ? `₹${service.price}` : 'બિઝનેસ ચર્ચા'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onSelectServiceToOrder(service.id)}
                    className="px-2.5 py-1 rounded-xl bg-[#6D28D9] text-white text-[10px] font-bold hover:bg-[#5B21B6] transition-colors"
                  >
                    Book
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ACCORDION 2: PAYMENT DETAILS */}
      <div className="bg-white rounded-3xl shadow-ios border border-purple-100/80 overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('payment')}
          className="w-full p-5 text-left flex items-center justify-between gap-3 hover:bg-purple-50/20 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-[#6D28D9] flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Payment Details & UPI</h3>
              <p className="text-[11px] text-gray-500">Secure QR codes & PhonePe / GPay / FamPay</p>
            </div>
          </div>
          {activeSection === 'payment' ? (
            <ChevronUp className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          )}
        </button>

        {activeSection === 'payment' && (
          <div className="px-5 pb-5 pt-1 border-t border-purple-50">
            <div className="p-3 bg-purple-50/50 rounded-2xl border border-purple-100 text-xs text-gray-700 space-y-2">
              <p className="font-semibold text-[#6D28D9]">Accepted Payment Methods:</p>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-gray-600">
                <li>1-Tap UPI Apps: PhonePe, Google Pay, FamPay</li>
                <li>QR Code Scanning (Any UPI app)</li>
                <li>Direct Bank Transfer / UPI ID transfer</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* ACCORDION 3: PRIVACY POLICY */}
      <div className="bg-white rounded-3xl shadow-ios border border-purple-100/80 overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('privacy')}
          className="w-full p-5 text-left flex items-center justify-between gap-3 hover:bg-purple-50/20 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-[#6D28D9] flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Privacy Policy</h3>
              <p className="text-[11px] text-gray-500">Secure handling of raw media & final videos</p>
            </div>
          </div>
          {activeSection === 'privacy' ? (
            <ChevronUp className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          )}
        </button>

        {activeSection === 'privacy' && (
          <div className="px-5 pb-5 pt-1 border-t border-purple-50 space-y-2 text-xs text-gray-600 leading-relaxed">
            <p>
              At <strong>gurudevstudio.official</strong>, customer privacy and data security are our highest priority:
            </p>
            <ul className="list-disc list-inside space-y-1 text-[11px]">
              <li>All raw photos and videos uploaded by customers are stored in private secure server storage.</li>
              <li>Completed final videos are accessible exclusively to the verified customer who placed the order.</li>
              <li>We never share, sell, or publicly expose customer raw footage or final rendered files.</li>
            </ul>
          </div>
        )}
      </div>

      {/* ACCORDION 4: ABOUT US */}
      <div className="bg-white rounded-3xl shadow-ios border border-purple-100/80 overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('about')}
          className="w-full p-5 text-left flex items-center justify-between gap-3 hover:bg-purple-50/20 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-[#6D28D9] flex items-center justify-center">
              <Info className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">About gurudevstudio.official</h3>
              <p className="text-[11px] text-gray-500">Our studio journey, equipment, and mission</p>
            </div>
          </div>
          {activeSection === 'about' ? (
            <ChevronUp className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          )}
        </button>

        {activeSection === 'about' && (
          <div className="px-5 pb-5 pt-1 border-t border-purple-50 space-y-3 text-xs text-gray-700 leading-relaxed">
            <p>
              <strong>gurudevstudio.official</strong> is a premier video editing and digital media studio based in Gujarat, India. We empower content creators, influencers, wedding couples, and local businesses with broadcast-quality visuals and viral-ready video edits.
            </p>
            <div className="grid grid-cols-2 gap-2 my-2">
              <div className="p-3 bg-purple-50 rounded-2xl text-center">
                <span className="text-base font-extrabold text-[#6D28D9] block">1,500+</span>
                <span className="text-[10px] text-gray-600">Videos Delivered</span>
              </div>
              <div className="p-3 bg-purple-50 rounded-2xl text-center">
                <span className="text-base font-extrabold text-[#6D28D9] block">4.9 / 5</span>
                <span className="text-[10px] text-gray-600">Client Satisfaction</span>
              </div>
            </div>
            <p>
              <strong>Industry Tools:</strong> Adobe Premiere Pro, After Effects, DaVinci Resolve Studio, and custom color LUTs specifically calibrated for Indian skin tones, vibrant Gujarati weddings, and high-contrast social media reels.
            </p>
          </div>
        )}
      </div>

      {/* STUDIO ADMIN PORTAL ACCESS CARD */}
      <div className="bg-white rounded-3xl p-5 shadow-ios border border-purple-200/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-[#6D28D9] flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-extrabold text-gray-900">Studio Admin Management</h3>
              <p className="text-[10px] text-gray-500">Manage services, live prices, and customer orders</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenAdmin}
            className="px-3.5 py-1.5 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white text-xs font-bold shadow-xs transition-colors"
          >
            Open Admin
          </button>
        </div>
      </div>

      {/* ADMIN PAYMENT SETTINGS MODAL */}
      {isPaymentSettingsOpen && (
        <PaymentSettingsModal onClose={() => setIsPaymentSettingsOpen(false)} />
      )}
    </div>
  );
};

// Payment Settings Modal Component
interface PaymentSettingsModalProps {
  onClose: () => void;
}

const PaymentSettingsModal: React.FC<PaymentSettingsModalProps> = ({ onClose }) => {
  const [upiId, setUpiId] = useState('');
  const [payeeName, setPayeeName] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const settings = await apiClient.getPaymentSettings();
      setUpiId(settings.upiId);
      setPayeeName(settings.payeeName);
      setQrCodeUrl(settings.qrCodeUrl);
    } catch (err: any) {
      setError(err.message || 'Failed to load payment settings');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setSaving(true);
      setError(null);
      const res = await apiClient.uploadFile(file);
      setQrCodeUrl(res.url);
      setSuccessMsg('QR code image uploaded successfully!');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to upload QR code image');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveConfirmed = async () => {
    if (!upiId || !upiId.includes('@')) {
      setError('Please enter a valid UPI ID containing "@" (e.g. 6353894486@pthdfc)');
      setShowConfirmDialog(false);
      return;
    }
    if (!payeeName.trim()) {
      setError('Please enter the payee name.');
      setShowConfirmDialog(false);
      return;
    }
    if (!qrCodeUrl.trim()) {
      setError('QR code image URL or upload is required.');
      setShowConfirmDialog(false);
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await apiClient.updatePaymentSettings({
        upiId: upiId.trim(),
        payeeName: payeeName.trim(),
        qrCodeUrl: qrCodeUrl.trim(),
      });
      setSuccessMsg('Payment settings saved successfully in secure database!');
      setShowConfirmDialog(false);
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to save payment settings');
    } finally {
      setSaving(false);
    }
  };

  const handleTestPayment = () => {
    if (!upiId || !upiId.includes('@')) {
      setError('Please provide a valid UPI ID before testing.');
      return;
    }
    const testAmount = 1;
    const testUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(
      payeeName || 'Studio'
    )}&tn=${encodeURIComponent('Test Payment GDS')}&am=${testAmount}&cu=INR`;

    setTestResult(`Generated test UPI intent successfully: pa=${upiId}, am=₹1. Test link ready.`);
    // Try opening test intent in iframe
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = testUrl;
    document.body.appendChild(iframe);
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-purple-100 space-y-5 my-8">
        <div className="flex items-center justify-between pb-3 border-b border-purple-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-[#6D28D9] flex items-center justify-center">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-gray-900">Payment Settings</h3>
              <p className="text-[11px] text-gray-500">Manage UPI ID, Payee Name & QR Code</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-gray-500">Loading payment settings...</div>
        ) : (
          <div className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-700 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* 1. UPI ID */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-gray-800 block">UPI ID</label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="e.g. 6353894486@pthdfc"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-purple-200 rounded-2xl text-xs font-mono font-bold text-gray-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-500/20"
              />
              <p className="text-[10px] text-gray-500">Must contain "@" and be a valid merchant or personal UPI VPA.</p>
            </div>

            {/* 2. Payee Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-gray-800 block">Payee / Receiver Name</label>
              <input
                type="text"
                value={payeeName}
                onChange={(e) => setPayeeName(e.target.value)}
                placeholder="e.g. PATEL SHUBH RAKESHBHAI"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-purple-200 rounded-2xl text-xs font-bold text-gray-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-500/20"
              />
            </div>

            {/* 3 & 4. QR Code Upload & Preview */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-gray-800 block">Payment QR Code Image</label>
              <div className="flex items-center gap-4">
                <div className="relative w-28 h-28 bg-gray-50 border border-purple-200 rounded-2xl p-2 flex items-center justify-center overflow-hidden shrink-0">
                  {qrCodeUrl ? (
                    <img
                      src={qrCodeUrl}
                      alt="QR Preview"
                      className="w-full h-full object-contain rounded-xl"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="text-[10px] text-gray-400">No QR</span>
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    value={qrCodeUrl}
                    onChange={(e) => setQrCodeUrl(e.target.value)}
                    placeholder="QR image URL"
                    className="w-full px-3 py-2 bg-gray-50 border border-purple-200 rounded-xl text-[11px] text-gray-800 focus:bg-white focus:outline-hidden"
                  />
                  <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#6D28D9] font-bold text-xs cursor-pointer transition-colors border border-purple-200">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload QR Image</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
              </div>
            </div>

            {/* Test Payment Details Option */}
            <div className="pt-2 border-t border-purple-100 space-y-2">
              <button
                type="button"
                onClick={handleTestPayment}
                className="w-full py-2.5 px-4 rounded-xl bg-purple-100 hover:bg-purple-200 text-[#6D28D9] text-xs font-extrabold flex items-center justify-center gap-2 transition-colors"
              >
                <Smartphone className="w-4 h-4" />
                <span>Test Payment Details (₹1 Intent)</span>
              </button>
              {testResult && (
                <p className="text-[11px] text-emerald-700 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 font-medium">
                  {testResult}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-purple-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setShowConfirmDialog(true)}
                disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-extrabold text-xs shadow-sm transition-colors flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        )}

        {/* Confirmation Dialog */}
        {showConfirmDialog && (
          <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 animate-scale-up text-center">
              <div className="w-12 h-12 rounded-full bg-purple-100 text-[#6D28D9] flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-extrabold text-gray-900">Confirm Payment Settings Update</h4>
              <p className="text-xs text-gray-600">
                Are you sure you want to update the studio UPI ID to <strong className="font-mono">{upiId}</strong> and replace the active QR code? This will instantly affect all new customer checkout orders.
              </p>
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfirmDialog(false)}
                  className="flex-1 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveConfirmed}
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-extrabold text-xs shadow-sm"
                >
                  {saving ? 'Saving...' : 'Yes, Save'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
