'use client'

import { useEffect, useState } from 'react'
import { NextReactP5Wrapper } from './NextReactP5Wrapper'
import type { Sketch } from "@p5-wrapper/react"

interface SketchProps {
  currentHour: number
}

const sketch: Sketch<SketchProps> = (p5) => {
  let currentHour = new Date().getHours()

  p5.setup = () => {
    p5.createCanvas(p5.windowWidth, p5.windowHeight)
    p5.background(239, 248, 255)
  }

  p5.updateWithProps = (props: SketchProps) => {
    if (props.currentHour !== currentHour) {
      currentHour = props.currentHour
    }
  }

  p5.draw = () => {
    p5.background(239, 248, 255)
    
    // Simple text display of current hour
    p5.fill(55, 71, 89)
    p5.textAlign(p5.CENTER, p5.CENTER)
    p5.textSize(200)
    p5.text(currentHour.toString(), p5.width/2, p5.height/2)
    
    // Debug info
    p5.textSize(16)
    p5.textAlign(p5.LEFT, p5.TOP)
    p5.text('Current hour: ' + currentHour, 20, 20)
  }

  p5.windowResized = () => {
    p5.resizeCanvas(p5.windowWidth, p5.windowHeight)
  }
}

export default function TimeDisplay() {
  const [currentHour, setCurrentHour] = useState(new Date().getHours())

  useEffect(() => {
    const updateHour = () => {
      setCurrentHour(new Date().getHours())
    }

    updateHour()
    const interval = setInterval(updateHour, 60000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      width: '100vw', 
      height: '100vh',
      backgroundColor: '#EFF8FF',
      zIndex: 0
    }}>
      <NextReactP5Wrapper sketch={sketch} currentHour={currentHour} />
    </div>
  )
}