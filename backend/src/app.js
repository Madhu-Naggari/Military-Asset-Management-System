import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/authRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import lookupRoutes from './routes/lookupRoutes.js';
import purchaseRoutes from './routes/purchaseRoutes.js';
import transferRoutes from './routes/transferRoutes.js';
import assignmentRoutes from './routes/assignmentRoutes.js';
import expenditureRoutes from './routes/expenditureRoutes.js';
import { notFound } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
  })
);
app.use(helmet());
app.use(express.json());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300
  })
);
app.use(morgan('dev'));

app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'Military Asset Management API is running.' });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/lookups', lookupRoutes);
app.use('/api/v1/purchases', purchaseRoutes);
app.use('/api/v1/transfers', transferRoutes);
app.use('/api/v1/assignments', assignmentRoutes);
app.use('/api/v1/expenditures', expenditureRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
