'use client'

import { useEffect, useState } from 'react'
import BackgroundParticles from './components/BackgroundParticles'
import NumberDisplay from './components/NumberDisplay'
import StatItem, { Number } from './components/StatItem'

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
      <BackgroundParticles showDebug={false} />
      
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
          {/* Number Display for 49 - should scroll with content */}
          <NumberDisplay displayNumber={23} showDebug={false} />
          
          {/* Floating text overlay */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 3,
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
              fontSize: 'clamp(48px, 8vw, 96px)',
              fontWeight: 'normal',
              marginBottom: '60px',
              textAlign: 'start',
              fontFamily: 'FZShuSong, PingFang SC, Microsoft YaHei, sans-serif'
            }}>
              相当于
            </div>

            {/* Statistics list using StatItem components */}
            <div style={{
              display: 'flex',
              flexDirection: 'column'
            }}>
              <StatItem highlight={true}>
                整整<Number highlight={true}>10</Number>个标准工作日
              </StatItem>

              <StatItem>
                睡眠时间相当于一个人正常睡眠<Number>11</Number>晚
              </StatItem>

              <StatItem>
                电影时长可以看完<Number>41</Number>部<Number>2</Number>小时电影
              </StatItem>

              <StatItem>
                播客时长足够听完<Number>165</Number>集<Number>30</Number>分钟播客
              </StatItem>

              <StatItem>
                飞行时间可以从伦敦飞北京来回<Number>4</Number>次
              </StatItem>

              <StatItem>
                阅读时间足够读完<Number>6</Number>本小说
              </StatItem>
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
