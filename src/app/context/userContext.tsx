'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { MemberService } from '@/app/api/services/client/memberService/memberService';
/* import { StoreService } from '@/app/api/services/client/memberService/store'; */

export type Role = 'client' | 'seller';

export interface User {
  username: string;
  role: Role;
  // Make location optional so login() can be used without providing it
  location?: string;
}

interface UserContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  updateUserRole: (newRole: Role) => void;
  refreshUserData: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load saved user on first mount (client-side only)
  useEffect(() => {
    try {
      const raw = localStorage.getItem('user');
      if (raw) setUser(JSON.parse(raw) as User);
    } catch {
      // ignore JSON parse errors
    }
  }, []);

  const login = (userData: User) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateUserRole = (newRole: Role) => {
    if (user) {
      const updatedUser = { ...user, role: newRole };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    }
  };

  const refreshUserData = useCallback(async () => {
    // Prevent multiple simultaneous calls
    if (isRefreshing) {
      console.log('⏳ User data refresh already in progress, skipping...');
      return;
    }

    try {
      setIsRefreshing(true);
      console.log('🔄 Refreshing user data from backend...');
      const response = await MemberService.getMyInfo();

      if (response.data?.success && response.data?.data) {
        const userData = response.data.data;
        console.log('Backend user data:', userData);

        // Check if user has a store to determine if they're a seller
        let userRole = userData.role || user?.role || 'client';

        // If the member info doesn't show seller role, check if user is actually a seller
        if (userRole === 'client') {
          console.log(
            'User role is client, checking if user is actually a seller...'
          );

          // Check if user has a storeId in member info to determine if they're a seller
          if (userData.storeId) {
            console.log(
              'User has storeId in member info, upgrading to seller role'
            );
            userRole = 'seller';
          } else {
            console.log('User does not have storeId, checking localStorage...');

            // Fallback: Check localStorage for previous seller registration
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
              try {
                const parsedUser = JSON.parse(storedUser);
                if (parsedUser.role === 'seller') {
                  console.log(
                    'Found seller role in localStorage, upgrading role'
                  );
                  userRole = 'seller';
                } else {
                  console.log(
                    'No seller role found in localStorage, remaining as client'
                  );
                }
              } catch (parseError) {
                console.log('Error parsing stored user:', parseError);
              }
            } else {
              console.log('No stored user found, remaining as client');
            }
          }
        }

        // Update user with backend data
        const updatedUser: User = {
          username: userData.username || user?.username || '',
          role: userRole,
          location: userData.location || user?.location,
        };

        console.log('Updated user from backend:', updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      } else {
        console.log('Failed to get member info from backend:', response.error);
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, user]);

  return (
    <UserContext.Provider
      value={{ user, login, logout, updateUserRole, refreshUserData }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return ctx;
}
