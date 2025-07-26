'use client'

import { useEffect, useState } from 'react'
import { NextReactP5Wrapper } from './NextReactP5Wrapper'
import type { Sketch } from "@p5-wrapper/react"

interface SketchProps {
  currentHour: number
}

class CodeParticle {
  pos: any
  originalPos: any
  vel: any
  target: any
  chars: string[]
  char: string
  baseSize: number
  size: number
  flickerSpeed: number
  flickerOffset: number
  opacity: number
  isInShape: boolean
  hasTarget: boolean
  lastCharChange: number
  currentColor: any
  targetColor: any
  colorTransition: number
  p5: any

  constructor(x: number, y: number, p5Instance: any) {
    this.p5 = p5Instance
    this.pos = p5Instance.createVector(x, y)
    this.originalPos = this.pos.copy()
    this.vel = p5Instance.createVector(0, 0)
    this.target = this.pos.copy()
    
    // Extended character set - avoiding quotes and backslashes to prevent parsing errors
    this.chars = ['0','1','2','3','4','5','6','7','8','9',
                  '+','-','*','/','=','>','<','!','?','.',
                  '@','#','$','%','&','(',')','{','}','[',']',
                  ';',':',',','|','_','~',
                  'a','b','c','d','e','f','x','y','z','i','j','k']
    this.char = p5Instance.random(this.chars)
    
    // Enlarged initial character
    this.baseSize = 30
    this.size = this.baseSize
    
    // Flicker parameters
    this.flickerSpeed = p5Instance.random(0.03, 0.1)
    this.flickerOffset = p5Instance.random(p5Instance.TWO_PI)
    this.opacity = 0.1 // Initial transparency set to 10%
    this.isInShape = false
    this.hasTarget = false
    this.lastCharChange = p5Instance.millis()
    
    // Color related properties
    this.currentColor = { r: 55, g: 71, b: 89 } // #374759
    this.targetColor = { r: 248, g: 103, b: 41 } // #F86729
    this.colorTransition = 0 // 0 means original color, 1 means target color
  }

  setTargetPoint(x: number, y: number, inShape: boolean) {
    this.target.x = x
    this.target.y = y
    this.isInShape = inShape
    this.hasTarget = true
  }

  update(forming: boolean) {
    // Smooth movement to target position
    if (forming && this.hasTarget) {
      let d = this.p5.dist(this.pos.x, this.pos.y, this.target.x, this.target.y)
      let speed = this.p5.map(d, 0, 500, 0.02, 0.15)
      this.pos.x = this.p5.lerp(this.pos.x, this.target.x, speed)
      this.pos.y = this.p5.lerp(this.pos.y, this.target.y, speed)
    }
    
    // Character flicker effect
    let currentTime = this.p5.millis()
    let flickerInterval = 1000 / (this.flickerSpeed * 50)
    
    if (!forming || !this.isInShape) {
      // Particles not in number shape continue to flicker
      if (currentTime - this.lastCharChange > flickerInterval) {
        this.char = this.p5.random(this.chars)
        this.lastCharChange = currentTime
      }
      
      // Opacity fluctuates between 0-20%
      let flicker = this.p5.sin(this.p5.frameCount * this.flickerSpeed + this.flickerOffset)
      this.opacity = this.p5.map(flicker, -1, 1, 0, 0.2) // 0-20% transparency
      
      // Size breathing effect
      this.size = this.baseSize + this.p5.sin(this.p5.frameCount * 0.05 + this.flickerOffset) * 2
      
      // Color gradient back to original color
      this.colorTransition = this.p5.lerp(this.colorTransition, 0, 0.05)
    } else {
      // Particles in number shape
      // Opacity stays between 15-20%, more stable
      let flicker = this.p5.sin(this.p5.frameCount * 0.02 + this.flickerOffset)
      this.opacity = this.p5.map(flicker, -1, 1, 0.15, 0.2)
      this.size = this.p5.lerp(this.size, this.baseSize * 0.85, 0.1)
      
      // Reduce flicker frequency
      if (this.p5.random(1) < 0.003) {
        this.char = this.p5.random(this.chars)
      }
      
      // Color gradient to orange
      this.colorTransition = this.p5.lerp(this.colorTransition, 1, 0.08)
    }
    
    // Calculate current color based on transition value
    this.currentColor.r = this.p5.lerp(55, 248, this.colorTransition)
    this.currentColor.g = this.p5.lerp(71, 103, this.colorTransition)
    this.currentColor.b = this.p5.lerp(89, 41, this.colorTransition)
  }

  display(fontLoaded: boolean, codeFont: any) {
    this.p5.push()
    
    // Set font
    if (fontLoaded && codeFont) {
      this.p5.textFont(codeFont)
    } else {
      this.p5.textFont('Courier New')
    }
    
    // Use dynamic color, transparency controlled by this.opacity (0-20%)
    this.p5.fill(this.currentColor.r, this.currentColor.g, this.currentColor.b, this.opacity * 255)
    this.p5.noStroke()
    this.p5.textSize(this.size)
    this.p5.textAlign(this.p5.CENTER, this.p5.CENTER)
    this.p5.text(this.char, this.pos.x, this.pos.y)
    this.p5.pop()
  }
}

const sketch: Sketch<SketchProps> = (p5) => {
  let codeFont: any
  let particles: CodeParticle[] = []
  let digitPoints: any[] = []
  let forming = false
  let fontSize = 2400 // 3x enlarged number size
  let fontLoaded = false
  let currentHour = new Date().getHours()

  // Preload font
  p5.preload = () => {
    // Load GoodfonT-NET-XS03 font
    codeFont = p5.loadFont('/fonts/GoodfonT-NET-XS03.ttf', 
      () => {
        console.log('Font loaded successfully!')
        fontLoaded = true
      },
      () => {
        console.log('Font loading failed, using fallback font')
        fontLoaded = false
      }
    )
  }

  p5.setup = () => {
    p5.createCanvas(p5.windowWidth, p5.windowHeight)
    p5.background(239, 248, 255) // #EFF8FF
    
    // Create full screen code character particles
    initializeParticles()
    
    // Form current hour after a short delay
    setTimeout(() => {
      formNumber(currentHour.toString())
    }, 100)
  }

  p5.updateWithProps = (props: SketchProps) => {
    if (props.currentHour !== currentHour) {
      currentHour = props.currentHour
      formNumber(currentHour.toString())
    }
  }

  // Initialize particle system
  function initializeParticles() {
    particles = []
    
    // Create denser particle grid to ensure enough particles to fill large numbers
    let spacing = 25 // Reduce spacing to increase particle density
    let cols = Math.ceil(p5.width / spacing)
    let rows = Math.ceil(p5.height / spacing)
    
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        let x = i * spacing + p5.random(-5, 5)
        let y = j * spacing + p5.random(-5, 5) + 60
        
        // Ensure particles are within screen bounds
        x = p5.constrain(x, 10, p5.width - 10)
        y = p5.constrain(y, 70, p5.height - 10)
        
        particles.push(new CodeParticle(x, y, p5))
      }
    }
    
    console.log('Created ' + particles.length + ' particles')
  }

  p5.draw = () => {
    p5.background(239, 248, 255) // #EFF8FF - maintain background color
    
    // Display debug information
    p5.push()
    p5.fill(55, 71, 89, 51) // #374759 with 20% opacity (51/255 = 0.2)
    p5.textSize(12)
    p5.noStroke()
    p5.text('Particles: ' + particles.length, 20, p5.height - 40)
    p5.text('Font status: ' + (fontLoaded ? 'Loaded' : 'Not loaded'), 20, p5.height - 20)
    p5.text('Current hour: ' + currentHour, 20, p5.height - 60)
    if (forming && digitPoints.length > 0) {
      p5.text('Number shape points: ' + digitPoints.length, 20, p5.height - 80)
    }
    p5.pop()
    
    // Update and display all particles
    for (let particle of particles) {
      particle.update(forming)
      particle.display(fontLoaded, codeFont)
    }
  }

  // Generate solid number point matrix
  function generateSolidDigitPoints(val: string) {
    let points: any[] = []
    
    // Adjust font size based on number length
    let adjustedFontSize = fontSize
    if (val.length === 2) {
      adjustedFontSize = fontSize * 0.5
    } else if (val.length === 3) {
      adjustedFontSize = fontSize * 0.35
    }
    
    // Create off-screen graphics buffer
    let pg = p5.createGraphics(p5.width, p5.height)
    pg.background(239, 248, 255) // White background
    
    if (fontLoaded && codeFont) {
      pg.textFont(codeFont)
    } else {
      pg.textFont('Arial Black') // Use bold font as backup
    }
    
    pg.fill(55, 71, 89) // #374759
    pg.textAlign(p5.CENTER, p5.CENTER)
    pg.textSize(adjustedFontSize)
    pg.textStyle(p5.BOLD)
    
    // Draw number in canvas center
    pg.text(val, p5.width/2, p5.height/2)
    
    // Scan pixels to find black areas (number shape)
    pg.loadPixels()
    let d = pg.pixelDensity()
    let step = 8 // Sampling step, smaller value means denser points
    
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
    
    pg.remove() // Clean up temporary canvas
    return points
  }

  // Main function to form numbers
  function formNumber(val: string) {
    // Validate input
    if (!val || val.length === 0 || isNaN(Number(val))) {
      console.log('Please enter a valid number')
      return
    }
    
    console.log('Starting to form number: ' + val)
    
    // Generate solid number point matrix
    digitPoints = generateSolidDigitPoints(val)
    
    console.log('Generated ' + digitPoints.length + ' target points')
    
    if (digitPoints.length > 0) {
      forming = true
      assignTargetsEvenly()
    }
  }

  // Evenly distribute particles to target points
  function assignTargetsEvenly() {
    // Ensure enough particles
    let neededParticles = Math.max(digitPoints.length, particles.length)
    
    // If not enough particles, create more
    while (particles.length < neededParticles) {
      particles.push(new CodeParticle(p5.random(p5.width), p5.random(p5.height), p5))
    }
    
    // Reset all particle states
    particles.forEach(particle => {
      particle.isInShape = false
      particle.hasTarget = false
    })
    
    // Method 1: If particle count >= target point count
    if (particles.length >= digitPoints.length) {
      // Shuffle particle array to ensure random assignment
      let shuffledParticles = shuffle(particles.slice())
      
      // Assign first N particles to number shape
      for (let i = 0; i < digitPoints.length; i++) {
        shuffledParticles[i].setTargetPoint(
          digitPoints[i].x,
          digitPoints[i].y,
          true
        )
      }
      
      // Remaining particles evenly distributed across screen
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
      // Method 2: If more target points than particles (unlikely)
      let particlesPerPoint = Math.floor(particles.length / digitPoints.length)
      let extraParticles = particles.length % digitPoints.length
      let particleIndex = 0
      
      for (let i = 0; i < digitPoints.length; i++) {
        let count = particlesPerPoint + (i < extraParticles ? 1 : 0)
        for (let j = 0; j < count && particleIndex < particles.length; j++) {
          particles[particleIndex].setTargetPoint(
            digitPoints[i].x + p5.random(-3, 3),
            digitPoints[i].y + p5.random(-3, 3),
            true
          )
          particleIndex++
        }
      }
    }
  }

  // Helper function: shuffle array
  function shuffle(array: any[]) {
    let arr = array.slice()
    for (let i = arr.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr
  }

  // Reinitialize when window size changes
  p5.windowResized = () => {
    p5.resizeCanvas(p5.windowWidth, p5.windowHeight)
    initializeParticles()
    
    // If currently displaying a number, recalculate
    if (forming) {
      formNumber(currentHour.toString())
    }
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