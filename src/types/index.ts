export type ServiceCategory = 'reels' | 'long_form' | 'celebration' | 'business' | 'graphic_design';

export interface Service {
  id: string;
  name: string;
  gujaratiName?: string;
  category: ServiceCategory;
  description: string;
  price: number;
  isStartingPrice: boolean;
  enabled: boolean;
  imageUrl?: string;
  badge?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UploadedFile {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  filename: string;
  uploadedAt: string;
}

export interface DeliveredFile {
  id: string;
  title: string;
  url: string;
  fileSize?: string;
  deliveredAt: string;
}

export type OrderStatus = 'order_placed' | 'payment_verification' | 'editing' | 'completed' | 'delivered';
export type PaymentStatus = 'unpaid' | 'under_verification' | 'paid';

export interface OrderTimelineStep {
  status: OrderStatus;
  label: string;
  timestamp: string;
  note?: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerMobile: string;
  customerWhatsapp?: string;
  serviceId: string;
  serviceName: string;
  agreedPrice: number;
  isStartingPrice: boolean;
  priceFormatted: string;
  requirements: string;
  referenceLinks?: string;
  uploadedFiles: UploadedFile[];
  paymentMethod: 'upi' | 'cash' | 'discuss';
  paymentStatus: PaymentStatus;
  paymentReference?: string;
  paymentScreenshot?: string;
  orderStatus: OrderStatus;
  timeline: OrderTimelineStep[];
  deliveredFiles: DeliveredFile[];
  studioNotes?: string;
  estimatedDelivery?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminStats {
  totalOrders: number;
  completedOrders: number;
  inEditingOrders: number;
  pendingPaymentOrders: number;
  totalRevenue: number;
  activeServices: number;
  totalServices: number;
}
