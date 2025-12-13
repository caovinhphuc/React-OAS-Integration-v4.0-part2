import React from 'react';

export const Icon = ({ name, size = 16, color, className = '', ...props }) => {
  // Icon mapping - sử dụng emoji hoặc symbols đơn giản
  const iconMap = {
    // Auth & User
    people: '👤',
    user: '👤',
    users: '👥',
    
    // Security
    lock: '🔒',
    unlock: '🔓',
    key: '🔑',
    shield: '🛡️',
    
    // Actions
    view: '👁️',
    hide: '🙈',
    settings: '⚙️',
    edit: '✏️',
    save: '💾',
    delete: '🗑️',
    
    // Navigation
    close: '✖️',
    check: '✅',
    arrow: '→',
    back: '←',
    up: '↑',
    down: '↓',
    
    // Status
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
    loading: '⏳',
    
    // Actions
    search: '🔍',
    filter: '🔽',
    refresh: '🔄',
    download: '📥',
    upload: '📤',
    
    // Communication
    email: '📧',
    phone: '📞',
    message: '💬',
    
    // Files & Data
    file: '📄',
    folder: '📁',
    image: '🖼️',
    pdf: '📕',
    excel: '📗',
    
    // Default
    default: '●'
  };

  const iconSymbol = iconMap[name] || iconMap.default;

  const style = {
    fontSize: `${size}px`,
    color: color,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: 1,
    userSelect: 'none'
  };

  return (
    <span
      className={`icon icon--${name} ${className}`}
      style={style}
      role="img"
      aria-label={name}
      {...props}
    >
      {iconSymbol}
    </span>
  );
};
