"use client";

import { useState } from "react";
import { Terminal, Send, RefreshCw, Copy, Code, Server } from "lucide-react";

interface EndpointDef {
  name: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  url: string;
  category:
    | "Cars"
    | "Deals"
    | "Bids"
    | "Transactions"
    | "Calendar"
    | "Tracking"
    | "Settings"
    | "Stats"
    | "Leads"
    | "Posts"
    | "Users"
    | "Search";
  description: string;
  sampleBody?: object;
}

/** Khoá nhóm giữ tiếng Anh cho khớp tên endpoint; chỉ nhãn hiển thị là tiếng Việt. */
const CATEGORY_LABEL: Record<EndpointDef["category"], string> = {
  Cars: "Xe",
  Deals: "Hợp đồng",
  Bids: "Đấu giá",
  Transactions: "Giao dịch",
  Calendar: "Lịch hẹn",
  Tracking: "Theo dõi giao xe",
  Settings: "Cài đặt",
  Stats: "Báo cáo",
  Leads: "Khách hàng",
  Posts: "Bài viết",
  Users: "Người dùng",
  Search: "Tìm kiếm",
};

const ENDPOINTS: EndpointDef[] = [
  // Cars
  {
    name: "Lấy danh sách tất cả xe",
    method: "GET",
    url: "/api/admin/cars/",
    category: "Cars",
    description: "Truy vấn danh sách toàn bộ các dòng xe VinFast từ MongoDB collection 'cars'.",
  },
  {
    name: "Tạo xe mới vào MongoDB",
    method: "POST",
    url: "/api/admin/cars/",
    category: "Cars",
    description: "Thêm dòng xe VinFast mới vào CSDL.",
    sampleBody: {
      name: "VinFast VF Wild API",
      slug: "vinfast-vf-wild-api",
      category: "Pickup Electric",
      price: 1200000000,
      nedc: "500 km/sạc",
      group: "xe-du-lich",
      heroImage: "/uploads/vf8.jpg",
    },
  },
  {
    name: "Cập nhật dòng xe theo ID/Slug",
    method: "PUT",
    url: "/api/admin/cars/vinfast-vf-3/",
    category: "Cars",
    description: "Cập nhật giá bán, thông số kỹ thuật xe.",
    sampleBody: {
      price: 310000000,
      nedc: "360 km/sạc",
    },
  },
  {
    name: "Xóa dòng xe khỏi MongoDB",
    method: "DELETE",
    url: "/api/admin/cars/vinfast-vf-wild-api/",
    category: "Cars",
    description: "Xóa bản ghi dòng xe khỏi database.",
  },

  // Deals
  {
    name: "Lấy danh sách Hợp Đồng Deals",
    method: "GET",
    url: "/api/admin/deals/",
    category: "Deals",
    description: "Lấy danh sách tất cả hợp đồng đặt cọc xe.",
  },
  {
    name: "Tạo Hợp Đồng mới",
    method: "POST",
    url: "/api/admin/deals/",
    category: "Deals",
    description: "Tạo bản ghi hợp đồng mới cho khách hàng.",
    sampleBody: {
      dealId: `#DEAL-${Math.floor(1000 + Math.random() * 9000)}`,
      ownerName: "Phạm Văn C",
      creationDate: "05/09/2026",
      carType: "VinFast VF 9",
      returnDate: "20/09/2026",
      paymentType: "Transfer",
      totalPrice: 1499000000,
    },
  },

  // Active Bids
  {
    name: "Lấy danh sách Đấu Giá Bids",
    method: "GET",
    url: "/api/admin/bids/",
    category: "Bids",
    description: "Danh sách xe đang mở sàn đấu giá báo giá.",
  },
  {
    name: "Tạo Phiên Đấu Giá mới",
    method: "POST",
    url: "/api/admin/bids/",
    category: "Bids",
    description: "Mở phiên đấu giá xe VinFast.",
    sampleBody: {
      carName: "VinFast VF 7 Plus",
      currentBid: 789000000,
      image: "/uploads/vf8.jpg",
      location: "Đà Nẵng",
      style: "VF Electric",
      bidder: "Lê Thị D",
    },
  },

  // Transactions
  {
    name: "Lấy danh sách Giao Dịch",
    method: "GET",
    url: "/api/admin/transactions/",
    category: "Transactions",
    description: "Nhật ký giao dịch chuyển khoản & thanh toán.",
  },

  // Calendar
  {
    name: "Lấy danh sách Lịch Hẹn",
    method: "GET",
    url: "/api/admin/calendar/",
    category: "Calendar",
    description: "Lịch hẹn lái thử và tư vấn xe.",
  },

  // Tracking
  {
    name: "Lấy danh sách Tracking Leads",
    method: "GET",
    url: "/api/admin/tracking/",
    category: "Tracking",
    description: "Trạng thái giao xe và khách hàng lead.",
  },

  // Settings
  {
    name: "Lấy Cấu Hình CRM",
    method: "GET",
    url: "/api/admin/settings/",
    category: "Settings",
    description: "Cấu hình chung hệ thống CRM từ MongoDB.",
  },

  // Stats
  {
    name: "Tổng quan CRM (Dashboard)",
    method: "GET",
    url: "/api/admin/stats/overview/",
    category: "Stats",
    description: "Số lượng xe / lead / hợp đồng, doanh thu, phễu lead và hoạt động gần đây — tính từ CSDL.",
  },
  {
    name: "Báo cáo phân tích",
    method: "GET",
    url: "/api/admin/stats/analytics/",
    category: "Stats",
    description: "Lead & doanh thu theo tháng, phân khúc xe, nguồn lead, dòng xe được quan tâm.",
  },

  // Leads
  {
    name: "Danh sách khách hàng tiềm năng",
    method: "GET",
    url: "/api/admin/leads/?limit=20",
    category: "Leads",
    description: "Hỗ trợ lọc q / status / priority / assignedTo và phân trang page, limit.",
  },
  {
    name: "Tạo lead thủ công",
    method: "POST",
    url: "/api/admin/leads/",
    category: "Leads",
    description: "Thêm khách hàng do nhân viên nhập tay vào phễu CRM.",
    sampleBody: {
      name: "Nguyễn Văn Khách",
      phone: "0905000111",
      carInterest: "VinFast VF 6",
      source: "Gọi điện trực tiếp",
      priority: "high",
    },
  },
  {
    name: "Xuất lead ra CSV",
    method: "GET",
    url: "/api/admin/leads/export/",
    category: "Leads",
    description: "Tải toàn bộ lead dạng CSV (UTF-8 BOM, mở được bằng Excel).",
  },

  // Posts
  {
    name: "Danh sách bài viết",
    method: "GET",
    url: "/api/admin/posts/",
    category: "Posts",
    description: "Toàn bộ bài viết đang xuất bản trên website.",
  },
  {
    name: "Đăng bài viết mới",
    method: "POST",
    url: "/api/admin/posts/",
    category: "Posts",
    description: "Tự sinh slug tiếng Việt không dấu nếu không truyền slug.",
    sampleBody: {
      title: "VinFast ưu đãi tháng mới cho khách Đà Nẵng",
      excerpt: "Tổng hợp chương trình ưu đãi đang áp dụng.",
      category: "Khuyến mãi",
      content: "Đoạn mở đầu.\n\nĐoạn tiếp theo.",
    },
  },

  // Users
  {
    name: "Danh sách tài khoản",
    method: "GET",
    url: "/api/admin/users/",
    category: "Users",
    description: "Không bao giờ trả về passwordHash.",
  },

  // Search
  {
    name: "Tìm kiếm toàn hệ thống",
    method: "GET",
    url: "/api/admin/search/?q=VF%208",
    category: "Search",
    description: "Tra cứu đồng thời xe, khách hàng, hợp đồng và giao dịch trong MongoDB.",
  },
];

export default function ApiConsolePage() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointDef>(ENDPOINTS[0]);
  const [customUrl, setCustomUrl] = useState(selectedEndpoint.url);
  const [customMethod, setCustomMethod] = useState(selectedEndpoint.method);
  const [requestBody, setRequestBody] = useState(
    selectedEndpoint.sampleBody ? JSON.stringify(selectedEndpoint.sampleBody, null, 2) : ""
  );

  const [loading, setLoading] = useState(false);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseData, setResponseData] = useState<string>("");
  const [responseTime, setResponseTime] = useState<number | null>(null);

  const handleSelectEndpoint = (ep: EndpointDef) => {
    setSelectedEndpoint(ep);
    setCustomUrl(ep.url);
    setCustomMethod(ep.method);
    setRequestBody(ep.sampleBody ? JSON.stringify(ep.sampleBody, null, 2) : "");
  };

  const handleExecute = async () => {
    setLoading(true);
    setResponseStatus(null);
    setResponseData("Đang gửi yêu cầu...");
    const startTime = performance.now();

    try {
      const options: RequestInit = {
        method: customMethod,
        headers: {
          "Content-Type": "application/json",
        },
      };

      if ((customMethod === "POST" || customMethod === "PUT") && requestBody.trim()) {
        options.body = requestBody;
      }

      const res = await fetch(customUrl, options);
      const endTime = performance.now();
      setResponseTime(Math.round(endTime - startTime));
      setResponseStatus(res.status);

      const json = await res.json();
      setResponseData(JSON.stringify(json, null, 2));
    } catch (err: unknown) {
      const error = err as Error;
      setResponseStatus(500);
      setResponseData(JSON.stringify({ success: false, message: error.message }, null, 2));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Terminal className="h-6 w-6 text-blue-400" />
            <span>Thử nghiệm API quản trị</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Cổng dùng thử và thực thi trực tiếp 100% các RESTful API Endpoints kết nối với CSDL MongoDB
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-xl bg-emerald-950 border border-emerald-800/40 px-3 py-1.5 text-xs font-semibold text-emerald-300">
            <Server className="h-3.5 w-3.5" />
            <span>Đã kết nối MongoDB</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Endpoint Picker */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-sm space-y-4">
          <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2 flex items-center gap-2">
            <Code className="h-4 w-4 text-blue-400" />
            <span>Danh sách endpoint ({ENDPOINTS.length})</span>
          </h3>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {ENDPOINTS.map((ep, idx) => {
              const isSelected = selectedEndpoint.name === ep.name;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelectEndpoint(ep)}
                  className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${
                    isSelected
                      ? "bg-blue-950/80 border-blue-500/60 text-white shadow-lg"
                      : "bg-slate-950/60 border-slate-800/80 text-slate-300 hover:border-slate-700 hover:text-white"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`rounded px-1.5 py-0.5 font-bold font-mono text-[10px] ${
                        ep.method === "GET"
                          ? "bg-blue-600/30 text-blue-400 border border-blue-500/40"
                          : ep.method === "POST"
                          ? "bg-emerald-600/30 text-emerald-400 border border-emerald-500/40"
                          : ep.method === "PUT"
                          ? "bg-amber-600/30 text-amber-400 border border-amber-500/40"
                          : "bg-rose-600/30 text-rose-400 border border-rose-500/40"
                      }`}
                    >
                      {ep.method}
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold uppercase">{CATEGORY_LABEL[ep.category]}</span>
                  </div>
                  <h4 className="font-bold text-slate-200 mt-1.5">{ep.name}</h4>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5 truncate">{ep.url}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right 2 Cols: Console Execution Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Request Form */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-white">{selectedEndpoint.name}</h3>
              <span className="text-xs text-slate-400">{selectedEndpoint.description}</span>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={customMethod}
                onChange={(e) => setCustomMethod(e.target.value as "GET" | "POST" | "PUT" | "DELETE")}
                className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-bold text-blue-400 focus:border-blue-500 focus:outline-none"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>

              <input
                type="text"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                className="flex-1 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-mono text-slate-200 focus:border-blue-500 focus:outline-none"
              />

              <button
                onClick={handleExecute}
                disabled={loading}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 disabled:opacity-50 transition-all cursor-pointer"
              >
                {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                <span>GỬI YÊU CẦU</span>
              </button>
            </div>

            {(customMethod === "POST" || customMethod === "PUT") && (
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">Nội dung gửi đi (JSON)</label>
                <textarea
                  rows={6}
                  value={requestBody}
                  onChange={(e) => setRequestBody(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs font-mono text-emerald-400 focus:border-blue-500 focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* Response Console Display */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-3">
                <span className="font-bold text-xs text-white uppercase tracking-wider">Kết quả trả về</span>
                {responseStatus && (
                  <span
                    className={`rounded-md px-2 py-0.5 text-xs font-bold font-mono ${
                      responseStatus >= 200 && responseStatus < 300
                        ? "bg-emerald-950 text-emerald-300 border border-emerald-800/50"
                        : "bg-rose-950 text-rose-300 border border-rose-800/50"
                    }`}
                  >
                    HTTP {responseStatus}
                  </span>
                )}
                {responseTime !== null && (
                  <span className="text-[11px] text-slate-500 font-mono">{responseTime} ms</span>
                )}
              </div>

              {responseData && (
                <button
                  onClick={() => navigator.clipboard.writeText(responseData)}
                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span>Sao chép JSON</span>
                </button>
              )}
            </div>

            <pre className="max-h-96 overflow-auto rounded-xl bg-slate-900/80 p-4 text-xs font-mono text-blue-300 border border-slate-800">
              {responseData || "// Bấm 'GỬI REQUEST' để thực thi endpoint..."}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
