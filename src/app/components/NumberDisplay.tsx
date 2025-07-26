'use client'

import { useEffect, useState } from 'react'
import { NextReactP5Wrapper } from './NextReactP5Wrapper'
import type { Sketch } from "@p5-wrapper/react"

interface SketchProps {
  displayNumber?: number
  showDebug?: boolean
}

class CodeParticle {
  pos: any
  target: any
  chars: string[]
  char: string
  baseSize: number
  size: number
  opacity: number
  isInShape: boolean
  hasTarget: boolean
  flickerSpeed: number
  flickerOffset: number
  lastCharChange: number
  currentColor: any
  colorTransition: number
  p5: any
  
  // Performance optimization: cache computed values
  cachedSinFlicker: number = 0
  frameCounter: number = 0

  constructor(x: number, y: number, p5Instance: any) {
    this.p5 = p5Instance
    this.pos = p5Instance.createVector(x, y)
    this.target = this.pos.copy()
    
    // Extended character set like original
    this.chars = ['0','1','2','3','4','5','6','7','8','9',
                  '+','-','*','/','=','>','<','!','?','.',
                  '@','#','$','%','&','(',')','{','}','[',']',
                  ';',':',',','|','_','~',
                  'a','b','c','d','e','f','x','y','z','i','j','k']
    this.char = p5Instance.random(this.chars)
    
    this.baseSize = 30
    this.size = this.baseSize
    this.opacity = 0.15
    this.isInShape = false
    this.hasTarget = false
    
    // Animation properties
    this.flickerSpeed = p5Instance.random(0.03, 0.1)
    this.flickerOffset = p5Instance.random(p5Instance.TWO_PI)
    this.lastCharChange = p5Instance.millis()
    
    // Color properties
    this.currentColor = { r: 55, g: 71, b: 89 } // Gray #374759
    this.colorTransition = 0 // 0 = gray, 1 = orange
  }

  setTargetPoint(x: number, y: number, inShape: boolean) {
    this.target.x = x
    this.target.y = y
    this.isInShape = inShape
    this.hasTarget = true
  }

  update(forming: boolean) {
    // Movement towards target (number formation)
    if (forming && this.hasTarget) {
      let dx = this.target.x - this.pos.x
      let dy = this.target.y - this.pos.y
      let d = Math.sqrt(dx * dx + dy * dy)
      
      if (d < 5) {
        this.pos.x = this.target.x
        this.pos.y = this.target.y
      } else {
        // Faster animation speeds for number formation
        let speed = d > 200 ? 0.4 : 0.15 + (d / 200) * 0.25
        this.pos.x += dx * speed
        this.pos.y += dy * speed
      }
    }

    // Only number particle behavior (no background particle logic)
    let frameCount = this.p5.frameCount
    
    // Number particles: optimized with cached calculations
    this.frameCounter++
    if (this.frameCounter % 2 === 0) {
      this.cachedSinFlicker = Math.sin(frameCount * 0.02 + this.flickerOffset)
    }
    this.opacity = 0.7 + this.cachedSinFlicker * 0.1
    
    this.size += (this.baseSize * 0.85 - this.size) * 0.1
    
    if (Math.random() < 0.002) {
      this.char = this.p5.random(this.chars)
    }
    
    // Color transition to orange for number particles
    if (this.colorTransition < 0.95) {
      this.colorTransition += (1 - this.colorTransition) * 0.08
    }
    
    // Color calculation for orange transition
    if (this.colorTransition > 0.01) {
      this.currentColor.r = 55 + (248 - 55) * this.colorTransition
      this.currentColor.g = 71 + (103 - 71) * this.colorTransition
      this.currentColor.b = 89 + (41 - 89) * this.colorTransition
    }
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

// Global font status variable to share between component and sketch
let globalFontLoaded = false

const sketch: Sketch<SketchProps> = (p5) => {
  let particles: CodeParticle[] = []
  let digitPoints: any[] = []
  let forming = false
  let displayNumber = 49
  let showDebug = false

  p5.setup = () => {
    p5.createCanvas(p5.windowWidth, p5.windowHeight)
    
    // Use setTimeout to ensure canvas is fully initialized before creating particles
    setTimeout(() => {
      // First create a limited set of particles
      initializeNumberParticles()
      // Then form the number using existing particles
      formNumber(displayNumber.toString())
    }, 100)
  }

  // Initialize with fewer particles - let assignTargetsEvenly handle creation as needed
  function initializeNumberParticles() {
    particles = []
    console.log(`NumberDisplay - Initialized empty particle array - particles will be created as needed`)
  }

  p5.updateWithProps = (props: SketchProps) => {
    if (props.displayNumber !== undefined && props.displayNumber !== displayNumber) {
      displayNumber = props.displayNumber
      // Re-form the number using existing particles
      setTimeout(() => formNumber(displayNumber.toString()), 100)
    }
    
    if (props.showDebug !== undefined) {
      showDebug = props.showDebug
    }
  }

  // Generate solid digit points with responsive font sizing
  function generateSolidDigitPoints(val: string) {
    let points: any[] = []
    
    // Safety check: ensure P5 is properly initialized
    if (!p5.width || !p5.height) {
      console.warn('P5 canvas not yet initialized, skipping digit point generation')
      return points
    }
    
    // Smaller responsive font sizing for more compact display
    let baseFontSize = 1800 // Reduced from 2400 to make numbers smaller
    let screenScaleFactor = Math.min(p5.width / 1920, p5.height / 1080) // Scale based on 1920x1080 reference
    screenScaleFactor = Math.max(0.25, Math.min(1.2, screenScaleFactor)) // Reduced max scale from 1.5 to 1.2
    
    let fontSize = baseFontSize * screenScaleFactor
    
    // Apply original digit-length scaling factors
    if (val.length === 2) {
      fontSize = fontSize * 0.5
    } else if (val.length === 3) {
      fontSize = fontSize * 0.35
    }
    
    // Create off-screen graphics buffer (exactly like original)
    let pg = p5.createGraphics(p5.width, p5.height)
    pg.background(239, 248, 255) // Same background as original
    
    // Set font with fallback (same as original implementation)
    if (globalFontLoaded) {
      pg.textFont('GoodfonT-NET-XS03')
    } else {
      pg.textFont('Arial Black') // Use bold font as fallback
    }
    
    pg.fill(55, 71, 89) // #374759 - same as original
    pg.textAlign(p5.CENTER, p5.CENTER)
    pg.textSize(fontSize)
    pg.textStyle(p5.BOLD)
    
    // Draw number in canvas center (exactly like original)
    pg.text(val, p5.width/2, p5.height/2)
    
    // Optimized pixel scanning with adaptive step size
    pg.loadPixels()
    let d = pg.pixelDensity()
    
    // Balanced step sizes for adequate detail while maintaining performance
    let step = 12 // Balanced base step
    let screenArea = p5.width * p5.height
    if (screenArea > 2000000) {
      step = 18 // Large screens: bigger steps for performance
    } else if (screenArea > 1000000) {
      step = 15 // Medium-large screens
    } else if (screenArea < 400000) {
      step = 10 // Small screens: smaller steps for detail
    }
    
    for (let x = 0; x < p5.width; x += step) {
      for (let y = 0; y < p5.height; y += step) {
        // Get pixel color
        let index = 4 * (d * y * p5.width * d + d * x)
        let r = pg.pixels[index]
        
        // If pixel is black or near black (number part)
        if (r < 128) {
          points.push({
            x: x + p5.random(-2, 2),
            y: y + p5.random(-2, 2)
          })
        }
      }
    }
    
    console.log(`NumberDisplay - Font: ${Math.round(fontSize)}px (scale: ${Math.round(screenScaleFactor*100)}%), Step: ${step}px, Points: ${points.length}, Screen: ${p5.width}x${p5.height}`)
    
    pg.remove() // Clean up temporary canvas
    return points
  }

  // Form number shape with safety checks
  function formNumber(val: string) {
    // Validate input
    if (!val || val.length === 0 || isNaN(Number(val))) {
      console.log('NumberDisplay - Please enter a valid number')
      return
    }
    
    // Safety check: ensure P5 is properly initialized
    if (!p5.width || !p5.height) {
      console.warn('NumberDisplay - P5 canvas not yet initialized, retrying in 100ms')
      setTimeout(() => formNumber(val), 100)
      return
    }
    
    console.log('NumberDisplay - Starting to form number: ' + val)
    
    // Generate solid number point matrix (exactly like original)
    digitPoints = generateSolidDigitPoints(val)
    
    console.log('NumberDisplay - Generated ' + digitPoints.length + ' target points')
    
    if (digitPoints.length > 0) {
      forming = true
      assignTargetsEvenly()
    }
  }

  // Assign particles to target points (exactly like original TimeDisplay)
  function assignTargetsEvenly() {
    // Smart particle management: create additional particles if needed, but with limits
    let targetParticleCount = Math.min(digitPoints.length, 800) // Same limit as original
    
    // Create additional particles if we don't have enough (exactly like original)
    while (particles.length < targetParticleCount) {
      particles.push(new CodeParticle(p5.random(p5.width), p5.random(p5.height), p5))
    }
    
    console.log(`NumberDisplay - Particles: ${particles.length}, Target points: ${digitPoints.length}`)
    
    // Reset all particle states (exactly like original)
    particles.forEach(particle => {
      particle.isInShape = false
      particle.hasTarget = false
    })
    
    // Assign particles to digit points (exactly like original)
    if (particles.length >= digitPoints.length) {
      // Shuffle particle array to ensure random assignment
      let shuffledParticles = shuffle(particles.slice())
      
      // Assign particles to number shape
      for (let i = 0; i < digitPoints.length; i++) {
        shuffledParticles[i].setTargetPoint(
          digitPoints[i].x,
          digitPoints[i].y,
          true
        )
      }
      
      // Remaining particles don't need targets for NumberDisplay (no background logic needed)
    } else {
      // If we have fewer particles than target points, assign multiple points to some particles
      let particlesPerPoint = Math.floor(digitPoints.length / particles.length)
      let extraPoints = digitPoints.length % particles.length
      let pointIndex = 0
      
      for (let i = 0; i < particles.length && pointIndex < digitPoints.length; i++) {
        // Each particle gets at least one point, some get extra
        let count = particlesPerPoint + (i < extraPoints ? 1 : 0)
        if (count > 0 && pointIndex < digitPoints.length) {
          particles[i].setTargetPoint(
            digitPoints[pointIndex].x + p5.random(-3, 3),
            digitPoints[pointIndex].y + p5.random(-3, 3),
            true
          )
          pointIndex += count
        }
      }
    }
  }

  // Helper function: shuffle array (exactly like original)
  function shuffle(array: any[]) {
    let arr = array.slice()
    for (let i = arr.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr
  }

  // Performance monitoring variables
  let frameTimeHistory: number[] = []
  
  p5.draw = () => {
    let frameStart = p5.millis()
    // Clear the canvas completely to prevent particle accumulation
    p5.clear()
    
    // Set common rendering states once to avoid repetition
    p5.textFont('GoodfonT-NET-XS03, monospace')
    p5.textAlign(p5.CENTER, p5.CENTER)
    
    // Count active particles for debug
    let activeParticles = 0
    
    // Update and display particles - be very strict about what we render
    for (let i = 0; i < particles.length; i++) {
      let particle = particles[i]
      
      // Only update and display particles that are definitely part of the number shape
      if (forming && particle.isInShape && particle.hasTarget) {
        particle.update(forming)
        particle.display()
        activeParticles++
      }
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
      p5.fill(248, 103, 41, 150) // Orange for number debug
      p5.textAlign(p5.LEFT, p5.TOP)
      p5.textSize(Math.max(12, Math.min(16, p5.width / 100))) // Responsive text size
      let lineHeight = p5.textSize() * 1.2
      let y = 120 // Offset from background debug
      
      p5.text('Number: ' + displayNumber, 20, y); y += lineHeight
      p5.text('Total Particles: ' + particles.length, 20, y); y += lineHeight
      p5.text('Active Particles: ' + activeParticles, 20, y); y += lineHeight
      p5.text('Number FPS: ' + Math.round(p5.frameRate()), 20, y); y += lineHeight
      p5.text('Number Frame: ' + Math.round(avgFrameTime) + 'ms', 20, y); y += lineHeight
      if (forming) {
        p5.text('Points: ' + digitPoints.length, 20, y); y += lineHeight
        p5.text('Forming: ' + forming, 20, y); y += lineHeight
      }
      p5.pop()
    }
  }

  p5.windowResized = () => {
    p5.resizeCanvas(p5.windowWidth, p5.windowHeight)
    
    // Reinitialize particles for new screen size
    initializeNumberParticles()
    
    // Re-form the current number with new responsive sizing
    if (forming) {
      setTimeout(() => {
        formNumber(displayNumber.toString())
      }, 100)
    }
  }
}

interface NumberDisplayProps {
  displayNumber?: number
  showDebug?: boolean
}

export default function NumberDisplay({ displayNumber = 49, showDebug = false }: NumberDisplayProps) {
  useEffect(() => {
    // Load custom font via CSS and update font status
    const fontFace = new FontFace('GoodfonT-NET-XS03', 'url(/fonts/GoodfonT-NET-XS03.ttf)')
    fontFace.load().then((loadedFont) => {
      document.fonts.add(loadedFont)
      globalFontLoaded = true // Update the global font status
      console.log('NumberDisplay - CSS Font loaded successfully!')
    }).catch((error) => {
      globalFontLoaded = false
      console.log('NumberDisplay - CSS Font loading failed:', error)
    })
  }, [])

  return (
    <div style={{ 
      position: 'absolute', 
      top: 0, 
      left: 0, 
      width: '100vw', 
      height: '100vh',
      pointerEvents: 'none', // Allow interactions to pass through
      zIndex: 1,
      fontFamily: 'GoodfonT-NET-XS03, monospace'
    }}>
      <NextReactP5Wrapper sketch={sketch} displayNumber={displayNumber} showDebug={showDebug} />
    </div>
  )
}