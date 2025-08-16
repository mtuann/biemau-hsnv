# Hệ thống chấm điểm HSNV

Hệ thống chấm điểm cho lực lượng cảnh sát nhân dân theo Thông tư 17 và Quyết định 7272.

## Thông tin đăng nhập

- **Tài khoản:** admin
- **Mật khẩu:** 1

## Luồng hoạt động của website

### 1. Trang chủ (index.html)
- Trang khởi đầu với loading animation
- Tự động kiểm tra trạng thái đăng nhập
- Chuyển hướng đến trang đăng nhập hoặc trang chủ tùy theo trạng thái

### 2. Trang đăng nhập (login.html)
- Giao diện đăng nhập với background đẹp
- Xác thực tài khoản admin/1
- Lưu trữ thông tin đăng nhập vào sessionStorage
- Chuyển hướng đến trang chủ sau khi đăng nhập thành công

### 3. Trang chủ (trangchu.html)
- Hiển thị thông tin người dùng (admin)
- Hai tùy chọn chấm điểm chính:
  - **CHẤM ĐIỂM THEO TT17**: Hệ thống hoàn chỉnh với 8 loại biểu mẫu
  - **CHẤM ĐIỂM THEO QĐ7272**: Tính năng đang phát triển
- Nút đăng xuất để quay về trang đăng nhập

### 4. Trang TT17 (tt17.html)
- Hiển thị 8 loại biểu mẫu chấm điểm:
  1. Chấm điểm Sưu tra
  2. Chấm điểm Điều tra cơ bản
  3. Chấm điểm Hiềm nghi
  4. Chấm điểm Chuyên án
  5. Chấm điểm Cộng tác viên bí mật
  6. Chấm điểm Hộp thư bí mật
  7. Chấm điểm Vai ảo nghiệp vụ
  8. Chấm điểm Nhà nghiệp vụ
- Mỗi biểu mẫu mở trong tab mới
- Nút quay về trang chủ

### 5. Trang QĐ7272 (qdd7272.html)
- Thông báo tính năng đang phát triển
- Hiển thị tiến độ phát triển (65%)
- Danh sách các tính năng sẽ có
- Nút quay về trang chủ

### 6. Các biểu mẫu (thư mục forms/)
- Mỗi biểu mẫu có header navigation
- Nút quay về danh sách TT17
- Nút quay về trang chủ
- Chức năng lưu và in biểu mẫu
- Tính năng tính điểm tự động

## Cấu trúc thư mục (Stable)

```
BieuMauHSNV/
├── index.html              # Trang khởi đầu
├── login.html              # Trang đăng nhập
├── trangchu.html           # Trang chủ
├── tt17.html               # Danh sách biểu mẫu TT17
├── qdd7272.html            # Trang QĐ7272 (đang phát triển)
├── forms/                  # Thư mục chứa các biểu mẫu
│   ├── phieu-cham-diem-chuyen-an.html
│   ├── phieu-cham-diem-dtcb.html
│   ├── phieu-cham-diem-hn.html
│   ├── phieu-cham-diem-la.html
│   ├── phieu-cham-diem-lc.html
│   ├── phieu-cham-diem-lh.html
│   ├── phieu-cham-diem-ln.html
│   ├── phieu-cham-diem-sn.html
│   ├── xep-loai-can-bo.html
│   ├── xep-loai-don-vi.html
│   └── xep-loai-lanh-dao-chi-huy.html
├── styles/                  # CSS styles
├── js/                     # JavaScript files (chamdiem.js, xuong-dong.js, form-manager.js)
├── images/                  # Hình ảnh (print.png, save.png, reload.png, anh-nen.jpg)
├── data/                   # Dữ liệu lưu trữ (forms-data.json)
└── README.md               # Tài liệu hướng dẫn
```

## Tính năng chính

### ✅ Đã hoàn thành
- Hệ thống đăng nhập với xác thực
- Giao diện người dùng hiện đại và responsive
- Navigation giữa các trang
- 8 loại biểu mẫu chấm điểm TT17
- Chức năng lưu và in biểu mẫu
- Bảo mật session
- Tính năng tính điểm tự động
- Giao diện biểu mẫu chuyên nghiệp

### 🔄 Đang phát triển
- Hệ thống chấm điểm theo QĐ7272
- Tích hợp database
- Quản lý người dùng
- Báo cáo thống kê

## Cách sử dụng

1. **Mở website**: Truy cập `index.html`
2. **Đăng nhập**: Sử dụng tài khoản admin/1
3. **Chọn loại chấm điểm**: TT17 hoặc QĐ7272
4. **Chọn biểu mẫu**: Nếu chọn TT17, chọn 1 trong 8 loại biểu mẫu
5. **Điền thông tin**: Hoàn thành biểu mẫu với các trường điểm
6. **Lưu/In**: Sử dụng các nút lưu và in

## Yêu cầu hệ thống

- Trình duyệt web hiện đại (Chrome, Firefox, Safari, Edge)
- Hỗ trợ JavaScript ES6+
- Hỗ trợ CSS Grid và Flexbox
- Hỗ trợ backdrop-filter (cho hiệu ứng đẹp)

## Ghi chú kỹ thuật

- Sử dụng sessionStorage để quản lý đăng nhập
- Giao diện responsive với CSS Grid
- Hiệu ứng hover và transition mượt mà
- Tương thích với các thiết bị di động
- Đường dẫn tương đối giữa các file
- Biểu mẫu có tính năng tính điểm tự động

## Liên hệ hỗ trợ

Để được hỗ trợ kỹ thuật hoặc báo cáo lỗi, vui lòng liên hệ đội ngũ phát triển.
