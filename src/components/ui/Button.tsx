import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variants = {
      primary: 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:from-purple-600 hover:to-indigo-700 focus:ring-purple-500',
      secondary: 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white hover:from-blue-600 hover:to-cyan-700 focus:ring-blue-500',
      outline: 'border-2 border-gray-300 text-gray-700 hover:border-purple-500 hover:text-purple-600 focus:ring-purple-500',
      ghost: 'text-gray-600 hover:text-purple-600 hover:bg-purple-50 focus:ring-purple-500',
      destructive: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(baseClasses, variants[variant], sizes[size], className)}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
        ) : null}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

export default Button;