import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

interface PrivateRouteProps {
  children: React.ReactNode
  fallback?: string
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ 
  children, 
  fallback = '/login' 
}) => {
  const { user, loading } = useAuth()
  const location = useLocation()

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Checking authentication...</span>
        </div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!user?.isAuthenticated) {
    return <Navigate to={fallback} state={{ from: location }} replace />
  }

  return <>{children}</>
}
