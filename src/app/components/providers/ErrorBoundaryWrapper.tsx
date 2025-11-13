'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import styles from './ErrorBoundaryWrapper.module.css';

interface ErrorBoundaryWrapperProps {
  children: ReactNode;
}

interface ErrorBoundaryWrapperState {
  hasError: boolean;
  errorMessage?: string;
}

export class ErrorBoundaryWrapper extends Component<
  ErrorBoundaryWrapperProps,
  ErrorBoundaryWrapperState
> {
  constructor(props: ErrorBoundaryWrapperProps) {
    super(props);
    this.state = { hasError: false, errorMessage: undefined };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryWrapperState {
    return { hasError: true, errorMessage: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Caught by ErrorBoundaryWrapper:', error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    const { hasError } = this.state;

    if (hasError) {
      return (
        <div className={styles.container}>
          <div className={styles.card}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 64 64"
              width="80"
              height="80"
            >
              <circle cx="32" cy="32" r="30" fill="#E8F8F4" />
              <path
                d="M32 18a14 14 0 1 1-14 14 14.016 14.016 0 0 1 14-14zm0 4a10 10 0 1 0 10 10 10.012 10.012 0 0 0-10-10z"
                fill="#66BFA7"
              />
              <rect x="30" y="24" width="4" height="10" fill="#333" rx="2" />
              <circle cx="32" cy="40" r="2" fill="#333" />
            </svg>

            <h2 className={styles.title}>예기치 않은 오류가 발생했습니다</h2>
            <p className={styles.message}>페이지를 새로고침 해주세요.</p>
            <button onClick={this.handleReload} className={styles.reloadButton}>
              새로고침
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
