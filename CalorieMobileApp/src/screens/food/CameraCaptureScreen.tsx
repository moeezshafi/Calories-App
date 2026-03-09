import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { colors, typography, spacing, borderRadius } from '../../theme';
import LoadingOverlay from '../../components/common/LoadingOverlay';
import { useAppStore } from '../../store/appStore';
import * as foodService from '../../services/food';

export default function CameraCaptureScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const language = useAppStore((s) => s.language);

  const [permission, requestPermission] = useCameraPermissions();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);

  const analyzeImage = async (uri: string) => {
    setIsAnalyzing(true);
    try {
      const result = await foodService.analyzeFoodImage(uri, language);
      const analysis = result?.data || result;

      if (analysis && analysis.is_food !== false) {
        navigation.replace('NutritionDetail', {
          analysis,
          imageUri: uri,
          fromScan: true,
        });
      } else {
        Alert.alert(
          t('camera.notFood', { defaultValue: 'Not Food' }),
          t('camera.notFoodDesc', { defaultValue: 'This does not appear to be food. Please try again.' }),
          [{ text: t('common.ok', { defaultValue: 'OK' }) }],
        );
      }
    } catch (err: any) {
      const msg = err?.userMessage || err?.response?.data?.message || err?.response?.data?.error;
      Alert.alert(
        t('common.error', { defaultValue: 'Error' }),
        msg || t('camera.analyzeError', { defaultValue: 'Failed to analyze the image. Please try again.' }),
        [{ text: t('common.ok', { defaultValue: 'OK' }) }],
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCapture = async () => {
    if (!cameraRef.current || isAnalyzing) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
      });
      if (photo?.uri) {
        analyzeImage(photo.uri);
      }
    } catch {
      Alert.alert(
        t('common.error', { defaultValue: 'Error' }),
        t('camera.captureError', { defaultValue: 'Failed to capture photo.' }),
      );
    }
  };

  const handlePickGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        analyzeImage(result.assets[0].uri);
      }
    } catch {
      Alert.alert(
        t('common.error', { defaultValue: 'Error' }),
        t('camera.galleryError', { defaultValue: 'Failed to open gallery.' }),
      );
    }
  };

  // Permission not yet determined
  if (!permission) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>
            {t('camera.loading', { defaultValue: 'Loading camera...' })}
          </Text>
        </View>
      </View>
    );
  }

  // Permission denied
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <Ionicons name="camera-outline" size={48} color={colors.textTertiary} />
          <Text style={styles.permissionTitle}>
            {t('camera.permissionTitle', { defaultValue: 'Camera Access Required' })}
          </Text>
          <Text style={styles.permissionText}>
            {t('camera.permissionDesc', { defaultValue: 'Cal AI needs camera access to scan your food.' })}
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestPermission}
            activeOpacity={0.7}
          >
            <Text style={styles.permissionButtonText}>
              {t('camera.grantAccess', { defaultValue: 'Grant Access' })}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.backLink}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Text style={styles.backLinkText}>
              {t('common.goBack', { defaultValue: 'Go Back' })}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LoadingOverlay
        visible={isAnalyzing}
        message={t('camera.analyzing', { defaultValue: 'Analyzing your food...' })}
      />

      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="back"
      />

      {/* Overlay rendered as sibling with absolute positioning */}
      <View style={styles.overlay} pointerEvents="box-none">
        {/* Top bar with close button */}
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.closeButton}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={28} color={colors.textWhite} />
          </TouchableOpacity>
        </View>

        {/* Center viewfinder guide */}
        <View style={styles.viewfinderContainer}>
          <View style={styles.viewfinder}>
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
          </View>
          <Text style={styles.hintText}>
            {t('camera.hint', { defaultValue: 'Point camera at your food' })}
          </Text>
        </View>

        {/* Bottom controls */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.galleryButton}
            onPress={handlePickGallery}
            activeOpacity={0.7}
          >
            <Ionicons name="images-outline" size={26} color={colors.textWhite} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.captureButton}
            onPress={handleCapture}
            activeOpacity={0.7}
            disabled={isAnalyzing}
          >
            <View style={styles.captureInner} />
          </TouchableOpacity>

          <View style={styles.galleryButton} />
        </View>
      </View>
    </View>
  );
}

const CORNER_SIZE = 24;
const CORNER_WIDTH = 3;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  topBar: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: spacing.base,
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewfinderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewfinder: {
    width: 260,
    height: 260,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: CORNER_WIDTH,
    borderLeftWidth: CORNER_WIDTH,
    borderColor: colors.textWhite,
    borderTopLeftRadius: 8,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: CORNER_WIDTH,
    borderRightWidth: CORNER_WIDTH,
    borderColor: colors.textWhite,
    borderTopRightRadius: 8,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: CORNER_WIDTH,
    borderLeftWidth: CORNER_WIDTH,
    borderColor: colors.textWhite,
    borderBottomLeftRadius: 8,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: CORNER_WIDTH,
    borderRightWidth: CORNER_WIDTH,
    borderColor: colors.textWhite,
    borderBottomRightRadius: 8,
  },
  hintText: {
    marginTop: spacing.lg,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.textWhite,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: Platform.OS === 'ios' ? 50 : 32,
    paddingHorizontal: spacing['2xl'],
  },
  galleryButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButton: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: colors.textWhite,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureInner: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: colors.textWhite,
  },
  // Permission screens
  permissionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing['2xl'],
    backgroundColor: colors.surface,
  },
  permissionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.sizes.base * typography.lineHeights.relaxed,
  },
  permissionButton: {
    marginTop: spacing.xl,
    height: 52,
    paddingHorizontal: spacing['2xl'],
    borderRadius: borderRadius.base,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  permissionButtonText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.textWhite,
  },
  backLink: {
    marginTop: spacing.base,
    padding: spacing.sm,
  },
  backLinkText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
  },
});
