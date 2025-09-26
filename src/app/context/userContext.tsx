'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  ReactNode,
} from 'react';
import { MemberService } from '@/app/api/services/client/memberService/memberService';
import { BusinessService } from '@/app/api/services/client/businessService/businessService';
import { useAuth } from './authContext';
import { MemberInfo } from '@/app/api/types/member/member';

export type Role = 'client' | 'seller';
export type BusinessApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | null;

export interface User {
  username: string;
  role: Role;
  location?: string;
  businessApprovalStatus?: BusinessApprovalStatus;
  storeId?: string | null;
}

interface BusinessData {
  status: string;
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
  const userRef = useRef<User | null>(null);

  // Update ref whenever user state changes
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // -------- refreshUserData (memoized) --------
  const refreshUserData = useCallback(async () => {
    // Prevent multiple simultaneous calls
    if (isRefreshing) {
      console.log('⏳ User data refresh already in progress, skipping...');
      return;
    }

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

      // Fetch both member info and business registration in parallel
      const [memberResponse, businessResponse] = await Promise.allSettled([
        MemberService.getMyInfo(),
        BusinessService.getMyBusinessRegistration(),
      ]);

      let userData: MemberInfo | null = null;
      let businessData: BusinessData | null = null;

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

        if (
          memberResponse.status === 'rejected' &&
          (memberResponse.reason?.message?.includes('401') ||
            memberResponse.reason?.message?.includes('403'))
        ) {
          console.log('Authentication failed, user may need to re-login');
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
        // Get current user data to preserve existing values
        const currentUser = userRef.current;

        // Determine user role based on business approval status
        let userRole: Role =
          (userData.role as Role) || currentUser?.role || 'client';
        let businessApprovalStatus: BusinessApprovalStatus =
          (userData.businessApprovalStatus as BusinessApprovalStatus) ?? null;

        if (businessData) {
          businessApprovalStatus =
            businessData.status as BusinessApprovalStatus;
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

        const updatedUser: User = {
          username: userData.username || currentUser?.username || '',
          role: userRole,
          location: userData.location || currentUser?.location,
          businessApprovalStatus,
          storeId: userData.storeId || currentUser?.storeId,
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
    } catch (err: unknown) {
      console.error('Error refreshing user data:', err);
      if (
        err instanceof Error &&
        (err.message.includes('401') || err.message.includes('403'))
      ) {
        console.log(
          'Authentication error detected, but keeping cached user data'
        );
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, checkAuthState]); // ✅ Remove user dependency to prevent infinite loop

  // -------- Load saved user on first mount (client-only) --------
  const didInit = useRef(false);
  useEffect(() => {
    if (didInit.current) return; // guard to ensure "run once"
    didInit.current = true;

    try {
      const raw = localStorage.getItem('user');
      const authToken = localStorage.getItem('authToken');
      if (raw && authToken) {
        const savedUser = JSON.parse(raw) as User;
        setUser(savedUser);
        // Only refresh user data if we have a valid auth token
        setTimeout(() => {
          console.log('🔄 Auto-refreshing user data on app load...');
          // safe to call; guarded by isRefreshing inside
          void refreshUserData();
        }, 500);
      } else if (raw) {
        const savedUser = JSON.parse(raw) as User;
        setUser(savedUser);
      }
    } catch {
      // ignore JSON parse errors
    }
  }, [refreshUserData]); // ✅ Include refreshUserData in dependencies

  // -------- Sync with AuthContext login state --------
  useEffect(() => {
    if (!isLoggedIn) {
      setUser(null);
      localStorage.removeItem('user');
    }
  }, [isLoggedIn]);

  // -------- Public actions --------
  const login = (userData: User) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setTimeout(() => {
      console.log('🔄 Auto-refreshing user data after login...');
      void refreshUserData();
    }, 100);
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
