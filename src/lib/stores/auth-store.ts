import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Manager } from '../types';

interface AuthState {
  isAuthenticated: boolean;
  currentUser: Manager | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  // Mock managers for demo
  managers: Manager[];
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      currentUser: null,
      managers: [
        {
          id: '1',
          name: 'John Manager',
          email: 'john@company.com',
          role: 'manager'
        },
        {
          id: '2',
          name: 'Sarah Smith',
          email: 'sarah@company.com',
          role: 'manager'
        },
        {
          id: '3',
          name: 'Mike Johnson',
          email: 'mike@company.com',
          role: 'manager'
        }
      ],
      login: async (email: string, password: string) => {
        // Mock authentication - in real app, this would call an API
        const manager = get().managers.find(m => m.email === email);
        if (manager && password === 'password') {
          set({ isAuthenticated: true, currentUser: manager });
          return true;
        }
        return false;
      },
      logout: () => {
        set({ isAuthenticated: false, currentUser: null });
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        currentUser: state.currentUser
      })
    }
  )
); 