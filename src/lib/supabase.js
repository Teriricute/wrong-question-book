import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase 未配置。\n' +
    '1. 前往 https://supabase.com 创建免费项目\n' +
    '2. 复制 .env.example 为 .env\n' +
    '3. 填入你的 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY'
  );
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);

/**
 * 上传图片到 Supabase Storage
 * @param {string} base64Data - base64 格式的图片数据
 * @param {string} userId - 用户 ID
 * @returns {Promise<string|null>} 图片的公开 URL 或 null
 */
export async function uploadImage(base64Data, userId) {
  try {
    // 将 base64 转换为 Blob
    const mime = base64Data.match(/^data:(image\/\w+);base64,/);
    const ext = mime ? mime[1].split('/')[1] : 'jpg';
    const base64 = base64Data.replace(/^data:image\/\w+;base64,/, '');
    const byteChars = atob(base64);
    const byteNums = new Array(byteChars.length);
    for (let i = 0; i < byteChars.length; i++) {
      byteNums[i] = byteChars.charCodeAt(i);
    }
    const byteArr = new Uint8Array(byteNums);
    const blob = new Blob([byteArr], { type: `image/${ext}` });

    const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { data, error } = await supabase.storage
      .from('question-images')
      .upload(fileName, blob, {
        contentType: `image/${ext}`,
        upsert: false,
      });

    if (error) throw error;

    // 获取公开 URL
    const { data: urlData } = supabase.storage
      .from('question-images')
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  } catch (err) {
    console.error('上传图片失败:', err);
    return null;
  }
}

/**
 * 删除图片
 * @param {string} url - 图片 URL
 */
export async function deleteImage(url) {
  try {
    const pathMatch = url.match(/\/question-images\/(.+)$/);
    if (!pathMatch) return;
    await supabase.storage.from('question-images').remove([pathMatch[1]]);
  } catch (err) {
    console.error('删除图片失败:', err);
  }
}
