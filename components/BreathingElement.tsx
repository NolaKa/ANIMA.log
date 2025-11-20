'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

interface BreathingElementProps {
  children: React.ReactNode
  intensity?: number
  duration?: number
  className?: string
}

export default function BreathingElement({ 
  children, 
  intensity = 0.05,
  duration = 2000,
  className = ''
}: BreathingElementProps) {
  return (
    <motion.div
      className={className}
      animate={{
        scale: [1, 1 + intensity, 1],
        opacity: [0.9, 1, 0.9],
      }}
      transition={{
        duration: duration / 1000,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {children}
    </motion.div>
  )
}

