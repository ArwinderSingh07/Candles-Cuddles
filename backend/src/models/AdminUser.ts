import { Schema, model, Document } from 'mongoose';

export interface AdminUserDocument extends Document {
  email: string;
  passwordHash: string;
  role: 'admin' | 'staff';
}

const adminUserSchema = new Schema<AdminUserDocument>(
  {
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['admin', 'staff'], default: 'staff' },
  },
  { timestamps: true },
);

export const AdminUserModel = model<AdminUserDocument>('AdminUser', adminUserSchema);

