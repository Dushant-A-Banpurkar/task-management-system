import * as dotenv from "dotenv"

dotenv.config();

export const env = {
  port: Number(process.env.PORT ?? 5000),
  mongoUri: process.env.MONGO_URI!,
  jwtSecret: process.env.JWT_SECRET!,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN!,
  adminSetupKey: process.env.ADMIN_SETUP_KEY,
  resendApiKey: process.env.RESEND_API_KEY,
  reminderFromEmail: process.env.REMINDER_FROM_EMAIL,
  renderUrl: process.env.RENDER_URL,
};
