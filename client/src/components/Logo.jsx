import React from 'react';

function Logo({ className = '', size = 48, variant = 'primary', style = {} }) {
  const isWhite = variant === 'white';
  const isSilhouette = variant === 'silhouette';
  
  const circleColor = isWhite ? '#FFFFFF' : '#FF3B5C';
  const botColor = isWhite ? '#FF3B5C' : '#FFFFFF';
  const cutoutColor = isWhite ? '#FFFFFF' : '#FF3B5C';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`tb-logo ${className}`}
      style={style}
    >
      {/* Background Circle */}
      {!isSilhouette && <circle cx="50" cy="50" r="48" fill={circleColor} />}
      
      {/* Chatbot Silhouette */}
      {/* Antenna */}
      <rect x="48" y="18" width="4" height="10" rx="2" fill={botColor} />
      <circle cx="50" cy="18" r="4.5" fill={botColor} />
      
      {/* Ears (Headphones) */}
      <rect x="22" y="44" width="6" height="14" rx="3" fill={botColor} />
      <rect x="72" y="44" width="6" height="14" rx="3" fill={botColor} />
      
      {/* Main Head */}
      <rect x="26" y="32" width="48" height="34" rx="17" fill={botColor} />
      
      {/* Tail (Speech Bubble Tip) */}
      <path d="M 40 64 L 42 74 L 50 65 Z" fill={botColor} />
      
      {/* Eyes (Cutouts) */}
      <circle cx="41" cy="46" r="3.5" fill={cutoutColor} />
      <circle cx="59" cy="46" r="3.5" fill={cutoutColor} />
      
      {/* Mouth Smile (Cutout) */}
      <path d="M 44 53 Q 50 59 56 53 Z" fill={cutoutColor} />
    </svg>
  );
}

export default Logo;
