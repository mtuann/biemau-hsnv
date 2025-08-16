// formManager.js - Quản lý dữ liệu biểu mẫu chấm điểm
class FormManager {
  constructor() {
    this.storageKey = 'scoringForms';
    this.currentFormType = '';
  }

  // Lưu dữ liệu biểu mẫu
  saveForm(formType, formData) {
    try {
      const forms = this.getAllForms(formType);
      const newForm = {
        id: Date.now().toString(),
        formType: formType,
        timestamp: new Date().toISOString(),
        data: formData,
        ...formData
      };
      
      forms.push(newForm);
      localStorage.setItem(this.storageKey + '_' + formType, JSON.stringify(forms));
      
      return newForm.id;
    } catch (error) {
      console.error('Lỗi khi lưu biểu mẫu:', error);
      return null;
    }
  }

  // Lấy tất cả biểu mẫu theo loại
  getAllForms(formType) {
    try {
      const stored = localStorage.getItem(this.storageKey + '_' + formType);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Lỗi khi đọc biểu mẫu:', error);
      return [];
    }
  }

  // Lấy biểu mẫu theo ID
  getFormById(formType, formId) {
    const forms = this.getAllForms(formType);
    return forms.find(form => form.id === formId);
  }

  // Xóa biểu mẫu
  deleteForm(formType, formId) {
    try {
      const forms = this.getAllForms(formType);
      const filteredForms = forms.filter(form => form.id !== formId);
      localStorage.setItem(this.storageKey + '_' + formType, JSON.stringify(filteredForms));
      return true;
    } catch (error) {
      console.error('Lỗi khi xóa biểu mẫu:', error);
      return false;
    }
  }

  // Tìm kiếm biểu mẫu
  searchForms(formType, searchTerm) {
    const forms = this.getAllForms(formType);
    if (!searchTerm) return forms;
    
    const term = searchTerm.toLowerCase();
    return forms.filter(form => {
      return (
        (form.hoTen && form.hoTen.toLowerCase().includes(term)) ||
        (form.capBac && form.capBac.toLowerCase().includes(term)) ||
        (form.chucVu && form.chucVu.toLowerCase().includes(term)) ||
        (form.donVi && form.donVi.toLowerCase().includes(term)) ||
        (form.tenDoiTuongST && form.tenDoiTuongST.toLowerCase().includes(term)) ||
        (form.soHoSo && form.soHoSo.toLowerCase().includes(term))
      );
    });
  }

  // Sắp xếp biểu mẫu
  sortForms(forms, sortBy = 'timestamp', sortOrder = 'desc') {
    return forms.sort((a, b) => {
      let aVal, bVal;
      
      if (sortBy === 'timestamp') {
        aVal = new Date(a.timestamp);
        bVal = new Date(b.timestamp);
      } else {
        aVal = a[sortBy] || '';
        bVal = b[sortBy] || '';
      }
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
  }

  // Thu thập dữ liệu từ form hiện tại
  collectFormData() {
    const formData = {};
    
    // Thu thập thông tin cơ bản theo thứ tự xuất hiện trong form
    const contentEditableElements = Array.from(document.querySelectorAll('[contenteditable]'));
    
    // Lọc ra các element không phải là ô điểm số
    const infoElements = contentEditableElements.filter(el => {
      const id = el.id || '';
      const className = el.className || '';
      return !id.includes('diem_') && !className.includes('diem_') && !id.includes('sum_all_');
    });
    
    // Thu thập thông tin theo thứ tự xuất hiện trong form SN
    if (infoElements.length >= 6) {
      formData.hoTen = infoElements[0].textContent.trim();
      formData.capBac = infoElements[1].textContent.trim();
      formData.chucVu = infoElements[2].textContent.trim();
      formData.donVi = infoElements[3].textContent.trim();
      formData.tenDoiTuongST = infoElements[4].textContent.trim();
      formData.soHoSo = infoElements[5].textContent.trim();
    }
    
    // Thu thập điểm số
    const tongDiemCb = document.getElementById('sum_all_cb');
    const tongDiemCh = document.getElementById('sum_all_ch');
    
    if (tongDiemCb) formData.tongDiemCB = tongDiemCb.textContent.trim();
    if (tongDiemCh) formData.tongDiemCH = tongDiemCh.textContent.trim();
    
    // Thu thập ngày tháng
    const ngayElements = document.querySelectorAll('.o_nhap_ngay, .o_nhap_thang, .o_nhap_nam');
    if (ngayElements.length >= 3) {
      formData.ngay = ngayElements[0].textContent.trim();
      formData.thang = ngayElements[1].textContent.trim();
      formData.nam = ngayElements[2].textContent.trim();
    }
    
    // Debug: log collected data
    console.log('Collected form data:', formData);
    console.log('Info elements found:', infoElements.length);
    console.log('Info elements:', infoElements);
    
    return formData;
  }

  // Thu thập toàn bộ dữ liệu từ form (bao gồm cả điểm số chi tiết)
  collectCompleteFormData() {
    const formData = this.collectFormData();
    
    // Thu thập tất cả điểm số chi tiết
    const allScoreElements = document.querySelectorAll('[class*="diem_cb_muc_"], [class*="diem_ch_muc_"]');
    const scores = {};
    
    allScoreElements.forEach(el => {
      const className = el.className || '';
      const textContent = el.textContent.trim();
      
      if (textContent && textContent !== '') {
        // Lấy tên class để làm key
        const classNames = className.split(' ');
        const scoreClass = classNames.find(cls => cls.includes('diem_'));
        if (scoreClass) {
          scores[scoreClass] = textContent;
        }
      }
    });
    
    // Thêm điểm số vào formData
    formData.scores = scores;
    
    // Thu thập thông tin về loại form
    const title = document.title || '';
    formData.formType = this.detectFormType(title);
    
    console.log('Complete form data:', formData);
    return formData;
  }

  // Tự động phát hiện loại form dựa trên title
  detectFormType(title) {
    if (title.includes('CĐ2') || title.includes('Sưu tra')) return 'SN';
    if (title.includes('CĐ3') || title.includes('Hiềm nghi')) return 'HN';
    if (title.includes('CĐ4') || title.includes('Điều tra cơ bản')) return 'DTBC';
    if (title.includes('CĐ5') || title.includes('Chuyên án')) return 'chuyenan';
    if (title.includes('CĐ6') || title.includes('Cộng tác viên')) return 'LC';
    if (title.includes('CĐ7') || title.includes('Hộp thư')) return 'LH';
    if (title.includes('CĐ8') || title.includes('Vai ảo')) return 'LA';
    if (title.includes('CĐ9') || title.includes('Nhà nghiệp vụ')) return 'LN';
    if (title.includes('Xếp loại cán bộ')) return 'xeploaicanbo';
    if (title.includes('Xếp loại đơn vị')) return 'xeploaidonvi';
    if (title.includes('Xếp loại lãnh đạo')) return 'xeploailanhdao';
    return 'unknown';
  }

  // Hiển thị bảng biểu mẫu đã lưu
  showFormsTable(formType, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const forms = this.getAllForms(formType);
    
    if (forms.length === 0) {
      container.innerHTML = `
        <div class="no-forms">
          <p>Chưa có biểu mẫu nào được lưu.</p>
          <button class="btn btn-primary" onclick="createNewFormFromList('${formType}')">Tạo biểu mẫu mới</button>
        </div>
      `;
      return;
    }
    
    const tableHTML = `
      <div class="forms-controls">
        <div class="search-box">
          <input type="text" id="searchInput" placeholder="Tìm kiếm..." onkeyup="searchForms('${formType}')">
        </div>
        <div class="sort-controls">
          <select id="sortSelect" onchange="sortForms('${formType}')">
            <option value="timestamp_desc">Mới nhất</option>
            <option value="timestamp_asc">Cũ nhất</option>
            <option value="hoTen_asc">Tên A-Z</option>
            <option value="hoTen_desc">Tên Z-A</option>
          </select>
        </div>
        <button class="btn btn-primary" onclick="createNewFormFromList('${formType}')">Tạo biểu mới</button>
      </div>
      
      <div class="table-container">
        <table class="forms-table">
          <thead>
            <tr>
              <th>STT</th>
              <th>Họ và tên</th>
              <th>Cấp bậc</th>
              <th>Chức vụ</th>
              <th>Đơn vị</th>
              <th>Đối tượng ST</th>
              <th>Số hồ sơ</th>
              <th>Điểm CB</th>
              <th>Điểm CH</th>
              <th>Ngày tạo</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody id="formsTableBody">
            ${forms.map((form, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${form.hoTen || '-'}</td>
                <td>${form.capBac || '-'}</td>
                <td>${form.chucVu || '-'}</td>
                <td>${form.donVi || '-'}</td>
                <td>${form.tenDoiTuongST || '-'}</td>
                <td>${form.soHoSo || '-'}</td>
                <td>${form.tongDiemCB || '-'}</td>
                <td>${form.tongDiemCH || '-'}</td>
                <td>${new Date(form.timestamp).toLocaleDateString('vi-VN')}</td>
                <td>
                  <button class="btn btn-small btn-secondary" onclick="viewForm('${formType}', '${form.id}')">Xem</button>
                  <button class="btn btn-small btn-info" onclick="cloneForm('${formType}', '${form.id}')">Clone</button>
                  <button class="btn btn-small btn-danger" onclick="deleteForm('${formType}', '${form.id}')">Xóa</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
    
    container.innerHTML = tableHTML;
  }
}

// Khởi tạo FormManager
const formManager = new FormManager();

// Hàm tìm kiếm
function searchForms(formType) {
  const searchTerm = document.getElementById('searchInput').value;
  const forms = formManager.searchForms(formType, searchTerm);
  updateFormsTable(forms, formType);
}

// Hàm sắp xếp
function sortForms(formType) {
  const sortSelect = document.getElementById('sortSelect');
  const [sortBy, sortOrder] = sortSelect.value.split('_');
  const forms = formManager.getAllForms(formType);
  const sortedForms = formManager.sortForms(forms, sortBy, sortOrder);
  updateFormsTable(sortedForms, formType);
}

// Cập nhật bảng
function updateFormsTable(forms, formType) {
  const tbody = document.getElementById('formsTableBody');
  if (!tbody) return;
  
  tbody.innerHTML = forms.map((form, index) => `
    <tr>
      <td>${index + 1}</td>
      <td>${form.hoTen || '-'}</td>
      <td>${form.capBac || '-'}</td>
      <td>${form.chucVu || '-'}</td>
      <td>${form.donVi || '-'}</td>
      <td>${form.tenDoiTuongST || '-'}</td>
      <td>${form.soHoSo || '-'}</td>
      <td>${form.tongDiemCB || '-'}</td>
      <td>${form.tongDiemCH || '-'}</td>
      <td>${new Date(form.timestamp).toLocaleDateString('vi-VN')}</td>
      <td>
        <button class="btn btn-small btn-secondary" onclick="viewForm('${formType}', '${form.id}')">Xem</button>
        <button class="btn btn-small btn-danger" onclick="deleteForm('${formType}', '${form.id}')">Xóa</button>
      </td>
    </tr>
  `).join('');
}

// Tạo biểu mẫu mới
function createNewForm(formType) {
  window.open(`forms/phieuchamdiem${formType}.html`, '_blank');
}

// Tạo biểu mẫu mới từ danh sách
function createNewFormFromList(formType) {
  // Mở form mới trong tab hiện tại
  window.location.href = `forms/phieuchamdiem${formType}.html`;
}

// Clone biểu mẫu từ bản ghi cũ
async function cloneForm(formType, formId) {
  const form = await formManager.getFormById(formType, formId);
  if (form) {
    // Tạo bản ghi mới với dữ liệu từ bản cũ
    const clonedData = { ...form.data };
    clonedData.hoTen = clonedData.hoTen ? clonedData.hoTen + ' (Bản sao)' : 'Bản sao';
    clonedData.timestamp = new Date().toISOString();
    
    // Lưu bản sao
    const newFormId = formManager.saveForm(formType, clonedData);
    if (newFormId) {
      alert('Đã tạo bản sao thành công!');
      // Refresh bảng
      formManager.showFormsTable(formType, 'formsContainer');
    }
  }
}

// Chuyển đổi loại form
function convertFormType(oldFormType, newFormType, formId) {
  if (confirm(`Bạn có muốn chuyển đổi biểu mẫu từ ${oldFormType} sang ${newFormType}?`)) {
    // Lấy dữ liệu form cũ
    const oldForm = formManager.getFormById(oldFormType, formId);
    if (oldForm) {
      // Tạo form mới với dữ liệu đã chuyển đổi
      const convertedData = { ...oldForm.data };
      convertedData.formType = newFormType;
      convertedData.timestamp = new Date().toISOString();
      
      // Lưu form mới
      const newFormId = formManager.saveForm(newFormType, convertedData);
      if (newFormId) {
        // Xóa form cũ
        formManager.deleteForm(oldFormType, formId);
        alert('Đã chuyển đổi biểu mẫu thành công!');
        // Refresh bảng
        formManager.showFormsTable(newFormType, 'formsContainer');
      }
    }
  }
}

// Xem biểu mẫu
function viewForm(formType, formId) {
  const form = formManager.getFormById(formType, formId);
  if (form) {
    // Mở form với dữ liệu đã lưu
    const newWindow = window.open(`forms/phieuchamdiem${formType}.html`, '_blank');
    newWindow.addEventListener('load', function() {
      // Truyền dữ liệu để form có thể load lại
      newWindow.formDataToLoad = form.data;
    });
  }
}

// Load dữ liệu vào form
function loadFormData(formData) {
  if (!formData) return;
  
  const contentEditableElements = Array.from(document.querySelectorAll('[contenteditable]'));
  const infoElements = contentEditableElements.filter(el => {
    const id = el.id || '';
    const className = el.className || '';
    return !id.includes('diem_') && !className.includes('diem_') && !id.includes('sum_all_');
  });
  
  // Load thông tin cơ bản
  if (infoElements.length >= 6) {
    if (formData.hoTen) infoElements[0].textContent = formData.hoTen;
    if (formData.capBac) infoElements[1].textContent = formData.capBac;
    if (formData.chucVu) infoElements[2].textContent = formData.chucVu;
    if (formData.donVi) infoElements[3].textContent = formData.donVi;
    if (formData.tenDoiTuongST) infoElements[4].textContent = formData.tenDoiTuongST;
    if (formData.soHoSo) infoElements[5].textContent = formData.soHoSo;
  }
  
  // Load điểm số
  if (formData.tongDiemCB) {
    const tongDiemCb = document.getElementById('sum_all_cb');
    if (tongDiemCb) tongDiemCb.textContent = formData.tongDiemCB;
  }
  
  if (formData.tongDiemCH) {
    const tongDiemCh = document.getElementById('sum_all_ch');
    if (tongDiemCh) tongDiemCh.textContent = formData.tongDiemCH;
  }
  
  // Load ngày tháng
  if (formData.ngay || formData.thang || formData.nam) {
    const ngayElements = document.querySelectorAll('.o_nhap_ngay, .o_nhap_thang, .o_nhap_nam');
    if (ngayElements.length >= 3) {
      if (formData.ngay) ngayElements[0].textContent = formData.ngay;
      if (formData.thang) ngayElements[2].textContent = formData.nam;
    }
  }
  
  // Load điểm số chi tiết nếu có
  if (formData.scores) {
    Object.keys(formData.scores).forEach(scoreClass => {
      const elements = document.querySelectorAll('.' + scoreClass);
      elements.forEach(el => {
        el.textContent = formData.scores[scoreClass];
      });
    });
  }
  
  // Recalculate scores
  if (typeof cong_diem === 'function') {
    cong_diem();
  }
}

// Load dữ liệu hoàn chỉnh vào form
function loadCompleteFormData(formData) {
  if (!formData) return;
  
  // Load thông tin cơ bản
  loadFormData(formData);
  
  // Load điểm số chi tiết
  if (formData.scores) {
    Object.keys(formData.scores).forEach(scoreClass => {
      const elements = document.querySelectorAll('.' + scoreClass);
      elements.forEach(el => {
        el.textContent = formData.scores[scoreClass];
      });
    });
  }
  
  // Load tổng điểm
  if (formData.tongDiemCB) {
    const tongDiemCb = document.getElementById('sum_all_cb');
    if (tongDiemCb) tongDiemCb.textContent = formData.tongDiemCB;
  }
  
  if (formData.tongDiemCH) {
    const tongDiemCh = document.getElementById('sum_all_ch');
    if (tongDiemCh) tongDiemCh.textContent = formData.tongDiemCH;
  }
  
  // Recalculate scores
  if (typeof cong_diem === 'function') {
    cong_diem();
  }
}

// Xóa biểu mẫu
function deleteForm(formType, formId) {
  if (confirm('Bạn có chắc chắn muốn xóa biểu mẫu này?')) {
    if (formManager.deleteForm(formType, formId)) {
      // Refresh bảng
      formManager.showFormsTable(formType, 'formsContainer');
    }
  }
}

// Lưu biểu mẫu hiện tại
function saveCurrentForm(formType) {
  const formData = formManager.collectFormData();
  const formId = formManager.saveForm(formType, formData);
  
  if (formId) {
    alert('Đã lưu biểu mẫu thành công!');
    return formId;
  } else {
    alert('Có lỗi xảy ra khi lưu biểu mẫu!');
    return null;
  }
}
