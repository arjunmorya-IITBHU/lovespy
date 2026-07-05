import mongoose, { Schema, Document, model, models } from "mongoose";

export interface IProduct extends Document {
  category: string;
  name: string;
  slug: string;
  description?: string;
  shortDesc?: string;
  price: number;
  comparePrice?: number;
  sku: string;
  stockQty: number;
  isActive: boolean;
  isHamperItem: boolean;
  weightGrams?: number;
  tags: string[];
  ratingAvg: number;
  ratingCount: number;
  image: string;
  trendingOrder?: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema = new Schema(
  {
    category: { type: String, required: true },
    name: { type: String, required: true },
    slug: { type: String, unique: true, required: true },
    description: { type: String },
    shortDesc: { type: String },
    price: { type: Number, required: true },
    comparePrice: { type: Number },
    sku: { type: String, unique: true, required: true },
    stockQty: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    isHamperItem: { type: Boolean, default: false },
    weightGrams: { type: Number },
    tags: { type: [String], default: [] },
    ratingAvg: { type: Number, default: 0.0 },
    ratingCount: { type: Number, default: 0 },
    image: { type: String, required: true },
    trendingOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default models.Product || model<IProduct>("Product", ProductSchema);
