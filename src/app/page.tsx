'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import BackgroundParticles from './components/BackgroundParticles'
import NumberDisplay from './components/NumberDisplay'
import StatItem, { Number } from './components/StatItem'

export default function Home() {
  const searchParams = useSearchParams()
  const [displayHours, setDisplayHours] = useState(23)
  const [displayName, setDisplayName] = useState('')
  const [discussionMinutes, setDiscussionMinutes] = useState(72)
  const [discussionContent, setDiscussionContent] = useState('什么什么什么')

  useEffect(() => {
    // Get hours from URL parameter or use default
    const hoursParam = searchParams.get('hours')
    if (hoursParam) {
      const hours = parseInt(hoursParam, 10)
      if (!isNaN(hours) && hours >= 0) {
        setDisplayHours(hours)
      }
    }

    // Get name from URL parameter
    const nameParam = searchParams.get('name')
    if (nameParam) {
      setDisplayName(nameParam)
    }

    // Get discussion minutes from URL parameter
    const minutesParam = searchParams.get('minutes')
    if (minutesParam) {
      const minutes = parseInt(minutesParam, 10)
      if (!isNaN(minutes) && minutes >= 0) {
        setDiscussionMinutes(minutes)
      }
    }

    // Get discussion content from URL parameter
    const contentParam = searchParams.get('content')
    if (contentParam) {
      setDiscussionContent(contentParam)
    }
  }, [searchParams])

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
        minHeight: '300vh', // Make page scrollable
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
          {/* Number Display - hours from URL parameter */}
          <NumberDisplay displayNumber={displayHours} showDebug={false} />
          
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
              {displayName && `${displayName}，`}在过去7天<br />你有
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
                大脑处于待机状态
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
          {/* Main comparison section - full width for left alignment */}
          <div style={{
            width: '100%',
            paddingLeft: '40px',
            marginBottom: '20px'
          }}>
            <div style={{
              fontSize: 'clamp(48px, 8vw, 96px)',
              fontWeight: 'normal',
              textAlign: 'left',
              fontFamily: 'FZShuSong, PingFang SC, Microsoft YaHei, sans-serif'
            }}>
              相当于
            </div>
          </div>

          <div style={{
            maxWidth: '800px',
            margin: '0 auto',
            lineHeight: 1.6
          }}>
            {/* Statistics list using StatItem components - calculated from displayHours */}
            <div style={{
              display: 'flex',
              flexDirection: 'column'
            }}>
              <StatItem>
                整整<Number>{Math.round(displayHours / 8)}</Number>个标准工作日
              </StatItem>

              <StatItem>
                睡眠时间相当于一个人正常睡眠<Number>{Math.round(displayHours / 8 * 3)}</Number>晚
              </StatItem>

              <StatItem>
                电影时长可以看完<Number>{Math.round(displayHours / 2)}</Number>部<Number>2</Number>小时电影
              </StatItem>

              <StatItem>
                播客时长足够听完<Number>{Math.round(displayHours * 2)}</Number>集<Number>30</Number>分钟播客
              </StatItem>

              <StatItem>
                飞行时间可以从伦敦飞北京来回<Number>{Math.round(displayHours / 24)}</Number>次
              </StatItem>

              <StatItem>
                阅读时间足够读完<Number>{Math.round(displayHours / 12)}</Number>本小说
              </StatItem>
            </div>

            {/* Bottom note */}
            {/* <div style={{
              marginTop: '80px',
              textAlign: 'center',
              fontSize: 'clamp(14px, 2vw, 20px)',
              color: '#F86729',
              fontStyle: 'italic'
            }}>
              相当于: 整整{Math.round(displayHours / 8)}个工作日……↓
            </div> */}
          </div>
        </div>

        {/* Third Viewport - AI Discussion */}
        <div style={{
          position: 'relative',
          width: '100vw',
          minHeight: '100vh',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          padding: '60px 40px',
          color: '#374759',
          zIndex: 2
        }}>
          {/* First line - full width left aligned like "相当于" */}
          <div style={{
            width: '100%',
            paddingLeft: '40px',
            marginBottom: '20px'
          }}>
            <div style={{
              fontSize: 'clamp(36px, 5vw, 72px)',
              fontWeight: 'normal',
              lineHeight: 1.3,
              textAlign: 'left'
            }}>
              你花了<span style={{
                fontFamily: 'GoodfonT-NET-XS03, monospace',
                fontWeight: 'bold',
                color: '#F86729',
                fontSize: '1.5em'
              }}>{discussionMinutes}</span>分钟
            </div>
          </div>


          <div style={{
            maxWidth: '800px',
            margin: '0 auto',
            lineHeight: 1.6
          }}>
            {/* Statistics list using StatItem components - calculated from displayHours */}
            <div style={{
              display: 'flex',
              flexDirection: 'column'
            }}>
              {/* AI discussion text - using StatItem styling */}
              <div style={{
                marginBottom: '15px',
                fontSize: 'clamp(24px, 2.5vw, 48px)',
                lineHeight: 1,
                color: '#374759',
                fontFamily: 'FZShuSong, PingFang SC, Microsoft YaHei, sans-serif'
              }}>
                和AI探讨
              </div>

              {/* Discussion content - using StatItem styling */}
              <div style={{
                marginBottom: '15px',
                fontSize: 'clamp(36px, 6vw, 72px)',
                lineHeight: 1,
                color: '#374759',
                fontFamily: 'FZShuSong, PingFang SC, Microsoft YaHei, sans-serif'
              }}>
                {discussionContent}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
