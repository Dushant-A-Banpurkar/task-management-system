import cors from 'cors';
import express from 'express';
import { connectDB } from './config/db';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';
import apiRoutes from './routes';
import { startDeadlineReminderScheduler } from './services/deadlineReminders';

const app = express();
const renderKeepAliveIntervalMs = 10 * 60 * 1000;

app.use(cors({
  origin: [
    'https://task-management-system-lyart-ten.vercel.app',
    'http://localhost:5173',
  ],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api', apiRoutes);

app.use(notFound);
app.use(errorHandler);

export const startServer = async (): Promise<void> => {
  await connectDB();
  if (env.resendApiKey && env.reminderFromEmail) {
    startDeadlineReminderScheduler();
  } else {
    console.warn('Deadline reminders are disabled: configure RESEND_API_KEY and REMINDER_FROM_EMAIL');
  }
  app.listen(env.port, () => {
    console.log(`Server running on port ${env.port}`);
    if (env.renderUrl) {
      const healthUrl = `${env.renderUrl.replace(/\/+$/, '')}/health`;
      const keepAliveTimer = setInterval(async () => {
        try {
          const response = await fetch(healthUrl, {
            signal: AbortSignal.timeout(10_000),
          });
          await response.text();
          if (!response.ok) {
            console.warn(`Render keep-alive request failed with status ${response.status}`);
          }
        } catch (error) {
          console.error('Render keep-alive request failed', error);
        }
      }, renderKeepAliveIntervalMs);
      keepAliveTimer.unref();
      console.log('Render keep-alive enabled');
    }
  });
};

export default app;