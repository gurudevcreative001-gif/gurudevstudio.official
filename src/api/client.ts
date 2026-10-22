import { Service, Order, AdminStats, OrderStatus, PaymentStatus } from '../types';

const ADMIN_TOKEN_KEY = 'gds_admin_token';
const CUSTOMER_TOKEN_KEY = 'gds_customer_token';
const CUSTOMER_MOBILE_KEY = 'gds_customer_mobile';

export const apiClient = {
  // --- Token helpers ---
  getAdminToken(): string | null {
    return localStorage.getItem(ADMIN_TOKEN_KEY);
  },
  setAdminToken(token: string) {
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
  },
  clearAdminToken() {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
  },

  getCustomerToken(): string | null {
    return localStorage.getItem(CUSTOMER_TOKEN_KEY);
  },
  setCustomerToken(token: string, mobile: string) {
    localStorage.setItem(CUSTOMER_TOKEN_KEY, token);
    localStorage.setItem(CUSTOMER_MOBILE_KEY, mobile);
  },
  getCustomerMobile(): string | null {
    return localStorage.getItem(CUSTOMER_MOBILE_KEY);
  },
  clearCustomerAuth() {
    localStorage.removeItem(CUSTOMER_TOKEN_KEY);
    localStorage.removeItem(CUSTOMER_MOBILE_KEY);
  },

  // --- Public / Customer APIs ---
  async getServices(): Promise<Service[]> {
    const res = await fetch('/api/services');
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Failed to fetch services');
    }
    const data = await res.json();
    return data.services || [];
  },

  async uploadFile(file: File): Promise<{ file: any; url: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'File upload failed');
    }

    return await res.json();
  },

  async createOrder(orderData: {
    customerName: string;
    customerMobile: string;
    customerWhatsapp?: string;
    serviceId: string;
    requirements: string;
    referenceLinks?: string;
    paymentMethod: 'upi' | 'cash' | 'discuss';
    paymentReference?: string;
    paymentScreenshot?: string;
    uploadedFiles: any[];
  }): Promise<{ order: Order; whatsappNotification: any }> {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Failed to submit order');
    }

    const data = await res.json();
    if (data.customerToken && data.order?.customerMobile) {
      this.setCustomerToken(data.customerToken, data.order.customerMobile);
    }
    return data;
  },

  async requestVerificationCode(mobile: string): Promise<{ code: string; hasOrders: boolean }> {
    const res = await fetch('/api/auth/send-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Failed to send verification code');
    }

    const data = await res.json();
    return {
      code: data.verificationCode,
      hasOrders: data.hasOrders,
    };
  },

  async verifyCustomerCode(mobile: string, code: string): Promise<Order[]> {
    const res = await fetch('/api/auth/verify-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile, code }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Verification code failed');
    }

    const data = await res.json();
    if (data.token) {
      this.setCustomerToken(data.token, mobile);
    }
    return data.orders || [];
  },

  async getCustomerOrders(mobile?: string): Promise<Order[]> {
    const token = this.getCustomerToken();
    const effectiveMobile = mobile || this.getCustomerMobile() || '';

    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const url = effectiveMobile
      ? `/api/customer/orders?mobile=${encodeURIComponent(effectiveMobile)}`
      : '/api/customer/orders';

    const res = await fetch(url, { headers });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Failed to fetch your orders');
    }

    const data = await res.json();
    return data.orders || [];
  },

  // --- Admin APIs ---
  async adminLogin(email: string, passcode: string): Promise<{ token: string }> {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, passcode }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Invalid credentials');
    }

    const data = await res.json();
    if (data.token) {
      this.setAdminToken(data.token);
    }
    return data;
  },

  async checkAdminAuth(): Promise<boolean> {
    const token = this.getAdminToken();
    if (!token) return false;
    try {
      const res = await fetch('/api/admin/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  async getAdminServices(): Promise<Service[]> {
    const token = this.getAdminToken();
    const res = await fetch('/api/admin/services', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Failed to fetch admin services');
    }
    const data = await res.json();
    return data.services || [];
  },

  async addAdminService(service: {
    name: string;
    gujaratiName?: string;
    category: Service['category'];
    description: string;
    price: number;
    isStartingPrice: boolean;
    imageUrl?: string;
    badge?: string;
  }): Promise<Service> {
    const token = this.getAdminToken();
    const res = await fetch('/api/admin/services', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(service),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Failed to add service');
    }
    const data = await res.json();
    return data.service;
  },

  async updateAdminService(
    id: string,
    updates: Partial<Omit<Service, 'id' | 'createdAt'>>
  ): Promise<Service> {
    const token = this.getAdminToken();
    const res = await fetch(`/api/admin/services/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Failed to update service');
    }
    const data = await res.json();
    return data.service;
  },

  async toggleAdminService(id: string): Promise<Service> {
    const token = this.getAdminToken();
    const res = await fetch(`/api/admin/services/${id}/toggle`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Failed to toggle service');
    }
    const data = await res.json();
    return data.service;
  },

  async deleteAdminService(id: string): Promise<void> {
    const token = this.getAdminToken();
    const res = await fetch(`/api/admin/services/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Failed to delete service');
    }
  },

  async getAdminOrders(): Promise<Order[]> {
    const token = this.getAdminToken();
    const res = await fetch('/api/admin/orders', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Failed to fetch admin orders');
    }
    const data = await res.json();
    return data.orders || [];
  },

  async updateOrderStatus(id: string, status: OrderStatus, note?: string): Promise<Order> {
    const token = this.getAdminToken();
    const res = await fetch(`/api/admin/orders/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status, note }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Failed to update order status');
    }
    const data = await res.json();
    return data.order;
  },

  async updateOrderPayment(id: string, paymentStatus: PaymentStatus, note?: string): Promise<Order> {
    const token = this.getAdminToken();
    const res = await fetch(`/api/admin/orders/${id}/payment`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ paymentStatus, note }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Failed to update payment status');
    }
    const data = await res.json();
    return data.order;
  },

  async deliverVideo(id: string, deliveryData: { title: string; url: string; fileSize?: string }): Promise<Order> {
    const token = this.getAdminToken();
    const res = await fetch(`/api/admin/orders/${id}/delivery`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(deliveryData),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Failed to deliver video');
    }
    const data = await res.json();
    return data.order;
  },

  async updateOrderNotes(id: string, studioNotes?: string, estimatedDelivery?: string): Promise<Order> {
    const token = this.getAdminToken();
    const res = await fetch(`/api/admin/orders/${id}/notes`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ studioNotes, estimatedDelivery }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Failed to update notes');
    }
    const data = await res.json();
    return data.order;
  },

  async getAdminStats(): Promise<AdminStats> {
    const token = this.getAdminToken();
    const res = await fetch('/api/admin/stats', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Failed to fetch admin stats');
    }
    return await res.json();
  },

  async getPaymentSettings(): Promise<{ upiId: string; payeeName: string; qrCodeUrl: string; updatedAt: string }> {
    const res = await fetch('/api/payment-settings');
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Failed to fetch payment settings');
    }
    const data = await res.json();
    return data.paymentSettings || { upiId: '6353894486@pthdfc', payeeName: 'PATEL SHUBH RAKESHBHAI', qrCodeUrl: '/assets/aistudio/Picsart_26-10-21_23-06-01-904_30edec27.jpg' };
  },

  async updatePaymentSettings(settings: { upiId: string; payeeName: string; qrCodeUrl: string }): Promise<any> {
    const token = this.getAdminToken();
    const res = await fetch('/api/admin/payment-settings', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(settings),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Failed to update payment settings');
    }
    return await res.json();
  },
};
