import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { useAuthStore } from '../../store/authStore';
import { useAppStore } from '../../store/appStore';
import { changeLanguage } from '../../i18n';
import Card from '../../components/common/Card';
import Constants from 'expo-constants';

interface MenuItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  rightContent?: React.ReactNode;
  showChevron?: boolean;
}

function MenuItem({ icon, label, onPress, rightContent, showChevron = true }: MenuItemProps) {
  return (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.menuIconWrapper}>
        <Ionicons name={icon} size={20} color={colors.textPrimary} />
      </View>
      <Text style={styles.menuLabel}>{label}</Text>
      <View style={styles.menuRight}>
        {rightContent}
        {showChevron && (
          <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
        )}
      </View>
    </TouchableOpacity>
  );
}

function formatActivityLevel(level?: string): string {
  if (!level) return '--';
  return level
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function formatCalories(value?: number): string {
  if (value == null) return '--';
  return value.toLocaleString() + ' cal';
}

function formatWeight(value?: number): string {
  if (value == null) return '--';
  return value + ' kg';
}

interface StatItemProps {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
}

function StatItem({ label, value, icon, iconColor }: StatItemProps) {
  return (
    <View style={styles.statItem}>
      <View style={[styles.statIconWrapper, { backgroundColor: iconColor + '15' }]}>
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const { user, logout } = useAuthStore();
  const { language, setLanguage } = useAppStore();

  const userInitials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  const handleLanguageToggle = async () => {
    const newLang = language === 'en' ? 'ar' : 'en';
    setLanguage(newLang);
    await changeLanguage(newLang);
  };

  const handleSignOut = () => {
    Alert.alert(
      t('profile.signOut', { defaultValue: 'Sign Out' }),
      t('profile.signOutConfirm', { defaultValue: 'Are you sure you want to sign out?' }),
      [
        { text: t('common.cancel', { defaultValue: 'Cancel' }), style: 'cancel' },
        {
          text: t('profile.signOut', { defaultValue: 'Sign Out' }),
          style: 'destructive',
          onPress: () => logout(),
        },
      ],
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      t('profile.deleteAccount', { defaultValue: 'Delete Account' }),
      t('profile.deleteAccountWarn', { defaultValue: 'This action is permanent and cannot be undone. All your data will be lost.' }),
      [
        { text: t('common.cancel', { defaultValue: 'Cancel' }), style: 'cancel' },
        {
          text: t('profile.deleteConfirm', { defaultValue: 'Delete' }),
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              t('profile.deleteAccountFinal', { defaultValue: 'Are you absolutely sure?' }),
              t('profile.deleteAccountFinalDesc', { defaultValue: 'This will permanently delete your account and all associated data.' }),
              [
                { text: t('common.cancel', { defaultValue: 'Cancel' }), style: 'cancel' },
                {
                  text: t('profile.deleteForever', { defaultValue: 'Delete Forever' }),
                  style: 'destructive',
                  onPress: () => logout(),
                },
              ],
            );
          },
        },
      ],
    );
  };

  const appVersion = Constants.expoConfig?.version || '1.0.0';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar + User Info */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{userInitials}</Text>
          </View>
          <Text style={styles.userName}>{user?.name || 'User'}</Text>
          <Text style={styles.userEmail}>{user?.email || ''}</Text>
        </View>

        {/* Stats Card */}
        <Card style={styles.statsCard}>
          <View style={styles.statsGrid}>
            <StatItem
              label={t('profile.dailyGoal', { defaultValue: 'Daily Goal' })}
              value={formatCalories(user?.daily_calorie_goal)}
              icon="flame-outline"
              iconColor={colors.warning}
            />
            <StatItem
              label={t('profile.currentWeight', { defaultValue: 'Current Weight' })}
              value={formatWeight(user?.weight)}
              icon="scale-outline"
              iconColor={colors.info}
            />
            <StatItem
              label={t('profile.goalWeight', { defaultValue: 'Goal Weight' })}
              value={formatWeight(user?.target_weight)}
              icon="flag-outline"
              iconColor={colors.success}
            />
            <StatItem
              label={t('profile.activityLevel', { defaultValue: 'Activity Level' })}
              value={formatActivityLevel(user?.activity_level)}
              icon="walk-outline"
              iconColor={colors.primary}
            />
          </View>
        </Card>

        {/* Menu Items */}
        <View style={styles.menuCard}>
          <MenuItem
            icon="person-outline"
            label={t('profile.personalDetails', { defaultValue: 'Personal Details' })}
            onPress={() => navigation.navigate('PersonalDetails')}
          />
          <View style={styles.menuDivider} />
          {/* Daily Nutrition - navigates to PersonalDetails for now (future: dedicated DailyNutrition screen) */}
          <MenuItem
            icon="nutrition-outline"
            label={t('profile.dailyNutrition', { defaultValue: 'Daily Nutrition' })}
            onPress={() => navigation.navigate('PersonalDetails')}
          />
          <View style={styles.menuDivider} />
          <MenuItem
            icon="options-outline"
            label={t('profile.preferences', { defaultValue: 'Preferences' })}
            onPress={() => navigation.navigate('Preferences')}
          />
          <View style={styles.menuDivider} />
          <MenuItem
            icon="notifications-outline"
            label={t('profile.trackingReminders', { defaultValue: 'Tracking Reminders' })}
            onPress={() => navigation.navigate('TrackingReminders')}
          />
          <View style={styles.menuDivider} />
          <MenuItem
            icon="language-outline"
            label={t('profile.language', { defaultValue: 'Language' })}
            onPress={handleLanguageToggle}
            showChevron={false}
            rightContent={
              <View style={styles.langToggle}>
                <TouchableOpacity
                  style={[
                    styles.langOption,
                    language === 'en' && styles.langOptionActive,
                  ]}
                  onPress={() => {
                    setLanguage('en');
                    changeLanguage('en');
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.langText,
                      language === 'en' && styles.langTextActive,
                    ]}
                  >
                    EN
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.langOption,
                    language === 'ar' && styles.langOptionActive,
                  ]}
                  onPress={() => {
                    setLanguage('ar');
                    changeLanguage('ar');
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.langText,
                      language === 'ar' && styles.langTextActive,
                    ]}
                  >
                    AR
                  </Text>
                </TouchableOpacity>
              </View>
            }
          />
          <View style={styles.menuDivider} />
          <MenuItem
            icon="trophy-outline"
            label="Badges & Achievements"
            onPress={() => navigation.navigate('Badges')}
          />
          <View style={styles.menuDivider} />
          <MenuItem
            icon="calendar-outline"
            label="Meal Planning"
            onPress={() => navigation.navigate('MealPlan')}
          />
          <View style={styles.menuDivider} />
          <MenuItem
            icon="book-outline"
            label="Recipe Builder"
            onPress={() => navigation.navigate('RecipeBuilder')}
          />
          <View style={styles.menuDivider} />
          <MenuItem
            icon="barbell-outline"
            label="Exercise Log"
            onPress={() => navigation.navigate('Exercise')}
          />
          <View style={styles.menuDivider} />
          <MenuItem
            icon="analytics-outline"
            label="Nutrition Insights"
            onPress={() => navigation.navigate('NutrientInsights')}
          />
        </View>

        {/* Divider */}
        <View style={styles.sectionDivider} />

        {/* Sign Out */}
        <TouchableOpacity
          style={styles.dangerItem}
          onPress={handleSignOut}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={20} color={colors.error} />
          <Text style={styles.dangerText}>
            {t('profile.signOut', { defaultValue: 'Sign Out' })}
          </Text>
        </TouchableOpacity>

        {/* Delete Account */}
        <TouchableOpacity
          style={styles.deleteItem}
          onPress={handleDeleteAccount}
          activeOpacity={0.7}
        >
          <Text style={styles.deleteText}>
            {t('profile.deleteAccount', { defaultValue: 'Delete Account' })}
          </Text>
        </TouchableOpacity>

        {/* App Version */}
        <Text style={styles.versionText}>
          {t('profile.version', { defaultValue: 'Version' })} {appVersion}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: spacing['4xl'],
  },
  // Avatar Section
  avatarSection: {
    alignItems: 'center',
    paddingTop: spacing['2xl'],
    paddingBottom: spacing.xl,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  avatarText: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.textWhite,
  },
  userName: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  userEmail: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
  },
  // Stats Card
  statsCard: {
    marginHorizontal: spacing.base,
    marginBottom: spacing.base,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  statIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  statValue: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.regular,
    color: colors.textSecondary,
  },
  // Menu Card
  menuCard: {
    marginHorizontal: spacing.base,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.base,
  },
  menuIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  menuLabel: {
    flex: 1,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  menuDivider: {
    height: 1,
    backgroundColor: colors.divider,
    marginLeft: spacing.base + 36 + spacing.md,
  },
  // Language Toggle
  langToggle: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: borderRadius.full,
    padding: 2,
  },
  langOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  langOptionActive: {
    backgroundColor: colors.primary,
  },
  langText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
  },
  langTextActive: {
    color: colors.textWhite,
  },
  // Divider
  sectionDivider: {
    height: 1,
    backgroundColor: colors.divider,
    marginHorizontal: spacing.base,
    marginVertical: spacing.lg,
  },
  // Danger Items
  dangerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.base,
    marginHorizontal: spacing.base,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  dangerText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.error,
    marginLeft: spacing.md,
  },
  deleteItem: {
    alignItems: 'center',
    paddingVertical: spacing.base,
    marginTop: spacing.md,
  },
  deleteText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.error,
    opacity: 0.7,
  },
  // Version
  versionText: {
    textAlign: 'center',
    fontSize: typography.sizes.xs,
    color: colors.textTertiary,
    marginTop: spacing.xl,
  },
});
