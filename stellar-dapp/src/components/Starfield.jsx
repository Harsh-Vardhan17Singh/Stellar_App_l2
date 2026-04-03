import React, { useMemo } from 'react'

export default function Starfield() {
  const stars = useMemo(() => {
    return Array.from({ length: 80 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 0.5,
      duration: Math.random() * 4 + 2,
      delay: Math.random() * 5,
    }))
  }, [])

  return (
    <div className="starfield">
      {stars.map(star => (
        <div
          key={star.id}
          className="star"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            '--duration': `${star.duration}s`,
            '--delay': `${star.delay}s`,
          }}
        />
      ))}
      {/* Nebula gradients */}
      <div
        style={{
          position: 'absolute',
          top: '10%',
          right: '15%',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(0,212,255,0.03) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '20%',
          left: '10%',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(139,92,246,0.04) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none',
        }}
      />
    </div>
  )
}
