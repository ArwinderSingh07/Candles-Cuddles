import { Schema, model, Document } from 'mongoose';

export interface PasswordResetDocument extends Document {
  email: string;
  otp: string;
  expiresAt: Date;
  used: boolean;
  createdAt: Date;
}

const passwordResetSchema = new Schema<PasswordResetDocument>(
  {
    email: { type: String, required: true, index: true },
    otp: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } },
    used: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// Index for faster lookups
passwordResetSchema.index({ email: 1, used: 1 });
passwordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const PasswordResetModel = model<PasswordResetDocument>('PasswordReset', passwordResetSchema);

