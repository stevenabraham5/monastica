import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { typeScale, TypographyVariant } from '../constants/typography';
import { useColors } from '../constants/colors';

interface TempoTextProps extends TextProps {
  variant?: TypographyVariant;
  color?: string;
  italic?: boolean;
}

export function TempoText({
  variant = 'body',
  color,
  italic,
  style,
  children,
  ...rest
}: TempoTextProps) {
  const colors = useColors();
  const scale = typeScale[variant];

  return (
    <Text
      style={[
        scale,
        { color: color ?? colors.ink },
        italic && styles.italic,
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  italic: {
    fontStyle: 'italic',
  },
});
