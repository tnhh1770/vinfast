/**
 * Seed dữ liệu vào MongoDB.
 *   npm run seed
 * Cần biến môi trường MONGODB_URI trong .env.local
 */
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import mongoose from "mongoose";

const root = process.cwd();

// nạp .env.local thủ công (không cần dotenv)
for (const file of [".env.local", ".env"]) {
  const p = path.join(root, file);
  if (!fs.existsSync(p)) continue;
  for (const line of fs.readFileSync(p, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("✖ Thiếu MONGODB_URI. Thêm vào .env.local rồi chạy lại.");
  process.exit(1);
}

const read = (file) =>
  JSON.parse(fs.readFileSync(path.join(root, "src/data", file), "utf8"));

const cars = read("cars.json");
const { posts, pages } = read("content.json");

const CAR_ORDER = [
  "new-vinfast-vf8", "vinfast-vf-mpv-7", "limo-green", "vinfast-vf-3",
  "vinfast-vf5", "vinfast-vf6", "vinfast-vf7", "vinfast-vf9",
  "vinfast-ec-van", "minio-green", "herio-green", "nerio-green",
];

const loose = (name, collection) =>
  mongoose.model(name, new mongoose.Schema({}, { strict: false, collection }));

const Car = loose("SeedCar", "cars");
const Post = loose("SeedPost", "posts");
const Page = loose("SeedPage", "pages");

async function main() {
  await mongoose.connect(uri, { dbName: process.env.MONGODB_DB || undefined });
  console.log("→ Đã kết nối:", mongoose.connection.name);

  await Promise.all([
    Car.deleteMany({}),
    Post.deleteMany({}),
    Page.deleteMany({}),
  ]);

  await Car.insertMany(
    cars.map((car) => ({
      ...car,
      order: CAR_ORDER.indexOf(car.slug) < 0 ? 99 : CAR_ORDER.indexOf(car.slug),
    })),
  );
  await Post.insertMany(posts);
  await Page.insertMany(pages);

  await mongoose.connection.collection("cars").createIndex({ slug: 1 }, { unique: true });
  await mongoose.connection.collection("posts").createIndex({ slug: 1 }, { unique: true });
  await mongoose.connection.collection("pages").createIndex({ slug: 1 }, { unique: true });
  await mongoose.connection.collection("leads").createIndex({ createdAt: -1 });

  console.log(`✔ Đã nạp: ${cars.length} xe, ${posts.length} bài viết, ${pages.length} trang.`);
  await mongoose.disconnect();
}

main().catch((error) => {
  console.error("✖ Seed thất bại:", error);
  process.exit(1);
});
