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
  size: number
  opacity: number
  isInShape: boolean
  hasTarget: boolean
  p5: any

  constructor(x: number, y: number, p5Instance: any) {
    this.p5 = p5Instance
    this.pos = p5Instance.createVector(x, y)
    this.target = this.pos.copy()
    this.chars = ['0','1','2','3','4','5','6','7','8','9','+','-','*','/','=']
    this.char = p5Instance.random(this.chars)
    this.size = 20
    this.opacity = p5Instance.random(0.1, 0.3)
    this.isInShape = false
    this.hasTarget = false
  }

  setTargetPoint(x: number, y: number, inShape: boolean) {
    this.target.x = x
    this.target.y = y
    this.isInShape = inShape
    this.hasTarget = true
  }

  update(forming: boolean) {
    // Move to target position if forming
    if (forming && this.hasTarget) {
      let d = this.p5.dist(this.pos.x, this.pos.y, this.target.x, this.target.y)
      let speed = this.p5.map(d, 0, 500, 0.02, 0.15)
      this.pos.x = this.p5.lerp(this.pos.x, this.target.x, speed)
      this.pos.y = this.p5.lerp(this.pos.y, this.target.y, speed)
    }

    // Character flicker
    if (this.p5.random(1) < 0.02) {
      this.char = this.p5.random(this.chars)
    }
    
    // Opacity based on whether in shape or not
    if (this.isInShape && forming) {
      // Particles in number shape are more visible
      this.opacity += this.p5.random(-0.02, 0.02)
      this.opacity = this.p5.constrain(this.opacity, 0.6, 0.9)
    } else {
      // Background particles are dimmer
      this.opacity += this.p5.random(-0.05, 0.05)
      this.opacity = this.p5.constrain(this.opacity, 0.05, 0.3)
    }
  }

  display() {
    this.p5.push()
    this.p5.fill(55, 71, 89, this.opacity * 255)
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
    }, 500)
  }

  p5.updateWithProps = (props: SketchProps) => {
    if (props.currentHour !== currentHour) {
      currentHour = props.currentHour
      formNumber(currentHour.toString())
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

  // Generate points for digit shape
  function generateDigitPoints(val: string) {
    let points: any[] = []
    
    // Create off-screen graphics to render the number
    let pg = p5.createGraphics(p5.width, p5.height)
    pg.background(255)
    pg.fill(0)
    pg.textAlign(p5.CENTER, p5.CENTER)
    pg.textSize(400) // Large size for good point detection
    pg.textStyle(p5.BOLD)
    pg.text(val, p5.width/2, p5.height/2)
    
    // Scan pixels to find the number shape
    pg.loadPixels()
    let step = 12 // Skip pixels for performance
    
    for (let x = 0; x < p5.width; x += step) {
      for (let y = 0; y < p5.height; y += step) {
        let index = 4 * (y * p5.width + x)
        let r = pg.pixels[index]
        
        // If pixel is dark (part of the number)
        if (r < 128) {
          points.push({
            x: x + p5.random(-3, 3),
            y: y + p5.random(-3, 3)
          })
        }
      }
    }
    
    pg.remove()
    return points
  }

  // Form number shape
  function formNumber(val: string) {
    console.log('Forming number:', val)
    
    digitPoints = generateDigitPoints(val)
    console.log('Generated', digitPoints.length, 'points')
    
    if (digitPoints.length > 0) {
      forming = true
      assignParticlesToPoints()
    }
  }

  // Assign particles to form the number
  function assignParticlesToPoints() {
    // Reset all particles
    particles.forEach(p => {
      p.isInShape = false
      p.hasTarget = false
    })
    
    // Assign particles to number shape
    let assignedCount = Math.min(particles.length, digitPoints.length)
    
    for (let i = 0; i < assignedCount; i++) {
      particles[i].setTargetPoint(
        digitPoints[i].x,
        digitPoints[i].y,
        true
      )
    }
    
    // Spread remaining particles around
    for (let i = assignedCount; i < particles.length; i++) {
      let x = p5.random(50, p5.width - 50)
      let y = p5.random(100, p5.height - 50)
      particles[i].setTargetPoint(x, y, false)
    }
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