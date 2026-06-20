import React, { useState, useRef } from 'react';
import { X, Image as ImageIcon } from 'lucide-react';

const C = {
  paper: '#FBF7EE',
  paperCard: '#F4EEE0',
  ink: '#2B2A28',
  inkSoft: '#79736A',
  red: '#B23A2E',
  border: '#DCD2BC',
};

const SUBJECT_SUGGEST = [
  '统计学', '概率论', '线性代数', '计量经济学',
  '非参数统计', 'R语言', 'Python', '英语', '其他',
];
const REASON_OPTS = [
  '粗心', '概念不清', '计算错误', '审题错误',
  '方法不会', '公式记错', '其他',
];

/** 压缩图片（与原始逻辑一致） */
function compressImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('读取图片失败'));
    reader.onload = () => {
      const img = new window.Image();
      img.onerror = () => reject(new Error('图片解析失败'));
      img.onload = () => {
        const maxW = 1000;
        const scale = Math.min(1, maxW / img.width);
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.72));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

export default function EntryForm({ initial, onCancel, onSave }) {
  const [subject, setSubject] = useState(initial?.subject || '');
  const [question, setQuestion] = useState(initial?.question || '');
  const [explanation, setExplanation] = useState(initial?.explanation || '');
  const [reason, setReason] = useState(initial?.reason || '');
  const [tagsText, setTagsText] = useState((initial?.tags || []).join('、'));
  const [image, setImage] = useState(initial?.image || null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const fileRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    setBusy(true);
    setErr('');
    try {
      const compressed = await compressImage(file);
      setImage(compressed);
    } catch (e) {
      setErr('图片处理失败，换一张试试');
    } finally {
      setBusy(false);
    }
  };

  const save = () => {
    if (!subject.trim()) { setErr('请填写学科'); return; }
    if (!question.trim() && !image) { setErr('请输入题目内容或上传图片'); return; }

    const tags = tagsText.split(/[、,，]/).map(t => t.trim()).filter(Boolean);

    const entry = initial
      ? { ...initial, subject: subject.trim(), question, explanation, reason, tags, image }
      : {
          subject: subject.trim(),
          question,
          explanation,
          reason,
          tags,
          image,
          createdAt: Date.now(),
          reviewStage: 0,
          lastReviewed: null,
          nextReview: Date.now(),
          mastered: false,
        };

    onSave(entry);
  };

  return (
    <div
      className="modal-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        background: 'rgba(43,42,40,0.5)',
      }}
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="modal-content animate-slide-up"
        style={{
          width: '100%',
          maxWidth: 520,
          maxHeight: '92vh',
          overflowY: 'auto',
          background: C.paper,
          borderRadius: '16px 16px 0 0',
          padding: '24px 20px',
        }}
      >
        {/* 标题 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 20,
        }}>
          <h2 className="serif" style={{ fontSize: 19, fontWeight: 700, color: C.ink, margin: 0 }}>
            {initial ? '编辑错题' : '记一道错题'}
          </h2>
          <X size={20} style={{ cursor: 'pointer', color: C.inkSoft }} onClick={onCancel} />
        </div>

        {/* 学科 */}
        <label style={{ fontSize: 12, color: C.inkSoft, display: 'block', marginBottom: 4 }}>学科</label>
        <input
          list="subject-list"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="例如：计量经济学"
          style={{
            width: '100%',
            marginBottom: 14,
            padding: '10px 12px',
            fontSize: 14,
            borderRadius: 8,
            border: `1px solid ${C.border}`,
            background: '#fff',
          }}
        />
        <datalist id="subject-list">
          {SUBJECT_SUGGEST.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>

        {/* 题目内容 */}
        <label style={{ fontSize: 12, color: C.inkSoft, display: 'block', marginBottom: 4 }}>题目内容</label>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="输入或粘贴题目文字…"
          rows={4}
          style={{
            width: '100%',
            marginBottom: 14,
            padding: '10px 12px',
            fontSize: 14,
            borderRadius: 8,
            border: `1px solid ${C.border}`,
            background: '#fff',
            resize: 'none',
            lineHeight: 1.6,
          }}
        />

        {/* 图片上传 */}
        <label style={{ fontSize: 12, color: C.inkSoft, display: 'block', marginBottom: 4 }}>题目截图（可选）</label>
        <div style={{ marginBottom: 14 }}>
          {image ? (
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <img
                src={image}
                alt="预览"
                style={{
                  maxHeight: 160,
                  maxWidth: '100%',
                  borderRadius: 8,
                  border: `1px solid ${C.border}`,
                }}
              />
              <button
                onClick={() => setImage(null)}
                style={{
                  position: 'absolute',
                  top: -8,
                  right: -8,
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  background: C.red,
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={12} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileRef.current?.click()}
              disabled={busy}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 14px',
                fontSize: 13,
                borderRadius: 8,
                border: `1px dashed ${C.border}`,
                color: C.inkSoft,
                background: '#fff',
                cursor: busy ? 'not-allowed' : 'pointer',
              }}
            >
              <ImageIcon size={15} /> {busy ? '处理中…' : '上传图片'}
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => {
              if (e.target.files?.[0]) handleFile(e.target.files[0]);
              e.target.value = '';
            }}
          />
        </div>

        {/* 错误原因 */}
        <label style={{ fontSize: 12, color: C.inkSoft, display: 'block', marginBottom: 6 }}>错误原因</label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
          {REASON_OPTS.map((r) => (
            <button
              key={r}
              onClick={() => setReason(reason === r ? '' : r)}
              style={{
                padding: '6px 12px',
                fontSize: 12,
                borderRadius: 99,
                border: `1px solid ${reason === r ? C.red : C.border}`,
                background: reason === r ? C.red : '#fff',
                color: reason === r ? '#fff' : C.ink,
                cursor: 'pointer',
              }}
            >
              {r}
            </button>
          ))}
        </div>

        {/* 解析 */}
        <label style={{ fontSize: 12, color: C.inkSoft, display: 'block', marginBottom: 4 }}>解析 / 正确思路</label>
        <textarea
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          placeholder="写下正确的解法或要点，方便复习时回顾…"
          rows={4}
          style={{
            width: '100%',
            marginBottom: 14,
            padding: '10px 12px',
            fontSize: 14,
            borderRadius: 8,
            border: `1px solid ${C.border}`,
            background: '#fff',
            resize: 'none',
            lineHeight: 1.6,
          }}
        />

        {/* 标签 */}
        <label style={{ fontSize: 12, color: C.inkSoft, display: 'block', marginBottom: 4 }}>标签（用顿号或逗号分隔）</label>
        <input
          value={tagsText}
          onChange={(e) => setTagsText(e.target.value)}
          placeholder="例如：假设检验、易错点"
          style={{
            width: '100%',
            marginBottom: 20,
            padding: '10px 12px',
            fontSize: 14,
            borderRadius: 8,
            border: `1px solid ${C.border}`,
            background: '#fff',
          }}
        />

        {/* 错误提示 */}
        {err && (
          <p style={{ color: C.red, fontSize: 12, marginBottom: 14 }}>{err}</p>
        )}

        {/* 按钮 */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '10px 20px',
              fontSize: 14,
              borderRadius: 8,
              border: `1px solid ${C.border}`,
              background: 'transparent',
              color: C.ink,
              cursor: 'pointer',
            }}
          >
            取消
          </button>
          <button
            onClick={save}
            style={{
              padding: '10px 20px',
              fontSize: 14,
              borderRadius: 8,
              border: 'none',
              background: C.red,
              color: '#fff',
              cursor: 'pointer',
          }}
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
