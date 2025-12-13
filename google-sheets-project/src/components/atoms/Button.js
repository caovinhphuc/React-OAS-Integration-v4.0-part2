import React from 'react';
import './Button.css';

export const Button = ({ 
  type = 'button', 
  variant = 'primary', 
  size = 'md', 
  loading = false, 
  disabled = false,
  className = '', 
  children, 
  onClick,
  ...props 
}) => {
  const buttonClasses = [
    'btn',
    `btn--${variant}`,
    `btn--${size}`,
    loading && 'btn--loading',
    disabled && 'btn--disabled',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={buttonClasses}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && <span className="btn__spinner">⟳</span>}
      <span className="btn__text">{children}</span>
    </button>
  );
};
