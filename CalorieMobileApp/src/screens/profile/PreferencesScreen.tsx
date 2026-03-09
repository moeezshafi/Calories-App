import React, { useState, useEffect } from 'react';
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
import Toggle from '../../components/common/Toggle';
import { useAppStore } from '../../store/appStore';
import * as preferencesService from '../../services/preferences';

type ThemeMode = 'system' | 'light' | 'dark';

interface ToggleItemProps {
  label: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  last?: boolean;
}

function ToggleItem({ label, description, value, onValueChange, last = false }: ToggleItemProps) {
  return (
    <View style={[styles.toggleItem, !last && styles.toggleItemBorder]}>
      <View style={styles.toggleText}>
        <Text style={styles.toggleLabel}>{label}</Text>
        <Text style={styles.toggleDesc}>{description}</Text>
      </View>
      <Toggle value={value} onValueChange={onValueChange} />
    </View>
  );
}

export default function PreferencesScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const { theme, setTheme } = useAppStore();

  const [badgeCelebrations, setBadgeCelebrations] = useState(true);
  const [liveActivity, setLiveActivity] = useState(false);
  const [addBurnedCalories, setAddBurnedCalories] = useState(false);
  const [rolloverCalories, setRolloverCalories] = useState(false);
  const [autoAdjustMacros, setAutoAdjustMacros] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const prefs = await preferencesService.getPreferences();
      const data = prefs?.data || prefs;
      if (data) {
        if (data.theme) setTheme(data.theme);
        if (data.badge_celebrations !== undefined) setBadgeCelebrations(data.badge_celebrations);
        if (data.live_activity !== undefined) setLiveActivity(data.live_activity);
        if (data.add_burned_calories !== undefined) setAddBurnedCalories(data.add_burned_calories);
        if (data.rollover_calories !== undefined) setRolloverCalories(data.rollover_calories);
        if (data.auto_adjust_macros !== undefined) setAutoAdjustMacros(data.auto_adjust_macros);
      }
    } catch (e: any) {
      console.log('Failed to load preferences:', e?.userMessage || e?.message);
    }
  };

  const savePreference = async (key: string, value: any) => {
    try {
      await preferencesService.updatePreferences({ [key]: value });
    } catch (e: any) {
      Alert.alert(
        t('common.error', { defaultValue: 'Error' }),
        e?.userMessage || t('preferences.saveFailed', { defaultValue: 'Failed to save preference. Please try again.' }),
      );
    }
  };

  const handleThemeChange = (newTheme: ThemeMode) => {
    setTheme(newTheme);
    savePreference('theme', newTheme);
  };

  const handleToggle = (
    key: string,
    setter: React.Dispatch<React.SetStateAction<boolean>>,
    value: boolean,
  ) => {
    setter(value);
    savePreference(key, value);
  };

  const themes: { key: ThemeMode; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: 'system', label: t('preferences.system', { defaultValue: 'System' }), icon: 'phone-portrait-outline' },
    { key: 'light', label: t('preferences.light', { defaultValue: 'Light' }), icon: 'sunny-outline' },
    { key: 'dark', label: t('preferences.dark', { defaultValue: 'Dark' }), icon: 'moon-outline' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {t('profile.preferences', { defaultValue: 'Preferences' })}
        </Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Appearance Section */}
        <Text style={styles.sectionTitle}>
          {t('preferences.appearance', { defaultValue: 'Appearance' })}
        </Text>
        <Text style={styles.sectionDescription}>
          {t('preferences.appearanceDesc', { defaultValue: 'Choose light, dark, or system appearance' })}
        </Text>

        <View style={styles.themeRow}>
          {themes.map((item) => {
            const isSelected = theme === item.key;
            return (
              <TouchableOpacity
                key={item.key}
                style={[
                  styles.themeCard,
                  isSelected && styles.themeCardSelected,
                ]}
                onPress={() => handleThemeChange(item.key)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.themePreview,
                    item.key === 'dark' && styles.themePreviewDark,
                    item.key === 'system' && styles.themePreviewSystem,
                  ]}
                >
                  <View style={styles.previewStatusBar}>
                    <View style={[styles.previewDot, item.key === 'dark' && styles.previewDotDark]} />
                    <View style={[styles.previewDot, item.key === 'dark' && styles.previewDotDark]} />
                  </View>
                  <View style={styles.previewContent}>
                    <View style={[styles.previewLine, item.key === 'dark' && styles.previewLineDark]} />
                    <View style={[styles.previewLineShort, item.key === 'dark' && styles.previewLineDark]} />
                    <View style={[styles.previewCard, item.key === 'dark' && styles.previewCardDark]} />
                  </View>
                </View>
                <View style={styles.themeInfo}>
                  <Ionicons
                    name={item.icon}
                    size={16}
                    color={isSelected ? colors.textPrimary : colors.textTertiary}
                  />
                  <Text
                    style={[
                      styles.themeLabel,
                      isSelected && styles.themeLabelSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Toggle Items */}
        <View style={styles.toggleCard}>
          <ToggleItem
            label={t('preferences.badgeCelebrations', { defaultValue: 'Badge celebrations' })}
            description={t('preferences.badgeCelebrationsDesc', { defaultValue: 'Show animations when you earn badges' })}
            value={badgeCelebrations}
            onValueChange={(v) => handleToggle('badge_celebrations', setBadgeCelebrations, v)}
          />
          <ToggleItem
            label={t('preferences.liveActivity', { defaultValue: 'Live activity' })}
            description={t('preferences.liveActivityDesc', { defaultValue: 'Show calorie tracking on lock screen' })}
            value={liveActivity}
            onValueChange={(v) => handleToggle('live_activity', setLiveActivity, v)}
          />
          <ToggleItem
            label={t('preferences.addBurnedCalories', { defaultValue: 'Add burned calories' })}
            description={t('preferences.addBurnedCaloriesDesc', { defaultValue: 'Include exercise calories in daily goal' })}
            value={addBurnedCalories}
            onValueChange={(v) => handleToggle('add_burned_calories', setAddBurnedCalories, v)}
          />
          <ToggleItem
            label={t('preferences.rolloverCalories', { defaultValue: 'Rollover calories' })}
            description={t('preferences.rolloverCaloriesDesc', { defaultValue: 'Carry unused calories to the next day' })}
            value={rolloverCalories}
            onValueChange={(v) => handleToggle('rollover_calories', setRolloverCalories, v)}
          />
          <ToggleItem
            label={t('preferences.autoAdjustMacros', { defaultValue: 'Auto adjust macros' })}
            description={t('preferences.autoAdjustMacrosDesc', { defaultValue: 'Automatically adjust macro targets based on goals' })}
            value={autoAdjustMacros}
            onValueChange={(v) => handleToggle('auto_adjust_macros', setAutoAdjustMacros, v)}
            last
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    paddingHorizontal: spacing.base,
    backgroundColor: colors.surface,
  },
  backButton: {
    padding: spacing.xs,
    marginLeft: -spacing.xs,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  headerRight: {
    width: 40,
  },
  scrollContent: {
    padding: spacing.base,
    paddingBottom: spacing['4xl'],
  },
  // Appearance Section
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  sectionDescription: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  themeRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  themeCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.surfaceBorder,
    overflow: 'hidden',
  },
  themeCardSelected: {
    borderColor: colors.primary,
  },
  themePreview: {
    backgroundColor: '#FFF8F0',
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    height: 100,
  },
  themePreviewDark: {
    backgroundColor: '#1C1917',
  },
  themePreviewSystem: {
    backgroundColor: '#FFF8F0',
    borderRightWidth: 0,
  },
  previewStatusBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 3,
    marginBottom: spacing.sm,
  },
  previewDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D6D3D1',
  },
  previewDotDark: {
    backgroundColor: '#57534E',
  },
  previewContent: {
    flex: 1,
    justifyContent: 'center',
  },
  previewLine: {
    height: 4,
    backgroundColor: '#D6D3D1',
    borderRadius: 2,
    marginBottom: 4,
    width: '80%',
  },
  previewLineShort: {
    height: 4,
    backgroundColor: '#E8E0D8',
    borderRadius: 2,
    marginBottom: 6,
    width: '50%',
  },
  previewLineDark: {
    backgroundColor: '#57534E',
  },
  previewCard: {
    height: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },
  previewCardDark: {
    backgroundColor: '#292524',
  },
  themeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
  },
  themeLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textTertiary,
  },
  themeLabelSelected: {
    color: colors.textPrimary,
    fontWeight: typography.weights.semibold,
  },
  // Toggle Items
  toggleCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    overflow: 'hidden',
  },
  toggleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.base,
  },
  toggleItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  toggleText: {
    flex: 1,
    marginRight: spacing.base,
  },
  toggleLabel: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  toggleDesc: {
    fontSize: typography.sizes.sm,
    color: colors.textTertiary,
    lineHeight: typography.sizes.sm * typography.lineHeights.relaxed,
  },
});
