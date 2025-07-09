// src/components/ui/Input.tsx
import React from 'react'
import { cn } from '@/lib/utils/helpers'

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  isInvalid?: boolean
  isRequired?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({
    className,
    type = 'text',
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    isInvalid,
    isRequired,
    size = 'md',
    id,
    ...props
  }, ref) => {
    
    // Generate unique ID if not provided
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`
    
    // Determine if input is in error state
    const hasError = isInvalid || !!error
    
    // Base input styles
    const baseStyles = "w-full border rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed bg-white"
    
    // Size styles
    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-3 py-2 text-base", 
      lg: "px-4 py-3 text-lg"
    }
    
    // State styles
    const stateStyles = hasError 
      ? "border-red-300 focus:border-red-500 focus:ring-red-500" 
      : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
    
    // Container styles for icons
    const hasLeftIcon = !!leftIcon
    const hasRightIcon = !!rightIcon
    const paddingStyles = hasLeftIcon ? "pl-10" : hasRightIcon ? "pr-10" : ""
    
    return (
      <div className="w-full">
        {/* Label */}
        {label && (
          <label 
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
            {isRequired && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        {/* Input Container */}
        <div className="relative">
          {/* Left Icon */}
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className={`text-gray-400 ${size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-base'}`}>
                {leftIcon}
              </span>
            </div>
          )}
          
          {/* Input Field */}
          <input
            type={type}
            id={inputId}
            className={cn(
              baseStyles,
              sizes[size],
              stateStyles,
              paddingStyles,
              className
            )}
            ref={ref}
            {...props}
          />
          
          {/* Right Icon */}
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className={`text-gray-400 ${size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-base'}`}>
                {rightIcon}
              </span>
            </div>
          )}
        </div>
        
        {/* Error Message */}
        {error && (
          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        )}
        
        {/* Helper Text */}
        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = "Input"

export { Input }