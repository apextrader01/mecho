import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { AuthenticatedRequest } from '../middleware/auth';
import { KycStatus } from '../types';

// =============================================================================
// VENDOR PORTAL CONTROLLER METHODS
// =============================================================================

export async function getVendorProfile(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user || !req.user.vendorProfileId) {
      return res.status(404).json({ success: false, error: 'Vendor profile not found for this account' });
    }

    const vendor = await prisma.vendorProfile.findUnique({
      where: { id: req.user.vendorProfileId },
      include: {
        user: { select: { id: true, name: true, phone: true, email: true, preferredLang: true } }
      }
    });

    return res.json({ success: true, vendor });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function toggleVendorOnline(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user || !req.user.vendorProfileId) {
      return res.status(404).json({ success: false, error: 'Vendor profile not found' });
    }

    const { isOnline, is24x7Emergency } = req.body;

    const data: any = {};
    if (isOnline !== undefined) data.isOnline = Boolean(isOnline);
    if (is24x7Emergency !== undefined) data.is24x7Emergency = Boolean(is24x7Emergency);

    const updated = await prisma.vendorProfile.update({
      where: { id: req.user.vendorProfileId },
      data
    });

    return res.json({
      success: true,
      message: `Vendor availability updated: Online = ${updated.isOnline}, 24x7 Emergency = ${updated.is24x7Emergency}`,
      vendor: updated
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function updateVendorSettings(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user || !req.user.vendorProfileId) {
      return res.status(404).json({ success: false, error: 'Vendor profile not found' });
    }

    const {
      businessName,
      categories,
      description,
      address,
      latitude,
      longitude,
      serviceRadiusKm,
      dayRunnerFee,
      nightRunnerFee,
      perKmCharge
    } = req.body;

    const updated = await prisma.vendorProfile.update({
      where: { id: req.user.vendorProfileId },
      data: {
        businessName,
        categories,
        description,
        address,
        latitude: latitude ? parseFloat(latitude) : undefined,
        longitude: longitude ? parseFloat(longitude) : undefined,
        serviceRadiusKm: serviceRadiusKm ? parseFloat(serviceRadiusKm) : undefined,
        dayRunnerFee: dayRunnerFee ? parseFloat(dayRunnerFee) : undefined,
        nightRunnerFee: nightRunnerFee ? parseFloat(nightRunnerFee) : undefined,
        perKmCharge: perKmCharge ? parseFloat(perKmCharge) : undefined
      }
    });

    return res.json({ success: true, vendor: updated });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function getVendorEarnings(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user || !req.user.vendorProfileId) {
      return res.status(404).json({ success: false, error: 'Vendor profile not found' });
    }

    const vendorId = req.user.vendorProfileId;

    const completedDispatches = await prisma.dispatchBooking.findMany({
      where: { vendorId, status: 'COMPLETED' },
      select: { totalAmount: true, runnerServiceFee: true, createdAt: true }
    });

    const acceptedQuotes = await prisma.vendorQuote.findMany({
      where: { vendorId, status: 'ACCEPTED' },
      select: { totalAmount: true, createdAt: true }
    });

    const completedOrders = await prisma.commerceOrder.findMany({
      where: { vendorId, status: 'DELIVERED' },
      select: { totalAmount: true, createdAt: true }
    });

    const dispatchEarnings = completedDispatches.reduce((acc, d) => acc + d.totalAmount, 0);
    const quotesEarnings = acceptedQuotes.reduce((acc, q) => acc + q.totalAmount, 0);
    const commerceEarnings = completedOrders.reduce((acc, o) => acc + o.totalAmount, 0);

    return res.json({
      success: true,
      earnings: {
        totalRevenue: dispatchEarnings + quotesEarnings + commerceEarnings,
        dispatchEarnings,
        quotesEarnings,
        commerceEarnings,
        counts: {
          dispatches: completedDispatches.length,
          contracts: acceptedQuotes.length,
          orders: completedOrders.length
        }
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

// =============================================================================
// ADMIN CONSOLE CONTROLLER METHODS
// =============================================================================

export async function getAdminDashboardStats(req: AuthenticatedRequest, res: Response) {
  try {
    const [totalUsers, totalVendors, pendingKyc, activeDispatches, openRfqs, totalOrders] = await Promise.all([
      prisma.user.count({ where: { role: 'USER' } }),
      prisma.vendorProfile.count(),
      prisma.vendorProfile.count({ where: { kycStatus: 'PENDING' } }),
      prisma.dispatchBooking.count({ where: { status: { in: ['REQUESTED', 'ACCEPTED', 'ON_THE_WAY', 'IN_PROGRESS'] } } }),
      prisma.quotationRequest.count({ where: { status: { in: ['OPEN', 'QUOTES_RECEIVED'] } } }),
      prisma.commerceOrder.count()
    ]);

    return res.json({
      success: true,
      stats: {
        totalUsers,
        totalVendors,
        pendingKyc,
        activeDispatches,
        openRfqs,
        totalOrders
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function getVendorsList(req: AuthenticatedRequest, res: Response) {
  try {
    const { kycStatus } = req.query;

    const where: any = {};
    if (kycStatus && typeof kycStatus === 'string') {
      where.kycStatus = kycStatus;
    }

    const vendors = await prisma.vendorProfile.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, phone: true, email: true, createdAt: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json({ success: true, vendors });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function updateKycStatus(req: AuthenticatedRequest, res: Response) {
  try {
    const { vendorId } = req.params;
    const { status } = req.body; // "APPROVED" | "REJECTED" | "PENDING"

    if (!['APPROVED', 'REJECTED', 'PENDING'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid KYC status' });
    }

    const updated = await prisma.vendorProfile.update({
      where: { id: vendorId },
      data: { kycStatus: status }
    });

    return res.json({ success: true, message: `KYC status updated to ${status}`, vendor: updated });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function getLiveDispatchesMap(req: AuthenticatedRequest, res: Response) {
  try {
    const liveDispatches = await prisma.dispatchBooking.findMany({
      where: {
        status: { in: ['REQUESTED', 'ACCEPTED', 'ON_THE_WAY', 'IN_PROGRESS'] }
      },
      include: {
        category: true,
        customer: { select: { name: true, phone: true } },
        vendor: { select: { businessName: true, latitude: true, longitude: true } }
      }
    });

    return res.json({
      success: true,
      liveDispatches: liveDispatches.map(d => ({
        ...d,
        requestDetails: JSON.parse(d.requestDetails)
      }))
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function getCustomersList(req: AuthenticatedRequest, res: Response) {
  try {
    const customers = await prisma.user.findMany({
      where: { role: 'USER' },
      include: {
        _count: {
          select: {
            dispatches: true,
            rfqs: true,
            subscriptions: true,
            commerceOrders: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json({ success: true, customers });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
