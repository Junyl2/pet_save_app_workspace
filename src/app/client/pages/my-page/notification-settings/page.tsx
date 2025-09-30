'use client';
import { useState, useEffect } from 'react';
import { ProductHeader } from '@/app/components/sections/ProductDetails/Header/ProductHeader';
import { NotificationService } from '@/app/api/services/client/memberService/notification-settings/notificationService';
import { NotificationSettings } from '@/app/api/types/member/notification-settings/settings';
import { getMemberIdFromToken } from '@/app/utils/token-utils';
import styles from './NotificationSettings.module.css';

interface NotificationSetting {
  id: string;
  label: string;
  enabled: boolean;
  apiKey: keyof NotificationSettings;
}

export default function NotificationSettingsPage() {
  const [benefitSettings, setBenefitSettings] = useState<NotificationSetting[]>(
    [
      {
        id: 'email',
        label: '메일 수신 동의',
        enabled: false,
        apiKey: 'allowEmailReceive',
      },
      {
        id: 'sms',
        label: 'SMS 수신 동의',
        enabled: false,
        apiKey: 'allowSmsReceive',
      },
      {
        id: 'push',
        label: '푸시 알림 동의',
        enabled: true,
        apiKey: 'enablePushNotif',
      },
    ]
  );

  const [activitySettings, setActivitySettings] = useState<
    NotificationSetting[]
  >([
    {
      id: 'points',
      label: '포인트 적립 및 소멸',
      enabled: false,
      apiKey: 'enableExpiringPointsNotif',
    },
    {
      id: 'inquiry',
      label: '문의 답변 알림',
      enabled: false,
      apiKey: 'enableInquiryNotif',
    },
  ]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load settings on component mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await NotificationService.getMySettings();

      if (response.error) {
        setError(response.error);
        return;
      }

      if (response.data?.data) {
        const settings = response.data.data;

        // Update benefit settings
        setBenefitSettings((prev) =>
          prev.map((setting) => ({
            ...setting,
            enabled: settings[setting.apiKey],
          }))
        );

        // Update activity settings
        setActivitySettings((prev) =>
          prev.map((setting) => ({
            ...setting,
            enabled: settings[setting.apiKey],
          }))
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = async (section: 'benefit' | 'activity', id: string) => {
    if (isSaving) return;

    try {
      setIsSaving(true);
      setError(null);

      // Get member ID from token
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        setError('Authentication required');
        return;
      }

      const memberId = getMemberIdFromToken(authToken);
      if (!memberId) {
        setError('Unable to get member ID');
        return;
      }

      // Update local state first for immediate UI feedback
      let updatedSettings: NotificationSetting[] = [];
      if (section === 'benefit') {
        updatedSettings = benefitSettings.map((setting) =>
          setting.id === id
            ? { ...setting, enabled: !setting.enabled }
            : setting
        );
        setBenefitSettings(updatedSettings);
      } else {
        updatedSettings = activitySettings.map((setting) =>
          setting.id === id
            ? { ...setting, enabled: !setting.enabled }
            : setting
        );
        setActivitySettings(updatedSettings);
      }

      // Prepare API payload
      const allSettings = [...benefitSettings, ...activitySettings];
      const updatedSetting = allSettings.find((s) => s.id === id);
      if (!updatedSetting) return;

      const apiPayload = {
        enableInquiryNotif:
          activitySettings.find((s) => s.apiKey === 'enableInquiryNotif')
            ?.enabled ?? false,
        enableExpiringPointsNotif:
          activitySettings.find((s) => s.apiKey === 'enableExpiringPointsNotif')
            ?.enabled ?? false,
        enablePushNotif:
          benefitSettings.find((s) => s.apiKey === 'enablePushNotif')
            ?.enabled ?? false,
        allowSmsReceive:
          benefitSettings.find((s) => s.apiKey === 'allowSmsReceive')
            ?.enabled ?? false,
        allowEmailReceive:
          benefitSettings.find((s) => s.apiKey === 'allowEmailReceive')
            ?.enabled ?? false,
      };

      // Update the specific setting that was toggled
      apiPayload[updatedSetting.apiKey] = !updatedSetting.enabled;

      // Call API to update settings
      const response = await NotificationService.updateSettings(
        memberId,
        apiPayload
      );

      if (response.error) {
        setError(response.error);
        // Revert local state on API error
        if (section === 'benefit') {
          setBenefitSettings(benefitSettings);
        } else {
          setActivitySettings(activitySettings);
        }
        return;
      }

      console.log('Settings updated successfully');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to update settings'
      );
      // Revert local state on error
      if (section === 'benefit') {
        setBenefitSettings(benefitSettings);
      } else {
        setActivitySettings(activitySettings);
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <ProductHeader />
        <div className={styles.content}>
          <div className={styles.loading}>설정을 불러오는 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <ProductHeader />

      {error && (
        <div className={styles.error}>
          {error}
          <button onClick={loadSettings} className={styles.retryButton}>
            다시 시도
          </button>
        </div>
      )}

      <div className={styles.content}>
        {/* Benefit and Event Notifications Section */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>혜택 및 이벤트 알림</h2>
          <p className={styles.sectionDescription}>
            할인, 쿠폰 등의 이벤트 정보를 가장 먼저 알려드려요
          </p>

          <div className={styles.settingsList}>
            {benefitSettings.map((setting) => (
              <div key={setting.id} className={styles.settingItem}>
                <span className={styles.settingLabel}>{setting.label}</span>
                <button
                  className={`${styles.toggle} ${
                    setting.enabled ? styles.toggleOn : styles.toggleOff
                  } ${isSaving ? styles.disabled : ''}`}
                  onClick={() => handleToggle('benefit', setting.id)}
                  disabled={isSaving}
                >
                  <div className={styles.toggleSlider}></div>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Notifications Section */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>활동 알림</h2>
          <p className={styles.sectionDescription}>
            내 활동에 대한 알림을 보내드려요
          </p>

          <div className={styles.settingsList}>
            {activitySettings.map((setting) => (
              <div key={setting.id} className={styles.settingItem}>
                <span className={styles.settingLabel}>{setting.label}</span>
                <button
                  className={`${styles.toggle} ${
                    setting.enabled ? styles.toggleOn : styles.toggleOff
                  } ${isSaving ? styles.disabled : ''}`}
                  onClick={() => handleToggle('activity', setting.id)}
                  disabled={isSaving}
                >
                  <div className={styles.toggleSlider}></div>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
