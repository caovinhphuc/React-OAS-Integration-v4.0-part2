// src/components/atoms/Icon.tsx
import React from 'react';

interface IconProps {
  name: string;
  size?: number;
  className?: string;
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 16,
  className = '',
}) => {
  const iconMap: Record<string, string> = {
    // Server status icons
    settings: '⚙️',
    view: '✅',
    close: '❌',

    // Form icons
    people: '👤',
    password: '🔒',

    // Action icons
    eye: '👁️',
    'eye-off': '🙈',
  };

  const icon = iconMap[name] || '❓';

  return (
    <span
      className={className}
      style={{ fontSize: `${size}px` }}
      role="img"
      aria-label={name}
    >
      {icon}
    </span>
  );
};
