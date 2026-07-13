import mongoose, { Schema, Document, model, models } from "mongoose";

export interface ISettings extends Document {
  deliveryCharge: number;
  freeShippingThreshold: number;
  freeShippingEnabled: boolean;
  shiprocketEmail?: string;
  shiprocketPassword?: string;
  shiprocketToken?: string;
  twilioAccountSid?: string;
  twilioAuthToken?: string;
  twilioFromNumber?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPass?: string;
  smtpFrom?: string;
  updatedAt: Date;
}

const SettingsSchema: Schema = new Schema(
  {
    deliveryCharge: { type: Number, default: 150 },
    freeShippingThreshold: { type: Number, default: 2999 },
    freeShippingEnabled: { type: Boolean, default: true },
    shiprocketEmail: { type: String, default: "" },
    shiprocketPassword: { type: String, default: "" },
    shiprocketToken: { type: String, default: "" },
    twilioAccountSid: { type: String, default: "" },
    twilioAuthToken: { type: String, default: "" },
    twilioFromNumber: { type: String, default: "" },
    smtpHost: { type: String, default: "" },
    smtpPort: { type: Number, default: 587 },
    smtpUser: { type: String, default: "" },
    smtpPass: { type: String, default: "" },
    smtpFrom: { type: String, default: "" }
  },
  { timestamps: true }
);

export default models.Settings || model<ISettings>("Settings", SettingsSchema);
