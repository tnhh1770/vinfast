import mongoose, { type Mongoose } from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI ?? "";

/**
 * Trang web chạy được ở 2 chế độ:
 *  - Có MONGODB_URI  -> đọc/ghi qua Mongoose.
 *  - Không có URI    -> fallback sang seed JSON tĩnh trong `src/data`.
 * Nhờ vậy `next build` không bao giờ bị chặn vì thiếu database.
 */
export const hasDatabase = Boolean(MONGODB_URI);

interface MongooseCache {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

declare global {
  var __mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache =
  global.__mongooseCache ?? (global.__mongooseCache = { conn: null, promise: null });

export async function connectToDatabase(): Promise<Mongoose | null> {
  if (!MONGODB_URI) return null;
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    mongoose.set("strictQuery", true);
    cached.promise = mongoose.connect(MONGODB_URI, {
      dbName: process.env.MONGODB_DB || undefined,
      bufferCommands: false,
      serverSelectionTimeoutMS: 8000,
      maxPoolSize: 10,
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    console.error("[mongodb] Không kết nối được, dùng dữ liệu tĩnh.", error);
    return null;
  }

  return cached.conn;
}

export default connectToDatabase;
