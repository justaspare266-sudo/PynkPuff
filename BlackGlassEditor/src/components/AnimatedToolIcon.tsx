/**
 * Animated Tool Icon Component
 * Renders Lucide React icons with hover animations for toolbar buttons
 */

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface AnimatedToolIconProps {
  icon: LucideIcon;
  animation?: 'none' | 'pulse' | 'bounce' | 'spin' | 'ping' | 'wiggle' | 'float' | 'glow' | 'scale' | 'shake';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  hoverOnly?: boolean;
  isActive?: boolean;
  tooltip?: string;
}

const AnimatedToolIcon: React.FC<AnimatedToolIconProps> = ({
  icon: Icon,
  animation = 'scale',
  size = 'md',
  className = '',
  hoverOnly = true,
  isActive = false,
  tooltip
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8'
  };

  const animationClasses = {
    none: '',
    pulse: hoverOnly ? 'hover:animate-pulse' : 'animate-pulse',
    bounce: hoverOnly ? 'hover:animate-bounce' : 'animate-bounce',
    spin: hoverOnly ? 'hover:animate-spin' : 'animate-spin',
    ping: hoverOnly ? 'hover:animate-ping' : 'animate-ping',
    wiggle: hoverOnly ? 'hover:animate-wiggle' : 'animate-wiggle',
    float: hoverOnly ? 'hover:animate-float' : 'animate-float',
    glow: hoverOnly ? 'hover:animate-glow' : 'animate-glow',
    scale: hoverOnly ? 'hover:scale-110' : 'scale-110',
    shake: hoverOnly ? 'hover:animate-shake' : 'animate-shake'
  };

  const baseClasses = `
    ${sizeClasses[size]} 
    ${animationClasses[animation]} 
    ${isActive ? 'text-blue-400' : 'text-gray-300'} 
    transition-all duration-200 ease-in-out
    ${className}
  `.trim();

  return (
    <div 
      className={baseClasses}
      title={tooltip}
    >
      <Icon className="w-full h-full" />
    </div>
  );
};

export default AnimatedToolIcon;
