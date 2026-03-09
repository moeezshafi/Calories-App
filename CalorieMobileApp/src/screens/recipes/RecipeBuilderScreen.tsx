import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, RefreshControl, TouchableOpacity,
  Alert, ActivityIndicator, Modal, TextInput, KeyboardAvoidingView, Platform,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import Card from '../../components/common/Card';
import api from '../../services/api';
import * as recipesService from '../../services/recipes';

interface Ingredient {
  food_name: string;
  amount_g: number;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

interface Recipe {
  id: number;
  name: string;
  servings: number;
  ingredients: Ingredient[];
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fats: number;
  created_at?: string;
}

export default function RecipeBuilderScreen() {
  const { t } = useTranslation();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  // Editor modal state
  const [showEditor, setShowEditor] = useState(false);
  const [editingRecipeId, setEditingRecipeId] = useState<number | null>(null);
  const [recipeName, setRecipeName] = useState('');
  const [servings, setServings] = useState('1');
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [saving, setSaving] = useState(false);

  // Ingredient input state
  const [showIngredientForm, setShowIngredientForm] = useState(false);
  const [ingName, setIngName] = useState('');
  const [ingAmount, setIngAmount] = useState('');
  const [ingCalories, setIngCalories] = useState('');
  const [ingProtein, setIngProtein] = useState('');
  const [ingCarbs, setIngCarbs] = useState('');
  const [ingFats, setIngFats] = useState('');

  const fetchRecipes = useCallback(async () => {
    try {
      const res = await api.get('/api/recipes/');
      const data = res?.data?.data?.recipes || res?.data?.recipes || res?.data || [];
      setRecipes(Array.isArray(data) ? data : []);
    } catch (e) {
      console.log('Recipes fetch error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRecipes(); }, [fetchRecipes]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRecipes();
    setRefreshing(false);
  };

  const openEditor = (recipe?: Recipe) => {
    if (recipe) {
      setEditingRecipeId(recipe.id);
      setRecipeName(recipe.name);
      setServings(recipe.servings.toString());
      setIngredients(recipe.ingredients || []);
    } else {
      setEditingRecipeId(null);
      setRecipeName('');
      setServings('1');
      setIngredients([]);
    }
    setShowIngredientForm(false);
    setShowEditor(true);
  };

  const resetIngredientForm = () => {
    setIngName('');
    setIngAmount('');
    setIngCalories('');
    setIngProtein('');
    setIngCarbs('');
    setIngFats('');
  };

  const handleAddIngredient = () => {
    if (!ingName.trim()) {
      Alert.alert(
        t('common.error', { defaultValue: 'Error' }),
        t('recipes.enterIngredientName', { defaultValue: 'Please enter an ingredient name.' }),
      );
      return;
    }

    const amount = parseFloat(ingAmount) || 0;
    const calories = parseFloat(ingCalories) || 0;
    const protein = parseFloat(ingProtein) || 0;
    const carbs = parseFloat(ingCarbs) || 0;
    const fats = parseFloat(ingFats) || 0;

    setIngredients((prev) => [
      ...prev,
      { food_name: ingName.trim(), amount_g: amount, calories, protein, carbs, fats },
    ]);
    resetIngredientForm();
    setShowIngredientForm(false);
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveRecipe = async () => {
    if (!recipeName.trim()) {
      Alert.alert(
        t('common.error', { defaultValue: 'Error' }),
        t('recipes.enterRecipeName', { defaultValue: 'Please enter a recipe name.' }),
      );
      return;
    }

    if (ingredients.length === 0) {
      Alert.alert(
        t('common.error', { defaultValue: 'Error' }),
        t('recipes.addAtLeastOne', { defaultValue: 'Please add at least one ingredient.' }),
      );
      return;
    }

    const servingsNum = parseInt(servings, 10) || 1;

    setSaving(true);
    try {
      if (editingRecipeId) {
        await recipesService.updateRecipe(editingRecipeId, {
          name: recipeName.trim(),
          servings: servingsNum,
          ingredients,
        });
      } else {
        await recipesService.createRecipe({
          name: recipeName.trim(),
          servings: servingsNum,
          ingredients,
        });
      }
      setShowEditor(false);
      await fetchRecipes();
    } catch (e: any) {
      console.log('Recipe save error:', e);
      Alert.alert(
        t('common.error', { defaultValue: 'Error' }),
        e?.userMessage || t('recipes.saveFailed', { defaultValue: 'Could not save recipe. Please try again.' }),
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRecipe = (recipeId: number, recipeName: string) => {
    Alert.alert(
      t('recipes.deleteRecipe', { defaultValue: 'Delete Recipe' }),
      t('recipes.deleteRecipeConfirm', { defaultValue: `Delete "${recipeName}"? This cannot be undone.` }),
      [
        { text: t('common.cancel', { defaultValue: 'Cancel' }), style: 'cancel' },
        {
          text: t('common.delete', { defaultValue: 'Delete' }),
          style: 'destructive',
          onPress: async () => {
            try {
              await recipesService.deleteRecipe(recipeId);
              await fetchRecipes();
            } catch (e: any) {
              Alert.alert(
                t('common.error', { defaultValue: 'Error' }),
                e?.userMessage || t('recipes.deleteFailed', { defaultValue: 'Could not delete recipe.' }),
              );
            }
          },
        },
      ],
    );
  };

  // Calculated totals for editor
  const editorTotals = ingredients.reduce(
    (acc, ing) => ({
      calories: acc.calories + ing.calories,
      protein: acc.protein + ing.protein,
      carbs: acc.carbs + ing.carbs,
      fats: acc.fats + ing.fats,
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0 },
  );
  const servingsNum = parseInt(servings, 10) || 1;
  const perServing = {
    calories: Math.round(editorTotals.calories / servingsNum),
    protein: Math.round(editorTotals.protein / servingsNum * 10) / 10,
    carbs: Math.round(editorTotals.carbs / servingsNum * 10) / 10,
    fats: Math.round(editorTotals.fats / servingsNum * 10) / 10,
  };

  const getRecipeCaloriesPerServing = (recipe: Recipe): number => {
    const total = recipe.total_calories
      || recipe.ingredients?.reduce((sum, ing) => sum + (ing.calories || 0), 0)
      || 0;
    return Math.round(total / (recipe.servings || 1));
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <Text style={styles.title}>
          {t('recipes.title', { defaultValue: 'Recipes' })}
        </Text>

        {/* Recipe List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : recipes.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>{'\uD83D\uDCD6'}</Text>
            <Text style={styles.emptyText}>
              {t('recipes.noRecipes', { defaultValue: 'No recipes yet.\nCreate your first recipe below!' })}
            </Text>
          </Card>
        ) : (
          recipes.map((recipe) => {
            const calPerServing = getRecipeCaloriesPerServing(recipe);
            const ingredientCount = recipe.ingredients?.length || 0;
            return (
              <Card key={recipe.id} style={styles.recipeCard}>
                <TouchableOpacity
                  style={styles.recipeHeader}
                  onPress={() => openEditor(recipe)}
                  activeOpacity={0.7}
                >
                  <View style={styles.recipeIconContainer}>
                    <Text style={styles.recipeIcon}>{'\uD83D\uDCD6'}</Text>
                  </View>
                  <View style={styles.recipeInfo}>
                    <Text style={styles.recipeName} numberOfLines={1}>{recipe.name}</Text>
                    <Text style={styles.recipeMeta}>
                      {calPerServing} {t('recipes.calPerServing', { defaultValue: 'cal/serving' })}
                      {'  \u00B7  '}
                      {ingredientCount} {t('recipes.ingredients', { defaultValue: 'ingredients' })}
                    </Text>
                  </View>
                </TouchableOpacity>
                <View style={styles.recipeActions}>
                  <TouchableOpacity
                    style={styles.recipeActionBtn}
                    onPress={() => openEditor(recipe)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.recipeActionText}>
                      ✏️ {t('common.edit', { defaultValue: 'Edit' })}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.recipeActionBtn, styles.recipeDeleteBtn]}
                    onPress={() => handleDeleteRecipe(recipe.id, recipe.name)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.recipeActionText, styles.recipeDeleteText]}>
                      🗑️ {t('common.delete', { defaultValue: 'Delete' })}
                    </Text>
                  </TouchableOpacity>
                </View>
              </Card>
            );
          })
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Create Recipe FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={openEditor}
        activeOpacity={0.8}
      >
        <Text style={styles.fabIcon}>+</Text>
        <Text style={styles.fabText}>
          {t('recipes.createRecipe', { defaultValue: 'Create Recipe' })}
        </Text>
      </TouchableOpacity>

      {/* Recipe Editor Modal */}
      <Modal
        visible={showEditor}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowEditor(false)}
      >
        <SafeAreaView style={styles.editorContainer} edges={['top', 'bottom']}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{ flex: 1 }}
          >
            {/* Editor Header */}
            <View style={styles.editorHeader}>
              <TouchableOpacity onPress={() => setShowEditor(false)}>
                <Text style={styles.editorCancel}>
                  {t('common.cancel', { defaultValue: 'Cancel' })}
                </Text>
              </TouchableOpacity>
              <Text style={styles.editorTitle}>
                {editingRecipeId 
                  ? t('recipes.editRecipe', { defaultValue: 'Edit Recipe' })
                  : t('recipes.newRecipe', { defaultValue: 'New Recipe' })}
              </Text>
              <View style={{ width: 60 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.editorScroll}>
              {/* Recipe Name */}
              <Text style={styles.editorFieldLabel}>
                {t('recipes.recipeName', { defaultValue: 'Recipe Name' })}
              </Text>
              <TextInput
                style={styles.editorInput}
                value={recipeName}
                onChangeText={setRecipeName}
                placeholder={t('recipes.recipeNamePlaceholder', { defaultValue: 'e.g., Protein Smoothie' })}
                placeholderTextColor={colors.textTertiary}
              />

              {/* Servings */}
              <Text style={styles.editorFieldLabel}>
                {t('recipes.servings', { defaultValue: 'Servings' })}
              </Text>
              <TextInput
                style={styles.editorInput}
                value={servings}
                onChangeText={setServings}
                placeholder="1"
                placeholderTextColor={colors.textTertiary}
                keyboardType="number-pad"
              />

              {/* Ingredients List */}
              <View style={styles.ingredientsHeader}>
                <Text style={styles.editorSectionTitle}>
                  {t('recipes.ingredientsList', { defaultValue: 'Ingredients' })} ({ingredients.length})
                </Text>
              </View>

              {ingredients.map((ing, index) => (
                <View key={index} style={styles.ingredientRow}>
                  <View style={styles.ingredientInfo}>
                    <Text style={styles.ingredientName} numberOfLines={1}>{ing.food_name}</Text>
                    <Text style={styles.ingredientMeta}>
                      {ing.amount_g}g  \u00B7  {ing.calories} cal  \u00B7  P:{ing.protein}g  C:{ing.carbs}g  F:{ing.fats}g
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleRemoveIngredient(index)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Text style={styles.removeBtn}>X</Text>
                  </TouchableOpacity>
                </View>
              ))}

              {/* Add Ingredient Form */}
              {showIngredientForm ? (
                <Card style={styles.ingredientForm}>
                  <Text style={styles.ingredientFormTitle}>
                    {t('recipes.addIngredient', { defaultValue: 'Add Ingredient' })}
                  </Text>

                  <TextInput
                    style={styles.editorInput}
                    value={ingName}
                    onChangeText={setIngName}
                    placeholder={t('recipes.ingredientName', { defaultValue: 'Ingredient name' })}
                    placeholderTextColor={colors.textTertiary}
                    autoFocus
                  />

                  <View style={styles.editorRow}>
                    <View style={styles.editorThird}>
                      <Text style={styles.editorSmallLabel}>
                        {t('recipes.amount', { defaultValue: 'Amount' })} (g)
                      </Text>
                      <TextInput
                        style={styles.editorInput}
                        value={ingAmount}
                        onChangeText={setIngAmount}
                        placeholder="0"
                        placeholderTextColor={colors.textTertiary}
                        keyboardType="decimal-pad"
                      />
                    </View>
                    <View style={styles.editorThird}>
                      <Text style={styles.editorSmallLabel}>
                        {t('recipes.caloriesShort', { defaultValue: 'Cal' })}
                      </Text>
                      <TextInput
                        style={styles.editorInput}
                        value={ingCalories}
                        onChangeText={setIngCalories}
                        placeholder="0"
                        placeholderTextColor={colors.textTertiary}
                        keyboardType="decimal-pad"
                      />
                    </View>
                    <View style={styles.editorThird}>
                      <Text style={styles.editorSmallLabel}>
                        {t('recipes.proteinShort', { defaultValue: 'Protein' })} (g)
                      </Text>
                      <TextInput
                        style={styles.editorInput}
                        value={ingProtein}
                        onChangeText={setIngProtein}
                        placeholder="0"
                        placeholderTextColor={colors.textTertiary}
                        keyboardType="decimal-pad"
                      />
                    </View>
                  </View>

                  <View style={styles.editorRow}>
                    <View style={styles.editorHalf}>
                      <Text style={styles.editorSmallLabel}>
                        {t('recipes.carbsShort', { defaultValue: 'Carbs' })} (g)
                      </Text>
                      <TextInput
                        style={styles.editorInput}
                        value={ingCarbs}
                        onChangeText={setIngCarbs}
                        placeholder="0"
                        placeholderTextColor={colors.textTertiary}
                        keyboardType="decimal-pad"
                      />
                    </View>
                    <View style={styles.editorHalf}>
                      <Text style={styles.editorSmallLabel}>
                        {t('recipes.fatsShort', { defaultValue: 'Fats' })} (g)
                      </Text>
                      <TextInput
                        style={styles.editorInput}
                        value={ingFats}
                        onChangeText={setIngFats}
                        placeholder="0"
                        placeholderTextColor={colors.textTertiary}
                        keyboardType="decimal-pad"
                      />
                    </View>
                  </View>

                  <View style={styles.ingredientFormActions}>
                    <TouchableOpacity
                      style={styles.ingredientCancelBtn}
                      onPress={() => { resetIngredientForm(); setShowIngredientForm(false); }}
                    >
                      <Text style={styles.ingredientCancelText}>
                        {t('common.cancel', { defaultValue: 'Cancel' })}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.ingredientAddBtn}
                      onPress={handleAddIngredient}
                    >
                      <Text style={styles.ingredientAddText}>
                        {t('recipes.add', { defaultValue: 'Add' })}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </Card>
              ) : (
                <TouchableOpacity
                  style={styles.addIngredientBtn}
                  onPress={() => setShowIngredientForm(true)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.addIngredientBtnText}>
                    + {t('recipes.addIngredient', { defaultValue: 'Add Ingredient' })}
                  </Text>
                </TouchableOpacity>
              )}

              {/* Per-Serving Totals */}
              {ingredients.length > 0 && (
                <Card style={styles.totalsCard}>
                  <Text style={styles.totalsTitle}>
                    {t('recipes.perServing', { defaultValue: 'Per Serving' })}
                  </Text>
                  <View style={styles.totalsRow}>
                    <View style={styles.totalItem}>
                      <Text style={styles.totalValue}>{perServing.calories}</Text>
                      <Text style={styles.totalLabel}>
                        {t('recipes.caloriesShort', { defaultValue: 'Cal' })}
                      </Text>
                    </View>
                    <View style={styles.totalItem}>
                      <Text style={[styles.totalValue, { color: colors.protein }]}>
                        {perServing.protein}g
                      </Text>
                      <Text style={styles.totalLabel}>
                        {t('recipes.proteinShort', { defaultValue: 'Protein' })}
                      </Text>
                    </View>
                    <View style={styles.totalItem}>
                      <Text style={[styles.totalValue, { color: colors.carbs }]}>
                        {perServing.carbs}g
                      </Text>
                      <Text style={styles.totalLabel}>
                        {t('recipes.carbsShort', { defaultValue: 'Carbs' })}
                      </Text>
                    </View>
                    <View style={styles.totalItem}>
                      <Text style={[styles.totalValue, { color: colors.fats }]}>
                        {perServing.fats}g
                      </Text>
                      <Text style={styles.totalLabel}>
                        {t('recipes.fatsShort', { defaultValue: 'Fats' })}
                      </Text>
                    </View>
                  </View>
                </Card>
              )}

              <View style={{ height: spacing['3xl'] }} />
            </ScrollView>

            {/* Save Button */}
            <View style={styles.editorFooter}>
              <TouchableOpacity
                style={styles.saveRecipeBtn}
                onPress={handleSaveRecipe}
                disabled={saving}
                activeOpacity={0.7}
              >
                {saving ? (
                  <ActivityIndicator size="small" color={colors.textWhite} />
                ) : (
                  <Text style={styles.saveRecipeBtnText}>
                    {t('recipes.saveRecipe', { defaultValue: 'Save Recipe' })}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
  },
  title: {
    fontSize: typography.sizes['3xl'],
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.base,
    paddingBottom: spacing.md,
  },

  // ---- Recipe List ----
  recipeCard: {
    marginHorizontal: spacing.base,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  recipeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recipeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.base,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  recipeIcon: {
    fontSize: 24,
  },
  recipeInfo: {
    flex: 1,
  },
  recipeName: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  recipeMeta: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  recipeActions: {
    flexDirection: 'row',
    marginTop: spacing.md,
    gap: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  recipeActionBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
  },
  recipeDeleteBtn: {
    backgroundColor: colors.error + '15',
  },
  recipeActionText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.primary,
  },
  recipeDeleteText: {
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

  // ---- FAB ----
  fab: {
    position: 'absolute',
    bottom: spacing['3xl'],
    left: spacing.base,
    right: spacing.base,
    height: 52,
    borderRadius: borderRadius.base,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    ...shadows.md,
  },
  fabIcon: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textWhite,
  },
  fabText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.textWhite,
  },

  // ---- Editor ----
  editorContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  editorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    backgroundColor: colors.surface,
  },
  editorCancel: {
    fontSize: typography.sizes.base,
    color: colors.primary,
    fontWeight: typography.weights.medium,
  },
  editorTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  editorScroll: {
    flex: 1,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.base,
  },
  editorFieldLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  editorInput: {
    height: 48,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.base,
    fontSize: typography.sizes.base,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  editorRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  editorThird: {
    flex: 1,
  },
  editorHalf: {
    flex: 1,
  },
  editorSmallLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  editorSectionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },

  // ---- Ingredients ----
  ingredientsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  ingredientInfo: {
    flex: 1,
  },
  ingredientName: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
  },
  ingredientMeta: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  removeBtn: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.error,
    padding: spacing.xs,
  },
  addIngredientBtn: {
    paddingVertical: spacing.md,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderStyle: 'dashed',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  addIngredientBtnText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.primary,
  },

  // ---- Ingredient Form ----
  ingredientForm: {
    marginTop: spacing.sm,
    padding: spacing.base,
    ...shadows.sm,
  },
  ingredientFormTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  ingredientFormActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  ingredientCancelBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  ingredientCancelText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
  },
  ingredientAddBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primary,
  },
  ingredientAddText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.textWhite,
  },

  // ---- Per-Serving Totals ----
  totalsCard: {
    marginTop: spacing.lg,
    ...shadows.base,
  },
  totalsTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    textAlign: 'center',
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

  // ---- Editor Footer ----
  editorFooter: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    backgroundColor: colors.surface,
  },
  saveRecipeBtn: {
    height: 52,
    borderRadius: borderRadius.base,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveRecipeBtnText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.textWhite,
  },
});
