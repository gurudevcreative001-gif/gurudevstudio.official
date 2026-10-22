import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  Plus,
  Edit2,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Eye,
  CheckCircle2,
  AlertCircle,
  Clock,
  Download,
  MessageCircle,
  Search,
  RefreshCw,
  LogOut,
  X,
  FileVideo,
  FileImage,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Service, Order, AdminStats, OrderStatus, PaymentStatus } from '../../types';
import { apiClient } from '../../api/client';
import { ServiceModal } from './ServiceModal';
import { DeliverVideoModal } from './DeliverVideoModal';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onServicesChanged: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  onServicesChanged,
}) => {
  // Authentication
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('shubhpatel909455@gmail.com');
  const [passcode, setPasscode] = useState('gurudev2026');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Active sub-tab
  const [activeTab, setActiveTab] = useState<'services' | 'orders'>('services');

  // Stats
  const [stats, setStats] = useState<AdminStats | null>(null);

  // Services state
  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [selectedServiceToEdit, setSelectedServiceToEdit] = useState<Service | null>(null);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);

  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [selectedOrderToDeliver, setSelectedOrderToDeliver] = useState<Order | null>(null);

  // Notifications
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    if (isOpen) {
      checkAuth();
    }
  }, [isOpen]);

  const checkAuth = async () => {
    const isAuth = await apiClient.checkAdminAuth();
    setIsAuthenticated(isAuth);
    if (isAuth) {
      loadAdminData();
    }
  };

  const loadAdminData = async () => {
    loadStats();
    loadServices();
    loadOrders();
  };

  const loadStats = async () => {
    try {
      const data = await apiClient.getAdminStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const loadServices = async () => {
    setLoadingServices(true);
    try {
      const data = await apiClient.getAdminServices();
      setServices(data);
    } catch (err: any) {
      showToast(err.message || 'Failed to load services', 'error');
    } finally {
      setLoadingServices(false);
    }
  };

  const loadOrders = async () => {
    setLoadingOrders(true);
    try {
      const data = await apiClient.getAdminOrders();
      setOrders(data);
    } catch (err: any) {
      showToast(err.message || 'Failed to load orders', 'error');
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);

    try {
      await apiClient.adminLogin(email.trim(), passcode.trim());
      setIsAuthenticated(true);
      loadAdminData();
      showToast('Logged in as Studio Admin');
    } catch (err: any) {
      setLoginError(err.message || 'Invalid credentials');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    apiClient.clearAdminToken();
    setIsAuthenticated(false);
  };

  // --- SERVICE ACTIONS ---
  const handleSaveService = async (serviceData: any) => {
    if (selectedServiceToEdit) {
      // Edit
      await apiClient.updateAdminService(selectedServiceToEdit.id, serviceData);
      showToast('Service updated successfully');
    } else {
      // Add new
      await apiClient.addAdminService(serviceData);
      showToast('New service added successfully');
    }
    loadServices();
    loadStats();
    onServicesChanged();
  };

  const handleToggleService = async (service: Service) => {
    try {
      await apiClient.toggleAdminService(service.id);
      showToast(`Service "${service.name}" ${service.enabled ? 'disabled' : 'enabled'}`);
      loadServices();
      loadStats();
      onServicesChanged();
    } catch (err: any) {
      showToast(err.message || 'Failed to toggle service', 'error');
    }
  };

  const handleDeleteService = async () => {
    if (!serviceToDelete) return;
    try {
      await apiClient.deleteAdminService(serviceToDelete.id);
      showToast(`Service "${serviceToDelete.name}" deleted successfully`);
      setServiceToDelete(null);
      loadServices();
      loadStats();
      onServicesChanged();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete service', 'error');
    }
  };

  // --- ORDER ACTIONS ---
  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      await apiClient.updateOrderStatus(orderId, status);
      showToast(`Order status updated to ${status}`);
      loadOrders();
      loadStats();
    } catch (err: any) {
      showToast(err.message || 'Failed to update order status', 'error');
    }
  };

  const handleUpdatePaymentStatus = async (orderId: string, paymentStatus: PaymentStatus) => {
    try {
      await apiClient.updateOrderPayment(orderId, paymentStatus);
      showToast(`Payment status updated to ${paymentStatus}`);
      loadOrders();
      loadStats();
    } catch (err: any) {
      showToast(err.message || 'Failed to update payment status', 'error');
    }
  };

  const handleDeliverVideo = async (
    orderId: string,
    data: { title: string; url: string; fileSize?: string }
  ) => {
    await apiClient.deliverVideo(orderId, data);
    showToast('Video delivered and download link attached to order');
    loadOrders();
    loadStats();
  };

  if (!isOpen) return null;

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = orderStatusFilter === 'all' || o.orderStatus === orderStatusFilter;
    const matchesSearch =
      o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customerMobile.includes(orderSearch) ||
      o.serviceName.toLowerCase().includes(orderSearch.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="bg-[#F5F3FF] rounded-3xl max-w-4xl w-full h-[92vh] flex flex-col shadow-2xl border border-purple-200 overflow-hidden relative">
        {/* Toast alert */}
        {toastMessage && (
          <div
            className={`absolute top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl text-xs font-bold shadow-lg transition-all flex items-center gap-1.5 ${
              toastMessage.type === 'success'
                ? 'bg-emerald-600 text-white'
                : 'bg-red-600 text-white'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-3.5 h-3.5" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        )}

        {/* Top Header */}
        <div className="bg-white px-5 py-3.5 border-b border-purple-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#6D28D9] text-white flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black text-gray-900 tracking-tight">
                Studio Admin Portal
              </h2>
              <p className="text-[11px] text-purple-700 font-semibold">
                gurudevstudio.official Management
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              title="Close Admin"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* BODY */}
        {!isAuthenticated ? (
          /* LOGIN FORM */
          <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-ios border border-purple-100 text-center">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-[#6D28D9] mx-auto flex items-center justify-center mb-3">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-gray-900">Admin Authentication</h3>
              <p className="text-xs text-gray-500 mt-1">
                Authorized studio owner and editors only.
              </p>

              <form onSubmit={handleLogin} className="mt-5 space-y-3.5 text-left text-xs">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Admin Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-purple-50/30 border border-purple-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/40 focus:bg-white text-gray-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Passcode</label>
                  <input
                    type="password"
                    required
                    placeholder="Enter passcode"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-purple-50/30 border border-purple-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/40 focus:bg-white text-gray-900 font-mono"
                  />
                  <p className="text-[10px] text-purple-700 mt-1 font-medium">
                    Demo studio passcode: <span className="font-mono font-bold">gurudev2026</span>
                  </p>
                </div>

                {loginError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full py-3 px-4 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-bold shadow-xs flex items-center justify-center gap-2 transition-transform active:scale-[0.99] disabled:opacity-60 mt-2"
                >
                  {isLoggingIn ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <span>Sign In to Admin Portal</span>
                  )}
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* AUTHENTICATED ADMIN DASHBOARD */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* KPI STATS BAR */}
            <div className="bg-white border-b border-purple-100 px-5 py-3 shrink-0">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-2.5 bg-purple-50/70 rounded-2xl border border-purple-100/60">
                  <span className="text-[10px] font-bold text-gray-500 uppercase block">Total Orders</span>
                  <span className="text-base font-black text-[#6D28D9] font-mono">
                    {stats?.totalOrders ?? orders.length}
                  </span>
                </div>
                <div className="p-2.5 bg-emerald-50/70 rounded-2xl border border-emerald-100/60">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase block">Total Revenue</span>
                  <span className="text-base font-black text-emerald-800 font-mono">
                    ₹{stats?.totalRevenue ?? 0}
                  </span>
                </div>
                <div className="p-2.5 bg-amber-50/70 rounded-2xl border border-amber-100/60">
                  <span className="text-[10px] font-bold text-amber-700 uppercase block">In Editing</span>
                  <span className="text-base font-black text-amber-800 font-mono">
                    {orders.filter((o) => o.orderStatus === 'editing').length}
                  </span>
                </div>
                <div className="p-2.5 bg-blue-50/70 rounded-2xl border border-blue-100/60">
                  <span className="text-[10px] font-bold text-blue-700 uppercase block">Active Services</span>
                  <span className="text-base font-black text-blue-800 font-mono">
                    {services.filter((s) => s.enabled).length} / {services.length}
                  </span>
                </div>
              </div>

              {/* Sub-Tabs (Services vs Orders) */}
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-purple-50">
                <button
                  type="button"
                  onClick={() => setActiveTab('services')}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'services'
                      ? 'bg-[#6D28D9] text-white shadow-xs'
                      : 'bg-purple-50 text-purple-900 hover:bg-purple-100'
                  }`}
                >
                  Manage Services ({services.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('orders')}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'orders'
                      ? 'bg-[#6D28D9] text-white shadow-xs'
                      : 'bg-purple-50 text-purple-900 hover:bg-purple-100'
                  }`}
                >
                  Manage Orders ({orders.length})
                </button>
              </div>
            </div>

            {/* TAB CONTENT */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5">
              {activeTab === 'services' ? (
                /* TAB 1: SERVICE MANAGEMENT */
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-extrabold text-gray-900">
                        Service Catalog & Pricing
                      </h3>
                      <p className="text-[11px] text-gray-500">
                        Live prices automatically update on customer Create Order screen.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedServiceToEdit(null);
                        setIsServiceModalOpen(true);
                      }}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white text-xs font-bold shadow-xs transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add New Service</span>
                    </button>
                  </div>

                  {loadingServices ? (
                    <div className="py-12 text-center text-xs text-gray-500">
                      Loading services from database...
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {services.map((srv) => (
                        <div
                          key={srv.id}
                          className={`bg-white rounded-2xl p-4 shadow-xs border transition-all ${
                            srv.enabled
                              ? 'border-purple-100'
                              : 'border-gray-200 bg-gray-50/70 opacity-75'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-xs font-bold text-gray-900">
                                  {srv.name}
                                </h4>
                                {srv.badge && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-purple-100 text-purple-900">
                                    {srv.badge}
                                  </span>
                                )}
                                {!srv.enabled && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-gray-200 text-gray-700">
                                    Disabled
                                  </span>
                                )}
                              </div>

                              {srv.gujaratiName && (
                                <p className="text-[11px] text-purple-800 font-medium mt-0.5">
                                  {srv.gujaratiName}
                                </p>
                              )}
                              <p className="text-[11px] text-gray-500 mt-1 line-clamp-1">
                                {srv.description}
                              </p>
                            </div>

                            <div className="text-right shrink-0">
                              <div className="text-xs font-extrabold text-[#6D28D9] font-mono">
                                {srv.price > 0 ? (
                                  <>
                                    ₹{srv.price}
                                    {srv.isStartingPrice && <span className="text-[10px] text-purple-700 ml-0.5">થી</span>}
                                  </>
                                ) : (
                                  'ભાવ ચર્ચાથી'
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Quick Admin Actions */}
                          <div className="mt-3 pt-2.5 border-t border-purple-50 flex items-center justify-between text-xs">
                            <button
                              type="button"
                              onClick={() => handleToggleService(srv)}
                              className={`flex items-center gap-1.5 text-[11px] font-semibold transition-colors ${
                                srv.enabled
                                  ? 'text-emerald-700 hover:text-emerald-800'
                                  : 'text-gray-500 hover:text-gray-700'
                              }`}
                            >
                              {srv.enabled ? (
                                <>
                                  <ToggleRight className="w-4 h-4 text-emerald-600" />
                                  <span>Active (Showing in App)</span>
                                </>
                              ) : (
                                <>
                                  <ToggleLeft className="w-4 h-4 text-gray-400" />
                                  <span>Disabled (Hidden from App)</span>
                                </>
                              )}
                            </button>

                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedServiceToEdit(srv);
                                  setIsServiceModalOpen(true);
                                }}
                                className="p-1.5 text-gray-600 hover:text-[#6D28D9] hover:bg-purple-50 rounded-lg transition-colors"
                                title="Edit Service"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setServiceToDelete(srv)}
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete Service"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* TAB 2: ORDER MANAGEMENT */
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-extrabold text-gray-900">
                        Customer Orders & Tracking
                      </h3>
                      <p className="text-[11px] text-gray-500">
                        Update live editing milestones, payments, and upload completed videos.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={loadOrders}
                      disabled={loadingOrders}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 text-[#6D28D9] text-xs font-bold hover:bg-purple-100"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${loadingOrders ? 'animate-spin' : ''}`} />
                      <span>Refresh</span>
                    </button>
                  </div>

                  {/* Search and status filters */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search by Order ID, name, or phone..."
                        value={orderSearch}
                        onChange={(e) => setOrderSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-purple-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/40"
                      />
                    </div>
                    <select
                      value={orderStatusFilter}
                      onChange={(e) => setOrderStatusFilter(e.target.value)}
                      className="px-3 py-2 text-xs bg-white border border-purple-100 rounded-xl font-medium text-gray-800"
                    >
                      <option value="all">All Statuses</option>
                      <option value="order_placed">Order Placed</option>
                      <option value="payment_verification">Payment Verification</option>
                      <option value="editing">Editing in Progress</option>
                      <option value="completed">Completed</option>
                      <option value="delivered">Delivered</option>
                    </select>
                  </div>

                  {/* Orders list */}
                  {loadingOrders ? (
                    <div className="py-12 text-center text-xs text-gray-500">
                      Loading orders...
                    </div>
                  ) : filteredOrders.length === 0 ? (
                    <div className="bg-white rounded-2xl p-8 text-center text-xs text-gray-500">
                      No matching orders found.
                    </div>
                  ) : (
                    <div className="space-y-3.5">
                      {filteredOrders.map((order) => (
                        <div
                          key={order.id}
                          className="bg-white rounded-2xl p-4 shadow-xs border border-purple-100 space-y-3"
                        >
                          {/* Order Top Bar */}
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-xs text-[#6D28D9]">
                                  {order.id}
                                </span>
                                <span className="text-[10px] text-gray-500">
                                  {new Date(order.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <h4 className="text-sm font-bold text-gray-900 mt-0.5">
                                {order.customerName} ·{' '}
                                <span className="font-mono text-purple-900">
                                  +91 {order.customerMobile}
                                </span>
                              </h4>
                              <p className="text-xs font-semibold text-gray-700">
                                {order.serviceName} ({order.priceFormatted})
                              </p>
                            </div>

                            <div className="flex flex-col items-end gap-1.5">
                              {/* Direct WhatsApp Customer */}
                              <a
                                href={`https://wa.me/91${order.customerMobile}?text=${encodeURIComponent(
                                  `Hello ${order.customerName}, regarding your video order ${order.id} with gurudevstudio.official...`
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[11px] font-bold border border-emerald-200/50"
                              >
                                <MessageCircle className="w-3 h-3" />
                                <span>WhatsApp Customer</span>
                              </a>
                            </div>
                          </div>

                          {/* Requirements & Uploads */}
                          <div className="p-3 bg-purple-50/50 rounded-xl text-xs space-y-1.5 text-gray-700">
                            <p>
                              <strong>Requirements:</strong> {order.requirements}
                            </p>
                            {order.referenceLinks && (
                              <p>
                                <strong>References:</strong>{' '}
                                <a
                                  href={order.referenceLinks}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[#6D28D9] underline"
                                >
                                  {order.referenceLinks}
                                </a>
                              </p>
                            )}
                            {order.paymentReference && (
                              <p>
                                <strong>Payment UTR/Ref:</strong>{' '}
                                <span className="font-mono font-bold text-purple-950">
                                  {order.paymentReference}
                                </span>
                              </p>
                            )}

                            {/* Raw uploaded files */}
                            {order.uploadedFiles && order.uploadedFiles.length > 0 && (
                              <div className="pt-2 border-t border-purple-100">
                                <p className="font-semibold text-gray-900 mb-1">
                                  Customer Uploaded Raw Files ({order.uploadedFiles.length}):
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                  {order.uploadedFiles.map((f) => (
                                    <a
                                      key={f.id}
                                      href={`/api/files/${f.filename}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-purple-200 rounded-lg text-[10px] font-semibold text-purple-900 hover:bg-purple-100"
                                    >
                                      {f.mimeType.startsWith('video') ? (
                                        <FileVideo className="w-3 h-3 text-[#6D28D9]" />
                                      ) : (
                                        <FileImage className="w-3 h-3 text-[#6D28D9]" />
                                      )}
                                      <span className="max-w-[120px] truncate">{f.originalName}</span>
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Order & Payment Controls */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
                            <div>
                              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-0.5">
                                Order Status
                              </label>
                              <select
                                value={order.orderStatus}
                                onChange={(e) =>
                                  handleUpdateOrderStatus(order.id, e.target.value as OrderStatus)
                                }
                                className="w-full px-2.5 py-1.5 bg-purple-50/70 border border-purple-100 rounded-xl font-bold text-purple-950"
                              >
                                <option value="order_placed">Order Placed</option>
                                <option value="payment_verification">Payment Verification</option>
                                <option value="editing">Editing in Progress</option>
                                <option value="completed">Completed</option>
                                <option value="delivered">Delivered</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-0.5">
                                Payment Status
                              </label>
                              <select
                                value={order.paymentStatus}
                                onChange={(e) =>
                                  handleUpdatePaymentStatus(order.id, e.target.value as PaymentStatus)
                                }
                                className="w-full px-2.5 py-1.5 bg-purple-50/70 border border-purple-100 rounded-xl font-bold text-purple-950"
                              >
                                <option value="unpaid">Unpaid / Discuss</option>
                                <option value="under_verification">Under Verification</option>
                                <option value="paid">Paid & Verified</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-0.5">
                                Deliver Video
                              </label>
                              <button
                                type="button"
                                onClick={() => setSelectedOrderToDeliver(order)}
                                className="w-full py-1.5 px-3 bg-[#16A34A] hover:bg-[#15803D] text-white font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-xs"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>Attach Video URL</span>
                              </button>
                            </div>
                          </div>

                          {/* Delivered files display */}
                          {order.deliveredFiles && order.deliveredFiles.length > 0 && (
                            <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-100 text-xs">
                              <span className="font-bold text-emerald-900 block mb-1">
                                Delivered Video Files:
                              </span>
                              {order.deliveredFiles.map((df) => (
                                <div
                                  key={df.id}
                                  className="flex items-center justify-between text-[11px]"
                                >
                                  <span className="text-gray-800 font-medium">{df.title}</span>
                                  <a
                                    href={df.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-emerald-700 underline font-bold"
                                  >
                                    View / Download Link
                                  </a>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* MODAL: ADD / EDIT SERVICE */}
        <ServiceModal
          service={selectedServiceToEdit}
          isOpen={isServiceModalOpen}
          onClose={() => {
            setIsServiceModalOpen(false);
            setSelectedServiceToEdit(null);
          }}
          onSave={handleSaveService}
        />

        {/* MODAL: DELIVER VIDEO */}
        <DeliverVideoModal
          order={selectedOrderToDeliver}
          isOpen={Boolean(selectedOrderToDeliver)}
          onClose={() => setSelectedOrderToDeliver(null)}
          onDeliver={handleDeliverVideo}
        />

        {/* CONFIRMATION MODAL: DELETE SERVICE */}
        {serviceToDelete && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-purple-100 text-center">
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 mx-auto flex items-center justify-center mb-3">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-gray-900">
                Delete Service?
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Are you sure you want to permanently delete &quot;{serviceToDelete.name}&quot;? Existing customer orders that already used this service will preserve their agreed price.
              </p>

              <div className="mt-5 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setServiceToDelete(null)}
                  className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteService}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs"
                >
                  Yes, Delete Service
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
