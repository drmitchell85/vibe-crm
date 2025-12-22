import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { errorHandler } from './middleware/errorHandler';
import { swaggerSpec } from './config/swagger';
import contactRoutes from './routes/contacts';
import interactionRoutes from './routes/interactions';
import reminderRoutes from './routes/reminders';
import tagRoutes from './routes/tags';

const app: Express = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger API documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'FPH CRM API Docs'
}));

// Swagger JSON endpoint
app.get('/api-docs.json', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'FPH CRM API is running' });
});

// API routes
app.use('/api/contacts', contactRoutes);
app.use('/api', interactionRoutes);
app.use('/api', reminderRoutes);
app.use('/api/tags', tagRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      message: 'Route not found',
      code: 'NOT_FOUND'
    }
  });
});

// Global error handler (must be last)
app.use(errorHandler);

export default app;
