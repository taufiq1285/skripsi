// src/lib/rbac/permissions.ts - FIXED VERSION
export interface Permission {
  id: string
  name: string
  description: string
  resource: string
  action: string
}

export interface RolePermissions {
  role: string
  permissions: Permission[]
  routes: string[]
  features: string[]
}

// Define all available permissions
export const PERMISSIONS: Record<string, Permission> = {
  // User Management
  'users.view': {
    id: 'users.view',
    name: 'View Users',
    description: 'Can view user list and details',
    resource: 'users',
    action: 'view'
  },
  'users.create': {
    id: 'users.create',
    name: 'Create Users',
    description: 'Can create new users',
    resource: 'users',
    action: 'create'
  },
  'users.edit': {
    id: 'users.edit',
    name: 'Edit Users',
    description: 'Can edit user information',
    resource: 'users',
    action: 'edit'
  },
  'users.delete': {
    id: 'users.delete',
    name: 'Delete Users',
    description: 'Can delete users',
    resource: 'users',
    action: 'delete'
  },

  // Lab Management
  'labs.view': {
    id: 'labs.view',
    name: 'View Labs',
    description: 'Can view lab rooms and details',
    resource: 'labs',
    action: 'view'
  },
  'labs.manage': {
    id: 'labs.manage',
    name: 'Manage Labs',
    description: 'Can create, edit, and configure lab rooms',
    resource: 'labs',
    action: 'manage'
  },

  // Mata Kuliah
  'subjects.view': {
    id: 'subjects.view',
    name: 'View Subjects',
    description: 'Can view mata kuliah list',
    resource: 'subjects',
    action: 'view'
  },
  'subjects.manage': {
    id: 'subjects.manage',
    name: 'Manage Subjects',
    description: 'Can create and edit mata kuliah',
    resource: 'subjects',
    action: 'manage'
  },
  'subjects.own': {
    id: 'subjects.own',
    name: 'Manage Own Subjects',
    description: 'Can manage only assigned mata kuliah',
    resource: 'subjects',
    action: 'own'
  },

  // Jadwal Praktikum
  'schedule.view': {
    id: 'schedule.view',
    name: 'View Schedule',
    description: 'Can view praktikum schedule',
    resource: 'schedule',
    action: 'view'
  },
  'schedule.manage': {
    id: 'schedule.manage',
    name: 'Manage Schedule',
    description: 'Can create and edit praktikum schedule',
    resource: 'schedule',
    action: 'manage'
  },
  'schedule.own': {
    id: 'schedule.own',
    name: 'Manage Own Schedule',
    description: 'Can manage only own praktikum schedule',
    resource: 'schedule',
    action: 'own'
  },

  // Inventaris
  'inventory.view': {
    id: 'inventory.view',
    name: 'View Inventory',
    description: 'Can view lab equipment inventory',
    resource: 'inventory',
    action: 'view'
  },
  'inventory.manage': {
    id: 'inventory.manage',
    name: 'Manage Inventory',
    description: 'Can add, edit, and delete inventory items',
    resource: 'inventory',
    action: 'manage'
  },

  // Peminjaman
  'borrowing.view': {
    id: 'borrowing.view',
    name: 'View Borrowing',
    description: 'Can view borrowing requests',
    resource: 'borrowing',
    action: 'view'
  },
  'borrowing.request': {
    id: 'borrowing.request',
    name: 'Request Borrowing',
    description: 'Can create borrowing requests',
    resource: 'borrowing',
    action: 'request'
  },
  'borrowing.approve': {
    id: 'borrowing.approve',
    name: 'Approve Borrowing',
    description: 'Can approve/reject borrowing requests',
    resource: 'borrowing',
    action: 'approve'
  },

  // Presensi
  'attendance.view': {
    id: 'attendance.view',
    name: 'View Attendance',
    description: 'Can view attendance records',
    resource: 'attendance',
    action: 'view'
  },
  'attendance.mark': {
    id: 'attendance.mark',
    name: 'Mark Attendance',
    description: 'Can mark student attendance',
    resource: 'attendance',
    action: 'mark'
  },
  'attendance.own': {
    id: 'attendance.own',
    name: 'View Own Attendance',
    description: 'Can view own attendance records',
    resource: 'attendance',
    action: 'own'
  },

  // Laporan
  'reports.view': {
    id: 'reports.view',
    name: 'View Reports',
    description: 'Can view student reports',
    resource: 'reports',
    action: 'view'
  },
  'reports.submit': {
    id: 'reports.submit',
    name: 'Submit Reports',
    description: 'Can submit praktikum reports',
    resource: 'reports',
    action: 'submit'
  },
  'reports.grade': {
    id: 'reports.grade',
    name: 'Grade Reports',
    description: 'Can grade and review student reports',
    resource: 'reports',
    action: 'grade'
  },

  // Materi
  'materials.view': {
    id: 'materials.view',
    name: 'View Materials',
    description: 'Can view praktikum materials',
    resource: 'materials',
    action: 'view'
  },
  'materials.manage': {
    id: 'materials.manage',
    name: 'Manage Materials',
    description: 'Can upload and manage praktikum materials',
    resource: 'materials',
    action: 'manage'
  },

  // System
  'system.reports': {
    id: 'system.reports',
    name: 'System Reports',
    description: 'Can view system-wide reports and analytics',
    resource: 'system',
    action: 'reports'
  }
}

// FIXED: Admin now has ALL permissions
export const ROLE_PERMISSIONS: Record<string, RolePermissions> = {
  'Admin': {
    role: 'Admin',
    permissions: [
      // User Management - FULL ACCESS
      PERMISSIONS['users.view'],
      PERMISSIONS['users.create'],
      PERMISSIONS['users.edit'],
      PERMISSIONS['users.delete'],
      
      // Lab Management - FULL ACCESS
      PERMISSIONS['labs.view'],
      PERMISSIONS['labs.manage'],
      
      // Mata Kuliah - FULL ACCESS
      PERMISSIONS['subjects.view'],
      PERMISSIONS['subjects.manage'],
      PERMISSIONS['subjects.own'], // Admin can manage all subjects
      
      // Jadwal - FULL ACCESS
      PERMISSIONS['schedule.view'],
      PERMISSIONS['schedule.manage'],
      PERMISSIONS['schedule.own'], // Admin can manage all schedules
      
      // Inventaris - FULL ACCESS
      PERMISSIONS['inventory.view'],
      PERMISSIONS['inventory.manage'],
      
      // Peminjaman - FULL ACCESS
      PERMISSIONS['borrowing.view'],
      PERMISSIONS['borrowing.request'],
      PERMISSIONS['borrowing.approve'],
      
      // Presensi - FULL ACCESS
      PERMISSIONS['attendance.view'],
      PERMISSIONS['attendance.mark'],
      PERMISSIONS['attendance.own'],
      
      // Laporan - FULL ACCESS
      PERMISSIONS['reports.view'],
      PERMISSIONS['reports.submit'],
      PERMISSIONS['reports.grade'],
      
      // Materi - FULL ACCESS
      PERMISSIONS['materials.view'],
      PERMISSIONS['materials.manage'],
      
      // System - FULL ACCESS
      PERMISSIONS['system.reports']
    ],
    routes: [
      '/admin',
      '/admin/users',
      '/admin/labs',
      '/admin/subjects',
      '/admin/reports',
      '/dosen', // Admin can access all role pages
      '/laboran',
      '/mahasiswa',
      '/dashboard'
    ],
    features: [
      'user-management',
      'lab-management',
      'system-reports',
      'subject-management',
      'inventory-management', // Admin has access to ALL features
      'borrowing-approval',
      'equipment-maintenance',
      'stock-management',
      'subject-teaching',
      'schedule-management',
      'attendance-marking',
      'report-grading',
      'material-management',
      'schedule-viewing',
      'material-access',
      'report-submission',
      'attendance-viewing',
      'profile-management'
    ]
  },

  'Dosen': {
    role: 'Dosen',
    permissions: [
      PERMISSIONS['subjects.view'],
      PERMISSIONS['subjects.own'],
      PERMISSIONS['schedule.view'],
      PERMISSIONS['schedule.own'],
      PERMISSIONS['attendance.view'],
      PERMISSIONS['attendance.mark'],
      PERMISSIONS['reports.view'],
      PERMISSIONS['reports.grade'],
      PERMISSIONS['materials.view'],
      PERMISSIONS['materials.manage'],
      PERMISSIONS['borrowing.view'],
      PERMISSIONS['borrowing.request']
    ],
    routes: [
      '/dosen',
      '/dosen/subjects',
      '/dosen/schedule',
      '/dosen/attendance',
      '/dosen/reports',
      '/dosen/materials',
      '/dosen/borrowing',
      '/dashboard'
    ],
    features: [
      'subject-teaching',
      'schedule-management',
      'attendance-marking',
      'report-grading',
      'material-management'
    ]
  },

  'Laboran': {
    role: 'Laboran',
    permissions: [
      PERMISSIONS['inventory.view'],
      PERMISSIONS['inventory.manage'],
      PERMISSIONS['borrowing.view'],
      PERMISSIONS['borrowing.approve'],
      PERMISSIONS['labs.view'],
      PERMISSIONS['schedule.view']
    ],
    routes: [
      '/laboran',
      '/laboran/inventory',
      '/laboran/borrowing',
      '/laboran/maintenance',
      '/laboran/stock',
      '/dashboard'
    ],
    features: [
      'inventory-management',
      'borrowing-approval',
      'equipment-maintenance',
      'stock-management'
    ]
  },

  'Mahasiswa': {
    role: 'Mahasiswa',
    permissions: [
      PERMISSIONS['schedule.view'],
      PERMISSIONS['materials.view'],
      PERMISSIONS['reports.submit'],
      PERMISSIONS['attendance.own'],
      PERMISSIONS['reports.view'] // own reports only
    ],
    routes: [
      '/mahasiswa',
      '/mahasiswa/schedule',
      '/mahasiswa/materials',
      '/mahasiswa/reports',
      '/mahasiswa/attendance',
      '/mahasiswa/profile',
      '/dashboard'
    ],
    features: [
      'schedule-viewing',
      'material-access',
      'report-submission',
      'attendance-viewing',
      'profile-management'
    ]
  }
}

// Permission checking utilities
export class PermissionChecker {
  
  /**
   * Check if user has specific permission
   */
  static hasPermission(userRole: string, permissionId: string): boolean {
    const rolePerms = ROLE_PERMISSIONS[userRole]
    if (!rolePerms) return false
    
    return rolePerms.permissions.some(perm => perm.id === permissionId)
  }

  /**
   * Check if user can access specific route
   */
  static canAccessRoute(userRole: string, route: string): boolean {
    const rolePerms = ROLE_PERMISSIONS[userRole]
    if (!rolePerms) return false
    
    // Check exact match first
    if (rolePerms.routes.includes(route)) return true
    
    // Check if route starts with any allowed route
    return rolePerms.routes.some(allowedRoute => 
      route.startsWith(allowedRoute) || allowedRoute.startsWith(route)
    )
  }

  /**
   * Check if user has access to feature
   */
  static hasFeatureAccess(userRole: string, feature: string): boolean {
    const rolePerms = ROLE_PERMISSIONS[userRole]
    if (!rolePerms) return false
    
    return rolePerms.features.includes(feature)
  }

  /**
   * Get all permissions for a role
   */
  static getRolePermissions(userRole: string): Permission[] {
    const rolePerms = ROLE_PERMISSIONS[userRole]
    return rolePerms ? rolePerms.permissions : []
  }

  /**
   * Get allowed routes for a role
   */
  static getAllowedRoutes(userRole: string): string[] {
    const rolePerms = ROLE_PERMISSIONS[userRole]
    return rolePerms ? rolePerms.routes : []
  }

  /**
   * Check multiple permissions (AND logic)
   */
  static hasAllPermissions(userRole: string, permissionIds: string[]): boolean {
    return permissionIds.every(permId => this.hasPermission(userRole, permId))
  }

  /**
   * Check multiple permissions (OR logic)
   */
  static hasAnyPermission(userRole: string, permissionIds: string[]): boolean {
    return permissionIds.some(permId => this.hasPermission(userRole, permId))
  }
}

// FIXED: Remove duplicate export
export type { Permission as PermissionType }