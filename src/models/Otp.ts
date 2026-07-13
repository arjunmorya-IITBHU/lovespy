import mongoose, { Schema, Document, model, models } from "mongoose";

export interface IOtp extends Document {
  identifier: string; // phone number or email address
  code: string;
  attempts: number;
  expiresAt: Date;
  createdAt: Date;
}

const OtpSchema: Schema = new Schema(
  {
    identifier: { type: String, required: true, index: true },
    code: { type: String, required: true },
    attempts: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true }
  },
  { timestamps: true }
);

// TTL index to automatically remove expired OTPs from the collection after 5 minutes
OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default models.Otp || model<IOtp>("Otp", OtpSchema);
