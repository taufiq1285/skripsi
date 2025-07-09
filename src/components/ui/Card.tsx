// src/components/ui/Card.tsx
import React from 'react'
import { cn } from '@/lib/utils/helpers'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outlined' | 'elevated' | 'flat'
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  hover?: boolean
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({
    className,
    variant = 'default',
    padding = 'md',
    hover = false,
    children,
    ...props
  }, ref) => {
    
    // Base card styles
    const baseStyles = "bg-white rounded-lg transition-all duration-200"
    
    // Variant styles
    const variants = {
      default: "border border-gray-200 shadow-sm",
      outlined: "border-2 border-gray-300",
      elevated: "shadow-lg border border-gray-100",
      flat: "border-0"
    }
    
    // Padding styles
    const paddings = {
      none: "",
      sm: "p-3",
      md: "p-4", 
      lg: "p-6",
      xl: "p-8"
    }
    
    // Hover styles
    const hoverStyles = hover ? "hover:shadow-md cursor-pointer" : ""
    
    return (
      <div
        className={cn(
          baseStyles,
          variants[variant],
          paddings[padding],
          hoverStyles,
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = "Card"

// Card Header Component
export const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { divider?: boolean }
>(({ className, divider = false, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col space-y-1.5",
      divider && "pb-4 border-b border-gray-200 mb-4",
      className
    )}
    {...props}
  >
    {children}
  </div>
))
CardHeader.displayName = "CardHeader"

// Card Title Component
export const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement> & { as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' }
>(({ className, as: Component = 'h3', children, ...props }, ref) => (
  <Component
    ref={ref}
    className={cn("text-lg font-semibold text-gray-900", className)}
    {...props}
  >
    {children}
  </Component>
))
CardTitle.displayName = "CardTitle"

// Card Description Component
export const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-gray-600", className)}
    {...props}
  >
    {children}
  </p>
))
CardDescription.displayName = "CardDescription"

// Card Content Component
export const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("", className)}
    {...props}
  >
    {children}
  </div>
))
CardContent.displayName = "CardContent"

// Card Footer Component
export const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { divider?: boolean }
>(({ className, divider = false, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center",
      divider && "pt-4 border-t border-gray-200 mt-4",
      className
    )}
    {...props}
  >
    {children}
  </div>
))
CardFooter.displayName = "CardFooter"

export { Card }