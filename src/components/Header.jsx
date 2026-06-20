import React from 'react';
import {
  Plus, Download, Upload, LogOut, Cloud, CloudOff,
} from 'lucide-react';

const C = {
  paper: '#FBF7EE',
  ink: '#2B2A28',
  inkSoft: '#79736A',
  red: '#B23A2E',
  border: '#DCD2BC',
  sage: '#5B7F5E',
};

export default function Header({
  totalCount,
  dueCount,
  masteredCount,
  saving,
  error,
  online,
  onAdd,
  onExport,
  onImport,
  onLogout,
}) {
  return (
    <header
      style={{
        padding: '28px 24px 16px',
        borderBottom: `1px solid ${C.border}`,
        background: C.paper,
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
      }}>
        {/* 左侧标题 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 4,
            height: 34,
            background: C.red,
            borderRadius: 2,
          }} />
          <div>
            <h1
              className="serif"
              style={{
                fontSize: 26,
                fontWeight: 900,
                letterSpacing: 1,
                color: C.ink,
                margin: 0,
              }}
            >
              错题本
            </h1>
            <p
              className="mono"
              style={{
                fontSize: 11,
                color: C.inkSoft,
                marginTop: 2,
              }}
            >
              共 {totalCount} 条 · 待复习 {dueCount} 条 · 已掌握 {masteredCount} 条
            </p>
          </div>
          {/* 在线状态 */}
          <span style={{
            fontSize: 10,
            padding: '2px 8px',
            borderRadius: 99,
            background: online ? '#E8F5E9' : '#FFF3E0',
            color: online ? C.sage : '#E65100',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}>
            {online ? <Cloud size={11} /> : <CloudOff size={11} />}
            {online ? '已同步' : '离线'}
          </span>
        </div>

        {/* 右侧按钮组 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <button
            onClick={onExport}
            title="导出备份"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '8px 12px',
              fontSize: 12,
              borderRadius: 8,
              border: `1px solid ${C.border}`,
              color: C.inkSoft,
              background: 'transparent',
              cursor: 'pointer',
            }}
          >
            <Download size={14} /> 备份
          </button>
          <button
            onClick={onImport}
            title="导入备份"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '8px 12px',
              fontSize: 12,
              borderRadius: 8,
              border: `1px solid ${C.border}`,
              color: C.inkSoft,
              background: 'transparent',
              cursor: 'pointer',
            }}
          >
            <Upload size={14} /> 导入
          </button>
          <button
            onClick={onAdd}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '10px 18px',
              fontSize: 14,
              fontWeight: 600,
              borderRadius: 8,
              color: '#fff',
              background: C.red,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <Plus size={16} /> 记一道错题
          </button>
          <button
            onClick={onLogout}
            title="退出登录"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '8px 10px',
              fontSize: 12,
              borderRadius: 8,
              border: `1px solid ${C.border}`,
              color: C.inkSoft,
              background: 'transparent',
              cursor: 'pointer',
            }}
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>

      {/* 状态信息 */}
      {error && (
        <p style={{ color: C.red, fontSize: 12, marginTop: 8 }}>{error}</p>
      )}
      {saving && (
        <p style={{ color: C.inkSoft, fontSize: 12, marginTop: 8 }}>保存中…</p>
      )}
    </header>
  );
}
