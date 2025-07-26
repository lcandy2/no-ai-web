'use client'

import { useEffect, useState } from 'react'
import { NextReactP5Wrapper } from './NextReactP5Wrapper'
import type { Sketch } from "@p5-wrapper/react"

interface SketchProps {
  currentHour: number
}

class CodeParticle {
  pos: any
  chars: string[]
  char: string
  size: number
  opacity: number
  p5: any

  constructor(x: number, y: number, p5Instance: any) {
    this.p5 = p5Instance
    this.pos = p5Instance.createVector(x, y)
    this.chars = ['0','1','2','3','4','5','6','7','8','9','+','-','*','/','=']
    this.char = p5Instance.random(this.chars)
    this.size = 20
    this.opacity = p5Instance.random(0.1, 0.3)
  }

  update() {
    // Simple character flicker
    if (this.p5.random(1) < 0.02) {
      this.char = this.p5.random(this.chars)
    }
    
    // Simple opacity flicker
    this.opacity += this.p5.random(-0.05, 0.05)
    this.opacity = this.p5.constrain(this.opacity, 0.05, 0.4)
  }

  display(fontLoaded: boolean, codeFont: any) {
    this.p5.push()
    
    if (fontLoaded && codeFont) {
      this.p5.textFont(codeFont)
    }
    
    this.p5.fill(55, 71, 89, this.opacity * 255)
    this.p5.textAlign(this.p5.CENTER, this.p5.CENTER)
    this.p5.textSize(this.size)
    this.p5.text(this.char, this.pos.x, this.pos.y)
    this.p5.pop()
  }
}

const sketch: Sketch<SketchProps> = (p5) => {
  let particles: CodeParticle[] = []
  let currentHour = new Date().getHours()
  let codeFont: any = null
  let fontLoaded = false
  let fontLoadAttempted = false

  p5.setup = () => {
    p5.createCanvas(p5.windowWidth, p5.windowHeight)
    p5.background(239, 248, 255)
    
    // Try to load font in setup (safer than preload)
    if (!fontLoadAttempted) {
      fontLoadAttempted = true
      try {
        codeFont = p5.loadFont('/fonts/GoodfonT-NET-XS03.ttf', 
          () => {
            console.log('Font loaded successfully!')
            fontLoaded = true
          },
          () => {
            console.log('Font loading failed, using fallback')
            fontLoaded = false
          }
        )
      } catch (e) {
        console.log('Error loading font:', e)
        fontLoaded = false
      }
    }
    
    // Create simple particle grid
    initializeParticles()
  }

  p5.updateWithProps = (props: SketchProps) => {
    if (props.currentHour !== currentHour) {
      currentHour = props.currentHour
    }
  }

  function initializeParticles() {
    particles = []
    
    let spacing = 40
    let cols = Math.ceil(p5.width / spacing)
    let rows = Math.ceil(p5.height / spacing)
    
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        let x = i * spacing + p5.random(-10, 10)
        let y = j * spacing + p5.random(-10, 10)
        
        if (x > 10 && x < p5.width - 10 && y > 50 && y < p5.height - 10) {
          particles.push(new CodeParticle(x, y, p5))
        }
      }
    }
    
    console.log('Created ' + particles.length + ' particles')
  }

  p5.draw = () => {
    p5.background(239, 248, 255)
    
    // Display current hour in center
    p5.push()
    if (fontLoaded && codeFont) {
      p5.textFont(codeFont)
    }
    p5.fill(55, 71, 89)
    p5.textAlign(p5.CENTER, p5.CENTER)
    p5.textSize(200)
    p5.text(currentHour.toString(), p5.width/2, p5.height/2)
    p5.pop()
    
    // Display particles
    for (let particle of particles) {
      particle.update()
      particle.display(fontLoaded, codeFont)
    }
    
    // Debug info
    p5.push()
    p5.fill(55, 71, 89)
    p5.textAlign(p5.LEFT, p5.TOP)
    p5.textSize(16)
    p5.text('Hour: ' + currentHour, 20, 20)
    p5.text('Particles: ' + particles.length, 20, 40)
    p5.text('Font: ' + (fontLoaded ? 'Loaded' : 'Not loaded'), 20, 60)
    p5.pop()
  }

  p5.windowResized = () => {
    p5.resizeCanvas(p5.windowWidth, p5.windowHeight)
    initializeParticles()
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