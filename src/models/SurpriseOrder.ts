import mongoose, { Schema, Document, model, models } from "mongoose";

export interface ISurpriseOrder extends Document {
  orderNumber: string;
  senderName: string;
  receiverName: string;
  mobileNumber: string;
  whatsappNumber: string;
  email: string;
  photos: string[];
  videos: string[];
  audio?: string;
  themeRequest: string;
  customThemeIdea?: string;
  musicRequest?: {
    songName?: string;
    songUrl?: string;
  };
  designInstructions?: string;
  messages: {
    main?: string;
    loveLetter?: string;
    birthdayWish?: string;
    anniversaryWish?: string;
  };
  paymentStatus: 'paid' | 'pending';
  orderStatus: 'New Order' | 'In Progress' | 'Completed' | 'Delivered';
  price: number;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  razorpaySignature?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SurpriseOrderSchema: Schema = new Schema(
  {
    orderNumber: { type: String, unique: true, required: true },
    senderName: { type: String, required: true },
    receiverName: { type: String, required: true },
    mobileNumber: { type: String, required: true },
    whatsappNumber: { type: String, required: true },
    email: { type: String, required: true },
    photos: { type: [String], default: [] },
    videos: { type: [String], default: [] },
    audio: { type: String },
    themeRequest: { type: String, required: true },
    customThemeIdea: { type: String },
    musicRequest: {
      songName: { type: String },
      songUrl: { type: String }
    },
    designInstructions: { type: String },
    messages: {
      main: { type: String },
      loveLetter: { type: String },
      birthdayWish: { type: String },
      anniversaryWish: { type: String }
    },
    paymentStatus: {
      type: String,
      default: "paid",
      enum: ["paid", "pending"]
    },
    orderStatus: {
      type: String,
      default: "New Order",
      enum: ["New Order", "In Progress", "Completed", "Delivered"]
    },
    price: { type: Number, default: 299 },
    razorpayPaymentId: { type: String },
    razorpayOrderId: { type: String },
    razorpaySignature: { type: String }
  },
  { timestamps: true }
);

export default models.SurpriseOrder || model<ISurpriseOrder>("SurpriseOrder", SurpriseOrderSchema);
