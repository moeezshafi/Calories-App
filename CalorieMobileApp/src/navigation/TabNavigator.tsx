import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HomeScreen from '../screens/home/HomeScreen';
import ProgressScreen from '../screens/progress/ProgressScreen';
import GroupsScreen from '../screens/groups/GroupsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import { colors, spacing } from '../theme';

const Tab = createBottomTabNavigator();

function CustomTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();
  const nav = useNavigation<any>();

  const tabs = state.routes.filter((r: any) => r.name !== 'AddPlaceholder');

  const getIcon = (name: string, focused: boolean) => {
    const iconMap: Record<string, [string, string]> = {
      Home: ['home', 'home-outline'],
      Progress: ['bar-chart', 'bar-chart-outline'],
      Groups: ['people', 'people-outline'],
      Profile: ['person-circle', 'person-circle-outline'],
    };
    const icons = iconMap[name] || ['ellipse', 'ellipse-outline'];
    return focused ? icons[0] : icons[1];
  };

  return (
    <View style={[styles.tabBar, { paddingBottom: insets.bottom || 8 }]}>
      {tabs.map((route: any, index: number) => {
        const isFocused = state.index === state.routes.indexOf(route);
        const onPress = () => {
          if (!isFocused) navigation.navigate(route.name);
        };

        // Insert FAB after Progress tab (index 1)
        const elements = [];
        elements.push(
          <TouchableOpacity key={route.key} style={styles.tabItem} onPress={onPress}>
            <View style={[styles.iconContainer, isFocused && styles.iconContainerActive]}>
              <Ionicons
                name={getIcon(route.name, isFocused) as any}
                size={24}
                color={isFocused ? colors.textWhite : colors.tabInactive}
              />
            </View>
          </TouchableOpacity>
        );

        if (index === 1) {
          elements.push(
            <TouchableOpacity
              key="fab"
              style={styles.fab}
              onPress={() => nav.navigate('LogFood')}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={28} color={colors.textWhite} />
            </TouchableOpacity>
          );
        }

        return elements;
      })}
    </View>
  );
}

export default function TabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Progress" component={ProgressScreen} />
      <Tab.Screen name="AddPlaceholder" component={View} />
      <Tab.Screen name="Groups" component={GroupsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.tabBackground,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorder,
    paddingTop: 8,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainerActive: {
    backgroundColor: colors.tabActive,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.fabBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
      android: { elevation: 8 },
    }),
  },
});
