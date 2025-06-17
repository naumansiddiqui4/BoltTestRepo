import React, { HTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'elevated';
  hover?: boolean;
}

export function Card({ className, variant = 'default', hover = false, children, ...props }: CardProps) {
  const variants = {
    default: 'bg-white border border-gray-200 shadow-sm',
    glass: 'bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg',
    elevated: 'bg-white shadow-xl border-0',
  };

  const Component = hover ? motion.div : 'div';
  const motionProps = hover ? {
    whileHover: { y: -2, shadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1)' },
    transition: { duration: 0.2 }
  } : {};

  return (
    <Component
      className={cn('rounded-xl p-6', variants[variant], className)}
      {...motionProps}
      {...props}
    >
      {children}
    </Component>
  );
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mb-4', className)} {...props} />;
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn('text-lg font-semibold text-gray-900', className)} {...props} />;
}

export function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-sm text-gray-600', className)} {...props} />;
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('', className)} {...props} />;
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mt-4 pt-4 border-t border-gray-100', className)} {...props} />;
}