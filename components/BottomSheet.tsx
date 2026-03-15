import React, { forwardRef, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import GorhomBottomSheet, {
  BottomSheetBackdrop,
  BottomSheetProps as GorhomProps,
} from '@gorhom/bottom-sheet';
import { BlurView } from 'expo-blur';
import { useColors } from '../constants/colors';

interface BottomSheetProps {
  children: React.ReactNode;
  snapPoints?: (string | number)[];
  onClose?: () => void;
}

export const BottomSheet = forwardRef<GorhomBottomSheet, BottomSheetProps>(
  function BottomSheet({ children, snapPoints = ['50%', '95%'], onClose }, ref) {
    const colors = useColors();

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.4}
        />
      ),
      [],
    );

    return (
      <GorhomBottomSheet
        ref={ref}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        onClose={onClose}
        backdropComponent={renderBackdrop}
        backgroundStyle={[
          styles.background,
          { backgroundColor: colors.ground },
        ]}
        handleIndicatorStyle={{ backgroundColor: colors.borderMid }}
      >
        {children}
      </GorhomBottomSheet>
    );
  },
);

const styles = StyleSheet.create({
  background: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
});
