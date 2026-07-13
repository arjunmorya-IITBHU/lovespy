import mongoose, { Schema, Document, model, models } from "mongoose";

export interface IOrder extends Document {
  orderNumber: string;
  userId: mongoose.Types.ObjectId;
  deliveryName: string;
  deliveryPhone: string;
  deliveryLine1: string;
  deliveryLine2?: string;
  deliveryCity: string;
  deliveryState: string;
  deliveryPincode: string;
  status: 'pending' | 'confirmed' | 'packed' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'refunded';
  deliveryType: 'standard' | 'express' | 'midnight';
  deliveryDate: Date;
  deliverySlot: string;
  subtotal: number;
  shippingCharge: number;
  discountAmount: number;
  totalAmount: number;
  couponCode?: string;
  pointsRedeemed: number;
  trackingNumber?: string;
  notes?: string;
  items: any[];
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  razorpaySignature?: string;
  shiprocketOrderId?: string;
  shiprocketShipmentId?: string;
  shiprocketAwb?: string;
  shiprocketCourier?: string;
  shiprocketStatus?: 'Processing' | 'Packed' | 'Shipped' | 'In Transit' | 'Out For Delivery' | 'Delivered';
  shiprocketDispatchDate?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema: Schema = new Schema(
  {
    orderNumber: { type: String, unique: true, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    deliveryName: { type: String, required: true },
    deliveryPhone: { type: String, required: true },
    deliveryLine1: { type: String, required: true },
    deliveryLine2: { type: String },
    deliveryCity: { type: String, required: true },
    deliveryState: { type: String, required: true },
    deliveryPincode: { type: String, required: true },
    status: {
      type: String,
      default: "pending",
      enum: ["pending", "confirmed", "packed", "shipped", "out_for_delivery", "delivered", "cancelled", "refunded"]
    },
    deliveryType: {
      type: String,
      default: "standard",
      enum: ["standard", "express", "midnight"]
    },
    deliveryDate: { type: Date, required: true },
    deliverySlot: { type: String, required: true },
    subtotal: { type: Number, required: true },
    shippingCharge: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    couponCode: { type: String },
    pointsRedeemed: { type: Number, default: 0 },
    trackingNumber: { type: String },
    notes: { type: String },
    items: { type: [Schema.Types.Mixed], default: [] },
    razorpayPaymentId: { type: String },
    razorpayOrderId: { type: String },
    razorpaySignature: { type: String },
    shiprocketOrderId: { type: String },
    shiprocketShipmentId: { type: String },
    shiprocketAwb: { type: String },
    shiprocketCourier: { type: String },
    shiprocketStatus: { type: String, default: "Processing", enum: ["Processing", "Packed", "Shipped", "In Transit", "Out For Delivery", "Delivered"] },
    shiprocketDispatchDate: { type: String },
  },
  { timestamps: true }
);

export default models.Order || model<IOrder>("Order", OrderSchema);
