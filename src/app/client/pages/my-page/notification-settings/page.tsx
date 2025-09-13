'use client';
import { useState } from 'react';
import { ProductHeader } from '@/app/components/sections/ProductDetails/Header/ProductHeader';
import styles from './NotificationSettings.module.css';

interface NotificationSetting {
  id: string;
  label: string;
  enabled: boolean;
}

export default function NotificationSettingsPage() {
  const [benefitSettings, setBenefitSettings] = useState<NotificationSetting[]>([
    { id: 'email', label: '메일 수신 동의', enabled: false },
    { id: 'sms', label: 'SMS 수신 동의', enabled: false },
    { id: 'push', label: '푸시 알림 동의', enabled: true }
  ]);

  const [activitySettings, setActivitySettings] = useState<NotificationSetting[]>([
    { id: 'points', label: '포인트 적립 및 소멸', enabled: false },
    { id: 'inquiry', label: '문의 답변 알림', enabled: false }
  ]);

  const handleToggle = (section: 'benefit' | 'activity', id: string) => {
    if (section === 'benefit') {
      setBenefitSettings(prev => 
        prev.map(setting => 
          setting.id === id 
            ? { ...setting, enabled: !setting.enabled }
            : setting
        )
      );
    } else {
      setActivitySettings(prev => 
        prev.map(setting => 
          setting.id === id 
            ? { ...setting, enabled: !setting.enabled }
            : setting
        )
      );
    }
  };

  return (
    <div className={styles.container}>
      <ProductHeader />
      
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
                  className={`${styles.toggle} ${setting.enabled ? styles.toggleOn : styles.toggleOff}`}
                  onClick={() => handleToggle('benefit', setting.id)}
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
                  className={`${styles.toggle} ${setting.enabled ? styles.toggleOn : styles.toggleOff}`}
                  onClick={() => handleToggle('activity', setting.id)}
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
