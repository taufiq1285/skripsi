// src/components/ui/Button.tsx
import React from 'react'
import { cn } from '@/lib/utils/helpers'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    leftIcon,
    rightIcon,
    fullWidth = false,
    children,
    disabled,
    ...props
  }, ref) => {
    
    // Base button styles
    const baseStyles = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none"
    
    // Variant styles
    const variants = {
      primary: "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 shadow-sm hover:shadow-md",
      secondary: "bg-gray-200 hover:bg-gray-300 text-gray-800 focus:ring-gray-500",
      success: "bg-green-600 hover:bg-green-700 text-white focus:ring-green-500 shadow-sm hover:shadow-md",
      warning: "bg-yellow-600 hover:bg-yellow-700 text-white focus:ring-yellow-500 shadow-sm hover:shadow-md",
      danger: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 shadow-sm hover:shadow-md",
      ghost: "bg-transparent hover:bg-gray-100 text-gray-700 focus:ring-gray-500",
      outline: "border-2 border-gray-300 hover:border-gray-400 bg-transparent text-gray-700 focus:ring-gray-500 hover:bg-gray-50"
    }
    
    // Size styles
    const sizes = {
      sm: "px-3 py-1.5 text-sm gap-1.5",
      md: "px-4 py-2 text-base gap-2",
      lg: "px-6 py-3 text-lg gap-2.5",
      xl: "px-8 py-4 text-xl gap-3"
    }
    
    // Width style
    const widthStyle = fullWidth ? "w-full" : ""
    
    // Loading spinner component
    const LoadingSpinner = ({ size }: { size: string }) => {
      const spinnerSizes = {
        sm: "w-3 h-3",
        md: "w-4 h-4", 
        lg: "w-5 h-5",
        xl: "w-6 h-6"
      }
      
      return (
        <svg 
          className={`animate-spin ${spinnerSizes[size as keyof typeof spinnerSizes]}`} 
          fill="none" 
          viewBox="0 0 24 24"
        >
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4"
          />
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )
    }
    
    return (
      <button
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          widthStyle,
          className
        )}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {/* Left Icon or Loading Spinner */}
        {isLoading ? (
          <LoadingSpinner size={size} />
        ) : leftIcon ? (
          <span className="flex-shrink-0">{leftIcon}</span>
        ) : null}
        
        {/* Button Text */}
        {children && (
          <span className={isLoading ? "opacity-70" : ""}>
            {children}
          </span>
        )}
        
        {/* Right Icon */}
        {rightIcon && !isLoading && (
          <span className="flex-shrink-0">{rightIcon}</span>
        )}
      </button>
    )
  }
)

Button.displayName = "Button"

export { Button }