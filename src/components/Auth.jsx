import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { BookOpen, Mail, Lock, User, AlertCircle } from 'lucide-react';

const C = {
  paper: '#FBF7EE',
  paperCard: '#F4EEE0',
  ink: '#2B2A28',
  inkSoft: '#79736A',
  red: '#B23A2E',
  border: '#DCD2BC',
  sage: '#5B7F5E',
};

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (isLogin) {
        const { error: loginErr } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (loginErr) throw loginErr;
      } else {
        const { error: signUpErr } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: window.location.origin,
          },
        });
        if (signUpErr) throw signUpErr;
        setMessage('注册成功！请查收邮箱验证邮件（如已开启），或直接登录。');
        setIsLogin(true);
      }
    } catch (err) {
      // 翻译常见错误
      const msg = err.message || '';
      if (msg.includes('Invalid login credentials')) {
        setError('邮箱或密码错误');
      } else if (msg.includes('already registered')) {
        setError('该邮箱已注册，请直接登录');
      } else if (msg.includes('Email not confirmed')) {
        setError('邮箱未验证，请先点击邮件中的链接');
      } else if (msg.includes('password')) {
        setError('密码至少需要6位字符');
      } else {
        setError(msg || '操作失败，请重试');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email.trim()) {
      setError('请先输入邮箱地址');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: window.location.origin,
      });
      if (resetErr) throw resetErr;
      setMessage('密码重置邮件已发送，请查收邮箱');
    } catch (err) {
      setError(err.message || '发送失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: C.paper,
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@500;700;900&family=Noto+Sans+SC:wght@400;500;700&display=swap');
      `}</style>

      <div style={{
        width: '100%',
        maxWidth: 380,
        background: '#fff',
        borderRadius: 16,
        padding: '32px 28px',
        border: '1px solid ' + C.border,
        boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
        animation: 'fadeIn 0.4s ease-out',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            background: C.red,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 12,
          }}>
            <BookOpen size={28} color="#fff" />
          </div>
          <h1 className="serif" style={{ fontSize: 22, fontWeight: 900, letterSpacing: 1, color: C.ink }}>
            错 题 本
          </h1>
          <p style={{ fontSize: 13, color: C.inkSoft, marginTop: 4 }}>
            云端同步 · 间隔复习 · 多设备互通
          </p>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          marginBottom: 24,
          borderBottom: '1px solid ' + C.border,
        }}>
          <button
            onClick={() => { setIsLogin(true); setError(''); setMessage(''); }}
            style={{
              flex: 1,
              padding: '10px 0',
              fontSize: 14,
              fontWeight: 600,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: isLogin ? C.red : C.inkSoft,
              borderBottom: isLogin ? '2px solid ' + C.red : '2px solid transparent',
              transition: 'all 0.2s',
            }}
          >
            登录
          </button>
          <button
            onClick={() => { setIsLogin(false); setError(''); setMessage(''); }}
            style={{
              flex: 1,
              padding: '10px 0',
              fontSize: 14,
              fontWeight: 600,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: !isLogin ? C.red : C.inkSoft,
              borderBottom: !isLogin ? '2px solid ' + C.red : '2px solid transparent',
              transition: 'all 0.2s',
            }}
          >
            注册
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, color: C.inkSoft, marginBottom: 6, display: 'block' }}>邮箱</label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 12px',
              borderRadius: 8,
              border: '1px solid ' + C.border,
              background: C.paper,
            }}>
              <Mail size={16} color={C.inkSoft} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                style={{
                  flex: 1,
                  border: 'none',
                  background: 'transparent',
                  fontSize: 14,
                  outline: 'none',
                  color: C.ink,
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 12, color: C.inkSoft, marginBottom: 6, display: 'block' }}>密码</label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 12px',
              borderRadius: 8,
              border: '1px solid ' + C.border,
              background: C.paper,
            }}>
              <Lock size={16} color={C.inkSoft} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="至少6位密码"
                required
                minLength={6}
                style={{
                  flex: 1,
                  border: 'none',
                  background: 'transparent',
                  fontSize: 14,
                  outline: 'none',
                  color: C.ink,
                }}
              />
            </div>
          </div>

          {/* Error / Message */}
          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '10px 12px',
              borderRadius: 8,
              background: '#FBEAE7',
              color: C.red,
              fontSize: 13,
              marginBottom: 16,
            }}>
              <AlertCircle size={14} />
              {error}
            </div>
          )}
          {message && (
            <div style={{
              padding: '10px 12px',
              borderRadius: 8,
              background: '#E8F5E9',
              color: C.sage,
              fontSize: 13,
              marginBottom: 16,
            }}>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px 0',
              fontSize: 15,
              fontWeight: 600,
              color: '#fff',
              background: loading ? C.inkSoft : C.red,
              border: 'none',
              borderRadius: 8,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s',
            }}
          >
            {loading ? '处理中…' : isLogin ? '登录' : '注册'}
          </button>
        </form>

        {/* Forgot password */}
        {isLogin && (
          <button
            onClick={handleResetPassword}
            style={{
              display: 'block',
              width: '100%',
              textAlign: 'center',
              marginTop: 14,
              fontSize: 12,
              color: C.inkSoft,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            忘记密码？
          </button>
        )}
      </div>
    </div>
  );
}
