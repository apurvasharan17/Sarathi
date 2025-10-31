import mongoose, { Schema, Document } from 'mongoose';
import type { User as IUser } from '@sarathi/shared';

export interface UserDocument extends Omit<IUser, '_id'>, Document {}

const userSchema = new Schema<UserDocument>(
  {
    phoneE164: { type: String, required: true, unique: true, index: true },
    sarathiId: { type: String, required: true, unique: true, index: true },
    preferredLang: { type: String, enum: ['en', 'hi'], default: 'en' },
    stateCode: { type: String, required: true, length: 2 },
    kycStatus: { type: String, enum: ['none', 'basic'], default: 'none' },
    isAdmin: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

export const UserModel = mongoose.model<UserDocument>('User', userSchema);

