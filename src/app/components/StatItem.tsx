'use client'

import { useEffect } from 'react'

interface StatItemProps {
  children: React.ReactNode
  highlight?: boolean
}

export default function StatItem({ children, highlight = false }: StatItemProps) {
  useEffect(() => {
    // Load GoodfonT font for numbers
    const fontFace = new FontFace('GoodfonT-NET-XS03', 'url(/fonts/GoodfonT-NET-XS03.woff2)')
    fontFace.load().then((loadedFont) => {
      document.fonts.add(loadedFont)
    }).catch((error) => {
      console.log('StatItem - Font loading failed:', error)
    })
  }, [])

  return (
    <div style={{
      marginBottom: highlight ? '40px' : '30px',
      fontSize: highlight ? 'clamp(28px, 5vw, 52px)' : 'clamp(22px, 4vw, 40px)',
      lineHeight: 1.5,
      color: '#374759',
      fontFamily: 'FZShuSong, PingFang SC, Microsoft YaHei, sans-serif'
    }}>
      {children}
    </div>
  )
}

// Number component for GoodfonT styled numbers
interface NumberProps {
  children: React.ReactNode
  highlight?: boolean
}

export function Number({ children, highlight = false }: NumberProps) {
  return (
    <span style={{
      fontFamily: 'GoodfonT-NET-XS03, monospace',
      fontWeight: 'bold',
      color: '#F86729',
      fontSize: highlight ? '1.3em' : '1.2em',
      margin: '0 4px'
    }}>
      {children}
    </span>
  )
}