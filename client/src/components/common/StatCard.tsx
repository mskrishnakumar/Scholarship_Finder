import { HTMLAttributes, forwardRef } from 'react';

export interface StatCardProps extends HTMLAttributes<HTMLDivElement> {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  color: 'teal' | 'amber' | 'blue' | 'cyan';
  trend?: { value: number; label: string };
}

const colorClasses = {
  teal: 'bg-teal-100 text-teal-600',
  amber: 'bg-amber-100 text-amber-600',
  blue: 'bg-blue-100 text-blue-600',
  cyan: 'bg-cyan-100 text-cyan-600',
};

export const StatCard = forwardRef<HTMLDivElement, StatCardProps>(
  ({ icon: Icon, label, value, color, trend, className = '', ...props }, ref) => {
    const isPositiveTrend = trend && trend.value >= 0;

    return (
      <div
        ref={ref}
        className={`
          bg-white
          rounded-card
          shadow-card
          p-4 sm:p-6
          ${className}
        `}
        {...props}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-text-secondary">{label}</p>
            <p className="mt-2 text-2xl sm:text-3xl font-bold text-text-primary">
              {value}
            </p>
            {trend && (
              <div className="mt-2 flex items-center text-sm">
                <span
                  className={`flex items-center ${
                    isPositiveTrend ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {isPositiveTrend ? (
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 10l7-7m0 0l7 7m-7-7v18"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 14l-7 7m0 0l-7-7m7 7V3"
                      />
                    </svg>
                  )}
                  {Math.abs(trend.value)}%
                </span>
                <span className="ml-2 text-text-secondary">{trend.label}</span>
              </div>
            )}
          </div>
          <div
            className={`
              flex-shrink-0
              w-10 h-10 sm:w-12 sm:h-12
              rounded-full
              flex items-center justify-center
              ${colorClasses[color]}
            `}
          >
            <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>
      </div>
    );
  }
);

StatCard.displayName = 'StatCard';

export default StatCard;
