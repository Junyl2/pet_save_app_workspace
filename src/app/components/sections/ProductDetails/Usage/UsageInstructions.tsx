'use client';

import { useEffect, useState } from 'react';
import { usageInstructionsService } from '@/app/api/services/usage-instructions/usageInstructions';
import { UsageInstruction } from '@/app/api/types/usageInstructions/usageInstructions';
import styles from './UsageInstructions.module.css';

export const UsageInstructions = () => {
  const [instructions, setInstructions] = useState<UsageInstruction[]>([]);

  useEffect(() => {
    usageInstructionsService.getAll().then(setInstructions);
  }, []);

  return (
    <section className={styles.section}>
      {instructions.map((item) => (
        <div key={item.id}>
          <h3>{item.title}</h3>
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
