// figma-frontend/src/contexts/AuthContext.tsx - Add hasPermission method

import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

export type UserRole = 'developer' | 'super_admin' | 'company_admin' | 'staff' | 'customer';

export interface User {
  id: string;
  email: string;
  fullName: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: UserRole;
  companyId?: string;
  avatar?: string;
  roles?: Array<{ id: string; name: string; slug: string }>;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  hasPermission: (role: string) => boolean;
}

interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  role?: UserRole;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const accessToken = localStorage.getItem('accessToken');
    
    if (storedUser && accessToken) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Failed to parse user:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
    }
    setLoading(false);
  }, []);

  const hasPermission = (roleSlug: string): boolean => {
    if (!user) return false;
    
    // Developer and super_admin have all permissions
    if (user.role === 'developer' || user.role === 'super_admin') {
      return true;
    }
    
    // Check if user has the specific role
    if (user.role === roleSlug) {
      return true;
    }
    
    // Check if user has the role in their roles array
    if (user.roles) {
      return user.roles.some(r => r.slug === roleSlug);
    }
    
    return false;
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password
      });

      const { user: backendUser, accessToken, refreshToken } = response.data;
      
      // Store tokens
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      // Decode JWT to get roles
      const decodeJWT = (token: string) => {
        try {
          const parts = token.split('.');
          const payload = JSON.parse(atob(parts[1]));
          return payload;
        } catch {
          return {};
        }
      };

      const tokenPayload = decodeJWT(accessToken);
      const rolesSlugs = tokenPayload.roles || [];
      
      const roleMap: { [key: string]: UserRole } = {
        'developer': 'developer',
        'super_admin': 'super_admin',
        'company_admin': 'company_admin',
        'staff': 'staff',
        'customer': 'customer'
      };
      
      let userRole: UserRole = 'customer';
      for (const roleSlug of rolesSlugs) {
        if (roleMap[roleSlug]) {
          userRole = roleMap[roleSlug];
          break;
        }
      }

      const authUser: User = {
        id: backendUser.id,
        email: backendUser.email,
        fullName: `${backendUser.first_name} ${backendUser.last_name}`,
        first_name: backendUser.first_name,
        last_name: backendUser.last_name,
        phone: backendUser.phone,
        role: userRole,
        companyId: backendUser.company_id,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${backendUser.email}`,
        roles: rolesSlugs.map(slug => ({ id: slug, name: slug, slug }))
      };

      setUser(authUser);
      localStorage.setItem('user', JSON.stringify(authUser));
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed';
      throw new Error(message);
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, {
        email: data.email,
        password: data.password,
        first_name: data.fullName.split(' ')[0],
        last_name: data.fullName.split(' ').slice(1).join(' ') || data.fullName.split(' ')[0],
        phone: data.phone,
        preferred_language: 'en'
      });

      const { user: backendUser } = response.data;
      
      const authUser: User = {
        id: backendUser.id,
        email: backendUser.email,
        fullName: `${backendUser.first_name} ${backendUser.last_name}`,
        first_name: backendUser.first_name,
        last_name: backendUser.last_name,
        phone: backendUser.phone,
        role: 'customer',
        companyId: backendUser.company_id,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${backendUser.email}`,
        roles: [{ id: 'customer', name: 'Customer', slug: 'customer' }]
      };

      setUser(authUser);
      localStorage.setItem('user', JSON.stringify(authUser));
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed';
      throw new Error(message);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      isAuthenticated: !!user,
      hasPermission,
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};








// // figma-frontend/src/contexts/AuthContext.tsx
// import React, { createContext, useContext, useState, useEffect } from 'react';
// import axios from 'axios';

// export type UserRole = 'developer' | 'super_admin' | 'company_admin' | 'staff' | 'customer';

// export interface User {
//   id: string;
//   email: string;
//   fullName: string;
//   first_name: string;
//   last_name: string;
//   phone: string;
//   role: UserRole;
//   roles?: Array<{ id: string; name: string; slug: string }>; // Add roles array
//   companyId?: string;
//   avatar?: string;
// }

// interface AuthContextType {
//   user: User | null;
//   login: (email: string, password: string) => Promise<void>;
//   register: (data: RegisterData) => Promise<void>;
//   logout: () => void;
//   isAuthenticated: boolean;
//   hasPermission: (role: UserRole | string) => boolean;
// }

// interface RegisterData {
//   email: string;
//   password: string;
//   fullName: string;
//   phone: string;
//   role?: UserRole;
// }

// const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within AuthProvider');
//   }
//   return context;
// };

// export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const [user, setUser] = useState<User | null>(null);

//   useEffect(() => {
//     const storedUser = localStorage.getItem('user');
//     if (storedUser) {
//       setUser(JSON.parse(storedUser));
//     }
//   }, []);

//   const hasPermission = (role: UserRole | string): boolean => {
//     if (!user) return false;
    
//     // Check if user has the required role
//     const requiredRole = role as UserRole;
//     const roleHierarchy: Record<UserRole, number> = {
//       'developer': 5,
//       'super_admin': 4,
//       'company_admin': 3,
//       'staff': 2,
//       'customer': 1
//     };
    
//     const userRoleLevel = roleHierarchy[user.role] || 0;
//     const requiredRoleLevel = roleHierarchy[requiredRole] || 0;
    
//     return userRoleLevel >= requiredRoleLevel;
//   };

//   const login = async (email: string, password: string) => {
//     try {
//       const response = await axios.post(`${API_BASE_URL}/auth/login`, {
//         email,
//         password
//       });

//       const { user: backendUser, accessToken, refreshToken } = response.data;
      
//       // Store tokens
//       localStorage.setItem('accessToken', accessToken);
//       localStorage.setItem('refreshToken', refreshToken);

//       // Decode JWT to get roles
//       const decodeJWT = (token: string) => {
//         try {
//           const parts = token.split('.');
//           const payload = JSON.parse(atob(parts[1]));
//           return payload;
//         } catch {
//           return {};
//         }
//       };

//       const tokenPayload = decodeJWT(accessToken);
//       const rolesSlugs = tokenPayload.roles || [];
      
//       const roleMap: { [key: string]: UserRole } = {
//         'developer': 'developer',
//         'super_admin': 'super_admin',
//         'company_admin': 'company_admin',
//         'staff': 'staff',
//         'customer': 'customer'
//       };
      
//       let userRole: UserRole = 'customer';
//       for (const roleSlug of rolesSlugs) {
//         if (roleMap[roleSlug]) {
//           userRole = roleMap[roleSlug];
//           break;
//         }
//       }

//       // Build roles array for the user
//       const userRoles = rolesSlugs.map((slug: string) => ({
//         id: slug,
//         name: slug.replace('_', ' ').toUpperCase(),
//         slug: slug
//       }));

//       const authUser: User = {
//         id: backendUser.id,
//         email: backendUser.email,
//         fullName: `${backendUser.first_name} ${backendUser.last_name}`,
//         first_name: backendUser.first_name,
//         last_name: backendUser.last_name,
//         phone: backendUser.phone,
//         role: userRole,
//         roles: userRoles,
//         companyId: backendUser.company_id,
//         avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${backendUser.email}`
//       };

//       setUser(authUser);
//       localStorage.setItem('user', JSON.stringify(authUser));
//     } catch (error: any) {
//       const message = error.response?.data?.message || 'Login failed';
//       throw new Error(message);
//     }
//   };

//   const register = async (data: RegisterData) => {
//     try {
//       const response = await axios.post(`${API_BASE_URL}/auth/register`, {
//         email: data.email,
//         password: data.password,
//         first_name: data.fullName.split(' ')[0],
//         last_name: data.fullName.split(' ').slice(1).join(' ') || data.fullName.split(' ')[0],
//         phone: data.phone,
//         preferred_language: 'en'
//       });

//       const { user: backendUser } = response.data;
      
//       const authUser: User = {
//         id: backendUser.id,
//         email: backendUser.email,
//         fullName: `${backendUser.first_name} ${backendUser.last_name}`,
//         first_name: backendUser.first_name,
//         last_name: backendUser.last_name,
//         phone: backendUser.phone,
//         role: 'customer',
//         roles: [{ id: 'customer', name: 'Customer', slug: 'customer' }],
//         companyId: backendUser.company_id,
//         avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${backendUser.email}`
//       };

//       setUser(authUser);
//       localStorage.setItem('user', JSON.stringify(authUser));
//     } catch (error: any) {
//       const message = error.response?.data?.message || 'Registration failed';
//       throw new Error(message);
//     }
//   };

//   const logout = () => {
//     setUser(null);
//     localStorage.removeItem('user');
//     localStorage.removeItem('accessToken');
//     localStorage.removeItem('refreshToken');
//   };

//   return (
//     <AuthContext.Provider value={{
//       user,
//       login,
//       register,
//       logout,
//       isAuthenticated: !!user,
//       hasPermission,
//     }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };








// // import React, { createContext, useContext, useState, useEffect } from 'react';
// // import axios from 'axios';

// // export type UserRole = 'developer' | 'super_admin' | 'company_admin' | 'staff' | 'customer';

// // export interface User {
// //   id: string;
// //   email: string;
// //   fullName: string;
// //   first_name: string;
// //   last_name: string;
// //   phone: string;
// //   role: UserRole;
// //   companyId?: string;
// //   avatar?: string;
// // }

// // interface AuthContextType {
// //   user: User | null;
// //   login: (email: string, password: string) => Promise<void>;
// //   register: (data: RegisterData) => Promise<void>;
// //   logout: () => void;
// //   isAuthenticated: boolean;
// // }

// // interface RegisterData {
// //   email: string;
// //   password: string;
// //   fullName: string;
// //   phone: string;
// //   role?: UserRole;
// // }

// // const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// // const AuthContext = createContext<AuthContextType | undefined>(undefined);

// // export const useAuth = () => {
// //   const context = useContext(AuthContext);
// //   if (!context) {
// //     throw new Error('useAuth must be used within AuthProvider');
// //   }
// //   return context;
// // };

// // export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
// //   const [user, setUser] = useState<User | null>(null);

// //   useEffect(() => {
// //     const storedUser = localStorage.getItem('user');
// //     if (storedUser) {
// //       setUser(JSON.parse(storedUser));
// //     }
// //   }, []);

// //   const login = async (email: string, password: string) => {
// //     try {
// //       const response = await axios.post(`${API_BASE_URL}/auth/login`, {
// //         email,
// //         password
// //       });

// //       const { user: backendUser, accessToken, refreshToken } = response.data;
      
// //       // Store tokens
// //       localStorage.setItem('accessToken', accessToken);
// //       localStorage.setItem('refreshToken', refreshToken);

// //       // Decode JWT to get roles (since the login response doesn't include the full Roles array)
// //       const decodeJWT = (token: string) => {
// //         try {
// //           const parts = token.split('.');
// //           const payload = JSON.parse(atob(parts[1]));
// //           return payload;
// //         } catch {
// //           return {};
// //         }
// //       };

// //       const tokenPayload = decodeJWT(accessToken);
// //       const rolesSlugs = tokenPayload.roles || [];
      
// //       const roleMap: { [key: string]: UserRole } = {
// //         'developer': 'developer',
// //         'super_admin': 'super_admin',
// //         'company_admin': 'company_admin',
// //         'staff': 'staff',
// //         'customer': 'customer'
// //       };
      
// //       let userRole: UserRole = 'customer';
// //       for (const roleSlug of rolesSlugs) {
// //         if (roleMap[roleSlug]) {
// //           userRole = roleMap[roleSlug];
// //           break;
// //         }
// //       }

// //       const authUser: User = {
// //         id: backendUser.id,
// //         email: backendUser.email,
// //         fullName: `${backendUser.first_name} ${backendUser.last_name}`,
// //         first_name: backendUser.first_name,
// //         last_name: backendUser.last_name,
// //         phone: backendUser.phone,
// //         role: userRole,
// //         companyId: backendUser.company_id,
// //         avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${backendUser.email}`
// //       };

// //       setUser(authUser);
// //       localStorage.setItem('user', JSON.stringify(authUser));
// //     } catch (error: any) {
// //       const message = error.response?.data?.message || 'Login failed';
// //       throw new Error(message);
// //     }
// //   };

// //   const register = async (data: RegisterData) => {
// //     try {
// //       const response = await axios.post(`${API_BASE_URL}/auth/register`, {
// //         email: data.email,
// //         password: data.password,
// //         first_name: data.fullName.split(' ')[0],
// //         last_name: data.fullName.split(' ').slice(1).join(' '),
// //         phone: data.phone,
// //         preferred_language: 'en'
// //       });

// //       const { user: backendUser } = response.data;
      
// //       const authUser: User = {
// //         id: backendUser.id,
// //         email: backendUser.email,
// //         fullName: `${backendUser.first_name} ${backendUser.last_name}`,
// //         first_name: backendUser.first_name,
// //         last_name: backendUser.last_name,
// //         phone: backendUser.phone,
// //         role: 'customer',
// //         companyId: backendUser.company_id,
// //         avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${backendUser.email}`
// //       };

// //       setUser(authUser);
// //       localStorage.setItem('user', JSON.stringify(authUser));
// //     } catch (error: any) {
// //       const message = error.response?.data?.message || 'Registration failed';
// //       throw new Error(message);
// //     }
// //   };

// //   const logout = () => {
// //     setUser(null);
// //     localStorage.removeItem('user');
// //     localStorage.removeItem('accessToken');
// //     localStorage.removeItem('refreshToken');
// //   };

// //   return (
// //     <AuthContext.Provider value={{
// //       user,
// //       login,
// //       register,
// //       logout,
// //       isAuthenticated: !!user,
// //     }}>
// //       {children}
// //     </AuthContext.Provider>
// //   );
// // };

