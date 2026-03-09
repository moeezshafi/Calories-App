import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { colors, typography, spacing } from '../../theme';

const DIETS = [
  { value: 'none', icon: 'restaurant-outline', labelKey: 'onboarding.dietNone', descKey: 'onboarding.dietNoneDesc' },
  { value: 'keto', icon: 'egg-outline', labelKey: 'onboarding.dietKeto', descKey: 'onboarding.dietKetoDesc' },
  { value: 'vegan', icon: 'leaf-outline', labelKey: 'onboarding.dietVegan', descKey: 'onboarding.dietVeganDesc' },
  { value: 'vegetarian', icon: 'nutrition-outline', labelKey: 'onboarding.dietVegetarian', descKey: 'onboarding.dietVegetarianDesc' },
  { value: 'paleo', icon: 'fish-outline', labelKey: 'onboarding.dietPaleo', descKey: 'onboarding.dietPaleoDesc' },
  { value: 'mediterranean', icon: 'globe-outline', labelKey: 'onboarding.dietMediterranean', descKey: 'onboarding.dietMediterraneanDesc' },
];

export default function OnboardingDietScreen({ navigation, route }: any) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState('');
  const formData = route.params?.formData || {};

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.progress}><View style={[styles.progressBar, { width: '88%' }]} /></View>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
      </TouchableOpacity>
      <Text style={styles.step}>{t('onboarding.step', { current: 8, total: 9 })}</Text>
      <Text style={styles.title}>{t('onboarding.dietTitle')}</Text>
      <Text style={styles.subtitle}>{t('onboarding.dietSubtitle')}</Text>

      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.options}>
        {DIETS.map((d) => (
          <TouchableOpacity
            key={d.value}
            style={[styles.card, selected === d.value && styles.cardSelected]}
            onPress={() => setSelected(d.value)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconCircle, selected === d.value && styles.iconCircleSelected]}>
              <Ionicons name={d.icon as any} size={24} color={selected === d.value ? colors.textWhite : colors.primary} />
            </View>
            <View style={styles.cardText}>
              <Text style={[styles.cardLabel, selected === d.value && styles.cardLabelSelected]}>{t(d.labelKey)}</Text>
              <Text style={styles.cardDesc}>{t(d.descKey)}</Text>
            </View>
            <View style={[styles.radio, selected === d.value && styles.radioSelected]}>
              {selected === d.value && <View style={styles.radioDot} />}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.continueBtn, !selected && styles.continueBtnDisabled]}
          onPress={() => selected && navigation.navigate('OnboardingWorkout', { formData: { ...formData, diet_type: selected } })}
          disabled={!selected}
        >
          <Text style={styles.continueBtnText}>{t('onboarding.continue')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  progress: { height: 4, backgroundColor: colors.divider, marginHorizontal: spacing.xl, marginTop: spacing.md, borderRadius: 2 },
  progressBar: { height: 4, backgroundColor: colors.primary, borderRadius: 2 },
  backBtn: { marginLeft: spacing.xl, marginTop: spacing.md, width: 40 },
  step: { fontSize: typography.sizes.sm, color: colors.textTertiary, textAlign: 'center', marginTop: spacing.sm },
  title: { fontSize: typography.sizes['2xl'], fontWeight: typography.weights.bold as any, color: colors.textPrimary, textAlign: 'center', marginTop: spacing.sm, paddingHorizontal: spacing.xl },
  subtitle: { fontSize: typography.sizes.base, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xs, paddingHorizontal: spacing.xl },
  scrollArea: { flex: 1 },
  options: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg, gap: spacing.sm, paddingBottom: spacing.md },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 16, padding: spacing.md, borderWidth: 2, borderColor: colors.surfaceBorder },
  cardSelected: { borderColor: colors.primary, backgroundColor: `${colors.primary}08` },
  iconCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: `${colors.primary}15`, justifyContent: 'center', alignItems: 'center' },
  iconCircleSelected: { backgroundColor: colors.primary },
  cardText: { flex: 1, marginLeft: spacing.md },
  cardLabel: { fontSize: typography.sizes.md, fontWeight: typography.weights.semibold as any, color: colors.textPrimary },
  cardLabelSelected: { color: colors.primary },
  cardDesc: { fontSize: typography.sizes.xs, color: colors.textSecondary, marginTop: 2 },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: colors.surfaceBorder, justifyContent: 'center', alignItems: 'center' },
  radioSelected: { borderColor: colors.primary },
  radioDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.primary },
  footer: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xl },
  continueBtn: { backgroundColor: colors.primary, borderRadius: 16, paddingVertical: 18, alignItems: 'center' },
  continueBtnDisabled: { opacity: 0.4 },
  continueBtnText: { color: colors.textWhite, fontSize: typography.sizes.md, fontWeight: typography.weights.semibold as any },
});
