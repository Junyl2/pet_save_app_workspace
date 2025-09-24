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
import { BusinessService } from '@/app/api/services/client/businessService/businessService';
/* import { StoreService } from '@/app/api/services/client/memberService/store'; */

export type Role = 'client' | 'seller';
export type BusinessApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | null;

export interface User {
  username: string;
  role: Role;
  // Make location optional so login() can be used without providing it
  location?: string;
  businessApprovalStatus?: BusinessApprovalStatus;
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
      if (raw) {
        const savedUser = JSON.parse(raw) as User;
        setUser(savedUser);
        // Refresh user data to get latest business registration status
        setTimeout(() => {
          console.log('🔄 Auto-refreshing user data on app load...');
          refreshUserData();
        }, 500); // Small delay to ensure app is fully loaded
      }
    } catch {
      // ignore JSON parse errors
    }
  }, []);

  const login = (userData: User) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    // Refresh user data to get latest business registration status
    setTimeout(() => {
      console.log('🔄 Auto-refreshing user data after login...');
      refreshUserData();
    }, 100); // Small delay to ensure login is processed
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

      // Always fetch both member info and business registration status in parallel
      // Business registration status is the source of truth for approval status
      const [memberResponse, businessResponse] = await Promise.allSettled([
        MemberService.getMyInfo(),
        BusinessService.getMyBusinessRegistration(),
      ]);

      let userData = null;
      let businessData = null;

      // Process member info
      if (
        memberResponse.status === 'fulfilled' &&
        memberResponse.value.data?.success
      ) {
        userData = memberResponse.value.data.data;
        console.log('Backend user data:', userData);
      } else {
        console.log(
          'Failed to get member info from backend:',
          memberResponse.status === 'rejected'
            ? memberResponse.reason
            : 'No data'
        );
      }

      // Process business registration info
      if (
        businessResponse.status === 'fulfilled' &&
        businessResponse.value.data?.success
      ) {
        businessData = businessResponse.value.data.data;
        console.log('Business registration data:', businessData);
      } else {
        console.log(
          'No business registration found or error:',
          businessResponse.status === 'rejected'
            ? businessResponse.reason
            : 'No data'
        );
      }

      if (userData) {
        // Determine user role based on business approval status
        let userRole = userData.role || user?.role || 'client';
        let businessApprovalStatus = userData.businessApprovalStatus;

        // If we have business registration data, use its status
        if (businessData) {
          businessApprovalStatus = businessData.status;
          console.log(
            '📋 Using business registration status:',
            businessData.status
          );
        } else {
          console.log(
            '📋 No business registration data found, using member info status:',
            businessApprovalStatus
          );
        }

        console.log('🔄 UserContext - Processing Business Approval Status:');
        console.log('  - Original Role from API:', userData.role);
        console.log('  - Business Approval Status:', businessApprovalStatus);
        console.log('  - Store ID:', userData.storeId);

        // If user has applied for business registration but not approved yet, keep as client
        if (businessApprovalStatus === 'PENDING') {
          console.log(
            '⏳ User has pending business registration, keeping as client'
          );
          userRole = 'client';
        } else if (businessApprovalStatus === 'APPROVED') {
          console.log(
            '✅ User has approved business registration, upgrading to seller'
          );
          userRole = 'seller';
        } else if (businessApprovalStatus === 'REJECTED') {
          console.log(
            '❌ User business registration was rejected, keeping as client'
          );
          userRole = 'client';
        } else if (userRole === 'client' && userData.storeId) {
          // Fallback: Check if user has a storeId (for backward compatibility)
          console.log(
            '🔄 User has storeId in member info, upgrading to seller (fallback)'
          );
          userRole = 'seller';
        }

        console.log('🎯 Final determined role:', userRole);
        console.log(
          '🎯 Final business approval status:',
          businessApprovalStatus
        );

        // Update user with backend data
        const updatedUser: User = {
          username: userData.username || user?.username || '',
          role: userRole,
          location: userData.location || user?.location,
          businessApprovalStatus: businessApprovalStatus,
        };

        console.log('✅ Updated user from backend:', updatedUser);
        console.log('🔍 User role check:', updatedUser.role === 'seller');
        console.log(
          '🔍 Business status check:',
          updatedUser.businessApprovalStatus === 'APPROVED'
        );
        console.log(
          '🔍 Should show seller UI:',
          updatedUser.role === 'seller' &&
            updatedUser.businessApprovalStatus === 'APPROVED'
        );
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      } else {
        console.log('Failed to get member info from backend');
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing]);

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
