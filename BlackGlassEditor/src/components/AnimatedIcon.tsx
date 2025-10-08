/**
 * Animated Icon Component
 * Renders icons with various animation effects
 */

import React from 'react';

interface AnimatedIconProps {
  svg: string;
  animation?: 'none' | 'pulse' | 'bounce' | 'spin' | 'ping' | 'wiggle' | 'float' | 'glow';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  hoverOnly?: boolean;
}

const AnimatedIcon: React.FC<AnimatedIconProps> = ({
  svg,
  animation = 'none',
  size = 'md',
  className = '',
  hoverOnly = false
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const animationClasses = {
    none: '',
    pulse: hoverOnly ? 'hover:animate-pulse' : 'animate-pulse',
    bounce: hoverOnly ? 'hover:animate-bounce' : 'animate-bounce',
    spin: hoverOnly ? 'hover:animate-spin' : 'animate-spin',
    ping: hoverOnly ? 'hover:animate-ping' : 'animate-ping',
    wiggle: hoverOnly ? 'hover:animate-wiggle' : 'animate-wiggle',
    float: hoverOnly ? 'hover:animate-float' : 'animate-float',
    glow: hoverOnly ? 'hover:animate-glow' : 'animate-glow'
  };

  return (
    <div 
      className={`${sizeClasses[size]} ${animationClasses[animation]} ${className} transition-all duration-200`}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
};

export default AnimatedIcon;
