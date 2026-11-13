import express from 'express';
import helmet from 'helmet';
import healthRoutes from './routes/health.routes.js';
import { notFound, errorHandler } from './middleware/error.middleware.js';
import authRoutes from './routes/auth.routes.js';
import { sessionMiddleware } from './middleware/session.middleware.js';
import { config } from './config/index.js';

const app = express();

app.disable("x-powered-by");

// Hinter einem Reverse Proxy (nginx, Render, …) kommt HTTPS beim Proxy an.
// Ohne diese Einstellung hält Express die Verbindung für unsicher und
// setzt das "secure"-Cookie nicht.
if (config.isProduction) {
  app.set('trust proxy', 1);
}

app.use(helmet());
app.use(express.json({ limit: '10kb' }));
app.use(sessionMiddleware);

app.use("/api/health", healthRoutes);
app.use('/api/auth', authRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;

