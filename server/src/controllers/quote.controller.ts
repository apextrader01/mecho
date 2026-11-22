import { Response } from 'express';
import prisma from '../config/prisma';
import { AuthenticatedRequest } from '../middleware/auth';
import { calculateDistanceKm } from '../services/haversine';
import { WhatsAppService } from '../services/whatsapp';
import { RfqStatus, QuoteStatus, Role } from '../types';

export async function createRfq(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const {
      categorySlug,
      title,
      description,
      locationLat,
      locationLng,
      locationAddress,
      specifications // JSON or object
    } = req.body;

    const files = req.files as Express.Multer.File[];
    const attachmentUrls = files ? files.map(f => `/uploads/${f.filename}`) : [];

    if (!categorySlug || !title || !locationLat || !locationLng || !locationAddress) {
      return res.status(400).json({
        success: false,
        error: 'categorySlug, title, locationLat, locationLng, and locationAddress are required'
      });
    }

    const category = await prisma.serviceCategory.findUnique({
      where: { slug: categorySlug }
    });

    if (!category) return res.status(404).json({ success: false, error: 'Category not found' });

    const rfqNumber = `RFQ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const rfq = await prisma.quotationRequest.create({
      data: {
        rfqNumber,
        categoryId: category.id,
        customerId: req.user.userId,
        title,
        description: description || '',
        locationLat: parseFloat(locationLat),
        locationLng: parseFloat(locationLng),
        locationAddress,
        specifications: typeof specifications === 'object' ? JSON.stringify(specifications) : specifications || '{}',
        attachments: JSON.stringify(attachmentUrls),
        status: RfqStatus.OPEN
      },
      include: {
        category: true,
        customer: { select: { id: true, name: true, phone: true } }
      }
    });

    // Broadcast to nearby vendors
    const matchingVendors = await prisma.vendorProfile.findMany({
      where: {
        isOnline: true,
        kycStatus: 'APPROVED'
      },
      include: { user: { select: { phone: true, name: true } } }
    });

    const notifiedVendors = matchingVendors.filter(v => {
      const cats = v.categories.split(',').map(c => c.trim());
      if (!cats.includes(categorySlug)) return false;
      const dist = calculateDistanceKm(rfq.locationLat, rfq.locationLng, v.latitude, v.longitude);
      return dist <= v.serviceRadiusKm;
    });

    return res.status(201).json({
      success: true,
      message: 'RFQ created and broadcasted to local contractors & workshops',
      rfq: {
        ...rfq,
        specifications: JSON.parse(rfq.specifications),
        attachments: JSON.parse(rfq.attachments)
      },
      notifiedVendorsCount: notifiedVendors.length
    });
  } catch (error: any) {
    console.error('Create RFQ error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function getVendorRfqInbox(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user || req.user.role !== Role.VENDOR) {
      return res.status(403).json({ success: false, error: 'Access restricted to vendors' });
    }

    const vendor = await prisma.vendorProfile.findUnique({
      where: { userId: req.user.userId }
    });

    if (!vendor) return res.status(404).json({ success: false, error: 'Vendor profile not found' });

    const vendorCategories = vendor.categories.split(',').map(c => c.trim());

    const openRfqs = await prisma.quotationRequest.findMany({
      where: {
        status: { in: [RfqStatus.OPEN, RfqStatus.QUOTES_RECEIVED] }
      },
      include: {
        category: true,
        customer: { select: { id: true, name: true } },
        quotes: {
          where: { vendorId: vendor.id }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const result = openRfqs.filter(rfq => {
      if (!vendorCategories.includes(rfq.category.slug)) return false;
      const dist = calculateDistanceKm(vendor.latitude, vendor.longitude, rfq.locationLat, rfq.locationLng);
      return dist <= vendor.serviceRadiusKm;
    }).map(rfq => ({
      ...rfq,
      specifications: JSON.parse(rfq.specifications),
      attachments: JSON.parse(rfq.attachments),
      hasSubmittedQuote: rfq.quotes.length > 0,
      myQuote: rfq.quotes[0] || null,
      distanceKm: calculateDistanceKm(vendor.latitude, vendor.longitude, rfq.locationLat, rfq.locationLng)
    }));

    return res.json({ success: true, rfqs: result });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function submitQuote(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user || req.user.role !== Role.VENDOR) {
      return res.status(403).json({ success: false, error: 'Only vendors can submit quotes' });
    }

    const { rfqId } = req.params;
    const {
      materialCost = 0,
      laborCost = 0,
      deliveryCost = 0,
      taxes = 0,
      estimatedDays,
      proposalDetails
    } = req.body;

    const vendor = await prisma.vendorProfile.findUnique({
      where: { userId: req.user.userId }
    });

    if (!vendor) return res.status(404).json({ success: false, error: 'Vendor profile not found' });

    const rfq = await prisma.quotationRequest.findUnique({
      where: { id: rfqId },
      include: { customer: true }
    });

    if (!rfq) return res.status(404).json({ success: false, error: 'RFQ not found' });

    const mat = parseFloat(materialCost) || 0;
    const lab = parseFloat(laborCost) || 0;
    const del = parseFloat(deliveryCost) || 0;
    const tax = parseFloat(taxes) || 0;
    const totalAmount = mat + lab + del + tax;

    if (totalAmount <= 0) {
      return res.status(400).json({ success: false, error: 'Total quote amount must be greater than zero' });
    }

    const quote = await prisma.vendorQuote.create({
      data: {
        rfqId,
        vendorId: vendor.id,
        materialCost: mat,
        laborCost: lab,
        deliveryCost: del,
        taxes: tax,
        totalAmount,
        estimatedDays: parseInt(estimatedDays) || 3,
        proposalDetails: proposalDetails || 'Standard quotation proposal',
        status: QuoteStatus.SUBMITTED
      },
      include: {
        vendor: { select: { businessName: true, rating: true, address: true } }
      }
    });

    // Update RFQ status to QUOTES_RECEIVED
    await prisma.quotationRequest.update({
      where: { id: rfqId },
      data: { status: RfqStatus.QUOTES_RECEIVED }
    });

    // Send WhatsApp notification to customer
    WhatsAppService.sendAlert({
      toPhone: rfq.customer.phone,
      templateName: 'QUOTE_RECEIVED',
      recipientName: rfq.customer.name,
      parameters: {
        vendorName: vendor.businessName,
        rfqNumber: rfq.rfqNumber,
        totalAmount: quote.totalAmount,
        estimatedDays: quote.estimatedDays
      }
    }).catch(err => console.error('WhatsApp notify error:', err));

    return res.status(201).json({
      success: true,
      message: 'Itemized quotation submitted successfully',
      quote
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function getRfqDetails(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;

    const rfq = await prisma.quotationRequest.findUnique({
      where: { id },
      include: {
        category: true,
        customer: { select: { id: true, name: true, phone: true } },
        quotes: {
          include: {
            vendor: {
              select: {
                id: true,
                businessName: true,
                rating: true,
                reviewCount: true,
                address: true,
                user: { select: { phone: true } }
              }
            }
          },
          orderBy: { totalAmount: 'asc' } // Sorted for easy side-by-side comparison
        },
        chatMessages: {
          include: { sender: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!rfq) return res.status(404).json({ success: false, error: 'RFQ not found' });

    return res.json({
      success: true,
      rfq: {
        ...rfq,
        specifications: JSON.parse(rfq.specifications),
        attachments: JSON.parse(rfq.attachments)
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function acceptQuote(req: AuthenticatedRequest, res: Response) {
  try {
    const { rfqId, quoteId } = req.params;

    const rfq = await prisma.quotationRequest.findUnique({
      where: { id: rfqId }
    });

    if (!rfq) return res.status(404).json({ success: false, error: 'RFQ not found' });
    if (rfq.customerId !== req.user?.userId) {
      return res.status(403).json({ success: false, error: 'Only the project creator can award quotes' });
    }

    // Award winning quote
    await prisma.vendorQuote.update({
      where: { id: quoteId },
      data: { status: QuoteStatus.ACCEPTED }
    });

    // Reject other quotes for this RFQ
    await prisma.vendorQuote.updateMany({
      where: {
        rfqId,
        id: { not: quoteId }
      },
      data: { status: QuoteStatus.REJECTED }
    });

    // Update RFQ status
    const updatedRfq = await prisma.quotationRequest.update({
      where: { id: rfqId },
      data: {
        status: RfqStatus.ACCEPTED,
        selectedQuoteId: quoteId
      },
      include: {
        quotes: { include: { vendor: true } },
        category: true
      }
    });

    return res.json({
      success: true,
      message: 'Quote accepted and contract awarded to chosen vendor!',
      rfq: {
        ...updatedRfq,
        specifications: JSON.parse(updatedRfq.specifications),
        attachments: JSON.parse(updatedRfq.attachments)
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function getCustomerRfqs(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const rfqs = await prisma.quotationRequest.findMany({
      where: { customerId: req.user.userId },
      include: {
        category: true,
        quotes: {
          include: {
            vendor: { select: { businessName: true, rating: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json({
      success: true,
      rfqs: rfqs.map(r => ({
        ...r,
        specifications: JSON.parse(r.specifications),
        attachments: JSON.parse(r.attachments),
        quotesCount: r.quotes.length
      }))
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
