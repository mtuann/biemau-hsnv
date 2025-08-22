// Standard Form Handler for HSNV Scoring System
// This file provides standardized functions for all forms to interact with the database

class StandardFormHandler {
  constructor(formType) {
    this.formType = formType;
    this.apiEndpoint = formType.replace('phieu-cham-diem-', '');
  }

  // Collect form data from the current form
  collectFormData() {
    const info = {};
    const scoreTable = [];
    
    // Collect basic information
    const basicFields = [
      { selector: "span[contenteditable][style*='min-width:400px']", key: 'ho_ten' },
      { selector: "span[contenteditable][style*='min-width: 150px']", key: 'cap_bac' },
      { selector: "span[contenteditable][style*='min-width: 150px']", key: 'chuc_vu' },
      { selector: "span[contenteditable][style*='min-width:400px']", key: 'don_vi' },
      { selector: "span[contenteditable][style*='min-width:600px']", key: 'ten_doi_tuong' },
      { selector: "span[contenteditable][style*='min-width:300px']", key: 'loai_doi_tuong' },
      { selector: "span[contenteditable][style*='min-width:400px']", key: 'so_ho_so' }
    ];

    basicFields.forEach(field => {
      const element = document.querySelector(field.selector);
      if (element) {
        info[field.key] = element.textContent.trim();
      }
    });

    // Collect time information
    const timeFields = [
      { selector: '.o_nhap_ngay.border[contenteditable]', key: 'thoi_gian_tu_ngay' },
      { selector: '.o_nhap_thang.border[contenteditable]', key: 'thoi_gian_tu_thang' },
      { selector: '.o_nhap_nam.border[contenteditable]', key: 'thoi_gian_tu_nam' }
    ];

    timeFields.forEach((field, index) => {
      const elements = document.querySelectorAll(field.selector);
      if (elements[index]) {
        info[field.key] = elements[index].textContent.trim();
      }
    });

    // Collect score table data
    const tableRows = document.querySelectorAll('table.table_mau_pa tr');
    tableRows.forEach((row, rowIndex) => {
      const cells = row.querySelectorAll('td');
      if (cells.length >= 3) {
        const stt = cells[0].textContent.trim();
        const content = cells[1].textContent.trim();
        const maxScore = cells[2].textContent.trim();
        
        if (stt && content && maxScore) {
          scoreTable.push({
            stt: stt,
            content: content,
            maxScore: maxScore,
            actualScore: '', // Will be filled by user
            rowIndex: rowIndex
          });
        }
      }
    });

    // Collect total scores and ratings
    const tongDiemCB = document.querySelector('.tong-diem-cb')?.textContent.trim() || '';
    const tongDiemCH = document.querySelector('.tong-diem-ch')?.textContent.trim() || '';
    const xepLoaiCB = document.querySelector('.xep-loai-cb')?.textContent.trim() || '';
    const xepLoaiCH = document.querySelector('.xep-loai-ch')?.textContent.trim() || '';

    return {
      info: info,
      score_table: scoreTable,
      tong_diem_cb: tongDiemCB,
      tong_diem_ch: tongDiemCH,
      xep_loai_cb: xepLoaiCB,
      xep_loai_ch: xepLoaiCH,
      ngay_thang_cb: new Date().toLocaleDateString('vi-VN'),
      ngay_thang_ch: new Date().toLocaleDateString('vi-VN')
    };
  }

  // Save form data to database
  async saveForm() {
    try {
      const formData = this.collectFormData();
      
      // Validate required fields
      if (!formData.info.ho_ten || formData.info.ho_ten.trim() === '') {
        alert('Vui lòng điền họ tên trước khi lưu!');
        return false;
      }

      const response = await fetch(`/api/forms/${this.apiEndpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('Lưu thành công!');
        return true;
      } else {
        const error = await response.json();
        alert('Lỗi khi lưu dữ liệu!\n' + (error.error || ''));
        return false;
      }
    } catch (error) {
      console.error('Lỗi khi lưu form:', error);
      alert('Lỗi khi lưu dữ liệu!');
      return false;
    }
  }

  // Load form data from database
  async loadForm(formId) {
    try {
      const response = await fetch(`/api/forms/${this.apiEndpoint}/${encodeURIComponent(formId)}`);
      
      if (response.ok) {
        const formData = await response.json();
        this.populateForm(formData);
        return true;
      } else {
        console.error('Không thể tải dữ liệu form');
        return false;
      }
    } catch (error) {
      console.error('Lỗi khi tải form:', error);
      return false;
    }
  }

  // Populate form with data
  populateForm(formData) {
    try {
      const info = formData.info;
      
      // Populate basic fields
      const basicFields = [
        { selector: "span[contenteditable][style*='min-width:400px']", value: info.ho_ten },
        { selector: "span[contenteditable][style*='min-width: 150px']", value: info.cap_bac },
        { selector: "span[contenteditable][style*='min-width: 150px']", value: info.chuc_vu },
        { selector: "span[contenteditable][style*='min-width:400px']", value: info.don_vi },
        { selector: "span[contenteditable][style*='min-width:600px']", value: info.ten_doi_tuong },
        { selector: "span[contenteditable][style*='min-width:300px']", value: info.loai_doi_tuong },
        { selector: "span[contenteditable][style*='min-width:400px']", value: info.so_ho_so }
      ];

      basicFields.forEach(field => {
        const element = document.querySelector(field.selector);
        if (element && field.value) {
          element.textContent = field.value;
        }
      });

      // Populate time fields
      if (info.thoi_gian_tu_ngay) {
        const timeElements = document.querySelectorAll('.o_nhap_ngay.border[contenteditable]');
        if (timeElements[0]) timeElements[0].textContent = info.thoi_gian_tu_ngay;
        if (timeElements[1]) timeElements[1].textContent = info.thoi_gian_tu_ngay;
      }
      
      if (info.thoi_gian_tu_thang) {
        const timeElements = document.querySelectorAll('.o_nhap_thang.border[contenteditable]');
        if (timeElements[0]) timeElements[0].textContent = info.thoi_gian_tu_thang;
        if (timeElements[1]) timeElements[1].textContent = info.thoi_gian_tu_thang;
      }
      
      if (info.thoi_gian_tu_nam) {
        const timeElements = document.querySelectorAll('.o_nhap_nam.border[contenteditable]');
        if (timeElements[0]) timeElements[0].textContent = info.thoi_gian_tu_nam;
        if (timeElements[1]) timeElements[1].textContent = info.thoi_gian_tu_nam;
      }

      // Populate scores and ratings
      if (formData.tong_diem_cb) {
        const tongDiemCB = document.querySelector('.tong-diem-cb');
        if (tongDiemCB) tongDiemCB.textContent = formData.tong_diem_cb;
      }
      
      if (formData.tong_diem_ch) {
        const tongDiemCH = document.querySelector('.tong-diem-ch');
        if (tongDiemCH) tongDiemCH.textContent = formData.tong_diem_ch;
      }
      
      if (formData.xep_loai_cb) {
        const xepLoaiCB = document.querySelector('.xep-loai-cb');
        if (xepLoaiCB) xepLoaiCB.textContent = formData.xep_loai_cb;
      }
      
      if (formData.xep_loai_ch) {
        const xepLoaiCH = document.querySelector('.xep-loai-ch');
        if (xepLoaiCH) xepLoaiCH.textContent = formData.xep_loai_ch;
      }

    } catch (error) {
      console.error('Lỗi khi populate form:', error);
    }
  }

  // Check if form is being loaded with an ID parameter
  checkForFormId() {
    const urlParams = new URLSearchParams(window.location.search);
    const formId = urlParams.get('form_id');
    
    if (formId) {
      this.loadForm(formId);
    }
  }
}

// Global function to save form (for backward compatibility)
function saveToDatabase() {
  if (window.formHandler) {
    window.formHandler.saveForm();
  } else {
    console.error('Form handler not initialized');
    alert('Lỗi: Form handler chưa được khởi tạo!');
  }
}

// Initialize form handler when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Determine form type from the current page
  const currentPath = window.location.pathname;
  let formType = 'phieu-cham-diem-dtcb'; // default
  
  if (currentPath.includes('phieu-cham-diem-sn')) {
    formType = 'phieu-cham-diem-sn';
  } else if (currentPath.includes('phieu-cham-diem-dtcb')) {
    formType = 'phieu-cham-diem-dtcb';
  } else if (currentPath.includes('phieu-cham-diem-hn')) {
    formType = 'phieu-cham-diem-hn';
  } else if (currentPath.includes('phieu-cham-diem-chuyen-an')) {
    formType = 'phieu-cham-diem-chuyen-an';
  } else if (currentPath.includes('phieu-cham-diem-lc')) {
    formType = 'phieu-cham-diem-lc';
  } else if (currentPath.includes('phieu-cham-diem-lh')) {
    formType = 'phieu-cham-diem-lh';
  } else if (currentPath.includes('phieu-cham-diem-la')) {
    formType = 'phieu-cham-diem-la';
  } else if (currentPath.includes('phieu-cham-diem-ln')) {
    formType = 'phieu-cham-diem-ln';
  }
  
  // Initialize the form handler
  window.formHandler = new StandardFormHandler(formType);
  
  // Check if we need to load an existing form
  window.formHandler.checkForFormId();
});
