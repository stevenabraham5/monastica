import React from 'react';
import { Tabs } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '../../constants/colors';
import { fontFamilies } from '../../constants/typography';

export default function TabLayout() {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: colors.border,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          paddingTop: 8,
          height: 52 + (insets.bottom > 0 ? insets.bottom : 8),
        },
        tabBarLabelStyle: {
          fontFamily: fontFamilies.bodyMedium,
          fontSize: 12,
          letterSpacing: 0,
        },
        tabBarActiveTintColor: colors.ink,
        tabBarInactiveTintColor: colors.ink3,
        tabBarIconStyle: { display: 'none' },
        tabBarIndicatorStyle: {
          backgroundColor: colors.accent,
          height: 2,
          borderRadius: 1,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Today',
        }}
      />
      <Tabs.Screen
        name="goals"
        options={{
          title: 'Goals',
        }}
      />
      <Tabs.Screen
        name="reflection"
        options={{
          title: 'Reflection',
        }}
      />
      <Tabs.Screen
        name="agent"
        options={{
          title: 'Agent',
        }}
      />
    </Tabs>
  );
}
