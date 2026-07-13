import mongoose, { Schema, Document, model, models } from "mongoose";

export interface IKeyValueStore extends Document {
  key: string;
  value: any;
  createdAt: Date;
  updatedAt: Date;
}

const KeyValueStoreSchema: Schema = new Schema(
  {
    key: { type: String, unique: true, required: true },
    value: { type: Schema.Types.Mixed, required: true }
  },
  { timestamps: true }
);

export default models.KeyValueStore || model<IKeyValueStore>("KeyValueStore", KeyValueStoreSchema);
