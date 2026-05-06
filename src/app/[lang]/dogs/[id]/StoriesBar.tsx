'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import styles from './StoriesBar.module.css';

interface Story {
  id: string;
  type: string;
  content: string;
  photo_urls: string[];
  created_at: string;
  curator: { name: string };
}

interface StoriesBarProps {
  stories: Story[];
  dogName: string;
  labels: {
    stories_title: string;
    story_general: string;
    story_medical: string;
    story_walk: string;
    story_adoption: string;
  };
}

const TYPE_COLORS: Record<string, string> = {
  general: '#6C63FF',
  medical: '#ef4444',
  walk: '#22c55e',
  adoption: '#f59e0b',
};

const TYPE_ICONS: Record<string, string> = {
  general: '\u{1F4F7}',
  medical: '\u{1F3E5}',
  walk: '\u{1F43E}',
  adoption: '\u{1F3E0}',
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  const weeks = Math.floor(days / 7);
  return `${weeks}w`;
}

export function StoriesBar({ stories, dogName, labels }: StoriesBarProps) {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const STORY_DURATION = 6000;

  const story = stories[currentIndex];

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const goNext = useCallback(() => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(i => i + 1);
      setProgress(0);
    } else {
      setViewerOpen(false);
      stopTimer();
    }
  }, [currentIndex, stories.length, stopTimer]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(i => i - 1);
      setProgress(0);
    }
  }, [currentIndex]);

  useEffect(() => {
    if (!viewerOpen) return;
    stopTimer();
    setProgress(0);
    const start = Date.now();
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min((elapsed / STORY_DURATION) * 100, 100);
      setProgress(pct);
      if (elapsed >= STORY_DURATION) {
        goNext();
      }
    }, 50);
    return stopTimer;
  }, [viewerOpen, currentIndex, goNext, stopTimer]);

  useEffect(() => {
    if (!viewerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setViewerOpen(false); stopTimer(); }
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [viewerOpen, goNext, goPrev, stopTimer]);

  if (stories.length === 0) return null;

  const openStory = (index: number) => {
    setCurrentIndex(index);
    setProgress(0);
    setViewerOpen(true);
  };

  const typeLabel = (type: string) => {
    const key = `story_${type}` as keyof typeof labels;
    return labels[key] || type;
  };

  return (
    <>
      {/* Stories circles row */}
      <div className={styles.bar}>
        <h3 className={styles.barTitle}>{labels.stories_title}</h3>
        <div className={styles.circles}>
          {stories.map((s, i) => (
            <button
              key={s.id}
              className={styles.circle}
              onClick={() => openStory(i)}
              title={typeLabel(s.type)}
            >
              <div
                className={styles.circleRing}
                style={{ borderColor: TYPE_COLORS[s.type] || TYPE_COLORS.general }}
              >
                {s.photo_urls.length > 0 ? (
                  <img src={s.photo_urls[0]} alt="" className={styles.circleImg} />
                ) : (
                  <span className={styles.circleIcon}>{TYPE_ICONS[s.type] || TYPE_ICONS.general}</span>
                )}
              </div>
              <span className={styles.circleTime}>{timeAgo(s.created_at)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Fullscreen viewer */}
      {viewerOpen && story && (
        <div className={styles.viewer} onClick={(e) => {
          const rect = (e.target as HTMLElement).getBoundingClientRect();
          const x = e.clientX - rect.left;
          if (x < rect.width / 3) goPrev();
          else if (x > rect.width * 2 / 3) goNext();
        }}>
          {/* Progress bars */}
          <div className={styles.progressRow}>
            {stories.map((_, i) => (
              <div key={i} className={styles.progressTrack}>
                <div
                  className={styles.progressFill}
                  style={{
                    width: i < currentIndex ? '100%' : i === currentIndex ? `${progress}%` : '0%',
                  }}
                />
              </div>
            ))}
          </div>

          {/* Header */}
          <div className={styles.viewerHeader}>
            <div className={styles.viewerMeta}>
              <span className={styles.viewerName}>{dogName}</span>
              <span className={styles.viewerTime}>{timeAgo(story.created_at)}</span>
              <span
                className={styles.viewerType}
                style={{ background: TYPE_COLORS[story.type] }}
              >
                {typeLabel(story.type)}
              </span>
            </div>
            <button
              className={styles.viewerClose}
              onClick={(e) => { e.stopPropagation(); setViewerOpen(false); stopTimer(); }}
            >
              &times;
            </button>
          </div>

          {/* Content */}
          <div className={styles.viewerBody} onClick={(e) => e.stopPropagation()}>
            {story.photo_urls.length > 0 && (
              <img src={story.photo_urls[0]} alt="" className={styles.viewerImage} />
            )}
            <div className={styles.viewerText}>
              <p>{story.content}</p>
              <span className={styles.viewerAuthor}>— {story.curator.name}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
