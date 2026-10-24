import { env } from '../config/env';

type ReminderEmail = {
  to: string;
  subject: string;
  html: string;
};

export const sendReminderEmail = async ({ to, subject, html }: ReminderEmail): Promise<void> => {
  if (!env.resendApiKey || !env.reminderFromEmail) {
    throw new Error('RESEND_API_KEY and REMINDER_FROM_EMAIL must be configured to send reminders');
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.resendApiKey}`,
      'Content-Type': 'application/json',
    },
    signal: AbortSignal.timeout(15_000),
    body: JSON.stringify({
      from: env.reminderFromEmail,
      to: [to],
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Resend request failed (${response.status}): ${details}`);
  }
};
