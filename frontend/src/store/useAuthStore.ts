import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { jwtDecode } from 'jwt-decode';

interface User {
  id: string;
  name: string;
  roles: string[];
}

interface AuthState {
  token: string | null;
  user: User | null;
  login: (token: string) => void;
  logout: () => void;
  isAdmin: () => boolean;
  isCustomer: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      login: (token: string) => {
        try {
          const decoded = jwtDecode<any>(token);
          const rolesClaim = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
          const roles = Array.isArray(rolesClaim) ? rolesClaim : [rolesClaim];
            
          const user: User = {
            id: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'],
            name: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
            roles: roles.filter(Boolean),
          };
          set({ token, user });
        } catch (e) {
          console.error("Invalid token", e);
        }
      },
      logout: () => set({ token: null, user: null }),
      isAdmin: () => {
        const user = get().user;
        return user?.roles.includes('Admin') ?? false;
      },
      isCustomer: () => {
        const user = get().user;
        return user?.roles.includes('Customer') ?? false;
      }
    }),
    {
      name: 'auth-storage',
    }
  )
);
