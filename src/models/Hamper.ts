import mongoose, { Schema, Document, model, models } from "mongoose";

export interface IHamper extends Document {
  userId?: mongoose.Types.ObjectId;
  boxId: string;
  boxName: string;
  basePrice: number;
  items: Array<{
    productId: mongoose.Types.ObjectId;
    name: string;
    price: number;
    qty: number;
  }>;
  personalization: {
    letter?: string;
    card?: string;
    photoUrl?: string;
    voiceQrUrl?: string;
    nameTag?: string;
    decorations: {
      fairyLights: boolean;
      flowers: boolean;
      stickers: boolean;
      ribbon: boolean;
      premiumWrapping: boolean;
    };
  };
  totalPrice: number;
  status: "draft" | "ordered";
  createdAt: Date;
  updatedAt: Date;
}

const HamperSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    boxId: { type: String, required: true },
    boxName: { type: String, required: true },
    basePrice: { type: Number, required: true },
    items: [
      {
        productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        qty: { type: Number, default: 1 }
      }
    ],
    personalization: {
      letter: { type: String },
      card: { type: String },
      photoUrl: { type: String },
      voiceQrUrl: { type: String },
      nameTag: { type: String },
      decorations: {
        fairyLights: { type: Boolean, default: false },
        flowers: { type: Boolean, default: false },
        stickers: { type: Boolean, default: false },
        ribbon: { type: Boolean, default: false },
        premiumWrapping: { type: Boolean, default: false },
      }
    },
    totalPrice: { type: Number, required: true },
    status: { type: String, default: "draft", enum: ["draft", "ordered"] }
  },
  { timestamps: true }
);

export default models.Hamper || model<IHamper>("Hamper", HamperSchema);
