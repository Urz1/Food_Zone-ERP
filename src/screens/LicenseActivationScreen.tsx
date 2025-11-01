import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import { useLicense } from '../contexts/LicenseContext';
import { spacing, borderRadius, fontSize, fontWeight, componentStyles, layout } from '../themes/designTokens';

const LicenseActivationScreen = () => {
  const [licenseKey, setLicenseKey] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [isActivating, setIsActivating] = useState(false);
  const { activateLicense } = useLicense();
  const { t } = useTranslation();
  const { theme } = useTheme();

  const handleActivate = async () => {
    if (!licenseKey || !businessName) {
      Alert.alert(t('common.error'), t('license.fillRequiredFields'));
      return;
    }

    setIsActivating(true);

    const success = await activateLicense(licenseKey.trim(), businessName.trim());

    setIsActivating(false);

    if (success) {
      Alert.alert(t('common.success'), t('license.licenseActivated'));
    } else {
      Alert.alert(
        t('license.activationFailed'),
        t('license.invalidLicense')
      );
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.icon, { color: theme.colors.text }]}>🔐</Text>
          <Text style={[styles.title, { color: theme.colors.text }]}>{t('license.title')}</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            {t('license.subtitle')}
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={[styles.label, { color: theme.colors.text }]}>{t('license.businessName')} *</Text>
          <TextInput
            style={[styles.input, {
              backgroundColor: theme.colors.inputBackground,
              borderColor: theme.colors.inputBorder,
              color: theme.colors.text
            }]}
            placeholder={t('license.businessNamePlaceholder')}
            placeholderTextColor={theme.colors.inputPlaceholder}
            value={businessName}
            onChangeText={setBusinessName}
            autoCapitalize="words"
            editable={!isActivating}
          />

          <Text style={[styles.label, { color: theme.colors.text }]}>{t('license.licenseKey')} *</Text>
          <TextInput
            style={[styles.input, styles.licenseInput, {
              backgroundColor: theme.colors.inputBackground,
              borderColor: theme.colors.inputBorder,
              color: theme.colors.text
            }]}
            placeholder={t('license.licenseKeyPlaceholder')}
            placeholderTextColor={theme.colors.inputPlaceholder}
            value={licenseKey}
            onChangeText={setLicenseKey}
            autoCapitalize="characters"
            autoCorrect={false}
            editable={!isActivating}
          />

          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.colors.primary }, isActivating && styles.buttonDisabled]}
            onPress={handleActivate}
            disabled={isActivating}
          >
            {isActivating ? (
              <ActivityIndicator color={theme.colors.surface} />
            ) : (
              <Text style={[styles.buttonText, { color: theme.colors.surface }]}>{t('license.activateLicense')}</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
            {t('license.contactInfo')}
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: layout.screenPadding,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxxl,
  },
  icon: {
    fontSize: fontSize.xxxl,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSize.sm,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  form: {
    marginBottom: spacing.xxxl,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.sm,
  },
  input: {
    ...componentStyles.input,
    marginBottom: spacing.xl,
  },
  licenseInput: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    letterSpacing: 2,
  },
  button: {
    ...componentStyles.button,
    marginTop: spacing.md,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    textAlign: 'center',
    fontSize: fontSize.xs,
    marginBottom: spacing.sm,
  },
});

export default LicenseActivationScreen;
