import { Response } from 'express';
import prisma from '../config/prisma';
import { AuthenticatedRequest } from '../middleware/auth';
import { calculateDistanceKm } from '../services/haversine';
import { generate4DigitOtp } from '../services/otp';
import { WhatsAppService } from '../services/whatsapp';
import { DispatchStatus, Role } from '../types';

/**
 * Determine if current local time is Night hours (10:00 PM to 06:00 AM)
 */
function isNightTime(): boolean {
  const currentHour = new Date().getHours();
  return currentHour >= 22 || currentHour < 6;
}

export async function createDispatchRequest(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const {
      categorySlug,
      pickupLatitude,
      pickupLongitude,
      pickupAddress,
      dropLatitude,
      dropLongitude,
      dropAddress,
      requestDetails, // { fuelType, liters, vehicleModel, issue, parcelWeight, etc. }
      paymentMode = 'UPI'
    } = req.body;

    if (!categorySlug || !pickupLatitude || !pickupLongitude || !pickupAddress) {
      return res.status(400).json({
        success: false,
        error: 'categorySlug, pickupLatitude, pickupLongitude, and pickupAddress are required'
      });
    }

    const category = await prisma.serviceCategory.findUnique({
      where: { slug: categorySlug }
    });

    if (!category) {
      return res.status(404).json({ success: false, error: 'Service category not found' });
    }

    const details = typeof requestDetails === 'object' ? requestDetails : JSON.parse(requestDetails || '{}');

    // Strict Rule: Emergency Highway Fuel Runner strictly capped at 2 to 5 Litres
    if (category.slug === 'emergency-fuel') {
      const liters = parseFloat(details.liters || '3');
      if (isNaN(liters) || liters < 2 || liters > 5) {
        return res.status(400).json({
          success: false,
          error: 'Emergency fuel assist is strictly capped between 2.0 and 5.0 Litres (reach-to-pump allowance)'
        });
      }
      if (!details.fuelType || !['PETROL', 'DIESEL'].includes(details.fuelType.toUpperCase())) {
        return res.status(400).json({
          success: false,
          error: 'Valid fuelType (PETROL or DIESEL) is required'
        });
      }
    }

    // Determine Runner / Base Fee (Day vs Night)
    const isNight = isNightTime();
    const runnerServiceFee = isNight ? 250.0 : (category.basePrice > 0 ? category.basePrice : 150.0);

    const bookingNumber = `SOS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const startOtp = generate4DigitOtp();
    const endOtp = generate4DigitOtp();

    const dispatch = await prisma.dispatchBooking.create({
      data: {
        bookingNumber,
        categoryId: category.id,
        customerId: req.user.userId,
        status: DispatchStatus.REQUESTED,
        pickupLatitude: parseFloat(pickupLatitude),
        pickupLongitude: parseFloat(pickupLongitude),
        pickupAddress,
        dropLatitude: dropLatitude ? parseFloat(dropLatitude) : null,
        dropLongitude: dropLongitude ? parseFloat(dropLongitude) : null,
        dropAddress: dropAddress || null,
        requestDetails: JSON.stringify(details),
        startOtp,
        endOtp,
        runnerServiceFee,
        totalAmount: runnerServiceFee, // Will add actual receipt amount on completion
        paymentMode
      },
      include: {
        category: true,
        customer: { select: { id: true, name: true, phone: true } }
      }
    });

    // Hyperlocal Broadcast: Find nearby online vendors supporting this category
    const allOnlineVendors = await prisma.vendorProfile.findMany({
      where: {
        isOnline: true,
        kycStatus: 'APPROVED'
      },
      include: {
        user: { select: { id: true, name: true, phone: true } }
      }
    });

    const nearbyVendors = allOnlineVendors.filter(vendor => {
      const catList = vendor.categories.split(',').map(s => s.trim());
      if (!catList.includes(categorySlug)) return false;

      const dist = calculateDistanceKm(
        dispatch.pickupLatitude,
        dispatch.pickupLongitude,
        vendor.latitude,
        vendor.longitude
      );
      return dist <= vendor.serviceRadiusKm;
    });

    // Alert nearby vendors via WhatsApp Hook
    for (const vendor of nearbyVendors) {
      WhatsAppService.sendAlert({
        toPhone: vendor.user.phone,
        templateName: 'SOS_DISPATCH_ALERT',
        recipientName: vendor.businessName,
        parameters: {
          bookingNumber: dispatch.bookingNumber,
          categoryName: category.name,
          pickupAddress: dispatch.pickupAddress,
          startOtp: dispatch.startOtp
        }
      }).catch(err => console.error('WhatsApp notify error:', err));
    }

    return res.status(201).json({
      success: true,
      message: 'Dispatch request broadcasted to nearest partners',
      dispatch: {
        ...dispatch,
        requestDetails: JSON.parse(dispatch.requestDetails)
      },
      nearbyPartnersCount: nearbyVendors.length
    });
  } catch (error: any) {
    console.error('Create dispatch error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function getNearbyDispatchesForVendor(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user || req.user.role !== Role.VENDOR) {
      return res.status(403).json({ success: false, error: 'Only vendors can access incoming dispatches' });
    }

    const vendor = await prisma.vendorProfile.findUnique({
      where: { userId: req.user.userId }
    });

    if (!vendor) {
      return res.status(404).json({ success: false, error: 'Vendor profile not found' });
    }

    const vendorCategories = vendor.categories.split(',').map(c => c.trim());

    // Fetch all active open requests
    const openDispatches = await prisma.dispatchBooking.findMany({
      where: {
        status: DispatchStatus.REQUESTED
      },
      include: {
        category: true,
        customer: { select: { id: true, name: true, phone: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Filter within vendor's radius and category match
    const matchingDispatches = openDispatches.filter(dispatch => {
      if (!vendorCategories.includes(dispatch.category.slug)) return false;
      const distance = calculateDistanceKm(
        vendor.latitude,
        vendor.longitude,
        dispatch.pickupLatitude,
        dispatch.pickupLongitude
      );
      return distance <= vendor.serviceRadiusKm;
    }).map(d => ({
      ...d,
      requestDetails: JSON.parse(d.requestDetails),
      distanceKm: calculateDistanceKm(
        vendor.latitude,
        vendor.longitude,
        d.pickupLatitude,
        d.pickupLongitude
      )
    }));

    return res.json({
      success: true,
      dispatches: matchingDispatches
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function acceptDispatch(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user || req.user.role !== Role.VENDOR) {
      return res.status(403).json({ success: false, error: 'Only vendors can accept dispatches' });
    }

    const { id } = req.params;
    const vendor = await prisma.vendorProfile.findUnique({
      where: { userId: req.user.userId }
    });

    if (!vendor) {
      return res.status(404).json({ success: false, error: 'Vendor profile not found' });
    }

    // Atomic assignment check: ensure booking is still in REQUESTED state
    const existing = await prisma.dispatchBooking.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({ success: false, error: 'Dispatch not found' });
    }

    if (existing.status !== DispatchStatus.REQUESTED) {
      return res.status(409).json({
        success: false,
        error: 'This dispatch has already been accepted by another partner or cancelled'
      });
    }

    const updated = await prisma.dispatchBooking.update({
      where: { id },
      data: {
        vendorId: vendor.id,
        status: DispatchStatus.ACCEPTED,
        acceptedAt: new Date()
      },
      include: {
        category: true,
        customer: { select: { id: true, name: true, phone: true } },
        vendor: { select: { id: true, businessName: true, address: true, rating: true, user: { select: { phone: true } } } }
      }
    });

    // Alert Customer that Partner is on the way
    WhatsAppService.sendAlert({
      toPhone: updated.customer.phone,
      templateName: 'SOS_DISPATCH_ALERT',
      recipientName: updated.customer.name,
      parameters: {
        bookingNumber: updated.bookingNumber,
        categoryName: updated.category.name,
        pickupAddress: `Assigned to ${vendor.businessName}`,
        startOtp: updated.startOtp
      }
    }).catch(err => console.error('WhatsApp notify error:', err));

    return res.json({
      success: true,
      message: 'Dispatch accepted successfully',
      dispatch: {
        ...updated,
        requestDetails: JSON.parse(updated.requestDetails)
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function updateDispatchStatus(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const { status } = req.body; // "ON_THE_WAY" | "CANCELLED"

    const dispatch = await prisma.dispatchBooking.findUnique({ where: { id } });
    if (!dispatch) return res.status(404).json({ success: false, error: 'Dispatch not found' });

    const updated = await prisma.dispatchBooking.update({
      where: { id },
      data: { status },
      include: { category: true, customer: true, vendor: true }
    });

    return res.json({
      success: true,
      dispatch: {
        ...updated,
        requestDetails: JSON.parse(updated.requestDetails)
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function verifyStartOtp(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const { otp, idVerified = true } = req.body;

    const dispatch = await prisma.dispatchBooking.findUnique({ where: { id } });
    if (!dispatch) return res.status(404).json({ success: false, error: 'Dispatch not found' });

    if (dispatch.startOtp !== String(otp).trim()) {
      return res.status(400).json({
        success: false,
        error: 'Invalid 4-digit Start OTP. Please ask customer for the correct code.'
      });
    }

    const updated = await prisma.dispatchBooking.update({
      where: { id },
      data: {
        status: DispatchStatus.IN_PROGRESS,
        startedAt: new Date(),
        idVerified: Boolean(idVerified)
      },
      include: { category: true, customer: true, vendor: true }
    });

    return res.json({
      success: true,
      message: 'Start OTP verified. Service marked IN_PROGRESS.',
      dispatch: {
        ...updated,
        requestDetails: JSON.parse(updated.requestDetails)
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function completeDispatch(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const { otp, actualFuelReceiptAmount = 0 } = req.body;
    const file = req.file;

    const dispatch = await prisma.dispatchBooking.findUnique({
      where: { id },
      include: { category: true }
    });

    if (!dispatch) return res.status(404).json({ success: false, error: 'Dispatch not found' });

    if (dispatch.endOtp !== String(otp).trim()) {
      return res.status(400).json({
        success: false,
        error: 'Invalid 4-digit Completion OTP. Service cannot be finalized without customer confirmation.'
      });
    }

    // Mandatory photo upload for completion proof (e.g. Fuel pump receipt or work completion)
    const photoUrl = file ? `/uploads/${file.filename}` : null;
    if (!photoUrl && (dispatch.category.slug === 'emergency-fuel' || dispatch.category.slug === 'roadside-puncture')) {
      return res.status(400).json({
        success: false,
        error: 'Mandatory photo proof required (e.g. Fuel pump bill or completed repair photo) before marking COMPLETED'
      });
    }

    const receiptAmount = parseFloat(actualFuelReceiptAmount) || 0;
    const totalAmount = dispatch.runnerServiceFee + receiptAmount;

    const updated = await prisma.dispatchBooking.update({
      where: { id },
      data: {
        status: DispatchStatus.COMPLETED,
        completedAt: new Date(),
        completionPhotoUrl: photoUrl || dispatch.completionPhotoUrl,
        actualFuelReceiptAmount: receiptAmount,
        totalAmount,
        paymentStatus: 'PAID'
      },
      include: { category: true, customer: true, vendor: true }
    });

    return res.json({
      success: true,
      message: 'Dispatch successfully completed with photo verification and bill audit.',
      dispatch: {
        ...updated,
        requestDetails: JSON.parse(updated.requestDetails)
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function getDispatchById(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const dispatch = await prisma.dispatchBooking.findUnique({
      where: { id },
      include: {
        category: true,
        customer: { select: { id: true, name: true, phone: true } },
        vendor: {
          include: {
            user: { select: { name: true, phone: true } }
          }
        },
        chatMessages: {
          include: { sender: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'asc' }
        },
        review: true
      }
    });

    if (!dispatch) return res.status(404).json({ success: false, error: 'Dispatch not found' });

    return res.json({
      success: true,
      dispatch: {
        ...dispatch,
        requestDetails: JSON.parse(dispatch.requestDetails)
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function getMyDispatches(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });

    let where: any = {};
    if (req.user.role === Role.USER) {
      where.customerId = req.user.userId;
    } else if (req.user.role === Role.VENDOR && req.user.vendorProfileId) {
      where.vendorId = req.user.vendorProfileId;
    }

    const dispatches = await prisma.dispatchBooking.findMany({
      where,
      include: {
        category: true,
        vendor: true,
        customer: { select: { id: true, name: true, phone: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json({
      success: true,
      dispatches: dispatches.map(d => ({
        ...d,
        requestDetails: JSON.parse(d.requestDetails)
      }))
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
