import { HTMLAttributes, forwardRef } from 'react';

export type BadgeStatus = 'pending' | 'approved' | 'rejected';
export type BadgeVariant = 'default' | 'primary' | 'accent' | 'success' | 'warning' | 'error';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  status?: BadgeStatus;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
}

const statusStyles: Record<BadgeStatus, string> = {
  pending: 'bg-amber-100 text-amber-800 border-amber-200',
  approved: 'bg-green-100 text-green-800 border-green-200',
  rejected: 'bg-red-100 text-red-800 border-red-200',
};

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-gray-100 text-gray-800 border-gray-200',
  primary: 'bg-primary-light text-primary-dark border-primary/20',
  accent: 'bg-accent-light text-accent-dark border-accent/20',
  success: 'bg-green-100 text-green-800 border-green-200',
  warning: 'bg-amber-100 text-amber-800 border-amber-200',
  error: 'bg-red-100 text-red-800 border-red-200',
};

const statusLabels: Record<BadgeStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
};

const sizeStyles = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      status,
      variant = 'default',
      size = 'sm',
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    // If status is provided, use status styles; otherwise use variant styles
    const colorStyles = status ? statusStyles[status] : variantStyles[variant];
    const displayText = status && !children ? statusLabels[status] : children;

    return (
      <span
        ref={ref}
        className={`
          inline-flex items-center
          font-medium
          rounded-badge
          border
          ${colorStyles}
          ${sizeStyles[size]}
          ${className}
        `}
        {...props}
      >
        {displayText}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export default Badge;
