'use client'

import { useEffect, useState } from 'react'
import TimeDisplay from './components/TimeDisplay'

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
      height: '100vh'
    }}>
      {/* Background TimeDisplay */}
      <TimeDisplay showDebug={false} />
      
      {/* Floating text overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: 'FZShuSong, PingFang SC, Microsoft YaHei, sans-serif',
        color: '#374759',
        textAlign: 'center'
      }}>
        {/* Top text - left aligned */}
        <div style={{
          position: 'absolute',
          top: '15%',
          left: '8%',
          fontSize: 'clamp(36px, 6vw, 72px)',
          fontWeight: 'normal',
          lineHeight: 1.2,
          writingMode: 'horizontal-tb',
          textAlign: 'left'
        }}>
          在过去7天<br />你有
        </div>
        
        {/* Bottom text */}
        <div style={{
          position: 'absolute',
          bottom: '15%',
          right: '8%',
          fontSize: 'clamp(36px, 6vw, 72px)',
          fontWeight: 'normal',
          lineHeight: 1.2,
          textAlign: 'right'
        }}>
          小时<br />思考处于待机状态
        </div>
      </div>
    </div>
  )
}
