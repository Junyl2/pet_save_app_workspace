"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaCheck } from "react-icons/fa";
import styles from "./SuccessMessage.module.css";

interface SuccessMessageProps {
  isVisible: boolean;
  message: string;
  actionText?: string;
  actionRoute?: string;
  onAction?: () => void;
  onHide: () => void;
  duration?: number;
  type?: "success" | "warning" | "error" | "info";
}

export function SuccessMessage({
  isVisible,
  message,
  actionText = "이동",
  actionRoute,
  onAction,
  onHide,
  duration = 4000,
  type = "success",
}: SuccessMessageProps) {
  const router = useRouter();
  const [isAnimationVisible, setIsAnimationVisible] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimationVisible(true);

      const hideTimer = setTimeout(() => {
        handleHide();
      }, duration);

      return () => {
        clearTimeout(hideTimer);
      };
    } else {
      setIsAnimationVisible(false);
    }
  }, [isVisible, duration]);

  const handleHide = () => {
    setIsAnimationVisible(false);
    setTimeout(() => {
      onHide();
    }, 300); // Wait for animation to complete
  };

  const handleAction = () => {
    if (onAction) {
      onAction();
    } else if (actionRoute) {
      router.push(actionRoute);
    }
    handleHide();
  };

  if (!isVisible) {
    return null;
  }

  const messageClassNames = [
    styles.successMessage,
    isAnimationVisible ? styles.visible : "",
    styles[type],
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={messageClassNames}>
      <div className={styles.messageContent}>
        <FaCheck className={styles.successIcon} />
        <p className={styles.messageText}>{message}</p>
      </div>
      {actionText && (actionRoute || onAction) && (
        <button className={styles.actionButton} onClick={handleAction}>
          {actionText}
        </button>
      )}
    </div>
  );
}
