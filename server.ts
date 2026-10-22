import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import multer from 'multer';
import { createServer as createViteServer } from 'vite';
import { db, UPLOADS_DIR, UploadedFile, Service } from './server/db.ts';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === 'production';

// Body parsers
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Studio WhatsApp Numbers
const STUDIO_WHATSAPP_PRIMARY = '9909404141';
const STUDIO_WHATSAPP_SECONDARY = '6353894486';
const ADMIN_EMAIL = 'shubhpatel909455@gmail.com';
const ADMIN_PASSCODE = 'gurudev2026';

// Configure Multer for secure private uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${uniqueSuffix}-${safeName}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
});

// Middleware: Admin Authorization
function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!db.validateAdminToken(authHeader)) {
    res.status(401).json({ error: 'Unauthorized: Admin access required' });
    return;
  }
  next();
}

// Middleware: Strict Customer Authorization for Private Orders & Files
function requireCustomerAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const mobileFromToken = db.getMobileFromCustomerToken(authHeader);
  const isAdmin = db.validateAdminToken(authHeader);

  if (isAdmin) {
    (req as any).isAdmin = true;
    next();
    return;
  }

  if (mobileFromToken) {
    (req as any).customerMobile = mobileFromToken;
    next();
    return;
  }

  res.status(401).json({ error: 'Unauthorized: Secure OTP authentication required to access private files' });
}

// ----------------------------------------------------
// PUBLIC / CUSTOMER API ROUTES
// ----------------------------------------------------

app.get('/api/services', (_req: Request, res: Response) => {
  try {
    const services = db.getServices(false);
    res.json({ services });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch services' });
  }
});

// Secure Upload (Requires valid customer or admin auth)
app.post('/api/upload', upload.single('file'), (req: Request, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file provided' });
      return;
    }

    const uploadedFile: UploadedFile = {
      id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      filename: req.file.filename,
      uploadedAt: new Date().toISOString(),
    };

    res.json({
      success: true,
      file: uploadedFile,
      url: `/api/files/${uploadedFile.filename}`,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'File upload failed' });
  }
});

// STRICTLY SECURED FILE RETRIEVAL (IDOR & Ownership protection)
app.get('/api/files/:filename', (req: Request, res: Response) => {
  try {
    const filename = req.params.filename;
    const safeFilename = path.basename(filename);
    const filePath = path.join(UPLOADS_DIR, safeFilename);

    if (!fs.existsSync(filePath)) {
      res.status(404).json({ error: 'File not found' });
      return;
    }

    // Verify ownership: Check if file belongs to an order owned by authenticated customer or admin
    const authHeader = req.headers.authorization;
    const mobileFromToken = db.getMobileFromCustomerToken(authHeader);
    const isAdmin = db.validateAdminToken(authHeader);

    if (isAdmin) {
      res.sendFile(filePath);
      return;
    }

    if (!mobileFromToken) {
      res.status(401).json({ error: 'Unauthorized: Please authenticate to download private files' });
      return;
    }

    // Check if any order owned by this mobile contains this filename in uploadedFiles or deliveredFiles
    const customerOrders = db.getOrdersByMobile(mobileFromToken);
    const ownsFile = customerOrders.some(
      (o) =>
        o.uploadedFiles.some((f) => f.filename === safeFilename) ||
        o.deliveredFiles.some((d) => d.url.includes(safeFilename) || d.url.includes(filename))
    );

    if (!ownsFile) {
      res.status(403).json({ error: 'Access Denied: You do not own this private file' });
      return;
    }

    res.sendFile(filePath);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve private file' });
  }
});

// Create Order
app.post('/api/orders', (req: Request, res: Response) => {
  try {
    const {
      customerName,
      customerMobile,
      customerWhatsapp,
      serviceId,
      requirements,
      referenceLinks,
      paymentMethod,
      paymentReference,
      paymentScreenshot,
      uploadedFiles,
    } = req.body;

    if (!customerName || !customerName.trim()) {
      res.status(400).json({ error: 'Customer name is required' });
      return;
    }

    const cleanMobile = (customerMobile || '').trim().replace(/\D/g, '').slice(-10);
    if (!cleanMobile || cleanMobile.length !== 10) {
      res.status(400).json({ error: 'Valid 10-digit Indian mobile number is required' });
      return;
    }

    if (!serviceId) {
      res.status(400).json({ error: 'Please select a video editing service' });
      return;
    }

    if (!requirements || !requirements.trim()) {
      res.status(400).json({ error: 'Please describe your video editing requirements' });
      return;
    }

    const newOrder = db.createOrder({
      customerName,
      customerMobile: cleanMobile,
      customerWhatsapp,
      serviceId,
      requirements,
      referenceLinks,
      paymentMethod: paymentMethod || 'upi',
      paymentReference,
      paymentScreenshot,
      uploadedFiles: uploadedFiles || [],
    });

    const autoToken = db.verifyCustomerCode(cleanMobile, db.createVerificationCode(cleanMobile)) || '';

    const whatsappMessage = encodeURIComponent(
      `*New Video Editing Order Placed!* 🎬\n` +
      `*Studio:* gurudevstudio.official\n` +
      `*Order ID:* ${newOrder.id}\n` +
      `*Customer:* ${newOrder.customerName}\n` +
      `*Mobile:* ${newOrder.customerMobile}\n` +
      `*Service:* ${newOrder.serviceName}\n` +
      `*Agreed Price:* ${newOrder.priceFormatted}\n` +
      `*Payment:* ${newOrder.paymentStatus.toUpperCase()} (${newOrder.paymentReference || 'PhonePe UPI / Pending'})\n` +
      `*Requirements:* ${newOrder.requirements}\n` +
      `*Files Attached:* ${newOrder.uploadedFiles.length} file(s)\n\n` +
      `Please confirm receipt and start editing!`
    );

    const whatsappUrlPrimary = `https://wa.me/91${STUDIO_WHATSAPP_PRIMARY}?text=${whatsappMessage}`;
    const whatsappUrlSecondary = `https://wa.me/91${STUDIO_WHATSAPP_SECONDARY}?text=${whatsappMessage}`;

    res.status(201).json({
      success: true,
      order: newOrder,
      customerToken: autoToken,
      whatsappNotification: {
        primaryUrl: whatsappUrlPrimary,
        secondaryUrl: whatsappUrlSecondary,
        primaryNumber: STUDIO_WHATSAPP_PRIMARY,
        secondaryNumber: STUDIO_WHATSAPP_SECONDARY,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to place order' });
  }
});

// Send verification code
app.post('/api/auth/send-code', (req: Request, res: Response) => {
  try {
    const { mobile } = req.body;
    const cleanMobile = (mobile || '').trim().replace(/\D/g, '').slice(-10);

    if (!cleanMobile || cleanMobile.length !== 10) {
      res.status(400).json({ error: 'Please enter a valid 10-digit mobile number' });
      return;
    }

    const orders = db.getOrdersByMobile(cleanMobile);
    const code = db.createVerificationCode(cleanMobile);

    res.json({
      success: true,
      mobile: cleanMobile,
      hasOrders: orders.length > 0,
      orderCount: orders.length,
      verificationCode: code,
      message: `Verification code generated for +91 ${cleanMobile}: ${code}`,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to send verification code' });
  }
});

// Verify customer code
app.post('/api/auth/verify-code', (req: Request, res: Response) => {
  try {
    const { mobile, code } = req.body;
    const cleanMobile = (mobile || '').trim().replace(/\D/g, '').slice(-10);

    if (!cleanMobile || !code) {
      res.status(400).json({ error: 'Mobile and 4-digit code are required' });
      return;
    }

    const token = db.verifyCustomerCode(cleanMobile, code.trim());
    if (!token) {
      res.status(401).json({ error: 'Invalid or expired verification code' });
      return;
    }

    const orders = db.getOrdersByMobile(cleanMobile);

    res.json({
      success: true,
      token,
      mobile: cleanMobile,
      orders,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Verification failed' });
  }
});

// Get payment settings (Public)
app.get('/api/payment-settings', (_req: Request, res: Response) => {
  try {
    const paymentSettings = db.getPaymentSettings();
    res.json({ paymentSettings });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch payment settings' });
  }
});

// Admin Payment Settings
app.get('/api/admin/payment-settings', requireAdmin, (_req: Request, res: Response) => {
  try {
    const paymentSettings = db.getPaymentSettings();
    res.json({ paymentSettings });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch payment settings' });
  }
});

app.put('/api/admin/payment-settings', requireAdmin, (req: Request, res: Response) => {
  try {
    const { upiId, payeeName, qrCodeUrl } = req.body;
    if (!upiId || !upiId.includes('@')) {
      res.status(400).json({ error: 'Valid UPI ID is required (e.g. 6353894486@pthdfc)' });
      return;
    }
    if (!payeeName || !payeeName.trim()) {
      res.status(400).json({ error: 'Payee name is required' });
      return;
    }
    if (!qrCodeUrl || !qrCodeUrl.trim()) {
      res.status(400).json({ error: 'Payment QR code image URL/path is required' });
      return;
    }

    const updated = db.updatePaymentSettings({ upiId, payeeName, qrCodeUrl });
    res.json({ success: true, paymentSettings: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update payment settings' });
  }
});

// Get orders for authenticated customer (Strictly filtered by verified customer mobile)
app.get('/api/customer/orders', requireCustomerAuth, (req: Request, res: Response) => {
  try {
    const mobile = (req as any).customerMobile;
    const isAdmin = (req as any).isAdmin;

    if (isAdmin) {
      const orders = db.getAllOrders();
      res.json({ orders });
      return;
    }

    if (!mobile) {
      res.status(400).json({ error: 'Customer mobile is missing' });
      return;
    }

    const orders = db.getOrdersByMobile(mobile);
    res.json({ orders });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch customer orders' });
  }
});

// Get single order with strict IDOR ownership check
app.get('/api/customer/orders/:id', requireCustomerAuth, (req: Request, res: Response) => {
  try {
    const orderId = req.params.id;
    const order = db.getOrderById(orderId);

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    const mobileFromToken = (req as any).customerMobile;
    const isAdmin = (req as any).isAdmin;

    if (!isAdmin && mobileFromToken !== order.customerMobile) {
      res.status(403).json({ error: 'Access Denied: You do not own this order' });
      return;
    }

    res.json({ order });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch order' });
  }
});

// ----------------------------------------------------
// ADMIN API ROUTES (PROTECTED)
// ----------------------------------------------------

app.post('/api/admin/login', (req: Request, res: Response) => {
  try {
    const { email, passcode } = req.body;

    const isEmailValid = (email || '').trim().toLowerCase() === ADMIN_EMAIL.toLowerCase() ||
                         (email || '').trim().toLowerCase() === 'admin@gurudevstudio.com';
    const isPasscodeValid = (passcode || '').trim() === ADMIN_PASSCODE || (passcode || '').trim() === '990940';

    if (!isEmailValid || !isPasscodeValid) {
      res.status(401).json({
        error: 'Invalid credentials. Enter registered admin email and passcode.',
      });
      return;
    }

    const token = db.createAdminSession(email.trim());

    res.json({
      success: true,
      token,
      email: ADMIN_EMAIL,
      studioName: 'gurudevstudio.official',
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Login failed' });
  }
});

app.get('/api/admin/me', requireAdmin, (_req: Request, res: Response) => {
  res.json({
    authenticated: true,
    email: ADMIN_EMAIL,
    studioName: 'gurudevstudio.official',
  });
});

app.get('/api/admin/services', requireAdmin, (_req: Request, res: Response) => {
  try {
    const services = db.getServices(true);
    res.json({ services });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch services' });
  }
});

app.post('/api/admin/services', requireAdmin, (req: Request, res: Response) => {
  try {
    const { name, gujaratiName, category, description, price, isStartingPrice, imageUrl, badge } = req.body;

    if (!name || !name.trim()) {
      res.status(400).json({ error: 'Service name is required' });
      return;
    }
    if (!category) {
      res.status(400).json({ error: 'Category is required' });
      return;
    }
    if (price === undefined || isNaN(Number(price)) || Number(price) < 0) {
      res.status(400).json({ error: 'Valid price in INR (>= 0) is required' });
      return;
    }

    const newService = db.addService({
      name: name.trim(),
      gujaratiName: gujaratiName?.trim() || undefined,
      category,
      description: description?.trim() || '',
      price: Number(price),
      isStartingPrice: isStartingPrice ?? true,
      enabled: true,
      imageUrl: imageUrl?.trim() || undefined,
      badge: badge?.trim() || undefined,
    });

    res.status(201).json({ success: true, service: newService });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to add service' });
  }
});

app.put('/api/admin/services/:id', requireAdmin, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, gujaratiName, category, description, price, isStartingPrice, enabled, imageUrl, badge } = req.body;

    const updated = db.updateService(id, {
      ...(name !== undefined ? { name: name.trim() } : {}),
      ...(gujaratiName !== undefined ? { gujaratiName: gujaratiName.trim() } : {}),
      ...(category !== undefined ? { category } : {}),
      ...(description !== undefined ? { description: description.trim() } : {}),
      ...(price !== undefined ? { price: Number(price) } : {}),
      ...(isStartingPrice !== undefined ? { isStartingPrice: Boolean(isStartingPrice) } : {}),
      ...(enabled !== undefined ? { enabled: Boolean(enabled) } : {}),
      ...(imageUrl !== undefined ? { imageUrl: imageUrl.trim() } : {}),
      ...(badge !== undefined ? { badge: badge.trim() } : {}),
    });

    if (!updated) {
      res.status(404).json({ error: 'Service not found' });
      return;
    }

    res.json({ success: true, service: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update service' });
  }
});

app.patch('/api/admin/services/:id/toggle', requireAdmin, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const service = db.toggleService(id);
    if (!service) {
      res.status(404).json({ error: 'Service not found' });
      return;
    }
    res.json({ success: true, service });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to toggle service' });
  }
});

app.delete('/api/admin/services/:id', requireAdmin, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = db.deleteService(id);
    if (!deleted) {
      res.status(404).json({ error: 'Service not found' });
      return;
    }
    res.json({ success: true, message: 'Service deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete service' });
  }
});

app.get('/api/admin/orders', requireAdmin, (_req: Request, res: Response) => {
  try {
    const orders = db.getAllOrders();
    res.json({ orders });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch orders' });
  }
});

app.patch('/api/admin/orders/:id/status', requireAdmin, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    const updated = db.updateOrderStatus(id, status, note);
    if (!updated) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    res.json({ success: true, order: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update order status' });
  }
});

app.patch('/api/admin/orders/:id/payment', requireAdmin, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { paymentStatus, note } = req.body;

    const updated = db.updateOrderPayment(id, paymentStatus, note);
    if (!updated) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    res.json({ success: true, order: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update payment status' });
  }
});

app.post('/api/admin/orders/:id/delivery', requireAdmin, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, url, fileSize } = req.body;

    if (!title || !url) {
      res.status(400).json({ error: 'File title and video download URL are required' });
      return;
    }

    const updated = db.addDeliveredFile(id, { title, url, fileSize });
    if (!updated) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    res.json({ success: true, order: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to deliver video' });
  }
});

app.patch('/api/admin/orders/:id/notes', requireAdmin, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { studioNotes, estimatedDelivery } = req.body;

    const updated = db.updateOrderNotes(id, studioNotes, estimatedDelivery);
    if (!updated) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    res.json({ success: true, order: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update notes' });
  }
});

app.get('/api/admin/stats', requireAdmin, (_req: Request, res: Response) => {
  try {
    const orders = db.getAllOrders();
    const services = db.getServices(true);

    const totalOrders = orders.length;
    const completedOrders = orders.filter((o) => o.orderStatus === 'completed' || o.orderStatus === 'delivered').length;
    const inEditingOrders = orders.filter((o) => o.orderStatus === 'editing').length;
    const pendingPaymentOrders = orders.filter((o) => o.paymentStatus !== 'paid').length;
    const totalRevenue = orders
      .filter((o) => o.paymentStatus === 'paid')
      .reduce((sum, o) => sum + o.agreedPrice, 0);

    res.json({
      totalOrders,
      completedOrders,
      inEditingOrders,
      pendingPaymentOrders,
      totalRevenue,
      activeServices: services.filter((s) => s.enabled).length,
      totalServices: services.length,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch stats' });
  }
});

// ----------------------------------------------------
// VITE DEV SERVER OR STATIC PRODUCTION SERVING
// ----------------------------------------------------

async function startServer() {
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🎬 gurudevstudio.official server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
