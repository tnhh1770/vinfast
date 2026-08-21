import { Schema, model, models, type Model } from "mongoose";
import type { Car } from "@/types";

const VersionSchema = new Schema(
  { name: String, price: Number },
  { _id: false },
);

const OptionSchema = new Schema(
  { name: String, price: Number, badge: String },
  { _id: false },
);

const PromotionSchema = new Schema(
  { name: String, percent: Number, fixed: Number, badge: String },
  { _id: false },
);

const ColorSchema = new Schema(
  { hex: String, image: String, name: String },
  { _id: false },
);

const CarSchema = new Schema<Car>(
  {
    slug: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    metaTitle: String,
    metaDescription: String,
    sourceUrl: String,
    ogImage: String,
    heroImage: String,
    thumbnail: String,
    colors: [ColorSchema],
    versions: [VersionSchema],
    options: [OptionSchema],
    promotions: [PromotionSchema],
    installmentFrom: { type: Number, default: 0 },
    installmentText: String,
    price: { type: Number, index: true },
    category: { type: String, index: true },
    nedc: String,
    group: { type: String, index: true },
    offers: [String],
    sections: { type: Schema.Types.Mixed, default: {} },
    order: { type: Number, default: 0 },
  },
  { timestamps: true, collection: "cars" },
);

CarSchema.index({ name: "text", category: "text" });

export const CarModel: Model<Car> =
  (models.Car as Model<Car>) || model<Car>("Car", CarSchema);

export default CarModel;
