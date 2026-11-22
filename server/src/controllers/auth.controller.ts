import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../config/prisma';
import { signToken } from '../utils/jwt';
import { Role, KycStatus } from '../types';
import { AuthenticatedRequest } from '../middleware/auth';

export async function register(req: Request, res: Response) {
  try {
    const {
      name,
      phone,
      email,
      password,
      role = 'USER',
      preferredLang = 'en',
      businessName,
      businessType,
      categories,
      address,
      latitude,
      longitude,
      serviceRadiusKm,
      dayRunnerFee,
      nightRunnerFee
    } = req.body;

    if (!name || !phone || !password) {
      return res.status(400).json({
        success: false,
        error: 'Name, phone, and password are required'
      });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { phone },
          ...(email ? [{ email }] : [])
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'A user with this phone or email already exists'
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const assignedRole = role === 'ADMIN' ? Role.ADMIN : role === 'VENDOR' ? Role.VENDOR : Role.USER;

    const user = await prisma.user.create({
      data: {
        name,
        phone,
        email,
        passwordHash,
        role: assignedRole,
        preferredLang
      }
    });

    let vendorProfile = null;
    if (assignedRole === Role.VENDOR) {
      vendorProfile = await prisma.vendorProfile.create({
        data: {
          userId: user.id,
          businessName: businessName || `${name}'s Enterprise`,
          businessType: businessType || 'GENERAL_SERVICES',
          categories: categories || '',
          address: address || 'Hyperlocal Hub',
          latitude: latitude ? parseFloat(latitude) : 12.9716,
          longitude: longitude ? parseFloat(longitude) : 77.5946,
          serviceRadiusKm: serviceRadiusKm ? parseFloat(serviceRadiusKm) : 10.0,
          kycStatus: KycStatus.PENDING,
          dayRunnerFee: dayRunnerFee ? parseFloat(dayRunnerFee) : 150.0,
          nightRunnerFee: nightRunnerFee ? parseFloat(nightRunnerFee) : 250.0
        }
      });
    }

    const token = signToken({
      userId: user.id,
      role: assignedRole,
      phone: user.phone,
      email: user.email
    });

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        preferredLang: user.preferredLang,
        vendorProfile
      }
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to complete registration',
      details: error.message
    });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        error: 'Phone/Email and password are required'
      });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { phone: identifier },
          { email: identifier }
        ]
      },
      include: {
        vendorProfile: true
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    const token = signToken({
      userId: user.id,
      role: user.role as Role,
      phone: user.phone,
      email: user.email
    });

    return res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        preferredLang: user.preferredLang,
        vendorProfile: user.vendorProfile
      }
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to login',
      details: error.message
    });
  }
}

// In-memory OTP store for instant mobile phone login
const otpStore: Record<string, { otp: string; expiresAt: number }> = {};

export async function sendOtp(req: Request, res: Response) {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ success: false, error: 'Phone number is required' });
    }

    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const normalizedPhone = cleanPhone.length === 10 ? `+91${cleanPhone}` : cleanPhone.startsWith('91') ? `+${cleanPhone}` : phone;

    // Instant verification OTP: 1234 in testing/demo mode
    const generatedOtp = '1234';
    otpStore[normalizedPhone] = {
      otp: generatedOtp,
      expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes
    };

    console.log(`🔑 [AUTH OTP] Mobile verification code for ${normalizedPhone}: ${generatedOtp}`);

    return res.json({
      success: true,
      message: `OTP sent successfully to ${normalizedPhone}`,
      otp: generatedOtp,
      phone: normalizedPhone
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function verifyOtp(req: Request, res: Response) {
  try {
    const { phone, otp, name } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ success: false, error: 'Phone and OTP are required' });
    }

    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const normalizedPhone = cleanPhone.length === 10 ? `+91${cleanPhone}` : cleanPhone.startsWith('91') ? `+${cleanPhone}` : phone;

    const stored = otpStore[normalizedPhone];
    const isValid = otp === '1234' || (stored && stored.otp === otp && stored.expiresAt > Date.now());

    if (!isValid) {
      return res.status(400).json({ success: false, error: 'Invalid or expired OTP' });
    }

    let user = await prisma.user.findFirst({
      where: { phone: normalizedPhone }
    });

    if (!user) {
      // Auto-register new customer
      const defaultHash = await bcrypt.hash('Password@123', 10);
      user = await prisma.user.create({
        data: {
          name: name || `Customer ${normalizedPhone.slice(-4)}`,
          phone: normalizedPhone,
          passwordHash: defaultHash,
          role: Role.USER,
          preferredLang: 'en'
        }
      });
    }

    delete otpStore[normalizedPhone];

    const token = signToken({
      userId: user.id,
      role: user.role as Role,
      phone: user.phone,
      email: user.email
    });

    return res.json({
      success: true,
      message: 'Mobile login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        preferredLang: user.preferredLang
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function updateProfile(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const { name, email, preferredLang } = req.body;

    const dataToUpdate: any = {};
    if (name) dataToUpdate.name = name;
    if (email) dataToUpdate.email = email;
    if (preferredLang) dataToUpdate.preferredLang = preferredLang;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.userId },
      data: dataToUpdate
    });

    return res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        phone: updatedUser.phone,
        email: updatedUser.email,
        role: updatedUser.role,
        preferredLang: updatedUser.preferredLang
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function getCurrentUser(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: {
        vendorProfile: true
      }
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const [dispatchesCount, rfqsCount, subsCount] = await Promise.all([
      prisma.dispatchBooking.count({ where: { customerId: user.id } }),
      prisma.quotationRequest.count({ where: { customerId: user.id } }),
      prisma.subscription.count({ where: { customerId: user.id } })
    ]);

    return res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        preferredLang: user.preferredLang,
        vendorProfile: user.vendorProfile,
        stats: {
          dispatchesCount,
          rfqsCount,
          subsCount
        }
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function updatePreferredLang(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const { lang } = req.body;
    if (!lang || !['en', 'hi'].includes(lang)) {
      return res.status(400).json({ success: false, error: 'Supported languages are "en" or "hi"' });
    }

    const updated = await prisma.user.update({
      where: { id: req.user.userId },
      data: { preferredLang: lang },
      select: { id: true, preferredLang: true }
    });

    return res.json({ success: true, updated });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
