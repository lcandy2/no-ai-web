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
    this.opacity = 0.2 // Slightly reduced initial opacity
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
    // Optimized movement to target position with better speed curve
    if (forming && this.hasTarget) {
      let d = this.p5.dist(this.pos.x, this.pos.y, this.target.x, this.target.y)
      
      // If very close, snap directly to target to avoid slow crawl
      if (d < 3) {
        this.pos.x = this.target.x
        this.pos.y = this.target.y
      } else {
        // Improved speed mapping: higher minimum speed, tighter distance range
        let speed = this.p5.map(d, 0, 300, 0.06, 0.2)
        this.pos.x = this.p5.lerp(this.pos.x, this.target.x, speed)
        this.pos.y = this.p5.lerp(this.pos.y, this.target.y, speed)
      }
    }

    // Advanced character flicker with timing
    let currentTime = this.p5.millis()
    let flickerInterval = 1000 / (this.flickerSpeed * 50)
    
    if (!forming || !this.isInShape) {
      // Background particles: continuous flicker
      if (currentTime - this.lastCharChange > flickerInterval) {
        this.char = this.p5.random(this.chars)
        this.lastCharChange = currentTime
      }
      
      // Reduced opacity fluctuation with sine wave for more subtle effect
      let flicker = this.p5.sin(this.p5.frameCount * this.flickerSpeed + this.flickerOffset)
      this.opacity = this.p5.map(flicker, -1, 1, 0, 0.6) // 0-15% transparency (reduced from 20%)
      
      // Size breathing effect
      this.size = this.baseSize + this.p5.sin(this.p5.frameCount * 0.05 + this.flickerOffset) * 2
      
      // Color transition back to gray
      this.colorTransition = this.p5.lerp(this.colorTransition, 0, 0.05)
    } else {
      // Number shape particles: more stable with reduced opacity
      let flicker = this.p5.sin(this.p5.frameCount * 0.02 + this.flickerOffset)
      this.opacity = this.p5.map(flicker, -1, 1, 0.4, 0.6) // 10-15% transparency (reduced from 15-20%)
      this.size = this.p5.lerp(this.size, this.baseSize * 0.85, 0.1)
      
      // Reduced flicker frequency for number particles
      if (this.p5.random(1) < 0.003) {
        this.char = this.p5.random(this.chars)
      }
      
      // Color transition to orange
      this.colorTransition = this.p5.lerp(this.colorTransition, 1, 0.08)
    }
    
    // Calculate current color based on transition (gray to orange)
    this.currentColor.r = this.p5.lerp(55, 248, this.colorTransition)  // 55 -> 248
    this.currentColor.g = this.p5.lerp(71, 103, this.colorTransition) // 71 -> 103  
    this.currentColor.b = this.p5.lerp(89, 41, this.colorTransition)  // 89 -> 41
  }

  display() {
    this.p5.push()
    this.p5.textFont('GoodfonT-NET-XS03, monospace') // Use custom font with fallback
    this.p5.fill(this.currentColor.r, this.currentColor.g, this.currentColor.b, this.opacity * 255)
    this.p5.textAlign(this.p5.CENTER, this.p5.CENTER)
    this.p5.textSize(this.size)
    this.p5.text(this.char, this.pos.x, this.pos.y)
    this.p5.pop()
  }
}

const sketch: Sketch<SketchProps> = (p5) => {
  let particles: CodeParticle[] = []
  let digitPoints: any[] = []
  let forming = false
  let displayNumber = new Date().getHours()
  let showDebug = false
  let verticalLines: any[] = []

  p5.setup = () => {
    p5.createCanvas(p5.windowWidth, p5.windowHeight)
    p5.background(239, 248, 255)
    
    // Create optimized particle grid
    initializeParticles()
    
    // Add vertical line particles for background effect
    addVerticalLines()
    
    // Form the number immediately for better user experience
    setTimeout(() => {
      formNumber(displayNumber.toString())
    }, 50)
  }

  p5.updateWithProps = (props: SketchProps) => {
    if (props.displayNumber !== undefined && props.displayNumber !== displayNumber) {
      displayNumber = props.displayNumber
      // Add delay to ensure P5 is fully initialized
      setTimeout(() => formNumber(displayNumber.toString()), 100)
    }
    
    if (props.showDebug !== undefined) {
      showDebug = props.showDebug
    }
  }

  // Initialize particle system with smart density optimization
  function initializeParticles() {
    particles = []
    
    // Slightly smaller spacing for more particles and better visual density
    let baseSpacing = 35
    let screenArea = p5.width * p5.height
    let spacing = baseSpacing
    
    // Balanced spacing to maintain visual density while keeping good performance
    if (screenArea > 2000000) { // Very large screens (>2M pixels)
      spacing = baseSpacing * 1.8
    } else if (screenArea > 1000000) { // Large screens (>1M pixels) 
      spacing = baseSpacing * 1.4
    } else if (screenArea > 600000) { // Medium screens
      spacing = baseSpacing * 1.2
    } else {
      spacing = baseSpacing
    }
    
    let cols = Math.ceil(p5.width / spacing)
    let rows = Math.ceil(p5.height / spacing)
    let totalParticles = cols * rows
    
    // Increased particle limit for better visual density
    console.log('screenArea', screenArea, Math.floor(screenArea / 250))
    let maxParticles = Math.min(1200, Math.max(250, Math.floor(screenArea / 250)))
    let skipRatio = totalParticles > maxParticles ? Math.ceil(totalParticles / maxParticles) : 1
    
    let count = 0
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        if (count % skipRatio === 0) {
          let x = i * spacing + p5.random(-5, 5)
          let y = j * spacing + p5.random(-5, 5) + 60
          
          // Ensure particles are within screen bounds
          x = p5.constrain(x, 10, p5.width - 10)
          y = p5.constrain(y, 70, p5.height - 10)
          
          particles.push(new CodeParticle(x, y, p5))
        }
        count++
      }
    }
    
    console.log(`Created ${particles.length} particles (${Math.round(spacing)}px spacing, ${p5.width}x${p5.height})`)
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
    
    console.log(`Created ${verticalLines.length} vertical line particles`)
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
    
    console.log(`Font: ${Math.round(fontSize)}px (scale: ${Math.round(screenScaleFactor*100)}%), Step: ${step}px, Points: ${points.length}, Screen: ${p5.width}x${p5.height}`)
    
    pg.remove() // Clean up temporary canvas
    return points
  }

  // Form number shape with safety checks
  function formNumber(val: string) {
    // Validate input
    if (!val || val.length === 0 || isNaN(Number(val))) {
      console.log('Please enter a valid number')
      return
    }
    
    // Safety check: ensure P5 is properly initialized
    if (!p5.width || !p5.height) {
      console.warn('P5 canvas not yet initialized, retrying in 100ms')
      setTimeout(() => formNumber(val), 100)
      return
    }
    
    console.log('Starting to form number: ' + val)
    
    // Generate solid number point matrix (exactly like original)
    digitPoints = generateSolidDigitPoints(val)
    
    console.log('Generated ' + digitPoints.length + ' target points')
    
    if (digitPoints.length > 0) {
      forming = true
      assignTargetsEvenly()
    }
  }

  // Evenly distribute particles to target points (performance balanced)
  function assignTargetsEvenly() {
    // Smart particle management: create additional particles if needed, but with limits
    let targetParticleCount = Math.min(digitPoints.length, 600) // Cap at 600 for performance
    
    // Create additional particles if we don't have enough
    while (particles.length < targetParticleCount) {
      particles.push(new CodeParticle(p5.random(p5.width), p5.random(p5.height), p5))
    }
    
    console.log(`Particles: ${particles.length}, Target points: ${digitPoints.length}`)
    
    // Reset all particle states
    particles.forEach(particle => {
      particle.isInShape = false
      particle.hasTarget = false
    })
    
    // Assign particles to digit points
    if (particles.length >= digitPoints.length) {
      // Shuffle particle array to ensure random assignment (exactly like original)
      let shuffledParticles = shuffle(particles.slice())
      
      // Assign first N particles to number shape (exactly like original)
      for (let i = 0; i < digitPoints.length; i++) {
        shuffledParticles[i].setTargetPoint(
          digitPoints[i].x,
          digitPoints[i].y,
          true
        )
      }
      
      // Remaining particles evenly distributed across screen (exactly like original)
      let remainingCount = shuffledParticles.length - digitPoints.length
      let cols = Math.ceil(Math.sqrt(remainingCount))
      let rows = Math.ceil(remainingCount / cols)
      let index = digitPoints.length
      
      for (let i = 0; i < cols && index < shuffledParticles.length; i++) {
        for (let j = 0; j < rows && index < shuffledParticles.length; j++) {
          let x = p5.map(i, 0, cols-1, 50, p5.width-50)
          let y = p5.map(j, 0, rows-1, 100, p5.height-50)
          shuffledParticles[index].setTargetPoint(
            x + p5.random(-20, 20),
            y + p5.random(-20, 20),
            false
          )
          index++
        }
      }
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
  let lastFrameTime = 0
  
  p5.draw = () => {
    let frameStart = p5.millis()
    p5.background(239, 248, 255)
    
    // Display vertical line background particles first
    for (let line of verticalLines) {
      p5.push()
      let flicker = p5.sin(p5.frameCount * line.flickerSpeed + line.flickerOffset)
      let opacity = p5.map(flicker, -1, 1, line.opacity * 0.5, line.opacity)
      
      p5.textFont('GoodfonT-NET-XS03, monospace')
      p5.fill(55, 71, 89, opacity * 255)
      p5.textAlign(p5.CENTER, p5.CENTER)
      p5.textSize(line.baseSize)
      p5.text(line.char, line.x, line.y)
      p5.pop()
    }
    
    // Display main particles with performance optimization
    for (let particle of particles) {
      particle.update(forming)
      particle.display()
    }
    
    // Performance monitoring
    let frameTime = p5.millis() - frameStart
    frameTimeHistory.push(frameTime)
    if (frameTimeHistory.length > 60) frameTimeHistory.shift()
    
    let avgFrameTime = frameTimeHistory.reduce((a, b) => a + b, 0) / frameTimeHistory.length
    
    // Enhanced debug info with performance metrics (controllable)
    if (showDebug) {
      p5.push()
      p5.fill(55, 71, 89, 150)
      p5.textAlign(p5.LEFT, p5.TOP)
      p5.textSize(Math.max(12, Math.min(16, p5.width / 100))) // Responsive text size
      let lineHeight = p5.textSize() * 1.2
      let y = 20
      
      p5.text('Number: ' + displayNumber, 20, y); y += lineHeight
      p5.text('Particles: ' + particles.length, 20, y); y += lineHeight
      p5.text('FPS: ' + Math.round(p5.frameRate()), 20, y); y += lineHeight
      p5.text('Frame: ' + Math.round(avgFrameTime) + 'ms', 20, y); y += lineHeight
      if (forming) {
        p5.text('Points: ' + digitPoints.length, 20, y); y += lineHeight
      }
      p5.text('Screen: ' + p5.width + 'x' + p5.height, 20, y)
      p5.pop()
    }
  }

  p5.windowResized = () => {
    p5.resizeCanvas(p5.windowWidth, p5.windowHeight)
    initializeParticles()
    
    // Re-add vertical lines and re-form the current number with new responsive sizing
    addVerticalLines()
    if (forming) {
      setTimeout(() => {
        formNumber(displayNumber.toString())
      }, 100)
    }
  }
}

interface TimeDisplayProps {
  displayNumber?: number
  showDebug?: boolean
}

export default function TimeDisplay({ displayNumber, showDebug = false }: TimeDisplayProps) {
  // Use displayNumber prop if provided, otherwise default to current hour
  const [currentHour, setCurrentHour] = useState(new Date().getHours())
  const numberToDisplay = displayNumber !== undefined ? displayNumber : currentHour

  useEffect(() => {
    if (displayNumber === undefined) {
      const updateHour = () => {
        setCurrentHour(new Date().getHours())
      }

      updateHour()
      const interval = setInterval(updateHour, 60000)

      return () => clearInterval(interval)
    }
  }, [displayNumber])

  useEffect(() => {
    // Load custom font via CSS
    const fontFace = new FontFace('GoodfonT-NET-XS03', 'url(/fonts/GoodfonT-NET-XS03.ttf)')
    fontFace.load().then((loadedFont) => {
      document.fonts.add(loadedFont)
      console.log('CSS Font loaded successfully!')
    }).catch((error) => {
      console.log('CSS Font loading failed:', error)
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
      fontFamily: 'GoodfonT-NET-XS03, monospace' // Apply custom font
    }}>
      <NextReactP5Wrapper sketch={sketch} displayNumber={numberToDisplay} showDebug={showDebug} />
    </div>
  )
}