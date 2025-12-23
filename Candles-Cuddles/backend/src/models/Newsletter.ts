import { Schema, model, Document } from 'mongoose';

export interface NewsletterDocument extends Document {
  email: string;
  subscribed: boolean;
  subscribedAt: Date;
  unsubscribedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const newsletterSchema = new Schema<NewsletterDocument>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    subscribed: { type: Boolean, default: true },
    subscribedAt: { type: Date, default: Date.now },
    unsubscribedAt: { type: Date },
  },
  { timestamps: true },
);

export const NewsletterModel = model<NewsletterDocument>('Newsletter', newsletterSchema);

