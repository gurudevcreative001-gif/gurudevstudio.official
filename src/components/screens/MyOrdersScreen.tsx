import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardList,
  Search,
  CheckCircle2,
  Clock,
  Film,
  Download,
  MessageCircle,
  Copy,
  Check,
  RefreshCw,
  AlertCircle,
  ShieldCheck,
  FileVideo,
  FileImage,
  ExternalLink,
  ChevronRight,
  PlusCircle,
  Lock,
} from 'lucide-react';
import { Order, OrderStatus, PaymentStatus } from '../../types';
import { apiClient } from '../../api/client';

interface MyOrdersScreenProps {
  onNavigateToCreate: () => void;
}

const ORDER_STEPS: { status: OrderStatus; label: string; description: string }[] = [
  { status: 'order_placed', label: 'Order Placed', description: 'Requirements & files received' },
  { status: 'payment_verification', label: 'Payment Verification', description: 'Verifying UPI / Advance' },
  { status: 'editing', label: 'Editing in Progress', description: 'Editor cutting & color grading' },
  { status: 'completed', label: 'Completed', description: 'Video ready for download' },
  { status: 'delivered', label: 'Delivered', description: 'Project delivered & closed' },
];

export const MyOrdersScreen: React.FC<MyOrdersScreenProps> = ({ onNavigateToCreate }) => {
  // Mobile verification state
  const [mobileInput, setMobileInput] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [generatedCodeHint, setGeneratedCodeHint] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Authenticated state
  const [authenticatedMobile, setAuthenticatedMobile] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('all');

  // Check saved customer authentication on mount
  useEffect(() => {
    const savedMobile = apiClient.getCustomerMobile();
    const token = apiClient.getCustomerToken();
    if (savedMobile && token) {
      setAuthenticatedMobile(savedMobile);
      fetchOrders(savedMobile);
    } else {
      apiClient.clearCustomerAuth();
    }
  }, []);

  const fetchOrders = async (mobile: string) => {
    setLoadingOrders(true);
    try {
      const data = await apiClient.getCustomerOrders(mobile);
      setOrders(data);
    } catch (err: any) {
      if (err.message && (err.message.includes('Unauthorized') || err.message.includes('authentication'))) {
        apiClient.clearCustomerAuth();
        setAuthenticatedMobile(null);
      } else {
        console.error('Failed to fetch orders:', err);
      }
    } finally {
      setLoadingOrders(false);
    }
  };

  // Step 1: Send verification code to customer mobile
  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const clean = mobileInput.trim().replace(/\D/g, '').slice(-10);
    if (!clean || clean.length !== 10) {
      setAuthError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setIsVerifying(true);
    try {
      const res = await apiClient.requestVerificationCode(clean);
      setCodeSent(true);
      setGeneratedCodeHint(res.code);
      setVerificationCode(res.code); // auto-fill for frictionless mobile UX
    } catch (err: any) {
      setAuthError(err.message || 'Failed to request verification code');
    } finally {
      setIsVerifying(false);
    }
  };

  // Step 2: Verify code
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const clean = mobileInput.trim().replace(/\D/g, '').slice(-10);
    if (!verificationCode.trim()) {
      setAuthError('Please enter the 4-digit verification code.');
      return;
    }

    setIsVerifying(true);
    try {
      const userOrders = await apiClient.verifyCustomerCode(clean, verificationCode.trim());
      setAuthenticatedMobile(clean);
      setOrders(userOrders);
      setCodeSent(false);
      setGeneratedCodeHint(null);
    } catch (err: any) {
      setAuthError(err.message || 'Invalid or expired code. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleLogout = () => {
    apiClient.clearCustomerAuth();
    setAuthenticatedMobile(null);
    setOrders([]);
    setMobileInput('');
    setVerificationCode('');
    setCodeSent(false);
  };

  const copyOrderId = (orderId: string) => {
    navigator.clipboard.writeText(orderId);
    setCopiedOrderId(orderId);
    setTimeout(() => setCopiedOrderId(null), 2000);
  };

  // Helpers for status formatting
  const getStepIndex = (status: OrderStatus) => {
    return ORDER_STEPS.findIndex((s) => s.status === status);
  };

  const getPaymentBadge = (payment: PaymentStatus) => {
    switch (payment) {
      case 'paid':
        return (
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Paid</span>
          </span>
        );
      case 'under_verification':
        return (
          <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200/60 flex items-center gap-1">
            <Clock className="w-3 h-3 text-blue-600" />
            <span>Verifying Payment</span>
          </span>
        );
      case 'unpaid':
      default:
        return (
          <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200/60 flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-600" />
            <span>Unpaid / On Discussion</span>
          </span>
        );
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (filterStatus === 'active') {
      return o.orderStatus !== 'completed' && o.orderStatus !== 'delivered';
    }
    if (filterStatus === 'completed') {
      return o.orderStatus === 'completed' || o.orderStatus === 'delivered';
    }
    return true;
  });

  return (
    <div className="pb-24 pt-4 px-4 max-w-2xl mx-auto">
      {/* Title & Introduction */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-[#6D28D9]" />
            <span>My Orders & Live Tracking</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Track editing milestones and download your completed videos.
          </p>
        </div>

        {authenticatedMobile && (
          <button
            type="button"
            onClick={() => fetchOrders(authenticatedMobile)}
            disabled={loadingOrders}
            className="p-2 rounded-xl bg-purple-50 text-[#6D28D9] hover:bg-purple-100 transition-colors"
            title="Refresh Orders"
          >
            <RefreshCw className={`w-4 h-4 ${loadingOrders ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>

      {/* CASE 1: NOT AUTHENTICATED -> Mobile Verification Portal */}
      {!authenticatedMobile ? (
        <div className="bg-white rounded-3xl p-6 shadow-ios border border-purple-100/70 text-center">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-[#6D28D9] mx-auto flex items-center justify-center mb-3">
            <Lock className="w-6 h-6" />
          </div>

          <h3 className="text-base font-extrabold text-gray-900">
            Access Your Private Orders
          </h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto leading-relaxed">
            Only authorized customers can view their order files. Enter the 10-digit mobile number used when placing your order.
          </p>

          {!codeSent ? (
            <form onSubmit={handleRequestCode} className="mt-5 space-y-3.5 text-left">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Customer Mobile Number
                </label>
                <div className="relative flex">
                  <span className="inline-flex items-center px-3.5 rounded-l-xl border border-r-0 border-purple-100 bg-purple-50 text-xs font-bold text-purple-900">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="Enter 10-digit mobile"
                    value={mobileInput}
                    onChange={(e) => setMobileInput(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3.5 py-2.5 text-xs bg-purple-50/30 border border-purple-100 rounded-r-xl focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/40 focus:bg-white text-gray-900 font-mono"
                  />
                </div>
              </div>

              {authError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isVerifying}
                className="w-full py-3 px-4 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-transform active:scale-[0.99] disabled:opacity-60"
              >
                {isVerifying ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Sending Code...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Find My Orders</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyCode} className="mt-5 space-y-3.5 text-left">
              <div className="p-3 bg-purple-50 rounded-2xl border border-purple-100 text-xs text-purple-900">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Code sent to: +91 {mobileInput}</span>
                  <button
                    type="button"
                    onClick={() => setCodeSent(false)}
                    className="text-[#6D28D9] font-bold text-[11px] underline"
                  >
                    Change
                  </button>
                </div>
                {generatedCodeHint && (
                  <div className="mt-2 pt-2 border-t border-purple-200/60 flex items-center justify-between">
                    <span className="text-[11px] text-gray-600">Verification Code:</span>
                    <span className="font-mono font-bold text-sm bg-white px-2 py-0.5 rounded border border-purple-200 text-[#6D28D9]">
                      {generatedCodeHint}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Enter 4-Digit Verification Code
                </label>
                <input
                  type="text"
                  required
                  maxLength={4}
                  placeholder="e.g. 1234"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3.5 py-2.5 text-center text-lg tracking-widest bg-purple-50/30 border border-purple-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/40 focus:bg-white text-gray-900 font-mono font-bold"
                />
              </div>

              {authError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isVerifying}
                className="w-full py-3 px-4 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-transform active:scale-[0.99] disabled:opacity-60"
              >
                {isVerifying ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verify & View Orders</span>
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-5 pt-4 border-t border-purple-100/60 flex items-center justify-center gap-1 text-[11px] text-gray-500">
            <span>Haven&apos;t placed an order yet?</span>
            <button
              type="button"
              onClick={onNavigateToCreate}
              className="text-[#6D28D9] font-bold hover:underline"
            >
              Create Order
            </button>
          </div>
        </div>
      ) : (
        /* CASE 2: AUTHENTICATED -> View and Track Orders */
        <div className="space-y-4">
          {/* User Session Bar */}
          <div className="bg-white rounded-2xl p-3 shadow-xs border border-purple-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-full bg-purple-100 text-[#6D28D9] flex items-center justify-center font-bold text-xs">
                +91
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-gray-500 block leading-tight">Verified Phone</span>
                <span className="font-mono font-bold text-gray-900 truncate block">
                  +91 {authenticatedMobile}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="text-xs text-gray-500 hover:text-red-600 font-semibold px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Switch Phone
            </button>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center gap-1.5 p-1 bg-purple-50/70 rounded-2xl">
            <button
              type="button"
              onClick={() => setFilterStatus('all')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
                filterStatus === 'all'
                  ? 'bg-white text-[#6D28D9] shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All ({orders.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('active')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
                filterStatus === 'active'
                  ? 'bg-white text-[#6D28D9] shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              In Progress ({orders.filter((o) => o.orderStatus !== 'completed' && o.orderStatus !== 'delivered').length})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('completed')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
                filterStatus === 'completed'
                  ? 'bg-white text-[#6D28D9] shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Completed ({orders.filter((o) => o.orderStatus === 'completed' || o.orderStatus === 'delivered').length})
            </button>
          </div>

          {/* Orders list */}
          {loadingOrders ? (
            <div className="bg-white rounded-3xl p-8 text-center text-xs text-gray-500 shadow-ios">
              <div className="w-8 h-8 border-2 border-[#6D28D9] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <span>Fetching your video orders...</span>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center shadow-ios border border-purple-100">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#6D28D9] mx-auto flex items-center justify-center mb-3">
                <Film className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-gray-900">No Orders Found</h4>
              <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                No orders registered under +91 {authenticatedMobile}. Start your first video editing project today!
              </p>
              <button
                type="button"
                onClick={onNavigateToCreate}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-[#6D28D9] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#5B21B6]"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create New Order</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => {
                const currentStepIdx = getStepIndex(order.orderStatus);

                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-3xl p-5 shadow-ios border border-purple-100/80 transition-all hover:border-purple-200"
                  >
                    {/* Order Header */}
                    <div className="flex items-start justify-between gap-3 pb-3 border-b border-purple-100/60">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-extrabold text-[#6D28D9]">
                            {order.id}
                          </span>
                          <button
                            type="button"
                            onClick={() => copyOrderId(order.id)}
                            className="p-1 text-gray-400 hover:text-gray-600 rounded"
                            title="Copy Order ID"
                          >
                            {copiedOrderId === order.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        <h3 className="text-sm font-bold text-gray-900 mt-0.5">
                          {order.serviceName}
                        </h3>
                        <p className="text-[11px] text-gray-500">
                          Ordered on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                      </div>

                      <div className="text-right">
                        <div className="text-sm font-extrabold text-[#6D28D9] tabular-nums">
                          {order.priceFormatted}
                        </div>
                        <div className="mt-1">{getPaymentBadge(order.paymentStatus)}</div>
                      </div>
                    </div>

                    {/* LIVE TRACKING TIMELINE */}
                    <div className="my-4 pt-1">
                      <p className="text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-3">
                        Live Order Progress:
                      </p>

                      <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-purple-100">
                        {ORDER_STEPS.map((step, idx) => {
                          const isDone = currentStepIdx >= idx;
                          const isCurrent = currentStepIdx === idx;

                          // Find matching timeline log if available
                          const log = order.timeline.find((t) => t.status === step.status);

                          return (
                            <div key={step.status} className="relative">
                              {/* Node Circle */}
                              <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${
                                  isDone
                                    ? 'bg-[#6D28D9] text-white ring-4 ring-purple-100'
                                    : 'bg-gray-100 text-gray-400'
                                }`}
                              >
                                {isDone ? <Check className="w-3 h-3 stroke-[3]" /> : idx + 1}
                              </motion.div>

                              <div className="min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <h4
                                    className={`text-xs font-bold ${
                                      isCurrent
                                        ? 'text-[#6D28D9]'
                                        : isDone
                                        ? 'text-gray-900'
                                        : 'text-gray-400'
                                    }`}
                                  >
                                    {step.label}
                                  </h4>
                                  {log && (
                                    <span className="text-[10px] text-gray-500 font-mono">
                                      {new Date(log.timestamp).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                      })}
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-gray-500">
                                  {log?.note || step.description}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* COMPLETED VIDEO DOWNLOAD SECTION */}
                    {order.deliveredFiles && order.deliveredFiles.length > 0 && (
                      <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-purple-50 to-emerald-50 border border-emerald-200 text-left">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          <h4 className="text-xs font-extrabold text-emerald-950 uppercase tracking-wide">
                            Your Video is Ready for Download!
                          </h4>
                        </div>
                        <p className="text-[11px] text-gray-600 mb-3">
                          gurudevstudio.official has completed and verified your video. Download the high-resolution master file below:
                        </p>

                        <div className="space-y-2">
                          {order.deliveredFiles.map((file) => (
                            <div
                              key={file.id}
                              className="flex items-center justify-between p-3 bg-white rounded-xl border border-emerald-200/80 shadow-xs"
                            >
                              <div className="min-w-0 flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                                  <FileVideo className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-gray-900 truncate">
                                    {file.title}
                                  </p>
                                  <p className="text-[10px] text-gray-500">
                                    {file.fileSize || 'Master Video'} · Delivered{' '}
                                    {new Date(file.deliveredAt).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>

                              <a
                                href={file.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                download
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold rounded-xl shadow-xs transition-colors shrink-0"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>Download</span>
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Customer Files Summary */}
                    {order.uploadedFiles && order.uploadedFiles.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-purple-100/60 flex items-center justify-between text-xs text-gray-600">
                        <span className="text-[11px] font-medium text-gray-500">
                          {order.uploadedFiles.length} raw file(s) attached to order
                        </span>
                        <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                          Securely Stored
                        </span>
                      </div>
                    )}

                    {/* Contact Studio about this specific order */}
                    <div className="mt-4 pt-3 border-t border-purple-100/60 flex items-center justify-between gap-2">
                      <a
                        href={`https://wa.me/919909404141?text=${encodeURIComponent(
                          `Hello gurudevstudio.official, I am inquiring about my Order ID: ${order.id} (${order.serviceName})`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#6D28D9] font-bold text-xs transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Chat Support about this Order</span>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
