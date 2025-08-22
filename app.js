const express = require('express');
const pool = require('./db');
const app = express();
const path = require('path');

app.use(express.json());

// Phục vụ toàn bộ thư mục dự án (bao gồm forms, styles, images...)
app.use(express.static(__dirname));

console.log('=== APP.JS STARTED ===');

// Test database connection on startup
async function testDatabaseConnection() {
  try {
    const client = await pool.connect();
    console.log('✅ Database connection successful');
    client.release();
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    console.log('⚠️  App will continue but database operations will fail');
    console.log('💡 Please check your DATABASE_URL in .env file');
  }
}

// Test connection when app starts
testDatabaseConnection();

// Helper: generate form_id (simple concat)
function generateFormId(info) {
  return [
    info.ho_ten, info.cap_bac, info.chuc_vu, info.don_vi,
    info.ten_doi_tuong, info.so_ho_so,
    info.thoi_gian_tu_ngay, info.thoi_gian_den_ngay
  ].join('|');
}

// Generic form insertion function
async function insertForm(formType, formData, res) {
  try {
    let { info, score_table, tong_diem_cb, tong_diem_ch, xep_loai_cb, xep_loai_ch, ngay_thang_cb, ngay_thang_ch } = formData;
    
    // Đảm bảo info và score_table là object/array
    if (typeof info !== 'string') info = JSON.stringify(info);
    if (typeof score_table !== 'string') score_table = JSON.stringify(score_table);
    
    const form_id = generateFormId(JSON.parse(info));
    
    // Use the generic forms table for all form types
    const result = await pool.query(
      `INSERT INTO forms
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
      [form_id, formType, info, score_table, tong_diem_cb, tong_diem_ch, xep_loai_cb, xep_loai_ch, ngay_thang_cb, ngay_thang_ch]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Database error in insertForm:', err.message);
    if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED') {
      res.status(503).json({ error: 'Database connection failed. Please check your database configuration.' });
    } else {
      res.status(500).json({ error: 'Insert failed: ' + err.message });
    }
  }
}

// Generic form retrieval function
async function getForm(formType, formId, res) {
  try {
    const result = await pool.query('SELECT * FROM forms WHERE form_id = $1 AND form_type = $2', [formId, formType]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Database error in getForm:', err.message);
    if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED') {
      res.status(503).json({ error: 'Database connection failed. Please check your database configuration.' });
    } else {
      res.status(500).json({ error: 'Query failed: ' + err.message });
    }
  }
}

// Generic form deletion function
async function deleteForm(formType, formId, res) {
  try {
    const result = await pool.query('DELETE FROM forms WHERE form_id = $1 AND form_type = $2 RETURNING *', [formId, formType]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) {
    console.error('Database error in deleteForm:', err.message);
    if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED') {
      res.status(503).json({ error: 'Database connection failed. Please check your database configuration.' });
    } else {
      res.status(500).json({ error: 'Delete failed: ' + err.message });
    }
  }
}

// Generic form list function
async function getFormList(formType, res) {
  try {
    const result = await pool.query(
      'SELECT form_id, info, tong_diem_cb, tong_diem_ch, xep_loai_cb, xep_loai_ch FROM forms WHERE form_type = $1 ORDER BY id DESC',
      [formType]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Database error in getFormList:', err.message);
    if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED') {
      res.status(503).json({ error: 'Database connection failed. Please check your database configuration.' });
    } else {
      res.status(500).json({ error: 'Query failed: ' + err.message });
    }
  }
}

// API endpoints for each form type
const formTypes = [
  'phieu-cham-diem-sn',           // Sưu tra
  'phieu-cham-diem-dtcb',         // Điều tra cơ bản
  'phieu-cham-diem-hn',           // Hiềm nghi
  'phieu-cham-diem-chuyen-an',    // Chuyên án
  'phieu-cham-diem-lc',           // Cộng tác viên bí mật
  'phieu-cham-diem-lh',           // Hộp thư bí mật
  'phieu-cham-diem-la',           // Vai ảo nghiệp vụ
  'phieu-cham-diem-ln'            // Nhà nghiệp vụ
];

// Create API endpoints for each form type
formTypes.forEach(formType => {
  // Insert new form
  app.post(`/api/forms/${formType.replace('phieu-cham-diem-', '')}`, async (req, res) => {
    await insertForm(formType, req.body, res);
  });

  // Get form by form_id
  app.get(`/api/forms/${formType.replace('phieu-cham-diem-', '')}/:form_id`, async (req, res) => {
    await getForm(formType, req.params.form_id, res);
  });

  // Delete form by form_id
  app.delete(`/api/forms/${formType.replace('phieu-cham-diem-', '')}/:form_id`, async (req, res) => {
    const form_id = decodeURIComponent(req.params.form_id);
    await deleteForm(formType, form_id, res);
  });
});

// API: Lấy danh sách các form đã điền theo loại form
app.get('/api/forms/list', async (req, res) => {
  try {
    const { form_type } = req.query;
    if (!form_type) return res.status(400).json({ error: 'Missing form_type' });
    await getFormList(form_type, res);
  } catch (err) {
    console.error('Error in forms list API:', err);
    res.status(500).json({ error: 'Query failed' });
  }
});

// Legacy endpoint for backward compatibility
app.post('/api/forms/dtcb', async (req, res) => {
  await insertForm('phieu-cham-diem-dtcb', req.body, res);
});

app.get('/api/forms/dtcb/:form_id', async (req, res) => {
  await getForm('phieu-cham-diem-dtcb', req.params.form_id, res);
});

app.delete('/api/forms/dtcb/:form_id', async (req, res) => {
  const form_id = decodeURIComponent(req.params.form_id);
  await deleteForm('phieu-cham-diem-dtcb', form_id, res);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: pool.totalCount > 0 ? 'Connected' : 'Disconnected'
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check available at: http://localhost:${PORT}/health`);
});
