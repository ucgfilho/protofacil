import * as React from 'react';
import { cn } from './button';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const inputId = id || props.name;
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-lg font-medium text-gray-700 mb-2">
            {label}
          </label>
        )}
        <input
          id={inputId}
          className={cn(
            'w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg transition-colors',
            'focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200',
            'placeholder:text-gray-400',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-200',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="mt-1 text-base text-red-600">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';