import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { useAuthStore } from '../../store/authStore';
import * as authService from '../../services/auth';
import * as preferencesService from '../../services/preferences';
import { DEFAULT_STEP_GOAL } from '../../config/constants';

interface InfoRowProps {
  label: string;
  value: string;
  isEditing: boolean;
  onEdit: () => void;
  onChangeText: (text: string) => void;
  editValue: string;
  keyboardType?: 'default' | 'numeric';
  last?: boolean;
}

function InfoRow({
  label,
  value,
  isEditing,
  onEdit,
  onChangeText,
  editValue,
  keyboardType = 'default',
  last = false,
}: InfoRowProps) {
  return (
    <View style={[styles.infoRow, !last && styles.infoRowBorder]}>
      <Text style={styles.infoLabel}>{label}</Text>
      {isEditing ? (
        <TextInput
          style={styles.infoInput}
          value={editValue}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          autoFocus
          selectTextOnFocus
        />
      ) : (
        <Text style={styles.infoValue}>{value}</Text>
      )}
      <TouchableOpacity onPress={onEdit} style={styles.editButton} activeOpacity={0.7}>
        <Ionicons
          name={isEditing ? 'checkmark' : 'pencil-outline'}
          size={18}
          color={isEditing ? colors.success : colors.textTertiary}
        />
      </TouchableOpacity>
    </View>
  );
}

export default function PersonalDetailsScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const { user, updateUser } = useAuthStore();

  const [goalWeight, setGoalWeight] = useState('65');
  const [currentWeight, setCurrentWeight] = useState(String(user?.weight || 73));
  const [height, setHeight] = useState(String(user?.height || 168));
  const [dateOfBirth, setDateOfBirth] = useState('27/12/1999');
  const [gender, setGender] = useState(user?.gender || 'Male');
  const [dailyStepGoal, setDailyStepGoal] = useState(String(DEFAULT_STEP_GOAL));

  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState('');

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const prefs = await preferencesService.getPreferences();
      const data = prefs?.data || prefs;
      if (data?.goal_weight_kg) setGoalWeight(String(data.goal_weight_kg));
      if (data?.daily_step_goal) setDailyStepGoal(String(data.daily_step_goal));
      if (data?.date_of_birth) setDateOfBirth(data.date_of_birth);
    } catch {
      // Use defaults
    }
  };

  const startEditing = (field: string, currentValue: string) => {
    if (editingField === field) {
      // Save
      saveField(field, tempValue);
      setEditingField(null);
    } else {
      setEditingField(field);
      setTempValue(currentValue);
    }
  };

  const saveField = async (field: string, value: string) => {
    try {
      switch (field) {
        case 'weight':
          setCurrentWeight(value);
          await authService.updateProfile({ weight: Number(value) });
          updateUser({ weight: Number(value) });
          break;
        case 'height':
          setHeight(value);
          await authService.updateProfile({ height: Number(value) });
          updateUser({ height: Number(value) });
          break;
        case 'dob':
          setDateOfBirth(value);
          await preferencesService.updatePreferences({ date_of_birth: value });
          break;
        case 'gender':
          setGender(value);
          await authService.updateProfile({ gender: value });
          updateUser({ gender: value });
          break;
        case 'steps':
          setDailyStepGoal(value);
          await preferencesService.updatePreferences({ daily_step_goal: Number(value) });
          break;
        case 'goalWeight':
          setGoalWeight(value);
          await preferencesService.updatePreferences({ goal_weight_kg: Number(value) });
          break;
      }
    } catch {
      Alert.alert(
        t('common.error', { defaultValue: 'Error' }),
        t('profile.saveError', { defaultValue: 'Failed to save. Please try again.' }),
      );
    }
  };

  const handleChangeGoal = () => {
    if (editingField === 'goalWeight') {
      saveField('goalWeight', tempValue);
      setEditingField(null);
    } else {
      setEditingField('goalWeight');
      setTempValue(goalWeight);
    }
  };

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
          {t('profile.personalDetails', { defaultValue: 'Personal Details' })}
        </Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Goal Weight Card */}
        <View style={styles.goalCard}>
          <View style={styles.goalLeft}>
            <Text style={styles.goalLabel}>
              {t('profile.goalWeight', { defaultValue: 'Goal Weight' })}
            </Text>
            {editingField === 'goalWeight' ? (
              <View style={styles.goalEditRow}>
                <TextInput
                  style={styles.goalInput}
                  value={tempValue}
                  onChangeText={setTempValue}
                  keyboardType="numeric"
                  autoFocus
                />
                <Text style={styles.goalUnit}>kg</Text>
              </View>
            ) : (
              <Text style={styles.goalValue}>{goalWeight} kg</Text>
            )}
          </View>
          <TouchableOpacity
            style={styles.changeGoalButton}
            onPress={handleChangeGoal}
            activeOpacity={0.7}
          >
            <Text style={styles.changeGoalText}>
              {editingField === 'goalWeight'
                ? t('common.save', { defaultValue: 'Save' })
                : t('profile.changeGoal', { defaultValue: 'Change Goal' })}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <InfoRow
            label={t('profile.currentWeight', { defaultValue: 'Current weight' })}
            value={`${currentWeight} kg`}
            isEditing={editingField === 'weight'}
            editValue={tempValue}
            onEdit={() => startEditing('weight', currentWeight)}
            onChangeText={setTempValue}
            keyboardType="numeric"
          />
          <InfoRow
            label={t('profile.height', { defaultValue: 'Height' })}
            value={`${height} cm`}
            isEditing={editingField === 'height'}
            editValue={tempValue}
            onEdit={() => startEditing('height', height)}
            onChangeText={setTempValue}
            keyboardType="numeric"
          />
          <InfoRow
            label={t('profile.dateOfBirth', { defaultValue: 'Date of birth' })}
            value={dateOfBirth}
            isEditing={editingField === 'dob'}
            editValue={tempValue}
            onEdit={() => startEditing('dob', dateOfBirth)}
            onChangeText={setTempValue}
          />
          <InfoRow
            label={t('profile.gender', { defaultValue: 'Gender' })}
            value={gender.charAt(0).toUpperCase() + gender.slice(1)}
            isEditing={editingField === 'gender'}
            editValue={tempValue}
            onEdit={() => startEditing('gender', gender)}
            onChangeText={setTempValue}
          />
          <InfoRow
            label={t('profile.dailyStepGoal', { defaultValue: 'Daily step goal' })}
            value={`${Number(dailyStepGoal).toLocaleString()} steps`}
            isEditing={editingField === 'steps'}
            editValue={tempValue}
            onEdit={() => startEditing('steps', dailyStepGoal)}
            onChangeText={setTempValue}
            keyboardType="numeric"
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
  // Goal Weight Card
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: spacing.base,
    marginBottom: spacing.base,
  },
  goalLeft: {
    flex: 1,
  },
  goalLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  goalValue: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  goalEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalInput: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
    minWidth: 60,
    paddingVertical: 0,
  },
  goalUnit: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  changeGoalButton: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  changeGoalText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.primary,
  },
  // Info Card
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.base,
  },
  infoRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  infoLabel: {
    flex: 1,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginRight: spacing.md,
  },
  infoInput: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
    minWidth: 80,
    textAlign: 'right',
    marginRight: spacing.md,
    paddingVertical: 0,
  },
  editButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
