'use client'

import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

export default function QRCodeReport() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [currentUrl, setCurrentUrl] = useState('')

  useEffect(() => {
    // 获取当前完整URL
    const url = window.location.href
    setCurrentUrl(url)

    // 生成二维码
    QRCode.toDataURL(url, {
      width: 200,
      margin: 2,
      color: {
        dark: '#374759',
        light: '#FFFFFF'
      }
    })
    .then(url => {
      setQrCodeUrl(url)
    })
    .catch(err => {
      console.error('生成二维码失败:', err)
    })
  }, [])

  // 监听URL变化（当用户修改参数时）
  useEffect(() => {
    const handleUrlChange = () => {
      const url = window.location.href
      setCurrentUrl(url)
      
      QRCode.toDataURL(url, {
        width: 200,
        margin: 2,
        color: {
          dark: '#374759',
          light: '#FFFFFF'
        }
      })
      .then(url => {
        setQrCodeUrl(url)
      })
      .catch(err => {
        console.error('生成二维码失败:', err)
      })
    }

    window.addEventListener('popstate', handleUrlChange)
    return () => window.removeEventListener('popstate', handleUrlChange)
  }, [])

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 9999,
      display: 'none', // 默认隐藏
      // 只在桌面端显示
      '@media (min-width: 768px)': {
        display: 'block'
      }
    }} className="desktop-only">
      {/* CSS样式 */}
      <style jsx>{`
        .desktop-only {
          display: none;
        }
        
        @media (min-width: 768px) {
          .desktop-only {
            display: block !important;
          }
        }
        
        .qr-button {
          transition: all 0.3s ease;
          cursor: pointer;
        }
        
        .qr-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        
        .qr-panel {
          animation: slideDown 0.3s ease;
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      {!isExpanded ? (
        // 收起状态：显示按钮
        <div
          className="qr-button"
          onClick={() => setIsExpanded(true)}
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            padding: '12px 16px',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            fontFamily: 'FZShuSong, PingFang SC, Microsoft YaHei, sans-serif',
            fontSize: '14px',
            color: '#374759',
            border: '1px solid rgba(248, 103, 41, 0.2)',
            backdropFilter: 'blur(5px)'
          }}
        >
          📱 扫码获取报告
        </div>
      ) : (
        // 展开状态：显示二维码面板
        <div 
          className="qr-panel"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            minWidth: '240px',
            textAlign: 'center',
            fontFamily: 'FZShuSong, PingFang SC, Microsoft YaHei, sans-serif',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(248, 103, 41, 0.2)'
          }}
        >
          {/* 关闭按钮 */}
          <div
            onClick={() => setIsExpanded(false)}
            style={{
              position: 'absolute',
              top: '8px',
              right: '12px',
              cursor: 'pointer',
              fontSize: '18px',
              color: '#999',
              lineHeight: 1
            }}
          >
            ×
          </div>

          {/* 标题 */}
          <div style={{
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#374759',
            marginBottom: '16px'
          }}>
            扫码获取报告
          </div>

          {/* 二维码 */}
          {qrCodeUrl && (
            <div style={{ marginBottom: '12px' }}>
              <img 
                src={qrCodeUrl} 
                alt="报告二维码"
                style={{
                  maxWidth: '100%',
                  height: 'auto',
                  border: '1px solid #eee',
                  borderRadius: '4px'
                }}
              />
            </div>
          )}

          {/* 提示文字 */}
          <div style={{
            fontSize: '12px',
            color: '#666',
            lineHeight: 1.4
          }}>
            使用手机扫描二维码
            <br />
            在移动端查看此报告
          </div>

          {/* 链接显示（可选，用于调试） */}
          {process.env.NODE_ENV === 'development' && (
            <div style={{
              fontSize: '10px',
              color: '#999',
              marginTop: '8px',
              wordBreak: 'break-all',
              maxWidth: '200px'
            }}>
              {currentUrl}
            </div>
          )}
        </div>
      )}
    </div>
  )
}