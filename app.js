const express = require('express');
const pool = require('./db');
const app = express();
const path = require('path');

app.use(express.json());

// Phục vụ toàn bộ thư mục dự án (bao gồm forms, styles, images...)
app.use(express.static(__dirname));

console.log('=== APP.JS STARTED ===');

// Helper: generate form_id (simple concat)
function generateFormId(info) {
  return [
    info.ho_ten, info.cap_bac, info.chuc_vu, info.don_vi,
    info.ten_doi_tuong, info.so_ho_so,
    info.thoi_gian_tu_ngay, info.thoi_gian_den_ngay
  ].join('|');
}

// Insert new form
app.post('/api/forms/dtcb', async (req, res) => {
  // console.log('BODY:', req.body);
  try {
    let { info, score_table, tong_diem_cb, tong_diem_ch, xep_loai_cb, xep_loai_ch, ngay_thang_cb, ngay_thang_ch } = req.body;
    // Đảm bảo info và score_table là object/array
    if (typeof info !== 'string') info = JSON.stringify(info);
    if (typeof score_table !== 'string') score_table = JSON.stringify(score_table);
    const form_id = generateFormId(JSON.parse(info));
    const form_type = 'phieu-cham-diem-dtcb';

    const result = await pool.query(
      `INSERT INTO forms_dtcb
        (form_id, form_type, info, score_table, tong_diem_cb, tong_diem_ch, xep_loai_cb, xep_loai_ch, ngay_thang_cb, ngay_thang_ch)
       VALUES ($1,$2,$3::jsonb,$4::jsonb,$5,$6,$7,$8,$9,$10)
       ON CONFLICT (form_id) DO UPDATE SET
         info = EXCLUDED.info,
         score_table = EXCLUDED.score_table,
         tong_diem_cb = EXCLUDED.tong_diem_cb,
         tong_diem_ch = EXCLUDED.tong_diem_ch,
         xep_loai_cb = EXCLUDED.xep_loai_cb,
         xep_loai_ch = EXCLUDED.xep_loai_ch,
         ngay_thang_cb = EXCLUDED.ngay_thang_cb,
         ngay_thang_ch = EXCLUDED.ngay_thang_ch
       RETURNING *`,
      [form_id, form_type, info, score_table, tong_diem_cb, tong_diem_ch, xep_loai_cb, xep_loai_ch, ngay_thang_cb, ngay_thang_ch]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Insert failed' });
  }
});

// Get form by form_id
app.get('/api/forms/dtcb/:form_id', async (req, res) => {
  try {
    const { form_id } = req.params;
    const result = await pool.query('SELECT * FROM forms_dtcb WHERE form_id = $1', [form_id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Query failed' });
  }
});

// Xóa form theo form_id
app.delete('/api/forms/dtcb/:form_id', async (req, res) => {
  const form_id = decodeURIComponent(req.params.form_id);
  console.log('API DELETE nhận form_id:', form_id, 'length:', form_id.length);
  try {
    const result = await pool.query('DELETE FROM forms_dtcb WHERE form_id = $1 RETURNING *', [form_id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Delete failed' });
  }
});

// API: Lấy danh sách các form đã điền theo loại form
app.get('/api/forms/list', async (req, res) => {
  try {
    const { form_type } = req.query;
    if (!form_type) return res.status(400).json({ error: 'Missing form_type' });
    const result = await pool.query(
      'SELECT form_id, info, tong_diem_cb, tong_diem_ch, xep_loai_cb, xep_loai_ch FROM forms_dtcb WHERE form_type = $1 ORDER BY id DESC',
      [form_type]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Query failed' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
