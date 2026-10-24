import { Task } from '../models/Task';
import { sendReminderEmail } from './resend';

const reminderIntervalMs = 60 * 60 * 1000;
const staleClaimMs = 10 * 60 * 1000;

const escapeHtml = (value: string): string =>
  value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return entities[character];
  });

export const sendUpcomingTaskReminders = async (): Promise<void> => {
  const now = new Date();
  const dueBefore = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const staleClaimBefore = new Date(now.getTime() - staleClaimMs);
  const dueTasks = await Task.find({
    status: { $ne: 'completed' },
    dueDate: { $gte: now, $lte: dueBefore },
    reminderSentAt: { $exists: false },
  }).select('_id');

  for (const candidate of dueTasks) {
    const claimTime = new Date();
    const task = await Task.findOneAndUpdate(
      {
        _id: candidate._id,
        status: { $ne: 'completed' },
        reminderSentAt: { $exists: false },
        $or: [
          { reminderClaimedAt: { $exists: false } },
          { reminderClaimedAt: { $lt: staleClaimBefore } },
        ],
      },
      { $set: { reminderClaimedAt: claimTime } },
      { new: true }
    ).populate<{
      assignee: { name: string; email: string } | null;
      createdBy: { name: string; email: string };
    }>('assignee createdBy', 'name email');

    if (!task) continue;

    const recipient = task.assignee || task.createdBy;
    if (!recipient?.email) {
      await Task.updateOne(
        { _id: task._id, reminderClaimedAt: claimTime },
        { $unset: { reminderClaimedAt: 1 } }
      );
      console.warn(`Reminder skipped for task ${String(task._id)}: recipient email is unavailable`);
      continue;
    }

    try {
      await sendReminderEmail({
        to: recipient.email,
        subject: `Task due soon: ${task.title}`,
        html: `<p>Hello ${escapeHtml(recipient.name)},</p><p>Your task <strong>${escapeHtml(task.title)}</strong> is due ${task.dueDate?.toISOString()}.</p><p>${escapeHtml(task.description)}</p>`,
      });

      await Task.updateOne(
        { _id: task._id, reminderClaimedAt: claimTime },
        {
          $set: { reminderSentAt: new Date() },
          $unset: { reminderClaimedAt: 1 },
        }
      );
    } catch (error) {
      await Task.updateOne(
        { _id: task._id, reminderClaimedAt: claimTime },
        { $unset: { reminderClaimedAt: 1 } }
      );
      throw error;
    }
  }
};

export const startDeadlineReminderScheduler = (): NodeJS.Timeout => {
  const run = () => {
    void sendUpcomingTaskReminders().catch((error: unknown) => {
      console.error('Failed to send deadline reminders', error);
    });
  };

  run();
  return setInterval(run, reminderIntervalMs);
};
