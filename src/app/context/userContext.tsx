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
import { useAuth } from './authContext';
/* import { StoreService } from '@/app/api/services/client/memberService/store'; */

export type Role = 'client' | 'seller';
export type BusinessApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | null;

export interface User {
  username: string;
  role: Role;
  // Make location optional so login() can be used without providing it
  location?: string;
  businessApprovalStatus?: BusinessApprovalStatus;
  storeId?: string | null; // Store ID if user is a seller
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
  const { isLoggedIn, checkAuthState } = useAuth();

  // Load saved user on first mount (client-side only)
  useEffect(() => {
    try {
      const raw = localStorage.getItem('user');
      const authToken = localStorage.getItem('authToken');
      if (raw && authToken) {
        const savedUser = JSON.parse(raw) as User;
        setUser(savedUser);
        // Only refresh user data if we have a valid auth token
        setTimeout(() => {
          console.log('🔄 Auto-refreshing user data on app load...');
          refreshUserData();
        }, 500); // Small delay to ensure app is fully loaded
      } else if (raw) {
        // Load user data without refreshing if no auth token
        const savedUser = JSON.parse(raw) as User;
        setUser(savedUser);
      }
    } catch {
      // ignore JSON parse errors
    }
  }, []);

  // Sync with AuthContext login state
  useEffect(() => {
    if (!isLoggedIn) {
      // If not logged in, clear user data
      setUser(null);
      localStorage.removeItem('user');
    }
  }, [isLoggedIn]);

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

    // Check if we have a valid auth token before attempting to refresh
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      console.log('No auth token found, skipping user data refresh');
      return;
    }

    // Ensure auth state is valid before making API calls
    await checkAuthState();

    // Double-check after auth state check
    const updatedAuthToken = localStorage.getItem('authToken');
    if (!updatedAuthToken) {
      console.log('Auth token invalid after check, skipping user data refresh');
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

        // If member info fails due to auth issues, don't update user data
        if (
          memberResponse.status === 'rejected' &&
          (memberResponse.reason?.message?.includes('401') ||
            memberResponse.reason?.message?.includes('403'))
        ) {
          console.log('Authentication failed, user may need to re-login');
          // Don't clear user data, just skip the refresh
          return;
        }
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
          '🎯 Final   business approval status:',
          businessApprovalStatus
        );

        // Update user with backend data
        const updatedUser: User = {
          username: userData.username || user?.username || '',
          role: userRole,
          location: userData.location || user?.location,
          businessApprovalStatus: businessApprovalStatus,
          storeId: userData.storeId || user?.storeId,
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

      // Don't clear user data on authentication errors - just log the error
      // The user can still use the app with cached data
      if (
        error instanceof Error &&
        (error.message.includes('401') || error.message.includes('403'))
      ) {
        console.log(
          'Authentication error detected, but keeping cached user data'
        );
      }
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
