import React, { useRef, useEffect } from 'react';
import {
  TouchableOpacity,
  Animated,
  StyleSheet,
} from 'react-native';
import { colors } from '../../theme';

interface ToggleProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

const TRACK_WIDTH = 50;
const TRACK_HEIGHT = 30;
const THUMB_SIZE = 26;
const THUMB_OFFSET = 2;

const Toggle: React.FC<ToggleProps> = ({
  value,
  onValueChange,
  disabled = false,
}) => {
  const animValue = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animValue, {
      toValue: value ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [value, animValue]);

  const translateX = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [THUMB_OFFSET, TRACK_WIDTH - THUMB_SIZE - THUMB_OFFSET],
  });

  const trackColor = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.toggleOff, colors.toggleOn],
  });

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => !disabled && onValueChange(!value)}
      disabled={disabled}
    >
      <Animated.View
        style={[
          styles.track,
          { backgroundColor: trackColor },
          disabled && styles.disabled,
        ]}
      >
        <Animated.View
          style={[styles.thumb, { transform: [{ translateX }] }]}
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  track: {
    width: TRACK_WIDTH,
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    justifyContent: 'center',
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: colors.textWhite,
  },
  disabled: {
    opacity: 0.4,
  },
});

export default Toggle;
