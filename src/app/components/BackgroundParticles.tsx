'use client'

import { useEffect, useState } from 'react'
import { NextReactP5Wrapper } from './NextReactP5Wrapper'
import type { Sketch } from "@p5-wrapper/react"

interface SketchProps {
  showDebug?: boolean
}

class CodeParticle {
  pos: any
  chars: string[]
  char: string
  baseSize: number
  size: number
  opacity: number
  flickerSpeed: number
  flickerOffset: number
  lastCharChange: number
  currentColor: any
  p5: any
  
  // Performance optimization: cache computed values
  cachedSinFlicker: number = 0
  cachedSizeFlicker: number = 0
  frameCounter: number = 0

  constructor(x: number, y: number, p5Instance: any) {
    this.p5 = p5Instance
    this.pos = p5Instance.createVector(x, y)
    
    // Extended character set like original
    this.chars = ['0','1','2','3','4','5','6','7','8','9',
                  '+','-','*','/','=','>','<','!','?','.',
                  '@','#','$','%','&','(',')','{','}','[',']',
                  ';',':',',','|','_','~',
                  'a','b','c','d','e','f','x','y','z','i','j','k']
    this.char = p5Instance.random(this.chars)
    
    this.baseSize = 30
    this.size = this.baseSize
    this.opacity = 0.15 // Background particle opacity
    
    // Animation properties
    this.flickerSpeed = p5Instance.random(0.03, 0.1)
    this.flickerOffset = p5Instance.random(p5Instance.TWO_PI)
    this.lastCharChange = p5Instance.millis()
    
    // Color properties
    this.currentColor = { r: 55, g: 71, b: 89 } // Gray #374759
  }

  update() {
    // Background particles: normal update frequency for visibility
    let frameCount = this.p5.frameCount
    let currentTime = this.p5.millis()
    
    if (currentTime - this.lastCharChange > (1000 / (this.flickerSpeed * 40))) {
      this.char = this.p5.random(this.chars)
      this.lastCharChange = currentTime
    }
    
    // Optimize sin calculations with caching and reduced frequency
    this.frameCounter++
    if (this.frameCounter % 2 === 0) { // Update sin values every other frame
      this.cachedSinFlicker = Math.sin(frameCount * this.flickerSpeed + this.flickerOffset)
      this.cachedSizeFlicker = Math.sin(frameCount * 0.05 + this.flickerOffset)
    }
    
    this.opacity = 0.15 + this.cachedSinFlicker * 0.05 // Use cached value
    this.size = this.baseSize + this.cachedSizeFlicker * 2
  }

  display() {
    // Skip only extremely transparent particles
    if (this.opacity < 0.02) return
    
    // Optimized rendering without push/pop for better performance
    this.p5.fill(this.currentColor.r, this.currentColor.g, this.currentColor.b, this.opacity * 255)
    this.p5.textSize(this.size)
    this.p5.text(this.char, this.pos.x, this.pos.y)
  }
}

const sketch: Sketch<SketchProps> = (p5) => {
  let particles: CodeParticle[] = []
  let showDebug = false
  let verticalLines: any[] = []

  p5.setup = () => {
    p5.createCanvas(p5.windowWidth, p5.windowHeight)
    p5.background(239, 248, 255)
    
    // Use setTimeout to ensure canvas is fully initialized before creating particles
    setTimeout(() => {
      // Create optimized particle grid
      initializeParticles()
      
      // Add vertical line particles for background effect
      addVerticalLines()
    }, 100)
  }

  p5.updateWithProps = (props: SketchProps) => {
    if (props.showDebug !== undefined) {
      showDebug = props.showDebug
    }
  }

  // Initialize particle system with smart density optimization
  function initializeParticles() {
    particles = []
    
    // Safety check: ensure P5 is properly initialized
    if (!p5.width || !p5.height) {
      console.warn('P5 canvas not yet initialized, skipping particle initialization')
      return
    }
    
    // Smaller spacing for dense background particle coverage like original TimeTest
    let baseSpacing = 25
    let screenArea = p5.width * p5.height
    let spacing = baseSpacing
    
    // Maintain dense particle coverage for background effect
    if (screenArea > 2000000) { // Very large screens (>2M pixels)
      spacing = baseSpacing * 1.3  // Less aggressive spacing to keep more particles
    } else if (screenArea > 1000000) { // Large screens (>1M pixels) 
      spacing = baseSpacing * 1.1
    } else {
      spacing = baseSpacing  // Keep dense spacing for smaller screens
    }
    
    let cols = Math.ceil(p5.width / spacing)
    let rows = Math.ceil(p5.height / spacing)
    let totalParticles = cols * rows
    
    // Create ALL particles - no limits for full background coverage
    console.log('BackgroundParticles - screenArea', screenArea, 'Total particles will be:', totalParticles)
    
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        let x = i * spacing + p5.random(-5, 5)
        let y = j * spacing + p5.random(-5, 5)
        
        // Ensure particles are within screen bounds from top to bottom
        x = p5.constrain(x, 10, p5.width - 10)
        y = p5.constrain(y, 10, p5.height - 10)
        
        particles.push(new CodeParticle(x, y, p5))
      }
    }
    
    console.log(`BackgroundParticles - Created ${particles.length} particles (${Math.round(spacing)}px spacing, ${p5.width}x${p5.height})`)
  }

  // Add vertical line character particles like in original TimeTest
  function addVerticalLines() {
    verticalLines = []
    
    // Safety check: ensure P5 is properly initialized
    if (!p5.width || !p5.height) {
      console.warn('P5 canvas not yet initialized, skipping vertical lines')
      return
    }
    
    // Create sparse vertical line characters distributed across screen
    let lineChars = ['|', '│', '┃', '丨', '︱', '︳']
    let numLines = Math.floor((p5.width * p5.height) / 50000) // Density based on screen size
    numLines = Math.max(5, Math.min(20, numLines)) // Between 5-20 lines
    
    for (let i = 0; i < numLines; i++) {
      let x = p5.random(p5.width * 0.1, p5.width * 0.9)
      let y = p5.random(p5.height * 0.1, p5.height * 0.9)
      
      verticalLines.push({
        x: x,
        y: y,
        char: p5.random(lineChars),
        opacity: p5.random(0.05, 0.15),
        flickerSpeed: p5.random(0.01, 0.03),
        flickerOffset: p5.random(p5.TWO_PI),
        baseSize: p5.random(25, 40)
      })
    }
    
    console.log(`BackgroundParticles - Created ${verticalLines.length} vertical line particles`)
  }

  // Performance monitoring variables
  let frameTimeHistory: number[] = []
  let lastFrameTime = 0
  
  p5.draw = () => {
    let frameStart = p5.millis()
    p5.background(239, 248, 255)
    
    // Set common rendering states once to avoid repetition
    p5.textFont('GoodfonT-NET-XS03, monospace')
    p5.textAlign(p5.CENTER, p5.CENTER)
    
    // Display vertical lines every frame for consistent background
    for (let line of verticalLines) {
      let flicker = Math.sin(p5.frameCount * line.flickerSpeed + line.flickerOffset)
      let opacity = line.opacity * 0.75 + flicker * line.opacity * 0.25
      
      if (opacity > 0.03) { // Lower threshold
        p5.fill(55, 71, 89, opacity * 255)
        p5.textSize(line.baseSize)
        p5.text(line.char, line.x, line.y)
      }
    }
    
    // Intelligent particle updates: alternate between background particles
    for (let i = 0; i < particles.length; i++) {
      let particle = particles[i]
      
      // Background particles update every other frame based on index
      if (i % 2 === p5.frameCount % 2) { // Alternate which half updates each frame
        particle.update()
      }
      
      particle.display()
    }
    
    // Lightweight performance monitoring
    let frameTime = p5.millis() - frameStart
    frameTimeHistory.push(frameTime)
    if (frameTimeHistory.length > 30) frameTimeHistory.shift() // Reduced history
    
    let avgFrameTime = frameTimeHistory.length > 0 ? 
      frameTimeHistory.reduce((a, b) => a + b, 0) / frameTimeHistory.length : 0
    
    // Enhanced debug info with performance metrics (controllable)
    if (showDebug) {
      p5.push()
      p5.fill(55, 71, 89, 150)
      p5.textAlign(p5.LEFT, p5.TOP)
      p5.textSize(Math.max(12, Math.min(16, p5.width / 100))) // Responsive text size
      let lineHeight = p5.textSize() * 1.2
      let y = 20
      
      p5.text('Background Particles: ' + particles.length, 20, y); y += lineHeight
      p5.text('FPS: ' + Math.round(p5.frameRate()), 20, y); y += lineHeight
      p5.text('Frame: ' + Math.round(avgFrameTime) + 'ms', 20, y); y += lineHeight
      p5.text('Screen: ' + p5.width + 'x' + p5.height, 20, y)
      p5.pop()
    }
  }

  p5.windowResized = () => {
    p5.resizeCanvas(p5.windowWidth, p5.windowHeight)
    initializeParticles()
    addVerticalLines()
  }
}

interface BackgroundParticlesProps {
  showDebug?: boolean
}

export default function BackgroundParticles({ showDebug = false }: BackgroundParticlesProps) {
  useEffect(() => {
    // Load custom font via CSS
    const fontFace = new FontFace('GoodfonT-NET-XS03', 'url(/fonts/GoodfonT-NET-XS03.ttf)')
    fontFace.load().then((loadedFont) => {
      document.fonts.add(loadedFont)
      console.log('BackgroundParticles - CSS Font loaded successfully!')
    }).catch((error) => {
      console.log('BackgroundParticles - CSS Font loading failed:', error)
    })
  }, [])

  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      width: '100vw', 
      height: '100vh',
      backgroundColor: '#EFF8FF',
      zIndex: 0,
      fontFamily: 'GoodfonT-NET-XS03, monospace'
    }}>
      <NextReactP5Wrapper sketch={sketch} showDebug={showDebug} />
    </div>
  )
}