-- Database schema for HSNV scoring system
-- This file contains the SQL commands to create the necessary tables

-- Create the main forms table to store all form types
CREATE TABLE IF NOT EXISTS forms (
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

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_forms_form_type ON forms(form_type);
CREATE INDEX IF NOT EXISTS idx_forms_form_id ON forms(form_id);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_forms_updated_at 
    BEFORE UPDATE ON forms 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Legacy table for backward compatibility (if needed)
-- CREATE TABLE IF NOT EXISTS forms_dtcb (
--     id SERIAL PRIMARY KEY,
--     form_id VARCHAR(500) UNIQUE NOT NULL,
--     form_type VARCHAR(100) NOT NULL,
--     info JSONB NOT NULL,
--     score_table JSONB,
--     tong_diem_cb DECIMAL(5,2),
--     tong_diem_ch DECIMAL(5,2),
--     xep_loai_cb VARCHAR(50),
--     xep_loai_ch VARCHAR(50),
--     ngay_thang_cb VARCHAR(100),
--     ngay_thang_ch VARCHAR(100),
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- Insert sample data for testing (optional)
-- INSERT INTO forms (form_id, form_type, info, score_table, tong_diem_cb, tong_diem_ch, xep_loai_cb, xep_loai_ch) 
-- VALUES (
--     'test|test|test|test|test|test|test|test',
--     'phieu-cham-diem-dtcb',
--     '{"ho_ten": "Test User", "cap_bac": "Test", "chuc_vu": "Test", "don_vi": "Test", "ten_doi_tuong": "Test", "so_ho_so": "Test", "thoi_gian_tu_ngay": "01", "thoi_gian_den_ngay": "31"}',
--     '[]',
--     85.0,
--     82.0,
--     'Tốt',
--     'Tốt'
-- ) ON CONFLICT (form_id) DO NOTHING;
