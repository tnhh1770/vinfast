import { Schema, model, models, type Model } from "mongoose";
import type { Lead } from "@/types";

const NoteSchema = new Schema(
  {
    content: { type: String, required: true },
    author: { type: String, default: "Admin" },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const LeadSchema = new Schema<Lead>(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    phone: { type: String, required: true, trim: true, maxlength: 20, index: true },
    carInterest: { type: String, trim: true, maxlength: 120 },
    message: { type: String, trim: true, maxlength: 1000 },
    source: { type: String, default: "website" },
    path: String,
    status: {
      type: String,
      enum: ["new", "contacted", "test_drive", "negotiating", "won", "lost"],
      default: "new",
      index: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    assignedTo: { type: String, default: "" },
    notes: [NoteSchema],
  },
  { timestamps: true, collection: "leads" },
);

export const LeadModel: Model<Lead> =
  (models.Lead as Model<Lead>) || model<Lead>("Lead", LeadSchema);

export default LeadModel;
