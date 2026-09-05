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

async function main() {
  console.log("[seed:crm] Đang kết nối MongoDB:", MONGODB_URI);
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;

  // 1. Seed Users Collection
  const usersCol = db.collection("users");
  await usersCol.deleteMany({});
  await usersCol.insertMany([
    {
      email: "admin@vinfastdanang.net",
      passwordHash: hashPassword("admin123"),
      name: "Quản trị viên VinFast Đà Nẵng",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      email: "sales@vinfastdanang.net",
      passwordHash: hashPassword("sales123"),
      name: "Trần Văn Nam (Sales Lead)",
      role: "sales",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
  console.log("[seed:crm] ✓ Đã seed 2 tài khoản quản trị/sales vào DB");

  // 2. Seed Deals Collection
  const dealsCol = db.collection("deals");
  await dealsCol.deleteMany({});
  await dealsCol.insertMany([
    {
      dealId: "#1589155",
      ownerName: "Nguyễn Văn Hùng",
      creationDate: "05/09/2026",
      carType: "VinFast VF 8 All New",
      returnDate: "15/09/2026",
      paymentType: "Card",
      totalPrice: 1090000000,
      status: "Completed",
      createdAt: new Date(),
    },
    {
      dealId: "#1589156",
      ownerName: "Trần Thị Mai",
      creationDate: "04/09/2026",
      carType: "VinFast VF MPV 7",
      returnDate: "12/09/2026",
      paymentType: "Cash",
      totalPrice: 850000000,
      status: "Signed",
      createdAt: new Date(),
    },
    {
      dealId: "#1589157",
      ownerName: "Lê Hoàng Nam",
      creationDate: "03/09/2026",
      carType: "VinFast VF 3 Mini",
      returnDate: "10/09/2026",
      paymentType: "Cash",
      totalPrice: 240000000,
      status: "Pending",
      createdAt: new Date(),
    },
    {
      dealId: "#1589158",
      ownerName: "Phạm Minh Đức",
      creationDate: "02/09/2026",
      carType: "VinFast VF 9 Luxury",
      returnDate: "20/09/2026",
      paymentType: "Card",
      totalPrice: 1560000000,
      status: "Completed",
      createdAt: new Date(),
    },
  ]);
  console.log("[seed:crm] ✓ Đã seed danh sách Hợp đồng Deals thật vào DB");

  // 3. Seed Trackings Collection
  const trackingsCol = db.collection("trackings");
  await trackingsCol.deleteMany({});
  await trackingsCol.insertMany([
    {
      carName: "VinFast VF 8 All New",
      customerName: "Nguyễn Văn Hùng",
      driverName: "Nguyễn Văn Tuấn (Tài xế)",
      routeName: "Showroom 115 Nguyễn Văn Linh → Hòa Khánh, Đà Nẵng",
      locationAddress: "Đường Nguyễn Lương Bằng, Q. Liên Chiểu, Đà Nẵng",
      timeLeftMin: 35,
      routePoints: ["Nguyễn Văn Linh", "Điện Biên Phủ", "Tôn Đức Thắng", "Nguyễn Lương Bằng"],
      routePictures: ["/uploads/2026/05/vinhxdcom_vf_8_the_he_moi.webp"],
      status: "In Transit",
      carImage: "/uploads/2026/05/vinhxdcom_vf_8_the_he_moi.webp",
      createdAt: new Date(),
    },
    {
      carName: "VinFast VF MPV 7",
      customerName: "Trần Thị Mai",
      driverName: "Lê Văn An (Tài xế)",
      routeName: "Showroom Đà Nẵng → Ngũ Hành Sơn",
      locationAddress: "Đường Võ Nguyên Giáp, Q. Ngũ Hành Sơn",
      timeLeftMin: 15,
      routePoints: ["Nguyễn Văn Linh", "Cầu Rồng", "Võ Nguyên Giáp"],
      routePictures: ["/uploads/2026/02/vinhxdcom_Homepage_MPV7.webp"],
      status: "In Transit",
      carImage: "/uploads/2026/02/vinhxdcom_Homepage_MPV7.webp",
      createdAt: new Date(),
    },
  ]);
  console.log("[seed:crm] ✓ Đã seed dữ liệu Theo dõi Vận chuyển GPS thật vào DB");

  // 4. Seed Active Bids Collection
  const bidsCol = db.collection("bids");
  await bidsCol.deleteMany({});
  await bidsCol.insertMany([
    {
      carName: "VinFast VF 8 Plus Dual Motor",
      location: "Đại lý Đà Nẵng",
      style: "D-SUV Electric",
      kaos: "920 KAOS",
      speed: "200 km/h: 480km/sạc",
      startingPrice: 990000000,
      currentBid: 1090000000,
      color: "Light Green",
      rentalPeriodMonths: 12,
      image: "/uploads/2026/05/vinhxdcom_vf_8_the_he_moi.webp",
      status: "Active",
      createdAt: new Date(),
    },
    {
      carName: "VinFast VF MPV 7 Executive",
      location: "Đại lý Đà Nẵng",
      style: "MPV 7 Chỗ",
      kaos: "850 KAOS",
      speed: "180 km/h: 450km/sạc",
      startingPrice: 780000000,
      currentBid: 850000000,
      color: "Blue",
      rentalPeriodMonths: 24,
      image: "/uploads/2026/02/vinhxdcom_Homepage_MPV7.webp",
      status: "Active",
      createdAt: new Date(),
    },
    {
      carName: "VinFast VF 3 Mini Electric",
      location: "Đại lý Đà Nẵng",
      style: "MiniCar",
      kaos: "450 KAOS",
      speed: "110 km/h: 215km/sạc",
      startingPrice: 220000000,
      currentBid: 240000000,
      color: "Yellow",
      rentalPeriodMonths: 6,
      image: "/uploads/2026/02/vinhxdcom_VF3.webp",
      status: "Active",
      createdAt: new Date(),
    },
  ]);
  console.log("[seed:crm] ✓ Đã seed dữ liệu Đấu giá Báo giá Bids thật vào DB");

  // 5. Seed Transactions Collection
  const txCol = db.collection("transactions");
  await txCol.deleteMany({});
  await txCol.insertMany([
    {
      transactionId: "#TX-1589155",
      ownerName: "Nguyễn Văn Hùng",
      creationDate: "05/09/2026",
      carType: "VinFast VF 8",
      date: "05/09/2026",
      totalMoney: 1090000000,
      paymentMethod: "Card",
      status: "Paid",
      createdAt: new Date(),
    },
    {
      transactionId: "#TX-1589156",
      ownerName: "Trần Thị Mai",
      creationDate: "04/09/2026",
      carType: "VinFast VF MPV 7",
      date: "04/09/2026",
      totalMoney: 850000000,
      paymentMethod: "Cash",
      status: "Pending",
      createdAt: new Date(),
    },
    {
      transactionId: "#TX-1589157",
      ownerName: "Lê Hoàng Nam",
      creationDate: "03/09/2026",
      carType: "VinFast VF 3",
      date: "03/09/2026",
      totalMoney: 240000000,
      paymentMethod: "Card",
      status: "Paid",
      createdAt: new Date(),
    },
  ]);
  console.log("[seed:crm] ✓ Đã seed dữ liệu Giao dịch Tài chính thật vào DB");

  // 6. Seed Calendar Events Collection
  const calCol = db.collection("calendar_events");
  await calCol.deleteMany({});
  await calCol.insertMany([
    {
      title: "Lái thử VinFast VF 8 All New",
      carName: "VinFast VF 8",
      customerName: "Nguyễn Văn Hùng",
      date: "2026-09-06",
      timeSlot: "09:00 AM - 11:00 AM",
      type: "TestDrive",
      createdAt: new Date(),
    },
    {
      title: "Hẹn bàn giao xe VF MPV 7",
      carName: "VinFast VF MPV 7",
      customerName: "Trần Thị Mai",
      date: "2026-09-07",
      timeSlot: "02:00 PM - 04:00 PM",
      type: "Delivery",
      createdAt: new Date(),
    },
  ]);
  console.log("[seed:crm] ✓ Đã seed Lịch hẹn Lái thử & Bàn giao thật vào DB");

  // 7. Seed CRM Leads Collection
  const leadsCol = db.collection("leads");
  await leadsCol.deleteMany({});
  await leadsCol.insertMany([
    {
      name: "Nguyễn Văn An",
      phone: "0905123456",
      carInterest: "VinFast VF 3",
      message: "Cần tư vấn gói vay 80% lãi suất ưu đãi đại lý Đà Nẵng",
      source: "Trang Bảng Giá",
      path: "/bang-gia-xe/",
      status: "new",
      priority: "high",
      assignedTo: "Trần Văn Nam",
      notes: [
        { content: "Khách gọi đăng ký qua form bảng giá", author: "Hệ thống", createdAt: new Date() },
      ],
      createdAt: new Date(),
    },
    {
      name: "Trần Thị Ngọc",
      phone: "0914987654",
      carInterest: "VinFast VF 8 All New",
      message: "Muốn đặt lịch lái thử tận nhà vào Thứ 7",
      source: "Đăng ký lái thử",
      path: "/dang-ky-lai-thu/",
      status: "test_drive",
      priority: "urgent",
      assignedTo: "Quản trị viên VinFast Đà Nẵng",
      notes: [
        { content: "Đã liên hệ xác nhận địa chỉ nhận xe lái thử", author: "Sales Lead", createdAt: new Date() },
      ],
      createdAt: new Date(Date.now() - 3600000 * 24),
    },
    {
      name: "Phạm Quốc Bảo",
      phone: "0988112233",
      carInterest: "VinFast VF MPV 7",
      message: "Hỏi chương trình khuyến mãi lệ phí trước bạ và quà tặng",
      source: "Trang Chủ",
      path: "/",
      status: "negotiating",
      priority: "medium",
      assignedTo: "Trần Văn Nam",
      createdAt: new Date(Date.now() - 3600000 * 48),
    },
  ]);
  console.log("[seed:crm] ✓ Đã seed Khách hàng Tiềm năng (Leads) thật vào DB");

  // 8. Seed Settings Collection
  const settingsCol = db.collection("settings");
  await settingsCol.deleteMany({});
  await settingsCol.insertMany([
    {
      currency: "VND",
      language: "Vietnamese",
      address: "115 Nguyễn Văn Linh, Phường Hải Châu, Đà Nẵng",
      state: "Đà Nẵng",
      emailNotification: true,
      smsNotification: true,
      updatedAt: new Date(),
    },
  ]);
  console.log("[seed:crm] ✓ Đã seed Cấu hình Hệ thống CRM thật vào DB");

  await mongoose.disconnect();
  console.log("[seed:crm] 🎉 HOÀN TẤT SEED TOÀN BỘ DỮ LIỆU THẬT VÀO MONGODB!");
}

main().catch((err) => {
  console.error("[seed:crm] Lỗi:", err);
  process.exit(1);
});
