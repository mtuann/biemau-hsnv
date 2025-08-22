# Hệ thống Chấm điểm HSNV - Hướng dẫn Setup và Sử dụng

## 🚀 Tổng quan

Hệ thống chấm điểm HSNV (Học sinh năng khiếu) với 8 loại biểu mẫu chấm điểm theo Thông tư 17/2025/TT-BCA. Tất cả forms đều được tích hợp với database PostgreSQL để lưu trữ và quản lý dữ liệu.

## 📋 Các loại Form được hỗ trợ

### ✅ Hoạt động đúng (đã có sẵn):
- **Chấm điểm Điều tra cơ bản** (`phieu-cham-diem-dtcb.html`)
- **Chấm điểm Hiềm nghi** (`phieu-cham-diem-hn.html`)

### 🔄 Đã cập nhật để hoạt động:
- **Chấm điểm Sưu tra** (`phieu-cham-diem-sn.html`)
- **Chấm điểm Chuyên án** (`phieu-cham-diem-chuyen-an.html`)
- **Chấm điểm Cộng tác viên bí mật** (`phieu-cham-diem-lc.html`)
- **Chấm điểm Hộp thư bí mật** (`phieu-cham-diem-lh.html`)
- **Chấm điểm Vai ảo nghiệp vụ** (`phieu-cham-diem-la.html`)
- **Chấm điểm Nhà nghiệp vụ** (`phieu-cham-diem-ln.html`)

## 🗄️ Database Setup Flow

### 1. **Chuẩn bị Database**
```bash
# Kiểm tra PostgreSQL đã cài đặt
which psql

# Kiểm tra version
psql --version
```

### 2. **Cấu hình Environment Variables**
```bash
# Tạo file .env
cd projects/biemau-hsnv

# Set DATABASE_URL (chọn một trong các options dưới)
```

#### **Option A: Database Local (Linux/macOS)**
```bash
echo "DATABASE_URL=postgresql://localhost:5432/myformsdb" > .env
```

#### **Option A1: Database Local (Windows)**
```cmd
# Tạo file .env với nội dung:
echo DATABASE_URL=postgresql://postgres:your_password@localhost:5432/myformsdb > .env

# Hoặc tạo file .env thủ công với nội dung:
# DATABASE_URL=postgresql://postgres:your_password@localhost:5432/myformsdb
# PORT=3000
```

#### **Option B: Database Remote (Render)**
```bash
echo "DATABASE_URL=postgresql://username:password@hostname.region-postgres.render.com/database_name" > .env
```

#### **Option C: Database Remote (Railway)**
```bash
echo "DATABASE_URL=postgresql://username:password@hostname.railway.app:5432/database_name" > .env
```

#### **Option D: Database Remote (Supabase)**
```bash
echo "DATABASE_URL=postgresql://username:password@hostname.supabase.co:5432/database_name" > .env
```

### 3. **Test Database Connection**
```bash
# Test connection với Node.js
node -e "
require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Connection failed:', err.message);
  } else {
    console.log('✅ Connection successful! Current time:', res.rows[0].now);
  }
  pool.end();
});
"
```

### 4. **Tạo Database Schema**
```bash
# Chạy schema SQL để tạo bảng forms
psql "$DATABASE_URL" -f database-schema.sql
```

#### **Kiểm tra schema đã tạo:**
```bash
# Liệt kê tất cả tables
psql "$DATABASE_URL" -c "\dt"

# Kiểm tra cấu trúc bảng forms
psql "$DATABASE_URL" -c "\d forms"

# Kiểm tra indexes
psql "$DATABASE_URL" -c "\di forms*"
```

### 5. **Khởi động ứng dụng**
```bash
# Install dependencies
npm install

# Start application
npm start
```

## 🔧 Troubleshooting Database Connection

### **Lỗi ENOTFOUND (Hostname không resolve được)**
```bash
# Kiểm tra hostname có đúng không
nslookup your-hostname.com

# Thử với domain đầy đủ
# Ví dụ: dpg-xxx-xxx-a.singapore-postgres.render.com
```

### **Lỗi ECONNREFUSED (Connection bị từ chối)**
```bash
# Kiểm tra service có đang chạy không
# Kiểm tra port có đúng không
# Kiểm tra firewall settings
```

### **Lỗi Authentication Failed**
```bash
# Kiểm tra username/password
# Kiểm tra database name
# Kiểm tra user permissions
```

### **Lỗi Database does not exist**
```bash
# Tạo database nếu chưa có
createdb your_database_name

# Hoặc connect với database khác
```

### **Lỗi SSL trên Windows Local**
```cmd
# Lỗi: "The server does not support SSL connections"
# Nguyên nhân: Database local không hỗ trợ SSL

# Giải pháp 1: Sử dụng connection string không có SSL
DATABASE_URL=postgresql://postgres:password@localhost:5432/myformsdb

# Giải pháp 2: File db.js đã được sửa để tự động detect local/remote
# Không cần thay đổi gì thêm

# Giải pháp 3: Kiểm tra PostgreSQL service có đang chạy không
# Mở Services (services.msc) > PostgreSQL > Start
```

## 🚀 API Endpoints

### **Tạo form mới**
```http
POST /api/forms/{form_type}
Content-Type: application/json

{
  "info": {...},
  "score_table": [...],
  "tong_diem_cb": 85.0,
  "tong_diem_ch": 82.0,
  "xep_loai_cb": "Tốt",
  "xep_loai_ch": "Tốt"
}
```

### **Lấy form theo ID**
```http
GET /api/forms/{form_type}/{form_id}
```

### **Xóa form**
```http
DELETE /api/forms/{form_type}/{form_id}
```

### **Lấy danh sách forms**
```http
GET /api/forms/list?form_type={form_type}
```

### **Health Check**
```http
GET /health
```

## 📊 Database Schema

### **Bảng `forms`**
```sql
CREATE TABLE forms (
    id SERIAL PRIMARY KEY,
    form_id VARCHAR(500) UNIQUE NOT NULL,
    form_type VARCHAR(100) NOT NULL,
    info JSONB NOT NULL,
    score_table JSONB,
    tong_diem_cb DECIMAL(5,2),
    tong_diem_ch DECIMAL(5,2),
    xep_loai_cb VARCHAR(50),
    xep_loai_ch VARCHAR(50),
    ngay_thang_cb VARCHAR(100),
    ngay_thang_ch VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **Indexes**
```sql
CREATE INDEX idx_forms_form_type ON forms(form_type);
CREATE INDEX idx_forms_form_id ON forms(form_id);
```

### **Triggers**
```sql
-- Tự động cập nhật updated_at
CREATE TRIGGER update_forms_updated_at 
    BEFORE UPDATE ON forms 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
```

## 🎯 Cách sử dụng Forms

### **1. Xem danh sách forms đã điền**
- Vào trang chính `tt17.html`
- Click vào bất kỳ form card nào
- Modal sẽ hiển thị danh sách các form đã điền từ database

### **2. Tạo form mới**
- Trong modal danh sách, click "Tạo mới"
- Form HTML sẽ mở trong tab mới
- Điền thông tin và click "Lưu vào cơ sở dữ liệu"

### **3. Chỉnh sửa form cũ**
- Trong modal danh sách, click "Xem/Chỉnh sửa"
- Form sẽ mở với dữ liệu đã có
- Chỉnh sửa và lưu lại

### **4. Xóa form**
- Trong modal danh sách, click "Xóa"
- Xác nhận xóa

## 🛠️ Development & Debug

### **Kiểm tra logs**
```bash
# Xem console logs của ứng dụng
npm start

# Kiểm tra database connection
curl http://localhost:3000/health
```

### **Test Database Operations**
```bash
# Test insert
curl -X POST http://localhost:3000/api/forms/dtcb \
  -H "Content-Type: application/json" \
  -d '{"info":{"ho_ten":"Test"},"score_table":[]}'

# Test select
curl http://localhost:3000/api/forms/list?form_type=phieu-cham-diem-dtcb
```

### **Monitor Database**
```bash
# Kiểm tra số lượng connections
psql "$DATABASE_URL" -c "SELECT count(*) FROM pg_stat_activity;"

# Kiểm tra performance
psql "$DATABASE_URL" -c "SELECT * FROM pg_stat_user_tables WHERE schemaname = 'public';"
```

## 🔒 Security & Best Practices

### **Environment Variables**
- Không commit file `.env` vào git
- Sử dụng strong passwords cho database
- Rotate credentials định kỳ

### **Database Security**
- Sử dụng SSL connections
- Whitelist IP addresses nếu cần
- Regular backups
- Monitor access logs

### **API Security**
- Validate input data
- Sanitize SQL queries (đã có với parameterized queries)
- Rate limiting (có thể thêm)
- Error handling không expose sensitive info

## 📝 Changelog

### **v2.0.0 - Database Integration**
- ✅ Tích hợp tất cả forms với PostgreSQL database
- ✅ API endpoints cho tất cả 8 loại form
- ✅ Standardized form handler
- ✅ Better error handling và logging
- ✅ Database schema với indexes và triggers

### **v1.0.0 - Initial Release**
- ✅ Basic forms functionality
- ✅ Local storage support
- ✅ Basic UI/UX

## 🆘 Support & Troubleshooting

### **Common Issues & Solutions**

#### **Form không lưu được**
1. Kiểm tra database connection
2. Kiểm tra console errors
3. Đảm bảo đã điền ít nhất họ tên
4. Kiểm tra database schema

#### **Form không load được**
1. Kiểm tra form_id trong URL
2. Kiểm tra database có dữ liệu
3. Kiểm tra console errors
4. Kiểm tra API endpoint

#### **API errors (500, 404, etc.)**
1. Kiểm tra server đang chạy
2. Kiểm tra database schema
3. Kiểm tra console logs
4. Kiểm tra environment variables

### **Debug Commands**
```bash
# Kiểm tra database connection
node -e "require('dotenv').config(); console.log('DATABASE_URL:', process.env.DATABASE_URL)"

# Test database query
psql "$DATABASE_URL" -c "SELECT count(*) FROM forms;"

# Check application status
curl -v http://localhost:3000/health

# View application logs
tail -f logs/app.log  # nếu có logging
```

## 📞 Liên hệ

- **Developer**: Đội ngũ phát triển HSNV
- **Version**: 2.0.0
- **Last Updated**: 2024-12-20
- **Database**: PostgreSQL 17.6+

---

**Lưu ý**: Đảm bảo database connection ổn định trước khi sử dụng các tính năng forms. Nếu gặp vấn đề, hãy kiểm tra logs và database connection trước.
