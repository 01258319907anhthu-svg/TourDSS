import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, resolve } from "node:path";

const port = Number(process.env.PORT || 8787);
const schemaPath = resolve(process.cwd(), "database", "schema.sql");
const distPath = resolve(process.cwd(), "dist");

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
};

const dashboard = {
  occupancy: 78.4,
  adr: 2460000,
  revpar: 1928000,
  netRevenue: 1842000000,
  updatedAt: new Date().toISOString(),
};

const analysisProfiles = {
  "30 ngày qua": { revenue: "90M", occupancy: "75%", cost: "51,6M", profit: "38,4M", growth: "+12,4%" },
  "Quý này": { revenue: "248M", occupancy: "71%", cost: "142M", profit: "106M", growth: "+9,8%" },
  "Năm nay": { revenue: "1,02T", occupancy: "68%", cost: "586M", profit: "434M", growth: "+8,1%" },
};
const channelProfiles = {
  "Website trực tiếp": { revenue: "36,4M", occupancy: "84%", cost: "18,9M", profit: "17,5M", growth: "+18,2%" },
  "OTA · Booking": { revenue: "29,8M", occupancy: "76%", cost: "20,5M", profit: "9,3M", growth: "+8,6%" },
  "Đại lý / B2B": { revenue: "18,2M", occupancy: "68%", cost: "10,4M", profit: "7,8M", growth: "+11,1%" },
};

const accounts = [
  { username: "admin", email: "admin@tourdss.vn", password: "TourDSS@123", fullName: "Quản trị viên TourDSS", role: "admin", roleName: "Quản trị viên", initials: "AD" },
  { username: "doanh_thu", email: "doanh.thu@tourdss.vn", password: "TourDSS@123", fullName: "Quản lý doanh thu", role: "revenue_manager", roleName: "Quản lý doanh thu", initials: "DT" },
  { username: "demo", email: "demo@tourdss.vn", password: "TourDSS@123", fullName: "Tài khoản demo TourDSS", role: "admin", roleName: "Quản trị viên", initials: "DM", isDemo: true },
];

const demoRoles = [
  { role: "admin", roleName: "Quản trị viên" },
  { role: "revenue_analyst", roleName: "Chuyên viên phân tích doanh thu" },
  { role: "revenue_manager_lead", roleName: "Quản lý doanh thu" },
  { role: "sales_director", roleName: "Giám đốc Kinh doanh" },
];

let proposals = [
  { id: 1, name: "Tăng giá Deluxe cuối tuần", price: "1.296.000 đ", impact: "+4,8M", status: "Chờ duyệt", createdBy: "Dữ liệu mẫu" },
  { id: 2, name: "Giữ giá Standard giữa tuần", price: "800.000 đ", impact: "+0,6M", status: "Chờ duyệt", createdBy: "Dữ liệu mẫu" },
];

function roleFromRequest(request) {
  return request.headers["x-tourdss-role"] || "admin";
}

function canCreateProposal(role) {
  return ["revenue_manager", "revenue_manager_lead"].includes(role);
}

function canApproveProposal(role) {
  return role === "sales_director";
}

function sendJson(response, statusCode, data) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
  });
  response.end(JSON.stringify(data));
}

function readBody(request) {
  return new Promise((resolveBody, reject) => {
    let body = "";
    request.on("data", (chunk) => { body += chunk; });
    request.on("end", () => resolveBody(body));
    request.on("error", reject);
  });
}

async function sendFrontend(request, response) {
  if (request.method !== "GET") return false;
  const pathname = new URL(request.url, "http://localhost").pathname;
  const requestedPath = pathname === "/" ? "/index.html" : pathname;
  const filePath = resolve(distPath, `.${requestedPath}`);
  if (!filePath.startsWith(distPath)) return false;
  try {
    const fileInfo = await stat(filePath);
    if (!fileInfo.isFile()) return false;
    const content = await readFile(filePath);
    response.writeHead(200, { "Content-Type": mimeTypes[extname(filePath).toLowerCase()] || "application/octet-stream" });
    response.end(content);
    return true;
  } catch {
    if (extname(pathname)) return false;
    try {
      const content = await readFile(resolve(distPath, "index.html"));
      response.writeHead(200, { "Content-Type": mimeTypes[".html"] });
      response.end(content);
      return true;
    } catch {
      return false;
    }
  }
}

const server = http.createServer(async (request, response) => {
  if (request.method === "OPTIONS") {
    response.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    response.end();
    return;
  }

  if (request.url === "/api/health") {
    sendJson(response, 200, { status: "ok", service: "TourDSS backend" });
    return;
  }

  if (request.url === "/api/dashboard") {
    sendJson(response, 200, dashboard);
    return;
  }

  if (request.method === "GET" && new URL(request.url, "http://localhost").pathname === "/api/analysis") {
    const query = new URL(request.url, "http://localhost").searchParams;
    const period = query.get("period") || "30 ngày qua";
    const dimension = query.get("dimension") || "Theo thời gian";
    const channel = query.get("channel") || "Tất cả kênh bán";
    const profile = channelProfiles[channel] || analysisProfiles[period] || analysisProfiles["30 ngày qua"];
    sendJson(response, 200, {
      period,
      dimension,
      channel,
      ...profile,
      source: "TourDSS database demo",
      updatedAt: new Date().toISOString(),
    });
    return;
  }

  if (request.method === "GET" && new URL(request.url, "http://localhost").pathname === "/api/forecast") {
    const query = new URL(request.url, "http://localhost").searchParams;
    const object = query.get("object") || "Tất cả phòng / tour";
    const range = query.get("range") || "30 ngày tới";
    const granularity = query.get("granularity") || "Theo ngày";
    const factor = object === "Tour đảo 1 ngày" ? 0.78 : object === "Standard Garden" ? 0.86 : object === "Deluxe Ocean View" ? 1.08 : 1;
    sendJson(response, 200, {
      object, range, granularity,
      expectedBookings: Math.round(186 * factor),
      expectedOccupancy: Math.round(82 * factor),
      confidence: 91,
      peakDate: "15/11",
      peakOccupancy: Math.round(96 * factor),
      source: "TourDSS database demo",
      updatedAt: new Date().toISOString(),
    });
    return;
  }

  if (request.method === "POST" && request.url === "/api/login") {
    try {
      const body = JSON.parse(await readBody(request));
      const account = accounts.find((item) => (item.username === body.username || item.email === body.username) && item.password === body.password);
      if (!account) {
        sendJson(response, 401, { message: "Tài khoản hoặc mật khẩu không đúng." });
        return;
      }
      const { password: _password, ...user } = account;
      if (user.isDemo) user.allowedRoles = demoRoles;
      sendJson(response, 200, { user });
    } catch {
      sendJson(response, 400, { message: "Dữ liệu đăng nhập không hợp lệ." });
    }
    return;
  }

  if (request.method === "GET" && request.url === "/api/proposals") {
    sendJson(response, 200, { proposals });
    return;
  }

  if (request.method === "POST" && request.url === "/api/proposals") {
    const role = roleFromRequest(request);
    if (!canCreateProposal(role)) {
      sendJson(response, 403, { message: "Vai trò hiện tại không được tạo đề xuất giá." });
      return;
    }
    try {
      const body = JSON.parse(await readBody(request));
      const proposal = {
        id: Date.now(),
        name: body.name || "Đề xuất giá mới",
        price: body.price || "1.296.000 đ",
        impact: body.impact || "+4,8M",
        room: body.room || "Deluxe Ocean View",
        channel: body.channel || "Website trực tiếp",
        period: body.period || "7 ngày tới",
        proposedPrice: body.proposedPrice || body.price || "1.296.000 đ",
        score: body.score || 86,
        ranking: body.ranking || "1/3",
        reason: body.reason || "Cân bằng công suất và biên lợi nhuận.",
        revpar: body.revpar || "1,06M",
        expectedProfit: body.expectedProfit || "+4,8M",
        constraints: body.constraints || [],
        status: "Chờ duyệt",
        createdBy: body.createdBy || role,
      };
      proposals = [proposal, ...proposals];
      sendJson(response, 201, { proposal });
    } catch {
      sendJson(response, 400, { message: "Dữ liệu đề xuất không hợp lệ." });
    }
    return;
  }

  if (request.method === "PATCH" && request.url.startsWith("/api/proposals/")) {
    const role = roleFromRequest(request);
    if (!canApproveProposal(role)) {
      sendJson(response, 403, { message: "Vai trò hiện tại không được xử lý phiếu giá." });
      return;
    }
    const id = Number(request.url.split("/").pop());
    const proposal = proposals.find((item) => item.id === id);
    if (!proposal) {
      sendJson(response, 404, { message: "Không tìm thấy đề xuất giá." });
      return;
    }
    let body = {};
    try { body = JSON.parse(await readBody(request)); } catch { body = {}; }
    const action = body.action || "approve";
    const statuses = { approve: "Đã duyệt", edit: "Cần chỉnh sửa", reject: "Đã từ chối" };
    proposal.status = statuses[action] || statuses.approve;
    proposal.processedBy = body.processedBy || role;
    proposal.processedAt = new Date().toISOString();
    proposal.note = body.note || "";
    sendJson(response, 200, { proposal });
    return;
  }

  if (request.url === "/api/database/schema") {
    response.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
    response.end(await readFile(schemaPath, "utf8"));
    return;
  }

  if (await sendFrontend(request, response)) return;
  sendJson(response, 404, { message: "Không tìm thấy tài nguyên" });
});

server.listen(port, "127.0.0.1", () => {
  console.log(`TourDSS backend đang chạy tại http://127.0.0.1:${port}`);
});
