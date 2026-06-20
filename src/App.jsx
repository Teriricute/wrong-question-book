import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from './lib/supabase';
import useEntries from './hooks/useEntries';
import Auth from './components/Auth';
import Header from './components/Header';
import EntryForm from './components/EntryForm';
import DetailModal from './components/DetailModal';
import ReviewMode from './components/ReviewMode';
import InkCheck from './components/InkCheck';
import {
  Search, X, BookOpen, Flame,
} from 'lucide-react';

/* ---------- design tokens ---------- */
const C = {
  paper: '#FBF7EE',
  paperCard: '#F4EEE0',
  ink: '#2B2A28',
  inkSoft: '#79736A',
  red: '#B23A2E',
  redSoft: '#E3A99E',
  gold: '#C2933C',
  sage: '#5B7F5E',
  grid: '#E2D9C6',
  border: '#DCD2BC',
};

const SUBJECT_PALETTE = [
  '#B23A2E', '#5B7F5E', '#3D6E8C', '#C2933C',
  '#8B5A8F', '#A14E4E', '#4E7A6E', '#7A5E3D',
];

function subjectColor(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return SUBJECT_PALETTE[h % SUBJECT_PALETTE.length];
}

function fmtDate(ts) {
  if (!ts) return '—';
  const d = new Date(ts);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

/* ---------- 应用入口 ---------- */
export default function App() {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [online, setOnline] = useState(navigator.onLine);

  // 监听在线状态
  useEffect(() => {
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  // 检查登录状态
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthChecked(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 数据管理
  const {
    entries, loading, saving, error, setError,
    addOrUpdate, removeEntry, markReviewed,
  } = useEntries(user);

  // UI 状态
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('全部');
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [detailId, setDetailId] = useState(null);
  const [reviewQueue, setReviewQueue] = useState(null);
  const [reviewIdx, setReviewIdx] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const importRef = useRef(null);

  // 计算数据
  const now = Date.now();
  const dueCount = entries.filter((e) => !e.mastered && e.nextReview <= now).length;
  const masteredCount = entries.filter((e) => e.mastered).length;
  const subjects = ['全部', ...Array.from(new Set(entries.map((e) => e.subject)))];

  const filtered = entries
    .filter((e) => subjectFilter === '全部' || e.subject === subjectFilter)
    .filter((e) => {
      if (!search.trim()) return true;
      const s = search.toLowerCase();
      return (
        (e.question || '').toLowerCase().includes(s) ||
        (e.explanation || '').toLowerCase().includes(s) ||
        (e.tags || []).some((t) => t.toLowerCase().includes(s))
      );
    })
    .sort((a, b) => {
      const aDue = !a.mastered && a.nextReview <= now;
      const bDue = !b.mastered && b.nextReview <= now;
      if (aDue !== bDue) return aDue ? -1 : 1;
      return b.createdAt - a.createdAt;
    });

  // 添加 / 更新
  const handleSave = useCallback(async (entry) => {
    if (editingId) {
      entry.id = editingId;
      entry.createdAt = entries.find((e) => e.id === editingId)?.createdAt || Date.now();
    }
    try {
      await addOrUpdate(entry);
      setShowAdd(false);
      setEditingId(null);
    } catch {
      // 错误已在 hook 中处理
    }
  }, [editingId, entries, addOrUpdate]);

  // 删除
  const handleDelete = useCallback(async () => {
    const entry = entries.find((e) => e.id === detailId);
    if (!entry) return;
    try {
      await removeEntry(entry.id, entry.image);
      setDetailId(null);
    } catch {
      // 错误已在 hook 中处理
    }
  }, [detailId, entries, removeEntry]);

  // 复习
  const handleReview = useCallback(async (knew) => {
    const entry = entries.find((e) => e.id === detailId);
    if (!entry) return;
    await markReviewed(entry, knew);
  }, [detailId, entries, markReviewed]);

  // 批量复习
  const startReview = () => {
    const queue = entries
      .filter((e) => !e.mastered && e.nextReview <= now)
      .sort((a, b) => a.nextReview - b.nextReview);
    if (queue.length === 0) return;
    setReviewQueue(queue);
    setReviewIdx(0);
    setShowAnswer(false);
  };

  const handleReviewAnswer = useCallback(async (knew) => {
    const entry = reviewQueue[reviewIdx];
    if (!entry) return;
    await markReviewed(entry, knew);
    if (reviewIdx + 1 < reviewQueue.length) {
      setReviewIdx(reviewIdx + 1);
      setShowAnswer(false);
    } else {
      setReviewQueue(null);
    }
  }, [reviewQueue, reviewIdx, markReviewed]);

  // 导出
  const exportData = () => {
    const exportEntries = entries.map((e) => ({
      subject: e.subject,
      question: e.question,
      explanation: e.explanation,
      reason: e.reason,
      tags: e.tags,
      imageUrl: e.image,
      createdAt: e.createdAt,
      reviewStage: e.reviewStage,
      lastReviewed: e.lastReviewed,
      nextReview: e.nextReview,
      mastered: e.mastered,
    }));

    const blob = new Blob([JSON.stringify(exportEntries, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const d = new Date();
    a.href = url;
    a.download = `错题本备份_${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 导入
  const importData = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const data = JSON.parse(reader.result);
        if (!Array.isArray(data)) throw new Error('格式不对');

        let imported = 0;
        for (const item of data) {
          try {
            await addOrUpdate({
              subject: item.subject || '',
              question: item.question || '',
              explanation: item.explanation || '',
              reason: item.reason || '',
              tags: item.tags || [],
              image: item.imageUrl || item.image || null,
              createdAt: item.createdAt || Date.now(),
              reviewStage: item.reviewStage || 0,
              lastReviewed: item.lastReviewed || null,
              nextReview: item.nextReview || Date.now(),
              mastered: item.mastered || false,
            });
            imported++;
          } catch {
            // 单条导入失败，继续
          }
        }
        if (imported > 0) {
          setError('');
        }
      } catch {
        setError('导入失败：文件格式不正确');
      }
    };
    reader.readAsText(file);
  };

  // 退出登录
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const detailEntry = detailId ? entries.find((e) => e.id === detailId) : null;
  const editEntry = editingId ? entries.find((e) => e.id === editingId) : null;

  // 加载中
  if (!authChecked) {
    return (
      <div style={{
        background: C.paper,
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 16,
      }}>
        <BookOpen size={36} color={C.border} />
        <p style={{ color: C.inkSoft, fontSize: 14 }}>加载中…</p>
      </div>
    );
  }

  // 未登录 → 显示登录页
  if (!user) {
    return <Auth />;
  }

  // 主体
  return (
    <div style={{ background: C.paper, minHeight: '100vh', color: C.ink }}>
      {/* 顶部 */}
      <Header
        totalCount={entries.length}
        dueCount={dueCount}
        masteredCount={masteredCount}
        saving={saving}
        error={error}
        online={online}
        onAdd={() => { setEditingId(null); setShowAdd(true); }}
        onExport={exportData}
        onImport={() => importRef.current?.click()}
        onLogout={handleLogout}
      />

      <input
        ref={importRef}
        type="file"
        accept="application/json"
        style={{ display: 'none' }}
        onChange={(e) => {
          if (e.target.files?.[0]) importData(e.target.files[0]);
          e.target.value = '';
        }}
      />

      {/* 待复习横幅 */}
      {dueCount > 0 && (
        <div style={{
          margin: '16px 20px 0',
          padding: '14px 18px',
          borderRadius: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 10,
          background: '#FBF0DD',
          border: `1px solid ${C.gold}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Flame size={18} color={C.gold} />
            <span style={{ fontSize: 14 }}>
              今天有 <b className="mono">{dueCount}</b> 道题到复习时间了
            </span>
          </div>
          <button
            onClick={startReview}
            style={{
              padding: '8px 18px',
              fontSize: 13,
              fontWeight: 600,
              borderRadius: 8,
              border: 'none',
              background: C.gold,
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            开始复习
          </button>
        </div>
      )}

      {/* 搜索框 */}
      <div style={{ padding: '0 20px', marginTop: 20 }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 14px',
          borderRadius: 10,
          border: `1px solid ${C.border}`,
          background: '#fff',
          maxWidth: 400,
        }}>
          <Search size={15} color={C.inkSoft} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索题目、解析或标签…"
            style={{
              flex: 1,
              fontSize: 14,
              border: 'none',
              background: 'transparent',
              outline: 'none',
              color: C.ink,
            }}
          />
          {search && (
            <X
              size={14}
              color={C.inkSoft}
              style={{ cursor: 'pointer' }}
              onClick={() => setSearch('')}
            />
          )}
        </div>
      </div>

      {/* 学科筛选 */}
      <div style={{
        display: 'flex',
        gap: 8,
        padding: '14px 20px',
        overflowX: 'auto',
      }}>
        {subjects.map((s) => (
          <button
            key={s}
            onClick={() => setSubjectFilter(s)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 14px',
              fontSize: 12,
              borderRadius: 99,
              whiteSpace: 'nowrap',
              border: `1px solid ${subjectFilter === s ? C.red : C.border}`,
              background: subjectFilter === s ? C.red : '#fff',
              color: subjectFilter === s ? '#fff' : C.ink,
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            {s !== '全部' && (
              <span style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: subjectFilter === s ? '#fff' : subjectColor(s),
              }} />
            )}
            {s}
          </button>
        ))}
      </div>

      {/* 卡片列表 */}
      <main style={{ padding: '0 20px 40px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', paddingTop: 60 }}>
            <p style={{ color: C.inkSoft, fontSize: 14 }}>加载中…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{
            textAlign: 'center',
            paddingTop: 60,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}>
            <BookOpen size={36} color={C.border} />
            <p className="serif" style={{ fontSize: 17, marginTop: 14, color: C.ink }}>
              {entries.length === 0 ? '还没有错题记录' : '没有符合条件的记录'}
            </p>
            <p style={{ fontSize: 13, color: C.inkSoft, marginTop: 4 }}>
              {entries.length === 0
                ? '点击右上角「记一道错题」，开始建立你的专属错题档案'
                : '换个关键词或学科试试'}
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 16,
            paddingTop: 4,
          }}>
            {filtered.map((e) => {
              const isDue = !e.mastered && e.nextReview <= now;
              return (
                <div
                  key={e.id}
                  onClick={() => setDetailId(e.id)}
                  style={{
                    cursor: 'pointer',
                    borderRadius: 10,
                    padding: '18px 16px',
                    background: C.paperCard,
                    borderLeft: `4px solid ${subjectColor(e.subject)}`,
                    border: `1px solid ${C.border}`,
                    borderLeftWidth: 4,
                    boxShadow: isDue ? `0 0 0 2px ${C.gold}` : 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                    animation: 'fadeIn 0.25s ease-out',
                  }}
                >
                  {/* 学科 + 状态 */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                    <span style={{
                      fontSize: 11,
                      padding: '3px 10px',
                      borderRadius: 99,
                      background: '#fff',
                      color: subjectColor(e.subject),
                      border: `1px solid ${subjectColor(e.subject)}`,
                    }}>
                      {e.subject}
                    </span>
                    {e.mastered ? (
                      <InkCheck size={18} />
                    ) : isDue && (
                      <span className="mono" style={{ fontSize: 11, color: C.gold, fontWeight: 500 }}>
                        待复习
                      </span>
                    )}
                  </div>

                  {/* 题目摘要 */}
                  <p style={{
                    fontSize: 14,
                    lineHeight: 1.5,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}>
                    {e.question}
                  </p>

                  {/* 图片缩略图 */}
                  {e.image && (
                    <img
                      src={e.image}
                      alt="题目截图"
                      style={{
                        width: '100%',
                        maxHeight: 110,
                        objectFit: 'cover',
                        borderRadius: 6,
                        border: `1px solid ${C.border}`,
                      }}
                    />
                  )}

                  {/* 标签 + 日期 */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: 4,
                  }}>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {(e.tags || []).slice(0, 3).map((t) => (
                        <span
                          key={t}
                          className="mono"
                          style={{
                            fontSize: 10,
                            padding: '2px 8px',
                            borderRadius: 8,
                            background: '#fff',
                            color: C.inkSoft,
                            border: `1px solid ${C.border}`,
                          }}
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                    <span className="mono" style={{ fontSize: 11, color: C.inkSoft }}>
                      {fmtDate(e.createdAt)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* 模态框 */}
      {showAdd && (
        <EntryForm
          initial={editEntry}
          onCancel={() => { setShowAdd(false); setEditingId(null); }}
          onSave={handleSave}
        />
      )}

      {detailEntry && (
        <DetailModal
          entry={detailEntry}
          onClose={() => setDetailId(null)}
          onEdit={() => {
            setEditingId(detailEntry.id);
            setShowAdd(true);
            setDetailId(null);
          }}
          onDelete={handleDelete}
          onReview={handleReview}
        />
      )}

      {reviewQueue && (
        <ReviewMode
          queue={reviewQueue}
          idx={reviewIdx}
          showAnswer={showAnswer}
          onShowAnswer={() => setShowAnswer(true)}
          onAnswer={handleReviewAnswer}
          onClose={() => setReviewQueue(null)}
        />
      )}
    </div>
  );
}
