import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, RefreshControl,
  Dimensions, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import Card from '../../components/common/Card';
import api from '../../services/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_GAP = spacing.sm;
const CARD_WIDTH = (SCREEN_WIDTH - spacing.base * 2 - CARD_GAP) / 2;

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  earned_at?: string;
}

const BADGE_DEFINITIONS: { id: string; name: string; description: string; icon: string }[] = [
  { id: 'first_log', name: 'First Bite', description: 'Log your first food', icon: '\uD83C\uDF7D\uFE0F' },
  { id: 'streak_7', name: 'Week Warrior', description: '7-day logging streak', icon: '\uD83D\uDD25' },
  { id: 'streak_30', name: 'Monthly Master', description: '30-day logging streak', icon: '\u2B50' },
  { id: 'water_warrior', name: 'Water Warrior', description: 'Log water 7 days straight', icon: '\uD83D\uDCA7' },
  { id: 'century', name: 'Century Club', description: 'Log 100 food items', icon: '\uD83D\uDCAF' },
  { id: 'photo_first', name: 'Selfie Star', description: 'Upload first progress photo', icon: '\uD83D\uDCF8' },
  { id: 'weight_tracker', name: 'Scale Champion', description: 'Log weight 5 times', icon: '\u2696\uFE0F' },
  { id: 'macro_master', name: 'Macro Master', description: 'Hit protein goal 7 days', icon: '\uD83D\uDCAA' },
];

export default function BadgesScreen() {
  const { t } = useTranslation();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [earnedIds, setEarnedIds] = useState<Set<string>>(new Set());

  const fetchBadges = useCallback(async () => {
    try {
      const [badgesRes] = await Promise.allSettled([
        api.get('/api/badges/'),
        api.get('/api/badges/check'),
      ]);

      if (badgesRes.status === 'fulfilled') {
        const badges: Badge[] = badgesRes.value?.data?.data?.badges
          || badgesRes.value?.data?.badges
          || badgesRes.value?.data
          || [];
        const earned = new Set<string>(
          badges.filter((b) => b.earned).map((b) => b.id),
        );
        setEarnedIds(earned);
      }
    } catch (e) {
      console.log('Badges fetch error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBadges(); }, [fetchBadges]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBadges();
    setRefreshing(false);
  };

  const earnedCount = earnedIds.size;
  const totalCount = BADGE_DEFINITIONS.length;

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <Text style={styles.title}>
          {t('badges.title', { defaultValue: 'Badges' })}
        </Text>

        {/* Earned Count */}
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryIcon}>{'\uD83C\uDFC6'}</Text>
          <Text style={styles.summaryText}>
            {earnedCount} / {totalCount} {t('badges.badgesEarned', { defaultValue: 'Badges Earned' })}
          </Text>
          <View style={styles.summaryBar}>
            <View
              style={[
                styles.summaryBarFill,
                { width: `${totalCount > 0 ? (earnedCount / totalCount) * 100 : 0}%` },
              ]}
            />
          </View>
        </Card>

        {/* Badge Grid */}
        <View style={styles.grid}>
          {BADGE_DEFINITIONS.map((badge) => {
            const earned = earnedIds.has(badge.id);
            return (
              <Card
                key={badge.id}
                style={[styles.badgeCard, !earned && styles.badgeCardLocked]}
              >
                <Text style={[styles.badgeIcon, !earned && styles.badgeIconLocked]}>
                  {badge.icon}
                </Text>
                <Text
                  style={[styles.badgeName, !earned && styles.badgeTextLocked]}
                  numberOfLines={1}
                >
                  {t(`badges.${badge.id}.name`, { defaultValue: badge.name })}
                </Text>
                <Text
                  style={[styles.badgeDescription, !earned && styles.badgeTextLocked]}
                  numberOfLines={2}
                >
                  {t(`badges.${badge.id}.description`, { defaultValue: badge.description })}
                </Text>
                <View style={[styles.statusPill, earned ? styles.statusEarned : styles.statusLocked]}>
                  <Text style={[styles.statusText, earned ? styles.statusTextEarned : styles.statusTextLocked]}>
                    {earned
                      ? t('badges.earned', { defaultValue: 'Earned' })
                      : t('badges.locked', { defaultValue: 'Locked' })}
                  </Text>
                </View>
              </Card>
            );
          })}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: typography.sizes['3xl'],
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.base,
    paddingBottom: spacing.md,
  },

  // ---- Summary Card ----
  summaryCard: {
    marginHorizontal: spacing.base,
    alignItems: 'center',
    paddingVertical: spacing.lg,
    ...shadows.base,
  },
  summaryIcon: {
    fontSize: 40,
    marginBottom: spacing.sm,
  },
  summaryText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  summaryBar: {
    width: '80%',
    height: 6,
    backgroundColor: colors.surfaceBorder,
    borderRadius: 3,
  },
  summaryBarFill: {
    height: 6,
    backgroundColor: colors.primary,
    borderRadius: 3,
  },

  // ---- Badge Grid ----
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.base,
    marginTop: spacing.md,
    gap: CARD_GAP,
  },
  badgeCard: {
    width: CARD_WIDTH,
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.sm,
    ...shadows.base,
  },
  badgeCardLocked: {
    opacity: 0.5,
  },
  badgeIcon: {
    fontSize: 40,
    marginBottom: spacing.sm,
  },
  badgeIconLocked: {
    opacity: 0.4,
  },
  badgeName: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  badgeDescription: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.sizes.sm * typography.lineHeights.relaxed,
    marginBottom: spacing.md,
  },
  badgeTextLocked: {
    color: colors.textTertiary,
  },

  // ---- Status Pill ----
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  statusEarned: {
    backgroundColor: colors.success + '20',
  },
  statusLocked: {
    backgroundColor: colors.surfaceBorder,
  },
  statusText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
  },
  statusTextEarned: {
    color: colors.success,
  },
  statusTextLocked: {
    color: colors.textTertiary,
  },
});
