import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, RefreshControl, TouchableOpacity,
  Alert, ActivityIndicator, Modal, TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import Card from '../../components/common/Card';
import api from '../../services/api';
import * as exercisesService from '../../services/exercises';
import { formatDate } from '../../utils/date';

interface ExerciseLog {
  id: number;
  exercise_type: string;
  duration_minutes: number;
  calories_burned: number;
  logged_at: string;
}

const QUICK_EXERCISES = [
  { type: 'walking', icon: 'walk', name: 'Walking' },
  { type: 'running', icon: 'fitness', name: 'Running' },
  { type: 'cycling', icon: 'bicycle', name: 'Cycling' },
  { type: 'swimming', icon: 'water', name: 'Swimming' },
  { type: 'gym', icon: 'barbell', name: 'Gym' },
  { type: 'yoga', icon: 'body', name: 'Yoga' },
];

export default function ExerciseScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [exercises, setExercises] = useState<ExerciseLog[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const [selectedName, setSelectedName] = useState('');
  const [durationInput, setDurationInput] = useState('');
  const [caloriesInput, setCaloriesInput] = useState('');
  const [saving, setSaving] = useState(false);

  const today = new Date();
  const todayStr = formatDate(today);

  const fetchExercises = useCallback(async () => {
    try {
      const res = await exercisesService.getExerciseLogs(todayStr);
      const logs = res?.data?.logs || res?.logs || res?.data || [];
      setExercises(Array.isArray(logs) ? logs : []);
    } catch (e) {
      console.log('Exercise fetch error:', e);
    } finally {
      setLoading(false);
    }
  }, [todayStr]);

  useEffect(() => { fetchExercises(); }, [fetchExercises]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchExercises();
    setRefreshing(false);
  };

  const openModal = (type: string, name: string) => {
    setSelectedType(type);
    setSelectedName(name);
    setDurationInput('');
    setCaloriesInput('');
    setShowModal(true);
  };

  const handleLogExercise = async () => {
    const duration = parseInt(durationInput, 10);
    const calories = parseInt(caloriesInput, 10);

    if (!durationInput.trim() || isNaN(duration) || duration <= 0) {
      Alert.alert(
        t('common.error', { defaultValue: 'Error' }),
        t('exercise.enterValidDuration', { defaultValue: 'Please enter a valid duration in minutes.' }),
      );
      return;
    }

    if (!caloriesInput.trim() || isNaN(calories) || calories < 0) {
      Alert.alert(
        t('common.error', { defaultValue: 'Error' }),
        t('exercise.enterValidCalories', { defaultValue: 'Please enter estimated calories burned.' }),
      );
      return;
    }

    setSaving(true);
    try {
      await exercisesService.logExercise({
        exercise_type: selectedType,
        duration_minutes: duration,
        calories_burned: calories,
        date: todayStr,
      });
      setShowModal(false);
      await fetchExercises();
    } catch (e: any) {
      console.log('Exercise log error:', e);
      Alert.alert(
        t('common.error', { defaultValue: 'Error' }),
        e?.userMessage || t('exercise.logFailed', { defaultValue: 'Could not log exercise. Please try again.' }),
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (exerciseId: number) => {
    Alert.alert(
      t('exercise.deleteTitle', { defaultValue: 'Delete Exercise' }),
      t('exercise.deleteMessage', { defaultValue: 'Are you sure you want to remove this exercise?' }),
      [
        { text: t('common.cancel', { defaultValue: 'Cancel' }), style: 'cancel' },
        {
          text: t('common.delete', { defaultValue: 'Delete' }),
          style: 'destructive',
          onPress: async () => {
            try {
              await exercisesService.deleteExerciseLog(exerciseId);
              await fetchExercises();
            } catch (e: any) {
              console.log('Exercise delete error:', e);
              Alert.alert(
                t('common.error', { defaultValue: 'Error' }),
                e?.userMessage || t('exercise.deleteFailed', { defaultValue: 'Could not delete exercise.' }),
              );
            }
          },
        },
      ],
    );
  };

  const totalCaloriesBurned = exercises.reduce((sum, ex) => sum + (ex.calories_burned || 0), 0);

  const dateDisplay = today.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header with Back Button */}
        <View style={styles.headerContainer}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.title}>
              {t('exercise.title', { defaultValue: 'Exercise' })}
            </Text>
            <Text style={styles.dateText}>{dateDisplay}</Text>
          </View>
          <View style={styles.backButton} />
        </View>

        {/* Total Burned */}
        <Card style={styles.summaryCard}>
          <Ionicons name="flame" size={36} color={colors.warning} style={styles.summaryIcon} />
          <View>
            <Text style={styles.summaryValue}>
              {totalCaloriesBurned}
              <Text style={styles.summaryUnit}> {t('exercise.cal', { defaultValue: 'cal' })}</Text>
            </Text>
            <Text style={styles.summaryLabel}>
              {t('exercise.burnedToday', { defaultValue: 'Burned Today' })}
            </Text>
          </View>
        </Card>

        {/* Quick-Add Buttons */}
        <Text style={styles.sectionTitle}>
          {t('exercise.quickAdd', { defaultValue: 'Quick Add' })}
        </Text>
        <View style={styles.quickGrid}>
          {QUICK_EXERCISES.map((ex) => (
            <TouchableOpacity
              key={ex.type}
              style={styles.quickButton}
              onPress={() => openModal(ex.type, ex.name)}
              activeOpacity={0.7}
            >
              <Ionicons name={ex.icon as any} size={28} color={colors.primary} style={{ marginBottom: spacing.xs }} />
              <Text style={styles.quickLabel}>
                {t(`exercise.type.${ex.type}`, { defaultValue: ex.name })}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Today's Exercises */}
        <Text style={styles.sectionTitle}>
          {t('exercise.todaysExercises', { defaultValue: "Today's Exercises" })}
        </Text>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        ) : exercises.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Ionicons name="barbell" size={48} color={colors.textTertiary} style={styles.emptyIcon} />
            <Text style={styles.emptyText}>
              {t('exercise.noExercises', { defaultValue: 'No exercises logged today.\nTap a button above to get started!' })}
            </Text>
          </Card>
        ) : (
          exercises.map((ex) => {
            const matchedEx = QUICK_EXERCISES.find((q) => q.type === ex.exercise_type);
            const iconName = matchedEx?.icon || 'barbell';
            const name = matchedEx?.name || ex.exercise_type;
            return (
              <TouchableOpacity
                key={ex.id}
                onLongPress={() => handleDelete(ex.id)}
                activeOpacity={0.8}
              >
                <Card style={styles.exerciseCard}>
                  <Ionicons name={iconName as any} size={28} color={colors.primary} style={{ marginRight: spacing.md }} />
                  <View style={styles.exerciseInfo}>
                    <Text style={styles.exerciseName}>
                      {t(`exercise.type.${ex.exercise_type}`, { defaultValue: name })}
                    </Text>
                    <Text style={styles.exerciseMeta}>
                      {ex.duration_minutes} {t('exercise.min', { defaultValue: 'min' })}
                    </Text>
                  </View>
                  <Text style={styles.exerciseCalories}>
                    -{ex.calories_burned} {t('exercise.cal', { defaultValue: 'cal' })}
                  </Text>
                </Card>
              </TouchableOpacity>
            );
          })
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Log Exercise Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {t(`exercise.type.${selectedType}`, { defaultValue: selectedName })}
              </Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Text style={styles.modalClose}>X</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalFieldLabel}>
              {t('exercise.duration', { defaultValue: 'Duration' })} ({t('exercise.minutes', { defaultValue: 'minutes' })})
            </Text>
            <TextInput
              style={styles.modalInput}
              value={durationInput}
              onChangeText={setDurationInput}
              placeholder="30"
              placeholderTextColor={colors.textTertiary}
              keyboardType="number-pad"
              autoFocus
            />

            <Text style={styles.modalFieldLabel}>
              {t('exercise.caloriesBurned', { defaultValue: 'Calories Burned' })}
            </Text>
            <TextInput
              style={styles.modalInput}
              value={caloriesInput}
              onChangeText={setCaloriesInput}
              placeholder="200"
              placeholderTextColor={colors.textTertiary}
              keyboardType="number-pad"
            />

            <TouchableOpacity
              style={styles.modalSaveBtn}
              onPress={handleLogExercise}
              disabled={saving}
              activeOpacity={0.7}
            >
              {saving ? (
                <ActivityIndicator size="small" color={colors.textWhite} />
              ) : (
                <Text style={styles.modalSaveBtnText}>
                  {t('exercise.logExercise', { defaultValue: 'Log Exercise' })}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingTop: spacing.base,
    paddingBottom: spacing.xs,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  dateText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },

  // ---- Summary Card ----
  summaryCard: {
    marginHorizontal: spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.md,
    ...shadows.base,
  },
  summaryIcon: {
    fontSize: 36,
  },
  summaryValue: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  summaryUnit: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.regular,
    color: colors.textSecondary,
  },
  summaryLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },

  // ---- Quick-Add Grid ----
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    paddingHorizontal: spacing.base,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.base,
    gap: spacing.sm,
  },
  quickButton: {
    width: '31%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    ...shadows.sm,
  },
  quickLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
  },

  // ---- Exercise List ----
  exerciseCard: {
    marginHorizontal: spacing.base,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    ...shadows.sm,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  exerciseMeta: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  exerciseCalories: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.error,
  },

  // ---- Empty State ----
  emptyCard: {
    marginHorizontal: spacing.base,
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.sm,
    opacity: 0.4,
  },
  emptyText: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.sizes.base * typography.lineHeights.relaxed,
  },

  // ---- Modal ----
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    paddingHorizontal: spacing.base,
    paddingBottom: spacing['3xl'],
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    marginBottom: spacing.base,
  },
  modalTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  modalClose: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textTertiary,
    padding: spacing.xs,
  },
  modalFieldLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  modalInput: {
    height: 48,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.base,
    fontSize: typography.sizes.base,
    color: colors.textPrimary,
  },
  modalSaveBtn: {
    height: 52,
    borderRadius: borderRadius.base,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  modalSaveBtnText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.textWhite,
  },
});
