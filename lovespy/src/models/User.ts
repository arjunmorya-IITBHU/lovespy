import mongoose, { Schema, Document, model, models } from "mongoose";

export interface IUser extends Document {
  name: string;
  email?: string;
  phone: string;
  passwordHash?: string;
  authProvider: "otp" | "google" | "email";
  googleId?: string;
  avatarUrl?: string;
  isVerified: boolean;
  isActive: boolean;
  rewardPoints: number;
  role: "customer" | "admin";
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, default: "" },
    email: { type: String, unique: true, sparse: true },
    phone: { type: String, unique: true, sparse: true },
    passwordHash: { type: String },
    authProvider: { type: String, default: "otp", enum: ["otp", "google", "email"] },
    googleId: { type: String, unique: true, sparse: true },
    avatarUrl: { type: String },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    rewardPoints: { type: Number, default: 0 },
    role: { type: String, default: "customer", enum: ["customer", "admin"] },
  },
  { timestamps: true }
);

export default models.User || model<IUser>("User", UserSchema);
