-- TourDSS · Database schema
-- CSDL hỗ trợ quyết định giá khách sạn / tour (SQLite).

PRAGMA foreign_keys = ON;

-- 1. Tài khoản và nhật ký thao tác
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username VARCHAR(80) NOT NULL UNIQUE,
  password VARCHAR(160) NOT NULL,
  full_name VARCHAR(120) NOT NULL,
  role VARCHAR(40) NOT NULL DEFAULT 'admin' CHECK (role = 'admin'),
  role_name VARCHAR(80) NOT NULL DEFAULT 'Quản trị viên',
  initials VARCHAR(5) NOT NULL DEFAULT 'AD',
  is_active BOOLEAN NOT NULL DEFAULT 1,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  action VARCHAR(80) NOT NULL,
  entity_type VARCHAR(80),
  entity_id INTEGER,
  description TEXT,
  metadata_json TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 2. Danh mục sản phẩm, kênh bán và nhóm khách
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_type VARCHAR(30) NOT NULL CHECK (product_type IN ('room', 'tour')),
  code VARCHAR(40) NOT NULL UNIQUE,
  name VARCHAR(120) NOT NULL,
  description TEXT,
  base_capacity INTEGER NOT NULL DEFAULT 0,
  base_price DECIMAL(14, 2) NOT NULL DEFAULT 0,
  min_price DECIMAL(14, 2),
  max_price DECIMAL(14, 2),
  is_active BOOLEAN NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sales_channels (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code VARCHAR(40) NOT NULL UNIQUE,
  name VARCHAR(80) NOT NULL,
  commission_rate DECIMAL(6, 2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS customer_segments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code VARCHAR(40) NOT NULL UNIQUE,
  name VARCHAR(80) NOT NULL,
  description TEXT
);

-- 3. Dữ liệu đặt chỗ và công suất
CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  booking_code VARCHAR(60) NOT NULL UNIQUE,
  booking_date DATE NOT NULL,
  stay_date DATE NOT NULL,
  end_date DATE,
  product_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  guests INTEGER NOT NULL DEFAULT 1 CHECK (guests > 0),
  nights INTEGER NOT NULL DEFAULT 1 CHECK (nights > 0),
  selling_price DECIMAL(14, 2) NOT NULL,
  discount_amount DECIMAL(14, 2) NOT NULL DEFAULT 0,
  channel_id INTEGER NOT NULL,
  segment_id INTEGER,
  status VARCHAR(30) NOT NULL DEFAULT 'confirmed' CHECK (status IN ('inquiry', 'confirmed', 'cancelled', 'completed')),
  note TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (channel_id) REFERENCES sales_channels(id),
  FOREIGN KEY (segment_id) REFERENCES customer_segments(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS capacity_daily (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  business_date DATE NOT NULL,
  product_id INTEGER NOT NULL,
  total_capacity INTEGER NOT NULL DEFAULT 0 CHECK (total_capacity >= 0),
  sold_capacity INTEGER NOT NULL DEFAULT 0 CHECK (sold_capacity >= 0),
  blocked_capacity INTEGER NOT NULL DEFAULT 0 CHECK (blocked_capacity >= 0),
  overbooking_limit INTEGER NOT NULL DEFAULT 0 CHECK (overbooking_limit >= 0),
  available_capacity INTEGER GENERATED ALWAYS AS (total_capacity - sold_capacity - blocked_capacity) STORED,
  UNIQUE (business_date, product_id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- 4. Giá bán, chi phí, đối thủ và sự kiện
CREATE TABLE IF NOT EXISTS price_calendar (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  valid_date DATE NOT NULL,
  product_id INTEGER NOT NULL,
  channel_id INTEGER,
  price DECIMAL(14, 2) NOT NULL,
  price_status VARCHAR(30) NOT NULL DEFAULT 'open' CHECK (price_status IN ('open', 'closed', 'sold_out')),
  minimum_stay INTEGER NOT NULL DEFAULT 1,
  cancellation_policy VARCHAR(120),
  source VARCHAR(40) NOT NULL DEFAULT 'manual',
  UNIQUE (valid_date, product_id, channel_id),
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (channel_id) REFERENCES sales_channels(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS operating_costs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cost_date DATE NOT NULL,
  product_id INTEGER,
  cost_type VARCHAR(60) NOT NULL,
  amount DECIMAL(14, 2) NOT NULL CHECK (amount >= 0),
  quantity INTEGER NOT NULL DEFAULT 1,
  note TEXT,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS competitors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(120) NOT NULL UNIQUE,
  website VARCHAR(255),
  market_position VARCHAR(40),
  is_active BOOLEAN NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS competitor_prices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  observed_date DATE NOT NULL,
  competitor_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  price DECIMAL(14, 2) NOT NULL,
  channel_name VARCHAR(80),
  source VARCHAR(120),
  availability VARCHAR(30) DEFAULT 'available',
  note TEXT,
  FOREIGN KEY (competitor_id) REFERENCES competitors(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_name VARCHAR(160) NOT NULL,
  event_type VARCHAR(60),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  location VARCHAR(120),
  demand_impact DECIMAL(6, 2) NOT NULL DEFAULT 0,
  expected_occupancy DECIMAL(6, 2),
  note TEXT,
  is_active BOOLEAN NOT NULL DEFAULT 1
);

-- 5. Dự báo và đề xuất giá
CREATE TABLE IF NOT EXISTS demand_forecasts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  forecast_date DATE NOT NULL,
  product_id INTEGER NOT NULL,
  horizon VARCHAR(20) NOT NULL DEFAULT 'daily',
  actual_demand INTEGER,
  forecast_demand INTEGER NOT NULL,
  lower_bound INTEGER,
  upper_bound INTEGER,
  confidence_score DECIMAL(6, 2),
  model_name VARCHAR(80),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (forecast_date, product_id, horizon),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE IF NOT EXISTS pricing_recommendations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,
  valid_date DATE NOT NULL,
  current_price DECIMAL(14, 2) NOT NULL,
  recommended_price DECIMAL(14, 2) NOT NULL,
  decision VARCHAR(30) NOT NULL CHECK (decision IN ('increase', 'decrease', 'hold')),
  score DECIMAL(6, 2),
  expected_revenue DECIMAL(14, 2),
  reason TEXT NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'rejected', 'applied')),
  created_by INTEGER,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- 6. Mô phỏng What-if
CREATE TABLE IF NOT EXISTS what_if_scenarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(160) NOT NULL,
  description TEXT,
  status VARCHAR(30) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'running', 'completed', 'archived')),
  price_change_percent DECIMAL(6, 2) NOT NULL DEFAULT 0,
  discount_percent DECIMAL(6, 2) NOT NULL DEFAULT 0,
  capacity_change_percent DECIMAL(6, 2) NOT NULL DEFAULT 0,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_by INTEGER,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS what_if_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  scenario_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  expected_bookings INTEGER,
  expected_occupancy DECIMAL(6, 2),
  expected_revenue DECIMAL(14, 2),
  expected_cost DECIMAL(14, 2),
  expected_profit DECIMAL(14, 2),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (scenario_id) REFERENCES what_if_scenarios(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- 7. Gói dịch vụ và giá tour đoàn
CREATE TABLE IF NOT EXISTS services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code VARCHAR(40) NOT NULL UNIQUE,
  name VARCHAR(120) NOT NULL,
  service_type VARCHAR(60),
  unit_price DECIMAL(14, 2) NOT NULL DEFAULT 0,
  cost DECIMAL(14, 2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS packages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code VARCHAR(40) NOT NULL UNIQUE,
  name VARCHAR(160) NOT NULL,
  description TEXT,
  selling_price DECIMAL(14, 2) NOT NULL,
  estimated_cost DECIMAL(14, 2) NOT NULL DEFAULT 0,
  status VARCHAR(30) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
  created_by INTEGER,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS package_items (
  package_id INTEGER NOT NULL,
  service_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (package_id, service_id),
  FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE,
  FOREIGN KEY (service_id) REFERENCES services(id)
);

CREATE TABLE IF NOT EXISTS group_tour_prices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,
  valid_date DATE NOT NULL,
  min_guests INTEGER NOT NULL,
  max_guests INTEGER NOT NULL,
  price_per_guest DECIMAL(14, 2) NOT NULL,
  estimated_cost_per_guest DECIMAL(14, 2) NOT NULL,
  minimum_departure_guests INTEGER NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'expired')),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- 8. Phê duyệt, nhập liệu và cấu hình
CREATE TABLE IF NOT EXISTS approval_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  recommendation_id INTEGER,
  scenario_id INTEGER,
  package_id INTEGER,
  approver_id INTEGER,
  decision VARCHAR(30) NOT NULL CHECK (decision IN ('approved', 'rejected', 'returned')),
  comment TEXT,
  decided_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK (recommendation_id IS NOT NULL OR scenario_id IS NOT NULL OR package_id IS NOT NULL),
  FOREIGN KEY (recommendation_id) REFERENCES pricing_recommendations(id) ON DELETE CASCADE,
  FOREIGN KEY (scenario_id) REFERENCES what_if_scenarios(id) ON DELETE CASCADE,
  FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE,
  FOREIGN KEY (approver_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS data_imports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  file_name VARCHAR(255) NOT NULL,
  import_type VARCHAR(60) NOT NULL,
  total_rows INTEGER NOT NULL DEFAULT 0,
  valid_rows INTEGER NOT NULL DEFAULT 0,
  error_rows INTEGER NOT NULL DEFAULT 0,
  status VARCHAR(30) NOT NULL DEFAULT 'uploaded' CHECK (status IN ('uploaded', 'validated', 'confirmed', 'failed')),
  imported_by INTEGER,
  imported_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (imported_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS data_import_errors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  import_id INTEGER NOT NULL,
  row_number INTEGER NOT NULL,
  field_name VARCHAR(80),
  error_message TEXT NOT NULL,
  raw_data TEXT,
  FOREIGN KEY (import_id) REFERENCES data_imports(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS pricing_rules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  rule_name VARCHAR(120) NOT NULL UNIQUE,
  min_price DECIMAL(14, 2),
  max_price DECIMAL(14, 2),
  occupancy_threshold DECIMAL(6, 2),
  demand_weight DECIMAL(6, 2) NOT NULL DEFAULT 25,
  competitor_weight DECIMAL(6, 2) NOT NULL DEFAULT 25,
  cost_weight DECIMAL(6, 2) NOT NULL DEFAULT 25,
  event_weight DECIMAL(6, 2) NOT NULL DEFAULT 25,
  is_active BOOLEAN NOT NULL DEFAULT 1,
  updated_by INTEGER,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Chỉ mục phục vụ dashboard và lọc theo thời gian.
CREATE INDEX IF NOT EXISTS idx_bookings_stay_date ON bookings(stay_date);
CREATE INDEX IF NOT EXISTS idx_bookings_product_channel ON bookings(product_id, channel_id);
CREATE INDEX IF NOT EXISTS idx_capacity_date_product ON capacity_daily(business_date, product_id);
CREATE INDEX IF NOT EXISTS idx_price_calendar_date_product ON price_calendar(valid_date, product_id);
CREATE INDEX IF NOT EXISTS idx_competitor_prices_date_product ON competitor_prices(observed_date, product_id);
CREATE INDEX IF NOT EXISTS idx_forecasts_date_product ON demand_forecasts(forecast_date, product_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_status ON pricing_recommendations(status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- Dữ liệu khởi tạo cho bản demo.
INSERT OR IGNORE INTO users (username, password, full_name, role, role_name, initials)
VALUES ('admin', 'TourDSS@123', 'Quản trị viên TourDSS', 'admin', 'Quản trị viên', 'AD');

INSERT OR IGNORE INTO products (product_type, code, name, description, base_capacity, base_price, min_price, max_price)
VALUES
  ('room', 'STD-GARDEN', 'Standard Garden', 'Phòng tiêu chuẩn hướng vườn', 30, 800000, 650000, 1400000),
  ('room', 'DLX-OCEAN', 'Deluxe Ocean View', 'Phòng deluxe hướng biển', 24, 1200000, 950000, 2200000),
  ('room', 'STE-PREMIUM', 'Suite Premium', 'Suite cao cấp có phòng khách', 8, 2000000, 1500000, 3500000),
  ('tour', 'ISLAND-1D', 'Tour đảo 1 ngày', 'Tour trải nghiệm đảo trong ngày', 45, 950000, 750000, 1600000);

INSERT OR IGNORE INTO sales_channels (code, name, commission_rate)
VALUES ('DIRECT', 'Website trực tiếp', 0), ('OTA', 'OTA · Booking', 18), ('B2B', 'Đại lý / B2B', 12), ('WALKIN', 'Walk-in', 0);

INSERT OR IGNORE INTO customer_segments (code, name, description)
VALUES ('INDIVIDUAL', 'Cá nhân', 'Khách đặt riêng lẻ'), ('COUPLE', 'Cặp đôi', 'Khách đi theo cặp'), ('FAMILY', 'Gia đình', 'Khách đi cùng gia đình'), ('GROUP', 'Đoàn / công ty', 'Khách đoàn và khách doanh nghiệp');

INSERT OR IGNORE INTO competitors (name, website, market_position)
VALUES ('Ocean Pearl Hotel', 'https://example.com', 'premium'), ('Palm Bay Resort', 'https://example.com', 'midscale'), ('Sunset Travel', 'https://example.com', 'tour');

INSERT OR IGNORE INTO services (code, name, service_type, unit_price, cost)
VALUES ('BREAKFAST', 'Bữa sáng buffet', 'dining', 180000, 80000), ('SPA', 'Spa thư giãn 60 phút', 'wellness', 650000, 300000), ('TRANSFER', 'Đưa đón sân bay', 'transport', 450000, 220000), ('ISLAND-TOUR', 'Tour đảo trong ngày', 'experience', 950000, 600000);

INSERT OR IGNORE INTO pricing_rules (rule_name, min_price, max_price, occupancy_threshold, demand_weight, competitor_weight, cost_weight, event_weight)
VALUES ('Quy tắc mặc định', 650000, 3500000, 75, 35, 25, 20, 20);
