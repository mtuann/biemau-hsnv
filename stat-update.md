## **Hướng Dẫn Tạo Chức Năng Thống Kê**

### **Bước 1: Phân Tích Cấu Trúc Dữ Liệu Hiện Tại**

Trước tiên, bạn cần hiểu cấu trúc dữ liệu trong database:

1. **Trường `info` (JSONB)** chứa thông tin cơ bản:
   - `so_ho_so`: Số hồ sơ (quan trọng cho thống kê)
   - `ho_ten`, `cap_bac`, `chuc_vu`, `don_vi`, etc.

2. **Trường `score_table` (JSONB)** chứa bảng điểm chi tiết

3. **Các trường điểm**: `tong_diem_cb`, `tong_diem_ch`, `xep_loai_cb`, `xep_loai_ch`

### **Bước 2: Tạo API Endpoints Thống Kê**

Thêm vào file `app.js` các endpoint mới:

```javascript
// API: Lấy thống kê theo loại form và tiêu chí
app.get('/api/statistics/:form_type', async (req, res) => {
  try {
    const { form_type } = req.params;
    const { criteria } = req.query; // criteria: 'xa_phuong', 'dia_ban', 'to_chuc', etc.
    
    // Query database để lấy thống kê
    const result = await pool.query(`
      SELECT 
        info->>'so_ho_so' as so_ho_so,
        info->>'ho_ten' as ho_ten,
        tong_diem_cb,
        tong_diem_ch,
        xep_loai_cb,
        xep_loai_ch,
        created_at
      FROM forms 
      WHERE form_type = $1 
      AND info->>'so_ho_so' IS NOT NULL
      ORDER BY created_at DESC
    `, [form_type]);
    
    // Xử lý dữ liệu theo tiêu chí
    const statistics = processStatisticsByCriteria(result.rows, criteria);
    res.json(statistics);
  } catch (err) {
    console.error('Statistics API error:', err);
    res.status(500).json({ error: 'Statistics query failed' });
  }
});

// API: Lấy tổng hợp thống kê cho tất cả loại form
app.get('/api/statistics/summary', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        form_type,
        COUNT(*) as total_forms,
        AVG(tong_diem_cb) as avg_score_cb,
        AVG(tong_diem_ch) as avg_score_ch,
        COUNT(CASE WHEN xep_loai_cb = 'Tốt' THEN 1 END) as good_cb,
        COUNT(CASE WHEN xep_loai_cb = 'Khá' THEN 1 END) as fair_cb,
        COUNT(CASE WHEN xep_loai_cb = 'Trung bình' THEN 1 END) as average_cb,
        COUNT(CASE WHEN xep_loai_cb = 'Kém' THEN 1 END) as poor_cb
      FROM forms 
      WHERE tong_diem_cb IS NOT NULL
      GROUP BY form_type
      ORDER BY form_type
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Summary statistics error:', err);
    res.status(500).json({ error: 'Summary query failed' });
  }
});
```

### **Bước 3: Tạo Hàm Xử Lý Thống Kê**

Thêm vào `app.js`:

```javascript
// Hàm xử lý thống kê theo tiêu chí
function processStatisticsByCriteria(data, criteria) {
  const criteriaMap = {
    'xa_phuong': 'Xã, phường, thị trấn (cấp xã)',
    'dia_ban': 'Địa bàn, khu vực trọng điểm',
    'to_chuc': 'Tổ chức',
    'muc_tieu': 'Mục tiêu',
    'linh_vuc': 'Lĩnh vực',
    'he_loai': 'Hệ loại đối tượng',
    'hoi_nhom': 'Hội, nhóm, tài khoản trên không gian mạng'
  };
  
  // Lọc dữ liệu theo tiêu chí (dựa trên so_ho_so hoặc logic khác)
  const filteredData = data.filter(item => {
    // Logic lọc dữ liệu theo tiêu chí
    // Có thể dựa trên so_ho_so, hoặc các trường khác
    return true; // Tạm thời lấy tất cả
  });
  
  // Tính toán thống kê
  const total = filteredData.length;
  const totalScoreCb = filteredData.reduce((sum, item) => sum + (item.tong_diem_cb || 0), 0);
  const totalScoreCh = filteredData.reduce((sum, item) => sum + (item.tong_diem_ch || 0), 0);
  const avgScoreCb = total > 0 ? (totalScoreCb / total).toFixed(2) : 0;
  const avgScoreCh = total > 0 ? (totalScoreCh / total).toFixed(2) : 0;
  
  return {
    criteria: criteriaMap[criteria] || criteria,
    total,
    totalScoreCb,
    totalScoreCh,
    avgScoreCb,
    avgScoreCh,
    data: filteredData
  };
}
```

### **Bước 4: Cập Nhật Form HTML**

Trong file `xep-loai-can-bo.html`, thay thế các ô input bằng các div hiển thị dữ liệu:

```html
<!-- Thay vì contentEditable, sử dụng id để JavaScript cập nhật -->
<td style="vertical-align:middle;">
  <div class="ta_center font12" id="so_luong_xa_phuong">0</div>
</td>
<td style="vertical-align:middle;">
  <div class="ta_center font12" id="tong_diem_xa_phuong">0</div>
</td>
<td style="vertical-align:middle;">
  <div class="ta_center font12" id="trung_binh_xa_phuong">0</div>
</td>
```

### **Bước 5: Tạo JavaScript Thống Kê**

Tạo file `js/statistics.js`:

```javascript
class StatisticsManager {
  constructor() {
    this.baseUrl = '/api/statistics';
  }
  
  // Lấy thống kê theo loại form và tiêu chí
  async getStatistics(formType, criteria) {
    try {
      const response = await fetch(`${this.baseUrl}/${formType}?criteria=${criteria}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching statistics:', error);
      return null;
    }
  }
  
  // Lấy tổng hợp thống kê
  async getSummaryStatistics() {
    try {
      const response = await fetch(`${this.baseUrl}/summary`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching summary:', error);
      return null;
    }
  }
  
  // Cập nhật dữ liệu thống kê lên form
  async updateStatisticsDisplay() {
    const formTypes = [
      'phieu-cham-diem-dtcb',
      'phieu-cham-diem-sn',
      'phieu-cham-diem-hn',
      'phieu-cham-diem-chuyen-an',
      'phieu-cham-diem-lc',
      'phieu-cham-diem-lh',
      'phieu-cham-diem-la',
      'phieu-cham-diem-ln'
    ];
    
    for (const formType of formTypes) {
      const criteria = this.getCriteriaForFormType(formType);
      const stats = await this.getStatistics(formType, criteria);
      
      if (stats) {
        this.updateFormDisplay(formType, stats);
      }
    }
  }
  
  // Cập nhật hiển thị trên form
  updateFormDisplay(formType, stats) {
    const elementId = this.getElementIdForFormType(formType);
    const element = document.getElementById(elementId);
    
    if (element) {
      element.textContent = stats.total;
    }
    
    // Cập nhật tổng điểm và điểm trung bình
    this.updateTotals(stats);
  }
  
  // Cập nhật tổng hợp
  updateTotals(stats) {
    // Logic cập nhật tổng điểm và điểm trung bình
    const totalElement = document.getElementById('sum_all_cb');
    if (totalElement) {
      totalElement.textContent = stats.totalScoreCb;
    }
  }
}

// Khởi tạo và chạy thống kê khi trang load
document.addEventListener('DOMContentLoaded', async () => {
  const statsManager = new StatisticsManager();
  await statsManager.updateStatisticsDisplay();
});
```

### **Bước 6: Mapping Tiêu Chí với Form Types**

Tạo mapping giữa các loại form và tiêu chí thống kê:

```javascript
const formCriteriaMapping = {
  'phieu-cham-diem-dtcb': [
    'xa_phuong', 'dia_ban', 'to_chuc', 'muc_tieu', 
    'linh_vuc', 'he_loai', 'hoi_nhom'
  ],
  'phieu-cham-diem-sn': ['ca_nhan', 'to_chuc', 'viec_hien_tuong'],
  'phieu-cham-diem-hn': ['ca_nhan', 'to_chuc', 'viec_hien_tuong'],
  'phieu-cham-diem-chuyen-an': ['chuyen_an_trinh_sat', 'chuyen_an_truy_xet'],
  'phieu-cham-diem-lc': ['dac_tinh', 'cong_tac_vien', 'co_so_bi_mat'],
  'phieu-cham-diem-lh': ['hop_thu_bi_mat'],
  'phieu-cham-diem-la': ['vai_ao_nghiep_vu'],
  'phieu-cham-diem-ln': ['nha_nghiep_vu']
};
```

### **Bước 7: Test và Kiểm Tra**

1. **Test API endpoints** bằng Postman hoặc curl
2. **Kiểm tra dữ liệu** trong database
3. **Test hiển thị** trên form
4. **Kiểm tra tính toán** thống kê

### **Bước 8: Tối Ưu Hóa**

1. **Thêm caching** cho dữ liệu thống kê
2. **Tối ưu query** database
3. **Thêm error handling** tốt hơn
4. **Thêm loading indicators**

## **Lưu Ý Quan Trọng**

1. **Dữ liệu mẫu**: Đảm bảo có dữ liệu mẫu trong database để test
2. **Performance**: Với dữ liệu lớn, cần pagination và caching
3. **Security**: Validate input và sanitize data
4. **UI/UX**: Thêm loading states và error messages