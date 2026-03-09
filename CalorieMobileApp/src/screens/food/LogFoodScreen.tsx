import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, typography, spacing, borderRadius } from '../../theme';
import FoodSearchItem from '../../components/food/FoodSearchItem';
import FoodTabBar from '../../components/food/FoodTabBar';
import SearchBar from '../../components/common/SearchBar';
import { MEAL_TYPES } from '../../config/constants';
import * as foodService from '../../services/food';

const TABS = ['All', 'My foods', 'My meals', 'Saved foods'];

interface SuggestionItem {
  id?: number;
  food_name: string;
  calories: number;
  proteins?: number;
  carbs?: number;
  fats?: number;
  serving_size?: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
}

export default function LogFoodScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();

  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [savedFoods, setSavedFoods] = useState<SuggestionItem[]>([]);
  const [myFoods, setMyFoods] = useState<SuggestionItem[]>([]);
  const [searchResults, setSearchResults] = useState<SuggestionItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);

  // Manual entry state
  const [manualName, setManualName] = useState('');
  const [manualCalories, setManualCalories] = useState('');
  const [manualProtein, setManualProtein] = useState('');
  const [manualCarbs, setManualCarbs] = useState('');
  const [manualFats, setManualFats] = useState('');
  const [manualMealType, setManualMealType] = useState<string>(MEAL_TYPES[0]);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    loadSuggestions();
    loadSavedFoods();
    loadMyFoods();
  }, []);

  const loadSuggestions = async () => {
    try {
      const data = await foodService.getSuggestions();
      // API returns: { success, data: { suggestions: [{name, calories, ...}] } }
      const rawItems = data?.data?.suggestions || data?.suggestions || (Array.isArray(data) ? data : []);
      // Map `name` → `food_name` for items that use `name` field
      const items = rawItems.map((item: any) => ({
        ...item,
        food_name: item.food_name || item.name,
      }));
      setSuggestions(items);
    } catch {
      setSuggestions([
        { food_name: 'Banana', calories: 105, proteins: 1.3, carbs: 27, fats: 0.4, serving_size: 1 },
        { food_name: 'Chicken Breast', calories: 165, proteins: 31, carbs: 0, fats: 3.6, serving_size: 100 },
        { food_name: 'Rice (1 cup)', calories: 206, proteins: 4.3, carbs: 45, fats: 0.4, serving_size: 1 },
        { food_name: 'Egg', calories: 78, proteins: 6, carbs: 0.6, fats: 5, serving_size: 1 },
        { food_name: 'Apple', calories: 95, proteins: 0.5, carbs: 25, fats: 0.3, serving_size: 1 },
        { food_name: 'Greek Yogurt', calories: 100, proteins: 17, carbs: 6, fats: 0.7, serving_size: 1 },
        { food_name: 'Oatmeal (1 cup)', calories: 154, proteins: 5, carbs: 27, fats: 2.6, serving_size: 1 },
        { food_name: 'Salmon', calories: 208, proteins: 20, carbs: 0, fats: 13, serving_size: 100 },
      ]);
    }
  };

  const loadSavedFoods = async () => {
    try {
      const data = await foodService.getSavedFoods();
      const rawItems = data?.data || data?.foods || (Array.isArray(data) ? data : []);
      const items = rawItems.map((item: any) => ({
        ...item,
        food_name: item.food_name || item.name,
      }));
      setSavedFoods(items);
    } catch {
      setSavedFoods([]);
    }
  };

  const loadMyFoods = async () => {
    try {
      const data = await foodService.getFoodLogs();
      const rawItems = data?.data?.logs || data?.logs || (Array.isArray(data) ? data : []);
      const items = rawItems.map((item: any) => ({
        ...item,
        food_name: item.food_name || item.name,
        calories: item.calories || item.total_calories || 0,
        proteins: item.proteins || item.total_protein || 0,
        carbs: item.carbs || item.total_carbs || 0,
        fats: item.fats || item.total_fats || 0,
      }));
      setMyFoods(items);
    } catch {
      setMyFoods([]);
    }
  };

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await foodService.searchFood(query);
        // API returns: { success, data: { query, result: {food_name, calories_per_100g, ...} } }
        const result = data?.data?.result || data?.result;
        let items: SuggestionItem[] = [];
        if (result && typeof result === 'object' && !Array.isArray(result)) {
          // Single result object — convert to array with proper field mapping
          items = [{
            food_name: result.food_name || query,
            calories: result.calories || result.calories_per_100g || 0,
            proteins: result.proteins || result.proteins_per_100g || 0,
            carbs: result.carbs || result.carbs_per_100g || 0,
            fats: result.fats || result.fats_per_100g || 0,
            fiber: result.fiber || result.fiber_per_100g || 0,
            sugar: result.sugar || result.sugar_per_100g || 0,
          }];
        } else if (Array.isArray(result)) {
          items = result;
        } else if (Array.isArray(data)) {
          items = data;
        }
        setSearchResults(items);
      } catch {
        setSearchResults([]);
      }
      setIsSearching(false);
    }, 400);
  }, []);

  const handleAddFood = (item: SuggestionItem) => {
    navigation.navigate('NutritionDetail', {
      analysis: {
        food_name: item.food_name,
        total_calories: item.calories,
        total_protein: item.proteins || 0,
        total_carbs: item.carbs || 0,
        total_fats: item.fats || 0,
        fiber: item.fiber || 0,
        sugar: item.sugar || 0,
        sodium: item.sodium || 0,
        health_score: 7,
        health_score_reasons: [],
        ingredients: [],
        serving_count: 1,
        confidence: 1,
        is_food: true,
        labels: [item.food_name],
        breakdown: [{ name: item.food_name, calories: item.calories }],
      },
    });
  };

  const handleManualSubmit = () => {
    if (!manualName.trim()) {
      Alert.alert(t('common.error', { defaultValue: 'Error' }), t('food.enterName', { defaultValue: 'Please enter a food name.' }));
      return;
    }
    if (!manualCalories.trim() || isNaN(Number(manualCalories))) {
      Alert.alert(t('common.error', { defaultValue: 'Error' }), t('food.enterCalories', { defaultValue: 'Please enter valid calories.' }));
      return;
    }

    const analysis = {
      food_name: manualName.trim(),
      total_calories: Number(manualCalories),
      total_protein: Number(manualProtein) || 0,
      total_carbs: Number(manualCarbs) || 0,
      total_fats: Number(manualFats) || 0,
      fiber: 0,
      sugar: 0,
      sodium: 0,
      health_score: 5,
      health_score_reasons: [],
      ingredients: [],
      serving_count: 1,
      confidence: 1,
      is_food: true,
      labels: [manualName.trim()],
      breakdown: [{ name: manualName.trim(), calories: Number(manualCalories) }],
      meal_type: manualMealType,
    };

    setShowManualModal(false);
    resetManualForm();
    navigation.navigate('NutritionDetail', { analysis });
  };

  const resetManualForm = () => {
    setManualName('');
    setManualCalories('');
    setManualProtein('');
    setManualCarbs('');
    setManualFats('');
    setManualMealType(MEAL_TYPES[0]);
  };

  const getTabData = (): SuggestionItem[] => {
    switch (activeTab) {
      case 'My foods':
        return myFoods;
      case 'My meals':
        return [];
      case 'Saved foods':
        return savedFoods;
      case 'All':
      default:
        return suggestions;
    }
  };

  const displayList = (() => {
    if (activeTab === 'My meals') return [];
    const tabData = getTabData();
    if (!searchQuery.trim()) return tabData;
    // When searching within a tab, filter locally for non-All tabs
    if (activeTab !== 'All') {
      const query = searchQuery.trim().toLowerCase();
      return tabData.filter((item) =>
        item.food_name?.toLowerCase().includes(query)
      );
    }
    // "All" tab uses the API search results
    return searchResults;
  })();

  const sectionTitle = (() => {
    switch (activeTab) {
      case 'My foods':
        return t('food.myFoods', { defaultValue: 'My Foods' });
      case 'My meals':
        return t('food.myMeals', { defaultValue: 'My Meals' });
      case 'Saved foods':
        return t('food.savedFoods', { defaultValue: 'Saved Foods' });
      case 'All':
      default:
        return t('food.suggestions', { defaultValue: 'Suggestions' });
    }
  })();

  const renderFoodItem = ({ item }: { item: SuggestionItem }) => (
    <FoodSearchItem
      name={item.food_name}
      calories={item.calories}
      serving={item.serving_size ? `${item.serving_size} serving` : '1 serving'}
      onAdd={() => handleAddFood(item)}
    />
  );

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
          {t('food.logFood', { defaultValue: 'Log Food' })}
        </Text>
        <View style={styles.headerRight} />
      </View>

      {/* Tab Bar */}
      <FoodTabBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tabs={TABS}
      />

      {/* Search Bar */}
      <View style={styles.searchWrapper}>
        <SearchBar
          value={searchQuery}
          onChangeText={handleSearch}
          placeholder={t('food.describeFood', { defaultValue: 'Describe what you ate' })}
        />
      </View>

      {/* Section Header */}
      {!searchQuery.trim() && activeTab !== 'My meals' && (
        <Text style={styles.sectionTitle}>
          {sectionTitle}
        </Text>
      )}

      {/* Food List */}
      <FlatList
        data={displayList}
        keyExtractor={(item, index) => `${item.food_name}-${index}`}
        renderItem={renderFoodItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            {activeTab === 'My meals' ? (
              <Text style={styles.emptyText}>
                {t('food.comingSoon', { defaultValue: 'Coming soon' })}
              </Text>
            ) : isSearching ? (
              <Text style={styles.emptyText}>
                {t('common.searching', { defaultValue: 'Searching...' })}
              </Text>
            ) : searchQuery.trim() ? (
              <Text style={styles.emptyText}>
                {t('food.noResults', { defaultValue: 'No results found' })}
              </Text>
            ) : null}
          </View>
        }
      />

      {/* Bottom Action Buttons */}
      <View style={styles.bottomRow}>
        <TouchableOpacity
          style={styles.outlinedButton}
          onPress={() => setShowManualModal(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="create-outline" size={18} color={colors.primary} style={styles.buttonIcon} />
          <Text style={styles.outlinedButtonText}>
            {t('food.manualAdd', { defaultValue: 'Manual Add' })}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.outlinedButton}
          onPress={() => navigation.navigate('CameraCapture')}
          activeOpacity={0.7}
        >
          <Ionicons name="camera-outline" size={18} color={colors.primary} style={styles.buttonIcon} />
          <Text style={styles.outlinedButtonText}>
            {t('food.scanFood', { defaultValue: 'Scan Food' })}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Manual Add Modal */}
      <Modal
        visible={showManualModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowManualModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {t('food.manualEntry', { defaultValue: 'Manual Entry' })}
              </Text>
              <TouchableOpacity onPress={() => { setShowManualModal(false); resetManualForm(); }}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.fieldLabel}>
                {t('food.foodName', { defaultValue: 'Food Name' })}
              </Text>
              <TextInput
                style={styles.fieldInput}
                value={manualName}
                onChangeText={setManualName}
                placeholder={t('food.foodNamePlaceholder', { defaultValue: 'e.g., Grilled Chicken' })}
                placeholderTextColor={colors.textTertiary}
              />

              <Text style={styles.fieldLabel}>
                {t('nutrition.calories', { defaultValue: 'Calories' })}
              </Text>
              <TextInput
                style={styles.fieldInput}
                value={manualCalories}
                onChangeText={setManualCalories}
                placeholder="0"
                placeholderTextColor={colors.textTertiary}
                keyboardType="numeric"
              />

              <Text style={styles.fieldLabel}>
                {t('nutrition.protein', { defaultValue: 'Protein' })} (g)
              </Text>
              <TextInput
                style={styles.fieldInput}
                value={manualProtein}
                onChangeText={setManualProtein}
                placeholder="0"
                placeholderTextColor={colors.textTertiary}
                keyboardType="numeric"
              />

              <Text style={styles.fieldLabel}>
                {t('nutrition.carbs', { defaultValue: 'Carbs' })} (g)
              </Text>
              <TextInput
                style={styles.fieldInput}
                value={manualCarbs}
                onChangeText={setManualCarbs}
                placeholder="0"
                placeholderTextColor={colors.textTertiary}
                keyboardType="numeric"
              />

              <Text style={styles.fieldLabel}>
                {t('nutrition.fats', { defaultValue: 'Fats' })} (g)
              </Text>
              <TextInput
                style={styles.fieldInput}
                value={manualFats}
                onChangeText={setManualFats}
                placeholder="0"
                placeholderTextColor={colors.textTertiary}
                keyboardType="numeric"
              />

              <Text style={styles.fieldLabel}>
                {t('food.mealType', { defaultValue: 'Meal Type' })}
              </Text>
              <View style={styles.mealTypeRow}>
                {MEAL_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.mealTypeChip,
                      manualMealType === type && styles.mealTypeChipActive,
                    ]}
                    onPress={() => setManualMealType(type)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.mealTypeText,
                        manualMealType === type && styles.mealTypeTextActive,
                      ]}
                    >
                      {t(`food.${type}`, { defaultValue: type.charAt(0).toUpperCase() + type.slice(1) })}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleManualSubmit}
                activeOpacity={0.7}
              >
                <Text style={styles.submitButtonText}>
                  {t('food.addFood', { defaultValue: 'Add Food' })}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    paddingHorizontal: spacing.base,
    backgroundColor: colors.surface,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  headerRight: {
    width: 40,
  },
  searchWrapper: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  listContent: {
    paddingBottom: spacing.base,
  },
  emptyContainer: {
    paddingVertical: spacing['3xl'],
    alignItems: 'center',
  },
  emptyText: {
    fontSize: typography.sizes.base,
    color: colors.textTertiary,
  },
  bottomRow: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.base,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    backgroundColor: colors.surface,
  },
  outlinedButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: borderRadius.base,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  buttonIcon: {
    marginRight: spacing.sm,
  },
  outlinedButtonText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.primary,
  },
  // Modal styles
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
    maxHeight: '85%',
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
  fieldLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  fieldInput: {
    height: 48,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.base,
    fontSize: typography.sizes.base,
    color: colors.textPrimary,
  },
  mealTypeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  mealTypeChip: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
    borderColor: colors.surfaceBorder,
    backgroundColor: colors.surface,
  },
  mealTypeChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  mealTypeText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
  },
  mealTypeTextActive: {
    color: colors.textWhite,
  },
  submitButton: {
    height: 52,
    borderRadius: borderRadius.base,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  submitButtonText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.textWhite,
  },
});
