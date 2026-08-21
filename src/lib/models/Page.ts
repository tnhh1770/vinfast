import { Schema, model, models, type Model } from "mongoose";
import type { StaticPage } from "@/types";

const BlockSchema = new Schema({}, { _id: false, strict: false });

const PageSchema = new Schema<StaticPage>(
  {
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    updatedAt: String,
    blocks: [BlockSchema],
  },
  { collection: "pages" },
);

export const PageModel: Model<StaticPage> =
  (models.Page as Model<StaticPage>) || model<StaticPage>("Page", PageSchema);

export default PageModel;
