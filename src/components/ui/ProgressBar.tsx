import React from 'react';
import styles from './ProgressBar.module.css';

interface ProgressBarProps {
  current: number;
  target: number;
}

export function ProgressBar({ current, target }: ProgressBarProps) {
  const percent = target > 0 ? Math.min((current / target) * 100, 100) : 0;

  return (
    <div className={styles.wrapper}>
      <div className={styles.bar}>
        <div className={styles.fill} style={{ width: `${percent}%` }} />
      </div>
      <div className={styles.labels}>
        <span>{current.toLocaleString('ru-RU')} руб.</span>
        <span>из {target.toLocaleString('ru-RU')} руб.</span>
      </div>
    </div>
  );
}
