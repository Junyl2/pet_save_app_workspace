'use client';

import { useEffect, useState } from 'react';
import { usageInstructionsService } from '@/app/api/services/usage-instructions/usageInstructions';
import { UsageInstruction } from '@/app/api/types/usageInstructions/usageInstructions';
import styles from './UsageInstructions.module.css';

interface UsageInstructionsProps {
  pickupLocation?: string;
  openingHourStart?: string | null;
  openingHourEnd?: string | null;
}

export const UsageInstructions = ({
  pickupLocation,
  openingHourStart,
  openingHourEnd,
}: UsageInstructionsProps) => {
  const [instructions, setInstructions] = useState<UsageInstruction[]>([]);

  useEffect(() => {
    usageInstructionsService
      .getAll({
        pickupLocation,
        openingHourStart,
        openingHourEnd,
      })
      .then(setInstructions);
  }, [pickupLocation, openingHourStart, openingHourEnd]);

  return (
    <section className={styles.section}>
      {instructions.map((item, index) => (
        <div key={item.id}>
          {index === 0 ? <h3>{item.title}</h3> : <h4>{item.title}</h4>}
          {item.description && <p>{item.description}</p>}
          {item.listItems && (
            <ul>
              {item.listItems.map((li, idx) => (
                <li key={idx}>{li}</li>
              ))}
            </ul>
          )}
          {item.notes && (
            <div className={styles.noBulletWrapper}>
              {item.notes.map((note, idx) => (
                <li key={idx} className={styles.noBullet}>
                  {note}
                </li>
              ))}
            </div>
          )}
        </div>
      ))}
    </section>
  );
};
