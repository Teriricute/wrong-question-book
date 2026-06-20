-- ============================================================
-- 错题本 - Supabase 数据库迁移脚本
-- 在 Supabase SQL Editor 中执行此文件
-- ============================================================

-- 1. 创建 entries 表
CREATE TABLE IF NOT EXISTS entries (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subject     TEXT NOT NULL DEFAULT '',
  question    TEXT NOT NULL DEFAULT '',
  explanation TEXT NOT NULL DEFAULT '',
  reason      TEXT NOT NULL DEFAULT '',
  tags        TEXT[] NOT NULL DEFAULT '{}',
  image_url   TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  review_stage   INT NOT NULL DEFAULT 0,
  last_reviewed  TIMESTAMPTZ,
  next_review    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  mastered    BOOLEAN NOT NULL DEFAULT FALSE
);

-- 2. 创建索引
CREATE INDEX IF NOT EXISTS idx_entries_user_id ON entries(user_id);
CREATE INDEX IF NOT EXISTS idx_entries_next_review ON entries(user_id, next_review);
CREATE INDEX IF NOT EXISTS idx_entries_subject ON entries(user_id, subject);
CREATE INDEX IF NOT EXISTS idx_entries_mastered ON entries(user_id, mastered);

-- 3. 开启 Row Level Security
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;

-- 4. 创建 RLS 策略 —— 用户只能访问自己的数据
DROP POLICY IF EXISTS "Users can view own entries" ON entries;
CREATE POLICY "Users can view own entries"
  ON entries FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own entries" ON entries;
CREATE POLICY "Users can insert own entries"
  ON entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own entries" ON entries;
CREATE POLICY "Users can update own entries"
  ON entries FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own entries" ON entries;
CREATE POLICY "Users can delete own entries"
  ON entries FOR DELETE
  USING (auth.uid() = user_id);

-- 5. 创建 Storage Bucket（存储题目截图）
INSERT INTO storage.buckets (id, name, public)
VALUES ('question-images', 'question-images', true)
ON CONFLICT (id) DO NOTHING;

-- 6. Storage RLS 策略
DROP POLICY IF EXISTS "Anyone can view images" ON storage.objects;
CREATE POLICY "Anyone can view images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'question-images');

DROP POLICY IF EXISTS "Users can upload images" ON storage.objects;
CREATE POLICY "Users can upload images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'question-images' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can delete own images" ON storage.objects;
CREATE POLICY "Users can delete own images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'question-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 7. 创建实时订阅（用于多设备同步）
-- Supabase 新版本默认已包含所有表，这里做兼容处理
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'entries'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE entries;
  END IF;
END $$;
