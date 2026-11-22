import { Response } from 'express';
import prisma from '../config/prisma';
import { AuthenticatedRequest } from '../middleware/auth';

export async function sendMessage(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const { receiverId, dispatchId, rfqId, message } = req.body;
    const file = req.file;

    if (!receiverId || (!message && !file)) {
      return res.status(400).json({
        success: false,
        error: 'receiverId and either a message or an image are required'
      });
    }

    const chatMessage = await prisma.chatMessage.create({
      data: {
        senderId: req.user.userId,
        receiverId,
        dispatchId: dispatchId || null,
        rfqId: rfqId || null,
        message: message || '',
        imageUrl: file ? `/uploads/${file.filename}` : null
      },
      include: {
        sender: { select: { id: true, name: true, role: true } },
        receiver: { select: { id: true, name: true, role: true } }
      }
    });

    return res.status(201).json({ success: true, message: chatMessage });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function getThreadMessages(req: AuthenticatedRequest, res: Response) {
  try {
    const { dispatchId, rfqId } = req.query;

    if (!dispatchId && !rfqId) {
      return res.status(400).json({
        success: false,
        error: 'Either dispatchId or rfqId must be provided'
      });
    }

    const where: any = {};
    if (dispatchId) where.dispatchId = String(dispatchId);
    if (rfqId) where.rfqId = String(rfqId);

    const messages = await prisma.chatMessage.findMany({
      where,
      include: {
        sender: { select: { id: true, name: true, role: true } }
      },
      orderBy: { createdAt: 'asc' }
    });

    return res.json({ success: true, messages });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
