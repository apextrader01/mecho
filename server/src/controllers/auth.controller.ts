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

    return res.json({
      success: true,
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
