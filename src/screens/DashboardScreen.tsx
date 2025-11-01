import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useData } from '../contexts/DataContext';
import { useTheme } from '../contexts/ThemeContext';
import AppHeader from '../components/AppHeader';
import { spacing, borderRadius, fontSize, fontWeight, layout } from '../themes/designTokens';

const DashboardScreen = () => {
  const { getDashboardStats } = useData();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const stats = getDashboardStats();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <AppHeader showUserInfo={true} />

      <ScrollView style={styles.content}>
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: theme.colors.card, borderLeftColor: theme.colors.success }]}>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>{t('dashboard.todaySales')}</Text>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>${stats.todaySales.toFixed(2)}</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: theme.colors.card, borderLeftColor: theme.colors.error }]}>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>{t('dashboard.todayExpenses')}</Text>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>${stats.todayExpenses.toFixed(2)}</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: theme.colors.card, borderLeftColor: theme.colors.primary }]}>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>{t('dashboard.inventoryValue')}</Text>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>${stats.inventoryValue.toFixed(2)}</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: theme.colors.card, borderLeftColor: theme.colors.warning }]}>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>{t('dashboard.todayNet')}</Text>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              ${(stats.todaySales - stats.todayExpenses).toFixed(2)}
            </Text>
          </View>
        </View>

        {stats.lowStockItems.length > 0 && (
          <View style={[styles.alertSection, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.alertTitle, { color: theme.colors.warning }]}>{t('dashboard.lowStockAlerts')}</Text>
            {stats.lowStockItems.map(item => (
              <View key={item.id} style={[styles.alertItem, { borderBottomColor: theme.colors.borderLight }]}>
                <Text style={[styles.alertItemName, { color: theme.colors.text }]}>{item.name}</Text>
                <Text style={[styles.alertItemDetail, { color: theme.colors.textSecondary }]}>
                  {item.quantity} {item.unit} ({t('dashboard.reorderAt')} {item.reorderLevel})
                </Text>
              </View>
            ))}
          </View>
        )}

        {stats.expiringItems.length > 0 && (
          <View style={[styles.alertSection, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.alertTitle, { color: theme.colors.info }]}>{t('dashboard.expiringSoon')}</Text>
            {stats.expiringItems.map(({ item, batch }) => (
              <View key={batch.id} style={[styles.alertItem, { borderBottomColor: theme.colors.borderLight }]}>
                <Text style={[styles.alertItemName, { color: theme.colors.text }]}>{item.name}</Text>
                <Text style={[styles.alertItemDetail, { color: theme.colors.textSecondary }]}>
                  {t('dashboard.batch')} {batch.batchNumber} - {t('dashboard.expires')}: {batch.expiryDate}
                </Text>
              </View>
            ))}
          </View>
        )}
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
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: layout.screenPadding,
  },
  statCard: {
    width: '48%',
    margin: '1%',
    padding: spacing.xl,
    borderRadius: borderRadius.lg,
    borderLeftWidth: 4,
  },
  statLabel: {
    fontSize: fontSize.xs,
    marginBottom: spacing.sm,
  },
  statValue: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
  },
  alertSection: {
    margin: layout.screenPadding,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  alertTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.md,
  },
  alertItem: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  alertItemName: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.xs,
  },
  alertItemDetail: {
    fontSize: fontSize.xs,
  },
});

export default DashboardScreen;
