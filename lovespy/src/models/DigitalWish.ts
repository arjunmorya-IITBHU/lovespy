import mongoose, { Schema, Document, model, models } from "mongoose";

export interface IDigitalWish extends Document {
  userId: mongoose.Types.ObjectId;
  orderId?: mongoose.Types.ObjectId;
  recipientName: string;
  senderName: string;
  theme: "birthday" | "anniversary" | "love-letter" | "memory";
  message: string;
  photoUrls: string[];
  videoUrl?: string;
  musicTrack?: string;
  animatedWishType: string;
  shareToken: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DigitalWishSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    orderId: { type: Schema.Types.ObjectId, ref: "Order" },
    recipientName: { type: String, required: true },
    senderName: { type: String, required: true },
    theme: {
      type: String,
      required: true,
      enum: ["birthday", "anniversary", "love-letter", "memory"]
    },
    message: { type: String, required: true },
    photoUrls: { type: [String], default: [] },
    videoUrl: { type: String },
    musicTrack: { type: String, default: "romantic_piano" },
    animatedWishType: { type: String, default: "fireworks" },
    shareToken: { type: String, unique: true, required: true },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default models.DigitalWish || model<IDigitalWish>("DigitalWish", DigitalWishSchema);
