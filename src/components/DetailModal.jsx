import React, { useState } from 'react';
import { X, Edit2, Trash2, RotateCcw, Check } from 'lucide-react';
import InkCheck from './InkCheck';

const C = {
  paper: '#FBF7EE',
  paperCard: '#F4EEE0',
  ink: '#2B2A28',
  inkSoft: '#79736A',
  red: '#B23A2E',
  border: '#DCD2BC',
  sage: '#5B7F5E',
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

export default function DetailModal({ entry, onClose, onEdit, onDelete, onReview }) {
  const [confirmDelete, setConfirmDelete] = useState(false);

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
      onClick={onClose}
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
        {/* 顶部操作栏 */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: 16,
        }}>
          <span style={{
            fontSize: 12,
            padding: '4px 10px',
            borderRadius: 99,
            background: '#fff',
            color: subjectColor(entry.subject),
            border: `1px solid ${subjectColor(entry.subject)}`,
          }}>
            {entry.subject}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Edit2
              size={16}
              style={{ cursor: 'pointer', color: C.inkSoft }}
              onClick={onEdit}
            />
            <Trash2
              size={16}
              style={{ cursor: 'pointer', color: C.red }}
              onClick={() => setConfirmDelete(true)}
            />
            <X
              size={18}
              style={{ cursor: 'pointer', color: C.inkSoft }}
              onClick={onClose}
            />
          </div>
        </div>

        {/* 删除确认 */}
        {confirmDelete && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 14px',
            borderRadius: 8,
            background: '#FBEAE7',
            marginBottom: 16,
          }}>
            <span style={{ fontSize: 13, color: C.ink }}>确定删除这道题吗？此操作无法撤销</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setConfirmDelete(false)}
                style={{
                  padding: '6px 12px',
                  fontSize: 12,
                  borderRadius: 8,
                  border: `1px solid ${C.border}`,
                  background: '#fff',
                  cursor: 'pointer',
                }}
              >
                取消
              </button>
              <button
                onClick={onDelete}
                style={{
                  padding: '6px 12px',
                  fontSize: 12,
                  borderRadius: 8,
                  border: 'none',
                  background: C.red,
                  color: '#fff',
                  cursor: 'pointer',
                }}
              >
                删除
              </button>
            </div>
          </div>
        )}

        {/* 题目内容 */}
        <p style={{
          fontSize: 15,
          lineHeight: 1.7,
          whiteSpace: 'pre-wrap',
          color: C.ink,
        }}>
          {entry.question}
        </p>

        {/* 图片 */}
        {entry.image && (
          <img
            src={entry.image}
            alt="题目截图"
            style={{
              marginTop: 12,
              width: '100%',
              borderRadius: 8,
              border: `1px solid ${C.border}`,
            }}
          />
        )}

        {/* 错误原因 */}
        {entry.reason && (
          <p style={{
            marginTop: 12,
            fontSize: 12,
            padding: '6px 12px',
            borderRadius: 99,
            display: 'inline-block',
            background: '#fff',
            color: C.inkSoft,
            border: `1px solid ${C.border}`,
          }}>
            错因：{entry.reason}
          </p>
        )}

        {/* 解析 */}
        {entry.explanation && (
          <div style={{
            marginTop: 14,
            padding: '14px 16px',
            borderRadius: 8,
            background: C.paperCard,
            border: `1px solid ${C.border}`,
          }}>
            <p className="mono" style={{ fontSize: 11, color: C.inkSoft, marginBottom: 6 }}>
              解析
            </p>
            <p style={{
              fontSize: 14,
              lineHeight: 1.7,
              whiteSpace: 'pre-wrap',
              color: C.ink,
            }}>
              {entry.explanation}
            </p>
          </div>
        )}

        {/* 标签 */}
        {(entry.tags || []).length > 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14 }}>
            {entry.tags.map((t) => (
              <span
                key={t}
                className="mono"
                style={{
                  fontSize: 11,
                  padding: '4px 10px',
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
        )}

        {/* 复习时间线 */}
        <p className="mono" style={{ marginTop: 18, fontSize: 11, color: C.inkSoft }}>
          记录于 {fmtDate(entry.createdAt)} · 上次复习 {fmtDate(entry.lastReviewed)} · 下次复习 {fmtDate(entry.nextReview)}
        </p>

        {/* 复习按钮 */}
        {entry.mastered ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginTop: 18,
            color: C.sage,
          }}>
            <InkCheck size={20} />
            <span style={{ fontSize: 14, fontWeight: 500 }}>已掌握</span>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
            <button
              onClick={() => onReview(false)}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                padding: '12px 0',
                fontSize: 14,
                borderRadius: 8,
                border: `1px solid ${C.border}`,
                background: '#fff',
                cursor: 'pointer',
                color: C.ink,
              }}
            >
              <RotateCcw size={14} /> 还不熟练
            </button>
            <button
              onClick={() => onReview(true)}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                padding: '12px 0',
                fontSize: 14,
                borderRadius: 8,
                border: 'none',
                background: C.sage,
                color: '#fff',
                cursor: 'pointer',
              }}
            >
              <Check size={14} /> 这次会了
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
