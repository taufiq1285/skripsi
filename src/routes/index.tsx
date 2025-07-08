import { createBrowserRouter, Navigate } from 'react-router-dom'
import Login from '@/pages/auth/Login'
import Dashboard from '@/pages/dashboard/Dashboard'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />
  },
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/dashboard',
    element: <Dashboard />
  },
  {
    path: '*',
    element: <Navigate to="/login" replace />
  }
])
