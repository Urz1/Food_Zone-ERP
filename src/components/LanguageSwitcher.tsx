import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { spacing, borderRadius, fontSize, fontWeight } from '../themes/designTokens';

const LanguageSwitcher = () => {
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();

  const changeLanguage = async (language: string) => {
    await i18n.changeLanguage(language);
    await AsyncStorage.setItem('language', language);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      <TouchableOpacity
        style={[styles.button, i18n.language === 'en' && [styles.activeButton, { backgroundColor: theme.colors.primary }]]}
        onPress={() => changeLanguage('en')}
      >
        <Text style={[styles.buttonText, { color: theme.colors.textSecondary }, i18n.language === 'en' && [styles.activeButtonText, { color: theme.colors.surface }]]}>
          {t('settings.english')}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, i18n.language === 'am' && [styles.activeButton, { backgroundColor: theme.colors.primary }]]}
        onPress={() => changeLanguage('am')}
      >
        <Text style={[styles.buttonText, { color: theme.colors.textSecondary }, i18n.language === 'am' && [styles.activeButtonText, { color: theme.colors.surface }]]}>
          {t('settings.amharic')}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: borderRadius.md,
    padding: spacing.xs,
    borderWidth: 1,
  },
  button: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
  },
  activeButton: {},
  buttonText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  activeButtonText: {},
});

export default LanguageSwitcher;