import React from 'react';

export default function Logo({ height = 65, showTagline = true, className = '' }) {
  return (
    <div 
      className={`medastraq-logo-wrapper ${className}`}
      style={{ 
        display: 'inline-flex', 
        alignItems: 'center', 
        gap: '14px', 
        height: `${height}px`,
        userSelect: 'none'
      }}
    >
      {/* MedAstraQ Theme-Matched Vector Symbol */}
      <svg 
        width={height * 0.85} 
        height={height * 0.85} 
        viewBox="0 0 120 120" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0, filter: 'drop-shadow(0 3px 6px rgba(214, 83, 19, 0.2))' }}
      >
        <defs>
          <linearGradient id="leafGradPrimary" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
          <linearGradient id="leafGradSecondary" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#d65313" />
            <stop offset="100%" stopColor="#b5450e" />
          </linearGradient>
          <linearGradient id="pulseGradAccent" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f2427a" />
            <stop offset="100%" stopColor="#d65313" />
          </linearGradient>
        </defs>

        {/* Outer Leaf Left (Emerald Green) */}
        <path 
          d="M60 105C35 90 20 65 22 40C38 38 60 52 60 105Z" 
          fill="url(#leafGradPrimary)" 
        />
        {/* Outer Leaf Right (Emerald Green Light) */}
        <path 
          d="M60 105C85 90 100 65 98 40C82 38 60 52 60 105Z" 
          fill="url(#leafGradPrimary)" 
          opacity="0.85"
        />

        {/* Inner Sprout Left (Warm Rust Orange) */}
        <path 
          d="M60 88C44 76 34 56 36 36C48 34 60 46 60 88Z" 
          fill="url(#leafGradSecondary)" 
        />
        {/* Inner Sprout Right (Warm Rust Orange) */}
        <path 
          d="M60 88C76 76 86 56 84 36C72 34 60 46 60 88Z" 
          fill="url(#leafGradSecondary)" 
          opacity="0.9"
        />

        {/* Medical Heartbeat / Pulse Line (Vibrant Accent Pink/Rust) */}
        <path 
          d="M20 62H42L49 46L57 76L67 36L75 66L82 56L88 62H100" 
          stroke="url(#pulseGradAccent)" 
          strokeWidth="5" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />

        {/* Glowing Star Particles above symbol */}
        <circle cx="60" cy="18" r="5" fill="#f2427a" />
        <circle cx="44" cy="24" r="3.5" fill="#d65313" />
        <circle cx="76" cy="24" r="3.5" fill="#10b981" />
      </svg>

      {/* Brand Text Block */}
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', lineHeight: 1.1 }}>
        <div style={{ display: 'flex', alignItems: 'baseline' }}>
          <span 
            style={{ 
              fontFamily: "'Outfit', 'Inter', sans-serif", 
              fontSize: `${height * 0.44}px`, 
              fontWeight: 800, 
              letterSpacing: '-0.5px',
              background: 'linear-gradient(135deg, var(--primary, #d65313) 0%, var(--accent, #f2427a) 60%, var(--secondary, #10b981) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'inline-block'
            }}
          >
            MedAstra
          </span>
          <span 
            style={{ 
              fontFamily: "'Outfit', 'Inter', sans-serif", 
              fontSize: `${height * 0.48}px`, 
              fontWeight: 900, 
              color: 'var(--secondary, #10b981)',
              marginLeft: '1px'
            }}
          >
            Q
          </span>
        </div>

        {showTagline && (
          <div 
            style={{ 
              fontSize: `${Math.max(10, height * 0.16)}px`, 
              fontWeight: 700, 
              letterSpacing: '0.6px',
              textTransform: 'uppercase',
              color: 'var(--text-secondary, #4b5563)',
              marginTop: '3px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap'
            }}
          >
            <span>Innovate</span>
            <span style={{ color: 'var(--primary, #d65313)' }}>•</span>
            <span>Heal</span>
            <span style={{ color: 'var(--accent, #f2427a)' }}>•</span>
            <span>Evolve</span>
          </div>
        )}
      </div>
    </div>
  );
}
