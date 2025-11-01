import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeToggle from './ThemeToggle';
import { spacing, borderRadius, fontSize, fontWeight, componentStyles } from '../themes/designTokens';

interface AppHeaderProps {
  title?: string;
  showUserInfo?: boolean;
}

const AppHeader: React.FC<AppHeaderProps> = ({ title, showUserInfo = false }) => {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const { theme } = useTheme();

  const handleLogout = () => {
    // You can add a confirmation dialog here if needed
    logout();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
      <View style={styles.leftSection}>
        {showUserInfo && user && (
          <View>
            <Text style={[styles.greeting, { color: theme.colors.text }]}>
              {t('dashboard.greeting', { name: user.name })}
            </Text>
            {title && (
              <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                {title}
              </Text>
            )}
          </View>
        )}
        {!showUserInfo && title && (
          <Text style={[styles.title, { color: theme.colors.text }]}>
            {title}
          </Text>
        )}
      </View>

      <View style={styles.rightSection}>
        <ThemeToggle />
        <View style={styles.rightSectionItem}>
          <LanguageSwitcher />
        </View>
        {showUserInfo && (
          <View style={styles.rightSectionItem}>
            <TouchableOpacity
              onPress={handleLogout}
              style={[styles.logoutButton, { backgroundColor: theme.colors.error }]}
            >
              <Text style={[styles.logoutText, { color: theme.colors.surface }]}>
                {t('auth.logout')}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...componentStyles.header,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingTop: Platform.OS === 'ios' ? spacing.xxxl + spacing.xs : StatusBar.currentHeight || spacing.xxxl,
  },
  leftSection: {
    flex: 1,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: spacing.md,
  },
  rightSectionItem: {
    marginLeft: spacing.sm,
  },
  greeting: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
  },
  subtitle: {
    fontSize: fontSize.sm,
    marginTop: spacing.sm,
  },
  logoutButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  logoutText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
});

export default AppHeader;