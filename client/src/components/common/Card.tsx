import { HTMLAttributes, forwardRef } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingStyles = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    { hoverable = false, padding = 'md', className = '', children, ...props },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={`
          bg-white
          rounded-card
          shadow-card
          ${hoverable ? 'transition-shadow duration-200 hover:shadow-card-hover' : ''}
          ${paddingStyles[padding]}
          ${className}
        `}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ title, subtitle, action, className = '', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`flex items-start justify-between ${className}`}
        {...props}
      >
        <div>
          <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
          {subtitle && (
            <p className="mt-1 text-sm text-text-secondary">{subtitle}</p>
          )}
        </div>
        {action && <div className="ml-4 flex-shrink-0">{action}</div>}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

export default Card;
