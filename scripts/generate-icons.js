/**
 * 生成 PWA 图标 (PNG)
 * 运行: node scripts/generate-icons.js
 * 如果 node 环境没有 canvas，可以用浏览器打开 scripts/generate-icons.html 生成
 */
import { createCanvas } from 'canvas';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');

function drawIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // 背景
  const pad = size * 0.08;
  const w = size - pad * 2;
  const h = size * 0.78 - pad * 2;

  // 书本主体
  ctx.fillStyle = '#B23A2E';
  ctx.strokeStyle = '#8B2218';
  ctx.lineWidth = size * 0.03;
  ctx.beginPath();
  const rx = size * 0.08;
  ctx.roundRect(pad, pad, w, h, rx);
  ctx.fill();
  ctx.stroke();

  // 中线
  ctx.strokeStyle = '#FBF7EE';
  ctx.globalAlpha = 0.6;
  ctx.lineWidth = size * 0.02;
  ctx.beginPath();
  ctx.moveTo(size / 2, pad);
  ctx.lineTo(size / 2, pad + h);
  ctx.stroke();

  // 装饰弧线
  ctx.globalAlpha = 1;
  ctx.strokeStyle = '#FBF7EE';
  ctx.lineWidth = size * 0.02;
  ctx.beginPath();
  ctx.ellipse(size / 2, size * 0.38, size * 0.15, size * 0.06, 0, 0, Math.PI * 2);
  ctx.stroke();

  // 点
  ctx.fillStyle = '#FBF7EE';
  ctx.globalAlpha = 0.4;
  ctx.beginPath();
  ctx.arc(size / 2, size * 0.55, size * 0.04, 0, Math.PI * 2);
  ctx.fill();

  // 垂线
  ctx.strokeStyle = '#FBF7EE';
  ctx.lineWidth = size * 0.015;
  ctx.beginPath();
  ctx.moveTo(size / 2, size * 0.6);
  ctx.lineTo(size / 2, pad + h - size * 0.06);
  ctx.stroke();

  return canvas.toBuffer('image/png');
}

try {
  mkdirSync(publicDir, { recursive: true });

  writeFileSync(join(publicDir, 'icon-192.png'), drawIcon(192));
  console.log('✓ icon-192.png generated');

  writeFileSync(join(publicDir, 'icon-512.png'), drawIcon(512));
  console.log('✓ icon-512.png generated');

  console.log('\nIcons generated successfully!');
} catch (err) {
  if (err.code === 'MODULE_NOT_FOUND') {
    console.error('请先安装 canvas: npm install canvas');
    console.error('或者用浏览器打开 scripts/generate-icons.html 生成图标');
  } else {
    console.error(err);
  }
}
