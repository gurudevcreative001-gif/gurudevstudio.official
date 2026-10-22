import React, { useState, useEffect } from 'react';
import {
  Film,
  Sparkles,
  Upload,
  CheckCircle2,
  AlertCircle,
  Clock,
  Zap,
  Check,
  X,
  MessageCircle,
  Copy,
  ChevronRight,
  ChevronLeft,
  Shield,
  FileVideo,
  FileImage,
  Layers,
  ArrowRight,
  ShieldCheck,
  Lock,
  RefreshCw,
} from 'lucide-react';
import { Service, ServiceCategory, UploadedFile, Order } from '../../types';
import { apiClient } from '../../api/client';
import { UpiQr } from '../UpiQr';

interface CreateOrderScreenProps {
  onOrderPlaced: (order: Order) => void;
  onNavigateToOrders: () => void;
}

const CATEGORIES: { id: ServiceCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'All Services' },
  { id: 'reels', label: 'Reels & Shorts' },
  { id: 'celebration', label: 'Weddings & Birthdays' },
  { id: 'long_form', label: 'YouTube & Long Videos' },
  { id: 'business', label: 'Business & Devotional' },
  { id: 'graphic_design', label: 'Graphic Design' },
];

export const CreateOrderScreen: React.FC<CreateOrderScreenProps> = ({
  onOrderPlaced,
  onNavigateToOrders,
}) => {
  // Wizard Step: 1 = Select Service, 2 = Photos & Videos, 3 = Payment & Details
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Services data
  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Draft state (preserved across steps)
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [customerName, setCustomerName] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');
  const [sameAsMobile, setSameAsMobile] = useState(true);
  const [customerWhatsapp, setCustomerWhatsapp] = useState('');
  const [requirements, setRequirements] = useState('');
  const [referenceLinks, setReferenceLinks] = useState('');

  // Add-ons
  const [expressDelivery, setExpressDelivery] = useState(false);
  const [export4k, setExport4k] = useState(false);
  const [customCaptions, setCustomCaptions] = useState(false);

  // File uploads (Step 2)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Payment (Step 3)
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'discuss'>('upi');
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentScreenshotUrl, setPaymentScreenshotUrl] = useState('');
  const [isUploadingScreenshot, setIsUploadingScreenshot] = useState(false);

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Success modal
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [whatsappInfo, setWhatsappInfo] = useState<any | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoadingServices(true);
      const data = await apiClient.getServices();
      setServices(data);
      if (data.length > 0 && !selectedServiceId) {
        setSelectedServiceId(data[0].id);
      }
    } catch (err: any) {
      console.error('Failed to load services:', err);
    } finally {
      setLoadingServices(false);
    }
  };

  const selectedService = services.find((s) => s.id === selectedServiceId);

  // Calculate total price with add-ons
  const calculateTotal = () => {
    if (!selectedService) return 0;
    if (selectedService.price === 0) return 0; // On quote
    let total = selectedService.price;
    if (expressDelivery) total += 100;
    if (export4k) total += 50;
    if (customCaptions) total += 50;
    return total;
  };

  const totalPrice = calculateTotal();
  const totalFileSizeMB = uploadedFiles.reduce((acc, f) => acc + f.size, 0) / (1024 * 1024);

  const filteredServices = services.filter((srv) => {
    const matchesCategory = selectedCategory === 'all' || srv.category === selectedCategory;
    const matchesSearch =
      srv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (srv.gujaratiName && srv.gujaratiName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      srv.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Multiple native file selection & chunked simulation for Step 2
  const handleMultipleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadError(null);
    setUploadProgress(10);

    try {
      const newUploads: UploadedFile[] = [];
      const total = files.length;
      for (let i = 0; i < total; i++) {
        const file = files[i];
        setUploadProgress(Math.round(((i + 1) / total) * 90));
        const res = await apiClient.uploadFile(file);
        newUploads.push(res.file);
      }
      setUploadProgress(100);
      setUploadedFiles((prev) => [...prev, ...newUploads]);
    } catch (err: any) {
      setUploadError(err.message || 'File upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const removeUploadedFile = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  // Payment screenshot upload
  const handleScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingScreenshot(true);
    try {
      const res = await apiClient.uploadFile(file);
      setPaymentScreenshotUrl(res.url);
    } catch (err: any) {
      alert('Failed to upload payment proof: ' + err.message);
    } finally {
      setIsUploadingScreenshot(false);
    }
  };

  // Validation between steps
  const handleNextFromStep1 = () => {
    setFormError(null);
    if (!selectedServiceId) {
      setFormError('Please select a video editing service to continue.');
      return;
    }
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNextFromStep2 = () => {
    setFormError(null);
    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Final Order Submission (Step 3)
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!customerName.trim()) {
      setFormError('Please enter your full name in Step 3.');
      return;
    }

    const cleanMobile = customerMobile.trim().replace(/\D/g, '').slice(-10);
    if (!cleanMobile || cleanMobile.length !== 10) {
      setFormError('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (!requirements.trim()) {
      setFormError('Please provide editing instructions or requirements.');
      return;
    }

    setSubmitting(true);

    try {
      const addonsList = [];
      if (expressDelivery) addonsList.push('⚡ Express 24h Delivery (+₹100)');
      if (export4k) addonsList.push('🌟 4K 60FPS Ultra-HD (+₹50)');
      if (customCaptions) addonsList.push('📝 Custom Gujarati/Hindi Subtitles (+₹50)');

      const fullRequirements = addonsList.length > 0
        ? `${requirements.trim()}\n\n[Selected Add-ons]:\n${addonsList.join('\n')}`
        : requirements.trim();

      const res = await apiClient.createOrder({
        customerName: customerName.trim(),
        customerMobile: cleanMobile,
        customerWhatsapp: sameAsMobile
          ? cleanMobile
          : customerWhatsapp.trim().replace(/\D/g, '').slice(-10) || undefined,
        serviceId: selectedServiceId,
        requirements: fullRequirements,
        referenceLinks: referenceLinks.trim() || undefined,
        paymentMethod: paymentMethod === 'upi' ? 'upi' : 'discuss',
        paymentReference: paymentReference.trim() || undefined,
        paymentScreenshot: paymentScreenshotUrl || undefined,
        uploadedFiles,
      });

      setCreatedOrder(res.order);
      setWhatsappInfo(res.whatsappNotification);
      onOrderPlaced(res.order);
    } catch (err: any) {
      setFormError(err.message || 'Failed to place order. Please check connection.');
    } finally {
      setSubmitting(false);
    }
  };

  const copyOrderId = () => {
    if (createdOrder) {
      navigator.clipboard.writeText(createdOrder.id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  return (
    <div className="pb-28 pt-4 px-4 max-w-2xl mx-auto">
      {/* Studio Banner */}
      <div className="bg-gradient-to-br from-[#5B21B6] via-[#6D28D9] to-[#7C3AED] rounded-3xl p-5 text-white shadow-ios-lg mb-5 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-44 h-44 bg-purple-400/20 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold tracking-wide text-purple-100 uppercase">
              Official Video Editing Studio
            </span>
            <span className="text-[11px] text-purple-200">Gujarat, India</span>
          </div>

          <h2 className="text-2xl font-extrabold tracking-tight text-white mb-1">
            gurudevstudio.official
          </h2>
          <p className="text-xs text-purple-100 max-w-md leading-relaxed">
            Professional 3-Step Booking Flow. Select your service, upload your raw footage securely, and complete your booking instantly.
          </p>
        </div>
      </div>

      {/* 3-Step Wizard Indicator */}
      <div className="bg-white rounded-2xl p-3 shadow-ios border border-purple-100 mb-5 flex items-center justify-between">
        {/* Step 1 */}
        <div className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
              currentStep === 1
                ? 'bg-[#6D28D9] text-white shadow-xs'
                : currentStep > 1
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            {currentStep > 1 ? <Check className="w-4 h-4 stroke-[3]" /> : '1'}
          </div>
          <div className="hidden sm:block">
            <span className="text-[11px] font-bold text-gray-900 block leading-none">Step 1</span>
            <span className="text-[10px] text-gray-500">Select Service</span>
          </div>
        </div>

        <div className={`flex-1 h-0.5 mx-2 ${currentStep > 1 ? 'bg-emerald-600' : 'bg-purple-100'}`} />

        {/* Step 2 */}
        <div className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
              currentStep === 2
                ? 'bg-[#6D28D9] text-white shadow-xs'
                : currentStep > 2
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            {currentStep > 2 ? <Check className="w-4 h-4 stroke-[3]" /> : '2'}
          </div>
          <div className="hidden sm:block">
            <span className="text-[11px] font-bold text-gray-900 block leading-none">Step 2</span>
            <span className="text-[10px] text-gray-500">Photos & Videos</span>
          </div>
        </div>

        <div className={`flex-1 h-0.5 mx-2 ${currentStep > 2 ? 'bg-emerald-600' : 'bg-purple-100'}`} />

        {/* Step 3 */}
        <div className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
              currentStep === 3
                ? 'bg-[#6D28D9] text-white shadow-xs'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            3
          </div>
          <div className="hidden sm:block">
            <span className="text-[11px] font-bold text-gray-900 block leading-none">Step 3</span>
            <span className="text-[10px] text-gray-500">Payment & Place</span>
          </div>
        </div>
      </div>

      {/* WIZARD STEP 1 — SELECT SERVICE */}
      {currentStep === 1 && (
        <div className="bg-white rounded-3xl p-5 shadow-ios border border-purple-100/70 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between pb-2 border-b border-purple-100">
            <div>
              <h3 className="text-base font-extrabold text-gray-900">Step 1 — Select Video Service</h3>
              <p className="text-xs text-gray-500">Choose the editing package for your project</p>
            </div>
            {selectedService && (
              <span className="text-xs font-bold text-[#6D28D9] bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
                {selectedService.price > 0 ? `₹${selectedService.price}` : 'Quote'}
              </span>
            )}
          </div>

          {/* Search bar */}
          <div>
            <input
              type="text"
              placeholder="Search services (e.g. Reel, Wedding, YouTube, Poster)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-purple-50/50 border border-purple-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/40 focus:bg-white text-gray-900 placeholder-gray-400"
            />
          </div>

          {/* Category filter pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-[#6D28D9] text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Services list */}
          {loadingServices ? (
            <div className="py-12 text-center text-xs text-gray-500">
              Loading active studio services...
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="py-8 text-center text-xs text-gray-500 bg-purple-50/30 rounded-2xl">
              No services found.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {filteredServices.map((srv) => {
                const isSelected = srv.id === selectedServiceId;
                return (
                  <div
                    key={srv.id}
                    onClick={() => setSelectedServiceId(srv.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                      isSelected
                        ? 'border-[#6D28D9] bg-purple-50/70 shadow-xs ring-1 ring-[#6D28D9]/30'
                        : 'border-purple-100/60 bg-white hover:bg-purple-50/20'
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div
                        className={`w-5 h-5 rounded-full border mt-0.5 flex items-center justify-center shrink-0 transition-colors ${
                          isSelected
                            ? 'border-[#6D28D9] bg-[#6D28D9] text-white'
                            : 'border-gray-300 bg-white'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-xs font-bold text-gray-900 leading-snug">
                            {srv.name}
                          </h4>
                          {srv.badge && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-purple-200/80 text-purple-900">
                              {srv.badge}
                            </span>
                          )}
                        </div>
                        {srv.gujaratiName && (
                          <p className="text-[11px] font-medium text-purple-800/90 mt-0.5">
                            {srv.gujaratiName}
                          </p>
                        )}
                        <p className="text-[11px] text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                          {srv.description}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-extrabold text-[#6D28D9] tabular-nums">
                        {srv.price > 0 ? (
                          <>
                            ₹{srv.price}
                            {srv.isStartingPrice && (
                              <span className="text-[10px] font-normal text-purple-700 ml-0.5">થી</span>
                            )}
                          </>
                        ) : (
                          <span className="text-[11px] font-semibold text-gray-600">ભાવ ચર્ચાથી</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Add-on Upgrades */}
          {selectedService && selectedService.price > 0 && (
            <div className="pt-3 border-t border-purple-100">
              <p className="text-xs font-bold text-gray-800 mb-2.5 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Optional Speed & Quality Add-ons</span>
              </p>

              <div className="space-y-2">
                <label className="flex items-center justify-between p-2.5 bg-purple-50/40 rounded-xl border border-purple-100/60 cursor-pointer text-xs">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={expressDelivery}
                      onChange={(e) => setExpressDelivery(e.target.checked)}
                      className="rounded text-[#6D28D9] focus:ring-[#6D28D9] w-4 h-4"
                    />
                    <span className="font-semibold text-gray-800">⚡ Express 24-Hour Delivery</span>
                  </div>
                  <span className="font-bold text-[#6D28D9]">+₹100</span>
                </label>

                <label className="flex items-center justify-between p-2.5 bg-purple-50/40 rounded-xl border border-purple-100/60 cursor-pointer text-xs">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={export4k}
                      onChange={(e) => setExport4k(e.target.checked)}
                      className="rounded text-[#6D28D9] focus:ring-[#6D28D9] w-4 h-4"
                    />
                    <span className="font-semibold text-gray-800">🌟 4K 60FPS Ultra-HD Master Export</span>
                  </div>
                  <span className="font-bold text-[#6D28D9]">+₹50</span>
                </label>

                <label className="flex items-center justify-between p-2.5 bg-purple-50/40 rounded-xl border border-purple-100/60 cursor-pointer text-xs">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={customCaptions}
                      onChange={(e) => setCustomCaptions(e.target.checked)}
                      className="rounded text-[#6D28D9] focus:ring-[#6D28D9] w-4 h-4"
                    />
                    <span className="font-semibold text-gray-800">📝 Custom Gujarati / Hindi Subtitles</span>
                  </div>
                  <span className="font-bold text-[#6D28D9]">+₹50</span>
                </label>
              </div>
            </div>
          )}

          {formError && (
            <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-red-700 text-xs flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Next Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleNextFromStep1}
              className="w-full py-3.5 px-6 rounded-2xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-extrabold text-xs shadow-ios flex items-center justify-center gap-2 transition-transform active:scale-[0.99]"
            >
              <span>Next: Select Photos & Videos</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* WIZARD STEP 2 — SELECT PHOTOS AND VIDEOS */}
      {currentStep === 2 && (
        <div className="bg-white rounded-3xl p-5 shadow-ios border border-purple-100/70 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between pb-2 border-b border-purple-100">
            <div>
              <h3 className="text-base font-extrabold text-gray-900">Step 2 — Select Photos & Videos</h3>
              <p className="text-xs text-gray-500">Native picker for multiple raw media uploads</p>
            </div>
            <span className="text-xs font-bold text-purple-900 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
              {uploadedFiles.length} file(s) selected
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 text-xs text-gray-700 space-y-1.5">
            <p className="font-bold text-purple-950 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              <span>Private & Secure Studio Storage</span>
            </p>
            <p className="leading-relaxed">
              Tap below to open your phone or computer photo picker. You can select multiple images and videos in one session, or add more repeatedly. Files are securely uploaded to private storage and never exposed publicly.
            </p>
          </div>

          {/* Native picker dropzone */}
          <div className="border-2 border-dashed border-purple-300 hover:border-[#6D28D9] bg-purple-50/30 rounded-2xl p-6 text-center transition-colors">
            <input
              type="file"
              multiple
              id="native-photo-video-picker"
              onChange={handleMultipleFileUpload}
              className="hidden"
              accept="image/*,video/*,audio/*,.pdf"
            />
            <label
              htmlFor="native-photo-video-picker"
              className="cursor-pointer flex flex-col items-center justify-center gap-2"
            >
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-[#6D28D9] flex items-center justify-center shadow-xs">
                <Upload className="w-6 h-6" />
              </div>
              <span className="text-sm font-bold text-purple-950">
                {isUploading ? 'Uploading files securely...' : 'Tap to Select Photos & Videos'}
              </span>
              <span className="text-[11px] text-gray-500">
                Select multiple files instantly · No arbitrary file count limits
              </span>
            </label>
          </div>

          {/* Upload progress bar if uploading */}
          {isUploading && (
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-semibold text-gray-600">
                <span>Uploading chunked files...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-purple-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#6D28D9] h-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {uploadError && (
            <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-red-700 text-xs flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          {/* Selected files list */}
          {uploadedFiles.length > 0 && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-gray-800">
                  Selected Files ({uploadedFiles.length})
                </span>
                <span className="font-mono text-purple-800 font-bold">
                  Total Size: {totalFileSizeMB.toFixed(1)} MB
                </span>
              </div>

              <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                {uploadedFiles.map((f) => (
                  <div
                    key={f.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-purple-50/70 border border-purple-100 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {f.mimeType.startsWith('video') ? (
                        <FileVideo className="w-4 h-4 text-[#6D28D9] shrink-0" />
                      ) : (
                        <FileImage className="w-4 h-4 text-[#6D28D9] shrink-0" />
                      )}
                      <div className="min-w-0">
                        <p className="font-bold text-gray-900 truncate">{f.originalName}</p>
                        <p className="text-[10px] text-gray-500 font-mono">
                          {(f.size / (1024 * 1024)).toFixed(1)} MB · Securely Stored
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeUploadedFile(f.id)}
                      className="p-1 text-gray-400 hover:text-red-600 rounded-lg"
                      title="Remove file"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation Buttons: Back and Next: Payment */}
          <div className="pt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="py-3 px-4 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={handleNextFromStep2}
              className="flex-1 py-3.5 px-6 rounded-2xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-extrabold text-xs shadow-ios flex items-center justify-center gap-2 transition-transform active:scale-[0.99]"
            >
              <span>Next: Payment & Place Order</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* WIZARD STEP 3 — PAYMENT & ORDER SUBMISSION */}
      {currentStep === 3 && (
        <form onSubmit={handlePlaceOrder} className="bg-white rounded-3xl p-5 shadow-ios border border-purple-100/70 space-y-5 animate-fade-in">
          <div className="flex items-center justify-between pb-2 border-b border-purple-100">
            <div>
              <h3 className="text-base font-extrabold text-gray-900">Step 3 — Payment & Order Summary</h3>
              <p className="text-xs text-gray-500">Review order summary, contact details, and UPI payment</p>
            </div>
            {selectedService && (
              <span className="text-sm font-black text-[#6D28D9] bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
                ₹{totalPrice > 0 ? totalPrice : 'Quote'}
              </span>
            )}
          </div>

          {/* Order Summary Box */}
          <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100 space-y-2 text-xs">
            <p className="font-bold text-purple-950 uppercase tracking-wide text-[10px]">
              Order Summary
            </p>
            <div className="flex justify-between">
              <span className="text-gray-600">Selected Service:</span>
              <span className="font-bold text-gray-900">{selectedService?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Raw Files Attached:</span>
              <span className="font-bold text-purple-900">{uploadedFiles.length} file(s) ({totalFileSizeMB.toFixed(1)} MB)</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-purple-200/60 font-bold">
              <span className="text-gray-800">Total Agreed Price:</span>
              <span className="text-[#6D28D9] text-sm">₹{totalPrice > 0 ? totalPrice : 'On Discussion'}</span>
            </div>
          </div>

          {/* Customer Details */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
              Customer Details & Instructions
            </h4>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Your Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Shubh Patel"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-purple-50/30 border border-purple-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/40 focus:bg-white text-gray-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Mobile Number (for live tracking in My Orders) <span className="text-red-500">*</span>
              </label>
              <div className="relative flex">
                <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-purple-100 bg-purple-50 text-xs font-bold text-purple-900">
                  +91
                </span>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  placeholder="10-digit mobile number"
                  value={customerMobile}
                  onChange={(e) => setCustomerMobile(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3.5 py-2.5 text-xs bg-purple-50/30 border border-purple-100 rounded-r-xl focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/40 focus:bg-white text-gray-900 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Editing Requirements & Vision <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                placeholder="Describe music preference, text titles, pacing, or specific cuts..."
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-purple-50/30 border border-purple-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/40 focus:bg-white text-gray-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Reference Links (Instagram / YouTube / Drive)
              </label>
              <input
                type="text"
                placeholder="e.g. style reference link"
                value={referenceLinks}
                onChange={(e) => setReferenceLinks(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-purple-50/30 border border-purple-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/40 focus:bg-white text-gray-900"
              />
            </div>
          </div>

          {/* Payment Section */}
          <div className="space-y-3 pt-2 border-t border-purple-100">
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
              Payment & QR Code
            </h4>

            <UpiQr
              amount={totalPrice}
              payeeName="Gurudev Studio"
              upiId="9909404141@upi"
              orderReference="WIZARD-ORDER"
            />

            <div className="space-y-2 pt-1">
              <label className="block text-xs font-semibold text-gray-700">
                UPI UTR / Reference ID (12 digits)
              </label>
              <input
                type="text"
                placeholder="e.g. 429381749281 from GPay/PhonePe receipt"
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-purple-50/30 border border-purple-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/40 focus:bg-white text-gray-900 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Upload Payment Screenshot (Optional)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  id="screenshot-input-step3"
                  accept="image/*"
                  onChange={handleScreenshotUpload}
                  className="hidden"
                />
                <label
                  htmlFor="screenshot-input-step3"
                  className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#6D28D9] text-xs font-bold border border-purple-200/60"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isUploadingScreenshot ? 'Uploading...' : 'Choose Payment Proof'}</span>
                </label>
                {paymentScreenshotUrl && (
                  <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Proof attached</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {formError && (
            <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-red-700 text-xs flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Navigation Buttons: Back and Place Order */}
          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="py-3 px-4 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-[#5B21B6] via-[#6D28D9] to-[#7C3AED] hover:from-[#4C1D95] hover:to-[#6D28D9] text-white font-extrabold text-sm shadow-ios-lg flex items-center justify-center gap-2 transition-transform active:scale-[0.99] disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting Order...</span>
                </>
              ) : (
                <>
                  <span>Place Order Now</span>
                  <span className="bg-white/20 px-2 py-0.5 rounded-lg text-xs font-bold">
                    ₹{totalPrice > 0 ? totalPrice : 'Quote'}
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* SUCCESS CONFIRMATION MODAL */}
      {createdOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-purple-100 text-center relative max-h-[90vh] overflow-y-auto">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-black text-gray-900 tracking-tight">
              Order Placed Successfully!
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Your video project has been registered at gurudevstudio.official.
            </p>

            {/* Order ID Pill */}
            <div className="mt-4 p-3 bg-purple-50 rounded-2xl border border-purple-100 flex items-center justify-between">
              <div className="text-left">
                <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider block">
                  Your Order ID
                </span>
                <span className="text-base font-extrabold text-[#6D28D9] font-mono">
                  {createdOrder.id}
                </span>
              </div>
              <button
                type="button"
                onClick={copyOrderId}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white text-[#6D28D9] text-xs font-bold shadow-xs hover:bg-purple-100/50"
              >
                {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedId ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            {/* Quick summary */}
            <div className="mt-4 text-left p-3.5 bg-gray-50 rounded-2xl space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Service:</span>
                <span className="font-bold text-gray-900">{createdOrder.serviceName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Agreed Price:</span>
                <span className="font-bold text-[#6D28D9]">{createdOrder.priceFormatted}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Mobile:</span>
                <span className="font-mono text-gray-900">+91 {createdOrder.customerMobile}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Files Uploaded:</span>
                <span className="text-gray-900">{createdOrder.uploadedFiles.length} item(s)</span>
              </div>
            </div>

            {/* WhatsApp notification CTA */}
            <div className="mt-5 space-y-2.5">
              <a
                href={
                  whatsappInfo?.primaryUrl ||
                  `https://wa.me/919909404141?text=Hi%20gurudevstudio.official,%20my%20order%20is%20${createdOrder.id}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold rounded-2xl shadow-md transition-transform active:scale-[0.98]"
              >
                <MessageCircle className="w-4 h-4 fill-white/20" />
                <span>Send Order Details to WhatsApp Support</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  setCreatedOrder(null);
                  onNavigateToOrders();
                }}
                className="w-full py-3 px-4 bg-purple-50 hover:bg-purple-100 text-[#6D28D9] text-xs font-bold rounded-2xl transition-colors"
              >
                Track Live Order Status in &quot;My Orders&quot;
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
