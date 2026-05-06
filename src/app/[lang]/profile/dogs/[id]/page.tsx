'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useDictionary } from '@/contexts/DictionaryContext';
import { Button } from '@/components/ui/Button';
import { ResponsiveModal } from '@/components/ui/ResponsiveModal';
import { GoalForm } from './GoalForm';
import { StoryForm } from './StoryForm';
import styles from './DogManage.module.css';

interface Goal {
  id: string;
  category: string;
  title: string;
  description: string | null;
  amount_target: number;
  amount_collected: number;
  is_recurring: boolean;
  status: string;
  created_at: string;
}

interface Story {
  id: string;
  type: string;
  content: string;
  photo_urls: string[];
  created_at: string;
  curator: { name: string };
}

interface DogInfo {
  id: string;
  name: string;
  cover_photo_url: string | null;
}

function formatMoney(amount: number): string {
  return (amount / 100).toLocaleString('ru-RU');
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `${days}d`;
}

const CATEGORY_ICONS: Record<string, string> = {
  medical: '\u{1F3E5}',
  food: '\u{1F96B}',
  shelter: '\u{1F3E0}',
  sterilization: '\u{2702}\u{FE0F}',
  custom: '\u{1F4E6}',
};

const TYPE_COLORS: Record<string, string> = {
  general: '#6C63FF',
  medical: '#ef4444',
  walk: '#22c55e',
  adoption: '#f7931a',
};

export default function DogManagePage() {
  const params = useParams();
  const dogId = params.id as string;
  const lang = params.lang as string;
  const { dict } = useDictionary();
  const t = dict.dogManage || {};

  const [dog, setDog] = useState<DogInfo | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [goalsRes, storiesRes] = await Promise.all([
        api.get(`/goals/dog/${dogId}`),
        api.get(`/reports/dog/${dogId}`),
      ]);
      const goalsData = goalsRes.data?.data || goalsRes.data || [];
      const storiesData = storiesRes.data?.data || storiesRes.data || [];
      setGoals(Array.isArray(goalsData) ? goalsData : []);
      setStories(Array.isArray(storiesData) ? storiesData : []);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  }, [dogId]);

  useEffect(() => {
    // Get dog info from curator profile
    api.get('/curators/profile').then((res) => {
      const profile = res.data?.data || res.data;
      const dogs = profile?.dogs || [];
      const found = dogs.find((d: DogInfo) => d.id === dogId);
      if (found) setDog(found);
    });
    fetchData();
  }, [dogId, fetchData]);

  const handleGoalStatusChange = async (goalId: string, status: string) => {
    try {
      await api.put(`/goals/${goalId}/status`, { status });
      fetchData();
    } catch {
      alert('Failed to update goal status');
    }
  };

  if (loading) {
    return <div className={styles.container}><div className={styles.loading}>Loading...</div></div>;
  }

  return (
    <div className={styles.container}>
      <Link href={`/${lang}/profile`} className={styles.back}>
        ← {dict.profile?.title || 'Profile'}
      </Link>

      {dog && (
        <div className={styles.dogHeader}>
          {dog.cover_photo_url && (
            <img src={dog.cover_photo_url} alt={dog.name} className={styles.dogAvatar} />
          )}
          <h1 className={styles.dogName}>{dog.name}</h1>
        </div>
      )}

      {/* Goals Section */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{t.goals_title || 'Goals'}</h2>
          <Button onClick={() => { setEditingGoal(null); setGoalModalOpen(true); }}>
            {t.add_goal || '+ Goal'}
          </Button>
        </div>

        {goals.length === 0 ? (
          <div className={styles.empty}>{t.no_goals || 'No goals yet. Add one to start fundraising.'}</div>
        ) : (
          <div className={styles.goalsList}>
            {goals.map((goal) => (
              <div key={goal.id} className={`${styles.goalCard} ${goal.status !== 'active' ? styles.goalInactive : ''}`}>
                <div className={styles.goalTop}>
                  <span className={styles.goalIcon}>{CATEGORY_ICONS[goal.category] || CATEGORY_ICONS.custom}</span>
                  <span className={styles.goalCategory}>{goal.category}</span>
                  {goal.is_recurring && <span className={styles.goalBadge}>recurring</span>}
                  <span className={`${styles.goalStatus} ${styles[`status_${goal.status}`]}`}>{goal.status}</span>
                </div>
                <h3 className={styles.goalTitle}>{goal.title}</h3>
                {goal.description && <p className={styles.goalDesc}>{goal.description}</p>}
                <div className={styles.goalProgress}>
                  <div className={styles.goalBar}>
                    <div
                      className={styles.goalFill}
                      style={{ width: `${Math.min((goal.amount_collected / goal.amount_target) * 100, 100)}%` }}
                    />
                  </div>
                  <span className={styles.goalAmount}>
                    {formatMoney(goal.amount_collected)} / {formatMoney(goal.amount_target)}
                  </span>
                </div>
                <div className={styles.goalActions}>
                  {goal.status === 'active' && (
                    <>
                      <button className={styles.actionBtn} onClick={() => handleGoalStatusChange(goal.id, 'completed')}>
                        ✓ {t.complete || 'Complete'}
                      </button>
                      <button className={styles.actionBtnDanger} onClick={() => handleGoalStatusChange(goal.id, 'cancelled')}>
                        ✕ {t.cancel_goal || 'Cancel'}
                      </button>
                    </>
                  )}
                  {goal.status !== 'active' && (
                    <button className={styles.actionBtn} onClick={() => handleGoalStatusChange(goal.id, 'active')}>
                      ↻ {t.reactivate || 'Reactivate'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Stories Section */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{t.stories_title || 'Stories'}</h2>
        </div>

        <div className={styles.storyFormInline}>
          <StoryForm dogId={dogId} onSuccess={fetchData} />
        </div>

        {stories.length > 0 && (
          <div className={styles.storiesList}>
            {stories.map((story) => (
              <div key={story.id} className={styles.storyCard}>
                <div className={styles.storyTop}>
                  <span
                    className={styles.storyType}
                    style={{ background: TYPE_COLORS[story.type] || TYPE_COLORS.general }}
                  >
                    {story.type}
                  </span>
                  <span className={styles.storyTime}>{timeAgo(story.created_at)}</span>
                </div>
                {story.photo_urls.length > 0 && (
                  <img src={story.photo_urls[0]} alt="" className={styles.storyImage} />
                )}
                <p className={styles.storyContent}>{story.content}</p>
                <span className={styles.storyAuthor}>— {story.curator.name}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Goal Modal */}
      <ResponsiveModal
        isOpen={goalModalOpen}
        onClose={() => setGoalModalOpen(false)}
        title={editingGoal ? (t.edit_goal || 'Edit Goal') : (t.add_goal_title || 'Add Goal')}
      >
        <GoalForm
          dogId={dogId}
          onSuccess={() => { setGoalModalOpen(false); fetchData(); }}
          onCancel={() => setGoalModalOpen(false)}
        />
      </ResponsiveModal>
    </div>
  );
}
