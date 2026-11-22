import { Response } from 'express';
import prisma from '../config/prisma';
import { AuthenticatedRequest } from '../middleware/auth';
import { generate4DigitOtp } from '../services/otp';
import { WhatsAppService } from '../services/whatsapp';
import { OrderStatus, SubStatus, SubFrequency, Role } from '../types';

// =============================================================================
// 1. PRODUCT CATALOG (Vendor & Customer)
// =============================================================================

export async function getProducts(req: AuthenticatedRequest, res: Response) {
  try {
    const { categorySlug, vendorId } = req.query;

    const where: any = { inStock: true };
    if (vendorId && typeof vendorId === 'string') {
      where.vendorId = vendorId;
    }
    if (categorySlug && typeof categorySlug === 'string') {
      const cat = await prisma.serviceCategory.findUnique({ where: { slug: categorySlug } });
      if (cat) where.categoryId = cat.id;
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        vendor: { select: { businessName: true, rating: true, city: true } },
        category: { select: { name: true, slug: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json({ success: true, products });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function createProduct(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user || req.user.role !== Role.VENDOR) {
      return res.status(403).json({ success: false, error: 'Only vendors can add products' });
    }

    const { name, nameHi, description, price, unit, categorySlug } = req.body;
    const file = req.file;

    const vendor = await prisma.vendorProfile.findUnique({
      where: { userId: req.user.userId }
    });
    if (!vendor) return res.status(404).json({ success: false, error: 'Vendor profile not found' });

    const category = await prisma.serviceCategory.findUnique({
      where: { slug: categorySlug || 'kirana-grocery' }
    });
    if (!category) return res.status(404).json({ success: false, error: 'Category not found' });

    const product = await prisma.product.create({
      data: {
        vendorId: vendor.id,
        categoryId: category.id,
        name,
        nameHi,
        description,
        price: parseFloat(price),
        unit: unit || 'item',
        imageUrl: file ? `/uploads/${file.filename}` : null,
        inStock: true
      }
    });

    return res.status(201).json({ success: true, product });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

// =============================================================================
// 2. COMMERCE ORDERS (Kirana & Store Checkout)
// =============================================================================

export async function createOrder(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const {
      vendorId,
      items, // [{ productId, name, qty, price, total }]
      deliveryAddress,
      deliveryLat,
      deliveryLng,
      paymentMode = 'UPI'
    } = req.body;

    if (!vendorId || !items || !deliveryAddress) {
      return res.status(400).json({
        success: false,
        error: 'vendorId, items, and deliveryAddress are required'
      });
    }

    const itemsList = typeof items === 'object' ? items : JSON.parse(items);
    let subtotal = 0;
    for (const item of itemsList) {
      subtotal += (item.price * item.qty);
    }

    const deliveryFee = subtotal > 500 ? 0 : 30; // Free delivery above ₹500
    const totalAmount = subtotal + deliveryFee;
    const orderNumber = `ORD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const deliveryOtp = generate4DigitOtp();

    const order = await prisma.commerceOrder.create({
      data: {
        orderNumber,
        customerId: req.user.userId,
        vendorId,
        items: JSON.stringify(itemsList),
        subtotal,
        deliveryFee,
        totalAmount,
        deliveryAddress,
        deliveryLat: deliveryLat ? parseFloat(deliveryLat) : 12.9716,
        deliveryLng: deliveryLng ? parseFloat(deliveryLng) : 77.5946,
        status: OrderStatus.PLACED,
        deliveryOtp,
        paymentMode
      },
      include: {
        vendor: { select: { businessName: true, user: { select: { phone: true } } } },
        customer: { select: { name: true, phone: true } }
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order: {
        ...order,
        items: JSON.parse(order.items)
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function updateOrderStatus(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const { status, otp } = req.body;
    const file = req.file;

    const order = await prisma.commerceOrder.findUnique({
      where: { id },
      include: { customer: true, vendor: true }
    });

    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });

    if (status === OrderStatus.OUT_FOR_DELIVERY) {
      // Send WhatsApp with Delivery OTP
      WhatsAppService.sendAlert({
        toPhone: order.customer.phone,
        templateName: 'ORDER_OUT_FOR_DELIVERY',
        recipientName: order.customer.name,
        parameters: {
          orderNumber: order.orderNumber,
          partnerName: order.vendor.businessName,
          deliveryOtp: order.deliveryOtp
        }
      }).catch(err => console.error('WhatsApp notify error:', err));
    }

    if (status === OrderStatus.DELIVERED) {
      if (order.deliveryOtp !== String(otp).trim()) {
        return res.status(400).json({
          success: false,
          error: 'Invalid 4-digit Delivery OTP. Please ask customer to confirm delivery.'
        });
      }
    }

    const updated = await prisma.commerceOrder.update({
      where: { id },
      data: {
        status,
        proofPhotoUrl: file ? `/uploads/${file.filename}` : order.proofPhotoUrl,
        paymentStatus: status === OrderStatus.DELIVERED ? 'PAID' : order.paymentStatus
      }
    });

    return res.json({
      success: true,
      order: {
        ...updated,
        items: JSON.parse(updated.items)
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

// =============================================================================
// 3. DAILY SUBSCRIPTIONS (Water Cans, Dairy Milk, Tiffin)
// =============================================================================

export async function createSubscription(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const {
      vendorId,
      productId,
      frequency = 'DAILY',
      timeSlot = '06:00 AM - 08:00 AM',
      quantityPerDelivery = 1,
      deliveryAddress,
      deliveryLat,
      deliveryLng,
      startDate
    } = req.body;

    if (!vendorId || !productId || !deliveryAddress) {
      return res.status(400).json({
        success: false,
        error: 'vendorId, productId, and deliveryAddress are required'
      });
    }

    const subNumber = `SUB-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const subscription = await prisma.subscription.create({
      data: {
        subNumber,
        customerId: req.user.userId,
        vendorId,
        productId,
        frequency,
        timeSlot,
        quantityPerDelivery: parseInt(quantityPerDelivery) || 1,
        deliveryAddress,
        deliveryLat: deliveryLat ? parseFloat(deliveryLat) : 12.9716,
        deliveryLng: deliveryLng ? parseFloat(deliveryLng) : 77.5946,
        startDate: startDate ? new Date(startDate) : new Date(),
        status: SubStatus.ACTIVE
      },
      include: {
        product: true,
        vendor: { select: { businessName: true, address: true } }
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Daily delivery subscription activated',
      subscription
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function getMySubscriptions(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });

    let where: any = {};
    if (req.user.role === Role.USER) {
      where.customerId = req.user.userId;
    } else if (req.user.role === Role.VENDOR && req.user.vendorProfileId) {
      where.vendorId = req.user.vendorProfileId;
    }

    const subscriptions = await prisma.subscription.findMany({
      where,
      include: {
        product: true,
        vendor: { select: { businessName: true, address: true } },
        customer: { select: { name: true, phone: true } },
        deliveries: {
          orderBy: { deliveryDate: 'desc' },
          take: 7 // Last 7 delivery logs
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json({ success: true, subscriptions });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function logSubscriptionDelivery(req: AuthenticatedRequest, res: Response) {
  try {
    const { subscriptionId } = req.params;
    const { status = 'DELIVERED', otp } = req.body;
    const file = req.file;

    const delivery = await prisma.subscriptionDelivery.create({
      data: {
        subscriptionId,
        deliveryDate: new Date(),
        status,
        deliveredAt: new Date(),
        deliveryOtp: otp || null,
        proofPhotoUrl: file ? `/uploads/${file.filename}` : null
      }
    });

    return res.status(201).json({ success: true, delivery });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function toggleSubscriptionStatus(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const { status } = req.body; // "ACTIVE" | "PAUSED" | "CANCELLED"

    const updated = await prisma.subscription.update({
      where: { id },
      data: { status }
    });

    return res.json({ success: true, subscription: updated });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
