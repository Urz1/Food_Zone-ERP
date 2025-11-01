import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { spacing, borderRadius, fontSize, fontWeight, componentStyles, layout } from '../themes/designTokens';

const LoginScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const { t } = useTranslation();
  const { theme } = useTheme();

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert(t('common.error'), t('auth.loginRequired'));
      return;
    }

    const success = await login(username, password);
    if (!success) {
      Alert.alert(t('common.error'), t('auth.loginError'));
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.colors.text }]}>{t('app.name')}</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>{t('auth.ownerLogin')}</Text>

        <TextInput
          style={[styles.input, {
            backgroundColor: theme.colors.inputBackground,
            borderColor: theme.colors.inputBorder,
            color: theme.colors.text
          }]}
          placeholder={t('auth.username')}
          placeholderTextColor={theme.colors.inputPlaceholder}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TextInput
          style={[styles.input, {
            backgroundColor: theme.colors.inputBackground,
            borderColor: theme.colors.inputBorder,
            color: theme.colors.text
          }]}
          placeholder={t('auth.password')}
          placeholderTextColor={theme.colors.inputPlaceholder}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={[styles.button, { backgroundColor: theme.colors.primary }]} onPress={handleLogin}>
          <Text style={[styles.buttonText, { color: theme.colors.surface }]}>{t('auth.login')}</Text>
        </TouchableOpacity>

        <Text style={[styles.hint, { color: theme.colors.textTertiary }]}>{t('auth.defaultCredentials')}</Text>
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
  title: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSize.lg,
    textAlign: 'center',
    marginBottom: spacing.xxxl,
  },
  input: {
    ...componentStyles.input,
    marginBottom: spacing.lg,
  },
  button: {
    ...componentStyles.button,
    marginTop: spacing.sm,
  },
  buttonText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  hint: {
    textAlign: 'center',
    marginTop: spacing.lg,
    fontSize: fontSize.xs,
  },
});

export default LoginScreen;
