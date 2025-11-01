import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import AppHeader from '../components/AppHeader';

const MoreScreen = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const navigation = useNavigation();

  const menuItems = [
    {
      title: t('navigation.production'),
      icon: '🏭',
      screen: 'Production',
      description: t('more.productionDesc', { defaultValue: 'Manage production batches and recipes' })
    },
    {
      title: t('navigation.sales'),
      icon: '💰',
      screen: 'Sales',
      description: t('more.salesDesc', { defaultValue: 'Record sales and transactions' })
    },
    {
      title: t('navigation.expenses'),
      icon: '💳',
      screen: 'Expenses',
      description: t('more.expensesDesc', { defaultValue: 'Track business expenses' })
    },
    {
      title: t('navigation.reports'),
      icon: '📊',
      screen: 'Reports',
      description: t('more.reportsDesc', { defaultValue: 'View financial reports and analytics' })
    },
    {
      title: t('navigation.settings', { defaultValue: 'Settings' }),
      icon: '⚙️',
      screen: 'Settings',
      description: t('more.settingsDesc', { defaultValue: 'Account settings and preferences' })
    }
  ];

  const handleMenuPress = (screen: string) => {
    navigation.navigate(screen as never);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <AppHeader title={t('navigation.more')} />

      <ScrollView style={styles.content}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.menuItem, { backgroundColor: theme.colors.card }]}
            onPress={() => handleMenuPress(item.screen)}
          >
            <View style={styles.menuItemLeft}>
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <View style={styles.menuText}>
                <Text style={[styles.menuTitle, { color: theme.colors.text }]}>
                  {item.title}
                </Text>
                <Text style={[styles.menuDescription, { color: theme.colors.textSecondary }]}>
                  {item.description}
                </Text>
              </View>
            </View>
            <Text style={[styles.menuArrow, { color: theme.colors.textSecondary }]}>›</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  menuItem: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    fontSize: 24,
    marginRight: 16,
    width: 30,
    textAlign: 'center',
  },
  menuText: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  menuDescription: {
    fontSize: 12,
  },
  menuArrow: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default MoreScreen;