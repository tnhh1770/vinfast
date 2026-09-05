import mongoose from "mongoose";
import crypto, { webcrypto } from "crypto";

if (!globalThis.crypto) {
  globalThis.crypto = webcrypto;
}

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/vinfast-danang";
// Phải trùng PASSWORD_SECRET trong src/lib/auth.ts thì hash mới khớp lúc đăng nhập.
const SECRET_KEY = process.env.PASSWORD_SECRET || "vinfast-danang-crm-secret-key-2026";

function hashPassword(password) {
  return crypto
    .createHmac("sha256", SECRET_KEY)
    .update(password)
    .digest("hex");
}

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, enum: ["admin", "sales"], default: "admin" },
  },
  { timestamps: true, collection: "users" }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);

async function main() {
  console.log("[seed:admin] Kết nối MongoDB:", MONGODB_URI);
  await mongoose.connect(MONGODB_URI);

  const email = "admin@vinfastdanang.net";
  const rawPassword = "admin123";
  const passwordHash = hashPassword(rawPassword);

  const existing = await User.findOne({ email });

  if (existing) {
    existing.passwordHash = passwordHash;
    existing.name = "Quản trị viên VinFast";
    existing.role = "admin";
    await existing.save();
    console.log(`[seed:admin] Đã cập nhật mật khẩu cho tài khoản ${email}`);
  } else {
    await User.create({
      email,
      passwordHash,
      name: "Quản trị viên VinFast",
      role: "admin",
    });
    console.log(`[seed:admin] Đã tạo thành công tài khoản admin mới trong DB: ${email} (Mật khẩu: ${rawPassword})`);
  }

  await mongoose.disconnect();
  console.log("[seed:admin] Hoàn tất!");
}

main().catch((err) => {
  console.error("[seed:admin] Lỗi:", err);
  process.exit(1);
});
