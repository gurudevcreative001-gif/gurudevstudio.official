import fs from 'fs';
import path from 'path';

export interface Service {
  id: string;
  name: string;
  gujaratiName?: string;
  category: 'reels' | 'long_form' | 'celebration' | 'business' | 'graphic_design';
  description: string;
  price: number;
  isStartingPrice: boolean; // e.g. "₹100 થી"
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

export interface OrderTimelineStep {
  status: 'order_placed' | 'payment_verification' | 'editing' | 'completed' | 'delivered';
  label: string;
  timestamp: string;
  note?: string;
}

export interface Order {
  id: string; // e.g. GDS-2026-X49K
  customerName: string;
  customerMobile: string; // 10 digits
  customerWhatsapp?: string;
  serviceId: string;
  serviceName: string; // frozen snapshot
  agreedPrice: number; // frozen snapshot
  isStartingPrice: boolean;
  priceFormatted: string;
  requirements: string;
  referenceLinks?: string;
  uploadedFiles: UploadedFile[];
  paymentMethod: 'upi' | 'cash' | 'discuss';
  paymentStatus: 'unpaid' | 'under_verification' | 'paid';
  paymentReference?: string;
  paymentScreenshot?: string;
  orderStatus: 'order_placed' | 'payment_verification' | 'editing' | 'completed' | 'delivered';
  timeline: OrderTimelineStep[];
  deliveredFiles: DeliveredFile[];
  studioNotes?: string;
  estimatedDelivery?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentSettings {
  upiId: string;
  payeeName: string;
  qrCodeUrl: string;
  updatedAt: string;
}

export interface DatabaseSchema {
  services: Service[];
  orders: Order[];
  adminTokens: { token: string; email: string; expiresAt: number }[];
  verificationCodes: { mobile: string; code: string; expiresAt: number }[];
  customerTokens: { token: string; mobile: string; expiresAt: number }[];
  paymentSettings: PaymentSettings;
}

const INITIAL_PAYMENT_SETTINGS: PaymentSettings = {
  upiId: '6353894486@pthdfc',
  payeeName: 'PATEL SHUBH RAKESHBHAI',
  qrCodeUrl: '/assets/aistudio/Picsart_26-10-21_23-06-01-904_30edec27.jpg',
  updatedAt: new Date().toISOString(),
};

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
export const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Initial default services from gurudevstudio.official catalog
const INITIAL_SERVICES: Service[] = [
  {
    id: 'srv-1',
    name: 'Instagram Reel Editing',
    gujaratiName: 'Instagram Reel Editing — ₹100 થી',
    category: 'reels',
    description: 'Fast-paced cuts, trendy beat transitions, Gujarati/Hindi subtitles, color grade, and sound design.',
    price: 100,
    isStartingPrice: true,
    enabled: true,
    badge: 'Popular',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'srv-2',
    name: 'Trending Reel Editing',
    gujaratiName: 'Trending Reel Editing — ₹150 થી',
    category: 'reels',
    description: 'High-retention viral editing with motion graphics, zoom hooks, sound effects, and 4K Instagram export.',
    price: 150,
    isStartingPrice: true,
    enabled: true,
    badge: 'Trending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'srv-3',
    name: 'YouTube Shorts Editing',
    gujaratiName: 'YouTube Shorts Editing — ₹150 થી',
    category: 'reels',
    description: 'Vertical 9:16 optimized for YouTube algorithm with animated captions, emoji popups, and hook retention.',
    price: 150,
    isStartingPrice: true,
    enabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'srv-4',
    name: 'YouTube Video Editing',
    gujaratiName: 'YouTube Video Editing — ₹499 થી',
    category: 'long_form',
    description: 'Long-form vlogs, tutorials, podcasts, and interviews. Multi-cam sync, B-roll insertion, and cinematic audio mastering.',
    price: 499,
    isStartingPrice: true,
    enabled: true,
    badge: 'Best Value',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'srv-5',
    name: 'Birthday Video',
    gujaratiName: 'Birthday Video — ₹299 થી',
    category: 'celebration',
    description: 'Heartfelt birthday video with photos, family wishes, Gujarati/Bollywood birthday music, and celebration animations.',
    price: 299,
    isStartingPrice: true,
    enabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'srv-6',
    name: 'Special Birthday Video',
    gujaratiName: 'Special Birthday Video — ₹499 થી',
    category: 'celebration',
    description: 'Cinematic birthday film with 3D photo effects, custom voiceover narration, family tribute quotes, and 4K render.',
    price: 499,
    isStartingPrice: true,
    enabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'srv-7',
    name: 'Wedding Highlight',
    gujaratiName: 'Wedding Highlight — ₹999 થી',
    category: 'celebration',
    description: 'Cinematic teaser and highlight video of Gujarati wedding rituals: Mandap, Barat, Jaimala, and Vidai with royal grade.',
    price: 999,
    isStartingPrice: true,
    enabled: true,
    badge: 'Cinematic',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'srv-8',
    name: 'Pre-Wedding Video',
    gujaratiName: 'Pre-Wedding Video — ₹999 થી',
    category: 'celebration',
    description: 'Romantic couple music video teaser with cinematic color LUTs, drone shot integration, and romantic titles.',
    price: 999,
    isStartingPrice: true,
    enabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'srv-9',
    name: 'Anniversary Video',
    gujaratiName: 'Anniversary Video — ₹399 થી',
    category: 'celebration',
    description: 'Couple journey video, milestone anniversary wishes, romantic music montage, and memories slideshow.',
    price: 399,
    isStartingPrice: true,
    enabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'srv-10',
    name: 'Devotional / Temple Promotion',
    gujaratiName: 'Devotional / Temple Promotion — ₹150 થી',
    category: 'business',
    description: 'Spiritual reels, temple aarti status, bhajan edits, satsang & religious event promo with divine visual effects.',
    price: 150,
    isStartingPrice: true,
    enabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'srv-11',
    name: 'Shop / Business Promotion',
    gujaratiName: 'Shop / Business Promotion — ₹199 થી',
    category: 'business',
    description: 'Local store opening, jewellery, clothing, food business promotional reel with phone number, address, and offer callout.',
    price: 199,
    isStartingPrice: true,
    enabled: true,
    badge: 'Local Business',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'srv-12',
    name: 'Photo Slideshow Video',
    gujaratiName: 'Photo Slideshow Video — ₹199 થી',
    category: 'celebration',
    description: 'Clean modern photo transition montage with background song, lyrics captions, and elegant photo frames.',
    price: 199,
    isStartingPrice: true,
    enabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'srv-13',
    name: 'YouTube Thumbnail',
    gujaratiName: 'YouTube Thumbnail — ₹100 થી',
    category: 'graphic_design',
    description: 'High-CTR click-worthy thumbnail design with custom face cutout, bold Gujarati/Hindi typography, and bright contrast.',
    price: 100,
    isStartingPrice: true,
    enabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'srv-14',
    name: 'Instagram Post Design',
    gujaratiName: 'Instagram Post Design — ₹100 થી',
    category: 'graphic_design',
    description: 'Creative square/portrait graphics for Instagram feed, personal branding, business offers, and carousel posts.',
    price: 100,
    isStartingPrice: true,
    enabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'srv-15',
    name: 'Festival Poster Design',
    gujaratiName: 'Festival Poster Design — ₹150 થી',
    category: 'graphic_design',
    description: 'Diwali, Navratri, Janmashtami, Uttarayan, New Year greeting banners customized with your photo, name, and company logo.',
    price: 150,
    isStartingPrice: true,
    enabled: true,
    badge: 'Festivals',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'srv-16',
    name: 'Logo Design',
    gujaratiName: 'Logo Design — ₹300 થી',
    category: 'graphic_design',
    description: 'Custom brand logo, studio watermark, calligraphy identity with transparent PNG and vector source files.',
    price: 300,
    isStartingPrice: true,
    enabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'srv-17',
    name: 'Invitation Card Design',
    gujaratiName: 'Invitation Card Design — ₹200 થી',
    category: 'graphic_design',
    description: 'Digital Gujarati Kankotri, wedding invite, birthday e-card with WhatsApp shareable high-resolution format.',
    price: 200,
    isStartingPrice: true,
    enabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'srv-18',
    name: 'Banner Design',
    gujaratiName: 'Banner Design — ₹250 થી',
    category: 'graphic_design',
    description: 'Social media header, YouTube banner, hoarding design, or shop flex banner with print-ready CMYK/RGB file.',
    price: 250,
    isStartingPrice: true,
    enabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'srv-19',
    name: 'Video Shooting',
    gujaratiName: 'Video Shooting — ભાવ ચર્ચાથી',
    category: 'long_form',
    description: 'On-site camera shooting, gimbal videography, audio mic recording, and lighting for events across Gujarat. Price on quote.',
    price: 0,
    isStartingPrice: false,
    enabled: true,
    badge: 'On Quote',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'srv-20',
    name: 'Custom Video Editing',
    gujaratiName: 'Custom Video Editing — ભાવ ચર્ચાથી',
    category: 'long_form',
    description: 'Tailored video project based on specific script, timeline, advanced 3D VFX, documentary, or commercial. Price on discussion.',
    price: 0,
    isStartingPrice: false,
    enabled: true,
    badge: 'Discuss',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

class DatabaseManager {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        // Ensure essential keys exist
        return {
          services: parsed.services?.length ? parsed.services : INITIAL_SERVICES,
          orders: parsed.orders || [],
          adminTokens: parsed.adminTokens || [],
          verificationCodes: parsed.verificationCodes || [],
          customerTokens: parsed.customerTokens || [],
          paymentSettings: parsed.paymentSettings || INITIAL_PAYMENT_SETTINGS,
        };
      }
    } catch (err) {
      console.error('Error loading database, initializing fresh:', err);
    }

    const initialData: DatabaseSchema = {
      services: INITIAL_SERVICES,
      orders: [],
      adminTokens: [],
      verificationCodes: [],
      customerTokens: [],
      paymentSettings: INITIAL_PAYMENT_SETTINGS,
    };
    this.persist(initialData);
    return initialData;
  }

  public getPaymentSettings(): PaymentSettings {
    return this.data.paymentSettings || INITIAL_PAYMENT_SETTINGS;
  }

  public updatePaymentSettings(settings: { upiId?: string; payeeName?: string; qrCodeUrl?: string }): PaymentSettings {
    if (!this.data.paymentSettings) {
      this.data.paymentSettings = { ...INITIAL_PAYMENT_SETTINGS };
    }
    if (settings.upiId !== undefined) {
      this.data.paymentSettings.upiId = settings.upiId.trim();
    }
    if (settings.payeeName !== undefined) {
      this.data.paymentSettings.payeeName = settings.payeeName.trim();
    }
    if (settings.qrCodeUrl !== undefined) {
      this.data.paymentSettings.qrCodeUrl = settings.qrCodeUrl.trim();
    }
    this.data.paymentSettings.updatedAt = new Date().toISOString();
    this.persist(this.data);
    return this.data.paymentSettings;
  }

  private persist(data: DatabaseSchema) {
    try {
      const tempPath = `${DB_FILE}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
      fs.renameSync(tempPath, DB_FILE);
    } catch (err) {
      console.error('Failed to write database file:', err);
    }
  }

  public getServices(includeDisabled = false): Service[] {
    if (includeDisabled) {
      return [...this.data.services];
    }
    return this.data.services.filter((s) => s.enabled);
  }

  public getServiceById(id: string): Service | undefined {
    return this.data.services.find((s) => s.id === id);
  }

  public addService(service: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>): Service {
    const newService: Service = {
      ...service,
      id: `srv-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.services.unshift(newService);
    this.persist(this.data);
    return newService;
  }

  public updateService(id: string, updates: Partial<Omit<Service, 'id' | 'createdAt'>>): Service | null {
    const idx = this.data.services.findIndex((s) => s.id === id);
    if (idx === -1) return null;

    this.data.services[idx] = {
      ...this.data.services[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.persist(this.data);
    return this.data.services[idx];
  }

  public toggleService(id: string): Service | null {
    const service = this.data.services.find((s) => s.id === id);
    if (!service) return null;
    service.enabled = !service.enabled;
    service.updatedAt = new Date().toISOString();
    this.persist(this.data);
    return service;
  }

  public deleteService(id: string): boolean {
    const initialLen = this.data.services.length;
    this.data.services = this.data.services.filter((s) => s.id !== id);
    if (this.data.services.length !== initialLen) {
      this.persist(this.data);
      return true;
    }
    return false;
  }

  // --- ORDERS ---
  public createOrder(orderInput: {
    customerName: string;
    customerMobile: string;
    customerWhatsapp?: string;
    serviceId: string;
    requirements: string;
    referenceLinks?: string;
    paymentMethod: 'upi' | 'cash' | 'discuss';
    paymentReference?: string;
    paymentScreenshot?: string;
    uploadedFiles: UploadedFile[];
  }): Order {
    const service = this.getServiceById(orderInput.serviceId);
    const serviceName = service ? service.name : 'Custom Video Editing';
    const agreedPrice = service ? service.price : 0;
    const isStartingPrice = service ? service.isStartingPrice : true;
    const priceFormatted = agreedPrice > 0 ? (isStartingPrice ? `₹${agreedPrice} થી` : `₹${agreedPrice}`) : 'ભાવ ચર્ચાથી';

    // Generate unique readable Order ID: GDS-2026-XXXX
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const orderId = `GDS-2026-${randomSuffix}`;

    const now = new Date().toISOString();
    const initialTimeline: OrderTimelineStep[] = [
      {
        status: 'order_placed',
        label: 'Order Placed',
        timestamp: now,
        note: 'Order details and editing requirements received successfully by gurudevstudio.official.',
      },
    ];

    if (orderInput.paymentReference || orderInput.paymentScreenshot) {
      initialTimeline.push({
        status: 'payment_verification',
        label: 'Payment Verification',
        timestamp: now,
        note: `Payment reference submitted: ${orderInput.paymentReference || 'Screenshot attached'}. Verification in progress.`,
      });
    }

    const newOrder: Order = {
      id: orderId,
      customerName: orderInput.customerName.trim(),
      customerMobile: orderInput.customerMobile.trim().replace(/\D/g, '').slice(-10),
      customerWhatsapp: orderInput.customerWhatsapp?.trim().replace(/\D/g, '').slice(-10) || undefined,
      serviceId: orderInput.serviceId,
      serviceName,
      agreedPrice,
      isStartingPrice,
      priceFormatted,
      requirements: orderInput.requirements.trim(),
      referenceLinks: orderInput.referenceLinks?.trim() || undefined,
      uploadedFiles: orderInput.uploadedFiles || [],
      paymentMethod: orderInput.paymentMethod,
      paymentStatus: (orderInput.paymentReference || orderInput.paymentScreenshot) ? 'under_verification' : 'unpaid',
      paymentReference: orderInput.paymentReference,
      paymentScreenshot: orderInput.paymentScreenshot,
      orderStatus: (orderInput.paymentReference || orderInput.paymentScreenshot) ? 'payment_verification' : 'order_placed',
      timeline: initialTimeline,
      deliveredFiles: [],
      createdAt: now,
      updatedAt: now,
    };

    this.data.orders.unshift(newOrder);
    this.persist(this.data);
    return newOrder;
  }

  public getOrdersByMobile(mobile: string): Order[] {
    const cleanMobile = mobile.trim().replace(/\D/g, '').slice(-10);
    return this.data.orders.filter((o) => o.customerMobile === cleanMobile);
  }

  public getOrderById(id: string): Order | undefined {
    return this.data.orders.find((o) => o.id === id);
  }

  public getAllOrders(): Order[] {
    return [...this.data.orders];
  }

  public updateOrderStatus(
    orderId: string,
    status: Order['orderStatus'],
    note?: string
  ): Order | null {
    const order = this.data.orders.find((o) => o.id === orderId);
    if (!order) return null;

    order.orderStatus = status;
    order.updatedAt = new Date().toISOString();

    const statusLabels: Record<Order['orderStatus'], string> = {
      order_placed: 'Order Placed',
      payment_verification: 'Payment Verification',
      editing: 'Editing in Progress',
      completed: 'Editing Completed',
      delivered: 'Video Delivered',
    };

    order.timeline.push({
      status,
      label: statusLabels[status],
      timestamp: new Date().toISOString(),
      note: note || `Order status updated to ${statusLabels[status]} by studio team.`,
    });

    this.persist(this.data);
    return order;
  }

  public updateOrderPayment(
    orderId: string,
    paymentStatus: Order['paymentStatus'],
    note?: string
  ): Order | null {
    const order = this.data.orders.find((o) => o.id === orderId);
    if (!order) return null;

    order.paymentStatus = paymentStatus;
    order.updatedAt = new Date().toISOString();

    if (paymentStatus === 'paid' && order.orderStatus === 'payment_verification') {
      order.orderStatus = 'editing';
      order.timeline.push({
        status: 'editing',
        label: 'Editing in Progress',
        timestamp: new Date().toISOString(),
        note: note || 'Payment verified. Studio editor has begun working on your video project.',
      });
    }

    this.persist(this.data);
    return order;
  }

  public addDeliveredFile(
    orderId: string,
    file: { title: string; url: string; fileSize?: string }
  ): Order | null {
    const order = this.data.orders.find((o) => o.id === orderId);
    if (!order) return null;

    const deliveredFile: DeliveredFile = {
      id: `del-${Date.now()}`,
      title: file.title,
      url: file.url,
      fileSize: file.fileSize || 'HD/4K Video',
      deliveredAt: new Date().toISOString(),
    };

    order.deliveredFiles.push(deliveredFile);
    order.orderStatus = 'completed';
    order.timeline.push({
      status: 'completed',
      label: 'Video Completed & Ready for Download',
      timestamp: new Date().toISOString(),
      note: `Final video file "${file.title}" uploaded and available for download.`,
    });
    order.updatedAt = new Date().toISOString();

    this.persist(this.data);
    return order;
  }

  public updateOrderNotes(
    orderId: string,
    studioNotes?: string,
    estimatedDelivery?: string
  ): Order | null {
    const order = this.data.orders.find((o) => o.id === orderId);
    if (!order) return null;

    if (studioNotes !== undefined) order.studioNotes = studioNotes;
    if (estimatedDelivery !== undefined) order.estimatedDelivery = estimatedDelivery;
    order.updatedAt = new Date().toISOString();

    this.persist(this.data);
    return order;
  }

  // --- AUTH & SESSIONS ---
  public createAdminSession(email: string): string {
    const token = `adm_${Date.now()}_${Math.random().toString(36).substring(2, 12)}`;
    // Expires in 7 days
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
    this.data.adminTokens = this.data.adminTokens.filter((t) => t.expiresAt > Date.now());
    this.data.adminTokens.push({ token, email, expiresAt });
    this.persist(this.data);
    return token;
  }

  public validateAdminToken(token?: string): boolean {
    if (!token) return false;
    const cleanToken = token.replace('Bearer ', '').trim();
    const found = this.data.adminTokens.find((t) => t.token === cleanToken && t.expiresAt > Date.now());
    return Boolean(found);
  }

  public createVerificationCode(mobile: string): string {
    const cleanMobile = mobile.trim().replace(/\D/g, '').slice(-10);
    // Simple 4-digit code for clean customer UX
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    this.data.verificationCodes = this.data.verificationCodes.filter((v) => v.expiresAt > Date.now());
    this.data.verificationCodes.push({ mobile: cleanMobile, code, expiresAt });
    this.persist(this.data);
    return code;
  }

  public verifyCustomerCode(mobile: string, code: string): string | null {
    const cleanMobile = mobile.trim().replace(/\D/g, '').slice(-10);
    const record = this.data.verificationCodes.find(
      (v) => v.mobile === cleanMobile && v.code === code && v.expiresAt > Date.now()
    );

    if (!record) return null;

    // Issue customer session token
    const token = `cust_${Date.now()}_${Math.random().toString(36).substring(2, 12)}`;
    const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days
    this.data.customerTokens = this.data.customerTokens.filter((c) => c.expiresAt > Date.now());
    this.data.customerTokens.push({ token, mobile: cleanMobile, expiresAt });
    this.persist(this.data);
    return token;
  }

  public getMobileFromCustomerToken(token?: string): string | null {
    if (!token) return null;
    const cleanToken = token.replace('Bearer ', '').trim();
    const record = this.data.customerTokens.find((c) => c.token === cleanToken && c.expiresAt > Date.now());
    return record ? record.mobile : null;
  }
}

export const db = new DatabaseManager();
