import { Schema, model, models, type Model } from "mongoose";
import type { Lead } from "@/types";

const LeadSchema = new Schema<Lead>(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    phone: { type: String, required: true, trim: true, maxlength: 20, index: true },
    carInterest: { type: String, trim: true, maxlength: 120 },
    message: { type: String, trim: true, maxlength: 1000 },
    source: { type: String, default: "website" },
    path: String,
  },
  { timestamps: true, collection: "leads" },
);

export const LeadModel: Model<Lead> =
  (models.Lead as Model<Lead>) || model<Lead>("Lead", LeadSchema);

export default LeadModel;
