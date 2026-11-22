import { Request, Response } from 'express';
import prisma from '../config/prisma';

export async function getAllCategories(req: Request, res: Response) {
  try {
    const { engineType } = req.query;

    const where: any = { isActive: true };
    if (engineType && typeof engineType === 'string') {
      where.engineType = engineType;
    }

    const categories = await prisma.serviceCategory.findMany({
      where,
      orderBy: { sortOrder: 'asc' }
    });

    return res.json({
      success: true,
      categories: categories.map(cat => ({
        ...cat,
        metadata: JSON.parse(cat.metadata || '{}')
      }))
    });
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function getCategoryBySlug(req: Request, res: Response) {
  try {
    const { slug } = req.params;
    const category = await prisma.serviceCategory.findUnique({
      where: { slug }
    });

    if (!category) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }

    return res.json({
      success: true,
      category: {
        ...category,
        metadata: JSON.parse(category.metadata || '{}')
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function upsertCategory(req: Request, res: Response) {
  try {
    const {
      id,
      slug,
      name,
      nameHi,
      description,
      icon,
      engineType,
      basePrice,
      pricingUnit,
      metadata,
      isActive,
      sortOrder
    } = req.body;

    if (!slug || !name || !engineType) {
      return res.status(400).json({ success: false, error: 'slug, name, and engineType are required' });
    }

    const metadataStr = typeof metadata === 'object' ? JSON.stringify(metadata) : metadata || '{}';

    const category = await prisma.serviceCategory.upsert({
      where: { slug },
      update: {
        name,
        nameHi: nameHi || name,
        description: description || '',
        icon: icon || 'Briefcase',
        engineType,
        basePrice: parseFloat(basePrice) || 0,
        pricingUnit,
        metadata: metadataStr,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        sortOrder: sortOrder ? parseInt(sortOrder) : 0
      },
      create: {
        slug,
        name,
        nameHi: nameHi || name,
        description: description || '',
        icon: icon || 'Briefcase',
        engineType,
        basePrice: parseFloat(basePrice) || 0,
        pricingUnit,
        metadata: metadataStr,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        sortOrder: sortOrder ? parseInt(sortOrder) : 0
      }
    });

    return res.status(200).json({ success: true, category });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
