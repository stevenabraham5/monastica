import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import {
  PlayfairDisplay_400Regular_Italic,
  PlayfairDisplay_700Bold,
  PlayfairDisplay_700Bold_Italic,
} from '@expo-google-fonts/playfair-display';
import {
  DMSans_300Light,
  DMSans_400Regular,
  DMSans_500Medium,
} from '@expo-google-fonts/dm-sans';
import {
  JetBrainsMono_400Regular,
  JetBrainsMono_500Medium,
} from '@expo-google-fonts/jetbrains-mono';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  runOnJS,
} from 'react-native-reanimated';
import { useColors } from '../constants/colors';
import { TEMPO_EASING } from '../constants/motion';
import { typeScale } from '../constants/typography';
import { QuickCapture } from '../components/QuickCapture';
import { useAuthStore } from '../store/authStore';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colors = useColors();
  const { initialize, hasCompletedWelcome, loading: authLoading } = useAuthStore();

  useEffect(() => {
    initialize();
  }, []);

  const [fontsLoaded] = useFonts({
    PlayfairDisplay_700Bold,
    PlayfairDisplay_400Regular_Italic,
    PlayfairDisplay_700Bold_Italic,
    DMSans_300Light,
    DMSans_400Regular,
    DMSans_500Medium,
    JetBrainsMono_400Regular,
    JetBrainsMono_500Medium,
  });

  const [splashDone, setSplashDone] = useState(false);

  // Splash animation values
  const splashOpacity = useSharedValue(0);
  const splashScale = useSharedValue(1);
  const appOpacity = useSharedValue(0);

  const finishSplash = useCallback(() => {
    setSplashDone(true);
  }, []);

  useEffect(() => {
    if (!fontsLoaded) return;

    SplashScreen.hideAsync();

    // Phase 1: fade in "Tempo" — 600ms
    splashOpacity.value = withTiming(1, {
      duration: 600,
      easing: TEMPO_EASING,
    });

    // Phase 2: hold 600ms, then fade out + scale down — 400ms
    splashOpacity.value = withDelay(
      1000,
      withTiming(0, { duration: 400, easing: TEMPO_EASING }),
    );
    splashScale.value = withDelay(
      1000,
      withTiming(0.85, {
        duration: 400,
        easing: TEMPO_EASING,
      }),
    );

    // Phase 3: bring in the app
    appOpacity.value = withDelay(
      1400,
      withTiming(1, {
        duration: 300,
        easing: TEMPO_EASING,
      }),
    );

    // Mark splash done after total animation
    const timer = setTimeout(() => {
      finishSplash();
    }, 1700);

    return () => clearTimeout(timer);
  }, [fontsLoaded]);

  const splashStyle = useAnimatedStyle(() => ({
    opacity: splashOpacity.value,
    transform: [{ scale: splashScale.value }],
  }));

  const appStyle = useAnimatedStyle(() => ({
    opacity: appOpacity.value,
  }));

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={styles.root}>
      {/* App content */}
      <Animated.View style={[styles.root, appStyle]}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.ground },
            animation: 'fade',
          }}
        >
          {!hasCompletedWelcome && !authLoading ? (
            <Stack.Screen name="welcome" options={{ headerShown: false }} />
          ) : (
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          )}
        </Stack>
      </Animated.View>

      {/* Quick capture — available on all screens */}
      {splashDone && <QuickCapture />}

      {/* Splash overlay */}
      {!splashDone && (
        <Animated.View
          style={[
            styles.splashOverlay,
            { backgroundColor: colors.ground },
            splashStyle,
          ]}
          pointerEvents="none"
        >
          <Animated.Text
            style={[
              typeScale['display-xl'],
              { color: colors.ink },
            ]}
          >
            Tempo
          </Animated.Text>
        </Animated.View>
      )}
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  splashOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
