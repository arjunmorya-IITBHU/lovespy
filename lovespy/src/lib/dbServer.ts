import mongoose from "mongoose";
import UserModel from "@/models/User";
import ProductModel from "@/models/Product";
import OrderModel from "@/models/Order";
import CouponModel from "@/models/Coupon";
import SettingsModel from "@/models/Settings";

import {
  createOrder as createOrderClient,
  updateOrderDetails as updateOrderDetailsClient,
  defaultStoreSettings,
  StoreSettings,
  Order
} from "./db";

const MONGODB_URI = process.env.MONGODB_URI || "";

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    if (!MONGODB_URI || MONGODB_URI.includes("username:password")) {
      console.warn("MongoDB connection string missing or placeholder. Operating in simulated seed database mode.");
      return null;
    }
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    console.error("MongoDB connection failed, falling back to simulated seed database mode:", e);
    cached.promise = null;
    return null;
  }

  return cached.conn;
}

export const getStoreSettings = async (): Promise<StoreSettings> => {
  const conn = await dbConnect();
  if (conn) {
    try {
      let settings = await SettingsModel.findOne();
      if (!settings) {
        settings = await SettingsModel.create(defaultStoreSettings);
      }
      return settings.toObject();
    } catch (err) {
      console.error("Failed to load settings from MongoDB:", err);
    }
  }
  return defaultStoreSettings;
};

export const setStoreSettings = async (newSettings: StoreSettings): Promise<void> => {
  const conn = await dbConnect();
  if (conn) {
    try {
      let settings = await SettingsModel.findOne();
      if (settings) {
        Object.assign(settings, newSettings);
        await settings.save();
      } else {
        await SettingsModel.create(newSettings);
      }
    } catch (err) {
      console.error("Failed to save settings to MongoDB:", err);
    }
  }
};

export const createOrder = (orderData: any) => {
  // Call the client-side/mock function to update local state and get standard formatted order
  const newOrder = createOrderClient(orderData);

  // Save to MongoDB asynchronously (only if DB is connected)
  dbConnect().then((conn) => {
    if (conn) {
      const uId = mongoose.Types.ObjectId.isValid(newOrder.user_id)
        ? new mongoose.Types.ObjectId(newOrder.user_id)
        : new mongoose.Types.ObjectId(); // generated fallback

      OrderModel.create({
        orderNumber: newOrder.orderNumber,
        userId: uId,
        deliveryName: newOrder.delivery_name,
        deliveryPhone: newOrder.delivery_phone,
        deliveryLine1: newOrder.delivery_line1,
        deliveryLine2: newOrder.delivery_line2 || "",
        deliveryCity: newOrder.delivery_city,
        deliveryState: newOrder.delivery_state,
        deliveryPincode: newOrder.delivery_pincode,
        status: "confirmed",
        deliveryType: newOrder.delivery_type || "standard",
        deliveryDate: newOrder.delivery_date,
        deliverySlot: newOrder.delivery_slot || "Standard Slot",
        subtotal: newOrder.subtotal,
        shippingCharge: newOrder.shipping_charge || 0,
        discountAmount: newOrder.discount_amount || 0,
        totalAmount: newOrder.total_amount || newOrder.total || 0,
        couponCode: newOrder.coupon_code || "",
        pointsRedeemed: newOrder.points_redeemed || 0,
        items: newOrder.items,
        razorpayOrderId: newOrder.razorpayOrderId || "",
        razorpayPaymentId: newOrder.razorpayPaymentId || "",
        razorpaySignature: newOrder.razorpaySignature || "",
        shiprocketOrderId: newOrder.shiprocketOrderId || "",
        shiprocketShipmentId: newOrder.shiprocketShipmentId || ""
      }).then(() => {
        console.log(`[MongoDB] Successfully saved order ${newOrder.orderNumber}`);
      }).catch((err) => {
        console.error("Failed to create Order in MongoDB:", err);
      });
    }
  });

  return newOrder;
};

export const updateOrderDetails = async (id: string, updates: Partial<Order>) => {
  // Call the client-side/mock update
  await updateOrderDetailsClient(id, updates);

  const conn = await dbConnect();
  if (conn) {
    try {
      const isMongoId = id.match(/^[0-9a-fA-F]{24}$/);
      const query = isMongoId ? { _id: id } : { orderNumber: id };
      const orderDoc = await OrderModel.findOne(query);
      if (orderDoc) {
        Object.assign(orderDoc, updates);
        await orderDoc.save();
        return true;
      }
    } catch (err) {
      console.error("Failed to update order details in MongoDB:", err);
    }
  }
  return false;
};

// Re-export all client-safe methods and mock databases
export {
  getCategories,
  getProducts,
  setProducts,
  getHamperBoxes,
  setHamperBoxes,
  getOrders,
  setOrders,
  getSurpriseOrders,
  setSurpriseOrders,
  getOffers,
  setOffers,
  getHeroBanner,
  setHeroBanner,
  getSeasonalCampaigns,
  setSeasonalCampaigns,
  getShowcaseMedia,
  setShowcaseMedia,
  getAddons,
  setAddons,
  getCoupons,
  setCoupons,
  getCustomers,
  setCustomers,
  updateOrderStatus,
  createSurpriseOrder,
  updateSurpriseOrderStatus,
  getEffectiveStock
} from "./db";

// Re-export all type definitions for full type safety
export type {
  ProductType,
  Product,
  Order,
  Category,
  HamperBox,
  SurpriseOrderType,
  OfferItem,
  HeroSettings,
  SeasonalCampaign,
  ShowcaseMedia,
  AddonItem,
  CouponItem,
  CustomerType,
  StoreSettings
} from "./db";
