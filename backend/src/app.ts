import cors from 'cors';
import express from 'express';
import { connectDB } from './config/db';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';
import apiRoutes from './routes';
import { startDeadlineReminderScheduler } from './services/deadlineReminders';

const app = express();

app.use(cors());
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
  });
};

export default app;
