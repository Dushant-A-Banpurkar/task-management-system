import { model, Schema } from 'mongoose';

const adminSetupSchema = new Schema(
  {
    _id: { type: String, required: true },
    state: {
      type: String,
      enum: ['available', 'in_progress', 'completed'],
      required: true,
    },
  },
  { timestamps: true, collection: 'admin_setup' }
);

export const AdminSetup = model('AdminSetup', adminSetupSchema);
