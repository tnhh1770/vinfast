import { Schema, model, models, type Model } from "mongoose";
import type { Post } from "@/types";

const BlockSchema = new Schema({}, { _id: false, strict: false });

const PostSchema = new Schema<Post>(
  {
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    excerpt: String,
    coverImage: String,
    publishedAt: { type: String, index: true },
    updatedAt: String,
    category: String,
    categorySlug: { type: String, index: true },
    blocks: [BlockSchema],
  },
  { collection: "posts" },
);

export const PostModel: Model<Post> =
  (models.Post as Model<Post>) || model<Post>("Post", PostSchema);

export default PostModel;
