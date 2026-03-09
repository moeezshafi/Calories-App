import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { colors, typography, spacing } from '../../theme';

export default function OnboardingAgeScreen({ navigation, route }: any) {
  const { t } = useTranslation();
  const [age, setAge] = useState('');
  const formData = route.params?.formData || {};
  const valid = age && parseInt(age) >= 13 && parseInt(age) <= 120;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.progress}><View style={[styles.progressBar, { width: '33%' }]} /></View>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.step}>{t('onboarding.step', { current: 3, total: 9 })}</Text>
        <Text style={styles.title}>{t('onboarding.ageTitle')}</Text>
        <Text style={styles.subtitle}>{t('onboarding.ageSubtitle')}</Text>

        <View style={styles.inputArea}>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={age}
              onChangeText={setAge}
              keyboardType="number-pad"
              placeholder="25"
              placeholderTextColor={colors.textTertiary}
              maxLength={3}
              autoFocus
            />
            <Text style={styles.unit}>{t('onboarding.years')}</Text>
          </View>
          {age && !valid && <Text style={styles.error}>{t('onboarding.ageError')}</Text>}
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.continueBtn, !valid && styles.continueBtnDisabled]}
            onPress={() => valid && navigation.navigate('OnboardingHeight', { formData: { ...formData, age: parseInt(age) } })}
            disabled={!valid}
          >
            <Text style={styles.continueBtnText}>{t('onboarding.continue')}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  progress: { height: 4, backgroundColor: colors.divider, marginHorizontal: spacing.xl, marginTop: spacing.md, borderRadius: 2 },
  progressBar: { height: 4, backgroundColor: colors.primary, borderRadius: 2 },
  backBtn: { marginLeft: spacing.xl, marginTop: spacing.md, width: 40 },
  step: { fontSize: typography.sizes.sm, color: colors.textTertiary, textAlign: 'center', marginTop: spacing.sm },
  title: { fontSize: typography.sizes['2xl'], fontWeight: typography.weights.bold as any, color: colors.textPrimary, textAlign: 'center', marginTop: spacing.sm },
  subtitle: { fontSize: typography.sizes.base, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xs, paddingHorizontal: spacing.xl },
  inputArea: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 80 },
  inputRow: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm },
  input: { fontSize: 64, fontWeight: typography.weights.bold as any, color: colors.textPrimary, textAlign: 'center', minWidth: 120 },
  unit: { fontSize: typography.sizes.xl, color: colors.textSecondary },
  error: { fontSize: typography.sizes.sm, color: colors.error, marginTop: spacing.sm },
  footer: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xl },
  continueBtn: { backgroundColor: colors.primary, borderRadius: 16, paddingVertical: 18, alignItems: 'center' },
  continueBtnDisabled: { opacity: 0.4 },
  continueBtnText: { color: colors.textWhite, fontSize: typography.sizes.md, fontWeight: typography.weights.semibold as any },
});
