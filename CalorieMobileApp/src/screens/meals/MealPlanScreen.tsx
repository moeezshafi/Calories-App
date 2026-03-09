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
import * as mealPlansService from '../../services/mealPlans';
import { formatDate } from '../../utils/date';
import CopyMealPlanModal from './CopyMealPlanModal';

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'] as const;
type MealType = typeof MEAL_TYPES[number];

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface MealItem {
  id?: number;
  food_name: string;
  meal_type: MealType;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

interface DayPlan {
  date: string;
  meals: MealItem[];
}

const getMealTypeIcon = (type: MealType): keyof typeof Ionicons.glyphMap => {
  switch (type) {
    case 'breakfast': return 'cafe';
    case 'lunch': return 'fast-food';
    case 'dinner': return 'restaurant';
    case 'snack': return 'nutrition';
    default: return 'restaurant';
  }
};

const getWeekDatesForMonday = (): Date[] => {
  const today = new Date();
  const day = today.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const dates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + mondayOffset + i);
    dates.push(d);
  }
  return dates;
};

export default function MealPlanScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(0);
  const [weekDates] = useState(getWeekDatesForMonday);
  const [weekPlans, setWeekPlans] = useState<Record<string, MealItem[]>>({});

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalMealType, setModalMealType] = useState<MealType>('breakfast');
  const [foodNameInput, setFoodNameInput] = useState('');
  const [caloriesInput, setCaloriesInput] = useState('');
  const [proteinInput, setProteinInput] = useState('');
  const [carbsInput, setCarbsInput] = useState('');
  const [fatsInput, setFatsInput] = useState('');
  const [saving, setSaving] = useState(false);

  // Template modal state
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  // Copy modal state
  const [showCopyModal, setShowCopyModal] = useState(false);

  const startDate = formatDate(weekDates[0]);
  const endDate = formatDate(weekDates[6]);

  const fetchPlans = useCallback(async () => {
    try {
      const res = await api.get('/api/meal-plans/', {
        params: { start_date: startDate, end_date: endDate },
      });
      const plans = res?.data?.data?.plans || res?.data?.plans || res?.data || [];
      const plansByDate: Record<string, MealItem[]> = {};

      if (Array.isArray(plans)) {
        plans.forEach((plan: any) => {
          const date = plan.date || plan.planned_date;
          if (!plansByDate[date]) plansByDate[date] = [];
          const meals = plan.meals || [plan];
          meals.forEach((m: any) => {
            plansByDate[date].push({
              id: m.id,
              food_name: m.food_name || m.name || '',
              meal_type: m.meal_type || 'snack',
              calories: m.calories || 0,
              protein: m.protein || 0,
              carbs: m.carbs || 0,
              fats: m.fats || 0,
            });
          });
        });
      }

      setWeekPlans(plansByDate);
    } catch (e) {
      console.log('Meal plans fetch error:', e);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => { fetchPlans(); }, [fetchPlans]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPlans();
    setRefreshing(false);
  };

  const openAddModal = (mealType: MealType) => {
    setModalMealType(mealType);
    setFoodNameInput('');
    setCaloriesInput('');
    setProteinInput('');
    setCarbsInput('');
    setFatsInput('');
    setShowModal(true);
  };

  const handleSaveMeal = async () => {
    if (!foodNameInput.trim()) {
      Alert.alert(
        t('common.error', { defaultValue: 'Error' }),
        t('meals.enterFoodName', { defaultValue: 'Please enter a food name.' }),
      );
      return;
    }

    const calories = parseInt(caloriesInput, 10) || 0;
    const protein = parseFloat(proteinInput) || 0;
    const carbs = parseFloat(carbsInput) || 0;
    const fats = parseFloat(fatsInput) || 0;

    setSaving(true);
    try {
      const date = formatDate(weekDates[selectedDay]);
      await mealPlansService.createMealPlan(date, [{
        meal_type: modalMealType,
        food_name: foodNameInput.trim(),
        calories,
        protein,
        carbs,
        fats,
      }]);
      setShowModal(false);
      await fetchPlans();
    } catch (e: any) {
      console.log('Meal plan save error:', e);
      Alert.alert(
        t('common.error', { defaultValue: 'Error' }),
        e?.userMessage || t('meals.saveFailed', { defaultValue: 'Could not save meal plan. Please try again.' }),
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMeal = (mealId: number, foodName: string) => {
    Alert.alert(
      t('meals.deleteMeal', { defaultValue: 'Delete Meal' }),
      t('meals.deleteMealConfirm', { defaultValue: `Remove "${foodName}" from your meal plan?` }),
      [
        { text: t('common.cancel', { defaultValue: 'Cancel' }), style: 'cancel' },
        {
          text: t('common.delete', { defaultValue: 'Delete' }),
          style: 'destructive',
          onPress: async () => {
            try {
              await mealPlansService.deleteMealPlanEntry(mealId);
              await fetchPlans();
            } catch (e: any) {
              Alert.alert(
                t('common.error', { defaultValue: 'Error' }),
                e?.userMessage || t('meals.deleteFailed', { defaultValue: 'Could not delete meal.' }),
              );
            }
          },
        },
      ],
    );
  };

  const handleSaveAsTemplate = () => {
    if (dayMeals.length === 0) {
      Alert.alert(
        t('common.error', { defaultValue: 'Error' }),
        t('meals.noMealsToSave', { defaultValue: 'Add some meals before saving as template.' }),
      );
      return;
    }

    Alert.prompt(
      t('meals.saveTemplate', { defaultValue: 'Save as Template' }),
      t('meals.enterTemplateName', { defaultValue: 'Enter a name for this meal plan template:' }),
      async (templateName) => {
        if (templateName && templateName.trim()) {
          try {
            const date = formatDate(weekDates[selectedDay]);
            await mealPlansService.saveTemplate(templateName.trim(), date);
            Alert.alert(
              t('common.success', { defaultValue: 'Success' }),
              t('meals.templateSaved', { defaultValue: 'Template saved successfully!' }),
            );
          } catch (e: any) {
            Alert.alert(
              t('common.error', { defaultValue: 'Error' }),
              e?.userMessage || t('meals.templateSaveFailed', { defaultValue: 'Could not save template.' }),
            );
          }
        }
      },
    );
  };

  const handleLoadTemplate = () => {
    setShowTemplateModal(true);
  };

  const handleCopyToDay = async (targetDayIndex: number) => {
    const sourceDateStr = formatDate(weekDates[selectedDay]);
    const targetDateStr = formatDate(weekDates[targetDayIndex]);
    const sourceMeals = weekPlans[sourceDateStr] || [];

    if (sourceMeals.length === 0) {
      Alert.alert(
        t('common.error', { defaultValue: 'Error' }),
        t('meals.noMealsToCopy', { defaultValue: 'No meals to copy from this day.' }),
      );
      return;
    }

    try {
      // Create meal plan entries for target day
      const mealsToCreate = sourceMeals.map(meal => ({
        meal_type: meal.meal_type,
        food_name: meal.food_name,
        calories: meal.calories,
        protein: meal.protein,
        carbs: meal.carbs,
        fats: meal.fats,
      }));

      await mealPlansService.createMealPlan(targetDateStr, mealsToCreate);
      await fetchPlans();
      
      Alert.alert(
        t('common.success', { defaultValue: 'Success' }),
        t('meals.mealsCopied', { defaultValue: 'Meals copied successfully!' }),
      );
    } catch (e: any) {
      Alert.alert(
        t('common.error', { defaultValue: 'Error' }),
        e?.userMessage || t('meals.copyFailed', { defaultValue: 'Could not copy meals. Please try again.' }),
      );
    }
  };

  // Current day data
  const currentDateStr = formatDate(weekDates[selectedDay]);
  const dayMeals = weekPlans[currentDateStr] || [];

  // Daily totals
  const dailyTotals = dayMeals.reduce(
    (acc, m) => ({
      calories: acc.calories + (m.calories || 0),
      protein: acc.protein + (m.protein || 0),
      carbs: acc.carbs + (m.carbs || 0),
      fats: acc.fats + (m.fats || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0 },
  );

  // Determine which day index is today
  const todayStr = formatDate(new Date());
  const todayIndex = weekDates.findIndex((d) => formatDate(d) === todayStr);

  const mealTypeLabels: Record<MealType, string> = {
    breakfast: t('meals.breakfast', { defaultValue: 'Breakfast' }),
    lunch: t('meals.lunch', { defaultValue: 'Lunch' }),
    dinner: t('meals.dinner', { defaultValue: 'Dinner' }),
    snack: t('meals.snack', { defaultValue: 'Snack' }),
  };

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
          <Text style={styles.title}>
            {t('meals.title', { defaultValue: 'Meal Plan' })}
          </Text>
          <View style={styles.backButton} />
        </View>

        {/* Day Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dayTabsContainer}
        >
          {weekDates.map((date, index) => {
            const isSelected = index === selectedDay;
            const isToday = index === todayIndex;
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dayTab,
                  isSelected && styles.dayTabActive,
                  isToday && !isSelected && styles.dayTabToday,
                ]}
                onPress={() => setSelectedDay(index)}
                activeOpacity={0.7}
              >
                <Text style={[styles.dayTabLabel, isSelected && styles.dayTabLabelActive]}>
                  {DAY_LABELS[index]}
                </Text>
                <Text style={[styles.dayTabDate, isSelected && styles.dayTabDateActive]}>
                  {date.getDate()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Daily Totals */}
        <Card style={styles.totalsCard}>
          <View style={styles.totalsRow}>
            <View style={styles.totalItem}>
              <Text style={styles.totalValue}>{Math.round(dailyTotals.calories)}</Text>
              <Text style={styles.totalLabel}>
                {t('meals.calories', { defaultValue: 'Calories' })}
              </Text>
            </View>
            <View style={styles.totalItem}>
              <Text style={[styles.totalValue, { color: colors.protein }]}>
                {Math.round(dailyTotals.protein)}g
              </Text>
              <Text style={styles.totalLabel}>
                {t('meals.protein', { defaultValue: 'Protein' })}
              </Text>
            </View>
            <View style={styles.totalItem}>
              <Text style={[styles.totalValue, { color: colors.carbs }]}>
                {Math.round(dailyTotals.carbs)}g
              </Text>
              <Text style={styles.totalLabel}>
                {t('meals.carbs', { defaultValue: 'Carbs' })}
              </Text>
            </View>
            <View style={styles.totalItem}>
              <Text style={[styles.totalValue, { color: colors.fats }]}>
                {Math.round(dailyTotals.fats)}g
              </Text>
              <Text style={styles.totalLabel}>
                {t('meals.fats', { defaultValue: 'Fats' })}
              </Text>
            </View>
          </View>
          {dayMeals.length > 0 && (
            <>
              <TouchableOpacity
                style={styles.saveTemplateBtn}
                onPress={handleSaveAsTemplate}
                activeOpacity={0.7}
              >
                <View style={styles.buttonRow}>
                  <Ionicons name="save" size={16} color={colors.primary} />
                  <Text style={styles.saveTemplateBtnText}>
                    {t('meals.saveAsTemplate', { defaultValue: 'Save as Template' })}
                  </Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveTemplateBtn, { marginTop: spacing.sm }]}
                onPress={() => setShowCopyModal(true)}
                activeOpacity={0.7}
              >
                <View style={styles.buttonRow}>
                  <Ionicons name="copy" size={16} color={colors.primary} />
                  <Text style={styles.saveTemplateBtnText}>
                    {t('meals.copyToAnotherDay', { defaultValue: 'Copy to Another Day' })}
                  </Text>
                </View>
              </TouchableOpacity>
            </>
          )}
          <TouchableOpacity
            style={[styles.saveTemplateBtn, { marginTop: spacing.sm, backgroundColor: colors.accent + '15' }]}
            onPress={handleLoadTemplate}
            activeOpacity={0.7}
          >
            <Text style={[styles.saveTemplateBtnText, { color: colors.accent }]}>
              {t('meals.loadTemplate', { defaultValue: 'Load Template' })}
            </Text>
          </TouchableOpacity>
        </Card>

        {/* Meal Type Sections */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        ) : (
          MEAL_TYPES.map((type) => {
            const mealsOfType = dayMeals.filter((m) => m.meal_type === type);
            return (
              <Card key={type} style={styles.mealSection}>
                <View style={styles.mealSectionHeader}>
                  <Ionicons name={getMealTypeIcon(type)} size={20} color={colors.primary} style={styles.mealSectionIcon} />
                  <Text style={styles.mealSectionTitle}>{mealTypeLabels[type]}</Text>
                </View>

                {mealsOfType.length > 0 ? (
                  mealsOfType.map((meal, idx) => (
                    <View
                      key={meal.id || idx}
                      style={[styles.mealItem, idx < mealsOfType.length - 1 && styles.mealItemBorder]}
                    >
                      <View style={styles.mealItemContent}>
                        <Text style={styles.mealItemName} numberOfLines={1}>{meal.food_name}</Text>
                        <Text style={styles.mealItemCalories}>{meal.calories} cal</Text>
                      </View>
                      {meal.id && (
                        <TouchableOpacity
                          onPress={() => handleDeleteMeal(meal.id!, meal.food_name)}
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                          style={styles.deleteMealBtn}
                        >
                          <Text style={styles.deleteMealText}>×</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  ))
                ) : (
                  <Text style={styles.noMealsText}>
                    {t('meals.noMeals', { defaultValue: 'No meals planned' })}
                  </Text>
                )}

                <TouchableOpacity
                  style={styles.addMealBtn}
                  onPress={() => openAddModal(type)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.addMealBtnText}>
                    + {t('meals.addMeal', { defaultValue: 'Add Meal' })}
                  </Text>
                </TouchableOpacity>
              </Card>
            );
          })
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Add Meal Modal */}
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
              <View style={styles.modalHeaderLeft}>
                <Ionicons name={getMealTypeIcon(modalMealType)} size={24} color={colors.primary} />
                <Text style={styles.modalTitle}>
                  {mealTypeLabels[modalMealType]}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Text style={styles.modalClose}>X</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalFieldLabel}>
              {t('meals.foodName', { defaultValue: 'Food Name' })}
            </Text>
            <TextInput
              style={styles.modalInput}
              value={foodNameInput}
              onChangeText={setFoodNameInput}
              placeholder={t('meals.foodNamePlaceholder', { defaultValue: 'e.g., Grilled Chicken' })}
              placeholderTextColor={colors.textTertiary}
              autoFocus
            />

            <View style={styles.modalRow}>
              <View style={styles.modalHalf}>
                <Text style={styles.modalFieldLabel}>
                  {t('meals.calories', { defaultValue: 'Calories' })}
                </Text>
                <TextInput
                  style={styles.modalInput}
                  value={caloriesInput}
                  onChangeText={setCaloriesInput}
                  placeholder="0"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="number-pad"
                />
              </View>
              <View style={styles.modalHalf}>
                <Text style={styles.modalFieldLabel}>
                  {t('meals.protein', { defaultValue: 'Protein' })} (g)
                </Text>
                <TextInput
                  style={styles.modalInput}
                  value={proteinInput}
                  onChangeText={setProteinInput}
                  placeholder="0"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            <View style={styles.modalRow}>
              <View style={styles.modalHalf}>
                <Text style={styles.modalFieldLabel}>
                  {t('meals.carbs', { defaultValue: 'Carbs' })} (g)
                </Text>
                <TextInput
                  style={styles.modalInput}
                  value={carbsInput}
                  onChangeText={setCarbsInput}
                  placeholder="0"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={styles.modalHalf}>
                <Text style={styles.modalFieldLabel}>
                  {t('meals.fats', { defaultValue: 'Fats' })} (g)
                </Text>
                <TextInput
                  style={styles.modalInput}
                  value={fatsInput}
                  onChangeText={setFatsInput}
                  placeholder="0"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            <TouchableOpacity
              style={styles.modalSaveBtn}
              onPress={handleSaveMeal}
              disabled={saving}
              activeOpacity={0.7}
            >
              {saving ? (
                <ActivityIndicator size="small" color={colors.textWhite} />
              ) : (
                <Text style={styles.modalSaveBtnText}>
                  {t('meals.saveMeal', { defaultValue: 'Save Meal' })}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Copy Meal Plan Modal */}
      <CopyMealPlanModal
        visible={showCopyModal}
        onClose={() => setShowCopyModal(false)}
        onSelectDay={handleCopyToDay}
        currentDayIndex={selectedDay}
        weekDates={weekDates}
      />
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
    paddingBottom: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    flex: 1,
    textAlign: 'center',
  },

  // ---- Day Tabs ----
  dayTabsContainer: {
    paddingHorizontal: spacing.base,
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  dayTab: {
    width: 52,
    height: 68,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  dayTabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    ...shadows.base,
  },
  dayTabToday: {
    borderColor: colors.primary,
  },
  dayTabLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  dayTabLabelActive: {
    color: colors.textWhite,
  },
  dayTabDate: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  dayTabDateActive: {
    color: colors.textWhite,
  },

  // ---- Totals Card ----
  totalsCard: {
    marginHorizontal: spacing.base,
    ...shadows.base,
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalItem: {
    flex: 1,
    alignItems: 'center',
  },
  totalValue: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  totalLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },

  // ---- Meal Sections ----
  mealSection: {
    marginHorizontal: spacing.base,
    marginTop: spacing.md,
    padding: spacing.base,
    ...shadows.sm,
  },
  mealSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  mealSectionIcon: {
    fontSize: 24,
  },
  mealSectionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  mealItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  mealItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  mealItemContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  mealItemName: {
    flex: 1,
    fontSize: typography.sizes.base,
    color: colors.textPrimary,
    marginRight: spacing.sm,
  },
  mealItemCalories: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
  },
  deleteMealBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.error + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteMealText: {
    fontSize: 20,
    color: colors.error,
    fontWeight: typography.weights.bold,
    marginTop: -2,
  },
  saveTemplateBtn: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  saveTemplateBtnText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.primary,
  },
  noMealsText: {
    fontSize: typography.sizes.sm,
    color: colors.textTertiary,
    textAlign: 'center',
    paddingVertical: spacing.sm,
  },
  addMealBtn: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  addMealBtnText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.primary,
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
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
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
  modalRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  modalHalf: {
    flex: 1,
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
