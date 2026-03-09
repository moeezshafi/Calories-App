import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  Alert,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { colors, typography, spacing, borderRadius } from '../../theme';
import NutritionCard from '../../components/nutrition/NutritionCard';
import DetailedNutritionCard from '../../components/nutrition/DetailedNutritionCard';
import PaginationDots from '../../components/common/PaginationDots';
import LoadingOverlay from '../../components/common/LoadingOverlay';
import * as foodService from '../../services/food';
import { FoodAnalysis } from '../../types/food';
import { MainStackParamList } from '../../types/navigation';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_HEIGHT = 280;

type NutritionDetailRouteProp = RouteProp<MainStackParamList, 'NutritionDetail'>;

export default function NutritionDetailScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const route = useRoute<NutritionDetailRouteProp>();

  const analysis: FoodAnalysis = route.params?.analysis || {
    labels: [],
    food_name: 'Unknown Food',
    breakdown: [],
    total_calories: 0,
    total_protein: 0,
    total_carbs: 0,
    total_fats: 0,
    fiber: 0,
    sugar: 0,
    sodium: 0,
    health_score: 5,
    health_score_reasons: [],
    ingredients: [],
    serving_count: 1,
    confidence: 0,
    is_food: true,
  };
  const imageUri = route.params?.imageUri;

  const [servingCount, setServingCount] = useState(analysis.serving_count || 1);
  const [activeNutritionPage, setActiveNutritionPage] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  const [isLogging, setIsLogging] = useState(false);
  const pagerRef = useRef<FlatList>(null);

  const multiplier = servingCount / (analysis.serving_count || 1);
  const scaledCalories = Math.round(analysis.total_calories * multiplier);
  const scaledProtein = Math.round(analysis.total_protein * multiplier);
  const scaledCarbs = Math.round(analysis.total_carbs * multiplier);
  const scaledFats = Math.round(analysis.total_fats * multiplier);
  const scaledFiber = Math.round(analysis.fiber * multiplier);
  const scaledSugar = Math.round(analysis.sugar * multiplier);
  const scaledSodium = Math.round(analysis.sodium * multiplier);

  const adjustServing = (delta: number) => {
    const newCount = Math.max(0.5, servingCount + delta);
    setServingCount(Math.round(newCount * 10) / 10);
  };

  const handleDone = async () => {
    setIsLogging(true);
    try {
      await foodService.logFood({
        food_name: analysis.food_name,
        calories: scaledCalories,
        proteins: scaledProtein,
        carbs: scaledCarbs,
        fats: scaledFats,
        fiber: scaledFiber,
        sodium: scaledSodium,
        sugars: scaledSugar,
        serving_size: 1,
        servings_consumed: servingCount,
        meal_type: (analysis as any).meal_type || 'snack',
        image_path: imageUri,
      });
      navigation.navigate('MainTabs');
    } catch {
      Alert.alert(
        t('common.error', { defaultValue: 'Error' }),
        t('food.logError', { defaultValue: 'Failed to log food. Please try again.' }),
      );
    } finally {
      setIsLogging(false);
    }
  };

  const handleBookmark = async () => {
    setIsBookmarked(!isBookmarked);
    if (!isBookmarked) {
      try {
        await foodService.saveFood({
          food_name: analysis.food_name,
          calories: analysis.total_calories,
          proteins: analysis.total_protein,
          carbs: analysis.total_carbs,
          fats: analysis.total_fats,
          fiber: analysis.fiber,
          sodium: analysis.sodium,
          sugars: analysis.sugar,
          health_score: analysis.health_score,
        });
      } catch {
        // Silently fail bookmark
      }
    }
  };

  const nutritionPages = [
    { key: 'macros' },
    { key: 'detailed' },
  ];

  const handlePageScroll = (event: any) => {
    const pageIndex = Math.round(event.nativeEvent.contentOffset.x / (SCREEN_WIDTH - spacing.base * 2));
    setActiveNutritionPage(pageIndex);
  };

  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <View style={styles.container}>
      <LoadingOverlay visible={isLogging} message={t('food.logging', { defaultValue: 'Logging food...' })} />

      {/* Food Image or Gradient Header */}
      {imageUri ? (
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUri }} style={styles.foodImage} resizeMode="cover" />
          <View style={styles.imageOverlay} />
        </View>
      ) : (
        <View style={styles.gradientHeader}>
          <View style={styles.foodIconCircle}>
            <Ionicons name="restaurant-outline" size={40} color={colors.textWhite} />
          </View>
        </View>
      )}

      {/* Header overlay */}
      <SafeAreaView style={styles.headerOverlay} edges={['top']}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerButton}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color={colors.textWhite} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {t('nutrition.title', { defaultValue: 'Nutrition' })}
        </Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton} activeOpacity={0.7}>
            <Ionicons name="share-outline" size={22} color={colors.textWhite} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} activeOpacity={0.7}>
            <Ionicons name="ellipsis-horizontal" size={22} color={colors.textWhite} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Bottom Sheet Card */}
      <ScrollView
        style={styles.sheetContainer}
        contentContainerStyle={styles.sheetContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Bookmark + Timestamp */}
        <View style={styles.topRow}>
          <TouchableOpacity onPress={handleBookmark} activeOpacity={0.7}>
            <Ionicons
              name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
              size={22}
              color={isBookmarked ? colors.primary : colors.textTertiary}
            />
          </TouchableOpacity>
          <Text style={styles.timestamp}>{timestamp}</Text>
        </View>

        {/* Food Name + Serving Editor */}
        <Text style={styles.foodName}>{analysis.food_name}</Text>
        <View style={styles.servingRow}>
          <TouchableOpacity
            style={styles.servingButton}
            onPress={() => adjustServing(-0.5)}
            activeOpacity={0.7}
          >
            <Ionicons name="remove" size={18} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.servingText}>
            {servingCount} {servingCount === 1
              ? t('nutrition.serving', { defaultValue: 'serving' })
              : t('nutrition.servings', { defaultValue: 'servings' })}
          </Text>
          <TouchableOpacity
            style={styles.servingButton}
            onPress={() => adjustServing(0.5)}
            activeOpacity={0.7}
          >
            <Ionicons name="add" size={18} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Pager - Nutrition Cards */}
        <FlatList
          ref={pagerRef}
          data={nutritionPages}
          keyExtractor={(item) => item.key}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handlePageScroll}
          snapToInterval={SCREEN_WIDTH - spacing.base * 2}
          decelerationRate="fast"
          renderItem={({ item }) => (
            <View style={{ width: SCREEN_WIDTH - spacing.base * 2 }}>
              {item.key === 'macros' ? (
                <NutritionCard
                  calories={scaledCalories}
                  protein={scaledProtein}
                  carbs={scaledCarbs}
                  fats={scaledFats}
                />
              ) : (
                <DetailedNutritionCard
                  fiber={scaledFiber}
                  sugar={scaledSugar}
                  sodium={scaledSodium}
                  healthScore={analysis.health_score}
                />
              )}
            </View>
          )}
        />

        {/* Pagination Dots */}
        <View style={styles.dotsWrapper}>
          <PaginationDots count={2} activeIndex={activeNutritionPage} />
        </View>

        {/* Ingredients Section */}
        {analysis.ingredients && analysis.ingredients.length > 0 && (
          <View style={styles.ingredientsSection}>
            <Text style={styles.ingredientsTitle}>
              {t('nutrition.ingredients', { defaultValue: 'Ingredients' })}
            </Text>
            {analysis.ingredients.map((ingredient, index) => (
              <View key={index} style={styles.ingredientRow}>
                <View style={styles.ingredientDot} />
                <Text style={styles.ingredientText}>{ingredient}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Feedback Row */}
        <View style={styles.feedbackSection}>
          <Text style={styles.feedbackLabel}>
            {t('nutrition.feedback', { defaultValue: 'How did Cal AI do?' })}
          </Text>
          <View style={styles.feedbackButtons}>
            <TouchableOpacity
              style={[
                styles.feedbackButton,
                feedback === 'up' && styles.feedbackButtonActive,
              ]}
              onPress={() => setFeedback(feedback === 'up' ? null : 'up')}
              activeOpacity={0.7}
            >
              <Ionicons
                name={feedback === 'up' ? 'thumbs-up' : 'thumbs-up-outline'}
                size={20}
                color={feedback === 'up' ? colors.success : colors.textTertiary}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.feedbackButton,
                feedback === 'down' && styles.feedbackButtonActive,
              ]}
              onPress={() => setFeedback(feedback === 'down' ? null : 'down')}
              activeOpacity={0.7}
            >
              <Ionicons
                name={feedback === 'down' ? 'thumbs-down' : 'thumbs-down-outline'}
                size={20}
                color={feedback === 'down' ? colors.error : colors.textTertiary}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Buttons */}
        <View style={styles.bottomButtons}>
          <TouchableOpacity
            style={styles.fixButton}
            onPress={() => {
              Alert.alert(
                t('nutrition.fixIssue', { defaultValue: 'Fix Issue' }),
                t('nutrition.fixIssueDesc', { defaultValue: 'Report an issue with the nutrition analysis.' }),
              );
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.fixButtonText}>
              {t('nutrition.fixIssue', { defaultValue: 'Fix Issue' })}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.doneButton}
            onPress={handleDone}
            activeOpacity={0.7}
          >
            <Text style={styles.doneButtonText}>
              {t('common.done', { defaultValue: 'Done' })}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  imageContainer: {
    width: '100%',
    height: IMAGE_HEIGHT,
    position: 'absolute',
    top: 0,
  },
  foodImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  gradientHeader: {
    width: '100%',
    height: IMAGE_HEIGHT,
    position: 'absolute',
    top: 0,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  foodIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.textWhite,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  sheetContainer: {
    flex: 1,
    marginTop: IMAGE_HEIGHT - 24,
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
  },
  sheetContent: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.lg,
    paddingBottom: spacing['3xl'],
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  timestamp: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textTertiary,
  },
  foodName: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  servingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: spacing.lg,
    backgroundColor: colors.background,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
  },
  servingButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  servingText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginHorizontal: spacing.base,
  },
  dotsWrapper: {
    paddingVertical: spacing.md,
  },
  ingredientsSection: {
    marginTop: spacing.base,
    paddingTop: spacing.base,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  ingredientsTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  ingredientDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.textTertiary,
    marginRight: spacing.sm,
  },
  ingredientText: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
    flex: 1,
  },
  feedbackSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    paddingTop: spacing.base,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  feedbackLabel: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
  },
  feedbackButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  feedbackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedbackButtonActive: {
    backgroundColor: colors.divider,
  },
  bottomButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  fixButton: {
    flex: 1,
    height: 52,
    borderRadius: borderRadius.base,
    borderWidth: 1.5,
    borderColor: colors.surfaceBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fixButtonText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  doneButton: {
    flex: 1,
    height: 52,
    borderRadius: borderRadius.base,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneButtonText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.textWhite,
  },
});
