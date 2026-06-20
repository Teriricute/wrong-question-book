import React from 'react';
import { X, RotateCcw, Check } from 'lucide-react';

const C = {
  paper: '#FBF7EE',
  paperCard: '#F4EEE0',
  ink: '#2B2A28',
  inkSoft: '#79736A',
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

export default function ReviewMode({ queue, idx, showAnswer, onShowAnswer, onAnswer, onClose }) {
  const entry = queue[idx];

  if (!entry) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        background: C.paper,
      }}
    >
      {/* 顶部栏 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px',
        borderBottom: `1px solid ${C.border}`,
      }}>
        <span className="mono" style={{ fontSize: 12, color: C.inkSoft }}>
          复习中 {idx + 1} / {queue.length}
        </span>
        <X
          size={20}
          style={{ cursor: 'pointer', color: C.inkSoft }}
          onClick={onClose}
        />
      </div>

      {/* 主体内容 */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '32px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <div style={{ width: '100%', maxWidth: 520 }}>
          {/* 学科标签 */}
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

          {/* 题目 */}
          <p style={{
            marginTop: 18,
            fontSize: 17,
            lineHeight: 1.8,
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
                marginTop: 16,
                width: '100%',
                borderRadius: 8,
                border: `1px solid ${C.border}`,
              }}
            />
          )}

          {/* 答案区域 */}
          {!showAnswer ? (
            <button
              onClick={onShowAnswer}
              style={{
                marginTop: 28,
                padding: '12px 24px',
                fontSize: 14,
                borderRadius: 8,
                border: `1px solid ${C.border}`,
                background: '#fff',
                color: C.ink,
                cursor: 'pointer',
                display: 'block',
                margin: '28px auto 0',
              }}
            >
              查看解析
            </button>
          ) : (
            <div style={{
              marginTop: 24,
              padding: '18px',
              borderRadius: 10,
              background: C.paperCard,
              border: `1px solid ${C.border}`,
            }}>
              {entry.reason && (
                <p style={{
                  marginBottom: 10,
                  fontSize: 12,
                  color: C.inkSoft,
                }}>
                  错因：{entry.reason}
                </p>
              )}
              <p style={{
                fontSize: 14,
                lineHeight: 1.7,
                whiteSpace: 'pre-wrap',
                color: C.ink,
              }}>
                {entry.explanation || '（未填写解析）'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 底部按钮 */}
      {showAnswer && (
        <div style={{
          display: 'flex',
          gap: 12,
          padding: '18px 20px',
          maxWidth: 520,
          width: '100%',
          margin: '0 auto',
          borderTop: `1px solid ${C.border}`,
        }}>
          <button
            onClick={() => onAnswer(false)}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              padding: '14px 0',
              fontSize: 14,
              borderRadius: 8,
              border: `1px solid ${C.border}`,
              background: '#fff',
              color: C.ink,
              cursor: 'pointer',
            }}
          >
            <RotateCcw size={15} /> 还不熟练
          </button>
          <button
            onClick={() => onAnswer(true)}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              padding: '14px 0',
              fontSize: 14,
              borderRadius: 8,
              border: 'none',
              background: C.sage,
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            <Check size={15} /> 这次会了
          </button>
        </div>
      )}
    </div>
  );
}
