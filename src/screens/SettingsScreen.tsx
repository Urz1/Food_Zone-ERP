import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import AppHeader from '../components/AppHeader';
import { spacing, borderRadius, fontSize, fontWeight, componentStyles, layout } from '../themes/designTokens';

const SettingsScreen = () => {
  const { user, updateCredentials, logout } = useAuth();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newUsername, setNewUsername] = useState(user?.username || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingCredentials, setIsChangingCredentials] = useState(false);

  const handleUpdateCredentials = async () => {
    if (!user) return;

    // Validate current password
    if (currentPassword !== user.password) {
      Alert.alert(t('common.error'), t('settings.currentPasswordIncorrect', { defaultValue: 'Current password is incorrect' }));
      return;
    }

    // Validate new username
    if (!newUsername.trim()) {
      Alert.alert(t('common.error'), t('settings.usernameRequired', { defaultValue: 'Username is required' }));
      return;
    }

    // Validate new password
    if (!newPassword) {
      Alert.alert(t('common.error'), t('settings.passwordRequired', { defaultValue: 'New password is required' }));
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert(t('common.error'), t('settings.passwordTooShort', { defaultValue: 'Password must be at least 6 characters long' }));
      return;
    }

    // Validate password confirmation
    if (newPassword !== confirmPassword) {
      Alert.alert(t('common.error'), t('settings.passwordMismatch', { defaultValue: 'Passwords do not match' }));
      return;
    }

    setIsChangingCredentials(true);
    try {
      const success = await updateCredentials(newUsername.trim(), newPassword);
      if (success) {
        Alert.alert(
          t('common.success'),
          t('settings.credentialsUpdated', { defaultValue: 'Credentials updated successfully' }),
          [
            {
              text: 'OK',
              onPress: () => {
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
              }
            }
          ]
        );
      } else {
        Alert.alert(t('common.error'), t('settings.updateFailed', { defaultValue: 'Failed to update credentials' }));
      }
    } catch (error) {
      Alert.alert(t('common.error'), t('settings.updateFailed', { defaultValue: 'Failed to update credentials' }));
    } finally {
      setIsChangingCredentials(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      t('settings.logout', { defaultValue: 'Logout' }),
      t('settings.logoutConfirm', { defaultValue: 'Are you sure you want to logout?' }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('settings.logout', { defaultValue: 'Logout' }),
          style: 'destructive',
          onPress: logout
        }
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <AppHeader title={t('navigation.settings', { defaultValue: 'Settings' })} />

      <ScrollView style={styles.content}>
        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {t('settings.accountSettings', { defaultValue: 'Account Settings' })}
          </Text>

          <Text style={[styles.label, { color: theme.colors.text }]}>
            {t('settings.currentUsername', { defaultValue: 'Current Username' })}
          </Text>
          <Text style={[styles.currentValue, { color: theme.colors.textSecondary }]}>
            {user?.username}
          </Text>

          <Text style={[styles.label, { color: theme.colors.text }]}>
            {t('settings.currentPassword', { defaultValue: 'Current Password' })} *
          </Text>
          <TextInput
            style={[styles.input, {
              backgroundColor: theme.colors.inputBackground,
              borderColor: theme.colors.inputBorder,
              color: theme.colors.text
            }]}
            placeholder={t('settings.enterCurrentPassword', { defaultValue: 'Enter current password' })}
            placeholderTextColor={theme.colors.inputPlaceholder}
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry
          />

          <Text style={[styles.label, { color: theme.colors.text }]}>
            {t('settings.newUsername', { defaultValue: 'New Username' })} *
          </Text>
          <TextInput
            style={[styles.input, {
              backgroundColor: theme.colors.inputBackground,
              borderColor: theme.colors.inputBorder,
              color: theme.colors.text
            }]}
            placeholder={t('settings.enterNewUsername', { defaultValue: 'Enter new username' })}
            placeholderTextColor={theme.colors.inputPlaceholder}
            value={newUsername}
            onChangeText={setNewUsername}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={[styles.label, { color: theme.colors.text }]}>
            {t('settings.newPassword', { defaultValue: 'New Password' })} *
          </Text>
          <TextInput
            style={[styles.input, {
              backgroundColor: theme.colors.inputBackground,
              borderColor: theme.colors.inputBorder,
              color: theme.colors.text
            }]}
            placeholder={t('settings.enterNewPassword', { defaultValue: 'Enter new password (min 6 characters)' })}
            placeholderTextColor={theme.colors.inputPlaceholder}
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
          />

          <Text style={[styles.label, { color: theme.colors.text }]}>
            {t('settings.confirmPassword', { defaultValue: 'Confirm New Password' })} *
          </Text>
          <TextInput
            style={[styles.input, {
              backgroundColor: theme.colors.inputBackground,
              borderColor: theme.colors.inputBorder,
              color: theme.colors.text
            }]}
            placeholder={t('settings.confirmNewPassword', { defaultValue: 'Confirm new password' })}
            placeholderTextColor={theme.colors.inputPlaceholder}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={[
              styles.updateButton,
              { backgroundColor: theme.colors.primary },
              isChangingCredentials && styles.buttonDisabled
            ]}
            onPress={handleUpdateCredentials}
            disabled={isChangingCredentials}
          >
            <Text style={[styles.updateButtonText, { color: theme.colors.surface }]}>
              {isChangingCredentials
                ? t('common.updating', { defaultValue: 'Updating...' })
                : t('settings.updateCredentials', { defaultValue: 'Update Credentials' })
              }
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {t('settings.accountActions', { defaultValue: 'Account Actions' })}
          </Text>

          <TouchableOpacity
            style={[styles.logoutButton, { backgroundColor: theme.colors.error }]}
            onPress={handleLogout}
          >
            <Text style={[styles.logoutButtonText, { color: theme.colors.surface }]}>
              {t('settings.logout', { defaultValue: 'Logout' })}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: layout.screenPadding,
  },
  section: {
    ...componentStyles.card,
    marginBottom: layout.sectionSpacing,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  currentValue: {
    fontSize: fontSize.md,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
  },
  input: {
    ...componentStyles.input,
    marginBottom: spacing.sm,
  },
  updateButton: {
    ...componentStyles.button,
    marginTop: spacing.lg,
  },
  updateButtonText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  logoutButton: {
    ...componentStyles.button,
  },
  logoutButtonText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
});

export default SettingsScreen;