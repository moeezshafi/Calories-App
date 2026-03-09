import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { colors, typography, spacing } from '../../theme';

const GENDERS = [
  { value: 'male', icon: 'male', labelKey: 'personalDetails.male' },
  { value: 'female', icon: 'female', labelKey: 'personalDetails.female' },
];

export default function OnboardingGenderScreen({ navigation, route }: any) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState('');
  const formData = route.params?.formData || {};

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.progress}><View style={[styles.progressBar, { width: '22%' }]} /></View>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
      </TouchableOpacity>
      <Text style={styles.step}>{t('onboarding.step', { current: 2, total: 9 })}</Text>
      <Text style={styles.title}>{t('onboarding.genderTitle')}</Text>

      <View style={styles.options}>
        {GENDERS.map((g) => (
          <TouchableOpacity
            key={g.value}
            style={[styles.card, selected === g.value && styles.cardSelected]}
            onPress={() => setSelected(g.value)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconCircle, selected === g.value && styles.iconCircleSelected]}>
              <Ionicons name={g.icon as any} size={40} color={selected === g.value ? colors.textWhite : colors.primary} />
            </View>
            <Text style={[styles.cardLabel, selected === g.value && styles.cardLabelSelected]}>{t(g.labelKey)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.continueBtn, !selected && styles.continueBtnDisabled]}
          onPress={() => selected && navigation.navigate('OnboardingAge', { formData: { ...formData, gender: selected } })}
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
  options: { flex: 1, flexDirection: 'row', paddingHorizontal: spacing.xl, paddingTop: spacing['3xl'], gap: spacing.lg, justifyContent: 'center' },
  card: { width: 150, height: 180, backgroundColor: colors.surface, borderRadius: 20, borderWidth: 2, borderColor: colors.surfaceBorder, justifyContent: 'center', alignItems: 'center', gap: spacing.md },
  cardSelected: { borderColor: colors.primary, backgroundColor: `${colors.primary}08` },
  iconCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: `${colors.primary}15`, justifyContent: 'center', alignItems: 'center' },
  iconCircleSelected: { backgroundColor: colors.primary },
  cardLabel: { fontSize: typography.sizes.md, fontWeight: typography.weights.semibold as any, color: colors.textPrimary },
  cardLabelSelected: { color: colors.primary },
  footer: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xl },
  continueBtn: { backgroundColor: colors.primary, borderRadius: 16, paddingVertical: 18, alignItems: 'center' },
  continueBtnDisabled: { opacity: 0.4 },
  continueBtnText: { color: colors.textWhite, fontSize: typography.sizes.md, fontWeight: typography.weights.semibold as any },
});
