// chamdiem.js - bản hoàn chỉnh (fix hiển thị 'Cộng' = 0 khi tổng bị trừ vượt)
(function () {
  'use strict';

  function xepLoaiCongNhan(diem) {
    if (typeof diem !== 'number' || isNaN(diem)) return "Điểm không hợp lệ";
    if (diem >= 80) return "Tốt";
    if (diem >= 65) return "Khá";
    if (diem >= 50) return "Trung bình";
    if (diem >= 0) return "Kém";
    return "Điểm không hợp lệ";
  }

  function capNhatKetQua(role, sum) {
    const idTong = role === 'cb' ? 'tongDiemCb' : 'tongDiemCh';
    const idLoai = role === 'cb' ? 'mucXepLoaiCb' : 'mucXepLoaiCh';
    const elTong = document.getElementById(idTong);
    const elLoai = document.getElementById(idLoai);
    if (elTong) elTong.textContent = '- Tổng số điểm đạt được: ' + sum;
    if (elLoai) elLoai.textContent = '- Mức xếp loại: ' + xepLoaiCongNhan(sum);
  }

  function parseNumberFromText(txt) {
    if (txt === null || typeof txt === 'undefined') return NaN;
    const n = parseFloat(String(txt).replace(/[^\d\.\-]/g, ''));
    return isNaN(n) ? NaN : n;
  }

  function getAllMucNumbers() {
    const set = new Set();
    const els = document.querySelectorAll('[class*="diem_cb_muc_"], [class*="diem_ch_muc_"], [id*="tong_diem_cb_muc_"], [id*="tong_diem_ch_muc_"]');
    els.forEach(el => {
      const cls = String(el.className || '');
      const m = cls.match(/diem_(?:cb|ch)_muc_(\d+)/);
      if (m && m[1]) set.add(Number(m[1]));
      const idmatch = el.id && el.id.match(/tong_diem_(?:cb|ch)_muc_(\d+)/);
      if (idmatch && idmatch[1]) set.add(Number(idmatch[1]));
    });
    return Array.from(set).sort((a,b) => a-b);
  }

  function findPenaltyMuc() {
    const rows = document.querySelectorAll('#Table3 tr');
    for (let r of rows) {
      const tds = r.querySelectorAll('td');
      if (tds.length >= 2) {
        const second = (tds[1].textContent || '').toLowerCase();
        if (second.indexOf('điểm trừ') !== -1) {
          const firstTxt = (tds[0].textContent || '').trim();
          const found = firstTxt.match(/(\d+)/);
          if (found) return Number(found[1]);
        }
      }
    }
    if (document.querySelector('.diem_cb_muc_7, .diem_ch_muc_7')) return 7;
    return null;
  }

  function getMaxPointOfMuc(muc) {
    const rows = document.querySelectorAll('#Table3 tr');
    for (let r of rows) {
      const tds = r.querySelectorAll('td');
      if (tds.length >= 3) {
        const stt = (tds[0].textContent || '').trim();
        if (stt && !stt.includes('.') && parseInt(stt) === muc) {
          const max = parseNumberFromText(tds[2].textContent || '');
          if (!isNaN(max)) return max;
        }
      }
    }
    return null;
  }

  function getMaxPointOfRow(cell) {
    const row = cell.closest('tr');
    if (!row) return null;
    const maxCell = row.querySelector('td:nth-child(3)');
    if (!maxCell) return null;
    const maxPoint = parseNumberFromText(maxCell.textContent || '');
    return isNaN(maxPoint) ? null : maxPoint;
  }

  function sumByClass(className, useAbs = false) {
    const els = document.getElementsByClassName(className);
    let sum = 0;
    for (let i = 0; i < els.length; i++) {
      let num = parseNumberFromText(els[i].textContent || els[i].innerText || '');
      if (isNaN(num)) num = 0;
      if (useAbs) num = Math.abs(num);
      sum += num;
    }
    return sum;
  }

  function safeSetText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = (value === '' || value === null || typeof value === 'undefined') ? '' : String(value);
  }

  // đặt caret con trỏ ở cuối ô contenteditable
  function setCaretToEnd(el) {
    el.focus();
    if (typeof window.getSelection !== "undefined" && typeof document.createRange !== "undefined") {
      const range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(false);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }

  // Hàm chính tính điểm
  window.cong_diem = function cong_diem() {
    try {
      const mucList = getAllMucNumbers();
      const penaltyMuc = findPenaltyMuc();
      const mucs = mucList.length ? mucList : [1,2,3,4,5,6,7];

      let totalCb = 0;
      let totalCh = 0;

      mucs.forEach(muc => {
        const isPenalty = (penaltyMuc !== null && muc === penaltyMuc);
        const cbSum = sumByClass('diem_cb_muc_' + muc, isPenalty);
        const chSum = sumByClass('diem_ch_muc_' + muc, isPenalty);

        const maxPoint = getMaxPointOfMuc(muc);

        if (isPenalty) {
          // nếu có maxPoint (âm) thì giới hạn theo trị tuyệt đối của maxPoint
          if (maxPoint !== null) {
            const allowed = Math.abs(maxPoint);
            const cbPenalty = Math.min(cbSum, allowed);
            const chPenalty = Math.min(chSum, allowed);
            // hiển thị luôn có dấu '-'
            safeSetText('tong_diem_cb_muc_' + muc, cbPenalty ? ('-' + cbPenalty) : '0');
            safeSetText('tong_diem_ch_muc_' + muc, chPenalty ? ('-' + chPenalty) : '0');
            totalCb -= cbPenalty;
            totalCh -= chPenalty;
          } else {
            // không có max -> hiển thị trị tuyệt đối với dấu '-'
            safeSetText('tong_diem_cb_muc_' + muc, cbSum ? ('-' + cbSum) : '0');
            safeSetText('tong_diem_ch_muc_' + muc, chSum ? ('-' + chSum) : '0');
            totalCb -= cbSum;
            totalCh -= chSum;
          }
        } else {
          // mục bình thường: hiển thị tổng mục và giới hạn bởi maxPoint nếu có
          if (maxPoint !== null) {
            const displayCb = Math.min(cbSum, maxPoint);
            const displayCh = Math.min(chSum, maxPoint);
            safeSetText('tong_diem_cb_muc_' + muc, displayCb);
            safeSetText('tong_diem_ch_muc_' + muc, displayCh);
            totalCb += displayCb;
            totalCh += displayCh;
          } else {
            safeSetText('tong_diem_cb_muc_' + muc, cbSum);
            safeSetText('tong_diem_ch_muc_' + muc, chSum);
            totalCb += cbSum;
            totalCh += chSum;
          }
        }
      });

      // nếu tổng bị trừ lớn hơn tổng cộng thì hiển thị 0 và xếp loại theo 0
      totalCb = Math.max(totalCb, 0);
      totalCh = Math.max(totalCh, 0);

      // **Sửa quan trọng**: ghi trực tiếp giá trị (kể cả 0) cho ô Cộng
      safeSetText('sum_all_cb', totalCb);
      safeSetText('sum_all_ch', totalCh);

      // cập nhật phần xếp loại (dùng số thực total)
      capNhatKetQua('cb', totalCb);
      capNhatKetQua('ch', totalCh);
    } catch (err) {
      console.error('Lỗi trong cong_diem():', err);
    }
  };

  // Event handlers: focus (clear '0' so typing replaces), paste (sanitize), blur (normalize & validate)
  document.addEventListener('DOMContentLoaded', function () {
    cong_diem();

    const editableCells = Array.from(document.querySelectorAll('#Table3 [contenteditable]'));
    editableCells.forEach(el => {
      const id = el.id || '';
      // skip cells that are totals generated by script
      if (id.startsWith('tong_diem_') || id.startsWith('sum_all_')) return;

      // If empty initially, set '0' (keeps behavior "ô trống -> 0")
      if (el.textContent.trim() === '') el.textContent = '0';

      // Focus: nếu ô chỉ có '0' thì xóa để người dùng gõ thay thế
      el.addEventListener('focus', function () {
        if (el.textContent.trim() === '0') {
          el.textContent = '';
          setCaretToEnd(el);
        }
      });

      // Paste: sanitize pasted text (chỉ số, dấu - và .)
      el.addEventListener('paste', function (e) {
        e.preventDefault();
        const text = (e.clipboardData || window.clipboardData).getData('text') || '';
        const sanitized = text.replace(/[^\d\.\-]/g, '');
        document.execCommand && document.execCommand('insertText', false, sanitized);
      });

      // Input: light recalculation while typing
      el.addEventListener('input', function () {
        try { cong_diem(); } catch (e) {}
      });

      // Blur: normalize value, validate against max, enforce '-' display for penalty rows
      el.addEventListener('blur', function () {
        let raw = el.textContent.trim();

        if (raw === '') {
          el.textContent = '0';
          cong_diem();
          return;
        }

        let num = parseNumberFromText(raw);
        if (isNaN(num)) {
          el.textContent = '0';
          cong_diem();
          return;
        }

        const maxPointRow = getMaxPointOfRow(el); // may be negative for penalty row

        if (maxPointRow !== null) {
          if (maxPointRow < 0) {
            const allowed = Math.abs(maxPointRow);
            const mag = Math.abs(num);
            if (mag > allowed) {
              alert(`Nhập sai, vui lòng nhập lại (tối đa ${allowed}).`);
              el.textContent = '';
              setCaretToEnd(el);
              cong_diem();
              return;
            }
            el.textContent = '-' + String(mag); // always show leading minus on penalty rows
          } else {
            if (num > maxPointRow) {
              alert(`Nhập sai, vui lòng nhập lại (tối đa ${maxPointRow}).`);
              el.textContent = '';
              setCaretToEnd(el);
              cong_diem();
              return;
            }
            el.textContent = String(num);
          }
        } else {
          el.textContent = String(num);
        }

        cong_diem();
      });
    });

    // also recalc on click (helpful after paste/context menu)
    document.addEventListener('click', function () {
      try { cong_diem(); } catch (e) {}
    });
  });

})();


