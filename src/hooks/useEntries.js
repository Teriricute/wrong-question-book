import { useState, useEffect, useCallback } from 'react';
import { supabase, uploadImage, deleteImage } from '../lib/supabase';

export const INTERVALS = [1, 3, 7, 15, 30, 60]; // 复习间隔（天）

export function nextReviewTs(stage) {
  const days = INTERVALS[Math.min(stage, INTERVALS.length - 1)];
  return Date.now() + days * 86400000;
}

/**
 * 错题条目 CRUD + 实时同步 Hook
 * @param {object|null} user - Supabase auth user
 */
export default function useEntries(user) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // 将数据库行格式转换为本地格式
  const rowToEntry = (row) => ({
    id: row.id,
    userId: row.user_id,
    subject: row.subject,
    question: row.question || '',
    explanation: row.explanation || '',
    reason: row.reason || '',
    tags: row.tags || [],
    image: row.image_url || null,
    createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
    reviewStage: row.review_stage || 0,
    lastReviewed: row.last_reviewed ? new Date(row.last_reviewed).getTime() : null,
    nextReview: row.next_review ? new Date(row.next_review).getTime() : Date.now(),
    mastered: row.mastered || false,
  });

  // 加载数据 + 实时订阅
  useEffect(() => {
    if (!user) {
      setEntries([]);
      setLoading(false);
      return;
    }

    let mounted = true;

    const loadEntries = async () => {
      setLoading(true);
      try {
        const { data, error: loadErr } = await supabase
          .from('entries')
          .select('*')
          .order('created_at', { ascending: false });

        if (loadErr) throw loadErr;
        if (mounted) {
          setEntries((data || []).map(rowToEntry));
          setError('');
        }
      } catch (err) {
        console.error('加载数据失败:', err);
        if (mounted) setError('加载数据失败，请检查网络后刷新');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadEntries();

    // 实时订阅 —— 多设备同步的核心
    const channel = supabase
      .channel('entries-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'entries', filter: `user_id=eq.${user.id}` },
        () => {
          // 任何变更都重新加载全量数据（保证一致性）
          loadEntries();
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [user]);

  // 添加/更新条目
  const addOrUpdate = useCallback(async (entry) => {
    setSaving(true);
    setError('');

    try {
      let imageUrl = entry.image;

      // 如果是新的 base64 图片（未上传到云端），先上传
      if (imageUrl && imageUrl.startsWith('data:')) {
        const uploaded = await uploadImage(imageUrl, user.id);
        if (uploaded) imageUrl = uploaded;
        // 如果上传失败，保留 base64 作为 fallback
      }

      const row = {
        user_id: user.id,
        subject: entry.subject,
        question: entry.question,
        explanation: entry.explanation,
        reason: entry.reason,
        tags: entry.tags,
        image_url: imageUrl,
        review_stage: entry.reviewStage,
        last_reviewed: entry.lastReviewed ? new Date(entry.lastReviewed).toISOString() : null,
        next_review: new Date(entry.nextReview).toISOString(),
        mastered: entry.mastered,
      };

      let result;
      if (entry.id) {
        // 更新现有条目
        result = await supabase
          .from('entries')
          .update(row)
          .eq('id', entry.id)
          .eq('user_id', user.id)
          .select()
          .single();
      } else {
        // 创建新条目
        row.created_at = new Date(entry.createdAt).toISOString();
        result = await supabase
          .from('entries')
          .insert(row)
          .select()
          .single();
      }

      if (result.error) throw result.error;

      // 实时订阅会自动刷新列表，这里乐观更新
      // 无需手动 setEntries
    } catch (err) {
      console.error('保存失败:', err);
      setError('保存失败，请检查网络后重试');
      throw err;
    } finally {
      setSaving(false);
    }
  }, [user]);

  // 删除条目
  const removeEntry = useCallback(async (id, imageUrl) => {
    setSaving(true);
    setError('');

    try {
      // 删除云端图片
      if (imageUrl && !imageUrl.startsWith('data:')) {
        await deleteImage(imageUrl);
      }

      const { error: delErr } = await supabase
        .from('entries')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (delErr) throw delErr;
    } catch (err) {
      console.error('删除失败:', err);
      setError('删除失败，请检查网络后重试');
      throw err;
    } finally {
      setSaving(false);
    }
  }, [user]);

  // 标记复习结果
  const markReviewed = useCallback(async (entry, knew) => {
    let stage = entry.reviewStage || 0;
    stage = knew ? stage + 1 : Math.max(0, stage - 1);
    const mastered = knew && stage >= INTERVALS.length;

    const row = {
      review_stage: stage,
      last_reviewed: new Date().toISOString(),
      next_review: new Date(nextReviewTs(stage)).toISOString(),
      mastered,
    };

    setSaving(true);
    try {
      const { error: updateErr } = await supabase
        .from('entries')
        .update(row)
        .eq('id', entry.id)
        .eq('user_id', user.id);

      if (updateErr) throw updateErr;
    } catch (err) {
      console.error('更新复习状态失败:', err);
      setError('更新失败，请检查网络后重试');
    } finally {
      setSaving(false);
    }
  }, [user]);

  return {
    entries,
    loading,
    saving,
    error,
    setError,
    addOrUpdate,
    removeEntry,
    markReviewed,
  };
}
