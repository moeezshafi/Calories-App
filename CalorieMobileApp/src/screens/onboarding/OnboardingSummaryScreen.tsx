import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { colors, typography, spacing } from '../../theme';
import { completeOnboarding } from '../../services/auth';
import { useAuthStore } from '../../store/authStore';

export default function OnboardingSummaryScreen({ navigation, route }: any) {
  const { t } = useTranslation();
  const formData = route.params?.formData || {};
  const updateUser = useAuthStore((s) => s.updateUser);
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    calculatePlan();
  }, []);

  const calculatePlan = async () => {
    setLoading(true);
    try {
      const result = await completeOnboarding(formData);
      setPlan(result);
    } catch (err: any) {
      setError(err.userMessage || err.response?.data?.message || err.response?.data?.error || t('onboarding.summaryError'));
    } finally {
      setLoading(false);
    }
  };

  const goalLabel = formData.goal_type === 'lose_weight' ? t('onboarding.loseWeight')
    : formData.goal_type === 'gain_weight' ? t('onboarding.gainWeight')
    : t('onboarding.maintain');

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>{t('onboarding.calculatingPlan')}</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <Ionicons name="warning-outline" size={48} color={colors.error} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={calculatePlan}>
          <Text style={styles.retryBtnText}>{t('onboarding.retry')}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <View style={styles.checkCircle}>
            <Ionicons name="checkmark" size={40} color={colors.textWhite} />
          </View>
          <Text style={styles.title}>{t('onboarding.yourPlan')}</Text>
          <Text style={styles.subtitle}>{t('onboarding.planReady')}</Text>
        </View>

        <View style={styles.calorieCard}>
          <Text style={styles.calorieLabel}>{t('onboarding.dailyCalories')}</Text>
          <Text style={styles.calorieValue}>{plan?.daily_calorie_goal || '—'}</Text>
          <Text style={styles.calorieUnit}>{t('onboarding.kcalPerDay')}</Text>
        </View>

        <View style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>{t('onboarding.yourDetails')}</Text>
          <DetailRow icon="flag-outline" label={t('onboarding.goal')} value={goalLabel} />
          <DetailRow icon="person-outline" label={t('onboarding.genderLabel')} value={formData.gender === 'male' ? t('personalDetails.male') : t('personalDetails.female')} />
          <DetailRow icon="calendar-outline" label={t('onboarding.ageLabel')} value={`${formData.age} ${t('onboarding.years')}`} />
          <DetailRow icon="resize-outline" label={t('onboarding.heightLabel')} value={`${formData.height} ${t('personalDetails.cm')}`} />
          <DetailRow icon="scale-outline" label={t('onboarding.currentWeight')} value={`${formData.weight} ${t('personalDetails.kg')}`} />
          <DetailRow icon="trending-down-outline" label={t('onboarding.targetWeightLabel')} value={`${formData.target_weight} ${t('personalDetails.kg')}`} />
        </View>

        {plan?.macros && (
          <View style={styles.macrosCard}>
            <Text style={styles.sectionTitle}>{t('onboarding.dailyMacros')}</Text>
            <View style={styles.macroRow}>
              <MacroItem label={t('nutrition.protein')} value={`${plan.macros.protein}g`} color={colors.protein} />
              <MacroItem label={t('nutrition.carbs')} value={`${plan.macros.carbs}g`} color={colors.carbs} />
              <MacroItem label={t('nutrition.fats')} value={`${plan.macros.fats}g`} color={colors.fats} />
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.startBtn} onPress={() => {
          // Merge full user data from backend response into auth store
          const userData = plan?.user || {};
          updateUser({
            ...userData,
            daily_calorie_goal: plan?.daily_calorie_goal || userData.daily_calorie_goal,
            onboarding_completed: true,
          });
        }}>
          <Text style={styles.startBtnText}>{t('onboarding.startJourney')}</Text>
          <Ionicons name="arrow-forward" size={20} color={colors.textWhite} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function DetailRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Ionicons name={icon as any} size={20} color={colors.primary} />
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

function MacroItem({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={styles.macroItem}>
      <View style={[styles.macroDot, { backgroundColor: color }]} />
      <Text style={styles.macroValue}>{value}</Text>
      <Text style={styles.macroLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  scroll: { paddingHorizontal: spacing.xl, paddingBottom: 100 },
  loadingText: { fontSize: typography.sizes.md, color: colors.textSecondary, marginTop: spacing.lg },
  errorText: { fontSize: typography.sizes.md, color: colors.error, marginTop: spacing.md, textAlign: 'center' },
  retryBtn: { marginTop: spacing.lg, backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 12, paddingHorizontal: spacing.xl },
  retryBtnText: { color: colors.textWhite, fontSize: typography.sizes.md, fontWeight: typography.weights.semibold as any },
  header: { alignItems: 'center', paddingTop: spacing['3xl'] },
  checkCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: typography.sizes['2xl'], fontWeight: typography.weights.bold as any, color: colors.textPrimary, marginTop: spacing.lg },
  subtitle: { fontSize: typography.sizes.base, color: colors.textSecondary, marginTop: spacing.xs },
  calorieCard: { backgroundColor: colors.primary, borderRadius: 20, padding: spacing.xl, alignItems: 'center', marginTop: spacing.xl },
  calorieLabel: { fontSize: typography.sizes.sm, color: 'rgba(255,255,255,0.8)' },
  calorieValue: { fontSize: 56, fontWeight: typography.weights.bold as any, color: colors.textWhite, marginTop: spacing.xs },
  calorieUnit: { fontSize: typography.sizes.md, color: 'rgba(255,255,255,0.8)', marginTop: spacing.xs },
  detailsCard: { backgroundColor: colors.surface, borderRadius: 16, padding: spacing.lg, marginTop: spacing.lg, borderWidth: 1, borderColor: colors.surfaceBorder },
  sectionTitle: { fontSize: typography.sizes.md, fontWeight: typography.weights.semibold as any, color: colors.textPrimary, marginBottom: spacing.md },
  detailRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm },
  detailLabel: { flex: 1, fontSize: typography.sizes.sm, color: colors.textSecondary, marginLeft: spacing.sm },
  detailValue: { fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold as any, color: colors.textPrimary },
  macrosCard: { backgroundColor: colors.surface, borderRadius: 16, padding: spacing.lg, marginTop: spacing.md, borderWidth: 1, borderColor: colors.surfaceBorder },
  macroRow: { flexDirection: 'row', justifyContent: 'space-around' },
  macroItem: { alignItems: 'center' },
  macroDot: { width: 10, height: 10, borderRadius: 5 },
  macroValue: { fontSize: typography.sizes.lg, fontWeight: typography.weights.bold as any, color: colors.textPrimary, marginTop: spacing.xs },
  macroLabel: { fontSize: typography.sizes.xs, color: colors.textSecondary, marginTop: 2 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: spacing.xl, paddingBottom: spacing.xl, paddingTop: spacing.md, backgroundColor: colors.background },
  startBtn: { backgroundColor: colors.primary, borderRadius: 16, paddingVertical: 18, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: spacing.sm },
  startBtnText: { color: colors.textWhite, fontSize: typography.sizes.md, fontWeight: typography.weights.semibold as any },
});
