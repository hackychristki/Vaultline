import express from 'express';
import helmet from 'helmet';
import healthRoutes from './routes/health.routes.js';
import { notFound, errorHandler } from './middleware/error.middleware.js';
import authRoutes from './routes/auth.routes.js';

const app = express();

app.disable("x-powered-by");
app.use(helmet());
app.use(express.json({ limit: '10kb' }));

app.use("/api/health", healthRoutes);
app.use('/api/auth', authRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;

