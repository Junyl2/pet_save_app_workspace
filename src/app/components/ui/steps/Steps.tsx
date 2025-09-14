"use client";
import React from "react";
import styles from "./Steps.module.css";

interface Step {
  key: string;
  label: string;
}

interface StepsProps {
  steps: Step[];
  currentStepIndex: number;
  numbered?: boolean; // if true → show 1,2,3 inside dots
}

export default function Steps({
  steps,
  currentStepIndex,
  numbered = false,
}: StepsProps) {
  return (
    <div className={styles.stepsContainer}>
      {/* Progress Line */}
      <div className={styles.progressTrack}>
        <div
          className={styles.progressFill}
          style={{
            width: `${(currentStepIndex / (steps.length - 1)) * 100}%`,
          }}
        />
      </div>

      {/* Steps */}
      <div className={styles.stepsList}>
        {steps.map((step, index) => (
          <div key={step.key} className={styles.stepItem}>
            <div
              className={`${styles.stepDot} ${
                index <= currentStepIndex
                  ? styles.stepDotActive
                  : styles.stepDotInactive
              }`}
            >
              {numbered && (
                <span
                  className={`${styles.stepNumber} ${
                    index <= currentStepIndex ? "" : styles.stepNumberInactive
                  }`}
                >
                  {index + 1}
                </span>
              )}
            </div>
            <span
              className={`${styles.stepLabel} ${
                index <= currentStepIndex
                  ? styles.stepLabelActive
                  : styles.stepLabelInactive
              }`}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
