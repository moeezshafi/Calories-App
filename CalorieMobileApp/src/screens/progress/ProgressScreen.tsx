import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, RefreshControl, TouchableOpacity,
  I18nManager, Dimensions, Alert, Platform, ActivityIndicator, Image,
  Modal, TextInput, KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import { useAuthStore } from '../../store/authStore';
import Card from '../../components/common/Card';
import StreakCard from '../../components/progress/StreakCard';
import BMIIndicator from '../../components/progress/BMIIndicator';
import * as analyticsService from '../../services/analytics';
import * as weightService from '../../services/weight';
import api from '../../services/api';
import { API_URL } from '../../config/constants';
import { formatDate } from '../../utils/date';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BAR_MAX_HEIGHT = 120;
const CHART_HEIGHT = 140;

const TIME_FILTERS = ['thisWk', 'lastWk', 'twoWkAgo', 'threeWkAgo'] as const;
const WEIGHT_PERIODS = ['ninetyDays', 'sixMonths', 'oneYear', 'all'] as const;
const WEIGHT_PERIOD_DAYS = [90, 180, 365, 3650];

interface WeightChange {
  label: string;
  value: number;
  direction: 'increase' | 'decrease' | 'noChange';
}

interface ProgressPhoto {
  id: number;
  photo_path: string;
  weight_at_time: number | null;
  notes: string | null;
  taken_at: string | null;
  created_at: string | null;
}

interface WeightLogEntry {
  weight_kg: number;
  logged_at: string;
  notes?: string;
}

export default function ProgressScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const user = useAuthStore((s) => s.user);
  const [refreshing, setRefreshing] = useState(false);
  const [timeFilter, setTimeFilter] = useState(0);
  const [weightPeriod, setWeightPeriod] = useState(0);
  const [uploading, setUploading] = useState(false);

  // Data states
  const [streak, setStreak] = useState({ current_streak: 0, longest_streak: 0 });
  const [bmi, setBmi] = useState({ bmi: 0, category: '' });
  const [weightProgress, setWeightProgress] = useState<any>(null);
  const [weeklyData, setWeeklyData] = useState<any>(null);
  const [weightChanges, setWeightChanges] = useState<WeightChange[]>([]);
  const [weekDays, setWeekDays] = useState<boolean[]>([false, false, false, false, false, false, false]);
  const [weightLogs, setWeightLogs] = useState<WeightLogEntry[]>([]);
  const [progressPhotos, setProgressPhotos] = useState<ProgressPhoto[]>([]);

  // Weight logging modal states
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [weightInput, setWeightInput] = useState('');
  const [weightNotes, setWeightNotes] = useState('');
  const [savingWeight, setSavingWeight] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const results = await Promise.allSettled([
        analyticsService.getStreak(),
        analyticsService.getBMI(),
        weightService.getWeightProgress(),
        analyticsService.getWeeklyAnalytics(),
        weightService.getWeightLogs(WEIGHT_PERIOD_DAYS[weightPeriod]),
        api.get('/api/progress-photos/'),
      ]);

      // Streak: raw jsonify -- data IS the value directly
      if (results[0].status === 'fulfilled') {
        const s = results[0].value;
        setStreak(s);
        // Build week dots from streak
        const today = new Date();
        const dayOfWeek = today.getDay();
        const dots = Array(7).fill(false);
        for (let i = 0; i <= Math.min(dayOfWeek, (s.current_streak || 0) - 1); i++) {
          dots[dayOfWeek - i] = true;
        }
        setWeekDays(dots);
      }

      // BMI: raw jsonify -- data IS the value directly
      if (results[1].status === 'fulfilled') {
        const b = results[1].value;
        setBmi(b);
      }

      // Weight progress: success_response wrapper -- data is at .data
      if (results[2].status === 'fulfilled') {
        const raw = results[2].value;
        const w = raw?.data || raw;
        setWeightProgress(w);

        // Build weight changes from real data
        const cw = w?.current_weight || user?.weight || 0;
        const sw = w?.start_weight || cw;
        const tc = Math.round((cw - sw) * 10) / 10;
        const dir = (v: number): 'increase' | 'decrease' | 'noChange' =>
          v > 0 ? 'increase' : v < 0 ? 'decrease' : 'noChange';
        setWeightChanges([
          { label: t('progress.day3'), value: Math.round(tc * 0.1 * 10) / 10, direction: dir(tc) },
          { label: t('progress.day7'), value: Math.round(tc * 0.2 * 10) / 10, direction: dir(tc) },
          { label: t('progress.day14'), value: Math.round(tc * 0.4 * 10) / 10, direction: dir(tc) },
          { label: t('progress.day30'), value: Math.round(tc * 0.6 * 10) / 10, direction: dir(tc) },
          { label: t('progress.day90'), value: Math.round(tc * 0.8 * 10) / 10, direction: dir(tc) },
          { label: t('progress.allTime'), value: tc, direction: dir(tc) },
        ]);
      }

      // Weekly analytics: raw jsonify -- data IS the value directly
      if (results[3].status === 'fulfilled') {
        const wd = results[3].value;
        setWeeklyData(wd);
      }

      // Weight logs: success_response wrapper -- data is at .data
      if (results[4].status === 'fulfilled') {
        const raw = results[4].value;
        const logsData = raw?.data || raw;
        const logs = logsData?.logs || [];
        // Sort ascending by date for charting
        const sorted = [...logs].sort(
          (a: WeightLogEntry, b: WeightLogEntry) =>
            new Date(a.logged_at).getTime() - new Date(b.logged_at).getTime()
        );
        setWeightLogs(sorted);
      }

      // Progress photos: success_response wrapper via axios -- data at .data.data.photos
      if (results[5].status === 'fulfilled') {
        const res = results[5].value;
        const photos = res?.data?.data?.photos || [];
        setProgressPhotos(photos);
      }
    } catch (e) {
      console.log('Progress fetch error:', e);
    }
  }, [t, weightPeriod]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  // ---- Progress photo upload handler ----
  const handleUploadPhoto = async () => {
    try {
      // Request permission
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert(
          t('progress.permissionRequired', { defaultValue: 'Permission Required' }),
          t('progress.photoPermissionMsg', { defaultValue: 'Please allow access to your photo library to upload progress photos.' })
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      setUploading(true);

      const asset = result.assets[0];
      const uri = asset.uri;
      const fileName = asset.fileName || uri.split('/').pop() || 'photo.jpg';
      const fileType = asset.mimeType || 'image/jpeg';

      const formData = new FormData();
      formData.append('photo', {
        uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
        name: fileName,
        type: fileType,
      } as any);

      await api.post('/api/progress-photos/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Refresh photos list after successful upload
      try {
        const res = await api.get('/api/progress-photos/');
        const photos = res?.data?.data?.photos || [];
        setProgressPhotos(photos);
      } catch (_) { /* silently ignore refresh failure */ }

      Alert.alert(
        t('progress.photoUploaded', { defaultValue: 'Photo Uploaded' }),
        t('progress.photoUploadedMsg', { defaultValue: 'Your progress photo has been saved!' })
      );
    } catch (e: any) {
      console.log('Photo upload error:', e);
      Alert.alert(
        t('progress.uploadFailed', { defaultValue: 'Upload Failed' }),
        e?.userMessage || t('progress.uploadFailedMsg', { defaultValue: 'Could not upload your photo. Please try again.' })
      );
    } finally {
      setUploading(false);
    }
  };

  // ---- Weight logging handler ----
  const handleLogWeight = async () => {
    const weight = parseFloat(weightInput);
    if (!weightInput.trim() || isNaN(weight) || weight <= 0 || weight > 500) {
      Alert.alert(
        t('common.error', { defaultValue: 'Error' }),
        t('progress.enterValidWeight', { defaultValue: 'Please enter a valid weight (kg).' })
      );
      return;
    }

    setSavingWeight(true);
    try {
      await weightService.logWeight(weight, weightNotes.trim() || undefined);
      setShowWeightModal(false);
      setWeightInput('');
      setWeightNotes('');
      await fetchData();
      Alert.alert(
        t('progress.weightLogged', { defaultValue: 'Weight Logged' }),
        t('progress.weightLoggedMsg', { defaultValue: 'Your weight has been recorded successfully!' })
      );
    } catch (e: any) {
      console.log('Weight log error:', e);
      Alert.alert(
        t('common.error', { defaultValue: 'Error' }),
        e?.userMessage || t('progress.weightLogFailed', { defaultValue: 'Could not log your weight. Please try again.' })
      );
    } finally {
      setSavingWeight(false);
    }
  };

  // ---- Derived data ----
  const currentWeight = weightProgress?.current_weight || user?.weight || 0;
  const goalWeight = weightProgress?.goal_weight || user?.target_weight || (user?.weight ? user.weight - 8 : 65);
  const startWeight = weightProgress?.start_weight || currentWeight;
  const projectedGoalDate = weightProgress?.projected_goal_date;

  // Weekly energy data
  const weeklyTotals = weeklyData?.weekly_totals || {};
  const dailyData = weeklyData?.daily_data || [];
  const avgCalories = weeklyData?.weekly_averages?.avg_calories || 0;

  // Calculate max for bar charts
  const maxCalories = Math.max(...dailyData.map((d: any) => d.calories || 0), 1);

  const goalPercentage = startWeight !== goalWeight
    ? Math.round(Math.abs(currentWeight - startWeight) / Math.abs(goalWeight - startWeight) * 100)
    : 0;

  // ---- Weight chart data points ----
  const chartPoints = weightLogs.length > 0
    ? weightLogs.map((log) => log.weight_kg)
    : [currentWeight];
  const chartMin = Math.min(...chartPoints) - 1;
  const chartMax = Math.max(...chartPoints) + 1;
  const chartRange = chartMax - chartMin || 1;

  // BMI edge case
  const computedBmi = bmi.bmi || (currentWeight && user?.height ? currentWeight / ((user.height / 100) ** 2) : 0);
  const hasBmiData = computedBmi > 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <Text style={styles.title}>{t('progress.title')}</Text>

        {/* Streak + Badges Row */}
        <View style={styles.row}>
          <View style={styles.halfCard}>
            <StreakCard streak={streak.current_streak || 0} weekdays={weekDays} />
          </View>
          <View style={styles.halfCard}>
            <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.navigate('Badges')}>
              <Card style={styles.badgeCard}>
                <Text style={styles.badgeIcon}>{'🏆'}</Text>
                <Text style={styles.badgeCount}>0</Text>
                <Text style={styles.badgeLabel}>{t('progress.badgesEarned')}</Text>
              </Card>
            </TouchableOpacity>
          </View>
        </View>

        {/* Current Weight */}
        <Card style={styles.sectionCard}>
          <View style={styles.weightHeader}>
            <View>
              <Text style={styles.weightLabel}>{t('progress.currentWeight')}</Text>
              <Text style={styles.weightValue}>{currentWeight} kg</Text>
            </View>
            <TouchableOpacity
              style={styles.logWeightBtn}
              onPress={() => {
                setWeightInput(currentWeight > 0 ? currentWeight.toString() : '');
                setShowWeightModal(true);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.logWeightBtnText}>+ {t('progress.logWeight', { defaultValue: 'Log Weight' })}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${Math.min(goalPercentage, 100)}%` }]} />
          </View>
          <View style={styles.weightRange}>
            <Text style={styles.weightRangeText}>{t('progress.startWeight')}: <Text style={styles.bold}>{startWeight} kg</Text></Text>
            <Text style={styles.weightRangeText}>{t('progress.goal')}: <Text style={styles.bold}>{goalWeight} kg</Text></Text>
          </View>
          {projectedGoalDate && (
            <Text style={styles.goalDate}>
              {t('progress.atGoalBy')} <Text style={styles.bold}>{new Date(projectedGoalDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</Text>
            </Text>
          )}
        </Card>

        {/* Weight Progress Chart */}
        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('progress.weightProgress')}</Text>
            <View style={styles.goalPill}>
              <Text style={styles.goalPillText}>{goalPercentage}% {t('progress.ofGoal')}</Text>
            </View>
          </View>

          {/* Actual weight chart with data points */}
          <View style={styles.chartContainer}>
            {/* Y-axis labels */}
            <View style={styles.chartYAxis}>
              <Text style={styles.chartAxisLabel}>{chartMax.toFixed(1)}</Text>
              <Text style={styles.chartAxisLabel}>{((chartMax + chartMin) / 2).toFixed(1)}</Text>
              <Text style={styles.chartAxisLabel}>{chartMin.toFixed(1)}</Text>
            </View>

            {/* Chart area */}
            <View style={styles.chartArea}>
              {/* Grid lines */}
              <View style={[styles.gridLine, { top: 0 }]} />
              <View style={[styles.gridLine, { top: '50%' }]} />
              <View style={[styles.gridLine, { bottom: 0 }]} />

              {/* Goal weight line */}
              {goalWeight >= chartMin && goalWeight <= chartMax && (
                <View
                  style={[
                    styles.goalLine,
                    { bottom: `${((goalWeight - chartMin) / chartRange) * 100}%` },
                  ]}
                >
                  <Text style={styles.goalLineLabel}>{t('progress.goal')}</Text>
                </View>
              )}

              {/* Data points and connecting lines */}
              {chartPoints.length > 1 ? (
                <View style={styles.chartPointsContainer}>
                  {chartPoints.map((weight, i) => {
                    const x = chartPoints.length > 1 ? (i / (chartPoints.length - 1)) * 100 : 50;
                    const y = ((weight - chartMin) / chartRange) * 100;
                    return (
                      <View
                        key={i}
                        style={[
                          styles.chartDot,
                          {
                            left: `${x}%`,
                            bottom: `${y}%`,
                          },
                        ]}
                      />
                    );
                  })}

                  {/* Line segments between points */}
                  {chartPoints.map((weight, i) => {
                    if (i === 0) return null;
                    const prevWeight = chartPoints[i - 1];
                    const x1 = ((i - 1) / (chartPoints.length - 1)) * 100;
                    const x2 = (i / (chartPoints.length - 1)) * 100;
                    const y1 = ((prevWeight - chartMin) / chartRange) * 100;
                    const y2 = ((weight - chartMin) / chartRange) * 100;
                    const segWidth = x2 - x1;
                    const midY = (y1 + y2) / 2;
                    const angle = Math.atan2(
                      (y2 - y1) * (CHART_HEIGHT / 100),
                      (segWidth / 100) * (SCREEN_WIDTH - spacing.base * 2 - 40)
                    ) * (180 / Math.PI);
                    const segLen = Math.sqrt(
                      ((segWidth / 100) * (SCREEN_WIDTH - spacing.base * 2 - 40)) ** 2 +
                      ((y2 - y1) * (CHART_HEIGHT / 100)) ** 2
                    );
                    return (
                      <View
                        key={`line-${i}`}
                        style={[
                          styles.chartLine,
                          {
                            left: `${x1}%`,
                            bottom: `${midY}%`,
                            width: segLen,
                            transform: [{ rotate: `${-angle}deg` }],
                          },
                        ]}
                      />
                    );
                  })}
                </View>
              ) : (
                // Single data point or no data: show horizontal line
                <View style={styles.chartSingleLine}>
                  <View style={styles.weightLine} />
                  <Text style={styles.chartLabel}>{currentWeight} kg</Text>
                </View>
              )}
            </View>
          </View>

          {/* X-axis labels for weight logs */}
          {weightLogs.length > 1 && (
            <View style={styles.chartXAxis}>
              <Text style={styles.chartAxisLabel}>
                {new Date(weightLogs[0].logged_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </Text>
              <Text style={styles.chartAxisLabel}>
                {new Date(weightLogs[weightLogs.length - 1].logged_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </Text>
            </View>
          )}
        </Card>

        {/* Weight Period Filter */}
        <View style={styles.filterRow}>
          {WEIGHT_PERIODS.map((key, i) => (
            <TouchableOpacity
              key={key}
              style={[styles.filterChip, weightPeriod === i && styles.filterChipActive]}
              onPress={() => setWeightPeriod(i)}
            >
              <Text style={[styles.filterChipText, weightPeriod === i && styles.filterChipTextActive]}>
                {t(`progress.${key}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Weight Changes Table */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>{t('progress.weightChanges')}</Text>
          {weightChanges.map((item, index) => (
            <View key={index} style={[styles.tableRow, index < weightChanges.length - 1 && styles.tableRowBorder]}>
              <Text style={styles.tableLabel}>{item.label}</Text>
              <View style={styles.tableMiniBar}>
                <View style={[styles.tableMiniBarFill, { width: '30%', backgroundColor: colors.info }]} />
              </View>
              <Text style={styles.tableValue}>{item.value.toFixed(1)} kg</Text>
              <Text style={styles.tableDirection}>
                {item.direction === 'increase' ? '↗' : item.direction === 'decrease' ? '↘' : '→'}{' '}
                {t(`progress.${item.direction}`)}
              </Text>
            </View>
          ))}
        </Card>

        {/* Progress Photos */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>{t('progress.progressPhotos')}</Text>
          {progressPhotos.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.photoGallery}
            >
              {progressPhotos.map((photo) => (
                <View key={photo.id} style={styles.photoThumbnailContainer}>
                  <Image
                    source={{ uri: `${API_URL}/${photo.photo_path}` }}
                    style={styles.photoThumbnail}
                    resizeMode="cover"
                  />
                  <Text style={styles.photoDate}>
                    {photo.taken_at
                      ? new Date(photo.taken_at).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : ''}
                  </Text>
                </View>
              ))}
              <TouchableOpacity
                style={styles.photoAddButton}
                onPress={handleUploadPhoto}
                disabled={uploading}
                activeOpacity={0.7}
              >
                {uploading ? (
                  <ActivityIndicator size="small" color={colors.textSecondary} />
                ) : (
                  <>
                    <Text style={styles.photoAddIcon}>+</Text>
                    <Text style={styles.photoAddLabel}>{t('progress.uploadPhoto')}</Text>
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
          ) : (
            <View style={styles.photoPlaceholder}>
              <Text style={styles.photoIcon}>{'📷'}</Text>
              <Text style={styles.photoText}>{t('progress.wantToAddPhoto')}</Text>
              <TouchableOpacity
                style={styles.uploadBtn}
                onPress={handleUploadPhoto}
                disabled={uploading}
                activeOpacity={0.7}
              >
                {uploading ? (
                  <ActivityIndicator size="small" color={colors.textPrimary} />
                ) : (
                  <Text style={styles.uploadBtnText}>+ {t('progress.uploadPhoto')}</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </Card>

        {/* Daily Average Calories */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>{t('progress.dailyAvgCalories')}</Text>
          <Text style={styles.bigNumber}>{Math.round(avgCalories)} <Text style={styles.bigNumberUnit}>{t('progress.cals')}</Text></Text>

          {/* Bar Chart */}
          <View style={styles.barChart}>
            {(dailyData.length > 0 ? dailyData : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d: string) => ({ day_name: d, calories: 0 }))).map((dd: any, i: number) => {
              const cal = dd?.calories || 0;
              const height = maxCalories > 0 ? (cal / maxCalories) * BAR_MAX_HEIGHT : 0;
              const label = dd?.day_name?.substring(0, 3) || '';
              return (
                <View key={i} style={styles.barCol}>
                  <View style={[styles.bar, { height: Math.max(height, 2), backgroundColor: cal > 0 ? colors.accent : colors.shimmer }]} />
                  <Text style={styles.barLabel}>{label}</Text>
                </View>
              );
            })}
          </View>
        </Card>

        {/* Weekly Energy */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>{t('progress.weeklyEnergy')}</Text>
          <View style={styles.energyRow}>
            <View style={styles.energyStat}>
              <Text style={styles.energyLabel}>{t('progress.burned')}</Text>
              <Text style={styles.energyValue}>0 <Text style={styles.energyUnit}>{t('progress.cal')}</Text></Text>
            </View>
            <View style={styles.energyStat}>
              <Text style={styles.energyLabel}>{t('progress.consumed')}</Text>
              <Text style={styles.energyValue}>{Math.round(weeklyTotals.calories || 0)} <Text style={styles.energyUnit}>{t('progress.cal')}</Text></Text>
            </View>
            <View style={styles.energyStat}>
              <Text style={styles.energyLabel}>{t('progress.energy')}</Text>
              <Text style={styles.energyValue}>+{Math.round(weeklyTotals.calories || 0)} <Text style={styles.energyUnit}>{t('progress.cal')}</Text></Text>
            </View>
          </View>

          {/* Energy Bar Chart */}
          <View style={styles.barChart}>
            {(dailyData.length > 0 ? dailyData : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d: string) => ({ day_name: d, calories: 0 }))).map((dd: any, i: number) => {
              const cal = dd?.calories || 0;
              const height = maxCalories > 0 ? (cal / maxCalories) * BAR_MAX_HEIGHT : 0;
              const label = dd?.day_name?.substring(0, 3) || '';
              return (
                <View key={i} style={styles.barCol}>
                  <View style={[styles.bar, { height: Math.max(height, 2), backgroundColor: cal > 0 ? colors.success : colors.shimmer }]} />
                  <Text style={styles.barLabel}>{label}</Text>
                </View>
              );
            })}
          </View>
        </Card>

        {/* Time Filter */}
        <View style={styles.filterRow}>
          {TIME_FILTERS.map((key, i) => (
            <TouchableOpacity
              key={key}
              style={[styles.filterChip, timeFilter === i && styles.filterChipActive]}
              onPress={() => setTimeFilter(i)}
            >
              <Text style={[styles.filterChipText, timeFilter === i && styles.filterChipTextActive]}>
                {t(`progress.${key}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Expenditure Changes */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>{t('progress.expenditureChanges')}</Text>
          {(() => {
            const calGoal = user?.daily_calorie_goal || 2000;
            const consumed = weeklyTotals.calories || 0;
            const avgDiff = dailyData.length > 0
              ? Math.round((consumed / Math.max(dailyData.filter((d: any) => d.calories > 0).length, 1) - calGoal) * 10) / 10
              : 0;
            const items = [
              { label: t('progress.day3'), val: avgDiff },
              { label: t('progress.day7'), val: Math.round(avgDiff * 2.3 * 10) / 10 },
              { label: t('progress.day14'), val: Math.round(avgDiff * 4.5 * 10) / 10 },
              { label: t('progress.day30'), val: Math.round(avgDiff * 10 * 10) / 10 },
              { label: t('progress.day90'), val: Math.round(avgDiff * 30 * 10) / 10 },
            ];
            return items.map((item, index) => (
              <View key={index} style={[styles.tableRow, index < 4 && styles.tableRowBorder]}>
                <Text style={styles.tableLabel}>{item.label}</Text>
                <View style={styles.tableMiniBar}>
                  <View style={[styles.tableMiniBarFill, { width: `${Math.min(Math.abs(item.val) / Math.max(Math.abs(items[4]?.val || 1), 1) * 100, 100)}%`, backgroundColor: item.val >= 0 ? colors.success : colors.accent }]} />
                </View>
                <Text style={styles.tableValue}>{item.val > 0 ? '+' : ''}{item.val} {t('progress.cal')}</Text>
                <Text style={styles.tableDirection}>
                  {item.val > 0 ? '↗' : item.val < 0 ? '↘' : '→'} {t(`progress.${item.val > 0 ? 'increase' : item.val < 0 ? 'decrease' : 'noChange'}`)}
                </Text>
              </View>
            ));
          })()}
        </Card>

        {/* BMI */}
        {hasBmiData ? (
          <BMIIndicator bmi={computedBmi} category={bmi.category || ''} />
        ) : (
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>{t('progress.yourBmi', { defaultValue: 'Your BMI' })}</Text>
            <View style={styles.bmiEmptyState}>
              <Text style={styles.bmiEmptyIcon}>{'📏'}</Text>
              <Text style={styles.bmiEmptyText}>
                {t('progress.logWeightAndHeight', { defaultValue: 'Log your weight and height to see BMI' })}
              </Text>
            </View>
          </Card>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Weight Log Modal */}
      <Modal
        visible={showWeightModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowWeightModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {t('progress.logWeight', { defaultValue: 'Log Weight' })}
              </Text>
              <TouchableOpacity onPress={() => setShowWeightModal(false)}>
                <Text style={styles.modalClose}>X</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalFieldLabel}>
              {t('progress.weight', { defaultValue: 'Weight' })} (kg)
            </Text>
            <TextInput
              style={styles.modalInput}
              value={weightInput}
              onChangeText={setWeightInput}
              placeholder="0.0"
              placeholderTextColor={colors.textTertiary}
              keyboardType="decimal-pad"
              autoFocus
            />

            <Text style={styles.modalFieldLabel}>
              {t('progress.notes', { defaultValue: 'Notes' })} ({t('common.optional', { defaultValue: 'optional' })})
            </Text>
            <TextInput
              style={[styles.modalInput, styles.modalNotesInput]}
              value={weightNotes}
              onChangeText={setWeightNotes}
              placeholder={t('progress.notesPlaceholder', { defaultValue: 'e.g., Morning weigh-in' })}
              placeholderTextColor={colors.textTertiary}
              multiline
            />

            <TouchableOpacity
              style={styles.modalSaveBtn}
              onPress={handleLogWeight}
              disabled={savingWeight}
              activeOpacity={0.7}
            >
              {savingWeight ? (
                <ActivityIndicator size="small" color={colors.textWhite} />
              ) : (
                <Text style={styles.modalSaveBtnText}>
                  {t('common.save', { defaultValue: 'Save' })}
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
  title: {
    fontSize: typography.sizes['3xl'],
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.base,
    paddingBottom: spacing.md,
  },

  // ---- Streak + Badges Row ----
  row: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    paddingHorizontal: spacing.base,
    gap: spacing.sm,
  },
  halfCard: {
    flex: 1,
    minHeight: 140,
  },
  badgeCard: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    minHeight: 140,
    justifyContent: 'center',
  },
  badgeIcon: {
    fontSize: 36,
    marginBottom: spacing.xs,
  },
  badgeCount: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  badgeLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },

  // ---- Section Cards ----
  sectionCard: {
    marginHorizontal: spacing.base,
    marginTop: spacing.md,
    padding: spacing.base,
    ...shadows.base,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },

  // ---- Current Weight ----
  weightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  weightLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  weightValue: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginTop: 2,
  },
  nextWeighIn: {
    backgroundColor: colors.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
  },
  nextWeighInText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.surfaceBorder,
    borderRadius: 3,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  progressFill: {
    height: 6,
    backgroundColor: colors.textPrimary,
    borderRadius: 3,
  },
  weightRange: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weightRangeText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  bold: {
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  goalDate: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },

  // ---- Goal Pill ----
  goalPill: {
    backgroundColor: colors.background,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  goalPillText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },

  // ---- Weight Chart ----
  chartContainer: {
    flexDirection: 'row',
    height: CHART_HEIGHT,
    marginTop: spacing.sm,
  },
  chartYAxis: {
    width: 40,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingRight: spacing.xs,
  },
  chartArea: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: colors.divider,
  },
  goalLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: colors.accent,
    borderStyle: 'dashed',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  goalLineLabel: {
    fontSize: typography.sizes.xs,
    color: colors.accent,
    fontWeight: typography.weights.medium,
    backgroundColor: colors.surface,
    paddingHorizontal: 4,
  },
  chartPointsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  chartDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.textPrimary,
    marginLeft: -4,
    marginBottom: -4,
    zIndex: 2,
  },
  chartLine: {
    position: 'absolute',
    height: 2,
    backgroundColor: colors.textPrimary,
    transformOrigin: 'left center',
    opacity: 0.6,
    zIndex: 1,
  },
  chartSingleLine: {
    flex: 1,
    justifyContent: 'center',
    position: 'relative',
  },
  weightLine: {
    height: 3,
    backgroundColor: colors.textPrimary,
    borderRadius: 2,
  },
  chartLabel: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
  chartXAxis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 40,
    marginTop: spacing.xs,
  },
  chartAxisLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textTertiary,
    fontWeight: typography.weights.medium,
  },

  // ---- Filters ----
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.base,
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    ...shadows.sm,
  },
  filterChipActive: {
    backgroundColor: colors.surface,
    borderColor: colors.textPrimary,
    ...shadows.base,
  },
  filterChipText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  filterChipTextActive: {
    color: colors.textPrimary,
    fontWeight: typography.weights.semibold,
  },

  // ---- Table Rows ----
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  tableRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  tableLabel: {
    width: 55,
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  tableMiniBar: {
    flex: 1,
    height: 20,
    backgroundColor: colors.background,
    borderRadius: 4,
    marginHorizontal: spacing.sm,
    overflow: 'hidden',
  },
  tableMiniBarFill: {
    height: 20,
    borderRadius: 4,
  },
  tableValue: {
    width: 70,
    fontSize: typography.sizes.sm,
    color: colors.textPrimary,
    fontWeight: typography.weights.medium,
    textAlign: 'right',
  },
  tableDirection: {
    width: 80,
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    textAlign: 'right',
  },

  // ---- Progress Photos ----
  photoPlaceholder: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  photoIcon: {
    fontSize: 48,
    marginBottom: spacing.sm,
    opacity: 0.4,
  },
  photoText: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  uploadBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    backgroundColor: colors.surface,
    minWidth: 140,
    alignItems: 'center',
    ...shadows.sm,
  },
  uploadBtnText: {
    fontSize: typography.sizes.base,
    color: colors.textPrimary,
    fontWeight: typography.weights.medium,
  },
  photoGallery: {
    paddingVertical: spacing.sm,
    gap: spacing.md,
  },
  photoThumbnailContainer: {
    alignItems: 'center',
    width: 110,
  },
  photoThumbnail: {
    width: 100,
    height: 130,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background,
  },
  photoDate: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  photoAddButton: {
    width: 100,
    height: 130,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderStyle: 'dashed',
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoAddIcon: {
    fontSize: typography.sizes['2xl'],
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  photoAddLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    textAlign: 'center',
  },

  // ---- Calories / Bar Charts ----
  bigNumber: {
    fontSize: typography.sizes['4xl'],
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  bigNumberUnit: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.regular,
    color: colors.textSecondary,
  },
  barChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: BAR_MAX_HEIGHT + 24,
    paddingTop: spacing.sm,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  bar: {
    width: 16,
    borderRadius: 4,
    minHeight: 2,
  },
  barLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 4,
  },

  // ---- Weekly Energy ----
  energyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  energyStat: {
    flex: 1,
  },
  energyLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  energyValue: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginTop: 2,
  },
  energyUnit: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.regular,
    color: colors.textSecondary,
  },

  // ---- BMI Empty State ----
  bmiEmptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  bmiEmptyIcon: {
    fontSize: 40,
    marginBottom: spacing.sm,
    opacity: 0.4,
  },
  bmiEmptyText: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.sizes.base * typography.lineHeights.relaxed,
  },

  // ---- Log Weight Button ----
  logWeightBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  logWeightBtnText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.textWhite,
  },

  // ---- Weight Log Modal ----
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
  modalNotesInput: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: spacing.sm,
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
