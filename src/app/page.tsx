'use client'

import { useEffect, useState } from 'react'
import BackgroundParticles from './components/BackgroundParticles'
import NumberDisplay from './components/NumberDisplay'

export default function Home() {
  const [currentHour, setCurrentHour] = useState(new Date().getHours())

  useEffect(() => {
    const updateHour = () => {
      setCurrentHour(new Date().getHours())
    }

    updateHour()
    const interval = setInterval(updateHour, 60000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Load FZShuSong font via CSS
    const fontFace = new FontFace('FZShuSong', 'url(/fonts/FZShuSong.woff2)')
    fontFace.load().then((loadedFont) => {
      document.fonts.add(loadedFont)
      console.log('FZShuSong Font loaded successfully!')
    }).catch((error) => {
      console.log('FZShuSong Font loading failed:', error)
    })
  }, [])

  return (
    <div style={{
      position: 'relative',
      width: '100vw',
      minHeight: '100vh'
    }}>
      {/* Fixed Background Particles */}
      <BackgroundParticles showDebug={true} />
      
      {/* Scrollable Content */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        minHeight: '200vh', // Make page scrollable
        fontFamily: 'FZShuSong, PingFang SC, Microsoft YaHei, sans-serif'
      }}>
        {/* First Viewport - 100vh */}
        <div style={{
          position: 'relative',
          width: '100vw',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          {/* Number Display for 49 */}
          <NumberDisplay displayNumber={49} showDebug={true} />
          
          {/* Floating text overlay */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 2,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            color: '#374759',
            textAlign: 'center'
          }}>
            {/* Top text - left aligned */}
            <div style={{
              position: 'absolute',
              top: '8%',
              left: '8%',
              fontSize: 'clamp(36px, 6vw, 72px)',
              fontWeight: 'normal',
              lineHeight: 1.2,
              writingMode: 'horizontal-tb',
              textAlign: 'left'
            }}>
              在过去7天<br />你有
            </div>
            
            {/* Bottom text - split into two lines with different sizes */}
            <div style={{
              position: 'absolute',
              bottom: '8%',
              right: '8%',
              textAlign: 'right'
            }}>
              <div style={{
                fontSize: 'clamp(36px, 6vw, 72px)',
                fontWeight: 'normal',
                lineHeight: 1.2,
                marginBottom: '8px'
              }}>
                小时
              </div>
              <div style={{
                fontSize: 'clamp(48px, 8vw, 96px)',
                fontWeight: 'normal',
                lineHeight: 1.2
              }}>
                思考处于待机状态
              </div>
            </div>
          </div>
        </div>

        {/* Second Viewport - Detailed Statistics */}
        <div style={{
          position: 'relative',
          width: '100vw',
          minHeight: '100vh',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          padding: '60px 40px',
          color: '#374759',
          zIndex: 2
        }}>
          <div style={{
            maxWidth: '800px',
            margin: '0 auto',
            lineHeight: 1.6
          }}>
            {/* Main comparison section */}
            <div style={{
              fontSize: 'clamp(32px, 5vw, 64px)',
              fontWeight: 'normal',
              marginBottom: '60px',
              textAlign: 'center'
            }}>
              相当于
            </div>

            {/* Statistics list */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '40px',
              fontSize: 'clamp(18px, 3vw, 28px)'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '2px solid #F86729',
                paddingBottom: '20px'
              }}>
                <span>整整</span>
                <span style={{ fontSize: 'clamp(24px, 4vw, 48px)', color: '#F86729', fontWeight: 'bold' }}>10</span>
                <span>个标准工作日</span>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid #ddd',
                paddingBottom: '20px'
              }}>
                <span>睡眠时间相当于一个人正常睡眠</span>
                <span style={{ fontSize: 'clamp(24px, 4vw, 48px)', color: '#F86729', fontWeight: 'bold' }}>11</span>
                <span>晚</span>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid #ddd',
                paddingBottom: '20px'
              }}>
                <span>电影时长可以看完</span>
                <span style={{ fontSize: 'clamp(24px, 4vw, 48px)', color: '#F86729', fontWeight: 'bold' }}>41</span>
                <span>部</span>
                <span style={{ fontSize: 'clamp(20px, 3vw, 32px)', color: '#F86729', fontWeight: 'bold' }}>2</span>
                <span>小时电影</span>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid #ddd',
                paddingBottom: '20px'
              }}>
                <span>播客时长足够听完</span>
                <span style={{ fontSize: 'clamp(24px, 4vw, 48px)', color: '#F86729', fontWeight: 'bold' }}>165</span>
                <span>集</span>
                <span style={{ fontSize: 'clamp(20px, 3vw, 32px)', color: '#F86729', fontWeight: 'bold' }}>30</span>
                <span>分钟播客</span>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid #ddd',
                paddingBottom: '20px'
              }}>
                <span>飞行时间可以从伦敦飞北京来回</span>
                <span style={{ fontSize: 'clamp(24px, 4vw, 48px)', color: '#F86729', fontWeight: 'bold' }}>4</span>
                <span>次</span>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingBottom: '20px'
              }}>
                <span>阅读时间足够读完</span>
                <span style={{ fontSize: 'clamp(24px, 4vw, 48px)', color: '#F86729', fontWeight: 'bold' }}>6</span>
                <span>本小说</span>
              </div>
            </div>

            {/* Bottom note */}
            <div style={{
              marginTop: '80px',
              textAlign: 'center',
              fontSize: 'clamp(14px, 2vw, 20px)',
              color: '#F86729',
              fontStyle: 'italic'
            }}>
              相当于: 整整10个工作日……↓
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
