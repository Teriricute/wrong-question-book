import React from 'react';

const C = {
  red: '#B23A2E',
};

export default function InkCheck({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" style={{ overflow: 'visible' }}>
      <circle
        cx="20" cy="20" r="17"
        fill="none"
        stroke={C.red}
        strokeWidth="2.5"
        strokeDasharray="107"
        strokeDashoffset="0"
        style={{ animation: 'inkDraw 0.5s ease-out' }}
        strokeLinecap="round"
      />
      <path
        d="M12 20 L18 26 L29 13"
        fill="none"
        stroke={C.red}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="26"
        strokeDashoffset="0"
        style={{ animation: 'inkDraw2 0.35s ease-out 0.35s both' }}
      />
    </svg>
  );
}
