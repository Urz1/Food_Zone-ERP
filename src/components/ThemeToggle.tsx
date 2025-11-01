import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { borderRadius, shadow } from '../themes/designTokens';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.container, {
        backgroundColor: theme.colors.surface,
        shadowColor: theme.colors.shadow,
        borderColor: theme.colors.border
      }]}
      onPress={toggleTheme}
      activeOpacity={0.7}
    >
      <Text style={styles.icon}>
        {theme.mode === 'light' ? '🌙' : '☀️'}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.round,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadow.sm,
    borderWidth: 1,
  },
  icon: {
    fontSize: 20,
  },
});

export default ThemeToggle;