import mongoose, { Schema, Document, model, models } from "mongoose";

export interface ICoupon extends Document {
  code: string;
  description?: string;
  type: "percent" | "flat" | "free_shipping";
  value: number;
  minOrderValue: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  validFrom?: Date;
  validUntil?: Date;
  isActive: boolean;
  createdAt: Date;
}

const CouponSchema: Schema = new Schema(
  {
    code: { type: String, unique: true, required: true, uppercase: true },
    description: { type: String },
    type: { type: String, required: true, enum: ["percent", "flat", "free_shipping"] },
    value: { type: Number, required: true },
    minOrderValue: { type: Number, default: 0 },
    maxDiscount: { type: Number },
    usageLimit: { type: Number },
    usedCount: { type: Number, default: 0 },
    validFrom: { type: Date },
    validUntil: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default models.Coupon || model<ICoupon>("Coupon", CouponSchema);
