import React, { useState, useEffect } from 'react';
import {
  View, Text, Modal, StyleSheet, TouchableOpacity, ScrollView,
  ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import Card from '../../components/common/Card';
import * as mealPlansService from '../../services/mealPlans';

interface Template {
  id: number;
  name: string;
  meals: any[];
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fats: number;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelectTemplate: (template: Template) => void;
}

export default function MealPlanTemplateModal({ visible, onClose, onSelectTemplate }: Props) {
  const { t } = useTranslation();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (visible) {
      fetchTemplates();
    }
  }, [visible]);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const result = await mealPlansService.getTemplates();
      setTemplates(result?.data?.templates || result?.templates || []);
    } catch (e) {
      console.log('Templates fetch error:', e);
      Alert.alert(
        t('common.error', { defaultValue: 'Error' }),
        t('meals.templatesFetchFailed', { defaultValue: 'Could not load templates.' }),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancelText}>
              {t('common.cancel', { defaultValue: 'Cancel' })}
            </Text>
          </TouchableOpacity>
          <Text style={styles.title}>
            {t('meals.selectTemplate', { defaultValue: 'Select Template' })}
          </Text>
          <View style={{ width: 60 }} />
        </View>

        {/* Content */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : templates.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📂</Text>
            <Text style={styles.emptyText}>
              {t('meals.noTemplates', { defaultValue: 'No templates saved yet.\nSave a day as template to use this feature.' })}
            </Text>
          </View>
        ) : (
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {templates.map((template) => (
              <Card key={template.id} style={styles.templateCard}>
                <View style={styles.templateHeader}>
                  <Text style={styles.templateName}>{template.name}</Text>
                  <Text style={styles.templateMealCount}>
                    {template.meals?.length || 0} {t('meals.meals', { defaultValue: 'meals' })}
                  </Text>
                </View>

                <View style={styles.templateNutrition}>
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionValue}>{Math.round(template.total_calories)}</Text>
                    <Text style={styles.nutritionLabel}>cal</Text>
                  </View>
                  <View style={styles.nutritionItem}>
                    <Text style={[styles.nutritionValue, { color: colors.protein }]}>
                      {Math.round(template.total_protein)}g
                    </Text>
                    <Text style={styles.nutritionLabel}>protein</Text>
                  </View>
                  <View style={styles.nutritionItem}>
                    <Text style={[styles.nutritionValue, { color: colors.carbs }]}>
                      {Math.round(template.total_carbs)}g
                    </Text>
                    <Text style={styles.nutritionLabel}>carbs</Text>
                  </View>
                  <View style={styles.nutritionItem}>
                    <Text style={[styles.nutritionValue, { color: colors.fats }]}>
                      {Math.round(template.total_fats)}g
                    </Text>
                    <Text style={styles.nutritionLabel}>fats</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.applyButton}
                  onPress={() => {
                    onSelectTemplate(template);
                    onClose();
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.applyButtonText}>
                    {t('meals.applyTemplate', { defaultValue: 'Apply Template' })}
                  </Text>
                </TouchableOpacity>
              </Card>
            ))}
            <View style={{ height: 20 }} />
          </ScrollView>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    backgroundColor: colors.surface,
  },
  cancelText: {
    fontSize: typography.sizes.base,
    color: colors.primary,
    fontWeight: typography.weights.medium,
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
    opacity: 0.3,
  },
  emptyText: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.sizes.base * typography.lineHeights.relaxed,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.md,
  },
  templateCard: {
    marginBottom: spacing.md,
    ...shadows.base,
  },
  templateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  templateName: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    flex: 1,
  },
  templateMealCount: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  templateNutrition: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  nutritionItem: {
    alignItems: 'center',
  },
  nutritionValue: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  nutritionLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  applyButton: {
    paddingVertical: spacing.md,
    borderRadius: borderRadius.base,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.textWhite,
  },
});
