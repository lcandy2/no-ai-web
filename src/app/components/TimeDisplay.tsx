'use client'

import { useEffect, useState } from 'react'
import { NextReactP5Wrapper } from './NextReactP5Wrapper'
import type { Sketch } from "@p5-wrapper/react"

interface SketchProps {
  currentHour: number
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
    this.opacity = p5Instance.random(0.1, 0.3)
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
    // Smooth movement to target position
    if (forming && this.hasTarget) {
      let d = this.p5.dist(this.pos.x, this.pos.y, this.target.x, this.target.y)
      let speed = this.p5.map(d, 0, 500, 0.02, 0.15)
      this.pos.x = this.p5.lerp(this.pos.x, this.target.x, speed)
      this.pos.y = this.p5.lerp(this.pos.y, this.target.y, speed)
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
      
      // Opacity fluctuation with sine wave
      let flicker = this.p5.sin(this.p5.frameCount * this.flickerSpeed + this.flickerOffset)
      this.opacity = this.p5.map(flicker, -1, 1, 0, 0.2) // 0-20% transparency
      
      // Size breathing effect
      this.size = this.baseSize + this.p5.sin(this.p5.frameCount * 0.05 + this.flickerOffset) * 2
      
      // Color transition back to gray
      this.colorTransition = this.p5.lerp(this.colorTransition, 0, 0.05)
    } else {
      // Number shape particles: more stable
      let flicker = this.p5.sin(this.p5.frameCount * 0.02 + this.flickerOffset)
      this.opacity = this.p5.map(flicker, -1, 1, 0.15, 0.2) // 15-20% transparency, more stable
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
  let currentHour = new Date().getHours()

  p5.setup = () => {
    p5.createCanvas(p5.windowWidth, p5.windowHeight)
    p5.background(239, 248, 255)
    
    // Create simple particle grid
    initializeParticles()
    
    // Form the number after a short delay
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

  // Initialize particle system (exactly like original)
  function initializeParticles() {
    particles = []
    
    // Create denser particle grid to ensure enough particles to fill large numbers (exactly like original)
    let spacing = 25 // Reduce spacing to increase particle density (exactly like original)
    let cols = Math.ceil(p5.width / spacing)
    let rows = Math.ceil(p5.height / spacing)
    
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        let x = i * spacing + p5.random(-5, 5)
        let y = j * spacing + p5.random(-5, 5) + 60
        
        // Ensure particles are within screen bounds (exactly like original)
        x = p5.constrain(x, 10, p5.width - 10)
        y = p5.constrain(y, 70, p5.height - 10)
        
        particles.push(new CodeParticle(x, y, p5))
      }
    }
    
    console.log('Created ' + particles.length + ' particles')
  }

  // Generate solid digit points (exactly like original TimeTest)
  function generateSolidDigitPoints(val: string) {
    let points: any[] = []
    
    // Adjust font size based on number length (exactly like original)
    let fontSize = 2400 // Original size
    if (val.length === 2) {
      fontSize = 2400 * 0.5
    } else if (val.length === 3) {
      fontSize = 2400 * 0.35
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
    
    // Scan pixels to find black areas (exactly like original algorithm)
    pg.loadPixels()
    let d = pg.pixelDensity()
    let step = 8 // Same sampling step as original
    
    for (let x = 0; x < p5.width; x += step) {
      for (let y = 0; y < p5.height; y += step) {
        // Get pixel color (exactly like original)
        let index = 4 * (d * y * p5.width * d + d * x)
        let r = pg.pixels[index]
        
        // If pixel is black or near black (number part) - exactly like original
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

  // Form number shape (exactly like original)
  function formNumber(val: string) {
    // Validate input (exactly like original)
    if (!val || val.length === 0 || isNaN(Number(val))) {
      console.log('Please enter a valid number')
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

  // Evenly distribute particles to target points (exactly like original)
  function assignTargetsEvenly() {
    // Ensure enough particles (exactly like original)
    let neededParticles = Math.max(digitPoints.length, particles.length)
    
    // If not enough particles, create more (exactly like original)
    while (particles.length < neededParticles) {
      particles.push(new CodeParticle(p5.random(p5.width), p5.random(p5.height), p5))
    }
    
    // Reset all particle states (exactly like original)
    particles.forEach(particle => {
      particle.isInShape = false
      particle.hasTarget = false
    })
    
    // Method 1: If particle count >= target point count (exactly like original)
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

  p5.draw = () => {
    p5.background(239, 248, 255)
    
    // Display particles
    for (let particle of particles) {
      particle.update(forming)
      particle.display()
    }
    
    // Debug info
    p5.push()
    p5.fill(55, 71, 89)
    p5.textAlign(p5.LEFT, p5.TOP)
    p5.textSize(16)
    p5.text('Hour: ' + currentHour, 20, 20)
    p5.text('Particles: ' + particles.length, 20, 40)
    p5.text('Forming: ' + (forming ? 'Yes' : 'No'), 20, 60)
    if (forming) {
      p5.text('Target points: ' + digitPoints.length, 20, 80)
    }
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