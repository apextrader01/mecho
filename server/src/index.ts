import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

import authRoutes from './routes/auth.routes';
import categoryRoutes from './routes/category.routes';
import dispatchRoutes from './routes/dispatch.routes';
import quoteRoutes from './routes/quote.routes';
import commerceRoutes from './routes/commerce.routes';
import chatRoutes from './routes/chat.routes';
import vendorRoutes from './routes/vendor.routes';
import adminRoutes from './routes/admin.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Global Middleware
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'ShortEdge Hyperlocal Super-App Unified Backend',
    version: '1.0.0',
    engines: [
      'ENGINE_A_DISPATCH (Instant GPS, Fuel Assist, 24x7 Roadside, Pharmacy, Courier)',
      'ENGINE_B_QUOTE (Multi-Vendor RFQ, Side-by-Side Comparison Matrix)',
      'ENGINE_C_COMMERCE_SUBSCRIPTIONS (Catalog, Kirana Orders, Water/Dairy Subs, Drivers)'
    ],
    timestamp: new Date().toISOString()
  });
});

// Mount Engine & Module Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/dispatch', dispatchRoutes);
app.use('/api/quotes', quoteRoutes);
app.use('/api/commerce', commerceRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/vendor', vendorRoutes);
app.use('/api/admin', adminRoutes);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled API Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message
  });
});

app.listen(PORT, () => {
  console.log(`🚀 ShortEdge Unified Server running on http://localhost:${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
});

export default app;
