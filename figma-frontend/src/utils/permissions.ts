// figma-frontend/src/utils/permissions.ts
export type UserRole = 'developer' | 'super_admin' | 'company_admin' | 'staff' | 'customer';

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  'developer': 5,
  'super_admin': 4,
  'company_admin': 3,
  'staff': 2,
  'customer': 1
};

export const hasRequiredRole = (userRole: UserRole | undefined, requiredRole: UserRole): boolean => {
  if (!userRole) return false;
  return (ROLE_HIERARCHY[userRole] || 0) >= (ROLE_HIERARCHY[requiredRole] || 0);
};

export const canAccessModule = (userRole: UserRole | undefined, allowedRoles: UserRole[]): boolean => {
  if (!userRole) return false;
  return allowedRoles.includes(userRole);
};