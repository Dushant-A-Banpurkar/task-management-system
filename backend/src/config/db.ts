import mongoose from 'mongoose';
import { env } from './env';

export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(env.mongoUri);
    const db = mongoose.connection.db;

    if (db && (await db.listCollections({ name: 'users' }, { nameOnly: true }).hasNext())) {
      const userIndexes = await db.collection('users').indexes();
      if (userIndexes.some((index) => index.name === 'username_1')) {
        await db.collection('users').dropIndex('username_1');
        console.log('Removed obsolete users.username_1 index');
      }
    }

    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection failed');
    throw error;
  }
};
